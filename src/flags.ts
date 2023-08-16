import { flags } from '@oclif/command';

export const help = {
  help: flags.help({ char: 'h' }),
};

export const brokerApiUrl = {
  'broker-api-url': flags.string({
    default: 'https://nr-broker.apps.silver.devops.gov.bc.ca/',
    description: 'The broker api base url',
    env: 'BROKER_API_URL',
  }),
};

export const brokerToken = {
  'broker-token': flags.string({
    required: false,
    description: 'The broker JWT',
    env: 'BROKER_TOKEN',
  }),
};

export const secretShares = {
  'secret-shares': flags.integer({
    description: 'The number of shares to split the master key into',
    default: 1,
  }),
};

export const secretThreshold = {
  'secret-threshold': flags.integer({
    description: 'The number of shares required to reconstruct the master key',
    default: 1,
  }),
};

export const vaultAddr = {
  'vault-addr': flags.string({
    default: 'http://127.0.0.1:8200',
    description: 'The vault address',
    env: 'VAULT_ADDR',
  }),
};

export const vaultToken = {
  'vault-token': flags.string({
    default: 'myroot',
    description: 'The vault token',
    env: 'VAULT_TOKEN',
  }),
};

export const root = {
  root: flags.string({
    multiple: true,
    default: [],
    description:
      'The root to constrict the policy sync to. ' +
      'Some roots can be further constricted such as -root=apps -root=cool-app-war ',
    env: 'POLICY_ROOT',
  }),
};
