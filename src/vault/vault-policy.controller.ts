import nv from 'node-vault';
import { inject, injectable, multiInject } from 'inversify';
import { TYPES } from '../inversify.types';
import winston from 'winston';
import HclUtil, { HlcRenderSpec } from '../util/hcl.util';
import { PolicyRootService } from './policy-roots/policy-root.service';
import { RegistrationService } from '../services/registration.service';

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
    @inject(TYPES.RegistrationService)
    private registrationService: RegistrationService,
    @multiInject(TYPES.PolicyRootService)
    private policyRootServices: PolicyRootService<unknown>[],
    @inject(TYPES.Logger) private logger: winston.Logger,
  ) {}

  /**
   * Syncs policies to vault
   */
  public async sync(root: string[]): Promise<void> {
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
    await this.registrationService.clear();
  }

  /**
   * Adds a policy to vault
   * @param spec The policy spec to render and add to Vault
   */
  public async addPolicy(spec: HlcRenderSpec): Promise<void> {
    const name = this.hclUtil.renderName(spec);
    const policy = this.hclUtil.renderBody(spec);
    if (await this.registrationService.isSameValue(name, policy)) {
      await this.registrationService.setUsed(name);
      // this.logger.info(`Skip: ${name}`);
    } else {
      this.logger.info(`Add policy: ${name}`);
      await this.registrationService.register(name, policy);
      // Using vault.write because vault.addPolicy is not encoding the name correctly
      await this.vault.write(`sys/policies/acl/${encodeURIComponent(name)}`, {
        name,
        policy,
      });
    }
  }

  /**
   * Remove unregistered policies
   * @param group The policy group
   * @param partialRegistration True if not all policies were registered this run and false otherwise
   */
  public async removeUnregisteredPolicies(
    group: string,
    partialRegistration: boolean,
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- No typing avialable
    const policies = (await this.vault.policies()).data.policies as string[];
    try {
      const policiesToRemove =
        await this.registrationService.filterNamesForUnregistered(
          policies.filter((policyName: string) => policyName.startsWith(group)),
          partialRegistration,
        );

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
