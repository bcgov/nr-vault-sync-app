// eslint-disable-next-line no-unused-vars
import {Argv, Arguments, Options} from 'yargs';
import * as winston from 'winston';
import { PolicyApi } from '../api/policy.api';

export const command = 'sync';
export const aliases = [];
export const describe = 'Sync policies to vault server';
export const builder = (yargs: Argv) => {
  return yargs
      .options(
          Object.assign({}) as { [key: string]: Options });
};
export const handler = async (argv: Arguments) => {
  const policyApi = new PolicyApi();

  const prjName = argv.prjName as string;
  const appName = argv.appName as string;

  winston.info('Sync policies');

  if (appName) {
    await policyApi.sync('environment/project/application', prjName, appName);
  }

  if (prjName) {
    await policyApi.sync('environment/project', prjName, appName);
  }

};
