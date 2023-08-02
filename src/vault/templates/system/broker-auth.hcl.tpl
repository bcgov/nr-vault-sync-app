# Authentication policy for global broker
# Scope: Broker Approle

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