import {HlcRenderSpec} from '../../../util/hcl.util';
import {PolicyRootService, VAULT_ROOT_APPS} from '../policy-root.service';
import winston from 'winston';
import {inject, injectable} from 'inversify';
import {TYPES} from '../../../inversify.types';
import {Application, AppService} from '../../../services/app.service';
import EnvironmentUtil from '../../../util/environment.util';
import deduplicate from '../deduplicate.deco';
import {ConfigService} from '../../../services/config.service';
import {VAULT_APPROLE_MOUNT_POINT} from '../../vault-approle.controller';

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
    @inject(TYPES.ConfigService) private config: ConfigService,
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
   * Builds the hlc render spec for all applications. Duplicates are removed by decorator.
   */
  @deduplicate
  public async buildApplications(): Promise<HlcRenderSpec[]> {
    const appSpecs: HlcRenderSpec[] = [];
    for (const application of await this.appService.getAllApps()) {
      appSpecs.push(...(await this.buildApplication(application)));
    }
    return appSpecs;
  }

  /**
   * Builds the hlc render spec for an application
   * @param appInfo The application to create the policies for
   */
  public async buildApplication(appInfo: Application): Promise<HlcRenderSpec[]> {
    this.logger.debug(`Build app policy: ${appInfo.app}`);
    const appSpecs: HlcRenderSpec[] = [];
    for (const environment of appInfo.env) {
      appSpecs.push(...(
        await this.buildApplicationForEnv(appInfo, environment)
      ));
    }
    return appSpecs;
  }

  /**
   * Builds the hlc render spec for an application for a specific environment
   * @param appInfo The application to create the policies for
   * @param environment The environment to create for
   * @param options Additional build options
   */
  public async buildApplicationForEnv(
    appInfo: Application,
    environment: string,
  ): Promise<HlcRenderSpec[]> {
    let normEvn;
    try {
      normEvn = EnvironmentUtil.normalize(environment);
    } catch (err) {
      this.logger.debug(`Unsupported environment: ${environment}`);
      return [];
    }

    const policyData = {
      application: appInfo.app.toLowerCase(),
      authMount: VAULT_APPROLE_MOUNT_POINT,
      secertKvPath: 'apps',
      secertDbPath: 'db',
      project: appInfo.project.toLowerCase(),
      environment: normEvn,
      appCanReadProject: appInfo.config?.policyOptions?.kvReadProject,
    };
    const renderSpecs: HlcRenderSpec[] = [];
    renderSpecs.push({group: VAULT_ROOT_APPS, templateName: 'project-kv-read', data: policyData});
    renderSpecs.push({group: VAULT_ROOT_APPS, templateName: 'project-kv-write', data: policyData});
    renderSpecs.push({group: VAULT_ROOT_APPS, templateName: 'app-kv-read', data: policyData});
    renderSpecs.push({group: VAULT_ROOT_APPS, templateName: 'app-kv-write', data: policyData});
    if (appInfo.config?.approle?.enabled) {
      renderSpecs.push({group: VAULT_ROOT_APPS, templateName: 'app-auth', data: policyData});
    }
    renderSpecs.push({group: VAULT_ROOT_APPS, templateName: 'app-kv-write', data: policyData});
    if (appInfo.config?.db) {
      for (const db of appInfo.config?.db) {
        try {
          const dbType = await this.config.getDbType(db);
          const dbPolicyData = {
            dbName: db,
            dbType,
            ...policyData,
          };
          renderSpecs.push({group: VAULT_ROOT_APPS, templateName: 'app-db-read', data: dbPolicyData});
          renderSpecs.push({group: VAULT_ROOT_APPS, templateName: 'app-db-readwrite', data: dbPolicyData});
          renderSpecs.push({group: VAULT_ROOT_APPS, templateName: 'app-db-full', data: dbPolicyData});
        } catch (err) {
          this.logger.debug(`Database type not found for: ${db}`);
          continue;
        }
      }
    }
    return renderSpecs;
  }
}
