import { inject, injectable } from 'inversify';
import { Application, AppService } from '../app.service';
import { AppConfig, ConfigService } from '../config.service';
import { BrokerApi } from '../../broker/broker.api';
import { TYPES } from '../../inversify.types';

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
    const appConfigArr = await this.config.getApps();
    const appConfigObj = appConfigArr.reduce<{ [key: string]: AppConfig }>(
      (o, config) => ({ ...o, [config.name]: config }),
      {},
    );

    const applications = await this.brokerApi.getProjectServicesAsApps();
    const decoratedApps = applications
      .filter(
        (app: Application) =>
          app.app in appConfigObj && appConfigObj[app.app].enabled,
      )
      .map((app: Application) => this.decorateApp(app, appConfigObj[app.app]));

    if (decoratedApps.length !== appConfigArr.length) {
      throw new Error(
        `Configured app(s) could not be found. Check config. App names should be lowercase.`,
      );
    }
    return decoratedApps;
  }

  /**
   * Gets a specific app
   */
  public async getApp(appName: string): Promise<Application> {
    const appConfig = await this.config.getApp(appName);
    const applications = await this.brokerApi.getProjectServicesAsApps();
    const app = applications.find((app: Application) => app.app === appName);
    if (app && appConfig && appConfig.enabled) {
      return this.decorateApp(app, appConfig);
    }
    throw new Error(`App '${appName}' does not exist or is not enabled`);
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
