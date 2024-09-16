# Read policy for tools space
# Scope: apps/data/tools access

path "<%= secretKvPath %>/data/tools/+/+" {
  capabilities = ["read"]
}

path "<%= secretKvPath %>/metadata/tools/+/+" {
  capabilities = ["read", "list"]
}

path "<%= secretKvPath %>/config" {
  capabilities = ["read"]
}