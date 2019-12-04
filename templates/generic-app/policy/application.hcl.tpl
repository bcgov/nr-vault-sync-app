# Login with AppRole
path "auth/approle/login" {
  capabilities = [ "create", "read" ]
}

path "secret/data/app/<%= project %>/<%= application %>" {
  capabilities = ["read"]
}

<% environments.forEach(function(environment){ %>
path "secret/data/app/<%= project %>/<%= application %>/<%= environment %>" {
  capabilities = ["read"]
}

<% }); %>