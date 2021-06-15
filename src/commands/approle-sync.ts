import 'reflect-metadata';
import {Command} from '@oclif/command';
import {help, vaultAddr, vaultToken} from '../flags';
import {bindVault, vsContainer} from '../inversify.config';
import {TYPES} from '../inversify.types';
import VaultApproleController from '../vault/vault-approle.controller';

/**
 * Approle sync command
 */
export default class ApproleSync extends Command {
  static description = 'Syncs approles in Vault';

  static flags = {
    ...help,
    ...vaultToken,
    ...vaultAddr,
  };

  /**
   * Run the command
   */
  async run() {
    const {flags} = this.parse(ApproleSync);

    this.log('Vault Approle Sync');
    bindVault(flags['vault-addr'], flags['vault-token']);

    await vsContainer.get<VaultApproleController>(TYPES.VaultApproleController).sync();
  }
}
