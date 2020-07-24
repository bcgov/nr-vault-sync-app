import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';

// eslint-disable-next-line no-unused-vars
import {vault} from '../middleware';

/**
 * The policy deliverable enables the syncing of vault policies
 */
export class PolicyApi {

  /**
   * Syncs policies with vault
   */
  public async sync(policyPath: string, project: string, application: string) {

    const dir = path.join(__dirname, '../../templates', policyPath);

    const config = JSON.parse(fs.readFileSync(path.join(dir, 'config.json'), 'UTF8'));
    for(const policy of config.policies) {
      const policyName = ejs.render(
        policy.name,
        {
          project,
          application,
          tmplFilename: policy.template.slice(0, -8)
        }
      );
      const policyBody = ejs.render(
        fs.readFileSync(path.join(dir, policy.template), 'UTF8'),
        {
          project,
          application,
          secertKvPath: 'secrets',
          databasePath: 'database'
        }
      );

      await vault.addPolicy({
        name: policyName,
        rules: policyBody
      });
    }
  }
}
