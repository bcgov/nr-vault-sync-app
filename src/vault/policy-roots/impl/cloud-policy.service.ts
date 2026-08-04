import fs from 'fs';
import path from 'path';
import winston from 'winston';
import { inject, injectable } from 'inversify';
import { HclRenderSpec } from '../../../util/hcl.util';
import { TYPES } from '../../../inversify.types';
import { PolicyRootService, VAULT_ROOT_CLOUDS } from '../policy-root.service';
import { ConfigService } from '../../../services/config.service';

@injectable()
/**
 * Cloud policy service root
 */
export class CloudPolicyService implements PolicyRootService<string> {
  /**
   * Constructor.
   */
  constructor(
    @inject(TYPES.ConfigService) private configService: ConfigService,
    @inject(TYPES.Logger) private logger: winston.Logger,
  ) {}

  /**
   * The name of this policy root
   * @returns The name of this policy root
   */
  getName(): string {
    return VAULT_ROOT_CLOUDS;
  }

  /**
   * Set the path to the cloud policy config
   */
  private static readonly cloudPolicyConfigPath = path.join(
    __dirname,
    '../../../../config/templates/clouds',
  );

  /**
   * Builds the hlc render spec for this policy root.
   * If cloudName is provided, builds specs for that cloud only.
   * Otherwise builds specs for all configured clouds.
   * @param cloudName Optional cloud collection name (e.g. 'cloud-team-openshift', 'cloud-team-aws', 'cloud-team-azure'')
   * @returns An array of HclRenderSpec
   */
  async build(cloudName?: string): Promise<HclRenderSpec[]> {
    const clouds = [
      ...new Set(
        (cloudName ? [cloudName] : await this.configService.getClouds())
          .map((cloud) => cloud?.trim().toLowerCase())
          .filter((cloud): cloud is string => !!cloud),
      ),
    ];
    this.logger.debug(`Build cloud: ${clouds.join(', ')}`);
    const cloudSpecs: HclRenderSpec[] = [];
    const templateFiles = fs
      .readdirSync(CloudPolicyService.cloudPolicyConfigPath)
      .filter((file) => file.endsWith('.hcl.tpl'))
      .sort();
    for (const cloud of clouds) {
      const data = {
        secretKvCloudPath: VAULT_ROOT_CLOUDS,
        cloudName: cloud,
      };
      for (const file of templateFiles) {
        cloudSpecs.push({
          group: VAULT_ROOT_CLOUDS,
          templateName: path.basename(file, '.hcl.tpl'),
          data,
        });
      }
    }
    return cloudSpecs;
  }
}
