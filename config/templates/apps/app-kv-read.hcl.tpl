# Read policy for application
# Scope: Approle

<% if (appCanReadProject) { %>
path "<%= secretKvPath %>/metadata/<%= environment %>/<%= project %>/shared" {
  capabilities = ["read", "list"]
}

path "<%= secretKvPath %>/data/<%= environment %>/<%= project %>/shared" {
  capabilities = ["read"]
}
<% } %>

path "<%= secretKvPath %>/subkeys/<%= environment %>/<%= project %>/shared" {
  capabilities = ["read"]
}

<% appProjectSharedSync.forEach(function(sharedSync){ %>
path "<%= secretKvPath %>/subkeys/<%= environment %>/<%= project %>/shared/<%= sharedSync %>/+" {
  capabilities = ["read"]
}

path "<%= secretKvPath %>/metadata/<%= environment %>/<%= project %>/shared/<%= sharedSync %>/+" {
  capabilities = ["read", "list"]
}

path "<%= secretKvPath %>/data/<%= environment %>/<%= project %>/shared/<%= sharedSync %>/+" {
  capabilities = ["read"]
}

<% }); -%>
path "<%= secretKvPath %>/data/<%= environment %>/<%= project %>/<%= application %>" {
  capabilities = ["read"]
}

path "<%= secretKvPath %>/metadata/<%= environment %>/<%= project %>/<%= application %>" {
  capabilities = ["read", "list"]
}

path "apps/subkeys/<%= environment %>/<%= project %>/<%= application %>" {
  capabilities = ["read"]
}

path "<%= secretKvPath %>/data/<%= environment %>/<%= project %>/<%= application %>/+" {
  capabilities = ["read"]
}

path "<%= secretKvPath %>/metadata/<%= environment %>/<%= project %>/<%= application %>/+" {
  capabilities = ["read", "list"]
}

path "<%= secretKvPath %>/subkeys/<%= environment %>/<%= project %>/<%= application %>/+" {
  capabilities = ["read"]
}
<% appProjectSharedSync.forEach(function(sharedSync){ %>

path "<%= secretKvPath %>/data/<%= environment %>/<%= project %>/<%= application %>/<%= sharedSync %>/+" {
  capabilities = ["read"]
}

path "<%= secretKvPath %>/metadata/<%= environment %>/<%= project %>/<%= application %>/<%= sharedSync %>/+" {
  capabilities = ["read", "list"]
}

path "<%= secretKvPath %>/subkeys/<%= environment %>/<%= project %>/<%= application %>/<%= sharedSync %>/+" {
  capabilities = ["read"]
}

<% }); -%>
