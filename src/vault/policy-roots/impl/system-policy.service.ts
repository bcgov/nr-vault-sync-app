import { HlcRenderSpec } from '../../../util/hcl.util';
import { PolicyRootService, VAULT_ROOT_SYSTEM } from '../policy-root.service';
import winston from 'winston';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../inversify.types';
import { ConfigService } from '../../../services/config.service';
import oidcData from '../oidc-data.deco';
import { VAULT_APPROLE_MOUNT_POINT } from '../../vault-approle.controller';
import { AppService } from '../../../services/app.service';

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
    return [
      { group: VAULT_ROOT_SYSTEM, templateName: 'admin-super' },
      { group: VAULT_ROOT_SYSTEM, templateName: 'admin-general' },
      { group: VAULT_ROOT_SYSTEM, templateName: 'admin-token' },
      { group: VAULT_ROOT_SYSTEM, templateName: 'admin-audit-hash' },
      {
        group: VAULT_ROOT_SYSTEM,
        templateName: 'broker-auth',
        data: {
          authMount: VAULT_APPROLE_MOUNT_POINT,
          restrictedPaths: await this.restrictedBrokerAppPaths(),
        },
      },
      {
        group: VAULT_ROOT_SYSTEM,
        templateName: 'db-admin-super',
        data: { secertDbPath: 'db' },
      },
      { group: VAULT_ROOT_SYSTEM, templateName: 'isss-cdua-read' },
      { group: VAULT_ROOT_SYSTEM, templateName: 'isss-ci-read' },
      { group: VAULT_ROOT_SYSTEM, templateName: 'oraapp-imborapp-read' },
      { group: VAULT_ROOT_SYSTEM, templateName: 'user-generic' },
      { group: VAULT_ROOT_SYSTEM, templateName: 'vault-sync' },
    ];
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
    const brokerApps = (await this.config.getApps())
      .filter((app) => app.approle)
      .filter((app) => app.brokerGlobal);
    const paths: string[] = [];
    for (const app of brokerApps) {
      paths.push(
        `${(await this.appService.getApp(app.name)).project.toLowerCase()}_${
          app.name
        }_*`,
      );
    }
    return paths;
  }
}
