import 'reflect-metadata';
import { Command } from '@oclif/core';
import nv from 'node-vault';
import {
  brokerApiUrl,
  brokerToken,
  help,
  monitorIntervalDuration,
  root,
  vaultAddr,
  vaultToken,
  vaultTokenFile,
  vaultTokenRenew,
  vaultTokenUnwrap,
} from '../flags';
import { bindVault, bindBroker, vsContainer } from '../inversify.config';
import { TYPES } from '../inversify.types';
import BrokerMonitorController from '../broker/broker-monitor.controller';
import { resolveVaultToken } from '../vault/vault-token.util';

/**
 * Monitor and sync on demand
 */
export default class Monitor extends Command {
  static description = 'Monitor for changes to sync to vault';

  static flags = {
    ...help,
    ...brokerApiUrl,
    ...brokerToken,
    ...monitorIntervalDuration,
    ...vaultToken,
    ...vaultTokenFile,
    ...vaultTokenUnwrap,
    ...vaultTokenRenew,
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

    bindVault(flags['vault-addr'], await resolveVaultToken(flags));
    bindBroker(flags['broker-api-url'], flags['broker-token']);

    await vsContainer
      .get<BrokerMonitorController>(TYPES.BrokerMonitorController)
      .monitor(
        flags.root,
        flags['monitor-interval'],
        flags['vault-token-renew'],
      );
  }
}
