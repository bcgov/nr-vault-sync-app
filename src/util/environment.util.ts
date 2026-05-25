import { injectable } from 'inversify';

/**
 * Library of environment aliases
 */
const envAlias: Record<string, string> = {
  PRODUCTION: 'prod',
  TEST: 'test',
  DELIVERY: 'dev',
  DEVELOPMENT: 'dev',
  INTEGRATION: 'dev',
  WFPRD: 'prod',
  WFTST: 'test',
  WFDLV: 'dev',
  WFINT: 'dev',
  SMTPRODUCTION: 'prod',
  SMTTEST: 'test',
  SMTDELIVERY: 'dev',
  TOOLS: 'tools',
  tools: 'tools',
  dev: 'dev',
  test: 'test',
  prod: 'prod',
};

const envShortToLong: Record<string, string> = {
  prod: 'production',
  test: 'test',
  dev: 'development',
  tools: 'tools',
};

@injectable()
/**
 * Utility class for environment strings
 */
export default class EnvironmentUtil {
  /**
   * Normalize evironment names
   * @param environment The string to normalize
   */
  public static normalize(environment: string): string {
    if (environment in envAlias) {
      return envAlias[environment];
    }
    throw new Error(`Unsupported env: ${environment}`);
  }

  /**
   * Get the long form of an environment name
   * @param environment The string to get the long form of
   */
  public static getLongForm(environment: string): string {
    if (environment in envShortToLong) {
      return envShortToLong[environment];
    }
    throw new Error(`Unsupported env: ${environment}`);
  }
}
