#
# Scope: Users with admin 

path "<%= secertKvPath %>/+/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
