import nv from 'node-vault';
import 'reflect-metadata';
import PolicySync from './policy-sync';
import {vaultFactory} from '../vault/vault.factory';
import VaultPolicyController from '../vault/vault-policy.controller';
import {mocked} from 'ts-jest/utils';
import {decorate, injectable} from 'inversify';

decorate(injectable(), VaultPolicyController);

jest.mock('../vault/vault-policy.controller');
jest.mock('../vault/vault.factory');

describe('policy sync command', () => {
  let stdoutSpy: any;
  beforeEach(() => {
    mocked(VaultPolicyController).mockClear();
    stdoutSpy = jest.spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
  });

  afterEach(() => jest.restoreAllMocks());

  it('run', async () => {
    const mockVaultFactory = mocked(vaultFactory);
    mockVaultFactory.mockImplementation(() => ({
      endpoint: 'endpoint',
      health: jest.fn().mockReturnValue({}),
    }) as unknown as nv.client);


    // Test command
    await PolicySync.run(['--vault-addr', 'addr', '--vault-token', 'token']);
    const vpcInstance = mocked(VaultPolicyController).mock.instances[0];

    expect(vpcInstance.syncAll).toHaveBeenCalled();
    expect(stdoutSpy).toHaveBeenCalledWith('Vault Policy Sync\n');
  });
});
