import winston from 'winston';
import {TYPES} from '../../inversify.types';
import {inject, injectable} from 'inversify';
import {PolicyRegistrationService} from '../policy-registration.service';

@injectable()
/**
 * Service to determine if unregistred policies exist in the Vault instance
 */
export class PolicyRegistrationMemoryService implements PolicyRegistrationService {
  private policyDb: {[key: string]: boolean} = {};

  /**
   * Construct the policy controller
   * @param vault The vault client to use
   */
  constructor(
    @inject(TYPES.Logger) private logger: winston.Logger) {}

  /**
   * Register a policy as active
   * @param policyName The name of the policy
   */
  async registerPolicy(policyName: string): Promise<void> {
    this.policyDb[policyName] = true;
  }

  /**
   * Registers a group of policies as active
   * @param policyNames The names of policies to register
   */
  async registerPolicies(policyNames: string[]): Promise<void> {
    for (const policyName of policyNames) {
      await this.registerPolicy(policyName);
    }
  }

  /**
   * Returns if a policy has been registered this run with the name
   * @param policyName The name of the policy to check
   */
  async hasRegisteredPolicy(policyName: string): Promise<boolean> {
    return policyName in this.policyDb;
  }

  /**
   * Clears all registered policies
   */
  async clearPolicies(): Promise<void> {
    this.policyDb = {};
  }

  /**
   * Return the set of policies that were not registered. If the service does
   * not support partial registration, it will throw an error.
   * @param policyNames The names of policies to check
   * @param partialRegistration True if the caller did not register all the group's policies
   */
  async filterPoliciesForUnregistered(policyNames: string[], partialRegistration: boolean): Promise<string[]> {
    if (partialRegistration) {
      this.logger.error('Partial not supported');
      throw new Error('Partial not supported');
    }

    return policyNames.filter((policyName: string) => !(policyName in this.policyDb));
  }
}
