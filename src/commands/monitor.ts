import 'reflect-metadata';
import { Command } from '@oclif/core';
import nv from 'node-vault';
import {
  brokerApiUrl,
  brokerToken,
  help,
  root,
  vaultAddr,
  vaultToken,
} from '../flags';
import { bindVault, bindBroker, vsContainer } from '../inversify.config';
import { TYPES } from '../inversify.types';
import BrokerMonitorController from '../broker/broker-monitor.controller';

/**
 * Monitor and sync on demand
 */
export default class Monitor extends Command {
  static description = 'Monitor for changes to sync to vault';

  static flags = {
    ...help,
    ...brokerApiUrl,
    ...brokerToken,
    ...vaultToken,
    ...vaultAddr,
    ...root,
  };

  vault!: nv.client;

  /**
   * Run the command
   */
  async run(): Promise<void> {
    const { flags } = await this.parse(Monitor);

    this.log('Vault Monitered Sync');
    bindVault(flags['vault-addr'], flags['vault-token']);
    bindBroker(flags['broker-api-url'], flags['broker-token']);

    await vsContainer
      .get<BrokerMonitorController>(TYPES.BrokerMonitorController)
      .monitor(flags.root);
  }
}
