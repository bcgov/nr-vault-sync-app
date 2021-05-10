import {HlcRenderSpec} from '../../../util/hcl.util';
import {PolicyRootService, VAULT_ROOT_GROUPS} from '../policy-root.service';
import winston from 'winston';
import {inject, injectable} from 'inversify';
import {TYPES} from '../../../inversify.types';
import {ConfigService, GroupConfig} from '../../../services/config.service';

@injectable()
/**
 * Group policy service root
 */
export class GroupPolicyService implements PolicyRootService<GroupConfig> {
  /**
   * Constructor.
   */
  constructor(
    @inject(TYPES.ConfigService) private config: ConfigService,
    @inject(TYPES.Logger) private logger: winston.Logger) {}

  /**
   * The name of this policy root
   * @returns The name of this policy root
   */
  getName(): string {
    return VAULT_ROOT_GROUPS;
  }

  /**
   * Builds the hlc render spec for this policy root
   * @returns An array of HlcRenderSpec
   */
  async build(limitTo?: GroupConfig): Promise<HlcRenderSpec[]> {
    if (limitTo) {
      return [this.buildGroup(limitTo)];
    }
    return this.buildGroups();
  }

  /**
   * Syncs policies with vault for groups
   */
  public async buildGroups(): Promise<HlcRenderSpec[]> {
    const groups = await this.config.getGroups();
    return groups.map((group) => this.buildGroup(group));
  }

  /**
   * Syncs policies with vault for groups
   */
  public buildGroup(group: GroupConfig): HlcRenderSpec {
    this.logger.debug(`Build group: ${group.name}`);
    return {
      group: VAULT_ROOT_GROUPS,
      templateName: 'user',
      data: {
        ...group,
      },
    };
  }
}
