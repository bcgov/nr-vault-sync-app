import KeycloakAdminClient from 'keycloak-admin';

let keycloak: KeycloakAdminClient;

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
