import {vault} from './vault';

/**
 * Combines group info from multiple projects and then syncs with vault.
 */
class GroupManager {
  private groupHash: {
    [key: string]: any
  } = {};

  /**
   * Sync the group information with vault
   */
  async sync(): Promise<any> {
    for (const param of Object.values(this.groupHash)) {
      await vault.read(`identity/group/name/${param.name}`).then((group) => {
        // Exists - merge in policies and groups
        group.data.policies = param.policies;
        return vault.write(`identity/group/name/${param.name}`, group.data);
      }).catch(() => {
        // 404 - Create the group
        return vault.write(`identity/group/name/${param.name}`, param);
      });
    }
  }

  /**
   * Add a group to the sync. If a group with the same name already exists then combines
   * the other parameters with it.
   * @param param The group to add
   */
  addGroup(param: any) {
    if (this.groupHash[param.name]) {
      this.groupHash[param.name].policies = [...new Set([
        ...this.groupHash[param.name].policies, ...param.policies,
      ])];
    } else {
      this.groupHash[param.name] = param;
    }
  }
}

export default GroupManager;
