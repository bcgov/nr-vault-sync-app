
path "secret/data/app/<%= project %>/<%= application %>" {
  capabilities = ["read"]
}

<% environments.forEach(function(environment){ %>
path "secret/data/app/<%= project %>/<%= application %>/<%= environment %>" {
  capabilities = ["read"]
}

<% }); %>