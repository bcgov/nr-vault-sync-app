import * as fs from 'fs';
import nv from 'node-vault';

interface settings {
  'vault-token'?: string;
  'vault-token-file'?: string;
  'vault-token-unwrap'?: boolean;
  'vault-addr': string;
  'vault-role-id'?: string;
  'vault-secret-id'?: string;
  'vault-approle-path'?: string;
}

/**
 * Resolve the vault token from either a file, direct value, or AppRole authentication.
 *
 * Priority order:
 * 1. If vault-role-id, vault-secret-id, and vault-approle-path are all set, authenticate via AppRole
 * 2. If vault-token-file is set, read token from file (file takes precedence)
 * 3. Otherwise use the direct vault-token value
 *
 * @param flags The flags object containing vault configuration
 */
export async function resolveVaultToken(flags: settings): Promise<string> {
  // If all three AppRole credentials are provided, authenticate via AppRole
  if (
    flags['vault-role-id'] &&
    flags['vault-secret-id'] &&
    flags['vault-approle-path']
  ) {
    return await authenticateWithApprole(
      flags['vault-addr'],
      flags['vault-approle-path'],
      flags['vault-role-id'],
      flags['vault-secret-id'],
    );
  }

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

/**
 * Authenticate with Vault using AppRole credentials.
 * @param vaultAddr The vault server address
 * @param approlePath The AppRole auth mount path
 * @param roleId The role ID for authentication
 * @param secretId The secret ID for authentication
 * @returns The client token after successful authentication
 */
async function authenticateWithApprole(
  vaultAddr: string,
  approlePath: string,
  roleId: string,
  secretId: string,
): Promise<string> {
  const tempVault = nv({
    apiVersion: 'v1',
    endpoint: vaultAddr.replace(/\/$/, ''),
  });
  const result = await tempVault.write(`auth/${approlePath}/login`, {
    role_id: roleId,
    secret_id: secretId,
  });
  return result.auth.client_token;
}
