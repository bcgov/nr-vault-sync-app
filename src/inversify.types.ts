// file types.ts

const TYPES = {
  AppService: Symbol.for('AppService'),
  ConfigService: Symbol.for('ConfigService'),
  EnvironmentUtil: Symbol.for('EnvironmentUtil'),
  HclUtil: Symbol.for('HclUtil'),
  Logger: Symbol.for('Logger'),
  PolicyRegistrationService: Symbol.for('PolicyRegistrationService'),
  VaultPolicyController: Symbol.for('VaultPolicyController'),
  VaultGroupController: Symbol.for('VaultGroupController'),
  Vault: Symbol.for('Vault'),
};

export {TYPES};
