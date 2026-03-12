import 'reflect-metadata';
import { Command } from '@oclif/core';
import {
  brokerApiUrl,
  brokerToken,
  help,
  root,
  vaultAddr,
  vaultToken,
  vaultTokenFile,
  vaultTokenUnwrap,
} from '../flags';
import { resolveVaultToken } from '../vault/vault-token.util';
import VaultPolicyController from '../vault/vault-policy.controller';
import { bindBroker, bindVault, vsContainer } from '../inversify.config';
import { TYPES } from '../inversify.types';

/**
 * Policy sync command
 */
export default class PolicySync extends Command {
  static description = 'Syncs policies to Vault';

  static flags = {
    ...help,
    ...brokerApiUrl,
    ...brokerToken,
    ...vaultToken,
    ...vaultTokenFile,
    ...vaultTokenUnwrap,
    ...vaultAddr,
    ...root,
  };

  /**
   * Run the command
   */
  async run(): Promise<void> {
    const { flags } = await this.parse(PolicySync);
    this.log('Vault Policy Sync');

    bindVault(flags['vault-addr'], await resolveVaultToken(flags));
    bindBroker(flags['broker-api-url'], flags['broker-token']);

    await vsContainer
      .get<VaultPolicyController>(TYPES.VaultPolicyController)
      .sync(flags.root);
  }
}
