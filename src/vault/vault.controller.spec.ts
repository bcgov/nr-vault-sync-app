import 'reflect-metadata';
import nv from 'node-vault';
import winston from 'winston';
import {VaultController} from '../vault/vault.controller';

/**
 * Helper function to create an HTTP error
 * @param statusCode The http status code
 */
function createNetworkError(statusCode: number) {
  const err = new Error();
  (err as any).response = {statusCode};
  return err;
}

describe('vault.controller', () => {
  const mockLogger = {
    info: jest.fn(() => { }),
    error: jest.fn(() => { }),
  } as unknown as winston.Logger;

  const vault = {
    read: jest.fn(),
    write: jest.fn(),
  } as unknown as nv.client;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('syncGroup: group exists', async () => {
    vault.read = jest.fn()
      .mockResolvedValueOnce('exists')
      .mockResolvedValueOnce({'key': {'type': 'oidc', 'accessor': '123'}});

    const vc = new VaultController(vault, mockLogger);
    await vc.syncGroup('existing');
    expect(vault.read).toBeCalledTimes(1);
    expect(mockLogger.info).toBeCalledTimes(1);
    expect(mockLogger.info).toBeCalledWith(`Group existing already exists in Vault.`);
    expect(mockLogger.error).toBeCalledTimes(0);
  });

  test('syncGroup: group does not exist', async () => {
    vault.read = jest.fn()
      .mockRejectedValueOnce(createNetworkError(404))
      .mockResolvedValueOnce({'key': {'type': 'oidc', 'accessor': '123'}})
      .mockResolvedValueOnce('newgroup');
    vault.write = jest.fn()
      .mockResolvedValueOnce({name: 'newgroup', data: {id: '11223'}})
      .mockResolvedValueOnce('');

    const vc = new VaultController(vault, mockLogger);
    await vc.syncGroup('newgroup');
    expect(vault.read).toHaveBeenCalledTimes(3);
    expect(vault.write).toHaveBeenCalledTimes(2);
    expect(mockLogger.info).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledWith(`Group newgroup created in Vault.`);
    expect(mockLogger.error).toHaveBeenCalledTimes(0);
  });

  test('syncGroup: group lookup fails', async () => {
    vault.read = jest.fn()
      .mockRejectedValue(createNetworkError(999));

    const vc = new VaultController(vault, mockLogger);
    await expect(vc.syncGroup('find-fails'))
      .rejects.toThrow();
    expect(vault.read).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledTimes(0);
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith(`Error searching for group 'find-fails' in Vault: Error 999`);
  });

  test('syncGroup: accessor lookup fails', async () => {
    vault.read = jest.fn()
      .mockRejectedValueOnce(createNetworkError(404))
      .mockRejectedValueOnce(createNetworkError(876));
    const vc = new VaultController(vault, mockLogger);
    await expect(vc.syncGroup('find-fails')).rejects.toThrow();
    expect(vault.read).toHaveBeenCalledTimes(2);
    expect(mockLogger.info).toHaveBeenCalledTimes(0);
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith(`Could not lookup accessor in Vault: Error 876`);
  });

  test('syncGroup: alias creation fails', async () => {
    vault.read = jest.fn()
      .mockRejectedValueOnce(createNetworkError(404))
      .mockResolvedValueOnce({'key': {'type': 'oidc', 'accessor': '123'}});
    vault.write = jest.fn()
      .mockResolvedValueOnce({name: 'newgroup', data: {id: '11223'}})
      .mockRejectedValueOnce(createNetworkError(777));

    const vc = new VaultController(vault, mockLogger);
    await expect(vc.syncGroup('newgroup-failias', 'newgroup-failias')).rejects.toThrow();
    expect(vault.read).toHaveBeenCalledTimes(2);
    expect(vault.write).toHaveBeenCalledTimes(2);
    expect(mockLogger.info).toHaveBeenCalledTimes(0);
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith(`Error creating alias 'newgroup-failias' in Vault: Error 777`);
  });

  test('syncGroup: group creation fails', async () => {
    vault.read = jest.fn()
      .mockRejectedValueOnce(createNetworkError(404))
      .mockResolvedValueOnce({'key': {'type': 'oidc', 'accessor': '123'}});
    vault.write = jest.fn()
      .mockRejectedValue(createNetworkError(999));

    const vc = new VaultController(vault, mockLogger);
    await expect(vc.syncGroup('newgroup-fails')).rejects.toThrow();
    expect(vault.read).toHaveBeenCalledTimes(2);
    expect(vault.write).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledTimes(0);
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith(`Error creating group 'newgroup-fails' in Vault: Error 999`);
  });
});
