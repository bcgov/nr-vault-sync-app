import * as ejs from 'ejs';

// eslint-disable-next-line no-unused-vars
import {Deliverable, GroupConfig, DeliverableSubs} from '../../types';
// eslint-disable-next-line no-unused-vars
import GroupManager from '../../group-manager';

/**
 * The policy deliverable enables the syncing of vault groups
 */
export class GroupDeliverable implements Deliverable {
  /**
   * Constructs the deliverable
   * @param groupConfig The group config
   * @param deliverableSubs The deliverable template subsitutions
   * @param gm The group manager
   */
  constructor(
    private groupConfig: GroupConfig,
    private deliverableSubs: DeliverableSubs,
    private gm: GroupManager) { }

  /**
   * This syncs to the group manager and not directly with vault.
   */
  public sync(): Promise<any> {
    const param: any = {
      name: ejs.render(this.groupConfig.name, this.deliverableSubs),
      policies: this.groupConfig.policies.map((policy) => ejs.render(policy, this.deliverableSubs)),
    };
    this.gm.addGroup(param);

    // Unlike the others, this delegates syncing to the group manager
    return Promise.resolve(null);
  }
}
