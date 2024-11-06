# Groups policy
# Scope: Users in different groups  (e.g. appdelivery, infra, dba)

<% if (locals.kv) { %>

path "<%= kv %>/config" {
  capabilities = ["read"]
}

path "<%= kv %>/metadata/*" {
  capabilities = ["create", "read", "delete", "update", "list"]
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
