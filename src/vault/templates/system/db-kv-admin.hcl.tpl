# Key value admin for <%= secertKvPath %>/
# Scope: Users with administrative access to this kv secret engine

path "<%= secertKvPath %>/+/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
  allowed_parameters = {
    "db_secret" = []
  }
}
