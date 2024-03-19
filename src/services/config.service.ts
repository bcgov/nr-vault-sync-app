export interface AppActorPolicies {
  approle: {
    [key: string]: ReadonlyArray<string>;
  };
  developer: {
    [key: string]: ReadonlyArray<string>;
  };
}

/* eslint-disable camelcase -- Library code style issue */
export interface AppConfigApprole {
  // non-standard
  enabled: boolean;
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

export interface AppConfig {
  /** Per-environment overrides of policies for each type of actor */
  actor?: AppActorPolicies;
  /** How to configure the approle for this application */
  approle?: AppConfigApprole;
  /** This application may broker logins for all other applications */
  brokerGlobal?: boolean;
  /** Array of applications this application may login for */
  brokerFor?: string[];
  /** Array of databases this application has access to */
  db?: string[];
  /** True if this application, policies, groups will be generated. */
  enabled: boolean;
  /** The name of the application. This must be unique and match an application in application.json */
  name: string;
  /** Options that alter the content of policies. */
  policyOptions?: {
    /** True if an application kv policies should be able to read project kv secrets */
    kvReadProject?: boolean;
    /** Global policies to add to every environment */
    systemPolicies?: string[];
    /** Token expiration policy. The default is daily. */
    tokenPeriod?: 'hourly' | 'bidaily' | 'daily' | 'weekly';
  };
}

export interface DbConfig {
  name: string;
  type: string;
}

export interface GroupConfig {
  kv?: string;
  name: string;
  policies?: string[];
}

export interface VaultConfig {
  /** Per-environment defaults for policies to grant each type of actor */
  appActorDefaults: AppActorPolicies;
  /** Array of database secret engines. */
  db: DbConfig[];
  /** Array of key value secret engines. */
  kv: string[];
  /** Group configuration */
  groups: GroupConfig[];
}

/**
 * Service for configuration details
 */
export interface ConfigService {
  /**
   * Return default policies to grant each type of actor
   */
  getAppActorDefaults(): Promise<AppActorPolicies>;

  /**
   * Return the configured DB secret engines
   */
  getDbStores(): Promise<DbConfig[]>;

  /**
   * Return a database type from a database name
   */
  getDbType(name: string): Promise<string>;

  /**
   * Return the paths to the KV secret stores
   */
  getKvStores(): Promise<string[]>;

  /**
   * Return all groups in the configuration
   */
  getGroups(): Promise<GroupConfig[]>;
}
