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
import VaultApi from './vault/vault.api';
import {PolicyRootService} from './vault/policy-roots/policy-root.service';
import {SystemPolicyService} from './vault/policy-roots/impl/system-policy.service';
import {AppPolicyService} from './vault/policy-roots/impl/app-policy.service';
import {GroupPolicyService} from './vault/policy-roots/impl/group-policy.service';

const vsContainer = new Container();
// Services
vsContainer.bind<AppService>(TYPES.AppService).to(AppFileService);
vsContainer.bind<ConfigService>(TYPES.ConfigService).to(ConfigFileService);
vsContainer.bind<PolicyRegistrationService>(TYPES.PolicyRegistrationService).to(PolicyRegistrationMemoryService);
// Bind policy roots for multi-inject
vsContainer.bind<PolicyRootService<any>>(TYPES.PolicyRootService).to(SystemPolicyService);
vsContainer.bind<PolicyRootService<any>>(TYPES.PolicyRootService).to(AppPolicyService);
vsContainer.bind<PolicyRootService<any>>(TYPES.PolicyRootService).to(GroupPolicyService);
// Bind policy roots for individual inject
vsContainer.bind<SystemPolicyService>(TYPES.SystemPolicyService)
  .to(SystemPolicyService);
vsContainer.bind<AppPolicyService>(TYPES.AppPolicyService)
  .to(AppPolicyService);
vsContainer.bind<GroupPolicyService>(TYPES.GroupPolicyService)
  .to(GroupPolicyService);

// Controllers
vsContainer.bind<VaultPolicyController>(TYPES.VaultPolicyController).to(VaultPolicyController);
vsContainer.bind<VaultGroupController>(TYPES.VaultGroupController).to(VaultGroupController);

// Util
vsContainer.bind<EnvironmentUtil>(TYPES.EnvironmentUtil).to(EnvironmentUtil);
vsContainer.bind<HclUtil>(TYPES.HclUtil).to(HclUtil);
vsContainer.bind<VaultApi>(TYPES.VaultApi).to(VaultApi);

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
