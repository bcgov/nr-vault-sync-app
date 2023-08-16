import 'reflect-metadata';
import { Command } from '@oclif/command';
import {
  brokerApiUrl,
  brokerToken,
  help,
  vaultAddr,
  vaultToken,
} from '../flags';
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
    ...vaultAddr,
  };

  /**
   * Run the command
   */
  async run(): Promise<void> {
    const { flags } = this.parse(GroupSync);

    this.log('Vault Group Sync');
    bindVault(flags['vault-addr'], flags['vault-token']);
    bindBroker(flags['broker-api-url'], flags['broker-token']);

    await vsContainer
      .get<VaultGroupController>(TYPES.VaultGroupController)
      .sync();
  }
}
