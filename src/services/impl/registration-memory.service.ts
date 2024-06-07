import winston from 'winston';
import * as crypto from 'crypto';
import { TYPES } from '../../inversify.types';
import { inject, injectable } from 'inversify';
import { RegistrationService } from '../registration.service';

interface RegistrationEntry {
  hash: string;
  used: boolean;
}
interface RegestrationMap {
  [key: string]: RegistrationEntry;
}

@injectable()
/**
 * Service to determine if unregistered policies exist in the Vault instance
 */
export class RegistrationMemoryService implements RegistrationService {
  private registrationDb: RegestrationMap = {};

  /**
   * Constructor
   * @param vault The vault client to use
   */
  constructor(@inject(TYPES.Logger) private logger: winston.Logger) {}

  /**
   * Register as active
   * @param name The name
   */
  register(name: string, value: string): Promise<void> {
    this.registrationDb[name] = { hash: this.hashValue(value), used: true };
    return Promise.resolve();
  }

  /**
   * Registers a group of policies as active
   * @param policyNames The names of policies to register
   */
  async registerMany(regTuples: [string, string][]): Promise<void> {
    for (const tuple of regTuples) {
      await this.register(...tuple);
    }
  }

  /**
   * Returns if the name has been registered this run
   * @param name The name to check
   */
  async isActive(name: string): Promise<boolean> {
    return Promise.resolve(name in this.registrationDb);
  }

  /**
   * Returns if the name has the same value registered.
   * @param name The name to check
   * @param value The value to check
   */
  isSameValue(name: string, value: string): Promise<boolean> {
    return Promise.resolve(
      this.registrationDb[name]?.hash === this.hashValue(value),
    );
  }

  /**
   * Set registration as used
   */
  async setUsed(name: string): Promise<void> {
    if (this.registrationDb[name]) {
      this.registrationDb[name].used = true;
    }
    return Promise.resolve();
  }

  /**
   * Clear all registrations to prepare for next run
   */
  async clear(): Promise<void> {
    for (const key of Object.keys(this.registrationDb)) {
      this.registrationDb[key].used = false;
    }
    return Promise.resolve();
  }

  /**
   * Return the names that were not registered. If the service does
   * not support partial registration, it will throw an error.
   * @param names The names to compare against register
   * @param partialRegistration True if the caller did not register everything
   */
  async filterNamesForUnregistered(
    names: string[],
    partialRegistration: boolean,
  ): Promise<string[]> {
    if (partialRegistration) {
      this.logger.error('Partial not supported');
      throw new Error('Partial not supported');
    }

    return Promise.resolve(
      names.filter(
        (name: string) =>
          !(name in this.registrationDb) ||
          this.registrationDb[name].used === false,
      ),
    );
  }

  private hashValue(value: string): string {
    return crypto.createHash('md5').update(value).digest('hex');
  }
}
