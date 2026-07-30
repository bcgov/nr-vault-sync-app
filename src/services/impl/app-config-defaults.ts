import { AppConfig } from '../config.service';
import merge from 'merge-deep';

/**
 * Lookup table for token period presets to seconds.
 */
const periodLookup: Record<string, number> = {
  hourly: 3600,
  bidaily: 43200,
  daily: 86400,
  weekly: 604800,
};

/**
 * Apply configuration defaults to an application's AppConfig.
 *
 * Merges Vault API defaults and VS-tool defaults into the provided
 * configuration so that callers never have to repeat this logic.
 *
 * @param app The application config to apply defaults to.
 * @returns A new AppConfig with all defaults applied.
 */
export function applyAppConfigDefaults(app: AppConfig): AppConfig {
  const tokenPeriodDefault =
    app.policyOptions?.tokenPeriod &&
    periodLookup[app.policyOptions?.tokenPeriod]
      ? periodLookup[app.policyOptions?.tokenPeriod]
      : periodLookup['daily'];

  return merge(
    {
      approle: {
        // Vault defaults -- https://www.vaultproject.io/api/auth/approle
        ...{
          enabled: false,
          bind_secret_id: true,
          secret_id_bound_cidrs: '',
          secret_id_num_uses: 0,
          secret_id_ttl: 0,
          enable_local_secret_ids: false,
          token_ttl: 0,
          token_max_ttl: 0,
          token_policies: '',
          token_bound_cidrs: '',
          token_explicit_max_ttl: 0,
          token_no_default_policy: false,
          token_num_uses: 0,
          token_period: 0,
          token_type: '',
        },
        // VS defaults
        ...{
          secret_id_ttl: periodLookup['hourly'],
          token_period: tokenPeriodDefault,
          secret_id_num_uses: 1,
          options: {
            project: false,
            read: true,
            write: false,
          },
          role_name: '',
        },
      },
    },
    app,
  );
}
