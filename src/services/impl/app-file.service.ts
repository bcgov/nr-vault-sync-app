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

  private readonly enabledApps: AppConfig;

  /**
   * Construct the app service
   * @param config The application config service
   */
  constructor(
    @inject(TYPES.ConfigService) private config: ConfigService) {
    this.enabledApps = this.config.getApps();
  }


  /**
   * Gets all apps
   */
  async getAllApps(): Promise<Application[]> {
    return AppFileService.applications.filter((app: Application) => app.app in this.enabledApps);
  }

  /**
   * Gets a specific app
   */
  async getApp(appName: string): Promise<Application> {
    if (appName in this.enabledApps) {
      return AppFileService.applications.find((app: Application) => app.app === appName);
    }
    throw new Error('App does not exist or is not enabled');
  }
}
