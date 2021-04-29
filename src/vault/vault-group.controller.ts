import {inject, injectable} from 'inversify';
import nv from 'node-vault';
import winston from 'winston';
import {TYPES} from '../inversify.types';
import {ConfigService} from '../services/config.service';
import VaultPolicyController from './vault-policy.controller';
import VaultApi from './vault.api';

@injectable()
/**
 * Vault group controller.
 */
export default class VaultGroupController {
  /**
   * Constructor. Accepts a vault client, and logger.
   */
  constructor(
    @inject(TYPES.Vault) private vault: nv.client,
    @inject(TYPES.VaultApi) private vaultApi: VaultApi,
    @inject(TYPES.ConfigService) private config: ConfigService,
    @inject(TYPES.VaultPolicyController) private vpcController: VaultPolicyController,
    @inject(TYPES.Logger) private logger: winston.Logger,
  ) {}

  /**
   *
   */
  public async sync() {
    const groups = await this.config.getGroups();
    for (const group of groups) {
      await this.syncGroup(group.name, this.vpcController.decorateGroupPolicy(group));
    }
  }

  /**
   * Find a user group in Vault; create it if it does not exist.
   */
  public async syncGroup(groupName: string, policies: string[], metadata: {[key: string]: string} = {}): Promise<any> {
    const accessor = await this.vaultApi.getOidcAccessor();

    let group = await this.vault.write(
      `identity/group/name/${groupName}`, {
        policies,
        type: 'external',
        metadata,
      })
      .catch((error: any) => {
        this.logger.error(`Error creating group '${groupName}' in Vault: Error ${error.response.statusCode}`);
        throw new Error('Could not create group');
      });

    if (!group) {
      // Does not return data if an update
      group = await this.vault.read(`identity/group/name/${groupName}`);
    }
    if (!group.data.alias || (group.data.alias && Object.keys(group.data.alias).length === 0)) {
      await this.createGroupAlias(group.data.id, accessor, groupName);
    } else {
      this.logger.debug('Skip adding alias');
    }
    this.logger.info(`Vault group: ${groupName}`);
    return group;
  }

  /**
   * Create a group alias
   * @param canonicalId The group canonical id
   * @param accessor The accessor id
   * @param name The name provided by the accessor for the group
   */
  async createGroupAlias(canonicalId: string, mountAccessor: string, name: string) {
    const alias = await this.vault.write(`identity/lookup/group`,
      {alias_name: name, alias_mount_accessor: mountAccessor});

    if (!alias) {
      return await this.vault.write(
        `identity/group-alias`, {
          name,
          mount_accessor: mountAccessor,
          canonical_id: canonicalId,
        })
        .catch((error) => {
          const code = error.response.statusCode;
          this.logger.error(
            `Failed to create alias '${name}' for '${canonicalId}' on '${mountAccessor}' in Vault. Error ${code}`);
          throw new Error('Could not create alias');
        });
    }
  }
}
