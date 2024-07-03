# DB read/write policy for application/user

path "<%= secretDbPath %>/<%= environment %>/creds/<%= dbType %>-<%= dbName %>-<%= application %>-readwrite" {
  capabilities = ["read"]
}
