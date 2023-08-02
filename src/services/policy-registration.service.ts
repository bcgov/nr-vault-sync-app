/**
 * Service to determine if unregistred policies exist in the Vault instance
 */
export interface PolicyRegistrationService {
  /**
   * Register a policy as active
   * @param policyName The name of the policy
   */
  registerPolicy(policyName: string): Promise<void>;

  /**
   * Registers a group of policies as active
   * @param policyNames The names of policies to register
   */
  registerPolicies(policyNames: string[]): Promise<void>;

  /**
   * Returns if a policy has been registered this run with the name
   * @param policyName The name of the policy to check
   */
  hasRegisteredPolicy(policyName: string): Promise<boolean>;

  /**
   * Clears all registered policies
   */
  clearPolicies(): Promise<void>;

  /**
   * Return the set of policies that were not registered. If the service does
   * not support partial registration, it will throw an error.
   * @param policyNames The names of policies to register
   * @param partialRegistration True if the caller did not register all the group's policies
   */
  filterPoliciesForUnregistered(
    policyNames: string[],
    partialRegistration: boolean,
  ): Promise<string[]>;
}
