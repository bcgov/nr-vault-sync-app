# Sync app (<%= syncName %>) for <%= secretKvPath %>/
# Scope: Users with administrative access to this kv secret engine
# Comment: 'p' -> project, 's' -> service

# Service-level sync:
# Project-level sync: s -> 'shared'
# path: secret-mount-path/data/p/s/<%= syncName %>/+
path "<%= secretKvPath %>/data/+/+/<%= syncName %>/+" {
  capabilities = ["create", "update", "patch"]
}
# path: secret-mount-path/metadata/p/s/<%= syncName %>/+
path "<%= secretKvPath %>/data/+/+/<%= syncName %>/+" {
  capabilities = ["create", "update", "patch"]
}
