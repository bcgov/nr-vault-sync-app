import { Flags } from '@oclif/core';

export const help = {
  help: Flags.help({ char: 'h' }),
};

export const brokerApiUrl = {
  'broker-api-url': Flags.string({
    default: 'https://nr-broker.apps.silver.devops.gov.bc.ca/',
    description: 'The broker api base url',
    env: 'BROKER_API_URL',
  }),
};

export const brokerToken = {
  'broker-token': Flags.string({
    required: false,
    description: 'The broker JWT',
    env: 'BROKER_TOKEN',
  }),
};

export const secretShares = {
  'secret-shares': Flags.integer({
    description: 'The number of shares to split the master key into',
    default: 1,
  }),
};

export const secretThreshold = {
  'secret-threshold': Flags.integer({
    description: 'The number of shares required to reconstruct the master key',
    default: 1,
  }),
};

export const vaultAddr = {
  'vault-addr': Flags.string({
    default: 'http://127.0.0.1:8200',
    description: 'The vault address',
    env: 'VAULT_ADDR',
  }),
};

export const vaultToken = {
  'vault-token': Flags.string({
    default: 'myroot',
    description: 'The vault token',
    env: 'VAULT_TOKEN',
  }),
};

export const root = {
  root: Flags.string({
    multiple: true,
    default: [],
    description:
      'The root to constrict the policy sync to. ' +
      'Some roots can be further constricted such as -root=apps -root=cool-app-war ',
    env: 'POLICY_ROOT',
  }),
};
