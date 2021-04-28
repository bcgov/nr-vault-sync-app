import 'reflect-metadata';
import nv from 'node-vault';
import winston from 'winston';
import VaultGroupController from './vault-group.controller';
import {ConfigService} from '../services/config.service';
import VaultPolicyController from './vault-policy.controller';

/**
 * Helper function to create an HTTP error
 * @param statusCode The http status code
 */
function createNetworkError(statusCode: number) {
  const err = new Error();
  (err as any).response = {statusCode};
  return err;
}

describe('vault-group.controller', () => {
  const mockLogger = {
    info: jest.fn(() => { }),
    error: jest.fn(() => { }),
    debug: jest.fn(() => { }),
  } as unknown as winston.Logger;

  const mockConfigService = {
    getGroups: jest.fn(() => {
      [];
    }),
  } as unknown as ConfigService;

  const mockVpcController = {
    decorateGroupPolicy: jest.fn((policy) => policy),
  } as unknown as VaultPolicyController;

  const vault = {
    read: jest.fn(),
    write: jest.fn(),
  } as unknown as nv.client;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('syncGroup: group exists', async () => {
    vault.read = jest.fn()
      .mockResolvedValueOnce({'data': {'oidc/': {'type': 'oidc', 'accessor': '123'}}})
      .mockResolvedValueOnce({'data': {'alias': {'something': 'something'}}});
    vault.write = jest.fn().mockResolvedValueOnce(undefined);

    const vc = new VaultGroupController(vault, mockConfigService, mockVpcController, mockLogger);
    await vc.syncGroup('existing', []);
    expect(vault.read).toBeCalledTimes(2);
    expect(vault.write).toBeCalledTimes(1);
    expect(mockLogger.info).toBeCalledTimes(1);
    expect(mockLogger.info).toBeCalledWith(`Vault group: existing`);
    expect(mockLogger.error).toBeCalledTimes(0);
  });

  test('syncGroup: group does not exist', async () => {
    vault.read = jest.fn()
      .mockResolvedValueOnce({'data': {'oidc/': {'type': 'oidc', 'accessor': '123'}}});
    vault.write = jest.fn()
      .mockResolvedValueOnce({name: 'newgroup', data: {id: '11223'}})
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce('');

    const vc = new VaultGroupController(vault, mockConfigService, mockVpcController, mockLogger);
    await vc.syncGroup('newgroup', []);
    expect(vault.read).toHaveBeenCalledTimes(1);
    expect(vault.write).toHaveBeenCalledTimes(3);
    expect(mockLogger.info).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toBeCalledWith(`Vault group: newgroup`);
    expect(mockLogger.error).toHaveBeenCalledTimes(0);
  });

  test('syncGroup: group write fails', async () => {
    vault.read = jest.fn()
      .mockResolvedValueOnce({'data': {'oidc/': {'type': 'oidc', 'accessor': '123'}}});
    vault.write = jest.fn().mockRejectedValue(createNetworkError(999));

    const vc = new VaultGroupController(vault, mockConfigService, mockVpcController, mockLogger);
    await expect(vc.syncGroup('write-fails', []))
      .rejects.toThrow();
    expect(vault.read).toHaveBeenCalledTimes(1);
    expect(vault.write).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledTimes(0);
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith(`Error creating group 'write-fails' in Vault: Error 999`);
  });

  test('syncGroup: accessor lookup fails', async () => {
    vault.read = jest.fn()
      .mockRejectedValueOnce(createNetworkError(876));

    const vc = new VaultGroupController(vault, mockConfigService, mockVpcController, mockLogger);
    await expect(vc.syncGroup('find-fails', [])).rejects.toThrow();
    expect(vault.read).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledTimes(0);
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith(`Could not lookup accessor in Vault: Error 876`);
  });

  test('syncGroup: alias creation fails', async () => {
    vault.read = jest.fn()
      .mockResolvedValueOnce({'data': {'oidc/': {'type': 'oidc', 'accessor': '123'}}});
    vault.write = jest.fn()
      .mockResolvedValueOnce({name: 'newgroup', data: {id: '11223'}})
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(createNetworkError(777));

    const vc = new VaultGroupController(vault, mockConfigService, mockVpcController, mockLogger);
    await expect(vc.syncGroup('newgroup-failias', [])).rejects.toThrow();
    expect(vault.read).toHaveBeenCalledTimes(1);
    expect(vault.write).toHaveBeenCalledTimes(3);
    expect(mockLogger.info).toHaveBeenCalledTimes(0);
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith(
      `Failed to create alias 'newgroup-failias' for '11223' on '123' in Vault. Error 777`);
  });
});
