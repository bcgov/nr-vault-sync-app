import nv from 'node-vault';
import Init from './init';
import {vaultFactory} from '../vault/vault.factory';

jest.mock('../vault/vault.factory');

describe('init command', () => {
  let stdoutSpy: jest.SpyInstance;
  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
  });

  afterEach(() => jest.restoreAllMocks());

  it('does not run when initialized', async () => {
    const mockVaultFactory = jest.mocked(vaultFactory);
    mockVaultFactory.mockImplementation(() => ({
      endpoint: 'endpoint',
      health: jest.fn().mockReturnValue(Promise.resolve({initialized: true, version: 'best'})),
    }) as unknown as nv.client);

    // Test command
    await Init.run(['--vault-addr', 'addr', '--vault-token', 'token']);

    expect(vaultFactory).toHaveBeenCalledTimes(1);
    expect(vaultFactory).toHaveBeenCalledWith('addr', 'token');
    expect(stdoutSpy).toHaveBeenCalledWith('Init vault - endpoint (best)\n');
    expect(stdoutSpy).toHaveBeenCalledWith('Already initialized. No action taken.\n');
  });
});
