// file types.ts

const TYPES = {
  AppPolicyService: Symbol.for('AppPolicyService'),
  AppService: Symbol.for('AppService'),
  ConfigService: Symbol.for('ConfigService'),
  EnvironmentUtil: Symbol.for('EnvironmentUtil'),
  GroupPolicyService: Symbol.for('GroupPolicyService'),
  HclUtil: Symbol.for('HclUtil'),
  Logger: Symbol.for('Logger'),
  PolicyRegistrationService: Symbol.for('PolicyRegistrationService'),
  PolicyRootService: Symbol.for('PolicyRootService'),
  SystemPolicyService: Symbol.for('SystemPolicyService'),
  Vault: Symbol.for('Vault'),
  VaultApi: Symbol.for('VaultApi'),
  VaultApproleController: Symbol.for('VaultApproleController'),
  VaultPolicyController: Symbol.for('VaultPolicyController'),
  VaultGroupController: Symbol.for('VaultGroupController'),
};

export {TYPES};
