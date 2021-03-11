# Super-admin policy
# Scope: All super admins - Should not be used except for recovery

path "*" {
  capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}
