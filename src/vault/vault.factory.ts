import nv from 'node-vault';

let vault: nv.client;

/**
 * Vault api factory
 * @param vaultAddr The vault server address
 * @param vaultToken The vault access token
 */
export function vaultFactory(vaultAddr: string, vaultToken: string): nv.client {
  if (!vault) {
    vault = nv({
      apiVersion: 'v1',
      endpoint: vaultAddr.replace(/\/$/, ""),
      token: vaultToken,
    });
  }
  return vault;
}
