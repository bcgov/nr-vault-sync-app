# Team policy
# Scope: Team users

<% if (locals.kv) { %>

path "<%= kv %>/metadata/*" {
  capabilities = ["list", "read", "delete"]
}

path "<%= kv %>/data/<%= name %>/*" {
  capabilities = ["create", "read", "delete", "update", "list"]
}

path "<%= kv %>/delete/<%= name %>/*" {
  capabilities = ["update"]
}

path "<%= kv %>/undelete/<%= name %>/*" {
  capabilities = ["update"]
}

path "<%= kv %>/destroy/<%= name %>/*" {
  capabilities = ["update"]
}

<% } %>
