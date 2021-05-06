import winston from 'winston';
import {ConfigService} from '../../../services/config.service';
import {HlcRenderSpec} from '../../../util/hcl.util';
import {VAULT_ROOT_GROUPS} from '../policy-root.service';
import {GroupPolicyService} from './group-policy.service';

describe('group-policy.service', () => {
  const mockLogger = {
    info: jest.fn(() => { }),
    error: jest.fn(() => { }),
    debug: jest.fn(() => { }),
  } as unknown as winston.Logger;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getName', () => {
    const gps = new GroupPolicyService({} as unknown as ConfigService, mockLogger);

    expect(gps.getName()).toBe(VAULT_ROOT_GROUPS);
  });

  test('build: no limit', async () => {
    const gps = new GroupPolicyService({} as unknown as ConfigService, mockLogger);

    jest.spyOn(gps, 'buildGroup').mockReturnValue({} as unknown as HlcRenderSpec);
    jest.spyOn(gps, 'buildGroups').mockReturnValue(Promise.resolve([]));
    await gps.build();

    expect(gps.buildGroup).toBeCalledTimes(0);
    expect(gps.buildGroups).toBeCalledTimes(1);
  });
});
