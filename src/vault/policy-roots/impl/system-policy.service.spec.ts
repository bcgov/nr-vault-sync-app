/* eslint-disable @typescript-eslint/no-empty-function */
import winston from 'winston';
import { ConfigService } from '../../../services/config.service';
import { VAULT_ROOT_SYSTEM } from '../policy-root.service';
import { SystemPolicyService } from './system-policy.service';
import { AppService } from '../../../services/app.service';

jest.mock('../oidc-data.deco', () => jest.fn());

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
});
