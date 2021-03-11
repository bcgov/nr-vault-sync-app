
export interface AppConfig {
  enabled: boolean;
  kvApps: {
    readProject: boolean;
  };
};
export interface AppConfigDict {
  [key: string]: AppConfig;
};

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
  getApps(): Promise<AppConfigDict>;
}


