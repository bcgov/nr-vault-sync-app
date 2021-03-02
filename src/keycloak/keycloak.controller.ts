import KeycloakAdminClient from 'keycloak-admin';

export class KeycloakController {
  constructor (private keycloak: KeycloakAdminClient, private log: Function, private error: Function) {}

  public async syncGroup(groupname: string) {
    let group = await this.findGroupInKeycloak(groupname)
    if (group) {
      this.log(`Group ${groupname} already exists in Keycloak.`)
    } else {
      group = await this.createGroupInKeycloak(groupname)
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
    
  async findGroupInKeycloak(groupname: string) {
      const groups = await this.keycloak.groups.find()
      const group = this.search(groupname, groups)
      if (!group) return false
      return group
    }
    
  async createGroupInKeycloak(groupname: string) {
    const group = await this.keycloak.groups.create({name: groupname})
    .catch((error: any) => {
      return this.error(`Error creating group '${groupname}' in Keycloak: Error ${error.response.statusCode}!`)
    })
    this.log(`Group ${groupname} created in Keycloak.`)
    return group

  }
}
