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

  test('sync: buildApplication', async () => {
    const aps = new AppPolicyService({} as unknown as AppService, mockLogger);

    const spec = aps.buildApplication({
      env: ['PRODUCTION'],
      app: 'DEMOapp',
      project: 'DEmO',
    });

    const dataEnvProd = {
      application: 'demoapp',
      secertKvPath: 'apps',
      project: 'demo',
      environment: 'prod',
      appCanReadProject: undefined,
    };

    expect(spec).toEqual([
      {group: VAULT_ROOT_APPS, templateName: 'project-kv-read', data: dataEnvProd},
      {group: VAULT_ROOT_APPS, templateName: 'project-kv-write', data: dataEnvProd},
      {group: VAULT_ROOT_APPS, templateName: 'app-kv-read', data: dataEnvProd},
      {group: VAULT_ROOT_APPS, templateName: 'app-kv-write', data: dataEnvProd},
    ]);
  });
});
