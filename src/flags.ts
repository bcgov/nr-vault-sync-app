import {flags} from '@oclif/command';

export const help = {
  help: flags.help({char: 'h'}),
};

export const secretShares = {
  'secret-shares': flags.integer({
    description: 'The number of shares to split the master key into',
    default: 1,
  })};

export const secretThreshold = {
  'secret-threshold': flags.integer({
    description: 'The number of shares required to reconstruct the master key',
    default: 1,
  })};

export const vaultAddr = {
  'vault-addr': flags.string({
    default: 'http://127.0.0.1:8200',
    description: 'The vault address',
    env: 'VAULT_ADDR',
  })};

export const vaultToken = {
  'vault-token': flags.string({
    default: 'myroot',
    description: 'The vault token',
    env: 'VAULT_TOKEN',
  })};

export const root = {
  'root': flags.string({
    multiple: true,
    default: [],
    description: 'The root to constrict policy sync to. ' +
      'This can be set multiple times to further constrict such as -root=apps -root=cool-app-war',
    env: 'POLICY_ROOT',
  })};

export const keycloakAddr = {
  'keycloak-addr': flags.string({
    default: 'http://127.0.0.1:8080/auth',
    description: 'The keycloak address',
    env: 'KEYCLOAK_ADDR',
  })};

export const keycloakUsername = {
  'keycloak-username': flags.string({
    default: 'admin',
    description: 'The keycloak username',
    env: 'KEYCLOAK_USER',
  }),
};

export const keycloakPassword = {
  'keycloak-password': flags.string({
    default: 'password',
    description: 'The keycloak password',
    env: 'KEYCLOAK_PASS',
  }),
};
