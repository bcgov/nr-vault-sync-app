import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line no-unused-vars
import nv from 'node-vault';

/**
 * The policy controller manages the sync of vault policies
 */
export class PolicySyncController {
  /**
   * Construct the policy controller
   * @param vault The vault client to use
   */
  constructor(private vault: nv.client) {}


  /**
   * Syncs all policies to vault
   * @param policyPath The path to the configuration
   */
  public async syncAll(policyPath: string) {
    // eslint-disable-next-line no-unused-vars
    // const dir = path.join(__dirname, '../../templates', policyPath);

  }

  /**
   * Syncs policies with vault
   */
  public async sync(policyPath: string, project: string, application: string) {
    const dir = path.join(__dirname, '../../templates', policyPath);

    const config = JSON.parse(fs.readFileSync(path.join(dir, 'config.json'), 'UTF8'));
    for (const policy of config.policies) {
      const policyName = ejs.render(
          policy.name,
          {
            project,
            application,
            tmplFilename: policy.template.slice(0, -8),
          },
      );
      const policyBody = ejs.render(
          fs.readFileSync(path.join(dir, policy.template), 'UTF8'),
          {
            project,
            application,
            secertKvPath: 'secret',
            databasePath: 'database',
          },
      );

      await this.vault.addPolicy({
        name: policyName,
        rules: policyBody,
      });
    }
  }
}
