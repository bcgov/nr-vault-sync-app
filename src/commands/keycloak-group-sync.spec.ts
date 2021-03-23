import 'reflect-metadata';
import KeycloakGroupSync from './keycloak-group-sync';
import {mocked} from 'ts-jest/utils';
import {bindKeycloak, bindVault, vsContainer} from '../inversify.config';

jest.mock('../inversify.config');

describe('group sync command', () => {
  let stdoutSpy: any;
  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
  });
  afterEach(() => jest.restoreAllMocks());

  it('runs', async () => {
    const mockKcInstance = {
      syncRoleAndGroup: jest.fn().mockResolvedValue('bob'),
    };
    const mockBindVault = mocked(bindVault);
    mockBindVault.mockReturnValue();

    const mockBindKeycloak = mocked(bindKeycloak);
    mockBindKeycloak.mockResolvedValue();

    const mockVsContainer = mocked(vsContainer);
    mockVsContainer.get.mockReturnValueOnce(mockKcInstance);

    // Test command
    await KeycloakGroupSync.run([
      'group-name',
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
    expect(mockKcInstance.syncRoleAndGroup).toBeCalledTimes(1);
    expect(mockKcInstance.syncRoleAndGroup).toBeCalledWith('group-name');

    expect(stdoutSpy).toHaveBeenCalledWith('Creating group \'group-name\' in Keycloak and in Vault.\n');
  });
});
