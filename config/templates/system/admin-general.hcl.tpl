# Vault
# Scope: Administrative access 

# Read system health check
path "sys/health"
{
  capabilities = ["read", "sudo"]
}

# List policies
path "sys/policies/acl" {
   capabilities = ["list"]
}

# Manage policies
path "sys/policies/acl/*" {
   capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

# List auth methods
path "sys/auth"
{
  capabilities = ["read"]
}

# Create, update, and delete auth methods
path "sys/auth/*"
{
  capabilities = ["create", "update", "delete", "sudo"]
}

# List available secrets engines
path "sys/mounts" {
  capabilities = [ "read" ]
}

# Enable and manage secrets engines
path "sys/mounts/*" {
   capabilities = ["create", "read", "update", "delete", "list"]
}

# Create and manage entities and groups
path "identity/*" {
   capabilities = ["create", "read", "update", "delete", "list"]
}

# Manage tokens
path "auth/token/*" {
   capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

# List enabled audit devices
path "sys/audit"
{
  capabilities = ["read", "sudo"]
}

# View audit devices
path "sys/audit/*"
{
  capabilities = ["read", "sudo"]
}
