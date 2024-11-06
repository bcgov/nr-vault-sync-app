import { inject, injectable } from 'inversify';
import nv from 'node-vault';
import winston from 'winston';
import { TYPES } from '../inversify.types';
import { AppService } from '../services/app.service';
import { ConfigService } from '../services/config.service';
import VaultApi from './vault.api';
import HclUtil from '../util/hcl.util';
import { GroupPolicyService } from './policy-roots/impl/group-policy.service';
import { AppPolicyService } from './policy-roots/impl/app-policy.service';
import { VAULT_ROOT_SYSTEM } from './policy-roots/policy-root.service';
import { RegistrationService } from '../services/registration.service';

export const VAULT_GROUP_KEYCLOAK_DEVELOPERS = 'oidc-css-developer';
export const VAULT_GROUP_KEYCLOAK_GROUPS = 'oidc-css-group';

@injectable()
/**
 * Vault group controller.
 */
export default class VaultGroupController {
  /**
   * Constructor.
   */
  constructor(
    @inject(TYPES.Vault) private vault: nv.client,
    @inject(TYPES.VaultApi) private vaultApi: VaultApi,
    @inject(TYPES.ConfigService) private config: ConfigService,
    @inject(TYPES.AppService) private appService: AppService,
    @inject(TYPES.HclUtil) private hclUtil: HclUtil,
    @inject(TYPES.RegistrationService)
    private registrationService: RegistrationService,
    @inject(TYPES.GroupPolicyService)
    private groupRootService: GroupPolicyService,
    @inject(TYPES.AppPolicyService) private appRootService: AppPolicyService,
    @inject(TYPES.Logger) private logger: winston.Logger,
  ) {}

  /**
   * Sync external groups to Vault
   */
  public async sync(): Promise<void> {
    await this.syncAppGroups();
    await this.syncUserGroups();
    // TODO: Remove no longer used groups
    await this.registrationService.clear();
  }

  /**
   * Sync app groups. This is specifically for developers.
   */
  public async syncAppGroups(): Promise<void> {
    const apps = await this.appService.getAllApps();
    const defaultDevAppGroup = (await this.config.getAppActorDefaults())
      .developer;

    const projectSet = new Set();
    for (const app of apps) {
      try {
        const specs = await this.appRootService.build(app);

        if (projectSet.has(app.project)) {
          continue;
        }
        projectSet.add(app.project);
        const policyNames = specs
          .filter((spec) => {
            if (!spec.data) {
              return false;
            }
            const env = spec.data.environment as string;
            const templateNames =
              app.config?.actor?.developer && app.config?.actor?.developer[env]
                ? app.config?.actor?.developer[env]
                : defaultDevAppGroup[env];
            return (
              spec.data &&
              templateNames &&
              templateNames.indexOf(spec.templateName) != -1
            );
          })
          .map((spec) => this.hclUtil.renderName(spec));
        policyNames.push(
          this.hclUtil.renderName({
            group: VAULT_ROOT_SYSTEM,
            templateName: 'kv-developer',
            data: { secretKvPath: 'apps' },
          }),
        );
        await this.syncGroup(
          `${VAULT_GROUP_KEYCLOAK_DEVELOPERS}/${app.project.toLowerCase()}`,
          `developer_${app.project.toLowerCase()}`,
          policyNames,
        );
      } catch (error) {
        this.logger.error(`Error syncing dev app group: ${app.app}`);
      }
    }
  }

  /**
   * Sync user groups
   */
  public async syncUserGroups(): Promise<void> {
    const groups = await this.config.getGroups();
    for (const group of groups) {
      await this.syncGroup(
        `${VAULT_GROUP_KEYCLOAK_GROUPS}/${group.name.toLowerCase()}`,
        `group_${group.name.toLowerCase()}`,
        [
          ...(group.policies ? group.policies : []),
          ...(await this.groupRootService.build(group))
            .filter((spec) => spec.templateName === 'user')
            .map((spec) => this.hclUtil.renderName(spec)),
        ],
        { root: 'user' },
      );
    }
  }

  /**
   * Sync a user group and its external alias in Vault
   * @param name The name of the group in Vault
   * @param role The external role to map to the group
   * @param policies The policies to attach to the group
   * @param metadata The group metadata
   * @returns
   */
  public async syncGroup(
    name: string,
    role: string,
    policies: string[],
    metadata: { [key: string]: string } = {},
  ): Promise<void> {
    const accessors: string[] = await this.vaultApi.getOidcAccessors();
    const groupName = `identity/group/name/${encodeURIComponent(name)}`;
    const groupProperties = {
      policies,
      type: 'external',
      metadata,
    };
    const groupPropertiesString = JSON.stringify(groupProperties);

    if (
      await this.registrationService.isSameValue(name, groupPropertiesString)
    ) {
      await this.registrationService.setUsed(name);
      // this.logger.info(`Skip: ${name}`);
      return;
    }

    let group = await this.vault
      .write(groupName, groupProperties)
      .catch((error) => {
        const code = error.response.statusCode as number;
        this.logger.error(
          `Error creating group '${name}' in Vault: Error ${code}`,
        );
        throw new Error('Could not create group');
      });
    await this.registrationService.register(name, groupPropertiesString);

    if (!group) {
      // API does not return data if write was an update

      group = await this.vault.read(
        `identity/group/name/${encodeURIComponent(name)}`,
      );
    }

    if (
      !group.data.alias ||
      (group.data.alias && Object.keys(group.data.alias).length === 0)
    ) {
      const promises = accessors.map((accessor) => {
        return this.createGroupAlias(group.data.id, accessor, role);
      });
      await Promise.all(promises);
    } else {
      this.logger.debug('Skip adding alias');
    }

    this.logger.info(`Role: ${role} -> Group: ${name} [${policies.join(',')}]`);
  }

  /**
   * Create a group alias
   * @param canonicalId The group canonical id
   * @param accessor The accessor id
   * @param name The name provided by the accessor for the group
   */
  public async createGroupAlias(
    canonicalId: string,
    mountAccessor: string,
    name: string,
  ): Promise<void> {
    const alias = await this.vault.write(`identity/lookup/group`, {
      alias_name: name,
      alias_mount_accessor: mountAccessor,
    });

    if (!alias) {
      await this.vault
        .write(`identity/group-alias`, {
          name,
          mount_accessor: mountAccessor,
          canonical_id: canonicalId,
        })
        .catch((error) => {
          const code = error.response.statusCode as number;
          this.logger.error(
            `Failed to create alias '${name}' for '${canonicalId}' on '${mountAccessor}' in Vault. Error ${code}`,
          );
          throw new Error('Could not create alias');
        });
    }
  }
}
