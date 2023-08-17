import { injectable } from 'inversify';
import {
  AppActorPolicies,
  AppConfig,
  ConfigService,
  DbConfig,
  GroupConfig,
} from '../config.service';
import { ConfigFileService } from './config-file.service';
import { BrokerApi } from '../../broker/broker.api';

@injectable()
/**
 * Service for configuration details
 */
export class ConfigBrokerService implements ConfigService {
  /**
   * Construct the app service
   * @param config The application config service
   */
  constructor(
    private brokerApi: BrokerApi,
    private config: ConfigFileService,
  ) {}

  async getApps(): Promise<AppConfig[]> {
    return this.config.getApps();
  }
  async getApp(appName: string): Promise<AppConfig | undefined> {
    return this.config.getApp(appName);
  }
  getAppActorDefaults(): Promise<AppActorPolicies> {
    return this.config.getAppActorDefaults();
  }
  getDbStores(): Promise<DbConfig[]> {
    return this.config.getDbStores();
  }
  getDbType(name: string): Promise<string> {
    return this.config.getDbType(name);
  }
  getKvStores(): Promise<string[]> {
    return this.config.getKvStores();
  }
  async getGroups(): Promise<GroupConfig[]> {
    return [
      ...(await this.config.getGroups()),
      ...(await this.brokerApi
        .searchVertices('team', 'uses', '644c4d302e2f63acef6bb72c')
        .then((configs) => {
          return configs
            .map((config) => {
              return config.edge;
            })
            .map((config) => {
              if (!config.prop?.group) {
                return null;
              }
              const groupConfig: GroupConfig = {
                name: config.prop?.group,
              };
              if (config.prop?.kv) {
                groupConfig.kv = config.prop?.kv;
              }
              if (config.prop?.policies) {
                groupConfig.policies = config.prop?.policies.split(',');
              }
              return groupConfig;
            })
            .filter((config) => !!config) as GroupConfig[];
        })),
    ];
  }
}
