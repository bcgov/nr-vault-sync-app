// file types.ts

const TYPES = {
  AppPolicyService: Symbol.for('AppPolicyService'),
  AppService: Symbol.for('AppService'),
  BrokerApi: Symbol.for('BrokerApi'),
  BrokerApiUrl: Symbol.for('BrokerApiUrl'),
  BrokerMonitorController: Symbol.for('BrokerMonitorController'),
  BrokerToken: Symbol.for('BrokerToken'),
  ConfigService: Symbol.for('ConfigService'),
  EnvironmentUtil: Symbol.for('EnvironmentUtil'),
  FsUtil: Symbol.for('FsUtil'),
  GenerateController: Symbol.for('GenerateController'),
  GroupPolicyService: Symbol.for('GroupPolicyService'),
  HclUtil: Symbol.for('HclUtil'),
  Logger: Symbol.for('Logger'),
  RegistrationService: Symbol.for('RegistrationService'),
  PolicyRootService: Symbol.for('PolicyRootService'),
  SystemPolicyService: Symbol.for('SystemPolicyService'),
  Vault: Symbol.for('Vault'),
  VaultApi: Symbol.for('VaultApi'),
  VaultApproleController: Symbol.for('VaultApproleController'),
  VaultPolicyController: Symbol.for('VaultPolicyController'),
  VaultGroupController: Symbol.for('VaultGroupController'),
};

export { TYPES };
