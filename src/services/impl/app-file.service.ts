import {inject, injectable} from 'inversify';
import {Application, AppService} from '../app.service';
import * as fs from 'fs';
import * as path from 'path';
import {TYPES} from '../../inversify.types';
import {AppConfig, ConfigService} from '../config.service';

@injectable()
/**
 * A file based app service implementation
 */
export class AppFileService implements AppService {
  private static readonly applicationPath
    = path.join(__dirname, '../../../config', 'applications.json');
  private static readonly applications
    = JSON.parse(fs.readFileSync(AppFileService.applicationPath, 'UTF8'));

  /**
   * Construct the app service
   * @param config The application config service
   */
  constructor(
    @inject(TYPES.ConfigService) private config: ConfigService) { }

  /**
   * Gets all apps
   */
  public async getAllApps(): Promise<Application[]> {
    const appConfigArr = await this.config.getApps();
    const appConfigObj =
    appConfigArr.reduce<{[key: string]: AppConfig}>((o, config) => ({...o, [config.name]: config}), {});

    return AppFileService.applications
      .filter((app: Application) => app.app in appConfigObj)
      .map((app: Application) => this.decorateApp(app, appConfigObj[app.app]));
  }

  /**
   * Gets a specific app
   */
  public async getApp(appName: string): Promise<Application> {
    const appConfig = await this.config.getApp(appName);
    if (appConfig) {
      return this.decorateApp(
        AppFileService.applications.find((app: Application) => app.app === appName),
        appConfig,
      );
    }
    throw new Error('App does not exist or is not enabled');
  }

  /**
   * Decorates the application info with config information.
   * @param app The application info
   * @param appConfig The application config
   * @returns The decorated application info
   */
  private decorateApp(app: Application, appConfig: AppConfig): Application {
    return {
      ...app,
      config: appConfig,
    };
  }
}
