import 'reflect-metadata';
import nv from 'node-vault';
import winston from 'winston';
import {ConfigService} from '../services/config.service';
import VaultPolicyController, {VAULT_ROOT_SYSTEM} from './vault-policy.controller';
import {AppService} from '../services/app.service';
import {PolicyRegistrationService} from '../services/policy-registration.service';
import HclUtil from '../util/hcl.util';
import VaultApi from './vault.api';

describe('vault-policy.controller', () => {
  const vault = {
    read: jest.fn(),
    write: jest.fn(),
  } as unknown as nv.client;

  const vaultApi = {
    getOidcAccessor: jest.fn(),
  } as unknown as VaultApi;

  const mockLogger = {
    info: jest.fn(() => { }),
    error: jest.fn(() => { }),
    debug: jest.fn(() => { }),
  } as unknown as winston.Logger;

  function vpcFactory(fArgs: any) {
    return new VaultPolicyController(
      vault,
      vaultApi,
      fArgs.appService ? fArgs.appService : {} as AppService,
      fArgs.configService ? fArgs.configService : {} as ConfigService,
      fArgs.hclUtil ? fArgs.hclUtil : {} as HclUtil,
      fArgs.policyRegistrationService ? fArgs.policyRegistrationService : {} as PolicyRegistrationService,
      mockLogger);
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('sync: No root set', async () => {
    const vp = vpcFactory({});

    jest.spyOn(vp, 'removeUnregisteredPolicies').mockReturnValue(Promise.resolve());
    // VAULT_ROOT_SYSTEM
    jest.spyOn(vp, 'syncSystem').mockReturnValue(Promise.resolve());
    jest.spyOn(vp, 'syncKvSecretEngines').mockReturnValue(Promise.resolve());
    // VAULT_ROOT_APPS
    jest.spyOn(vp, 'syncAllApplications').mockReturnValue(Promise.resolve());
    // VAULT_ROOT_GROUPS
    jest.spyOn(vp, 'syncGroups').mockReturnValue(Promise.resolve());

    await vp.sync([]);

    expect(vp.removeUnregisteredPolicies).toBeCalledTimes(3);
    // VAULT_ROOT_SYSTEM
    expect(vp.syncSystem).toBeCalledTimes(1);
    expect(vp.syncKvSecretEngines).toBeCalledTimes(1);
    expect(vp.removeUnregisteredPolicies).toBeCalledWith('system', false);
    // VAULT_ROOT_APPS
    expect(vp.syncAllApplications).toBeCalledTimes(1);
    expect(vp.removeUnregisteredPolicies).toBeCalledWith('apps', false);
    // VAULT_ROOT_GROUPS
    expect(vp.syncGroups).toBeCalledTimes(1);
    expect(vp.removeUnregisteredPolicies).toBeCalledWith('groups', false);

    expect(mockLogger.info).toBeCalledWith('- Sync system policies');
    expect(mockLogger.info).toBeCalledWith('- Sync application policies');
    expect(mockLogger.info).toBeCalledWith('- Sync group policies');
  });

  test('sync: syncSystem', async () => {
    const vp = vpcFactory({});

    jest.spyOn(vp, 'addPolicy').mockReturnValue(Promise.resolve());
    await vp.syncSystem();

    expect(vp.addPolicy).toBeCalledTimes(3);
    expect(vp.addPolicy).toBeCalledWith(VAULT_ROOT_SYSTEM, 'admin-super');
    expect(vp.addPolicy).toBeCalledWith(VAULT_ROOT_SYSTEM, 'admin-general');
    expect(vp.addPolicy).toBeCalledWith(VAULT_ROOT_SYSTEM, 'user-generic');
  });

  test('sync: syncKvSecretEngines', async () => {
    const mockConfigService = {
      getVaultKvStores: jest.fn(() => ['user', 'apps/bob']),
    };
    const vp = new VaultPolicyController(
      vault,
      vaultApi,
      {} as AppService,
      mockConfigService as unknown as ConfigService,
      {} as HclUtil,
      {} as PolicyRegistrationService,
      mockLogger);

    jest.spyOn(vp, 'addPolicy').mockReturnValue(Promise.resolve());
    await vp.syncKvSecretEngines();

    expect(vp.addPolicy).toBeCalledTimes(2);
    expect(vp.addPolicy).toBeCalledWith(VAULT_ROOT_SYSTEM, 'kv-admin', {secertKvPath: 'user'});
    expect(vp.addPolicy).toBeCalledWith(VAULT_ROOT_SYSTEM, 'kv-admin', {secertKvPath: 'apps/bob'});
  });

  test('sync: syncAllApplications', async () => {
    const mockAppService = {
      getAllApps: jest.fn(() => ['app1', 'app2']),
    };
    const vp = vpcFactory({appService: mockAppService});

    jest.spyOn(vp, 'syncApplication').mockReturnValue(Promise.resolve());
    await vp.syncAllApplications();

    expect(vp.syncApplication).toBeCalledTimes(2);
    expect(vp.syncApplication).toBeCalledWith('app1');
    expect(vp.syncApplication).toBeCalledWith('app2');
  });

  test('sync: syncApplicationByName', async () => {
    const mockAppService = {
      getApp: jest.fn().mockResolvedValue(true),
    };
    const vp = vpcFactory({appService: mockAppService});

    const rVal = Promise.resolve();
    jest.spyOn(vp, 'syncApplication').mockReturnValue(rVal);
    expect(await vp.syncApplicationByName('app1')).toBe(await rVal);

    expect(vp.syncApplication).toBeCalledTimes(1);
    expect(vp.syncApplication).toBeCalledWith(true);
    expect(mockAppService.getApp).toBeCalledTimes(1);
    expect(mockAppService.getApp).toBeCalledWith('app1');
  });

  test('sync: syncApplicationByName (no app)', async () => {
    const mockAppService = {
      getApp: jest.fn().mockImplementation(() => {
        throw new Error();
      }),
    };
    const vp = vpcFactory({appService: mockAppService});

    jest.spyOn(vp, 'syncApplication');
    expect(await vp.syncApplicationByName('app1')).toBe(undefined);

    expect(vp.syncApplication).toBeCalledTimes(0);
    expect(mockAppService.getApp).toBeCalledTimes(1);
    expect(mockAppService.getApp).toBeCalledWith('app1');
    expect(mockLogger.error).toBeCalledWith('App not found: app1');
  });
});
