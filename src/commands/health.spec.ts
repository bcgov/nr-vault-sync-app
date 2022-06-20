import nv from 'node-vault';
import Health from './health';
import {vaultFactory} from '../vault/vault.factory';

jest.mock('../vault/vault.factory');

describe('health command', () => {
  let stdoutSpy: jest.SpyInstance;
  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
  });

  afterEach(() => jest.restoreAllMocks());

  it('run', async () => {
    const mockVaultFactory = jest.mocked(vaultFactory);
    mockVaultFactory.mockImplementation(() => ({
      endpoint: 'endpoint',
      health: jest.fn().mockReturnValue({}),
    }) as unknown as nv.client);

    // Test command
    await Health.run(['--vault-addr', 'addr', '--vault-token', 'token']);

    expect(vaultFactory).toBeCalledTimes(1);
    expect(vaultFactory).toBeCalledWith('addr', 'token');
    expect(stdoutSpy).toHaveBeenCalledWith('Vault health - endpoint\n');
    expect(stdoutSpy).toHaveBeenCalledWith('{}\n');
  });
});
