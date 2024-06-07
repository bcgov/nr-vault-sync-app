# This file provides the policies required to run the vault policy generator

# Create and manage roles
path "auth/vs_apps_approle/*" {
  capabilities = [ "create", "read", "update", "delete", "list" ]
}

# Create and manage ACL policies
path "sys/policies/acl/*"
{
  capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

path "sys/policy"
{
  capabilities = ["read", "sudo"]
}

# Create and manage entities and groups
path "identity/group/*" {
  capabilities = [ "create", "read", "update", "delete", "list" ]
}

# Create and manage entities and groups
path "identity/lookup/group" {
  capabilities = [ "create", "read", "update", "delete", "list" ]
}

# Create and manage entities and groups
path "identity/group-alias" {
  capabilities = [ "create", "read", "update", "delete", "list" ]
}

# Read OIDC Accessor
path "sys/auth"
{
  capabilities = ["sudo", "read"]
}

# Take raft snapshot
path "sys/storage/raft/snapshot"
{
  capabilities = ["read"]
}