import ApproleSync from './approle-sync';
import {mocked} from 'ts-jest/utils';
import {bindVault, vsContainer} from '../inversify.config';

jest.mock('../inversify.config');

describe('approle sync command', () => {
  let stdoutSpy: jest.SpyInstance;
  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
  });

  afterEach(() => jest.restoreAllMocks());

  it('run without root', async () => {
    const mockVgcInstance = {
      sync: jest.fn(),
    };
    const mockBindVault = mocked(bindVault);
    const mockVsContainer = mocked(vsContainer);
    mockBindVault.mockReturnValue();
    mockVsContainer.get.mockReturnValue(mockVgcInstance);

    // Test command
    await ApproleSync.run(['--vault-addr', 'addr', '--vault-token', 'token']);

    expect(mockBindVault).toBeCalledTimes(1);
    expect(mockBindVault).toBeCalledWith('addr', 'token');
    expect(mockVgcInstance.sync).toHaveBeenCalled();
    expect(stdoutSpy).toHaveBeenCalledWith('Vault Approle Sync\n');
  });
});
