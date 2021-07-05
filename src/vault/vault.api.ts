import {inject, injectable} from 'inversify';
import nv from 'node-vault';
import winston from 'winston';
import {TYPES} from '../inversify.types';

interface VaultAuthData {
  [key: string]: {
    type: string;
    accessor: string;
  }
}
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- No typing avialable
        for (const value of Object.values(response.data as VaultAuthData)) {
          if (value.type === 'oidc') {
            return value.accessor;
          }
        }
        this.logger.error(`Cannot find an OIDC auth type - is your Vault configured correctly?`);
        throw new Error('No OIDC configured');
      })
      .catch((error) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- No typing avialable
        if (error.response) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- No typing avialable
          const code = error.response.statusCode as number;
          this.logger.error(
            `Could not lookup accessor in Vault: Error ${code}`);
          throw new Error('Could not lookup accessor');
        }
        throw error;
      });
  }
}
