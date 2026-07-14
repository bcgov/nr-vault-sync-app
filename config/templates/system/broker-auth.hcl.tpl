# Authentication policy for global broker
# Scope: Broker Approle
# Warning: This policy is referenced by name. Ensure changes do not break references
# or character of this policy.

path "auth/<%= authMount %>/role/+/role-id" {
  capabilities = ["read"]
}

path "auth/<%= authMount %>/role/+/secret-id" {
  capabilities = ["update"]
}

<% restrictedPaths.forEach(function(path){ %>
path "auth/<%= authMount %>/role/<%= path %>" {
  capabilities = ["deny"]
}
<% }); %>

path "<%= secretKvAppsPath %>/subkeys/tools/+/+" {
  capabilities = ["read"]
}
path "<%= secretKvAppsPath %>/data/tools/+/+" {
  capabilities = ["create", "read", "update", "patch"]
}

<% envs.forEach(function(env){ %>
path "<%= secretKvAppsPath %>/subkeys/<%= env %>/+/infrastructure" {
  capabilities = ["read"]
}

path "<%= secretKvAppsPath %>/data/<%= env %>/+/infrastructure/nr-broker-sync" {
  capabilities = ["read"]
}

path "<%= secretKvPath %>/metadata/<%= env %>/+/infrastructure/nr-broker-sync" {
  capabilities = ["create", "read", "list", "update", "patch"]
}
<% }); %>
