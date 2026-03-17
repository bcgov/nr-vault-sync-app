/* eslint-disable @typescript-eslint/no-empty-function */
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

  test('lookupSelf: computes renewAt from creation_time', async () => {
    const now = Math.floor(Date.now() / 1000);
    vault.tokenLookupSelf = jest.fn().mockResolvedValue({
      data: {
        creation_time: now - 100,
        creation_ttl: 3600,
      },
    });

    const va = new VaultApi(vault, mockLogger);
    await va.lookupSelf();

    expect(vault.tokenLookupSelf).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledWith('Lookup: success');
  });

  test('lookupSelf: uses last_renewal_time when present', async () => {
    const now = Math.floor(Date.now() / 1000);
    vault.tokenLookupSelf = jest.fn().mockResolvedValue({
      data: {
        creation_time: now - 1000,
        creation_ttl: 3600,
        last_renewal_time: now - 50,
      },
    });

    const va = new VaultApi(vault, mockLogger);
    await va.lookupSelf();

    expect(vault.tokenLookupSelf).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledWith('Lookup: success');
  });

  test('lookupSelf: logs error on failure', async () => {
    vault.tokenLookupSelf = jest.fn().mockRejectedValue(new Error('fail'));

    const va = new VaultApi(vault, mockLogger);
    await va.lookupSelf();

    expect(mockLogger.error).toHaveBeenCalledWith('Lookup: fail');
  });

  test('renewVaultToken: skips renewal when renewAt is undefined', async () => {
    vault.tokenRenewSelf = jest.fn();

    const va = new VaultApi(vault, mockLogger);
    await va.renewVaultToken();

    expect(vault.tokenRenewSelf).not.toHaveBeenCalled();
  });

  test('renewVaultToken: skips renewal when before renewAt', async () => {
    vault.tokenLookupSelf = jest.fn().mockResolvedValue({
      data: {
        creation_time: Math.floor(Date.now() / 1000),
        creation_ttl: 3600,
      },
    });
    vault.tokenRenewSelf = jest.fn();

    const va = new VaultApi(vault, mockLogger);
    await va.lookupSelf(); // sets renewAt far in the future
    await va.renewVaultToken();

    expect(vault.tokenRenewSelf).not.toHaveBeenCalled();
  });

  test('renewVaultToken: renews and re-lookups when past renewAt', async () => {
    // Set renewAt in the past by using an old creation_time
    vault.tokenLookupSelf = jest.fn().mockResolvedValue({
      data: {
        creation_time: Math.floor(Date.now() / 1000) - 7200,
        creation_ttl: 3600,
      },
    });
    vault.tokenRenewSelf = jest.fn().mockResolvedValue({
      auth: { lease_duration: 3600 },
    });

    const va = new VaultApi(vault, mockLogger);
    await va.lookupSelf();
    await va.renewVaultToken();

    expect(vault.tokenRenewSelf).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Renew: success (duration: 3600)',
    );
    // lookupSelf called twice: initial + after renewal
    expect(vault.tokenLookupSelf).toHaveBeenCalledTimes(2);
  });

  test('renewVaultToken: logs error on failure', async () => {
    vault.tokenLookupSelf = jest.fn().mockResolvedValue({
      data: {
        creation_time: Math.floor(Date.now() / 1000) - 7200,
        creation_ttl: 3600,
      },
    });
    vault.tokenRenewSelf = jest.fn().mockRejectedValue(new Error('denied'));

    const va = new VaultApi(vault, mockLogger);
    await va.lookupSelf();
    await va.renewVaultToken();

    expect(mockLogger.error).toHaveBeenCalledWith('Renew: fail');
  });
});
