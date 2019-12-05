import * as ejs from 'ejs';

// eslint-disable-next-line no-unused-vars
import {AppRoleConfig, Deliverable, DeliverableSubs} from '../../types';
import {vault} from '../../vault';

/**
 * The policy deliverable enables the syncing of vault appRoles
 */
export class AppRoleDeliverable implements Deliverable {
  /**
   * Constructs the deliverable
   * @param groupConfig The appRole config
   * @param deliverableSubs The deliverable template subsitutions
   */
  constructor(private appRoleConfig: AppRoleConfig, private deliverableSubs: DeliverableSubs) {
  }

  /**
   * Syncs the appRole with vault
   */
  public sync(): Promise<any> {
    const param: any = {
      role_name: ejs.render(this.appRoleConfig.role_name, this.deliverableSubs),
      policies: this.appRoleConfig.token_policies
          .map((policy) => ejs.render(policy, this.deliverableSubs)).join(', '),
    };

    return vault.addApproleRole(param);
  }
}
