import { inject, injectable } from 'inversify';
import winston from 'winston';
import nv from 'node-vault';
import { TYPES } from '../inversify.types';
import { AppService } from '../services/app.service';
import { AppConfigApprole, ConfigService } from '../services/config.service';
import { AppPolicyService } from './policy-roots/impl/app-policy.service';
import HclUtil from '../util/hcl.util';
import EnvironmentUtil from '../util/environment.util';
import { VAULT_ROOT_SYSTEM } from './policy-roots/policy-root.service';
import { RegistrationService } from '../services/registration.service';

interface ApproleDict {
  [key: string]: AppConfigApprole;
}

export const VAULT_APPROLE_MOUNT_POINT = 'vs_apps_approle';

@injectable()
/**
 * Vault approle controller.
 */
export default class VaultApproleController {
  /**
   * Constructor
   */
  constructor(
    @inject(TYPES.Vault) private vault: nv.client,
    @inject(TYPES.AppService) private appService: AppService,
    @inject(TYPES.AppPolicyService) private appRootService: AppPolicyService,
    @inject(TYPES.ConfigService) private config: ConfigService,
    @inject(TYPES.HclUtil) private hclUtil: HclUtil,
    @inject(TYPES.RegistrationService)
    private registrationService: RegistrationService,
    @inject(TYPES.Logger) private logger: winston.Logger,
  ) {}

  /**
   * Syncs approles
   * To enable: vault auth enable -path=vs_apps_approle approle
   */
  public async sync(): Promise<void> {
    const approleDict = await this.buildApproleDict();

    // create / update roles
    await this.createUpdateRoles(approleDict);
    // Remove roles that no longer exist in configuration
    await this.removeUnusedRoles(new Set(Object.keys(approleDict)));
    await this.registrationService.clear();
  }

  /**
   * Build approle dict from configuration
   */
  public async buildApproleDict(): Promise<ApproleDict> {
    const apps = await this.appService.getAllApps();
    const appActorDefaults = await this.config.getAppActorDefaults();
    const approleDict: ApproleDict = {};
    for (const app of apps) {
      if (app.config && app.config?.enabled && app.config.approle?.enabled) {
        for (const env of app.env) {
          const approleName = this.hclUtil.renderApproleName(app, env);

          const specs = await this.appRootService.buildApplicationForEnv(
            app,
            env,
          );
          const normEnv = EnvironmentUtil.normalize(env);
          const templateNames = [
            ...(app.config?.actor?.approle &&
            app.config?.actor?.approle[normEnv]
              ? app.config?.actor?.approle[normEnv]
              : appActorDefaults.approle[normEnv]),
          ];
          // Add global policies
          if (app.config.policyOptions?.systemPolicies) {
            for (const policy of app.config.policyOptions?.systemPolicies) {
              templateNames.push(policy);
            }
          }
          if (app.config.brokerGlobal) {
            templateNames.push(
              this.hclUtil.renderName({
                group: VAULT_ROOT_SYSTEM,
                templateName: 'broker-auth',
                data: { authMount: VAULT_APPROLE_MOUNT_POINT },
              }),
            );
          }
          // Add broker policies
          if (app.config.brokerFor) {
            for (const brokerApp of app.config.brokerFor) {
              const app = await this.appService.getApp(brokerApp);
              const appEnvironments = app.env;
              for (const appEnvironment of appEnvironments) {
                let normAppEnvironment = '';
                try {
                  normAppEnvironment =
                    EnvironmentUtil.normalize(appEnvironment);
                } catch (err) {
                  this.logger.debug(
                    `Unsupported environment for ${brokerApp}: ${appEnvironment}`,
                  );
                  continue;
                }

                templateNames.push(
                  this.hclUtil.renderName({
                    group: 'apps',
                    templateName: 'app-auth',
                    data: {
                      project: app.project,
                      application: brokerApp,
                      environment: normAppEnvironment,
                    },
                  }),
                );
              }
            }
          }

          const policies = specs
            .filter((spec) => {
              return templateNames
                ? templateNames.indexOf(spec.templateName) != -1
                : false;
            })
            .map((spec) => this.hclUtil.renderName(spec))
            .join(',');
          const prerenderedPolicies = templateNames
            .filter((name) => name === 'default' || name.indexOf('/') != -1)
            .join(',');
          approleDict[approleName] = {
            ...app.config.approle,
            ...{
              role_name: approleName,
              token_policies:
                prerenderedPolicies.length > 0
                  ? [policies, prerenderedPolicies].join(',')
                  : policies,
            },
          };
        }
      }
    }
    return approleDict;
  }

  /**
   * Create / update roles based on configuration
   * @param approleDict The app role dict
   */
  public async createUpdateRoles(approleDict: ApproleDict): Promise<void> {
    for (const role of Object.keys(approleDict)) {
      const ar = approleDict[role];
      const roleProperties = {
        role_name: ar.role_name,
        mount_point: VAULT_APPROLE_MOUNT_POINT,
        bind_secret_id: ar.bind_secret_id,
        bound_cidr_list: ar.token_bound_cidrs,
        policies: ar.token_policies,
        secret_id_num_uses: ar.secret_id_num_uses,
        secret_id_ttl: ar.secret_id_ttl,
        token_num_uses: ar.token_num_uses,
        token_ttl: ar.token_ttl,
        token_max_ttl: ar.token_max_ttl,
        period: ar.token_period,
      };
      const rolePropertiesString = JSON.stringify(roleProperties);
      if (
        await this.registrationService.isSameValue(role, rolePropertiesString)
      ) {
        await this.registrationService.setUsed(role);
        // this.logger.info(`Skip: ${role}`);
      } else {
        // TODO: Use API directly to send all parameters
        this.logger.info(`Add approle: ${role}`);
        await this.vault.addApproleRole(roleProperties);
        await this.registrationService.register(role, rolePropertiesString);
      }
    }
  }

  /**
   * Remove roles that no longer exist in configuration
   * @param registeredRoles The approles that have been registered to create/update
   */
  public async removeUnusedRoles(registeredRoles: Set<string>): Promise<void> {
    const vaultAppRoles = await this.getRoles();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- No typing available
    const existingRoles = vaultAppRoles.data.keys as string[];
    for (const eRole of existingRoles) {
      if (registeredRoles.has(eRole)) {
        continue;
      }
      this.logger.info(`Remove approle: ${eRole}`);
      await this.vault.deleteApproleRole({
        mount_point: VAULT_APPROLE_MOUNT_POINT,
        role_name: eRole,
      });
    }
  }

  private async getRoles() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- No typing available
      return await this.vault.approleRoles({
        mount_point: VAULT_APPROLE_MOUNT_POINT,
      });
    } catch (err: unknown) {
      // Assume this to be an approle with no roles
      return {
        data: {
          keys: [],
        },
      };
    }
  }
}
