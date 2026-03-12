import * as fs from 'fs';
import * as path from 'path';
import { inject, injectable } from 'inversify';
import { Application, AppService } from '../app.service';
import { AppConfig, ConfigService } from '../config.service';
import { TYPES } from '../../inversify.types';
import merge from 'merge-deep';

interface AppFileConfig {
  apps: AppFileEntry[];
}

interface AppFileEntry {
  app: string;
  project: string;
  env: string[];
  config: AppConfig;
}

const periodLookup: Record<string, number> = {
  hourly: 3600,
  bidaily: 43200,
  daily: 86400,
  weekly: 604800,
};

@injectable()
/**
 * A file based app service for local development without NR Broker
 */
export class AppFileService implements AppService {
  private static readonly appFilePath = path.join(
    __dirname,
    '../../../config',
    'apps.json',
  );

  private applications: Application[];

  /**
   * Construct the file-based app service
   * @param config The application config service
   */
  constructor(@inject(TYPES.ConfigService) private config: ConfigService) {
    const fileContents = fs.readFileSync(AppFileService.appFilePath, {
      encoding: 'utf8',
    });
    const appFileConfig = JSON.parse(fileContents) as AppFileConfig;
    this.applications = appFileConfig.apps.map((entry) => ({
      app: entry.app,
      project: entry.project,
      env: entry.env,
      config: entry.config,
    }));
  }

  /**
   * Gets all apps
   */
  public async getAllApps(): Promise<Application[]> {
    return this.applications
      .filter((app: Application) => app.config?.enabled)
      .map((app: Application) => {
        if (app.config) {
          app.config = AppFileService.applyAppConfigDefaults(app.config);
        }
        return app;
      });
  }

  /**
   * Gets a specific app
   */
  public async getApp(appName: string): Promise<Application> {
    const app = this.applications.find(
      (app: Application) => app.app === appName,
    );
    if (app?.config?.enabled) {
      app.config = AppFileService.applyAppConfigDefaults(app.config);
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
}
