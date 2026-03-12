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
import VaultGroupController from '../vault/vault-group.controller';
import { bindBroker, bindVault, vsContainer } from '../inversify.config';
import { TYPES } from '../inversify.types';

/**
 * Group sync command
 */
export default class GroupSync extends Command {
  static description =
    'Syncs external groups in Vault to connect roles with Vault policies';

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
    const { flags } = await this.parse(GroupSync);

    this.log('Vault Group Sync');

    bindVault(flags['vault-addr'], await resolveVaultToken(flags));
    bindBroker(flags['broker-api-url'], flags['broker-token']);

    await vsContainer
      .get<VaultGroupController>(TYPES.VaultGroupController)
      .sync();
  }
}
