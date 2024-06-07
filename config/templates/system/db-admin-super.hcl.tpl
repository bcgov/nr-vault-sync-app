# DB admin policy
# Scope: Database admin users

path "<%= secertDbPath %>" {
  capabilities = ["list"]
}

path "<%= secertDbPath %>/+" {
  capabilities = ["list"]
}

path "<%= secertDbPath %>/+/config" {
  capabilities = ["list"]
}

path "<%= secertDbPath %>/+/config/*" {
  capabilities = ["create", "read", "update", "delete"]
}

path "<%= secertDbPath %>/+/reset/*" {
  capabilities = ["create", "update"]
}

path "<%= secertDbPath %>/+/rotate-root/*" {
  capabilities = ["create", "update"]
}

path "<%= secertDbPath %>/+/roles" {
  capabilities = ["list"]
}

path "<%= secertDbPath %>/+/roles/*" {
  capabilities = ["create", "read", "update", "delete"]
}

path "<%= secertDbPath %>/+/creds/*" {
  capabilities = ["read"]
}
