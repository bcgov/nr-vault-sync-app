// eslint-disable-next-line no-unused-vars
import nv from 'node-vault';
import Init from './init';
import {vaultFactory} from '../vault/vault.factory';

jest.mock('../vault/vault.factory');

describe('init command', () => {
  let stdoutSpy: any;
  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
  });

  afterEach(() => jest.restoreAllMocks());

  it('does not run when initialized', async () => {
    const mockVaultFactory = vaultFactory as jest.MockedFunction<typeof vaultFactory>;
    mockVaultFactory.mockImplementation(() => ({
      endpoint: 'endpoint',
      health: jest.fn().mockReturnValue({initialized: true, version: 'best'}),
    }) as unknown as nv.client);

    // Test command
    await Init.run(['--vault-addr', 'addr', '--vault-token', 'token']);

    expect(vaultFactory).toBeCalledTimes(1);
    expect(vaultFactory).toBeCalledWith('addr', 'token');
    expect(stdoutSpy).toHaveBeenCalledWith('Init vault - endpoint (best)\n');
    expect(stdoutSpy).toHaveBeenCalledWith('Already initialized. No action taken.\n');
  });
});
