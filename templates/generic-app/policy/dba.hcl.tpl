path "secret/data/app/<%= project %>/<%= application %>" {
  capabilities = ["create", "update", "read"]
  allowed_parameters = {
    "db-*" = []
  }
}

<% environments.forEach(function(environment){ %>
path "secret/data/app/<%= project %>/<%= application %>/<%= environment %>" {
  capabilities = ["create", "update", "read"]
  allowed_parameters = {
    "db-*" = []
  }
}

<% }); %>