# Sync app (<%= syncName %>) for <%= secretKvPath %>/
# Scope: Users with administrative access to this kv secret engine
# Comment: 'env' -> environment, 'p' -> project, 's' -> service or shared (project-level)

# path: secret-mount-path/data/env/p/s/<%= syncName %>/+
path "<%= secretKvPath %>/data/dev/+/+/<%= syncName %>/+" {
  capabilities = ["create", "update", "patch"]
}
path "<%= secretKvPath %>/data/test/+/+/<%= syncName %>/+" {
  capabilities = ["create", "update", "patch"]
}
path "<%= secretKvPath %>/data/prod/+/+/<%= syncName %>/+" {
  capabilities = ["create", "update", "patch"]
}
# path: secret-mount-path/metadata/env/p/s/<%= syncName %>/+
path "<%= secretKvPath %>/metadata/dev/+/+/<%= syncName %>/+" {
  capabilities = ["create", "read", "list", "update", "patch"]
}
path "<%= secretKvPath %>/metadata/test/+/+/<%= syncName %>/+" {
  capabilities = ["create", "read", "list", "update", "patch"]
}
path "<%= secretKvPath %>/metadata/prod/+/+/<%= syncName %>/+" {
  capabilities = ["create", "read", "list", "update", "patch"]
}
