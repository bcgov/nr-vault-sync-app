import {Command, flags} from '@oclif/command'
import {help,vaultAddr, vaultToken, keycloakAddr, keycloakUsername, keycloakPassword} from '../flags';
import {vaultFactory, keycloakFactory} from '../api/api.factory';

export default class GroupSync extends Command {
  static description = 'Syncs a group from Keycloak to Vault.'

  static flags = {
    ...help,
    ...vaultAddr,
    ...vaultToken,
    ...keycloakAddr,
    ...keycloakUsername,
    ...keycloakPassword,
  }

  static args = [{name: 'file'}]

  async run() {
    const {flags} = this.parse(GroupSync);
    const vault = vaultFactory(flags['vault-addr'], flags['vault-token']);
    const keycloak = await keycloakFactory(flags['keycloak-addr'], flags['keycloak-username'], flags['keycloak-password']);

    this.log(`Vault health - ${vault.endpoint}`);
    this.log(JSON.stringify(await vault.health()));

    this.log(JSON.stringify(await keycloak.groups.find()));
  }
}
