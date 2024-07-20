# This file provides the policies required to run the vault sync

# Create and manage roles
path "auth/approle/*" {
  capabilities = [ "create", "read", "update", "delete", "list" ]
}

# Create and manage ACL policies
path "sys/policies/acl/*"
{
  capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

# Create and manage entities and groups
path "identity/group/*" {
  capabilities = [ "create", "read", "update", "delete", "list" ]
}
