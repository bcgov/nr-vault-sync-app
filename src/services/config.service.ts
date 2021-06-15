export interface AppConfig {
  enabled: boolean;
  approle?: AppConfigApprole;
  kvApps?: {
    readProject: boolean;
  };
  name: string;
}

/* eslint-disable camelcase */
export interface AppConfigApprole {
  // non-standard
  enabled: boolean;
  options: {
    project: boolean;
    read: boolean;
    write: boolean;
  }
  role_name: string;
  // standard
  bind_secret_id: boolean;
  secret_id_bound_cidrs: string | string[];
  secret_id_num_uses: number;
  secret_id_ttl: number | string;
  enable_local_secret_ids: boolean;
  token_ttl: number | string;
  token_max_ttl: number | string;
  token_policies: string | string[];
  token_bound_cidrs: string | string[];
  token_explicit_max_ttl: number | string;
  token_no_default_policy: boolean;
  token_num_uses: number;
  token_period: number | string;
  token_type: string;
}
/* eslint-enable camelcase */

export interface AppGroups {
  'developer': {
    [key: string]: string[]
  }
}

export interface GroupConfig {
  kv?: string;
  name: string;
  policies?: string[];
}

export interface VaultConfig {
  kv: string[];
  apps: AppConfig[];
  appGroups: AppGroups;
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
   * Return policies to apply to app groups
   */
  getAppGroups(): Promise<AppGroups>;

  /**
   * Return all groups in the configuration
   */
  getGroups(): Promise<GroupConfig[]>;
}


