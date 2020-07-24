#!/usr/bin/env node
import * as yargs from 'yargs';
import * as winston from 'winston';
import {configureLogger, setupVault, outputBanner} from './middleware';

yargs
    .env('VAULT_POLICY')
    .middleware([configureLogger, setupVault, outputBanner])
    .options({
      'verbose': {
        alias: 'v',
        describe: 'Makes tool more verbose during the operation',
        type: 'count',
      },
      'quiet': {
        alias: 'q',
        describe: 'Makes tool less verbose during the operation',
        type: 'count',
      },
    })
    // Set explicitly as Windows messes this up
    .scriptName(__filename.endsWith('ts') ? 'npm run start --' : 'vaultpolicy')
    .usage('Usage: $0 <command> [options]')
    .commandDir('commands', {
      extensions: ['js', 'ts'],
    })
    .demandCommand()
    .help('h')
    .alias('h', 'help')
    .fail(function(msg, err, yargs) {
      if (err) {
        // Log thrown error to ensure passwords are masked and exit
        winston.error(err);
        process.exit(1);
      } else {
        // "Normal" yargs issue goes directly to console
        console.log(yargs.help());
        process.exit();
      }
    })
    .argv;
