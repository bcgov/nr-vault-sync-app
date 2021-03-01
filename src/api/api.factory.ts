import nv from 'node-vault';
import KeycloakAdminClient from 'keycloak-admin';

let vault: nv.client;
let keycloak: KeycloakAdminClient;

/**
 * Vault api factory
 * @param vaultAddr The vault server address
 * @param vaultToken The vault access token
 */
export function vaultFactory(vaultAddr: string, vaultToken: string): nv.client {
  if (!vault) {
    vault = nv({
      apiVersion: 'v1',
      endpoint: vaultAddr,
      token: vaultToken,
    });
  }
  return vault;
}

/**
 * Keycloak api factory
 * @param keycloakAddr The keycloak server address
 * @param keycloakUsername The keycloak username
 * @param keycloakPassword The keycloak password
 */
export async function keycloakFactory(keycloakAddr: string, keycloakUsername: string, keycloakPassword: string): kcAdminClient {
  if (!keycloak) {
    keycloak = new KeycloakAdminClient()

    await keycloak.auth({
      username: keycloakUsername,
      password: keycloakPassword,
      grantType: 'password',
      clientId: 'admin-cli',
    })
  }
  return keycloak;
}