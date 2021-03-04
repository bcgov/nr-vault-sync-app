import * as fs from 'fs';
import 'reflect-metadata';
import {mocked} from 'ts-jest/utils';

jest.mock('fs');
const mockFs = mocked(fs);
mockFs.readFileSync.mockReturnValue(JSON.stringify({
  kv: ['bob'],
  apps: {},
}));

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
    const rVal = cfs.getVaultKvStores();

    expect(rVal).toEqual(['bob']);
  });

  it('getApps', async () => {
    // Test command
    const cfs = new ConfigFileService();
    const rVal = cfs.getApps();

    expect(rVal).toEqual({});
  });
});
