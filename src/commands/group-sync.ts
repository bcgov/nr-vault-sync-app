import {Command} from '@oclif/command';
import 'reflect-metadata';
import {help, vaultAddr, vaultToken} from '../flags';
import VaultGroupController from '../vault/vault-group.controller';
import {bindVault, vsContainer} from '../inversify.config';
import {TYPES} from '../inversify.types';

/**
 * Group sync command
 */
export default class GroupSync extends Command {
  static description = 'Syncs configured groups to Vault';

  static flags = {
    ...help,
    ...vaultToken,
    ...vaultAddr,
  };

  static args = [{name: 'file'}]

  /**
   * Run the command
   */
  async run() {
    const {flags} = this.parse(GroupSync);

    this.log('Vault Group Sync');
    bindVault(flags['vault-addr'], flags['vault-token']);

    await vsContainer.get<VaultGroupController>(TYPES.VaultGroupController).sync();
  }
}
