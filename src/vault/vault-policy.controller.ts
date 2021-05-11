import nv from 'node-vault';
import {inject, injectable, multiInject} from 'inversify';
import {TYPES} from '../inversify.types';
import winston from 'winston';
import {PolicyRegistrationService} from '../services/policy-registration.service';
import HclUtil, {HlcRenderSpec} from '../util/hcl.util';
import {PolicyRootService} from './policy-roots/policy-root.service';

@injectable()
/**
 * The policy controller manages the sync of vault policies
 */
export default class VaultPolicyController {
  /**
   * Construct the policy controller
   * @param vault The vault client to use
   */
  constructor(
    @inject(TYPES.Vault) private vault: nv.client,
    @inject(TYPES.HclUtil) private hclUtil: HclUtil,
    @inject(TYPES.PolicyRegistrationService)
    private policyRegistrationService: PolicyRegistrationService,
    @multiInject(TYPES.PolicyRootService)
    private policyRootServices: PolicyRootService<undefined>[],
    @inject(TYPES.Logger) private logger: winston.Logger) {}

  /**
   * Syncs policies to vault
   */
  public async sync(root: string[]) {
    for (const policyRoot of this.policyRootServices) {
      if (root.length === 0 || root[0] === policyRoot.getName()) {
        this.logger.info(`- Sync ${policyRoot.getName()}`);
        const specs = await policyRoot.build();
        for (const spec of specs) {
          await this.addPolicy(spec);
        }
        await this.removeUnregisteredPolicies(policyRoot.getName(), false);
      }
    }
  }

  /**
   * Adds a policy to vault
   * @param spec The policy spec to render and add to Vault
   */
  public async addPolicy(spec: HlcRenderSpec) {
    const name = this.hclUtil.renderName(spec);
    this.logger.info(`Add policy: ${name}`);
    if (!await this.policyRegistrationService.hasRegisteredPolicy(name)) {
      this.policyRegistrationService.registerPolicy(name);
      // Using vault.write because vault.addPolicy is not encoding the name correctly
      return this.vault.write(`sys/policies/acl/${encodeURIComponent(name)}`, {
        name,
        policy: this.hclUtil.renderBody(spec),
      });
    }
  }

  /**
   * Remove unregistered policies
   * @param group The policy group
   * @param partialRegistration True if not all policies were registered this run and false otherwise
   */
  public async removeUnregisteredPolicies(group: string, partialRegistration: boolean) {
    const policies = (await this.vault.policies()).data.policies;
    try {
      const policiesToRemove = await this.policyRegistrationService.filterPoliciesForUnregistered(
        policies.filter((policyName: string) => policyName.startsWith(group)),
        partialRegistration);

      for (const name of policiesToRemove) {
        // Using vault.delete because vault.removePolicy is not encoding the name correctly
        await this.vault.delete(`sys/policies/acl/${encodeURIComponent(name)}`);
        this.logger.info(`Removed: ${name}`);
      }
    } catch (error) {
      this.logger.error(`Could not remove unused policies: ${group}`);
      this.logger.error(`If this is a partial sync this could be expected.`);
    }
  }
}
