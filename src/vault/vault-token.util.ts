import * as fs from 'fs';
import nv from 'node-vault';

interface settings {
  'vault-token'?: string;
  'vault-token-file'?: string;
  'vault-token-unwrap'?: boolean;
  'vault-addr': string;
}

/**
 * Resolve the vault token from either a file or a direct value.
 * The file takes precedence if provided.
 * @param token The token value from the flag/env
 * @param tokenFile The path to a file containing the token
 */
export async function resolveVaultToken(flags: settings): Promise<string> {
  let token = flags['vault-token'];

  if (flags['vault-token-file']) {
    token = fs.readFileSync(flags['vault-token-file'], 'utf8').trim();
  }

  if (!token) {
    throw new Error('Vault token is required');
  }

  if (flags['vault-token-unwrap']) {
    token = await unwrapVaultToken(flags['vault-addr'], token);
  }
  return token;
}

/**
 * Unwrap a wrapped vault token.
 * @param vaultAddr The vault server address
 * @param wrappedToken The wrapped token to unwrap
 */
async function unwrapVaultToken(
  vaultAddr: string,
  wrappedToken: string,
): Promise<string> {
  const tempVault = nv({
    apiVersion: 'v1',
    endpoint: vaultAddr.replace(/\/$/, ''),
    token: wrappedToken,
  });
  const result = await tempVault.write('sys/wrapping/unwrap', {});
  return result.auth.client_token;
}
