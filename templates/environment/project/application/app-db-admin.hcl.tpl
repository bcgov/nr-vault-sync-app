path "<%= databasePath %>/config" {
  capabilities = ["list"]
}

path "<%= databasePath %>/config/<%= project %>-<%= application %>-*" {
  capabilities = ["create", "read", "update", "delete"]
}

path "<%= databasePath %>/reset/<%= project %>-<%= application %>-*" {
  capabilities = ["create", "update"]
}

path "<%= databasePath %>/rotate-root/<%= project %>-<%= application %>-*" {
  capabilities = ["create", "update"]
}

path "<%= databasePath %>/roles" {
  capabilities = ["list"]
}

path "<%= databasePath %>/roles/<%= project %>-<%= application %>-*" {
  capabilities = ["create", "read", "update", "delete"]
}

path "<%= databasePath %>/creds/<%= project %>-<%= application %>-*" {
  capabilities = ["read"]
}
