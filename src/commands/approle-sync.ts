import 'reflect-metadata';
import { Command } from '@oclif/core';
import {
  brokerApiUrl,
  brokerToken,
  help,
  vaultAddr,
  vaultToken,
  vaultTokenFile,
  vaultTokenUnwrap,
} from '../flags';
import { resolveVaultToken } from '../vault/vault-token.util';
import { bindBroker, bindVault, vsContainer } from '../inversify.config';
import { TYPES } from '../inversify.types';
import VaultApproleController from '../vault/vault-approle.controller';

/**
 * Approle sync command
 */
export default class ApproleSync extends Command {
  static description = 'Syncs approles in Vault';

  static flags = {
    ...help,
    ...brokerApiUrl,
    ...brokerToken,
    ...vaultToken,
    ...vaultTokenFile,
    ...vaultTokenUnwrap,
    ...vaultAddr,
  };

  /**
   * Run the command
   */
  async run(): Promise<void> {
    const { flags } = await this.parse(ApproleSync);

    bindVault(flags['vault-addr'], await resolveVaultToken(flags));
    bindBroker(flags['broker-api-url'], flags['broker-token']);

    await vsContainer
      .get<VaultApproleController>(TYPES.VaultApproleController)
      .sync();
  }
}
