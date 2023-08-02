import nv from 'node-vault';
import winston from 'winston';
import VaultApi from './vault.api';

/**
 * Helper function to create an HTTP error
 * @param statusCode The http status code
 */
function createNetworkError(statusCode: number) {
  const err: Error & { response?: { statusCode: number } } = new Error();
  err.response = { statusCode };
  return err;
}

describe('vault.api', () => {
  const mockLogger = {
    info: jest.fn(() => {}),
    error: jest.fn(() => {}),
    debug: jest.fn(() => {}),
  } as unknown as winston.Logger;

  const vault = {
    read: jest.fn(),
    write: jest.fn(),
  } as unknown as nv.client;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getOidcAccessors: Found!', async () => {
    vault.read = jest.fn().mockResolvedValue({
      data: {
        'oidc/': {
          accessor: 'auth_oidc_c3e3ffc',
          type: 'oidc',
        },
      },
    });

    const va = new VaultApi(vault, mockLogger);
    const accessor = await va.getOidcAccessors();
    expect(vault.read).toHaveBeenCalledTimes(1);
    expect(vault.read).toHaveBeenCalledWith('/sys/auth');
    expect(accessor).toStrictEqual(['auth_oidc_c3e3ffc']);
  });

  test('getOidcAccessors: Not found', async () => {
    vault.read = jest.fn().mockResolvedValue({
      data: {
        'token/': {
          accessor: 'auth_oidc_c3e3ffc',
          type: 'something',
        },
      },
    });

    const va = new VaultApi(vault, mockLogger);
    await expect(va.getOidcAccessors()).rejects.toThrow();
    expect(vault.read).toHaveBeenCalledTimes(1);
    expect(vault.read).toHaveBeenCalledWith('/sys/auth');
    expect(mockLogger.info).toHaveBeenCalledTimes(0);
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
  });

  test('getOidcAccessors: network fail', async () => {
    vault.read = jest.fn().mockRejectedValueOnce(createNetworkError(876));

    const va = new VaultApi(vault, mockLogger);
    await expect(va.getOidcAccessors()).rejects.toThrow();
    expect(vault.read).toHaveBeenCalledTimes(1);
    expect(vault.read).toHaveBeenCalledWith('/sys/auth');
    expect(mockLogger.info).toHaveBeenCalledTimes(0);
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith(
      `Could not lookup accessor in Vault: Error 876`,
    );
  });
});
