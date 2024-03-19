import * as fs from 'fs';
import { VaultConfig } from '../config.service';

jest.mock('fs');
const mockFs = jest.mocked(fs);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockConfig: VaultConfig = {
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
  db: [{ name: 'jasper', type: 'oracle' }],
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

import { ConfigFileService } from './config-file.service';

describe('config-file.service', () => {
  afterEach(() => jest.restoreAllMocks());

  it('reads file once', () => {
    new ConfigFileService();
    new ConfigFileService();
    expect(mockFs.readFileSync).toHaveBeenCalledWith(
      expect.stringContaining('config.json'),
      { encoding: 'utf8' },
    );
    expect(mockFs.readFileSync).toHaveBeenCalledTimes(1);
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
