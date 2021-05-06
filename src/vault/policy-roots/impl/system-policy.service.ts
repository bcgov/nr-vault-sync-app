import {HlcRenderSpec} from '../../../util/hcl.util';
import {PolicyRootService, VAULT_ROOT_SYSTEM} from '../policy-root.service';
import winston from 'winston';
import {inject, injectable} from 'inversify';
import {TYPES} from '../../../inversify.types';
import {ConfigService} from '../../../services/config.service';
import oidcData from '../oidc-data.deco';

@injectable()
/**
 * System policy service root
 */
export class SystemPolicyService implements PolicyRootService<undefined> {
  /**
   * Constructor.
   */
  constructor(
    @inject(TYPES.ConfigService) private config: ConfigService,
    @inject(TYPES.Logger) private logger: winston.Logger) {}

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
    return [...this.buildSystem(), ...(await this.buildKvSecretEngines())];
  }

  /**
   * Sync system policies to vault
   */
  public buildSystem(): HlcRenderSpec[] {
    return [
      {group: VAULT_ROOT_SYSTEM, templateName: 'admin-super'},
      {group: VAULT_ROOT_SYSTEM, templateName: 'admin-general'},
      {group: VAULT_ROOT_SYSTEM, templateName: 'user-generic'},
    ];
  }
  /**
   * Sync kv engine policies to vault
   */
  public async buildKvSecretEngines(): Promise<HlcRenderSpec[]> {
    const kvSpecs: HlcRenderSpec[] = [];
    for (const secertKvPath of await this.config.getVaultKvStores()) {
      kvSpecs.push({
        group: VAULT_ROOT_SYSTEM,
        templateName: 'kv-admin',
        data: {secertKvPath},
      });
    }
    return kvSpecs;
  }
}
