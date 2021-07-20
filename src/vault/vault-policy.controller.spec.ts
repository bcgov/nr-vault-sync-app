import nv from 'node-vault';
import winston from 'winston';
import VaultPolicyController from './vault-policy.controller';
import {PolicyRegistrationService} from '../services/policy-registration.service';
import HclUtil, {HlcRenderSpec} from '../util/hcl.util';
import {PolicyRootService} from './policy-roots/policy-root.service';

interface FactoryArgs {
  hclUtil?: HclUtil;
  policyRegistrationService?: PolicyRegistrationService;
  policyRootServices?: PolicyRootService<unknown>[];
}

describe('vault-policy.controller', () => {
  const vault = {
    read: jest.fn(),
    write: jest.fn(),
  } as unknown as nv.client;

  const mockLogger = {
    info: jest.fn(() => { }),
    error: jest.fn(() => { }),
    debug: jest.fn(() => { }),
  } as unknown as winston.Logger;

  /**
   * Test harness factory
   */
  function vpcFactory(fArgs: FactoryArgs) {
    return new VaultPolicyController(
      vault,
      fArgs.hclUtil ? fArgs.hclUtil : {} as HclUtil,
      fArgs.policyRegistrationService ? fArgs.policyRegistrationService : {} as PolicyRegistrationService,
      fArgs.policyRootServices ? fArgs.policyRootServices : [] as PolicyRootService<undefined>[],
      mockLogger);
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('sync: No root set', async () => {
    const pRootServices = [
      {getName: jest.fn(() => 'bob'), build: jest.fn().mockResolvedValue([1, 2])},
    ];
    const vp = vpcFactory({policyRootServices: pRootServices});
    jest.spyOn(vp, 'removeUnregisteredPolicies').mockReturnValue(Promise.resolve());
    jest.spyOn(vp, 'addPolicy').mockReturnValue(Promise.resolve());

    await vp.sync([]);

    expect(pRootServices[0].getName).toBeCalledTimes(2);
    expect(pRootServices[0].build).toBeCalledTimes(1);

    expect(vp.addPolicy).toBeCalledTimes(2);
    expect(vp.addPolicy).toBeCalledWith(1);
    expect(vp.addPolicy).toBeCalledWith(2);
    expect(vp.removeUnregisteredPolicies).toBeCalledTimes(1);
    expect(vp.addPolicy).toBeCalledTimes(2);

    expect(mockLogger.info).toBeCalledWith('- Sync bob');
  });

  test('addPolicy', async () => {
    const mockHclUtil = {
      renderName: jest.fn().mockReturnValue('name'),
      renderBody: jest.fn().mockReturnValue('body'),
    } as unknown as HclUtil;
    const mockPolicyRegistrationService = {
      hasRegisteredPolicy: jest.fn().mockResolvedValue(false),
      registerPolicy: jest.fn().mockResolvedValue(false),
    } as unknown as PolicyRegistrationService;
    const vp = vpcFactory({
      hclUtil: mockHclUtil,
      policyRegistrationService: mockPolicyRegistrationService,
    });
    await vp.addPolicy({} as HlcRenderSpec);

    expect(mockHclUtil.renderName).toBeCalledTimes(1);
    expect(mockHclUtil.renderName).toBeCalledWith({});
    expect(mockLogger.info).toBeCalledTimes(1);
    expect(mockLogger.info).toBeCalledWith('Add policy: name');
    expect(mockPolicyRegistrationService.hasRegisteredPolicy).toBeCalledTimes(1);
    expect(mockPolicyRegistrationService.hasRegisteredPolicy).toBeCalledWith('name');
    expect(mockPolicyRegistrationService.registerPolicy).toBeCalledTimes(1);
    expect(mockPolicyRegistrationService.registerPolicy).toBeCalledWith('name');

    expect(mockHclUtil.renderBody).toBeCalledTimes(1);
    expect(mockHclUtil.renderBody).toBeCalledWith({});

    expect(vault.write).toBeCalledTimes(1);
    expect(vault.write).toBeCalledWith('sys/policies/acl/name', {name: 'name', policy: 'body'});
  });

  test('addPolicy: Already registered', async () => {
    const mockHclUtil = {
      renderName: jest.fn().mockReturnValue('name'),
      renderBody: jest.fn().mockReturnValue('body'),
    } as unknown as HclUtil;
    const mockPolicyRegistrationService = {
      hasRegisteredPolicy: jest.fn().mockResolvedValue(true),
      registerPolicy: jest.fn().mockResolvedValue(false),
    } as unknown as PolicyRegistrationService;
    const vp = vpcFactory({
      hclUtil: mockHclUtil,
      policyRegistrationService: mockPolicyRegistrationService,
    });
    await vp.addPolicy({} as HlcRenderSpec);

    expect(mockHclUtil.renderName).toBeCalledTimes(1);
    expect(mockHclUtil.renderName).toBeCalledWith({});
    expect(mockLogger.info).toBeCalledTimes(1);
    expect(mockLogger.info).toBeCalledWith('Add policy: name');
    expect(mockPolicyRegistrationService.hasRegisteredPolicy).toBeCalledTimes(1);
    expect(mockPolicyRegistrationService.hasRegisteredPolicy).toBeCalledWith('name');
    expect(mockPolicyRegistrationService.registerPolicy).toBeCalledTimes(0);
    expect(mockHclUtil.renderBody).toBeCalledTimes(0);
    expect(vault.write).toBeCalledTimes(0);
  });
});
