# Key value developer for <%= secertKvPath %>/
# Scope: Users with developer access to this kv secret engine

path "<%= secertKvPath %>/config" {
  capabilities = ["read"]
}
