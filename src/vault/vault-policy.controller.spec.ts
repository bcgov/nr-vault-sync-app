import nv from 'node-vault';
import winston from 'winston';
import VaultPolicyController from './vault-policy.controller';
import {PolicyRegistrationService} from '../services/policy-registration.service';
import HclUtil from '../util/hcl.util';
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
});
