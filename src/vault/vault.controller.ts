import nv from 'node-vault';

export class VaultController {
  constructor(private vault: nv.client, private log: Function, private error: Function) {}

  public async syncGroup(groupname: string, keycloakGroupId: string = '') {
    this.vault.read(`identity/group/name/${groupname}`)
        .then((group: any) => {
          this.log(`Group ${groupname} already exists in Vault.`);
          return group;
        })
        .catch((error: any) => {
          const statusCode = error['response']['statusCode'];
          // handle HTTP errors
          if (statusCode != 404) {
            return this.error(`Error searching for group '${groupname}' in Vault: Error ${error.response.statusCode}!`);
          }

          // 404 that means group doesn't exist - create it
          this.createGroupInVault(groupname, keycloakGroupId)
              .then(() => {
                return this.vault.read(`identity/group/name/${groupname}`);
              })
              .catch((error: any) => {
                return this.error(`Error creating gr2oup '${groupname}' in Vault: Error ${error.response.statusCode}!`);
              });
        });
  }

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
