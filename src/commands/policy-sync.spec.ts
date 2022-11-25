import PolicySync from './policy-sync';
import {bindVault, vsContainer} from '../inversify.config';

jest.mock('../inversify.config');

describe('policy sync command', () => {
  let stdoutSpy: jest.SpyInstance;
  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
  });

  afterEach(() => jest.restoreAllMocks());

  it('run without root', async () => {
    const mockVpcInstance = {
      sync: jest.fn(),
    };
    const mockBindVault = jest.mocked(bindVault);
    const mockVsContainer = jest.mocked(vsContainer);
    mockBindVault.mockReturnValue();
    mockVsContainer.get.mockReturnValue(mockVpcInstance);

    // Test command
    await PolicySync.run(['--vault-addr', 'addr', '--vault-token', 'token']);

    expect(mockBindVault).toHaveBeenCalledTimes(1);
    expect(mockBindVault).toHaveBeenCalledWith('addr', 'token');
    expect(mockVpcInstance.sync).toHaveBeenCalled();
    expect(mockVpcInstance.sync).toHaveBeenCalledWith([]);
    expect(stdoutSpy).toHaveBeenCalledWith('Vault Policy Sync\n');
  });
});
