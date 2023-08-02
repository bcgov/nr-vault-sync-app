import { HlcRenderSpec } from '../../util/hcl.util';

export const VAULT_ROOT_SYSTEM = 'system';
export const VAULT_ROOT_APPS = 'apps';
export const VAULT_ROOT_GROUPS = 'groups';

/**
 * Policy service root
 */
export interface PolicyRootService<a> {
  /**
   * The name of this policy root
   * @returns The name of this policy root
   */
  getName(): string;

  /**
   * Builds the hlc render spec for this policy root
   * @returns An array of HlcRenderSpec
   */
  build(limitTo?: a): Promise<HlcRenderSpec[]>;
}
