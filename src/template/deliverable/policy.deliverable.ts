import * as ejs from 'ejs';

// eslint-disable-next-line no-unused-vars
import {PolicyConfig, Deliverable, DeliverableSubs} from '../../types';
import {vault} from '../../vault';

/**
 * The policy deliverable enables the syncing of vault policies
 */
export class PolicyDeliverable implements Deliverable {
  /**
   * Constructs the deliverable
   * @param policyConfig The policy config
   * @param deliverableSubs The deliverable template subsitutions
   * @param tmplStr The policy template
   */
  constructor(private policyConfig: PolicyConfig,
    private deliverableSubs: DeliverableSubs,
    private tmplStr: string) {
  }

  /**
   * Syncs the policy with vault
   */
  public sync(): Promise<any> {
    const param: any = {
      name: ejs.render(this.policyConfig.name, this.deliverableSubs),
      rules: ejs.render(this.tmplStr, this.deliverableSubs),
    };

    // It may/may not be more effecient to check if the policy changed before rewriting it.
    return vault.addPolicy(param);
  }
}
