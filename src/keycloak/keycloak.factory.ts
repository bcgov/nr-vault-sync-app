import KeycloakAdminClient from 'keycloak-admin';

let keycloak: KeycloakAdminClient;
let keycloakAuthPromise: Promise<any>;

/**
 * Keycloak api factory
 * @param keycloakAddr The keycloak server address
 * @param keycloakUsername The keycloak username
 * @param keycloakPassword The keycloak password
 */
export async function keycloakFactory(
  keycloakAddr: string,
  keycloakUsername: string,
  keycloakPassword: string): Promise<KeycloakAdminClient> {
  if (!keycloakAuthPromise) {
    keycloak = new KeycloakAdminClient({baseUrl: keycloakAddr});

    keycloakAuthPromise = keycloak.auth({
      username: keycloakUsername,
      password: keycloakPassword,
      grantType: 'password',
      clientId: 'admin-cli',
    });
  }
  await keycloakAuthPromise;
  return keycloak;
}
