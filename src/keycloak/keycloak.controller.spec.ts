import {KeycloakController} from '../keycloak/keycloak.controller';
import {keycloakFactory} from '../keycloak/keycloak.factory';
import KeycloakAdminClient from 'keycloak-admin';
// eslint-disable-next-line no-unused-vars

describe('user groups in Keycloak', () => {
  test('group exists', async () => {
    const log = jest.fn((message: string) => {
      console.log(`logging ${message}`);
    });
    const error = jest.fn((message: string) => {});

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
    const log = jest.fn((message: string) => {
      console.log(`logging ${message}`);
    });
    const error = jest.fn((message: string) => {});

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

  test('group lookup fails', () => {

  });

  test('group creation fails', () => {

  });
});
