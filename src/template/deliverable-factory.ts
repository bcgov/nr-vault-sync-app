import * as fs from 'fs';
import * as path from 'path';

import {AppRoleDeliverable, GroupDeliverable, PolicyDeliverable} from './deliverable';
// eslint-disable-next-line no-unused-vars
import {TemplateConfig, Deliverable, DeliverableSubs} from '../types';
// eslint-disable-next-line no-unused-vars
import GroupManager from '../group-manager';

/**
 * The deliverable factory creates deliverables from a configuration
 */
class DeliverableFactory {
  /**
   * Generates deliverables
   * @param config The configuration to parse
   * @param parentConfig The parent configuration
   * @param gm The group manager to use
   */
  static generate(
      config: TemplateConfig,
      parentConfig: TemplateConfig | undefined = undefined,
      gm: GroupManager): Deliverable[] {
    const deliverableSubs: DeliverableSubs = parentConfig ? {
      application: config.key,
      project: parentConfig.key,
      environments: config.environments ? config.environments : parentConfig.environments,
    } : {
      project: config.key,
      environments: config.environments,
    };

    let rval: Deliverable[] = [];
    const templatePath = path.join(__dirname, '../../templates', config.template);
    console.log(path.join(templatePath, 'config.json'));
    const tmplConfig: TemplateConfig = JSON.parse(
        fs.readFileSync(path.join(templatePath, 'config.json'), 'UTF8'),
    );
    if (tmplConfig.policies) {
      rval = rval.concat(tmplConfig.policies.map((policy) => {
        console.log(path.join(templatePath, 'policy', policy.template));
        return new PolicyDeliverable(policy,
            deliverableSubs, path.join(templatePath, 'policy', policy.template),
            config.policyext);
      }));
    }
    if (tmplConfig.groups) {
      rval = rval.concat(tmplConfig.groups.map((group) => new GroupDeliverable(group, deliverableSubs, gm)));
    }
    if (tmplConfig.appRole) {
      rval.push(new AppRoleDeliverable(tmplConfig.appRole, deliverableSubs));
    }

    return rval;
  }
}

export default DeliverableFactory;
