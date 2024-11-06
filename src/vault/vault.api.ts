import { inject, injectable } from 'inversify';
import nv from 'node-vault';
import winston from 'winston';
import { BehaviorSubject, firstValueFrom, of, switchMap } from 'rxjs';
import { TYPES } from '../inversify.types';

interface VaultAuthData {
  [key: string]: {
    type: string;
    accessor: string;
  };
}
@injectable()
/**
 * Shared Vault APIs
 */
export default class VaultApi {
  private oidcAccessors$ = new BehaviorSubject<{
    timestamp: number;
    accessors: string[] | null;
  }>({ timestamp: 0, accessors: null });

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
  public async getOidcAccessors(): Promise<string[]> {
    const now = Date.now();
    return firstValueFrom(
      this.oidcAccessors$.pipe(
        switchMap((cache) => {
          // Check if the cache is valid (i.e., less than 10 seconds old)
          if (cache.accessors && now - cache.timestamp < 10000) {
            // console.log('Project Services from cache');
            return of(cache.accessors); // Return cached data
          } else {
            // console.log('Fetching new Project Services');
            // Make a new request if cache is expired or doesn't exist
            return this.requestOidcAccessors().then((accessors) => {
              // Update the cache -- Will trigger cache check which should pass
              this.oidcAccessors$.next({
                timestamp: Date.now(),
                accessors,
              });
              return accessors;
            });
          }
        }),
      ),
    );
  }

  private requestOidcAccessors() {
    return this.vault
      .read(`/sys/auth`)
      .then((response) => {
        const accessors = Object.entries(response.data as VaultAuthData)
          .filter(([key, value]) => key === 'oidc/' && value.type === 'oidc')
          .map(([, value]) => value.accessor);
        if (accessors.length > 0) {
          return accessors;
        }
        this.logger.error(
          `Cannot find an OIDC auth type - is your Vault configured correctly?`,
        );
        throw new Error('No OIDC configured');
      })
      .catch((error) => {
        if (error.response) {
          const code = error.response.statusCode as number;
          this.logger.error(
            `Could not lookup accessor in Vault: Error ${code}`,
          );
          throw new Error('Could not lookup accessor');
        }
        throw error;
      });
  }
}
