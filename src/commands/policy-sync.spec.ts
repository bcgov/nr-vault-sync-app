import 'reflect-metadata';
import PolicySync from './policy-sync';
import {mocked} from 'ts-jest/utils';
import {bindVault, vsContainer} from '../inversify.config';

jest.mock('../inversify.config');

describe('policy sync command', () => {
  let stdoutSpy: any;
  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
  });

  afterEach(() => jest.restoreAllMocks());

  it('run', async () => {
    const mockVpcInstance = {
      syncAll: jest.fn(),
    };
    const mockBindVault = mocked(bindVault);
    const mockVsContainer = mocked(vsContainer);
    mockBindVault.mockReturnValue();
    mockVsContainer.get.mockReturnValue(mockVpcInstance);

    // Test command
    await PolicySync.run(['--vault-addr', 'addr', '--vault-token', 'token']);

    expect(mockBindVault).toBeCalledTimes(1);
    expect(mockBindVault).toBeCalledWith('addr', 'token');
    expect(mockVpcInstance.syncAll).toHaveBeenCalled();
    expect(stdoutSpy).toHaveBeenCalledWith('Vault Policy Sync\n');
  });
});
