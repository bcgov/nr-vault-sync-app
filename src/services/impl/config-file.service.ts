import * as fs from 'fs';
import * as path from 'path';
import {injectable} from 'inversify';
import {AppConfig, ConfigService, GroupConfig, VaultConfig} from '../config.service';

@injectable()
/**
 * Service for configuration details
 */
export class ConfigFileService implements ConfigService {
  private static readonly policyFilePath
    = path.join(__dirname, '../../../config', 'config.json');
  private static readonly config: VaultConfig
    = JSON.parse(fs.readFileSync(ConfigFileService.policyFilePath, 'UTF8'));

  /**
   * Return the paths to the KV secret stores
   */
  async getVaultKvStores(): Promise<string[]> {
    return ConfigFileService.config.kv;
  }

  /**
   * Return all applications in the configuration
   */
  async getApps(): Promise<AppConfig[]> {
    return ConfigFileService.config.apps;
  }

  /**
   * Return all applications in the configuration
   */
  async getApp(appName: string): Promise<AppConfig | undefined> {
    return ConfigFileService.config.apps.find((app) => app.name === appName);
  }

  /**
   * Return all groups in the configuration
   */
  async getGroups(): Promise<GroupConfig[]> {
    return ConfigFileService.config.groups;
  }
}
