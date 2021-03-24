import 'reflect-metadata';
import GroupSync from './group-sync';
import {mocked} from 'ts-jest/utils';
import {bindVault, vsContainer} from '../inversify.config';

jest.mock('../inversify.config');

describe('group sync command', () => {
  let stdoutSpy: any;
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
    await GroupSync.run(['--vault-addr', 'addr', '--vault-token', 'token']);

    expect(mockBindVault).toBeCalledTimes(1);
    expect(mockBindVault).toBeCalledWith('addr', 'token');
    expect(mockVgcInstance.sync).toHaveBeenCalled();
    expect(stdoutSpy).toHaveBeenCalledWith('Vault Group Sync\n');
  });
});
