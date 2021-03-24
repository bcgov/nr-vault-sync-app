import {Command} from '@oclif/command';
import 'reflect-metadata';
import {help, vaultAddr, vaultToken, keycloakAddr, keycloakUsername, keycloakPassword} from '../flags';
import {KeycloakRoleController} from '../keycloak/keycloak-role.controller';
import {bindKeycloak, bindVault, vsContainer} from '../inversify.config';
import {TYPES} from '../inversify.types';

/**
 * Vault and Keycloak user group sync command
 */
export default class KeycloakGroupSync extends Command {
  static description = 'Given a group name, creates that group in Keycloak and syncs it to Vault.'

  static flags = {
    ...help,
    ...vaultAddr,
    ...vaultToken,
    ...keycloakAddr,
    ...keycloakUsername,
    ...keycloakPassword,
  }

  static args = [{name: 'groupname'}]
  /**
   * Run the command
   */
  async run() {
    const {args, flags} = this.parse(KeycloakGroupSync);

    this.log(`Creating group '${args.groupname}' in Keycloak and in Vault.`);

    bindVault(flags['vault-addr'], flags['vault-token']);
    await bindKeycloak(flags['keycloak-addr'], flags['keycloak-username'], flags['keycloak-password']);

    await vsContainer.get<KeycloakRoleController>(TYPES.KeycloakRoleController).syncRoleAndGroup(args.groupname);
  }
}
