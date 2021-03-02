import {Command} from '@oclif/command';
import {vaultFactory} from '../api/api.factory';
import {help, vaultAddr, vaultToken} from '../flags';
import {PolicySyncController} from '../policy-sync/policy-sync.controller';

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
    const vault = vaultFactory(flags['vault-addr'], flags['vault-token']);
    const policySyncController = new PolicySyncController(vault);
    this.log('TBD');
    policySyncController.syncAll('TBD');
  }
}
