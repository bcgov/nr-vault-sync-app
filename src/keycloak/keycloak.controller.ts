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
  public async syncGroup(groupname: string): Promise<string> {
    return this.findGroupInKeycloak(groupname)
      .then(async (group) => {
        if (group) {
          this.log(`Group ${groupname} already exists in Keycloak.`);
          return group.id;
        } else {
          await this.createGroupInKeycloak(groupname)
            .then((groupid) => {
              return groupid;
            });
        }
      })
      .catch((error) => {
        return this.error(`Error finding group '${groupname}' in Keycloak: Error ${error.response.statusCode}!`);
      });
  }

  /**
   * Find a group in Keycloak.
   */
  async findGroupInKeycloak(groupname: string): Promise<GroupRepresentation | undefined> {
    const groups = await this.keycloak.groups.find();
    return groups.find((x) => x.name === groupname);
  }

  /**
   * Create a group in Keycloak.
   */
  async createGroupInKeycloak(groupname: string): Promise<string> {
    return this.keycloak.groups.create({name: groupname})
      .then((group) => {
        this.log(`Group ${groupname} created in Keycloak.`);
        return group.id;
      })
      .catch(() => {
        return this.error(`Error creating group '${groupname}' in Keycloak! Is Keycloak running?`);
      });
  }
}
