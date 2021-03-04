# Super-admin policy
# Scope: All super admins

path "*" {
  capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}
