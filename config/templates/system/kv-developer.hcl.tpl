# Key value developer for <%= secretKvPath %>/
# Scope: Users with developer access to this kv secret engine

path "<%= secretKvPath %>/config" {
  capabilities = ["read"]
}
