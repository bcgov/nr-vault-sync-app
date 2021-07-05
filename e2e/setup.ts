import nv from 'node-vault';

/**
 * Unseals the vault instance
 * @param vault The vault client
 * @param key The unseal key
 */
export async function unseal(vault: nv.client, key: string): Promise<void> {
  await vault.unseal({key});
}
