import {inject, injectable} from 'inversify';
import nv from 'node-vault';
import winston from 'winston';
import {TYPES} from '../inversify.types';

@injectable()
/**
  * Vault controller.
  */
export class VaultController {
  /**
  * Constructor. Accepts a vault client, and log & error to enable this.logger.info/this.logger.error.
  */
  constructor(
    @inject(TYPES.Vault) private vault: nv.client,
    @inject(TYPES.Logger) private logger: winston.Logger,
  ) {}

  /**
    * Find a user group in Vault; create it if it does not exist.
    */
  public async syncGroup(groupname: string, keycloakGroupId: string = ''): Promise<any> {
    return this.vault.read(`identity/group/name/${groupname}`)
      .then((group) => {
        this.logger.info(`Group ${groupname} already exists in Vault.`);
        return group;
      })
      .catch((error: any) => {
        const statusCode = error.response.statusCode;
        // handle HTTP errors
        if (statusCode != 404) {
          this.logger.error(`Error searching for group '${groupname}' in Vault: Error ${statusCode}`);
          throw new Error('Unhandled status code');
        }
        // 404 that means group doesn't exist - create it
        return this.createGroupInVault(groupname, keycloakGroupId);
      });
  }

  /**
    * Create a group in Vault.
    */
  public async createGroupInVault(groupname: string, keycloakGroupId: string): Promise<any> {
    const accessor = await this.getAccessor();

    const groupResponse = await this.vault.write(
      `identity/group/name/${groupname}`, {
        'type': 'external',
        'metadata': {'keycloak-group-ID': keycloakGroupId},
      },
    )
      .catch((error: any) => {
        this.logger.error(`Error creating group '${groupname}' in Vault: Error ${error.response.statusCode}`);
        throw new Error('Could not create group');
      });

    await this.createGroupAlias(keycloakGroupId, accessor, groupResponse.data.id);
    this.logger.info(`Group ${groupname} created in Vault.`);

    return this.vault.read(`identity/group/name/${groupname}`);
  }

  /**
   * Get the accessor from Vault for the Keycloak (OIDC) instance.
   */
  async getAccessor(): Promise<string> {
    return this.vault.read(`/sys/auth`)
      .then((response: object) => {
        for (const value of Object.values(response)) {
          if (value.type === 'oidc') {
            return value.accessor;
          }
        }
        this.logger.error(`Cannot find an OIDC auth type - is your Vault configured correctly?`);
        throw new Error('No OIDC configured');
      })
      .catch((error) => {
        this.logger.error(
          `Could not lookup accessor in Vault: Error ${error.response.statusCode}`);
        throw new Error('Could not lookup accessor');
      });
  }

  /**
   * Create a group alias
   * @param keycloakGroupId The keycloak id
   * @param accessor The accessor id
   * @param canonicalId The group canonical id
   */
  async createGroupAlias(keycloakGroupId: string, accessor: string, canonicalId: string) {
    return await this.vault.write(
      `identity/group-alias`, {
        'name': keycloakGroupId,
        'mount_accessor': accessor,
        'canonical_id': canonicalId,
      })
      .catch((error) => {
        this.logger.error(
          `Error creating alias '${keycloakGroupId}' in Vault: Error ${error.response.statusCode}`);
        throw new Error('Could not create alias');
      });
  }
}
