import { RegistrationMemoryService } from './registration-memory.service';
import { logger } from '../../logger';

jest.mock('fs');
jest.mock('node-vault');

describe('policy-registration-memory.service', () => {
  afterEach(() => jest.restoreAllMocks());

  it('can register a policy', async () => {
    const prms = new RegistrationMemoryService(logger);
    await prms.register('system/admin', 'blah');
    const unregistered = await prms.filterNamesForUnregistered(
      ['system/admin', 'system/bob'],
      false,
    );
    expect(unregistered).toEqual(['system/bob']);
  });

  it('can register a policies', async () => {
    const prms = new RegistrationMemoryService(logger);
    await prms.registerMany([
      ['system/admin', 'blah'],
      ['system/bob', 'boop'],
    ]);
    const unregistered = await prms.filterNamesForUnregistered(
      ['something/something', 'system/admin', 'system/bob'],
      false,
    );
    expect(unregistered).toEqual(['something/something']);
  });

  it('can check for a registered policy', async () => {
    const prms = new RegistrationMemoryService(logger);
    await prms.registerMany([
      ['system/admin', 'blah'],
      ['system/bob', 'boop'],
    ]);
    expect(await prms.isActive('system/admin')).toBe(true);
    expect(await prms.isSameValue('system/admin', 'blah')).toBe(true);
    expect(await prms.isSameValue('system/admin', 'boop')).toBe(false);
    expect(await prms.isActive('something/notinthere')).toBe(false);
  });

  it('can clear policies', async () => {
    const prms = new RegistrationMemoryService(logger);
    await prms.registerMany([
      ['system/admin', 'blah'],
      ['system/bob', 'boop'],
    ]);
    await prms.clear();
    expect(
      await prms.filterNamesForUnregistered(
        ['something/something', 'system/admin', 'system/bob'],
        false,
      ),
    ).toEqual(['something/something', 'system/admin', 'system/bob']);

    await prms.register('system/admin', 'blah');
    expect(
      await prms.filterNamesForUnregistered(
        ['something/something', 'system/admin', 'system/bob'],
        false,
      ),
    ).toEqual(['something/something', 'system/bob']);
  });

  it('can not do partial', async () => {
    jest.spyOn(logger, 'error').mockReturnValue(logger);
    const prms = new RegistrationMemoryService(logger);
    await expect(prms.filterNamesForUnregistered([], true)).rejects.toThrow();
    expect(logger.error).toHaveBeenCalled();
  });
});
