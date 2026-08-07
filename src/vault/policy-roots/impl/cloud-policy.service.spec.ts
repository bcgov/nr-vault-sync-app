/* eslint-disable @typescript-eslint/no-empty-function */
import winston from 'winston';
import * as fs from 'fs';
import { VAULT_ROOT_CLOUDS } from '../policy-root.service';
import { CloudPolicyService } from './cloud-policy.service';
import { ConfigService } from '../../../services/config.service';

jest.mock('fs');

describe('cloud-policy.service', () => {
  const mockLogger = {
    info: jest.fn(() => {}),
    error: jest.fn(() => {}),
    debug: jest.fn(() => {}),
  } as unknown as winston.Logger;

  const mockConfigService = {
    getClouds: jest.fn(async () => Promise.resolve(['openshift'])),
  } as unknown as ConfigService;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getName', () => {
    const cps = new CloudPolicyService(mockConfigService, mockLogger);

    expect(cps.getName()).toBe(VAULT_ROOT_CLOUDS);
  });

  test('build: uses provided cloudName when given', async () => {
    const cps = new CloudPolicyService(mockConfigService, mockLogger);
    const mockTemplateFiles = [
      'cloud-kv-read.hcl.tpl',
      'cloud-kv-write.hcl.tpl',
      'cloud-kv-read.name.tpl', // Should be ignored
    ];
    (fs.readdirSync as jest.Mock).mockReturnValue(mockTemplateFiles);

    const result = await cps.build('openshift');

    expect(mockConfigService.getClouds).not.toHaveBeenCalled();
    expect(result).toEqual([
      {
        group: VAULT_ROOT_CLOUDS,
        templateName: 'cloud-kv-read',
        data: { secretKvCloudsPath: VAULT_ROOT_CLOUDS, cloudName: 'openshift' },
      },
      {
        group: VAULT_ROOT_CLOUDS,
        templateName: 'cloud-kv-write',
        data: { secretKvCloudsPath: VAULT_ROOT_CLOUDS, cloudName: 'openshift' },
      },
    ]);
  });

  test('build: reads all clouds from config when no cloudName given', async () => {
    const cps = new CloudPolicyService(mockConfigService, mockLogger);
    const mockTemplateFiles = ['cloud-kv-read.hcl.tpl'];
    (fs.readdirSync as jest.Mock).mockReturnValue(mockTemplateFiles);

    const result = await cps.build();

    expect(mockConfigService.getClouds).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      {
        group: VAULT_ROOT_CLOUDS,
        templateName: 'cloud-kv-read',
        data: { secretKvCloudsPath: VAULT_ROOT_CLOUDS, cloudName: 'openshift' },
      },
    ]);
  });

  test('build: returns empty array when no cloud templates exist', async () => {
    const cps = new CloudPolicyService(mockConfigService, mockLogger);
    (fs.readdirSync as jest.Mock).mockReturnValue([]);

    const result = await cps.build('openshift');

    expect(result).toEqual([]);
  });

  test('build: normalizes provided cloudName to lowercase', async () => {
    const cps = new CloudPolicyService(mockConfigService, mockLogger);
    (fs.readdirSync as jest.Mock).mockReturnValue(['cloud-kv-write.hcl.tpl']);

    const result = await cps.build('AWS');

    expect(result).toEqual([
      {
        group: VAULT_ROOT_CLOUDS,
        templateName: 'cloud-kv-write',
        data: { secretKvCloudsPath: VAULT_ROOT_CLOUDS, cloudName: 'aws' },
      },
    ]);
  });

  test('build: de-duplicates cloud names from config', async () => {
    const localConfigService = {
      getClouds: jest.fn(async () => Promise.resolve(['AWS', 'aws'])),
    } as unknown as ConfigService;
    const cps = new CloudPolicyService(localConfigService, mockLogger);
    (fs.readdirSync as jest.Mock).mockReturnValue(['cloud-kv-read.hcl.tpl']);

    const result = await cps.build();

    expect(result).toEqual([
      {
        group: VAULT_ROOT_CLOUDS,
        templateName: 'cloud-kv-read',
        data: { secretKvCloudsPath: VAULT_ROOT_CLOUDS, cloudName: 'aws' },
      },
    ]);
  });
});
