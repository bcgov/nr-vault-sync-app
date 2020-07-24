path "<%= databasePath %>/config" {
  capabilities = ["list"]
}

path "<%= databasePath %>/config/<%= project %>-*" {
  capabilities = ["create", "read", "update", "delete"]
}

path "<%= databasePath %>/reset/<%= project %>-*" {
  capabilities = ["create", "update"]
}

path "<%= databasePath %>/rotate-root/<%= project %>-*" {
  capabilities = ["create", "update"]
}

path "<%= databasePath %>/roles" {
  capabilities = ["list"]
}

path "<%= databasePath %>/roles/<%= project %>-*" {
  capabilities = ["create", "read", "update", "delete"]
}

path "<%= databasePath %>/creds/<%= project %>-*" {
  capabilities = ["read"]
}
