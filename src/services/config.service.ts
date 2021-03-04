
export interface AppConfig {
  [key: string]: {
    enabled: boolean;
  };
}

/**
 * Service for configuration details
 */
export interface ConfigService {
  /**
   * Return the paths to the KV secret stores
   */
  getVaultKvStores(): string[];
  /**
   * Return all applications in the configuration
   */
  getApps(): AppConfig;
}


