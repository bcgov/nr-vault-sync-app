import {PolicyRegistrationMemoryService} from './policy-registration-memory.service';
import {logger} from '../../logger';

jest.mock('fs');
jest.mock('node-vault');

describe('policy-registration-memory.service', () => {
  afterEach(() => jest.restoreAllMocks());

  it('can register a policy', async () => {
    const prms = new PolicyRegistrationMemoryService(logger);
    await prms.registerPolicy('system/admin');
    const unregistered = await prms.filterPoliciesForUnregistered(
      ['system/admin', 'system/bob'],
      false);
    expect(unregistered).toEqual(['system/bob']);
  });

  it('can register a policies', async () => {
    const prms = new PolicyRegistrationMemoryService(logger);
    await prms.registerPolicies(['system/admin', 'system/bob']);
    const unregistered = await prms.filterPoliciesForUnregistered(
      ['something/something', 'system/admin', 'system/bob'],
      false);
    expect(unregistered).toEqual(['something/something']);
  });

  it('can check for a registered policy', async () => {
    const prms = new PolicyRegistrationMemoryService(logger);
    await prms.registerPolicies(['system/admin', 'system/bob']);
    expect(await prms.hasRegisteredPolicy('system/admin')).toBe(true);
    expect(await prms.hasRegisteredPolicy('something/notinthere')).toBe(false);
  });

  it('can clear policies', async () => {
    const prms = new PolicyRegistrationMemoryService(logger);
    await prms.registerPolicies(['system/admin', 'system/bob']);
    await prms.clearPolicies();
    const unregistered = await prms.filterPoliciesForUnregistered(
      ['something/something', 'system/admin', 'system/bob'],
      false);
    expect(unregistered).toEqual(['something/something', 'system/admin', 'system/bob']);
  });

  it('can not do partial', async () => {
    jest.spyOn(logger, 'error').mockReturnValue(logger);
    const prms = new PolicyRegistrationMemoryService(logger);
    await expect(prms.filterPoliciesForUnregistered([], true))
      .rejects
      .toThrow();
    expect(logger.error).toBeCalled();
  });
});
