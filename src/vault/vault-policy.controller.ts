import * as ejs from 'ejs';
import nv from 'node-vault';
import {inject, injectable} from 'inversify';
import {TYPES} from '../inversify.types';
import {Application, AppService} from '../services/app.service';
import winston from 'winston';
import EnvironmentUtil from '../util/environment.util';
import {ConfigService, TeamConfig} from '../services/config.service';
import {PolicyRegistrationService} from '../services/policy-registration.service';
import HclUtil from '../util/hcl.util';

const VAULT_ROOT_SYSTEM = 'system';
const VAULT_ROOT_APPS = 'apps';
const VAULT_ROOT_TEAMS = 'teams';


@injectable()
/**
 * The policy controller manages the sync of vault policies
 */
export default class VaultPolicyController {
  /**
   * Construct the policy controller
   * @param vault The vault client to use
   */
  constructor(
    @inject(TYPES.Vault) private vault: nv.client,
    @inject(TYPES.AppService) private appService: AppService,
    @inject(TYPES.ConfigService) private config: ConfigService,
    @inject(TYPES.HclUtil) private hclUtil: HclUtil,
    @inject(TYPES.PolicyRegistrationService)
    private policyRegistrationService: PolicyRegistrationService,
    @inject(TYPES.Logger) private logger: winston.Logger) {}

  /**
   * Syncs policies to vault
   */
  public async sync(root: string[]) {
    // VAULT_ROOT_SYSTEM
    if (root.length === 0 || root[0] === VAULT_ROOT_SYSTEM) {
      this.logger.info(`- Sync system policies`);
      await this.syncSystem();
      await this.syncKvSecretEngines();
      await this.removeUnregisteredPolicies(VAULT_ROOT_SYSTEM, false);
    }
    // VAULT_ROOT_APPS
    if (root.length === 0 || root[0] === VAULT_ROOT_APPS) {
      this.logger.info(`- Sync application policies`);
      await this.syncAllApplications();
      await this.removeUnregisteredPolicies(VAULT_ROOT_APPS, false);
    }
    if (root.length === 2 && root[0] === VAULT_ROOT_APPS) {
      this.logger.info(`- Sync application policies - ${root[1]}`);
      await this.syncApplicationByName(root[1]);
      await this.removeUnregisteredPolicies(VAULT_ROOT_APPS, true);
    }
    // VAULT_ROOT_TEAMS
    if (root.length === 0 || root[0] === VAULT_ROOT_TEAMS) {
      this.logger.info(`- Sync team policies`);
      await this.syncTeams();
      await this.removeUnregisteredPolicies(VAULT_ROOT_TEAMS, false);
    }
  }

  /**
   * Sync system policies to vault
   */
  public async syncSystem() {
    await this.addPolicy(VAULT_ROOT_SYSTEM, 'admin-super');
    await this.addPolicy(VAULT_ROOT_SYSTEM, 'admin-general');
    await this.addPolicy(VAULT_ROOT_SYSTEM, 'user-generic');
  }

  /**
   * Sync kv engine policies to vault
   */
  public async syncKvSecretEngines() {
    for (const secertKvPath of await this.config.getVaultKvStores()) {
      await this.addPolicy(VAULT_ROOT_SYSTEM, 'kv-admin', {secertKvPath});
    }
  }

  /**
   * Syncs policies with vault
   */
  public async syncAllApplications() {
    for (const application of await this.appService.getAllApps()) {
      await this.syncApplication(application);
    }
  }

  /**
   * Syncs application policies with vault
   * @param appName The name of the application to sync
   */
  public async syncApplicationByName(appName: string) {
    const app = await (async () => {
      try {
        return await this.appService.getApp(appName);
      } catch (error) {
        this.logger.error(`App not found: ${appName}`);
      }
    })();
    if (app) {
      return this.syncApplication(app);
    }
  }

  /**
   * Syncs policies with vault for an application
   * @param Application The application to create the policies for
   */
  public async syncApplication(appInfo: Application) {
    this.logger.debug(`Sync app policy: ${appInfo.app}`);
    for (const environment of appInfo.env) {
      let normEvn;
      try {
        normEvn = EnvironmentUtil.normalize(environment);
      } catch (err) {
        this.logger.debug(`Unsupported environment: ${environment}`);
        continue;
      }

      const policyData = {
        application: appInfo.app,
        secertKvPath: 'apps',
        project: appInfo.project.toLowerCase(),
        environment: normEvn,
        appCanReadProject: appInfo.config?.kvApps.readProject,
      };

      await this.addPolicy(VAULT_ROOT_APPS, 'project-kv-read', policyData);
      await this.addPolicy(VAULT_ROOT_APPS, 'project-kv-write', policyData);
      await this.addPolicy(VAULT_ROOT_APPS, 'app-kv-read', policyData);
      await this.addPolicy(VAULT_ROOT_APPS, 'app-kv-write', policyData);
    }
  }

  /**
   * Syncs policies with vault for teams
   */
  public async syncTeams() {
    const teams = await this.config.getTeams();
    for (const team of teams) {
      this.addPolicy(VAULT_ROOT_TEAMS, 'user', {
        ...team,
      });
    }
  }

  /**
   * Decorate an array of team policies with built-in ones.
   * @param team The team config to decorate
   */
  public decorateTeamPolicy(team: TeamConfig): string[] {
    return [
      ...(team.policies ? team.policies : []),
      this.hclUtil.renderName('/', VAULT_ROOT_TEAMS, 'user', {...team}),
    ];
  }

  /**
   * Adds a policy to vault
   * @param group The policy group
   * @param templateName The policy template name
   * @param data Additional data to pass to the template
   */
  public async addPolicy(group: string, templateName: string, data?: ejs.Data | undefined) {
    const name = this.hclUtil.renderName('/', group, templateName, data);
    if (!await this.policyRegistrationService.hasRegisteredPolicy(name)) {
      this.policyRegistrationService.registerPolicy(name);
      return this.vault.addPolicy({
        name,
        rules: this.hclUtil.renderBody('/', group, templateName, data),
      });
    }
  }

  /**
   * Remove unregistered policies
   * @param group The policy group
   * @param partialRegistration True if not all policies were registered this run and false otherwise
   */
  public async removeUnregisteredPolicies(group: string, partialRegistration: boolean) {
    const policies = (await this.vault.policies()).data.policies;
    try {
      const policiesToRemove = await this.policyRegistrationService.filterPoliciesForUnregistered(
        policies.filter((policyName: string) => policyName.startsWith(group)),
        partialRegistration);

      for (const name of policiesToRemove) {
        await this.vault.removePolicy({name});
      }
    } catch (error) {
      this.logger.error(`Could not remove unused policies: ${group}`);
      this.logger.error(`If this is a partial sync this could be expected.`);
    }
  }
}
