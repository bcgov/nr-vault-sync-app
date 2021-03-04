// eslint-disable-next-line no-unused-vars
import KeycloakAdminClient from 'keycloak-admin';
// eslint-disable-next-line no-unused-vars
import GroupRepresentation from 'keycloak-admin/lib/defs/groupRepresentation';

/**
 * Keycloak controller.
 */
export class KeycloakController {
  /**
  * Constructor. Accepts a keycloak admin client, and log & error to enable this.log/this.error.
  */
  constructor(
    private keycloak: KeycloakAdminClient,
    private log: Function,
    private error: Function,
  ) {}

  /**
   * Find or create a group in Keycloak.
   */
  public async syncGroup(groupname: string): Promise<string | undefined> {
    let groupID: string | undefined;
    await this.findGroupInKeycloak(groupname)
      .then(async (group) => {
        if (group) {
          this.log(`Group ${groupname} already exists in Keycloak.`);
          groupID = group.id;
        } else {
          await this.createGroupInKeycloak(groupname)
            .then((groupid) => {
              groupID = groupid;
            });
        }
      })
      .catch((error) => {
        return this.error(`Error finding group '${groupname}' in Keycloak: Error ${error.response.statusCode}!`);
      });
    return groupID;
  }

  /**
   * Find an entry in an array with a name field that matches a given name key.
   */
  search(nameKey: string, array: Array<any>): any | undefined {
    for (let i=0; i < array.length; i++) {
      if (array[i].name === nameKey) {
        return array[i];
      }
    }
    return undefined;
  }

  /**
   * Find a group in Keycloak.
   */
  async findGroupInKeycloak(groupname: string): Promise<GroupRepresentation | undefined> {
    const groups = await this.keycloak.groups.find();
    return this.search(groupname, groups);
  }

  /**
   * Create a group in Keycloak.
   */
  async createGroupInKeycloak(groupname: string): Promise<string | undefined> {
    let groupid: string | undefined;
    this.keycloak.groups.create({name: groupname})
      .then((group) => {
        this.log(`Group ${groupname} created in Keycloak.`);
        groupid = group.id;
      })
      .catch(() => {
        return this.error(`Error creating group '${groupname}' in Keycloak! Is Keycloak running?`);
      });
    return groupid;
  }
}
