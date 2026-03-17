import * as fs from 'fs';
import { AppConfig } from '../config.service';

jest.mock('fs');
const mockFs = jest.mocked(fs);

const mockAppsConfig = {
  apps: [
    {
      app: 'cool-app-war',
      project: 'cool-project',
      env: ['dev', 'test', 'prod'],
      config: {
        enabled: true,
        name: 'cool-app-war',
        approle: {
          enabled: true,
        },
        db: ['jasper'],
        policyOptions: {
          tokenPeriod: 'weekly',
        },
      } as AppConfig,
    },
    {
      app: 'disabled-app',
      project: 'some-project',
      env: ['dev'],
      config: {
        enabled: false,
        name: 'disabled-app',
      } as AppConfig,
    },
  ],
};

mockFs.readFileSync.mockReturnValue(JSON.stringify(mockAppsConfig));

import { AppFileService } from './app-file.service';

const mockConfigService = {
  getAppActorDefaults: jest.fn(),
  getDbStores: jest.fn(),
  getDbType: jest.fn(),
  getKvStores: jest.fn(),
  getGroups: jest.fn(),
};

describe('app-file.service', () => {
  beforeEach(() => {
    mockFs.readFileSync.mockReturnValue(JSON.stringify(mockAppsConfig));
  });
  afterEach(() => jest.restoreAllMocks());

  it('reads apps file on construction', () => {
    new AppFileService(mockConfigService);
    expect(mockFs.readFileSync).toHaveBeenCalledWith(
      expect.stringContaining('apps.json'),
      { encoding: 'utf8' },
    );
  });

  it('getAllApps returns only enabled apps with defaults applied', async () => {
    const service = new AppFileService(mockConfigService);
    const apps = await service.getAllApps();

    expect(apps).toHaveLength(1);
    expect(apps[0].app).toBe('cool-app-war');
    expect(apps[0].project).toBe('cool-project');
    expect(apps[0].env).toEqual(['dev', 'test', 'prod']);
    // Check defaults were applied
    expect(apps[0].config?.approle?.enabled).toBe(true);
    expect(apps[0].config?.approle?.secret_id_num_uses).toBe(1);
    expect(apps[0].config?.approle?.token_period).toBe(604800); // weekly
  });

  it('getAllApps applies daily token period by default', async () => {
    const appsNoTokenPeriod = {
      apps: [
        {
          app: 'default-app',
          project: 'project',
          env: ['dev'],
          config: {
            enabled: true,
            name: 'default-app',
          },
        },
      ],
    };
    mockFs.readFileSync.mockReturnValue(JSON.stringify(appsNoTokenPeriod));

    // Re-import to pick up new mock data via fresh construction
    const { AppFileService: FreshAppFileService } = jest.requireActual(
      './app-file.service',
    ) as typeof import('./app-file.service');
    const service = new FreshAppFileService(mockConfigService);
    const apps = await service.getAllApps();

    expect(apps[0].config?.approle?.token_period).toBe(86400); // daily
  });

  it('getApp returns the requested app', async () => {
    const service = new AppFileService(mockConfigService);
    const app = await service.getApp('cool-app-war');

    expect(app.app).toBe('cool-app-war');
    expect(app.project).toBe('cool-project');
  });

  it('getApp throws for non-existent app', async () => {
    const service = new AppFileService(mockConfigService);

    await expect(service.getApp('no-such-app')).rejects.toThrow(
      "App 'no-such-app' does not exist or is not enabled",
    );
  });

  it('getApp throws for disabled app', async () => {
    const service = new AppFileService(mockConfigService);

    await expect(service.getApp('disabled-app')).rejects.toThrow(
      "App 'disabled-app' does not exist or is not enabled",
    );
  });
});
