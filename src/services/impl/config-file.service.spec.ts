import * as fs from 'fs';
import {mocked} from 'ts-jest/utils';
import {VaultConfig} from '../config.service';

jest.mock('fs');
const mockFs = mocked(fs);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockConfig: VaultConfig = {
  apps: [
    {name: 'APP-TUS', enabled: true},
  ],
  appActorDefaults: {
    approle: {
      dev: ['project-kv-read', 'project-kv-write'],
      test: ['project-kv-read'],
    },
    developer: {
      int: ['project-kv-read', 'project-kv-write'],
      test: ['project-kv-read'],
    },
  },
  db: [{name: 'jasper', type: 'oracle'}],
  kv: ['bob'],
  groups: [
    {
      kv: 'groups',
      name: 'appdelivery',
      policies: [],
    },
  ],
};
mockFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));
// For purposes of testing, we just care that it exists
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
mockConfig.apps[0].approle = expect.anything();

import {ConfigFileService} from './config-file.service';


describe('config-file.service', () => {
  afterEach(() => jest.restoreAllMocks());

  it('reads file once', () => {
    new ConfigFileService();
    new ConfigFileService();
    expect(mockFs.readFileSync).toBeCalledWith(
      expect.stringContaining('config.json'), 'UTF8');
    expect(mockFs.readFileSync).toBeCalledTimes(1);
  });


  it('getApp', async () => {
    // Test command
    const cfs = new ConfigFileService();
    const rVal = await cfs.getApp('APP-TUS');

    expect(rVal).toEqual(mockConfig.apps[0]);
  });

  it('getApp - Unknown', async () => {
    // Test command
    const cfs = new ConfigFileService();
    const rVal = await cfs.getApp('APP-UNK');

    expect(rVal).toEqual(undefined);
  });

  it('getApps', async () => {
    // Test command
    const cfs = new ConfigFileService();
    const rVal = await cfs.getApps();

    expect(rVal).toEqual(mockConfig.apps);
  });

  it('getAppActorDefaults', async () => {
    // Test command
    const cfs = new ConfigFileService();
    const rVal = await cfs.getAppActorDefaults();

    expect(rVal).toEqual(mockConfig.appActorDefaults);
  });

  it('getDbStores', async () => {
    // Test command
    const cfs = new ConfigFileService();
    const rVal = await cfs.getDbStores();

    expect(rVal).toEqual(mockConfig.db);
  });

  it('getDbType', async () => {
    // Test command
    const cfs = new ConfigFileService();
    const rVal = await cfs.getDbType('jasper');

    expect(rVal).toEqual('oracle');
  });

  it('getKvStores', async () => {
    // Test command
    const cfs = new ConfigFileService();
    const rVal = await cfs.getKvStores();

    expect(rVal).toEqual(mockConfig.kv);
  });

  it('getGroups', async () => {
    // Test command
    const cfs = new ConfigFileService();
    const rVal = await cfs.getGroups();

    expect(rVal).toEqual(mockConfig.groups);
  });
});
