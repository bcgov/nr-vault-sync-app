/**
 * Application details
 */
export interface Group {
  name: string;
  users: string[];
}

/**
 * Service for retrieving Vault groups and Keycloak Scopes & Users
 */
export interface GroupImportService {
  /**
   * Returns an array of Scopes/Groups.
   */
  getGroups(): Group[];
}

