# Key value admin for <%= secretKvPath %>/
# Scope: Users with administrative access to this kv secret engine

path "<%= secretKvPath %>/+/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "<%= secretKvPath %>/config" {
  capabilities = ["read", "update"]
}
