import {Command} from '@oclif/command';
import {vaultFactory} from '../api/api.factory';
import {help, vaultAddr, vaultToken} from '../flags';

/**
 * Vault health check command
 */
export default class Health extends Command {
  static description = 'Display Vault health';

  static flags = {
    ...help,
    ...vaultToken,
    ...vaultAddr,
  };

  /**
   * Run the command
   */
  async run() {
    const {flags} = this.parse(Health);
    const vault = vaultFactory(flags['vault-addr'], flags['vault-token']);

    this.log(`Vault health - ${vault.endpoint}`);
    this.log(JSON.stringify(await vault.health(), undefined, 2));
  }
}
