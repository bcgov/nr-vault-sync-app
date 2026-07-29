import fs from 'fs';
import path from 'path';
import winston from 'winston';
import { inject, injectable } from 'inversify';
import { HlcRenderSpec } from '../../../util/hcl.util';
import { TYPES } from '../../../inversify.types';
import { PolicyRootService, VAULT_ROOT_CLOUD } from '../policy-root.service';

@injectable()
/**
 * Cloud policy service root
 */
export class CloudPolicyService implements PolicyRootService<undefined> {
  /**
   * Constructor.
   */
  constructor(@inject(TYPES.Logger) private logger: winston.Logger) {}

  /**
   * The name of this policy root
   * @returns The name of this policy root
   */
  getName(): string {
    return VAULT_ROOT_CLOUD;
  }

  /**
   * Set the path to the cloud policy config
   */
  private static readonly cloudPolicyConfigPath = path.join(
    __dirname,
    '../../../../config/templates/cloud',
  );

  /**
   * Builds the hlc render spec for this policy root
   * @returns An array of HlcRenderSpec
   */
  async build(): Promise<HlcRenderSpec[]> {
    this.logger.debug(`Build cloud`);
    const cloudSpecs: HlcRenderSpec[] = [];
    const templateFiles = fs.readdirSync(
      CloudPolicyService.cloudPolicyConfigPath,
    );
    const data = {
      secretKvCloudPath: VAULT_ROOT_CLOUD,
    };
    for (const file of templateFiles) {
      if (file.endsWith('.hcl.tpl')) {
        cloudSpecs.push({
          group: VAULT_ROOT_CLOUD,
          templateName: path.basename(file, '.hcl.tpl'),
          data,
        });
      }
    }
    return cloudSpecs;
  }
}
