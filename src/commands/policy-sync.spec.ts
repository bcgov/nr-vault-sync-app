// eslint-disable-next-line no-unused-vars
import nv from 'node-vault';
import PolicySync from './policy-sync';
import {vaultFactory} from '../vault/vault.factory';

jest.mock('../vault/vault.factory');

describe('policy sync command', () => {
  let stdoutSpy: any;
  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
  });

  afterEach(() => jest.restoreAllMocks());

  it('run', async () => {
    const mockVaultFactory = vaultFactory as jest.MockedFunction<typeof vaultFactory>;
    mockVaultFactory.mockImplementation(() => ({
      endpoint: 'endpoint',
      health: jest.fn().mockReturnValue({}),
    }) as unknown as nv.client);

    // Test command
    await PolicySync.run(['--vault-addr', 'addr', '--vault-token', 'token']);

    expect(stdoutSpy).toHaveBeenCalledWith('TBD\n');
  });
});
