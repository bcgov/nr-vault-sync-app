import * as fs from 'fs';
import * as path from 'path';
import {injectable} from 'inversify';
import {AppConfig, ConfigService} from '../config.service';

@injectable()
/**
 * Service for configuration details
 */
export class ConfigFileService implements ConfigService {
  private static readonly policyFilePath
    = path.join(__dirname, '../../../config', 'config.json');
  private static readonly config
    = JSON.parse(fs.readFileSync(ConfigFileService.policyFilePath, 'UTF8'));

  /**
   * Return the paths to the KV secret stores
   */
  getVaultKvStores(): string[] {
    return ConfigFileService.config.kv;
  }

  /**
   * Return all applications in the configuration
   */
  getApps(): AppConfig {
    return ConfigFileService.config.apps;
  }
}
