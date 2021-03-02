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

  static args = [{name: 'groupname'}]

  async keycloakGroup(keycloak: any, groupname: string) {
    let group = await this.findGroupInKeycloak(keycloak, groupname)
    if (group) {
      this.log(`Group ${groupname} already exists in Keycloak.`)
    } else {
      group = await this.createGroupInKeycloak(keycloak, groupname)
    }
    return group.id
  }

  search(nameKey: string, array: Array<any>){
    for (var i=0; i < array.length; i++) {
        if (array[i].name === nameKey) {
            return array[i];
        }
    }
  }

  async findGroupInKeycloak(keycloak: any, groupname: string) {
    const groups = await keycloak.groups.find()
    const group = this.search(groupname, groups)
    if (!group) return false
    return group
  }

  async createGroupInKeycloak(keycloak: any, groupname: string) {
    const group = await keycloak.groups.create({name: groupname})
    .catch((error: any) => {
      return this.error(`Error creating group '${groupname}' in Keycloak: Error ${error.response.statusCode}!`)
    })
    this.log(`Group ${groupname} created in Keycloak.`)
    return group

  }


  async vaultGroup(vault: any, groupname: string, keycloakGroupId: string) {
    vault.read(`identity/group/name/${groupname}`)
    .then((group: any) => {
      this.log(`Group ${groupname} already exists in Vault.`)
      return group
    })
    .catch((error: any) => {
      const statusCode = error["response"]["statusCode"]
      //handle HTTP errors
      if (statusCode != 404) {
        return this.error(`Error searching for group '${groupname}' in Vault: Error ${error.response.statusCode}!`)
      }

      //404 that means group doesn't exist - create it
      this.createGroupInVault(vault, groupname, keycloakGroupId)
      .then(() => {
        return vault.read(`identity/group/name/${groupname}`)
      })
      .catch((error: any) => {
        return this.error(`Error creating gr2oup '${groupname}' in Vault: Error ${error.response.statusCode}!`)
      })
    })
  }

  async createGroupInVault(vault: any, groupname: string, keycloakGroupId: string) {
    const response = await vault.write(
      `identity/group/name/${groupname}`,
      { "type": "external", "metadata": {"keycloak-group-ID": keycloakGroupId} }
    )
    .catch((error: any) => {
      return this.error(`Error creating group '${groupname}' in Vault: Error ${error.response.statusCode}!`)
    })
    this.log(`Group ${groupname} created in Vault.`)
    return response.data
  }


  async run() {
    const {args, flags} = this.parse(GroupSync);
    const keycloak = await keycloakFactory(flags['keycloak-addr'], flags['keycloak-username'], flags['keycloak-password']);
    const vault = vaultFactory(flags['vault-addr'], flags['vault-token']);

    this.log(`Creating group '${args.groupname}' in Keycloak and in Vault.`)
    
    this.keycloakGroup(keycloak, args.groupname)
    .then((keycloakGroupID: string) => {
      this.vaultGroup(vault, args.groupname, keycloakGroupID)
    })
  }
}
