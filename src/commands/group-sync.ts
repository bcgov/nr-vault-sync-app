import {Command, flags} from '@oclif/command'
import {help,vaultAddr, vaultToken, keycloakAddr, keycloakUsername, keycloakPassword} from '../flags';
import {vaultFactory, keycloakFactory} from '../api/api.factory';
import {VaultController} from '../group-sync/vault.controller'
import {KeycloakController} from '../group-sync/keycloak.controller'

export default class GroupSync extends Command {
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

  async run() {
    const {args, flags} = this.parse(GroupSync);

    const keycloak = await keycloakFactory(flags['keycloak-addr'], flags['keycloak-username'], flags['keycloak-password']);
    const keycloakController = new KeycloakController(keycloak, this.log, this.error)

    const vault = vaultFactory(flags['vault-addr'], flags['vault-token'])
    const vaultController = new VaultController(vault, this.log, this.error)

    this.log(`Creating group '${args.groupname}' in Keycloak and in Vault.`)
    
    keycloakController.syncGroup(args.groupname)
    .then((keycloakGroupID: string) => {
      vaultController.syncGroup(args.groupname, keycloakGroupID)
    })
  }
}
