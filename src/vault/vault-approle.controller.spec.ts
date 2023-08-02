import nv from 'node-vault';
import winston from 'winston';
import { AppService } from '../services/app.service';
import VaultApproleController, {
  VAULT_APPROLE_MOUNT_POINT,
} from './vault-approle.controller';
import HclUtil from '../util/hcl.util';
import { AppPolicyService } from './policy-roots/impl/app-policy.service';
import { ConfigService } from '../services/config.service';

describe('vault-approle.controller', () => {
  const mockHclUtil = {
    renderName: jest.fn(() => 'policyname'),
    renderApproleName: jest.fn(() => 'name'),
  } as unknown as HclUtil;

  const vault = {
    read: jest.fn(),
    write: jest.fn(),
    addApproleRole: jest.fn(),
    approleRoles: jest.fn(() => ({ data: { keys: ['a', 'c', 'd'] } })),
    deleteApproleRole: jest.fn(),
  } as unknown as nv.client;

  const mockApps = [
    {
      config: {
        enabled: true,
        approle: {
          enabled: true,
        },
      },
      env: ['PRODUCTION'],
    },
  ];

  const mockActorDefaults = {
    approle: {
      dev: ['project-kv-read', 'project-kv-write'],
      prod: ['project-kv-read'],
    },
    developer: {
      int: ['project-kv-read', 'project-kv-write'],
      test: ['project-kv-read'],
    },
  };

  const mockAppService = {
    getAllApps: jest.fn(() => mockApps),
  } as unknown as AppService;

  const mockAppRootService = {
    buildApplicationForEnv: jest.fn(() => [
      {
        group: 'b',
        templateName: 'project-kv-read',
      },
    ]),
  } as unknown as AppPolicyService;

  const mockConfigService = {
    getAppActorDefaults: jest.fn(() => mockActorDefaults),
  } as unknown as ConfigService;

  const mockLogger = {
    info: jest.fn(() => {}),
    error: jest.fn(() => {}),
    debug: jest.fn(() => {}),
  } as unknown as winston.Logger;

  /**
   * Test harness factory
   */
  function vgcFactory() {
    return new VaultApproleController(
      vault,
      mockAppService,
      mockAppRootService,
      mockConfigService,
      mockHclUtil,
      mockLogger,
    );
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('sync', async () => {
    const va = vgcFactory();
    const mockDict = {};
    jest
      .spyOn(va, 'buildApproleDict')
      .mockReturnValue(Promise.resolve(mockDict));
    jest.spyOn(va, 'createUpdateRoles').mockReturnValue(Promise.resolve());
    jest.spyOn(va, 'removeUnusedRoles').mockReturnValue(Promise.resolve());

    await va.sync();

    expect(va.buildApproleDict).toHaveBeenCalledTimes(1);
    expect(va.createUpdateRoles).toHaveBeenCalledTimes(1);
    expect(va.createUpdateRoles).toHaveBeenCalledWith(mockDict);
    expect(va.removeUnusedRoles).toHaveBeenCalledTimes(1);
    expect(va.removeUnusedRoles).toHaveBeenCalledWith(expect.any(Set));
  });

  test('buildApproleDict', async () => {
    const va = vgcFactory();

    const rval = await va.buildApproleDict();

    expect(mockAppService.getAllApps).toHaveBeenCalledTimes(1);
    expect(mockHclUtil.renderApproleName).toHaveBeenCalledTimes(1);
    expect(mockHclUtil.renderApproleName).toHaveBeenCalledWith(
      mockApps[0],
      'PRODUCTION',
    );

    expect(mockAppRootService.buildApplicationForEnv).toHaveBeenCalledTimes(1);
    expect(mockAppRootService.buildApplicationForEnv).toHaveBeenCalledWith(
      mockApps[0],
      'PRODUCTION',
    );

    expect(mockHclUtil.renderName).toHaveBeenCalledTimes(1);

    expect(rval).toEqual({
      name: {
        enabled: true,
        role_name: 'name',
        token_policies: 'policyname',
      },
    });
  });

  test('createUpdateRoles', async () => {
    const va = vgcFactory();
    await va.createUpdateRoles({
      name: {
        enabled: true,
        role_name: 'name',
        bind_secret_id: true,
        secret_id_bound_cidrs: 'secret_id_bound_cidrs',
        secret_id_num_uses: 2,
        secret_id_ttl: 5564,
        enable_local_secret_ids: false,
        token_ttl: 546,
        token_max_ttl: 798897,
        token_policies: 'policy',
        token_bound_cidrs: '',
        token_explicit_max_ttl: 46545,
        token_no_default_policy: true,
        token_num_uses: 44,
        token_period: 798,
        token_type: 'string',
      },
    });

    expect(vault.addApproleRole).toHaveBeenCalledTimes(1);
    expect(vault.addApproleRole).toHaveBeenCalledWith({
      bind_secret_id: true,
      bound_cidr_list: '',
      mount_point: 'vs_apps_approle',
      period: 798,
      policies: 'policy',
      role_name: 'name',
      secret_id_num_uses: 2,
      secret_id_ttl: 5564,
      token_max_ttl: 798897,
      token_num_uses: 44,
      token_ttl: 546,
    });
  });

  test('removeUnusedRoles', async () => {
    const va = vgcFactory();
    const regSet = new Set(['a', 'b']);

    await va.removeUnusedRoles(regSet);

    expect(vault.approleRoles).toHaveBeenCalledTimes(1);
    expect(vault.approleRoles).toHaveBeenCalledWith({
      mount_point: VAULT_APPROLE_MOUNT_POINT,
    });

    expect(vault.deleteApproleRole).toHaveBeenCalledTimes(2);
    expect(vault.deleteApproleRole).toHaveBeenCalledWith({
      mount_point: VAULT_APPROLE_MOUNT_POINT,
      role_name: 'c',
    });
    expect(vault.deleteApproleRole).toHaveBeenCalledWith({
      mount_point: VAULT_APPROLE_MOUNT_POINT,
      role_name: 'd',
    });
  });
});
