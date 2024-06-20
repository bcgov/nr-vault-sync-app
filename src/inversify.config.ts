import { Container } from 'inversify';
import { logger } from './logger';
import { TYPES } from './inversify.types';
import { AppService } from './services/app.service';
import VaultPolicyController from './vault/vault-policy.controller';
import { vaultFactory } from './vault/vault.factory';
import nv from 'node-vault';
import { ConfigService } from './services/config.service';
import winston from 'winston';
import VaultGroupController from './vault/vault-group.controller';
import EnvironmentUtil from './util/environment.util';
import HclUtil from './util/hcl.util';
import VaultApi from './vault/vault.api';
import { PolicyRootService } from './vault/policy-roots/policy-root.service';
import { SystemPolicyService } from './vault/policy-roots/impl/system-policy.service';
import { AppPolicyService } from './vault/policy-roots/impl/app-policy.service';
import { GroupPolicyService } from './vault/policy-roots/impl/group-policy.service';
import VaultApproleController from './vault/vault-approle.controller';
import { ConfigBrokerService } from './services/impl/config-broker.service';
import { BrokerApi } from './broker/broker.api';
import { ConfigFileService } from './services/impl/config-file.service';
import { AppBrokerService } from './services/impl/app-broker.service';
import { RegistrationService } from './services/registration.service';
import { RegistrationMemoryService } from './services/impl/registration-memory.service';
import BrokerMonitorController from './broker/broker-monitor.controller';
import FsUtil from './util/fs.util';

const vsContainer = new Container();
// Services
vsContainer.bind<BrokerApi>(BrokerApi).to(BrokerApi).inSingletonScope();
vsContainer.bind<AppService>(TYPES.AppService).to(AppBrokerService);
vsContainer.bind<ConfigService>(TYPES.ConfigService).to(ConfigBrokerService);
vsContainer.bind<ConfigFileService>(ConfigFileService).to(ConfigFileService);

vsContainer
  .bind<RegistrationService>(TYPES.RegistrationService)
  .to(RegistrationMemoryService);

// Bind policy roots for multi-inject
vsContainer
  .bind<PolicyRootService<unknown>>(TYPES.PolicyRootService)
  .to(SystemPolicyService);
vsContainer
  .bind<PolicyRootService<unknown>>(TYPES.PolicyRootService)
  .to(AppPolicyService);
vsContainer
  .bind<PolicyRootService<unknown>>(TYPES.PolicyRootService)
  .to(GroupPolicyService);
// Bind policy roots for individual inject
vsContainer
  .bind<SystemPolicyService>(TYPES.SystemPolicyService)
  .to(SystemPolicyService);
vsContainer.bind<AppPolicyService>(TYPES.AppPolicyService).to(AppPolicyService);
vsContainer
  .bind<GroupPolicyService>(TYPES.GroupPolicyService)
  .to(GroupPolicyService);

// Controllers
vsContainer
  .bind<BrokerMonitorController>(TYPES.BrokerMonitorController)
  .to(BrokerMonitorController);
vsContainer
  .bind<VaultApproleController>(TYPES.VaultApproleController)
  .to(VaultApproleController);
vsContainer
  .bind<VaultPolicyController>(TYPES.VaultPolicyController)
  .to(VaultPolicyController);
vsContainer
  .bind<VaultGroupController>(TYPES.VaultGroupController)
  .to(VaultGroupController);

// Util
vsContainer.bind<EnvironmentUtil>(TYPES.EnvironmentUtil).to(EnvironmentUtil);
vsContainer.bind<HclUtil>(TYPES.HclUtil).to(HclUtil);
vsContainer.bind<FsUtil>(TYPES.FsUtil).to(FsUtil);
vsContainer.bind<VaultApi>(TYPES.VaultApi).to(VaultApi);

// Logging
vsContainer.bind<winston.Logger>(TYPES.Logger).toConstantValue(logger);

export { vsContainer };

/**
 * Bind Broker api to the vs container
 * @param basePath The base api url
 * @param token The Jira username
 */
export function bindBroker(apiUrl: string, token: string | undefined): void {
  vsContainer.bind<string>(TYPES.BrokerApiUrl).toConstantValue(apiUrl);
  if (token) {
    vsContainer.bind<string>(TYPES.BrokerToken).toConstantValue(token);
  }
}

/**
 * Bind vault api to the vs container
 * @param addr The vault address
 * @param token The vault token
 */
export function bindVault(addr: string, token: string): void {
  vsContainer
    .bind<nv.client>(TYPES.Vault)
    .toConstantValue(vaultFactory(addr, token));
}
