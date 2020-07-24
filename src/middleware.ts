import * as winston from 'winston';
import {format} from 'winston';
import nv from 'node-vault';

// eslint-disable-next-line no-unused-vars
import {Arguments} from 'yargs';

export let vault: nv.client; 
const defaultLogLevel = 2;
const LOG_LEVEL_MIN = 0;
const LOG_LEVEL_MAX = 5;
const lvlToStr = [
  'error',
  'warn',
  'info',
  'verbose',
  'debug',
  'silly',
];

/**
 * This yargs middleware outputs a standard banner
 */
export function outputBanner() {
  winston.info('Vault Policy');
}

/**
 * This yargs middleware setups of node vault.
 * @param argv The yargs arguements
 */
export function setupVault(argv: Arguments) {
  console.log({
    apiVersion: 'v1',
    endpoint: argv.vaultAddr as string || process.env.VAULT_ADDR || 'http://127.0.0.1:8200',
    token: argv.vaultToken as string || process.env.VAULT_TOKEN || 'myroot',
  });
  vault = nv({
    apiVersion: 'v1',
    endpoint: argv.vaultAddr as string || process.env.VAULT_ADDR || 'http://127.0.0.1:8200',
    token: argv.vaultToken as string || process.env.VAULT_TOKEN || 'myroot',
  });
}


/**
 * Ultility function to clamp value between a minimum and maximum.
 * @param num The number to clamp
 * @param min The minimum value to return
 * @param max The maximum value to return
 * @returns The number or the minimum or maximum if the number is smaller
 *          than or greater than the minimum or maximum, respectively.
 */
function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
};

/**
 * This yargs middleware configures the logger.
 * @param argv The yargs arguements
 */
export function configureLogger(argv: Arguments) {
  const logLevel = clamp(defaultLogLevel + (argv.v as number) - (argv.q as number),
      LOG_LEVEL_MIN, LOG_LEVEL_MAX);

  return winston.configure({
    format: format.combine(
      format.cli(),
    ),
    transports: [
      new winston.transports.Console(),
    ],
    level: lvlToStr[logLevel],
  });
}
