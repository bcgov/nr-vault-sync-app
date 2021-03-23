export interface AppConfig {
  enabled: boolean;
  kvApps: {
    readProject: boolean;
  };
  name: string;
};

export interface TeamConfig {
  kv?: string;
  name: string;
  policies?: string[];
}

export interface VaultConfig {
  kv: string[];
  apps: AppConfig[];
  teams: TeamConfig[];
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
   * Return all teams in the configuration
   */
  getTeams(): Promise<TeamConfig[]>;
}


