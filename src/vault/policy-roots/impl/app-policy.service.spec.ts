import winston from 'winston';
import { AppService } from '../../../services/app.service';
import { ConfigService } from '../../../services/config.service';
import { VAULT_APPROLE_MOUNT_POINT } from '../../vault-approle.controller';
import { VAULT_ROOT_APPS } from '../policy-root.service';

jest.mock('../deduplicate.deco', () => jest.fn());

import { AppPolicyService } from './app-policy.service';

describe('app-policy.service', () => {
  const mockLogger = {
    info: jest.fn(() => {}),
    error: jest.fn(() => {}),
    debug: jest.fn(() => {}),
  } as unknown as winston.Logger;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getName', () => {
    const aps = new AppPolicyService(
      {} as unknown as AppService,
      {} as unknown as ConfigService,
      mockLogger,
    );

    expect(aps.getName()).toBe(VAULT_ROOT_APPS);
  });

  test('build: no limit', async () => {
    const mockAppService = {
      getAllApps: jest.fn(() => ['app1', 'app2']),
    } as unknown as AppService;
    const aps = new AppPolicyService(
      mockAppService,
      {} as unknown as ConfigService,
      mockLogger,
    );

    jest.spyOn(aps, 'buildApplication').mockReturnValue(Promise.resolve([]));
    jest.spyOn(aps, 'buildApplications').mockReturnValue(Promise.resolve([]));
    await aps.build();

    expect(aps.buildApplication).toHaveBeenCalledTimes(0);
    expect(aps.buildApplications).toHaveBeenCalledTimes(1);
  });

  test('sync: buildApplication', async () => {
    const aps = new AppPolicyService(
      {} as unknown as AppService,
      {
        getDbType: jest.fn().mockReturnValue('type'),
      } as unknown as ConfigService,
      mockLogger,
    );

    const spec = await aps.buildApplication({
      env: ['PRODUCTION'],
      app: 'DEMOapp',
      project: 'DEmO',
      config: { enabled: true, name: 'DEMOapp', db: ['db'] },
    });

    const dataEnvProd = {
      appCanReadProject: undefined,
      application: 'demoapp',
      authMount: VAULT_APPROLE_MOUNT_POINT,
      secertKvPath: 'apps',
      secertDbPath: 'db',
      project: 'demo',
      environment: 'prod',
    };
    const dataDbEnvProd = {
      dbName: 'db',
      dbType: 'type',
      ...dataEnvProd,
    };

    expect(spec).toEqual([
      {
        group: VAULT_ROOT_APPS,
        templateName: 'project-kv-read',
        data: dataEnvProd,
      },
      {
        group: VAULT_ROOT_APPS,
        templateName: 'project-kv-write',
        data: dataEnvProd,
      },
      {
        group: VAULT_ROOT_APPS,
        templateName: 'app-kv-read',
        data: dataEnvProd,
      },
      {
        group: VAULT_ROOT_APPS,
        templateName: 'app-kv-write',
        data: dataEnvProd,
      },
      {
        group: VAULT_ROOT_APPS,
        templateName: 'app-db-read',
        data: dataDbEnvProd,
      },
      {
        group: VAULT_ROOT_APPS,
        templateName: 'app-db-readwrite',
        data: dataDbEnvProd,
      },
      {
        group: VAULT_ROOT_APPS,
        templateName: 'app-db-full',
        data: dataDbEnvProd,
      },
    ]);
  });
});
