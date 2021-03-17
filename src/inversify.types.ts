// file types.ts

const TYPES = {
  AppService: Symbol.for('AppService'),
  ConfigService: Symbol.for('ConfigService'),
  GroupImport: Symbol.for('GroupImport'),
  KeycloakAdminClient: Symbol.for('KeycloakAdminClient'),
  KeycloakRoleController: Symbol.for('KeycloakRoleController'),
  Logger: Symbol.for('Logger'),
  PolicyRegistrationService: Symbol.for('PolicyRegistrationService'),
  VaultPolicyController: Symbol.for('VaultPolicyController'),
  VaultController: Symbol.for('VaultController'),
  Vault: Symbol.for('Vault'),
};

export {TYPES};
