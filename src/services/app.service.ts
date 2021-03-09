/**
 * Application details
 */
export interface Application {
  env: string[];
  app: string;
  project: string;
}

/**
 * Service for retrieving application details
 */
export interface AppService {
  /**
   * Returns all applications
   */
  getAllApps(): Promise<Application[]>;

  /**
   * Returns a specific app or throws an error if the app does not exist
   * @param appName The application to find
   */
  getApp(appName: string): Promise<Application>;
}

