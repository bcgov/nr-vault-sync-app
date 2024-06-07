# DB read policy for application/user

path "<%= secertDbPath %>/<%= environment %>/creds/<%= dbType %>-<%= dbName %>-<%= application %>-read" {
  capabilities = ["read"]
}
