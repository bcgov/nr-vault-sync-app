import * as fs from 'fs';
import * as path from 'path';
import { injectable } from 'inversify';
import {
  AppActorPolicies,
  ConfigService,
  DbConfig,
  GroupConfig,
  VaultConfig,
} from '../config.service';

@injectable()
/**
 * Service for configuration details
 */
export class ConfigFileService implements ConfigService {
  private static readonly policyFilePath = path.join(
    __dirname,
    '../../../config',
    'config.json',
  );
  private static readonly config = JSON.parse(
    fs.readFileSync(ConfigFileService.policyFilePath, { encoding: 'utf8' }),
  ) as VaultConfig;

  /**
   * Return default policies to grant each type of actor
   */
  getAppActorDefaults(): Promise<AppActorPolicies> {
    return Promise.resolve(ConfigFileService.config.appActorDefaults);
  }

  /**
   * Return the configured DB secret engines
   */
  getDbStores(): Promise<DbConfig[]> {
    return Promise.resolve(ConfigFileService.config.db);
  }

  /**
   * Return a database type from a database name
   */
  getDbType(name: string): Promise<string> {
    const dbConfig = ConfigFileService.config.db.find(
      (dbConfig) => dbConfig.name === name,
    );
    if (dbConfig) {
      return Promise.resolve(dbConfig.type);
    }
    throw new Error(`DB named '${name}' not found`);
  }

  /**
   * Return the paths to the KV secret stores
   */
  getKvStores(): Promise<string[]> {
    return Promise.resolve(ConfigFileService.config.kv);
  }

  /**
   * Return all groups in the configuration
   */
  getGroups(): Promise<GroupConfig[]> {
    return Promise.resolve(ConfigFileService.config.groups);
  }
}
