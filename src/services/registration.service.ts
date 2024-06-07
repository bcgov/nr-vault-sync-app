/**
 * Service to register named values
 */
export interface RegistrationService {
  /**
   * Register as active
   * @param name The name
   */
  register(name: string, value: string): Promise<void>;

  /**
   * Registers all name/value tuples as active
   * @param regTuples The name/value tuples to register
   */
  registerMany(regTuples: [string, string][]): Promise<void>;

  /**
   * Returns if the name has been registered this run
   * @param name The name to check
   */
  isActive(name: string): Promise<boolean>;

  /**
   * Returns if the name has the same value registered. Any run (including this one)
   * may have set this.
   * @param name The name to check
   * @param value The value to check
   */
  isSameValue(name: string, value: string): Promise<boolean>;

  /**
   * Set registration as used
   */
  setUsed(name: string): Promise<void>;

  /**
   * Clear all registrations to prepare for next run
   */
  clear(): Promise<void>;

  /**
   * Return the names that were not registered. If the service does
   * not support partial registration, it will throw an error.
   * @param names The names to compare against register
   * @param partialRegistration True if the caller did not register everything
   */
  filterNamesForUnregistered(
    names: string[],
    partialRegistration: boolean,
  ): Promise<string[]>;
}
