path "secret/data/app/<%= project %>/<%= application %>" {
  capabilities = ["create", "update", "read", "delete", "list"]
}

<% environments.forEach(function(environment){ %>
path "secret/data/app/<%= project %>/<%= application %>/<%= environment %>" {
  capabilities = ["create", "update", "read", "delete"]
}

<% }); %>