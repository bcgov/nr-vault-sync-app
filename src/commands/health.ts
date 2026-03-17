import 'reflect-metadata';
import { Command } from '@oclif/core';
import { vaultFactory } from '../vault/vault.factory';
import {
  help,
  vaultAddr,
  vaultToken,
  vaultTokenFile,
  vaultTokenUnwrap,
} from '../flags';
import { resolveVaultToken } from '../vault/vault-token.util';

/**
 * Vault health check command
 */
export default class Health extends Command {
  static description = 'Display Vault health';

  static flags = {
    ...help,
    ...vaultToken,
    ...vaultTokenFile,
    ...vaultTokenUnwrap,
    ...vaultAddr,
  };

  /**
   * Run the command
   */
  async run(): Promise<void> {
    const { flags } = await this.parse(Health);

    const vault = vaultFactory(
      flags['vault-addr'],
      await resolveVaultToken(flags),
    );

    this.log(`Vault health - ${vault.endpoint}`);
    this.log(JSON.stringify(await vault.health(), undefined, 2));
  }
}
