/* eslint-disable @typescript-eslint/no-empty-function */
import nv from 'node-vault';
import winston from 'winston';
import VaultPolicyController from './vault-policy.controller';
import { RegistrationService } from '../services/registration.service';
import HclUtil, { HlcRenderSpec } from '../util/hcl.util';
import { PolicyRootService } from './policy-roots/policy-root.service';

interface FactoryArgs {
  hclUtil?: HclUtil;
  registrationService?: RegistrationService;
  policyRootServices?: PolicyRootService<unknown>[];
}

describe('vault-policy.controller', () => {
  const vault = {
    read: jest.fn(),
    write: jest.fn(),
    policies: jest.fn(() => Promise.resolve({ data: { policies: [] } })),
  } as unknown as nv.client;

  const mockRegistrationService = {
    register: jest.fn(() => {}),
    registerMany: jest.fn(() => {}),
    isActive: jest.fn(() => false),
    isSameValue: jest.fn(() => false),
    clear: jest.fn(() => {}),
    filterNamesForUnregistered: jest.fn(() => {}),
  } as unknown as RegistrationService;

  const mockLogger = {
    info: jest.fn(() => {}),
    error: jest.fn(() => {}),
    debug: jest.fn(() => {}),
  } as unknown as winston.Logger;

  /**
   * Test harness factory
   */
  function vpcFactory(fArgs: FactoryArgs) {
    return new VaultPolicyController(
      vault,
      fArgs.hclUtil ? fArgs.hclUtil : ({} as HclUtil),
      fArgs.registrationService
        ? fArgs.registrationService
        : mockRegistrationService,
      fArgs.policyRootServices
        ? fArgs.policyRootServices
        : ([] as PolicyRootService<undefined>[]),
      mockLogger,
    );
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('sync: No root set', async () => {
    const pRootServices = [
      {
        getName: jest.fn(() => 'bob'),
        build: jest.fn().mockResolvedValue([1, 2]),
      },
    ];
    const vp = vpcFactory({ policyRootServices: pRootServices });
    jest
      .spyOn(vp, 'removeUnregisteredPolicies')
      .mockReturnValue(Promise.resolve());
    jest.spyOn(vp, 'addPolicy').mockReturnValue(Promise.resolve());

    await vp.sync([]);

    expect(pRootServices[0].getName).toHaveBeenCalledTimes(2);
    expect(pRootServices[0].build).toHaveBeenCalledTimes(1);

    expect(vp.addPolicy).toHaveBeenCalledTimes(2);
    expect(vp.addPolicy).toHaveBeenCalledWith(1);
    expect(vp.addPolicy).toHaveBeenCalledWith(2);
    expect(vp.removeUnregisteredPolicies).toHaveBeenCalledTimes(1);
    expect(vp.addPolicy).toHaveBeenCalledTimes(2);

    expect(mockLogger.info).toHaveBeenCalledWith('- Sync bob');
  });

  test('addPolicy', async () => {
    const mockHclUtil = {
      renderName: jest.fn().mockReturnValue('name'),
      renderBody: jest.fn().mockReturnValue('body'),
    } as unknown as HclUtil;
    const mockRegistrationService = {
      isSameValue: jest.fn().mockResolvedValue(false),
      register: jest.fn().mockResolvedValue(false),
    } as unknown as RegistrationService;
    const vp = vpcFactory({
      hclUtil: mockHclUtil,
      registrationService: mockRegistrationService,
    });
    await vp.addPolicy({} as HlcRenderSpec);

    expect(mockHclUtil.renderName).toHaveBeenCalledTimes(1);
    expect(mockHclUtil.renderName).toHaveBeenCalledWith({});
    expect(mockLogger.info).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledWith('Add policy: name');
    expect(mockRegistrationService.isSameValue).toHaveBeenCalledTimes(1);
    expect(mockRegistrationService.isSameValue).toHaveBeenCalledWith(
      'name',
      'body',
    );
    expect(mockRegistrationService.register).toHaveBeenCalledTimes(1);
    expect(mockRegistrationService.register).toHaveBeenCalledWith(
      'name',
      'body',
    );

    expect(mockHclUtil.renderBody).toHaveBeenCalledTimes(1);
    expect(mockHclUtil.renderBody).toHaveBeenCalledWith({});

    expect(vault.write).toHaveBeenCalledTimes(1);
    expect(vault.write).toHaveBeenCalledWith('sys/policies/acl/name', {
      name: 'name',
      policy: 'body',
    });
  });

  test('addPolicy: Already registered', async () => {
    const mockHclUtil = {
      renderName: jest.fn().mockReturnValue('name'),
      renderBody: jest.fn().mockReturnValue('body'),
    } as unknown as HclUtil;
    const mockRegistrationService = {
      isSameValue: jest.fn().mockResolvedValue(true),
      register: jest.fn().mockResolvedValue(false),
      setUsed: jest.fn(() => {}),
    } as unknown as RegistrationService;
    const vp = vpcFactory({
      hclUtil: mockHclUtil,
      registrationService: mockRegistrationService,
    });
    await vp.addPolicy({} as HlcRenderSpec);

    expect(mockHclUtil.renderName).toHaveBeenCalledTimes(1);
    expect(mockHclUtil.renderName).toHaveBeenCalledWith({});
    expect(mockLogger.info).toHaveBeenCalledTimes(0);
    // expect(mockLogger.info).toHaveBeenCalledWith('Add policy: name');
    expect(mockRegistrationService.isSameValue).toHaveBeenCalledTimes(1);
    expect(mockRegistrationService.isSameValue).toHaveBeenCalledWith(
      'name',
      'body',
    );
    expect(mockRegistrationService.register).toHaveBeenCalledTimes(0);
    expect(mockHclUtil.renderBody).toHaveBeenCalledTimes(1);
    expect(vault.write).toHaveBeenCalledTimes(0);
  });
});
