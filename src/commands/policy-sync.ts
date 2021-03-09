import {Command} from '@oclif/command';
import 'reflect-metadata';
import {help, vaultAddr, vaultToken} from '../flags';
import VaultPolicyController from '../vault/vault-policy.controller';
import {bindVault, vsContainer} from '../inversify.config';
import {TYPES} from '../inversify.types';

/**
 * Policy sync command
 */
export default class PolicySync extends Command {
  static description = 'Syncs configured policies to Vault';

  static flags = {
    ...help,
    ...vaultToken,
    ...vaultAddr,
  };

  /**
   * Run the command
   */
  async run() {
    const {flags} = this.parse(PolicySync);
    this.log('Vault Policy Sync');
    bindVault(flags['vault-addr'], flags['vault-token']);

    await vsContainer.get<VaultPolicyController>(TYPES.VaultPolicyController).syncAll();
  }
}
