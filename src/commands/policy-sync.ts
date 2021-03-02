import {Command} from '@oclif/command';
import {help} from '../flags';

/**
 * Policy sync command
 */
export default class PolicySync extends Command {
  static description = 'Syncs configured policies to Vault';

  static flags = {
    ...help,
  };

  /**
   * Run the command
   */
  async run() {
    // const {args, flags} = this.parse(PolicySync);
    this.log(`TBD`);
  }
}
