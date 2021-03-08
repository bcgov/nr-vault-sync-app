// eslint-disable-next-line no-unused-vars
import nv from 'node-vault';
// eslint-disable-next-line no-unused-vars
import KeycloakAdminClient from 'keycloak-admin';
import GroupSync from './group-sync';
import {vaultFactory} from '../vault/vault.factory';
import {VaultController} from '../vault/vault.controller';
import {keycloakFactory} from '../keycloak/keycloak.factory';
import {KeycloakController} from '../keycloak/keycloak.controller';
import {mocked} from 'ts-jest/utils';

jest.mock('../vault/vault.factory');
jest.mock('../keycloak/keycloak.factory');

beforeAll(() => {
  jest
    .spyOn(VaultController.prototype, 'syncGroup')
    .mockResolvedValue(void(0));
  jest
    .spyOn(KeycloakController.prototype, 'syncGroup')
    .mockResolvedValue(void(0));
});


describe('group sync command', () => {
  afterEach(() => jest.restoreAllMocks());

  it('runs', async () => {
    mocked(vaultFactory);
    mocked(keycloakFactory);

    // Test command
    await GroupSync.run([
      '--vault-addr', 'vaddr',
      '--vault-token', 'token',
      '--keycloak-addr', 'kaddr',
      '--keycloak-username', 'user',
      '--keycloak-password', 'pass'],
    );

    expect(vaultFactory).toBeCalledTimes(1);
    expect(vaultFactory).toBeCalledWith('vaddr', 'token');

    expect(keycloakFactory).toBeCalledTimes(1);
    expect(keycloakFactory).toBeCalledWith('kaddr', 'user', 'pass');

    expect(KeycloakController.prototype.syncGroup).toBeCalledTimes(1);
    expect(VaultController.prototype.syncGroup).toBeCalledTimes(1);
  });
});
