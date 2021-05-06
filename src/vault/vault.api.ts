import {inject, injectable} from 'inversify';
import nv from 'node-vault';
import winston from 'winston';
import {TYPES} from '../inversify.types';

@injectable()
/**
 * Shared Vault APIs
 */
export default class VaultApi {
  /**
   * Constructor
   */
  constructor(
      @inject(TYPES.Vault) private vault: nv.client,
      @inject(TYPES.Logger) private logger: winston.Logger,
  ) {}

  /**
   * Get the accessor from Vault for the Keycloak (OIDC) instance.
   */
  public async getOidcAccessor(): Promise<string> {
    return this.vault.read(`/sys/auth`)
      .then((response) => {
        for (const value of Object.values(response.data) as any) {
          if (value.type === 'oidc') {
            return value.accessor;
          }
        }
        this.logger.error(`Cannot find an OIDC auth type - is your Vault configured correctly?`);
        throw new Error('No OIDC configured');
      })
      .catch((error) => {
        if (error.response) {
          this.logger.error(
            `Could not lookup accessor in Vault: Error ${error.response.statusCode}`);
          throw new Error('Could not lookup accessor');
        }
        throw error;
      });
  }
}
