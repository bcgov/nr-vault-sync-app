import {Command} from '@oclif/command';
import 'reflect-metadata';
import {help, vaultAddr, vaultToken, keycloakAddr, keycloakUsername, keycloakPassword} from '../flags';
import {KeycloakRoleController} from '../keycloak/keycloak-role.controller';
import {bindKeycloak, bindVault, vsContainer} from '../inversify.config';
import {TYPES} from '../inversify.types';

/**
 * Vault and Keycloak user groups and users sync command
 */
export default class GroupsSync extends Command {
  static description = 'Given a JSON file, creates roles & users in Keycloak and groups in Vault'

  static flags = {
    ...help,
    ...vaultAddr,
    ...vaultToken,
    ...keycloakAddr,
    ...keycloakUsername,
    ...keycloakPassword,
  }

  static args = [{name: 'filepath'}]
  /**
   * Run the command
   */
  async run() {
    const {flags} = this.parse(GroupsSync);

    bindVault(flags['vault-addr'], flags['vault-token']);
    await bindKeycloak(flags['keycloak-addr'], flags['keycloak-username'], flags['keycloak-password']);

    await vsContainer.get<KeycloakRoleController>(TYPES.KeycloakRoleController).syncRolesAndGroups();
  }
}
