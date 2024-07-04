# DB admin policy
# Scope: Database admin users

path "<%= secretDbPath %>" {
  capabilities = ["list"]
}

path "<%= secretDbPath %>/+" {
  capabilities = ["list"]
}

path "<%= secretDbPath %>/+/config" {
  capabilities = ["list"]
}

path "<%= secretDbPath %>/+/config/*" {
  capabilities = ["create", "read", "update", "delete"]
}

path "<%= secretDbPath %>/+/reset/*" {
  capabilities = ["create", "update"]
}

path "<%= secretDbPath %>/+/rotate-root/*" {
  capabilities = ["create", "update"]
}

path "<%= secretDbPath %>/+/roles" {
  capabilities = ["list"]
}

path "<%= secretDbPath %>/+/roles/*" {
  capabilities = ["create", "read", "update", "delete"]
}

path "<%= secretDbPath %>/+/creds/*" {
  capabilities = ["read"]
}
