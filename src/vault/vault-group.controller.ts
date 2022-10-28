import {inject, injectable} from 'inversify';
import nv from 'node-vault';
import winston from 'winston';
import {TYPES} from '../inversify.types';
import {AppService} from '../services/app.service';
import {ConfigService} from '../services/config.service';
import VaultApi from './vault.api';
import HclUtil from '../util/hcl.util';
import {GroupPolicyService} from './policy-roots/impl/group-policy.service';
import {AppPolicyService} from './policy-roots/impl/app-policy.service';

export const VAULT_GROUP_KEYCLOAK_DEVELOPERS = 'kc-developer';
export const VAULT_GROUP_KEYCLOAK_GROUPS = 'kc-group';

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
    @inject(TYPES.GroupPolicyService) private groupRootService: GroupPolicyService,
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
  }

  /**
   * Sync app groups. This is specifically for developers.
   */
  public async syncAppGroups(): Promise<void> {
    const apps = await this.config.getApps();
    const defaultDevAppGroup = (await this.config.getAppActorDefaults()).developer;

    const projectSet = new Set();
    for (const app of apps) {
      try {
        const appInfo = await this.appService.getApp(app.name);
        const specs = await this.appRootService.build(appInfo);

        if (projectSet.has(appInfo.project)) {
          continue;
        }
        projectSet.add(appInfo.project);
        const policyNames = specs.filter((spec) => {
          if (!spec.data) {
            return false;
          }
          const env = spec.data.environment as string;
          const templateNames = app.actor?.developer && app.actor?.developer[env] ?
            app.actor?.developer[env]: defaultDevAppGroup[env];
          return spec.data && templateNames &&
            templateNames.indexOf(spec.templateName) != -1;
        })
          .map((spec) => this.hclUtil.renderName(spec));
        await this.syncGroup(`${VAULT_GROUP_KEYCLOAK_DEVELOPERS}/${appInfo.project.toLowerCase()}`,
          `${appInfo.project.toLowerCase()}-developer`, policyNames);
      } catch (error) {
        this.logger.error(`Error syncing dev app group: ${app.name}`);
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
        group.name.toLowerCase(), [
          ...(group.policies ? group.policies : []),
          ...(await this.groupRootService.build(group))
            .filter((spec) => spec.templateName === 'user')
            .map((spec) => this.hclUtil.renderName(spec)),
        ], {root: 'user'});
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
    metadata: {[key: string]: string} = {}): Promise<void> {
    const accessor = await this.vaultApi.getOidcAccessor();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Library does not provide typing
    let group = await this.vault.write(
      `identity/group/name/${encodeURIComponent(name)}`, {
        policies,
        type: 'external',
        metadata,
      })
      .catch((error) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- No typing avialable
        const code = error.response.statusCode as number;
        this.logger.error(`Error creating group '${name}' in Vault: Error ${code}`);
        throw new Error('Could not create group');
      });

    if (!group) {
      // API does not return data if write was an update
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Library does not provide typing
      group = await this.vault.read(`identity/group/name/${encodeURIComponent(name)}`);
    }
    /* eslint-disable @typescript-eslint/no-unsafe-argument */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- No typing avialable
    if (!group.data.alias || (group.data.alias && Object.keys(group.data.alias).length === 0)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- No typing avialable
      await this.createGroupAlias(group.data.id, accessor, role);
    } else {
      this.logger.debug('Skip adding alias');
    }
    /* eslint-enable @typescript-eslint/no-unsafe-argument */
    this.logger.info(`Vault group: ${name} [${policies.join(',')}]`);
  }

  /**
   * Create a group alias
   * @param canonicalId The group canonical id
   * @param accessor The accessor id
   * @param name The name provided by the accessor for the group
   */
  public async createGroupAlias(canonicalId: string, mountAccessor: string, name: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Library does not provide typing
    const alias = await this.vault.write(`identity/lookup/group`,
      {alias_name: name, alias_mount_accessor: mountAccessor});

    if (!alias) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Library does not provide typing
      await this.vault.write(
        `identity/group-alias`, {
          name,
          mount_accessor: mountAccessor,
          canonical_id: canonicalId,
        })
        .catch((error) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- No typing avialable
          const code = error.response.statusCode as number;
          this.logger.error(
            `Failed to create alias '${name}' for '${canonicalId}' on '${mountAccessor}' in Vault. Error ${code}`);
          throw new Error('Could not create alias');
        });
    }
  }
}
