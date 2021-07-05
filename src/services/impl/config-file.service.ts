import * as fs from 'fs';
import * as path from 'path';
import {injectable} from 'inversify';
import {AppConfig, AppGroups, ConfigService, GroupConfig, VaultConfig} from '../config.service';
import merge from 'merge-deep';

@injectable()
/**
 * Service for configuration details
 */
export class ConfigFileService implements ConfigService {
  private static readonly policyFilePath
    = path.join(__dirname, '../../../config', 'config.json');
  private static readonly config
    = JSON.parse(fs.readFileSync(ConfigFileService.policyFilePath, 'UTF8')) as VaultConfig;

  /**
   * Apply configuration defaults to the app
   * @param app The application config to apply defaults to
   */
  private static applyAppConfigDefaults(app: AppConfig): AppConfig {
    /* eslint-disable camelcase -- Library code style issue */
    return merge({
      approle: {
        // Vault defaults -- https://www.vaultproject.io/api/auth/approle
        ...{
          enabled: false,
          bind_secret_id: true,
          secret_id_bound_cidrs: '',
          secret_id_num_uses: 0,
          secret_id_ttl: 0,
          enable_local_secret_ids: false,
          token_ttl: 0,
          token_max_ttl: 0,
          token_policies: '',
          token_bound_cidrs: '',
          token_explicit_max_ttl: 0,
          token_no_default_policy: false,
          token_num_uses: 0,
          token_period: 0,
          token_type: '',
        },
        // VS defaults
        ...{
          token_max_ttl: 2764800, // '768h'
          token_period: 172800, // '48h'
          secret_id_num_uses: 1,
          options: {
            project: false,
            read: true,
            write: false,
          },
          role_name: '',
        },
      },
    }, app);
    /* eslint-enable camelcase */
  }

  /**
   * Return the paths to the KV secret stores
   */
  async getVaultKvStores(): Promise<string[]> {
    return Promise.resolve(ConfigFileService.config.kv);
  }

  /**
   * Return all applications in the configuration
   */
  async getApps(): Promise<AppConfig[]> {
    return Promise.resolve(ConfigFileService.config.apps.map((app) => ConfigFileService.applyAppConfigDefaults(app)));
  }

  /**
   * Return single applications in the configuration
   */
  async getApp(appName: string): Promise<AppConfig | undefined> {
    const app = ConfigFileService.config.apps.find((app) => app.name === appName);
    return Promise.resolve(app ? ConfigFileService.applyAppConfigDefaults(app) : app);
  }

  /**
   * Return policies to apply to app groups
   */
  async getAppGroups(): Promise<AppGroups> {
    return Promise.resolve(ConfigFileService.config.appGroups);
  }

  /**
   * Return all groups in the configuration
   */
  async getGroups(): Promise<GroupConfig[]> {
    return Promise.resolve(ConfigFileService.config.groups);
  }
}
