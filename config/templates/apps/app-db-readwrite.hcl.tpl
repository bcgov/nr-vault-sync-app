# DB read/write policy for application/user

path "<%= secertDbPath %>/<%= environment %>/creds/<%= dbType %>-<%= dbName %>-<%= application %>-readwrite" {
  capabilities = ["read"]
}
