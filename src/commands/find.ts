import 'reflect-metadata';
import { Command } from '@oclif/core';
import { vaultFactory } from '../vault/vault.factory';
import { help, vaultAddr, vaultToken } from '../flags';
import nv from 'node-vault';

/**
 * Vault recursive kv data find command
 */
export default class Find extends Command {
  static description = 'Find Vault creds';

  static flags = {
    ...help,
    ...vaultToken,
    ...vaultAddr,
  };

  vault!: nv.client;

  /**
   * Run the command
   */
  async run(): Promise<void> {
    const { flags } = await this.parse(Find);
    const vault = vaultFactory(flags['vault-addr'], flags['vault-token']);
    this.vault = vault;

    this.log(`Vault find - ${vault.endpoint}`);

    this.findValue('/apps', 'dev');

    this.log(JSON.stringify(await vault.health(), undefined, 2));
  }

  async findValue(mount: string, path: string, recurse = true) {
    if (recurse) {
      try {
        const list = await this.vault.request({
          method: 'LIST',
          path: `${mount}/metadata/${path}`,
        });
        // console.log(list.data);
        for (const subpath of list.data.keys) {
          // console.log(subpath);
          // console.log(`${path}/${subpath}`);
          if (subpath.endsWith('/')) {
            await this.findValue(mount, `${path}/${subpath.slice(0, -1)}`);
          } else {
            await this.findValue(mount, `${path}/${subpath}`, false);
          }
        }
      } catch (e) {
        // console.log(e);
        console.log('No subpath: ' + `vault list ${mount}/metadata/${path}`);
      }
    }

    try {
      const data = await this.vault.read(`${mount}/subkeys/${path}`);
      console.log(`${mount}/subkeys/${path}`);
      console.log(data.data);
    } catch (e) {
      // console.log(e);
      console.log('No subkeys: ' + `vault read ${mount}/subkeys/${path}`);
    }
  }
}
