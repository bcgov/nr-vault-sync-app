import * as fs from 'fs';
import {mocked} from 'ts-jest/utils';

jest.mock('fs');
const mockFs = mocked(fs);
const mockConfig = {
  'kv': ['bob'],
  'apps': [
    {'name': 'APP-TUS', 'enabled': true},
  ],
  'appGroups': {
    'developer': {
      'dev': ['project-kv-read', 'project-kv-write'],
      'int': ['project-kv-read', 'project-kv-write'],
      'test': ['project-kv-read'],
    },
  },
  'groups': [
    {
      'kv': 'groups',
      'name': 'appdelivery',
      'policies': [],
    },
  ],
};
mockFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

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

  it('getVaultKvStores', async () => {
    // Test command
    const cfs = new ConfigFileService();
    const rVal = await cfs.getVaultKvStores();

    expect(rVal).toEqual(['bob']);
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

  it('getAppGroups', async () => {
    // Test command
    const cfs = new ConfigFileService();
    const rVal = await cfs.getAppGroups();

    expect(rVal).toEqual(mockConfig.appGroups);
  });

  it('getGroups', async () => {
    // Test command
    const cfs = new ConfigFileService();
    const rVal = await cfs.getGroups();

    expect(rVal).toEqual(mockConfig.groups);
  });
});
