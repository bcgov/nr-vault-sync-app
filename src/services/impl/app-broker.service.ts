import { inject, injectable } from 'inversify';
import { Application, AppService } from '../app.service';
import { ConfigService } from '../config.service';
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
    const applications = await this.brokerApi.getProjectServicesAsApps();
    const decoratedApps = applications.filter(
      (app: Application) => app.config?.enabled,
    );
    return decoratedApps;
  }

  /**
   * Gets a specific app
   */
  public async getApp(appName: string): Promise<Application> {
    const applications = await this.brokerApi.getProjectServicesAsApps();
    const app = applications.find((app: Application) => app.app === appName);
    if (app?.config?.enabled) {
      return app;
    }
    throw new Error(`App '${appName}' does not exist or is not enabled`);
  }
}
