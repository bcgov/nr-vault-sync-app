import fs from 'fs';
import path from 'path';
import winston from 'winston';
import { inject, injectable } from 'inversify';
import {
  PolicyRootService,
  VAULT_ROOT_APPS,
  VAULT_ROOT_CLOUDS,
  VAULT_ROOT_DB,
  VAULT_ROOT_SYSTEM,
} from '../policy-root.service';
import { TYPES } from '../../../inversify.types';
import { ConfigService } from '../../../services/config.service';
import oidcData from '../oidc-data.deco';
import { VAULT_APPROLE_MOUNT_POINT } from '../../vault-approle.controller';
import { AppService } from '../../../services/app.service';
import { HclRenderSpec } from '../../../util/hcl.util';
import EnvironmentUtil from '../../../util/environment.util';

@injectable()
/**
 * System policy service root
 */
export class SystemPolicyService implements PolicyRootService<undefined> {
  /**
   * Constructor.
   */
  constructor(
    @inject(TYPES.AppService) private appService: AppService,
    @inject(TYPES.ConfigService) private config: ConfigService,
    @inject(TYPES.Logger) private logger: winston.Logger,
  ) {}

  /**
   * The name of this policy root
   * @returns The name of this policy root
   */
  getName(): string {
    return VAULT_ROOT_SYSTEM;
  }

  /**
   * Builds the hlc render spec for this policy root
   * @returns An array of HclRenderSpec
   */
  @oidcData
  async build(): Promise<HclRenderSpec[]> {
    return [
      ...(await this.buildSystem()),
      ...(await this.buildKvSecretEngines()),
    ];
  }

  /**
   * Set the path to the system policy config
   */
  private static readonly sysPolicyConfigPath = path.join(
    __dirname,
    '../../../../config/templates/system',
  );

  /**
   * Sync system policies to vault
   */
  public async buildSystem(): Promise<HclRenderSpec[]> {
    this.logger.debug(`Build system - global`);
    const sysSpecs: HclRenderSpec[] = [];
    const templateFiles = fs.readdirSync(
      SystemPolicyService.sysPolicyConfigPath,
    );
    const data = {
      kvPaths: await this.config.getKvStores(),
      authMount: VAULT_APPROLE_MOUNT_POINT,
      restrictedPaths: await this.restrictedBrokerAppPaths(),
      secretDbPath: VAULT_ROOT_DB,
      secretKvAppsPath: VAULT_ROOT_APPS,
      secretKvCloudsPath: VAULT_ROOT_CLOUDS,
      envs: EnvironmentUtil.getShortNames(),
    };
    for (const file of templateFiles) {
      if (file.endsWith('.hcl.tpl') && !file.startsWith('kv-')) {
        const templateName = path.basename(file, '.hcl.tpl');
        const spec: HclRenderSpec = {
          group: VAULT_ROOT_SYSTEM,
          templateName,
          data,
        };
        sysSpecs.push(spec);
      }
    }
    return sysSpecs;
  }

  /**
   * Sync kv engine policies to vault
   */
  public async buildKvSecretEngines(): Promise<HclRenderSpec[]> {
    this.logger.debug(`Build system - kv`);
    const kvSpecs: HclRenderSpec[] = [];
    for (const secretKvPath of await this.config.getKvStores()) {
      kvSpecs.push({
        group: VAULT_ROOT_SYSTEM,
        templateName: 'kv-admin',
        data: { secretKvPath },
      });
      kvSpecs.push({
        group: VAULT_ROOT_SYSTEM,
        templateName: 'kv-developer',
        data: { secretKvPath },
      });
      if (secretKvPath === VAULT_ROOT_APPS) {
        kvSpecs.push({
          group: VAULT_ROOT_SYSTEM,
          templateName: 'kv-tools-read',
          data: { secretKvPath },
        });
        kvSpecs.push({
          group: VAULT_ROOT_SYSTEM,
          templateName: 'kv-sync',
          data: { secretKvPath, syncName: 'aws-ssm-sync' },
        });
      }
    }
    return kvSpecs;
  }

  private async restrictedBrokerAppPaths(): Promise<string[]> {
    const brokerApps = (await this.appService.getAllApps())
      .filter((app) => app.config?.approle)
      .filter((app) => app.config?.brokerGlobal);
    const paths: string[] = [];
    for (const app of brokerApps) {
      paths.push(`${app.project.toLowerCase()}_${app.app}_*`);
    }
    return paths;
  }
}
