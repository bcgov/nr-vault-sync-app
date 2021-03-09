import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';
import nv from 'node-vault';
import {inject, injectable} from 'inversify';
import {TYPES} from '../inversify.types';
import {Application, AppService} from '../services/app.service';
import winston from 'winston';
import EnvironmentUtil from '../util/environment.util';
import {ConfigService} from '../services/config.service';
import {PolicyRegistrationService} from '../services/policy-registration.service';

const VAULT_ROOT_SYSTEM = 'system';
const VAULT_ROOT_APPS = 'apps';


@injectable()
/**
 * The policy controller manages the sync of vault policies
 */
export default class VaultPolicyController {
  private static templatesdir = path.join(__dirname, 'templates');

  /**
   * Construct the policy controller
   * @param vault The vault client to use
   */
  constructor(
    @inject(TYPES.Vault) private vault: nv.client,
    @inject(TYPES.AppService) private appService: AppService,
    @inject(TYPES.ConfigService) private config: ConfigService,
    @inject(TYPES.PolicyRegistrationService)
    private policyRegistrationService: PolicyRegistrationService,
    @inject(TYPES.Logger) private logger: winston.Logger) {}

  /**
   * Syncs all policies to vault
   */
  public async syncAll() {
    // VAULT_ROOT_SYSTEM
    await this.syncSystem();
    await this.syncKvSecretEngines();
    await this.removeUnregisteredPolicies(VAULT_ROOT_SYSTEM, false);
    // VAULT_ROOT_APPS
    await this.syncAllApplications();
    await this.removeUnregisteredPolicies(VAULT_ROOT_APPS, false);
  }

  /**
   * Sync system policies to vault
   */
  public async syncSystem() {
    await this.addPolicy(VAULT_ROOT_SYSTEM, 'user-generic');
    await this.addPolicy(VAULT_ROOT_SYSTEM, 'admin');
  }

  /**
   * Sync kv engine policies to vault
   */
  public async syncKvSecretEngines() {
    for (const secertKvPath of this.config.getVaultKvStores()) {
      await this.addPolicy(VAULT_ROOT_SYSTEM, 'kv-admin', {secertKvPath});
    }
  }

  /**
   * Syncs policies with vault
   */
  public async syncAllApplications() {
    for (const application of await this.appService.getAllApps()) {
      this.logger.info(`app: ${application.app}`);
      await this.syncApplication(application);
    }
  }

  /**
   * Syncs policies with vault
   */
  public async syncApplicationByName(appName: string) {
    return this.syncApplication(await this.appService.getApp(appName));
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
        continue;
      }

      const policyData = {
        application: appInfo.app,
        secertKvPath: 'apps',
        project: appInfo.project.toLowerCase(),
        environment: normEvn,
      };

      await this.addPolicy(VAULT_ROOT_APPS, 'project-kv-read', policyData);
      await this.addPolicy(VAULT_ROOT_APPS, 'project-kv-write', policyData);
      await this.addPolicy(VAULT_ROOT_APPS, 'project-kv-admin', policyData);
      await this.addPolicy(VAULT_ROOT_APPS, 'app-kv-read', policyData);
      await this.addPolicy(VAULT_ROOT_APPS, 'app-kv-write', policyData);
      await this.addPolicy(VAULT_ROOT_APPS, 'app-kv-admin', policyData);
    }
  }

  /**
   * Adds a policy to vault
   * @param group The policy group
   * @param templateName The policy template name
   * @param data Additional data to pass to the template
   */
  public async addPolicy(group: string, templateName: string, data?: ejs.Data | undefined) {
    const name = this.renderPolicyName(group, templateName, data);
    this.policyRegistrationService.registerPolicy(name);
    return this.vault.addPolicy({
      name,
      rules: this.renderPolicyBody(group, templateName, data),
    });
  }

  /**
   * Renders a policy body from the template
   * @param group The policy group
   * @param templateName The policy template name
   * @param data Additional data to pass to the template
   */
  private renderPolicyBody(group: string, templateName: string, data: ejs.Data | undefined) {
    return ejs.render(
      fs.readFileSync(path.join(VaultPolicyController.templatesdir, group, `${templateName}.hcl.tpl`), 'UTF8'),
      {
        ...data,
      },
    );
  }

  /**
   * Renders a policy name from the template if it exists or parameters
   * @param group The policy group
   * @param templateName The policy template name
   * @param data Additional data to pass to the template
   */
  private renderPolicyName(group: string, templateName: string, data: ejs.Data | undefined) {
    if (fs.existsSync(path.join(VaultPolicyController.templatesdir, group, `${templateName}.name.tpl`))) {
      return `${group}/${ejs.render(
        fs.readFileSync(path.join(VaultPolicyController.templatesdir, group, `${templateName}.name.tpl`), 'UTF8'),
        {
          ...data,
        },
      )}`;
    } else {
      return `${group}/${templateName}`;
    }
  }

  /**
   * Remove unregistered policies
   * @param group The policy group
   * @param partialRegistration True if not all policies were registered this run and false otherwise
   */
  public async removeUnregisteredPolicies(group: string, partialRegistration: boolean) {
    const policies = (await this.vault.policies()).data.policies;
    const policiesToRemove = await this.policyRegistrationService.filterPoliciesForUnregistered(
      policies.filter((policyName: string) => policyName.startsWith(group)),
      partialRegistration);

    for (const name of policiesToRemove) {
      await this.vault.removePolicy({name});
    }
  }
}
