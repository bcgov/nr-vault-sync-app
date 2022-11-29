import nv from 'node-vault';
import winston from 'winston';
import VaultGroupController from './vault-group.controller';
import {ConfigService} from '../services/config.service';
import VaultApi from './vault.api';
import {AppPolicyService} from './policy-roots/impl/app-policy.service';
import {GroupPolicyService} from './policy-roots/impl/group-policy.service';
import {AppService} from '../services/app.service';
import HclUtil from '../util/hcl.util';

/**
 * Helper function to create an HTTP error
 * @param statusCode The http status code
 */
function createNetworkError(statusCode: number) {
  const err = new Error();
  // eslint-disable-next-line -- No typing provided
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

  const mockGroupPolicyService = {
  } as unknown as GroupPolicyService;

  const mockAppPolicyService = {
  } as unknown as AppPolicyService;

  const mockAppService = {
    getAllApps: jest.fn(() => ['app1', 'app2']),
  } as unknown as AppService;

  const mockHclUtil = {
    getAllApps: jest.fn(() => ['app1', 'app2']),
  } as unknown as HclUtil;

  const vault = {
    read: jest.fn(),
    write: jest.fn(),
  } as unknown as nv.client;

  const vaultApi = {
    getOidcAccessors: jest.fn(),
  } as unknown as VaultApi;

  interface FactoryArgs {
    mockConfigService?: ConfigService;
  }

  /**
   * Test harness factory
   */
  function vgcFactory(fArgs: FactoryArgs) {
    return new VaultGroupController(
      vault,
      vaultApi,
      fArgs.mockConfigService ? fArgs.mockConfigService : mockConfigService,
      mockAppService,
      mockHclUtil,
      mockGroupPolicyService,
      mockAppPolicyService,
      mockLogger);
  }

  afterEach(() => {
    jest.clearAllMocks();
    mockConfigService.getGroups = jest.fn(async () => {
      return Promise.resolve([]);
    });
  });

  test('sync', async () => {
    const vc = vgcFactory({});
    jest.spyOn(vc, 'syncUserGroups').mockReturnValue(Promise.resolve());
    jest.spyOn(vc, 'syncAppGroups').mockReturnValue(Promise.resolve());
    await vc.sync();

    expect(vc.syncUserGroups).toHaveBeenCalledTimes(1);
    expect(vc.syncAppGroups).toHaveBeenCalledTimes(1);
  });

  test('syncGroup: group exists', async () => {
    vault.read = jest.fn()
      .mockResolvedValueOnce({'data': {'alias': {'something': 'something'}}});
    vault.write = jest.fn().mockResolvedValueOnce(undefined);

    const vc = vgcFactory({});
    await vc.syncGroup('existing', 'role', []);
    expect(vault.read).toHaveBeenCalledTimes(1);
    expect(vault.write).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledWith(`Role: role -> Group: existing []`);
    expect(mockLogger.error).toHaveBeenCalledTimes(0);
  });

  test('syncGroup: group does not exist', async () => {
    vault.write = jest.fn()
      .mockResolvedValueOnce({name: 'newgroup', data: {id: '11223'}})
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce('');
    vaultApi.getOidcAccessors = jest.fn().mockResolvedValueOnce(['123']);

    const vc = vgcFactory({});
    await vc.syncGroup('newgroup', 'role', []);
    expect(vault.write).toHaveBeenCalledTimes(3);
    expect(mockLogger.info).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledWith(`Role: role -> Group: newgroup []`);
    expect(mockLogger.error).toHaveBeenCalledTimes(0);
  });

  test('syncGroup: group write fails', async () => {
    vault.write = jest.fn().mockRejectedValue(createNetworkError(999));

    const vc = vgcFactory({});
    await expect(vc.syncGroup('write-fails', 'role', []))
      .rejects.toThrow();
    expect(vault.write).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledTimes(0);
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith(`Error creating group 'write-fails' in Vault: Error 999`);
  });

  test('syncGroup: alias creation fails', async () => {
    vault.write = jest.fn()
      .mockResolvedValueOnce({name: 'newgroup', data: {id: '11223'}})
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(createNetworkError(777));
    vaultApi.getOidcAccessors = jest.fn().mockResolvedValueOnce(['123']);

    const vc = vgcFactory({});
    await expect(vc.syncGroup('newgroup-failias', 'role', [])).rejects.toThrow();
    expect(vault.write).toHaveBeenCalledTimes(3);
    expect(mockLogger.info).toHaveBeenCalledTimes(0);
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith(
      `Failed to create alias 'role' for '11223' on '123' in Vault. Error 777`);
  });
});
