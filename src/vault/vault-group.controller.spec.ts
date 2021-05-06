import 'reflect-metadata';
import nv from 'node-vault';
import winston from 'winston';
import VaultGroupController from './vault-group.controller';
import {ConfigService} from '../services/config.service';
import VaultPolicyController from './vault-policy.controller';
import VaultApi from './vault.api';

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

  const vaultApi = {
    getOidcAccessor: jest.fn(),
  } as unknown as VaultApi;

  afterEach(() => {
    jest.clearAllMocks();
    mockConfigService.getGroups = jest.fn(async () => {
      return [];
    });
  });

  test('sync: multiple groups', async () => {
    const mockGroupData = [{name: 'bob'}, {name: 'sue'}];
    mockConfigService.getGroups = jest.fn(async () => {
      return mockGroupData;
    });
    const vc = new VaultGroupController(vault, vaultApi, mockConfigService, mockVpcController, mockLogger);
    jest.spyOn(vc, 'syncGroup').mockResolvedValue('');
    await vc.sync();

    expect(mockConfigService.getGroups).toBeCalledTimes(1);
    expect(mockVpcController.decorateGroupPolicy).toBeCalledTimes(2);
    expect(mockVpcController.decorateGroupPolicy).toHaveBeenCalledWith(mockGroupData[0]);
    expect(mockVpcController.decorateGroupPolicy).toHaveBeenCalledWith(mockGroupData[1]);
    expect(vc.syncGroup).toBeCalledTimes(2);
    expect(vc.syncGroup).toHaveBeenCalledWith(mockGroupData[0].name, mockGroupData[0]);
    expect(vc.syncGroup).toHaveBeenCalledWith(mockGroupData[1].name, mockGroupData[1]);
  });

  test('syncGroup: group exists', async () => {
    vault.read = jest.fn()
      .mockResolvedValueOnce({'data': {'alias': {'something': 'something'}}});
    vault.write = jest.fn().mockResolvedValueOnce(undefined);
    vaultApi.getOidcAccessor = jest.fn().mockResolvedValueOnce('123');

    const vc = new VaultGroupController(vault, vaultApi, mockConfigService, mockVpcController, mockLogger);
    await vc.syncGroup('existing', []);
    expect(vaultApi.getOidcAccessor).toHaveBeenCalledTimes(1);
    expect(vault.read).toBeCalledTimes(1);
    expect(vault.write).toBeCalledTimes(1);
    expect(mockLogger.info).toBeCalledTimes(1);
    expect(mockLogger.info).toBeCalledWith(`Vault group: existing`);
    expect(mockLogger.error).toBeCalledTimes(0);
  });

  test('syncGroup: group does not exist', async () => {
    vault.write = jest.fn()
      .mockResolvedValueOnce({name: 'newgroup', data: {id: '11223'}})
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce('');
    vaultApi.getOidcAccessor = jest.fn().mockResolvedValueOnce('123');


    const vc = new VaultGroupController(vault, vaultApi, mockConfigService, mockVpcController, mockLogger);
    await vc.syncGroup('newgroup', []);
    expect(vaultApi.getOidcAccessor).toHaveBeenCalledTimes(1);
    expect(vault.write).toHaveBeenCalledTimes(3);
    expect(mockLogger.info).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toBeCalledWith(`Vault group: newgroup`);
    expect(mockLogger.error).toHaveBeenCalledTimes(0);
  });

  test('syncGroup: group write fails', async () => {
    vault.write = jest.fn().mockRejectedValue(createNetworkError(999));
    vaultApi.getOidcAccessor = jest.fn().mockResolvedValueOnce('123');

    const vc = new VaultGroupController(vault, vaultApi, mockConfigService, mockVpcController, mockLogger);
    await expect(vc.syncGroup('write-fails', []))
      .rejects.toThrow();
    expect(vaultApi.getOidcAccessor).toHaveBeenCalledTimes(1);
    expect(vault.write).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledTimes(0);
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith(`Error creating group 'write-fails' in Vault: Error 999`);
  });

  test('syncGroup: accessor lookup fails', async () => {
    vaultApi.getOidcAccessor = jest.fn().mockImplementation(() => {
      throw new Error();
    });

    const vc = new VaultGroupController(vault, vaultApi, mockConfigService, mockVpcController, mockLogger);
    await expect(vc.syncGroup('find-fails', [])).rejects.toThrow();
    expect(vaultApi.getOidcAccessor).toHaveBeenCalledTimes(1);
  });

  test('syncGroup: alias creation fails', async () => {
    vault.write = jest.fn()
      .mockResolvedValueOnce({name: 'newgroup', data: {id: '11223'}})
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(createNetworkError(777));
    vaultApi.getOidcAccessor = jest.fn().mockResolvedValueOnce('123');

    const vc = new VaultGroupController(vault, vaultApi, mockConfigService, mockVpcController, mockLogger);
    await expect(vc.syncGroup('newgroup-failias', [])).rejects.toThrow();
    expect(vaultApi.getOidcAccessor).toHaveBeenCalledTimes(1);
    expect(vault.write).toHaveBeenCalledTimes(3);
    expect(mockLogger.info).toHaveBeenCalledTimes(0);
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith(
      `Failed to create alias 'newgroup-failias' for '11223' on '123' in Vault. Error 777`);
  });
});
