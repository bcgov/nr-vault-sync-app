import winston from 'winston';
import 'reflect-metadata';
import {KeycloakRoleController} from './keycloak-role.controller';
import KeycloakAdminClient from 'keycloak-admin';
import VaultGroupController from '../vault/vault-group.controller';
import {GroupImportService} from '../services/group-import.service';

jest.mock('keycloak-admin');

const mockLogger = {
  info: jest.fn(() => { }),
  debug: jest.fn(() => { }),
  error: jest.fn(() => { }),
} as unknown as winston.Logger;

const mockVcInstance = {
  syncGroup: jest.fn().mockResolvedValue(void(0)),
} as unknown as VaultGroupController;

describe('keycloakrolecontroller.service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('syncRolesAndGroups: multi-import', async () => {
    const mockGroupImport = {
      getGroups: jest.fn().mockReturnValue(
        [{'name': 'Group1'}, {'name': 'Group2'}],
      )};
    const groupImportServices = [mockGroupImport];
    const mockKaClient = {} as unknown as KeycloakAdminClient;

    const krc = new KeycloakRoleController(mockKaClient, mockVcInstance, mockLogger, groupImportServices);
    const spySyncRolesAndGroups = jest.spyOn(krc, 'syncRoleAndGroup').mockResolvedValue();
    await krc.syncRolesAndGroups();

    expect(spySyncRolesAndGroups).toBeCalledWith('Group1');
    expect(spySyncRolesAndGroups).toBeCalledWith('Group2');
    expect(spySyncRolesAndGroups).toHaveBeenCalledTimes(2);
  });

  test('syncRoleAndGroup: singular import', async () => {
    const groupImportServices: GroupImportService[] = [];
    const mockRolesFind = jest.fn()
      .mockResolvedValueOnce({name: 'Group1', id: '1234'});
    const mockUsersFind = jest.fn().mockResolvedValue([]);
    const mockFindVaultClient = jest.fn().mockResolvedValue({id: 'vault'});
    const mockKaClient = {
      clients: {findRole: mockRolesFind, findOne: mockFindVaultClient},
      users: {find: mockUsersFind},
    } as unknown as KeycloakAdminClient;

    const krc = new KeycloakRoleController(mockKaClient, mockVcInstance, mockLogger, groupImportServices);
    // Mock out as not interesting for test other than it gets called.
    const spyEnsureVaultClient = jest.spyOn(KeycloakRoleController.prototype as any, 'ensureVaultClient')
      .mockResolvedValue(undefined);

    await krc.syncRoleAndGroup('group', ['username']);

    expect(spyEnsureVaultClient).toHaveBeenCalledTimes(1);
    expect(mockRolesFind).toHaveBeenCalledTimes(1);
    expect(mockUsersFind).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledTimes(4);
    expect(mockLogger.error).toHaveBeenCalledTimes(0);
  });

  test('role exists', async () => {
    const mockRolesFind = jest.fn().mockResolvedValue({name: 'existing', id: '1234'});
    const mockUsersFind = jest.fn().mockResolvedValue([]);
    const mockFindVaultClient = jest.fn().mockResolvedValue({id: 'vault'});
    const mockKaClient = {
      clients: {findRole: mockRolesFind, findOne: mockFindVaultClient},
      users: {find: mockUsersFind},
    } as unknown as KeycloakAdminClient;

    const krc = new KeycloakRoleController(mockKaClient, mockVcInstance, mockLogger, []);
    await krc.syncRoleAndGroup('existing');

    expect(mockRolesFind).toHaveBeenCalledTimes(1);
    expect(mockUsersFind).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledTimes(3);
    expect(mockLogger.info).toHaveBeenCalledWith(
      `Role existing already exists in Keycloak under the 'vault' client.`,
    );
    expect(mockLogger.error).toHaveBeenCalledTimes(0);
  });

  test('role does not exist in Keycloak', async () => {
    const mockRolesFind = jest.fn().mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({name: 'existing', id: '1234'});
    const mockRolesCreate = jest.fn().mockResolvedValue({id: 1234});
    const mockUsersFind = jest.fn().mockResolvedValue([]);
    const mockFindVaultClient = jest.fn().mockResolvedValue({id: 'vault'});
    const mockKaClient = {
      clients: {findRole: mockRolesFind, createRole: mockRolesCreate, findOne: mockFindVaultClient},
      users: {find: mockUsersFind},
    } as unknown as KeycloakAdminClient;

    const krc = new KeycloakRoleController(mockKaClient, mockVcInstance, mockLogger, []);
    await krc.syncRoleAndGroup('newrole');

    expect(mockRolesFind).toHaveBeenCalledTimes(2);
    expect(mockRolesCreate).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledTimes(3);
    expect(mockLogger.info).toHaveBeenCalledWith(`Role newrole created in Keycloak.`);
    expect(mockLogger.error).toHaveBeenCalledTimes(0);
  });

  test('role lookup in Keycloak fails', async () => {
    const mockRolesFind = jest.fn().mockRejectedValue({response: {statusCode: 999}});
    const mockKaClient = {
      clients: {findRole: mockRolesFind},
    } as unknown as KeycloakAdminClient;

    const krc = new KeycloakRoleController(mockKaClient, mockVcInstance, mockLogger, []);
    await expect(krc.syncRoleAndGroup('find-fails')).rejects.toThrow();

    expect(mockRolesFind).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledTimes(2);
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith(`Keycloak error syncing role find-fails: Error 999`);
  });

  test('role creation in Keycloak fails', async () => {
    const mockRolesFind = jest.fn().mockResolvedValue(void(0));
    const mockRolesCreate = jest.fn().mockRejectedValue({response: {statusCode: 999}});
    const mockFindVaultClient = jest.fn().mockResolvedValue({id: 'vault'});
    const mockKaClient = {
      clients: {findRole: mockRolesFind, createRole: mockRolesCreate, findOne: mockFindVaultClient},
    } as unknown as KeycloakAdminClient;

    const krc = new KeycloakRoleController(mockKaClient, mockVcInstance, mockLogger, []);
    await expect(krc.syncRoleAndGroup('newrole-fails')).rejects.toThrow();

    expect(mockRolesFind).toHaveBeenCalledTimes(1);
    expect(mockRolesCreate).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledTimes(2);
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith(
      `Keycloak error syncing role newrole-fails: Error 999`);
  });

  test('sync one user which exists', async () => {
    const mockRolesFind = jest.fn().mockResolvedValue({name: 'existing', id: '1234'});
    const mockUsersFind = jest.fn().mockResolvedValue([{'username': 'uname', 'id': 'u1234'}]);
    const mockAddClientRoleMappings = jest.fn().mockResolvedValue('');
    const mockFindVaultClient = jest.fn().mockResolvedValue({id: 'vault'});
    const mockKaClient = {
      clients: {findRole: mockRolesFind, findOne: mockFindVaultClient},
      users: {find: mockUsersFind, addClientRoleMappings: mockAddClientRoleMappings},
    } as unknown as KeycloakAdminClient;

    const krc = new KeycloakRoleController(mockKaClient, mockVcInstance, mockLogger, []);
    await krc.syncRoleAndGroup('role-name', ['uname']);

    expect(mockUsersFind).toHaveBeenCalledTimes(1);
    expect(mockAddClientRoleMappings).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledTimes(3);
    expect(mockLogger.error).toHaveBeenCalledTimes(0);
  });

  test('sync multiple users which exist', async () => {
    const mockRolesFind = jest.fn().mockResolvedValue({name: 'existing', id: '1234'});
    const mockUsersFind = jest.fn()
      .mockResolvedValue([{'username': 'uname', 'id': 'u1234'}, {'username': 'utwo', 'id': 'u2234'}]);
    const mockAddClientRoleMappings = jest.fn().mockResolvedValue('');
    const mockFindVaultClient = jest.fn().mockResolvedValue({id: 'vault'});
    const mockKaClient = {
      clients: {findRole: mockRolesFind, findOne: mockFindVaultClient},
      users: {find: mockUsersFind, addClientRoleMappings: mockAddClientRoleMappings},
    } as unknown as KeycloakAdminClient;

    const krc = new KeycloakRoleController(mockKaClient, mockVcInstance, mockLogger, []);
    await krc.syncRoleAndGroup('role-name', ['uname', 'utwo']);
    expect(mockUsersFind).toHaveBeenCalledTimes(1);
    expect(mockAddClientRoleMappings).toHaveBeenCalledTimes(2);
    expect(mockLogger.info).toHaveBeenCalledTimes(3);
    expect(mockLogger.error).toHaveBeenCalledTimes(0);
  });

  test('sync one user which does not exist', async () => {
    const mockRolesFind = jest.fn().mockResolvedValue({name: 'existing', id: '1234'});
    const mockUsersFind = jest.fn().mockResolvedValue([{'username': 'uname', 'id': 'u1234'}]);
    const mockAddClientRoleMappings = jest.fn().mockResolvedValue('');
    const mockFindVaultClient = jest.fn().mockResolvedValue({id: 'vault'});
    const mockKaClient = {
      clients: {findRole: mockRolesFind, findOne: mockFindVaultClient},
      users: {find: mockUsersFind, addClientRoleMappings: mockAddClientRoleMappings},
    } as unknown as KeycloakAdminClient;

    const krc = new KeycloakRoleController(mockKaClient, mockVcInstance, mockLogger, []);
    await krc.syncRoleAndGroup('role-name', ['absent']);
    expect(mockUsersFind).toHaveBeenCalledTimes(1);
    expect(mockAddClientRoleMappings).toHaveBeenCalledTimes(0);
    expect(mockLogger.info).toHaveBeenCalledTimes(4);
    expect(mockLogger.info).toHaveBeenCalledWith(
      `Keycloak: User 'absent' not found, so cannot add them to role-name. Continuing.`);
    expect(mockLogger.error).toHaveBeenCalledTimes(0);
  });

  test('sync no users', async () => {
    const mockRolesFind = jest.fn().mockResolvedValue({name: 'existing', id: '1234'});
    const mockUsersFind = jest.fn().mockResolvedValue([{'username': 'uname', 'id': 'u1234'}]);
    const mockAddClientRoleMappings = jest.fn().mockResolvedValue('');
    const mockFindVaultClient = jest.fn().mockResolvedValue({id: 'vault'});
    const mockKaClient = {
      clients: {findRole: mockRolesFind, findOne: mockFindVaultClient},
      users: {find: mockUsersFind, addClientRoleMappings: mockAddClientRoleMappings},
    } as unknown as KeycloakAdminClient;

    const krc = new KeycloakRoleController(mockKaClient, mockVcInstance, mockLogger, []);
    await krc.syncRoleAndGroup('role-name', []);

    expect(mockUsersFind).toHaveBeenCalledTimes(1);
    expect(mockAddClientRoleMappings).toHaveBeenCalledTimes(0);
    expect(mockLogger.info).toHaveBeenCalledTimes(3);
    expect(mockLogger.error).toHaveBeenCalledTimes(0);
  });

  test('user find fails', async () => {
    const mockRolesFind = jest.fn().mockResolvedValue({name: 'existing', id: '1234'});
    const mockUsersFind = jest.fn().mockRejectedValue(new Error('oh no'));
    const mockFindVaultClient = jest.fn().mockResolvedValue({id: 'vault'});
    const mockKaClient = {
      clients: {findRole: mockRolesFind, findOne: mockFindVaultClient},
      users: {find: mockUsersFind},
    } as unknown as KeycloakAdminClient;

    const krc = new KeycloakRoleController(mockKaClient, mockVcInstance, mockLogger, []);
    await expect(krc.syncRoleAndGroup('role-name', ['uname'])).rejects.toThrow();

    expect(mockUsersFind).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledTimes(3);
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith('Keycloak error: Cannot lookup users. Is Keycloak running?');
  });

  test('adding a user to a role fails', async () => {
    const mockRolesFind = jest.fn().mockResolvedValue({name: 'existing', id: '1234'});
    const mockUsersFind = jest.fn().mockResolvedValue([{'username': 'uname', 'id': 'u1234'}]);
    const mockAddClientRoleMappings = jest.fn().mockRejectedValue('oh no!');
    const mockFindVaultClient = jest.fn().mockResolvedValue({id: 'vault'});
    const mockKaClient = {
      clients: {findRole: mockRolesFind, findOne: mockFindVaultClient},
      users: {find: mockUsersFind, addClientRoleMappings: mockAddClientRoleMappings},
    } as unknown as KeycloakAdminClient;

    const krc = new KeycloakRoleController(mockKaClient, mockVcInstance, mockLogger, []);
    await krc.syncRoleAndGroup('role-name', ['uname']);
    expect(mockUsersFind).toHaveBeenCalledTimes(1);
    expect(mockAddClientRoleMappings).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledTimes(3);
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Keycloak error: Adding user uname to role role-name failed, oh no!');
  });
});
