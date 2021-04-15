export interface AppConfig {
  enabled: boolean;
  kvApps?: {
    readProject: boolean;
  };
  name: string;
};

export interface GroupConfig {
  kv?: string;
  name: string;
  policies?: string[];
}

export interface VaultConfig {
  kv: string[];
  apps: AppConfig[];
  groups: GroupConfig[];
}

/**
 * Service for configuration details
 */
export interface ConfigService {
  /**
   * Return the paths to the KV secret stores
   */
  getVaultKvStores(): Promise<string[]>;

  /**
   * Return all applications in the configuration
   */
  getApps(): Promise<AppConfig[]>;

  /**
   * Return all applications in the configuration
   */
  getApp(appName: string): Promise<AppConfig | undefined>;

  /**
   * Return all groups in the configuration
   */
  getGroups(): Promise<GroupConfig[]>;
}


