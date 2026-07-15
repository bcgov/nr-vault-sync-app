/* eslint-disable @typescript-eslint/no-empty-function */
import winston from 'winston';
import { VAULT_ROOT_SYSTEM } from '../policy-root.service';
import { SystemPolicyService } from './system-policy.service';
import { AppService } from '../../../services/app.service';
import { ConfigService } from '../../../services/config.service';
import * as fs from 'fs';
import EnvironmentUtil from '../../../util/environment.util';

jest.mock('../oidc-data.deco', () => jest.fn());
jest.mock('../deduplicate.deco', () => jest.fn());
jest.mock('fs');

describe('system-policy.service', () => {
  const mockLogger = {
    info: jest.fn(() => {}),
    error: jest.fn(() => {}),
    debug: jest.fn(() => {}),
  } as unknown as winston.Logger;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getName', () => {
    const sps = new SystemPolicyService(
      {} as unknown as AppService,
      {} as unknown as ConfigService,
      mockLogger,
    );

    expect(sps.getName()).toBe(VAULT_ROOT_SYSTEM);
  });

  test('build: no limit', async () => {
    const sps = new SystemPolicyService(
      {} as unknown as AppService,
      {} as unknown as ConfigService,
      mockLogger,
    );

    jest.spyOn(sps, 'buildSystem').mockReturnValue(Promise.resolve([]));
    jest
      .spyOn(sps, 'buildKvSecretEngines')
      .mockReturnValue(Promise.resolve([]));
    await sps.build();

    expect(sps.buildSystem).toHaveBeenCalledTimes(1);
    expect(sps.buildKvSecretEngines).toHaveBeenCalledTimes(1);
  });

  describe('buildSystem', () => {
    test('returns HclRenderSpec for non-kv template files', async () => {
      const mockConfig = {
        getKvStores: jest.fn().mockResolvedValue(['apps', 'db']),
      } as unknown as ConfigService;
      const mockAppService = {
        getAllApps: jest.fn().mockResolvedValue([]),
      } as unknown as AppService;
      const sps = new SystemPolicyService(
        mockAppService,
        mockConfig,
        mockLogger,
      );

      const mockTemplateFiles = [
        'admin-general.hcl.tpl',
        'admin-super.hcl.tpl',
        'broker-auth.hcl.tpl',
        'kv-admin.hcl.tpl', // Should be filtered out
        'kv-sync.hcl.tpl', // Should be filtered out
        'user-generic.hcl.tpl',
      ];
      (fs.readdirSync as jest.Mock).mockReturnValue(mockTemplateFiles);
      jest
        .spyOn(EnvironmentUtil, 'getShortNames')
        .mockReturnValue(['dev', 'prod']);

      const result = await sps.buildSystem();

      expect(result).toHaveLength(4);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            group: VAULT_ROOT_SYSTEM,
            templateName: 'admin-general',
            data: expect.objectContaining({
              envs: ['dev', 'prod'],
            }),
          }),
          expect.objectContaining({
            group: VAULT_ROOT_SYSTEM,
            templateName: 'admin-super',
          }),
          expect.objectContaining({
            group: VAULT_ROOT_SYSTEM,
            templateName: 'broker-auth',
          }),
          expect.objectContaining({
            group: VAULT_ROOT_SYSTEM,
            templateName: 'user-generic',
          }),
        ]),
      );
      // Verify kv-* templates are excluded
      const templateNames = result.map((r) => r.templateName);
      expect(templateNames).not.toContain('kv-admin');
      expect(templateNames).not.toContain('kv-sync');
    });

    test('returns empty array when no template files exist', async () => {
      const mockConfig = {
        getKvStores: jest.fn().mockResolvedValue([]),
      } as unknown as ConfigService;
      const mockAppService = {
        getAllApps: jest.fn().mockResolvedValue([]),
      } as unknown as AppService;
      const sps = new SystemPolicyService(
        mockAppService,
        mockConfig,
        mockLogger,
      );

      (fs.readdirSync as jest.Mock).mockReturnValue([]);

      const result = await sps.buildSystem();

      expect(result).toEqual([]);
    });
  });

  describe('buildKvSecretEngines', () => {
    test('returns specs for each kv store', async () => {
      const mockConfig = {
        getKvStores: jest.fn().mockResolvedValue(['apps', 'db', 'secrets']),
      } as unknown as ConfigService;
      const sps = new SystemPolicyService(
        {} as unknown as AppService,
        mockConfig,
        mockLogger,
      );

      const result = await sps.buildKvSecretEngines();

      expect(result).toHaveLength(8); // 3 paths * 2 (admin + developer) + 2 extra for 'apps'
      // Verify basic kv-admin and kv-developer for each path
      const templateNames = result.map((r) => r.templateName);
      expect(templateNames).toContain('kv-admin');
      expect(templateNames).toContain('kv-developer');
    });

    test('includes kv-tools-read and kv-sync for apps path', async () => {
      const mockConfig = {
        getKvStores: jest.fn().mockResolvedValue(['apps']),
      } as unknown as ConfigService;
      const sps = new SystemPolicyService(
        {} as unknown as AppService,
        mockConfig,
        mockLogger,
      );

      const result = await sps.buildKvSecretEngines();

      expect(result).toHaveLength(4); // 1 path * 2 + 2 extra for 'apps'
      const templateNames = result.map((r) => r.templateName);
      expect(templateNames).toContain('kv-tools-read');
      expect(templateNames).toContain('kv-sync');

      const syncSpec = result.find((r) => r.templateName === 'kv-sync');
      expect(syncSpec?.data).toEqual(
        expect.objectContaining({
          secretKvPath: 'apps',
          syncName: 'aws-ssm-sync',
        }),
      );
    });

    test('excludes kv-tools-read and kv-sync for non-apps paths', async () => {
      const mockConfig = {
        getKvStores: jest.fn().mockResolvedValue(['db', 'secrets']),
      } as unknown as ConfigService;
      const sps = new SystemPolicyService(
        {} as unknown as AppService,
        mockConfig,
        mockLogger,
      );

      const result = await sps.buildKvSecretEngines();

      expect(result).toHaveLength(4); // 2 paths * 2 (admin + developer)
      const templateNames = result.map((r) => r.templateName);
      expect(templateNames).not.toContain('kv-tools-read');
      expect(templateNames).not.toContain('kv-sync');
    });
  });
});
