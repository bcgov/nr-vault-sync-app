path "<%= databasePath %>/config" {
  capabilities = ["list"]
}

path "<%= databasePath %>/config/*" {
  capabilities = ["create", "read", "update", "delete"]
}

path "<%= databasePath %>/reset/*" {
  capabilities = ["create", "update"]
}

path "<%= databasePath %>/rotate-root/*" {
  capabilities = ["create", "update"]
}

path "<%= databasePath %>/roles" {
  capabilities = ["list"]
}

path "<%= databasePath %>/roles/*" {
  capabilities = ["create", "read", "update", "delete"]
}

path "<%= databasePath %>/creds/*" {
  capabilities = ["read"]
}
