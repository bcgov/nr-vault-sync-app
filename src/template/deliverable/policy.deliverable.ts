import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';

// eslint-disable-next-line no-unused-vars
import {PolicyConfig, Deliverable, DeliverableSubs, PolicyExtension} from '../../types';
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
    private templatePath: string,
    private policyExt: PolicyExtension) {
  }

  /**
   * Syncs the policy with vault
   */
  public sync(): Promise<any> {
    const tmplStr = fs.readFileSync(this.templatePath, 'UTF8');
    const policyName = ejs.render(this.policyConfig.name, this.deliverableSubs);
    const param: any = {
      name: policyName,
      rules: ejs.render(tmplStr, this.deliverableSubs),
    };

    if (this.policyExt && Array.isArray(this.policyExt[policyName])) {
      console.log(this.policyExt);
      for (const extPath of this.policyExt[policyName]) {
        param.rules += ejs.render(
            fs.readFileSync(path.join(__dirname, '../../../templates/policyext', extPath), 'UTF8'),
            this.deliverableSubs);
      }
    }

    // It may/may not be more effecient to check if the policy changed before rewriting it.
    return vault.addPolicy(param);
  }
}
