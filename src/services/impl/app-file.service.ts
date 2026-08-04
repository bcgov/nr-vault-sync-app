import * as fs from 'fs';
import * as path from 'path';
import { inject, injectable } from 'inversify';
import { Application, AppService } from '../app.service';
import { AppConfig, ConfigService } from '../config.service';
import { TYPES } from '../../inversify.types';
import { applyAppConfigDefaults } from './app-config-defaults';

interface AppFileConfig {
  apps: AppFileEntry[];
}

interface AppFileEntry {
  app: string;
  project: string;
  env: string[];
  config: AppConfig;
}

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
          app.config = applyAppConfigDefaults(app.config);
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
      app.config = applyAppConfigDefaults(app.config);
      return app;
    }
    throw new Error(`App '${appName}' does not exist or is not enabled`);
  }
}
