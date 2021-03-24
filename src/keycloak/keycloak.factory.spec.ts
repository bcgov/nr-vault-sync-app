import KeycloakAdminClient from 'keycloak-admin';
import {mocked} from 'ts-jest/utils';
import {keycloakFactory} from './keycloak.factory';

jest.mock('keycloak-admin');

describe('keycloak.factory', () => {
  afterEach(() => jest.restoreAllMocks());

  it('Returns a keycloak admin client', async () => {
    const mockKeyClient = mocked(KeycloakAdminClient);
    const mockKeyClientInstance = {
      auth: jest.fn().mockResolvedValue('true'),
    } as unknown as KeycloakAdminClient;
    mockKeyClient.mockImplementation(() => {
      return mockKeyClientInstance;
    });

    // Test command
    const rVal = await keycloakFactory('addr', 'user', 'pass');

    expect(mockKeyClient).toBeCalledTimes(1);
    expect(mockKeyClient).toBeCalledWith({
      baseUrl: 'addr',
    });

    expect(mockKeyClientInstance.auth).toBeCalledWith({
      username: 'user',
      password: 'pass',
      grantType: 'password',
      clientId: 'admin-cli',
    });
    expect(rVal).toEqual(mockKeyClientInstance);
  });
});
