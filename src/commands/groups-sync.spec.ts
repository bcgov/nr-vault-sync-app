import GroupsSync from './groups-sync';
import {mocked} from 'ts-jest/utils';
import {bindKeycloak, bindVault, vsContainer} from '../inversify.config';

jest.mock('../inversify.config');

describe('groups sync command', () => {
  afterEach(() => jest.restoreAllMocks());

  it('runs', async () => {
    const mockKcInstance = {
      syncRolesAndGroups: jest.fn(),
    };
    const mockBindVault = mocked(bindVault);
    mockBindVault.mockReturnValue();
    const mockBindKeycloak = mocked(bindKeycloak);
    mockBindKeycloak.mockResolvedValue();

    const mockVsContainer = mocked(vsContainer);
    mockVsContainer.get.mockReturnValue(mockKcInstance);

    // Test command
    await GroupsSync.run([
      './inputs/test.json',
      '--vault-addr', 'vaddr',
      '--vault-token', 'token',
      '--keycloak-addr', 'kaddr',
      '--keycloak-username', 'user',
      '--keycloak-password', 'pass'],
    );

    expect(mockBindVault).toBeCalledTimes(1);
    expect(mockBindVault).toBeCalledWith('vaddr', 'token');

    expect(mockBindKeycloak).toBeCalledTimes(1);
    expect(mockBindKeycloak).toBeCalledWith('kaddr', 'user', 'pass');

    expect(mockKcInstance.syncRolesAndGroups).toBeCalledTimes(1);
  });
});
