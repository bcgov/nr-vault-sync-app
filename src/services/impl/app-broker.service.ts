import { inject, injectable } from 'inversify';
import { Application, AppService } from '../app.service';
import { AppConfig, ConfigService } from '../config.service';
import { BrokerApi } from '../../broker/broker.api';
import { TYPES } from '../../inversify.types';
import merge from 'merge-deep';

const periodLookup = {
  hourly: 3600,
  bidaily: 43200,
  daily: 86400,
  weekly: 604800,
};

@injectable()
/**
 * A file based app service implementation
 */
export class AppBrokerService implements AppService {
  /**
   * Construct the app service
   * @param config The application config service
   */
  constructor(
    private brokerApi: BrokerApi,
    @inject(TYPES.ConfigService) private config: ConfigService,
  ) {}

  /**
   * Gets all apps
   */
  public async getAllApps(): Promise<Application[]> {
    const applications = await this.brokerApi.getProjectServicesAsApps();
    const decoratedApps = applications
      .filter((app: Application) => app.config?.enabled)
      .map((app: Application) => {
        if (app.config) {
          app.config = AppBrokerService.applyAppConfigDefaults(app.config);
        }
        return app;
      });
    return decoratedApps;
  }

  /**
   * Gets a specific app
   */
  public async getApp(appName: string): Promise<Application> {
    const applications = await this.brokerApi.getProjectServicesAsApps();
    const app = applications.find((app: Application) => app.app === appName);
    if (app?.config?.enabled) {
      app.config = AppBrokerService.applyAppConfigDefaults(app.config);
      return app;
    }
    throw new Error(`App '${appName}' does not exist or is not enabled`);
  }

  /**
   * Apply configuration defaults to the app
   * @param app The application config to apply defaults to
   */
  private static applyAppConfigDefaults(app: AppConfig): AppConfig {
    const tokenPeriodDefault =
      app.policyOptions?.tokenPeriod &&
      periodLookup[app.policyOptions?.tokenPeriod]
        ? periodLookup[app.policyOptions?.tokenPeriod]
        : periodLookup['daily'];
    /* eslint-disable camelcase -- Library code style issue */
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
    /* eslint-enable camelcase */
  }
}
