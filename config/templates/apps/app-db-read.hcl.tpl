# DB read policy for application/user

path "<%= secretDbPath %>/<%= environment %>/creds/<%= dbType %>-<%= dbName %>-<%= application %>-read" {
  capabilities = ["read"]
}
