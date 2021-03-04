
// eslint-disable-next-line no-unused-vars
import nv from 'node-vault';

/**
  * Vault controller.
  */
export class VaultController {
  /**
  * Constructor. Accepts a vault client, and log & error to enable this.log/this.error.
  */
  constructor(private vault: nv.client, private log: Function, private error: Function) {}

  /**
    * Find a user group in Vault; create it if it does not exist.
    */
  public async syncGroup(groupname: string, keycloakGroupId: string = '') {
    let group = null;
    group = await this.vault.read(`identity/group/name/${groupname}`)
      .then((group) => {
        this.log(`Group ${groupname} already exists in Vault.`);
        return group;
      })
      .catch(async (error: any) => {
        const statusCode = error.response.statusCode;
        // handle HTTP errors
        if (statusCode != 404) {
          return this.error(`Error searching for group '${groupname}' in Vault: Error ${statusCode}!`);
        }
        // 404 that means group doesn't exist - create it
        await this.createGroupInVault(groupname, keycloakGroupId)
          .catch((error: any) => {
            return this.error(`Error creating group '${groupname}' in Vault: Error ${error.response.statusCode}!`);
          });
        group = await this.vault.read(`identity/group/name/${groupname}`);
      });
    return group;
  }

  /**
    * Create a group in Vault.
    */
  async createGroupInVault(groupname: string, keycloakGroupId: string) {
    const response = await this.vault.write(
      `identity/group/name/${groupname}`,
      {'type': 'external', 'metadata': {'keycloak-group-ID': keycloakGroupId}},
    )
      .catch((error: any) => {
        return this.error(`Error creating group '${groupname}' in Vault: Error ${error.response.statusCode}!`);
      });
    this.log(`Group ${groupname} created in Vault.`);
    return response.data;
  }
}
