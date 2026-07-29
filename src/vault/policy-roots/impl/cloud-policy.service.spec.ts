/* eslint-disable @typescript-eslint/no-empty-function */
import winston from 'winston';
import * as fs from 'fs';
import { VAULT_ROOT_CLOUD } from '../policy-root.service';
import { CloudPolicyService } from './cloud-policy.service';

jest.mock('fs');

describe('cloud-policy.service', () => {
  const mockLogger = {
    info: jest.fn(() => { }),
    error: jest.fn(() => { }),
    debug: jest.fn(() => { }),
  } as unknown as winston.Logger;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getName', () => {
    const cps = new CloudPolicyService(mockLogger);

    expect(cps.getName()).toBe(VAULT_ROOT_CLOUD);
  });

  test('build: returns HclRenderSpec for cloud template files', async () => {
    const cps = new CloudPolicyService(mockLogger);
    const mockTemplateFiles = [
      'cloud-kv-read.hcl.tpl',
      'cloud-kv-write.hcl.tpl',
      'cloud-kv-read.name.tpl', // Should be ignored
    ];
    (fs.readdirSync as jest.Mock).mockReturnValue(mockTemplateFiles);

    const result = await cps.build();

    expect(result).toEqual([
      {
        group: VAULT_ROOT_CLOUD,
        templateName: 'cloud-kv-read',
        data: { secretKvCloudPath: VAULT_ROOT_CLOUD },
      },
      {
        group: VAULT_ROOT_CLOUD,
        templateName: 'cloud-kv-write',
        data: { secretKvCloudPath: VAULT_ROOT_CLOUD },
      },
    ]);
  });

  test('build: returns empty array when no cloud templates exist', async () => {
    const cps = new CloudPolicyService(mockLogger);
    (fs.readdirSync as jest.Mock).mockReturnValue([]);

    const result = await cps.build();

    expect(result).toEqual([]);
  });
});
