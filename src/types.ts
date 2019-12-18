export interface TemplateConfig {
  key: string;
  template: string;
  environments: string[];
  policyext: PolicyExtension;
};

export interface ProjectConfig {
  project: TemplateConfig;
  applications: Array<TemplateConfig>;
};

export interface Deliverable {
  sync(): Promise<any>;
};

export interface AppRoleConfig {
  // eslint-disable-next-line camelcase
  role_name: string;
  // eslint-disable-next-line camelcase
  token_policies: string[];
}

export interface GroupConfig {
  name: string;
  type: 'internal' | 'external';
  metadata: any;
  policies: string[];
  // eslint-disable-next-line camelcase
  member_group_ids: string[];
}

export interface PolicyConfig {
  name: string;
  template: string;
}

export interface TemplateConfig {
  appRole: AppRoleConfig;
  groups: GroupConfig[];
  policies: PolicyConfig[];
}

export interface DeliverableSubs {
  [key: string]: string | string[];
}

export interface PolicyExtension {
  [key: string]: string[];
}
