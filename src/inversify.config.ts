import {Container} from 'inversify';
import {logger} from './logger';
import {TYPES} from './inversify.types';
import {AppService} from './services/app.service';
import {AppFileService} from './services/impl/app-file.service';
import VaultPolicyController from './vault/vault-policy.controller';
import {vaultFactory} from './vault/vault.factory';
import nv from 'node-vault';
import {PolicyRegistrationMemoryService} from './services/impl/policy-registration-memory.service';
import {PolicyRegistrationService} from './services/policy-registration.service';
import {ConfigFileService} from './services/impl/config-file.service';
import {ConfigService} from './services/config.service';
import winston from 'winston';
import VaultGroupController from './vault/vault-group.controller';
import EnvironmentUtil from './util/environment.util';
import HclUtil from './util/hcl.util';

const vsContainer = new Container();
// Services
vsContainer.bind<AppService>(TYPES.AppService).to(AppFileService);
vsContainer.bind<ConfigService>(TYPES.ConfigService).to(ConfigFileService);
vsContainer.bind<PolicyRegistrationService>(TYPES.PolicyRegistrationService).to(PolicyRegistrationMemoryService);

// Controllers
vsContainer.bind<VaultPolicyController>(TYPES.VaultPolicyController).to(VaultPolicyController);
vsContainer.bind<VaultGroupController>(TYPES.VaultGroupController).to(VaultGroupController);

// Util
vsContainer.bind<EnvironmentUtil>(TYPES.EnvironmentUtil).to(EnvironmentUtil);
vsContainer.bind<HclUtil>(TYPES.HclUtil).to(HclUtil);

// Logging
vsContainer.bind<winston.Logger>(TYPES.Logger).toConstantValue(logger);

export {vsContainer};

/**
 * Bind vault api to the vs container
 * @param addr The vault address
 * @param token The vault token
 */
export function bindVault(addr: string, token: string) {
  vsContainer.bind<nv.client>(TYPES.Vault).toConstantValue(
    vaultFactory(addr, token));
}
