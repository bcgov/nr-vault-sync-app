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

<% kvPaths.forEach(function(secretKvPath){ %>
path "<%= secretKvPath %>/subkeys/tools/+/+" {
  capabilities = ["read"]
}
path "<%= secretKvPath %>/data/tools/+/+" {
  capabilities = ["update"]
}
<% }); %>
