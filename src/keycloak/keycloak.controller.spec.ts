import {KeycloakController} from '../keycloak/keycloak.controller';

describe('user groups in Keycloak', () => {
  const log = jest.fn((message: string) => {});
  const error = jest.fn((message: string) => {});
  afterEach(() => {
    log.mockClear();
    error.mockClear();
  });

  test('group exists', async () => {
    const mockFind = jest.fn().mockImplementation(() => Promise.resolve([{name: 'existing', id: '1234'}]));

    const KeycloakAdminClient = jest.fn().mockImplementation(() => {
      return {groups: {find: mockFind}};
    });

    const keycloak = new KeycloakAdminClient;

    const vc = new KeycloakController(keycloak, log, error);
    await vc.syncGroup('existing')
      .then(() => {
        expect(mockFind).toHaveBeenCalledTimes(1);
        expect(log).toHaveBeenCalledTimes(1);
        expect(log).toHaveBeenCalledWith(`Group existing already exists in Keycloak.`);
        expect(error).toHaveBeenCalledTimes(0);
      });
  });

  test('group does not exist', async () => {
    const mockFind = jest.fn().mockImplementation(() => Promise.resolve([]));
    const mockCreate = jest.fn().mockImplementation(() => Promise.resolve({id: 1234}));

    const KeycloakAdminClient = jest.fn().mockImplementation(() => {
      return {groups: {find: mockFind, create: mockCreate}};
    });

    const keycloak = new KeycloakAdminClient;

    const vc = new KeycloakController(keycloak, log, error);
    await vc.syncGroup('newgroup')
      .then(() => {
        expect(mockFind).toHaveBeenCalledTimes(1);
        expect(mockCreate).toHaveBeenCalledTimes(1);
        expect(log).toHaveBeenCalledTimes(1);
        expect(log).toHaveBeenCalledWith(`Group newgroup created in Keycloak.`);
        expect(error).toHaveBeenCalledTimes(0);
      });
  });

  test('group lookup fails', async () => {
    const mockFind = jest.fn().mockImplementation(() => Promise.reject({response: {statusCode: 999}}));

    const KeycloakAdminClient = jest.fn().mockImplementation(() => {
      return {groups: {find: mockFind}};
    });

    const keycloak = new KeycloakAdminClient;

    const vc = new KeycloakController(keycloak, log, error);
    await vc.syncGroup('find-fails')
      .then(() => {
        expect(mockFind).toHaveBeenCalledTimes(1);
        expect(log).toHaveBeenCalledTimes(0);
        expect(error).toHaveBeenCalledTimes(1);
        expect(error).toHaveBeenCalledWith(`Error finding group 'find-fails' in Keycloak: Error 999!`);
      });
  });

  test('group creation fails', async () => {
    const mockFind = jest.fn().mockImplementation(() => Promise.resolve([]));
    const mockCreate = jest.fn().mockImplementation(() => Promise.reject('oh no'));

    const KeycloakAdminClient = jest.fn().mockImplementation(() => {
      return {groups: {find: mockFind, create: mockCreate}};
    });

    const keycloak = new KeycloakAdminClient;

    const vc = new KeycloakController(keycloak, log, error);
    await vc.syncGroup('newgroup-fails')
      .then(() => {
        expect(mockFind).toHaveBeenCalledTimes(1);
        expect(mockCreate).toHaveBeenCalledTimes(1);
        expect(log).toHaveBeenCalledTimes(0);
        expect(error).toHaveBeenCalledTimes(1);
        expect(error).toHaveBeenCalledWith(`Error creating group 'newgroup-fails' in Keycloak! Is Keycloak running?`);
      });
  });
});
