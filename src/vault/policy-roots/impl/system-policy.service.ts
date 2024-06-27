import { HlcRenderSpec } from '../../../util/hcl.util';
import { PolicyRootService, VAULT_ROOT_SYSTEM } from '../policy-root.service';
import winston from 'winston';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../inversify.types';
import { ConfigService } from '../../../services/config.service';
import oidcData from '../oidc-data.deco';
import { VAULT_APPROLE_MOUNT_POINT } from '../../vault-approle.controller';
import { AppService } from '../../../services/app.service';
import path from 'path';
import fs from 'fs';

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
   * @returns An array of HlcRenderSpec
   */
  @oidcData
  async build(): Promise<HlcRenderSpec[]> {
    return [
      ...(await this.buildSystem()),
      ...(await this.buildKvSecretEngines()),
    ];
  }

  /**
   * Sync system policies to vault
   */
  public async buildSystem(): Promise<HlcRenderSpec[]> {
    this.logger.debug(`Build system - global`);
    const sysSpecs: HlcRenderSpec[] = [];
    // Directory containing the template files
    const templatesDir = path.join(__dirname, '../../../../config/system');
    const templateFiles = fs.readdirSync(templatesDir);
    const data = {
      kvPaths: await this.config.getKvStores(),
      authMount: VAULT_APPROLE_MOUNT_POINT,
      restrictedPaths: await this.restrictedBrokerAppPaths(),
      secertDbPath: 'db',
    };
    for (const file of templateFiles) {
      if (file.endsWith('.hcl.tpl') && !file.startsWith('kv-')) {
        const _templateName = path.basename(file, '.hcl.tpl');
        const spec: HlcRenderSpec = {
          group: VAULT_ROOT_SYSTEM,
          templateName: _templateName,
          data: data,
        };
        sysSpecs.push(spec);
      }
    }
    return sysSpecs;
  }

  /**
   * Sync kv engine policies to vault
   */
  public async buildKvSecretEngines(): Promise<HlcRenderSpec[]> {
    this.logger.debug(`Build system - kv`);
    const kvSpecs: HlcRenderSpec[] = [];
    for (const secertKvPath of await this.config.getKvStores()) {
      kvSpecs.push({
        group: VAULT_ROOT_SYSTEM,
        templateName: 'kv-admin',
        data: { secertKvPath },
      });
      kvSpecs.push({
        group: VAULT_ROOT_SYSTEM,
        templateName: 'kv-developer',
        data: { secertKvPath },
      });
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
