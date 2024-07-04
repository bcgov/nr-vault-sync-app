# DB full access policy for application/user

path "<%= secretDbPath %>/<%= environment %>/creds/<%= dbType %>-<%= dbName %>-<%= application %>-full" {
  capabilities = ["read"]
}
