import ApproleSync from './approle-sync';
import { bindBroker, bindVault, vsContainer } from '../inversify.config';
import { resolveVaultToken } from '../vault/vault-token.util';

jest.mock('../inversify.config');
jest.mock('../vault/vault-token.util');

describe('approle sync command', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let stdoutSpy: jest.SpyInstance;
  beforeEach(() => {
    stdoutSpy = jest.spyOn(console, 'log').mockImplementation(() => true);
  });

  afterEach(() => jest.restoreAllMocks());

  it('run without root', async () => {
    const mockVgcInstance = {
      sync: jest.fn(),
    };
    const mockBindVault = jest.mocked(bindVault);
    const mockBindBroker = jest.mocked(bindBroker);
    const mockVsContainer = jest.mocked(vsContainer);
    const mockResolveVaultToken = jest.mocked(resolveVaultToken);
    mockResolveVaultToken.mockResolvedValue('token');
    mockBindVault.mockReturnValue();
    mockBindBroker.mockReturnValue();
    mockVsContainer.get.mockReturnValue(mockVgcInstance);

    // Test command
    await ApproleSync.run(['--vault-addr', 'addr', '--vault-token', 'token']);

    expect(mockResolveVaultToken).toHaveBeenCalledTimes(1);
    expect(mockBindVault).toHaveBeenCalledTimes(1);
    expect(mockBindVault).toHaveBeenCalledWith('addr', 'token');
    expect(mockVgcInstance.sync).toHaveBeenCalled();
  });
});
