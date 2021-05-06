import winston from 'winston';
import {AppService} from '../../../services/app.service';
import {VAULT_ROOT_APPS} from '../policy-root.service';

jest.mock('../deduplicate.deco', () => jest.fn());

import {AppPolicyService} from './app-policy.service';

describe('app-policy.service', () => {
  const mockLogger = {
    info: jest.fn(() => { }),
    error: jest.fn(() => { }),
    debug: jest.fn(() => { }),
  } as unknown as winston.Logger;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getName', () => {
    const aps = new AppPolicyService({} as unknown as AppService, mockLogger);

    expect(aps.getName()).toBe(VAULT_ROOT_APPS);
  });

  test('build: no limit', async () => {
    const mockAppService = {
      getAllApps: jest.fn(() => ['app1', 'app2']),
    } as unknown as AppService;
    const aps = new AppPolicyService(mockAppService, mockLogger);

    jest.spyOn(aps, 'buildApplication').mockReturnValue([]);
    jest.spyOn(aps, 'buildApplications').mockReturnValue(Promise.resolve([]));
    await aps.build();

    expect(aps.buildApplication).toBeCalledTimes(0);
    expect(aps.buildApplications).toBeCalledTimes(1);
  });

  /*

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
  */
});
