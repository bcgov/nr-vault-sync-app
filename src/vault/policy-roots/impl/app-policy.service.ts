import {HlcRenderSpec} from '../../../util/hcl.util';
import {PolicyRootService, VAULT_ROOT_APPS} from '../policy-root.service';
import winston from 'winston';
import {inject, injectable} from 'inversify';
import {TYPES} from '../../../inversify.types';
import {Application, AppService} from '../../../services/app.service';
import EnvironmentUtil from '../../../util/environment.util';
import deduplicate from '../deduplicate.deco';

export interface AppBuildOptions {
  project: boolean;
  read: boolean;
  write: boolean;
}

@injectable()
/**
 * Application policy service root
 */
export class AppPolicyService implements PolicyRootService<Application> {
  /**
   * Constructor.
   */
  constructor(
    @inject(TYPES.AppService) private appService: AppService,
    @inject(TYPES.Logger) private logger: winston.Logger) { }

  /**
   * The name of this policy root
   * @returns The name of this policy root
   */
  getName(): string {
    return VAULT_ROOT_APPS;
  }

  /**
   * Builds the hlc render spec for this policy root
   * @returns An array of HlcRenderSpec
   */
  async build(limitTo?: Application): Promise<HlcRenderSpec[]> {
    if (limitTo) {
      return this.buildApplication(limitTo);
    }
    return this.buildApplications();
  }

  /**
   * Builds the hlc render spec for all applications
   */
  @deduplicate
  public async buildApplications(): Promise<HlcRenderSpec[]> {
    const appSpecs: HlcRenderSpec[] = [];
    for (const application of await this.appService.getAllApps()) {
      appSpecs.push(...this.buildApplication(application));
    }
    return appSpecs;
  }

  /**
   * Builds the hlc render spec for an application
   * @param appInfo The application to create the policies for
   */
  public buildApplication(appInfo: Application): HlcRenderSpec[] {
    this.logger.debug(`Build app policy: ${appInfo.app}`);
    const appSpecs: HlcRenderSpec[] = [];
    for (const environment of appInfo.env) {
      appSpecs.push(...this.buildApplicationForEnv(appInfo, environment, {project: true, read: true, write: true}));
    }
    return appSpecs;
  }

  /**
   * Builds the hlc render spec for an application for a specific environment
   * @param appInfo The application to create the policies for
   * @param environment The environment to create for
   * @param options Additional build options
   */
  public buildApplicationForEnv(appInfo: Application, environment: string, options: AppBuildOptions): HlcRenderSpec[] {
    let normEvn;
    try {
      normEvn = EnvironmentUtil.normalize(environment);
    } catch (err) {
      this.logger.debug(`Unsupported environment: ${environment}`);
      return [];
    }

    const policyData = {
      application: appInfo.app.toLowerCase(),
      secertKvPath: 'apps',
      project: appInfo.project.toLowerCase(),
      environment: normEvn,
      appCanReadProject: appInfo.config?.kvApps?.readProject,
    };
    const renderSpecs: HlcRenderSpec[] = [];
    if (options.project && options.read) {
      renderSpecs.push({group: VAULT_ROOT_APPS, templateName: 'project-kv-read', data: policyData});
    }
    if (options.project && options.write) {
      renderSpecs.push({group: VAULT_ROOT_APPS, templateName: 'project-kv-write', data: policyData});
    }
    if (options.read) {
      renderSpecs.push({group: VAULT_ROOT_APPS, templateName: 'app-kv-read', data: policyData});
    }
    if (options.write) {
      renderSpecs.push({group: VAULT_ROOT_APPS, templateName: 'app-kv-write', data: policyData});
    }
    return renderSpecs;
  }
}
