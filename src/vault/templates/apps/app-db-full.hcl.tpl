# DB full access policy for application/user

path "<%= secertDbPath %>/<%= environment %>/creds/<%= dbType %>-<%= dbName %>-<%= application %>-full" {
  capabilities = ["read"]
}
