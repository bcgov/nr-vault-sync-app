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
  capabilities = ["create", "update", "patch"]
}
