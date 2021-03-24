import {inject, injectable, multiInject} from 'inversify';
import {TYPES} from '../inversify.types';
import {Group, GroupImportService} from '../services/group-import.service';
import winston from 'winston';
import KeycloakAdminClient from 'keycloak-admin';
import UserRepresentation from 'keycloak-admin/lib/defs/userRepresentation';
import VaultGroupController from '../vault/vault-group.controller';

@injectable()
/**
 * Keycloak controller.
 */
export class KeycloakRoleController {
  private vaultClientID: string | undefined;
  /**
  * Constructor. Accepts a keycloak admin client, and log & error to enable this.logger.info/this.logger.error.
  */
  constructor(
    @inject(TYPES.KeycloakAdminClient) private keycloak: KeycloakAdminClient,
    @inject(TYPES.VaultGroupController) private vaultController: VaultGroupController,
    @inject(TYPES.Logger) private logger: winston.Logger,
    @multiInject(TYPES.GroupImport) private groupImports: GroupImportService[],
  ) {}

  /**
   * Gets a list of roles/groups from various sources, and syncs them in Keycloak & Vault.
   */
  public async syncRolesAndGroups() {
    const input: Group[] = this.groupImports
      .map((gi) => gi.getGroups())
      .reduce((arr, groups) => [...arr, ...groups], []);

    for (const group of input) {
      await this.syncRoleAndGroup(group.name)
        .catch(() => {
          this.logger.error(`Could not sync group: ${group.name}`);
        });
    }
    this.logger.debug('exiting');
  }

  /**
   * ensures a role exists in Keycloak, syncs users to it, then ensures a matched group exists in Vault.
   * @param name: the name of the Keycloak Role / Vault Group.
   * @param usernames: optionally, a list of usernames for users that should be in clients/vault/roles/$name .
   */
  public async syncRoleAndGroup(name: string, usernames?: string[]) {
    this.logger.info('syncRoleAndGroup');
    this.logger.info(`Creating role '${name}' and assigning it users in Keycloak.`);

    await this.ensureVaultClient();
    const roleId = await this.syncRoleAndUsers(name, usernames);
    await this.vaultController.syncGroup(name, [], roleId ? {roleId}: {});
  }

  /**
   * Find or create a role in Keycloak, then ensure some users are in it.
   * @param rolename: the name of the Keycloak Role.
   * @param roleUsernames: optionally, a list of usernames for users that should be in clients/vault/roles/$name .
   */
  private async syncRoleAndUsers(rolename: string, roleUsernames: string[] = []) {
    const roleId = await this.syncRole(rolename);
    await this.syncUsers(rolename, roleId as string, roleUsernames);
    return roleId;
  }

  /**
   * Find or create a role in Keycloak.
   * @param rolename: the name of the Keycloak Role.
   */
  private async syncRole(rolename: string): Promise<string | undefined> {
    let role = await this.keycloak.clients.findRole({id: this.vaultClientID as string, roleName: rolename})
      .catch((error) => {
        this.logger.error(`Keycloak error syncing role ${rolename}: Error ${error.response.statusCode}`);
        throw new Error('Could not sync roles');
      });
    this.logger.debug('syncRole after findRole');
    if (role) {
      this.logger.debug('role exists');
      this.logger.info(`Role ${rolename} already exists in Keycloak under the 'vault' client.`);
    } else {
      await this.createRoleInKeycloak(rolename)
        .catch((error) => {
          this.logger.error(`Keycloak error syncing role ${rolename}: Error ${error.response.statusCode}`);
          throw new Error('Could not sync roles');
        });
      role = await this.keycloak.clients.findRole({id: this.vaultClientID as string, roleName: rolename})
        .catch((error) => {
          this.logger.error(`Keycloak error syncing role ${rolename}: Error ${error.response.statusCode}`);
          throw new Error('Could not sync roles');
        });
    }
    return role.id;
  }

  /**
   * Create a role in Keycloak.
   * @param rolename: the name of the Keycloak Role.
   */
  private async createRoleInKeycloak(rolename: string) {
    const role = await this.keycloak.clients.createRole(
      {name: rolename, clientRole: true, id: this.vaultClientID as string},
    );
    this.logger.info(`Role ${rolename} created in Keycloak.`);
    return role.roleName;
  }

  /**
   * Makes sure that a Client exists named 'vault' to interface with Vault.
   * TODO: Make into a getter
   */
  private async ensureVaultClient() {
    if (!this.vaultClientID) {
      const vaultClient = await this.keycloak.clients.findOne({id: 'vault'})
        .catch((error) => {
          this.logger.error(`Keycloak error: Cannot find Vault client! Is Keycloak running?`);
          throw error;
        });

      // Client exists. Return it.
      if (vaultClient) {
        this.vaultClientID = vaultClient.id;
      }

      // Client does not exist. Create it.
      const kcVaultClient = await this.keycloak.clients.create({
        name: 'vault',
        id: 'vault',
      }).catch((error) => {
        this.logger.error(`Keycloak error: Creating Vault client failed: ${error}!`);
        throw error;
      });
      this.vaultClientID = kcVaultClient.id;
    }
  }

  /**
   * Ensure users are in a role in Keycloak. Does not create users.
   * @param rolename: the name of the Keycloak Role.
   * @param roleID: the ID of the Keycloak Role.
   * @param roleUsernames: optionally, a list of usernames for users that should be in clients/vault/roles/$name .
   */
  private async syncUsers(rolename: string, roleID: string, roleUsernames: Array<string> = []) {
    const users: UserRepresentation[] = await this.keycloak.users.find()
      .catch((error) => {
        this.logger.error(`Keycloak error: Cannot lookup users. Is Keycloak running?`);
        throw error;
      });

    if (users) {
      for (const username of roleUsernames) {
        const user = users.find((x) => x.username === username);
        if (user) {
          await this.keycloak.users.addClientRoleMappings({
            id: user.id as string,
            clientUniqueId: this.vaultClientID as string,
            roles: [{id: roleID, name: rolename}],
          }).catch((error) => {
            this.logger.error(`Keycloak error: Adding user ${username} to role ${rolename} failed, ${error}`);
            // Continue
          });
        } else {
          this.logger.info(`Keycloak: User '${username}' not found, so cannot add them to ${rolename}. Continuing.`);
        }
      }
    }
  }
}
