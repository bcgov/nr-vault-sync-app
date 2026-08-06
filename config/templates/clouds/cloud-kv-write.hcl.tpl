
path "<%= secretKvCloudPath %>/subkeys/<%= cloudName %>/+/nr-broker-sync" {
  capabilities = ["read"]
}

path "<%= secretKvCloudPath %>/data/<%= cloudName %>/+/+" {
  capabilities = ["create", "update", "read", "delete", "patch"]
}

path "<%= secretKvCloudPath %>/metadata/<%= cloudName %>" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "<%= secretKvCloudPath %>/metadata/<%= cloudName %>/+" {
  capabilities = ["create", "update", "patch", "delete"]
}

path "<%= secretKvCloudPath %>/metadata/<%= cloudName %>/+/+" {
  capabilities = ["create", "update", "patch", "delete"]
}

path "<%= secretKvCloudPath %>/undelete/<%= cloudName %>/+/+" {
  capabilities = ["update"]
}

path "<%= secretKvCloudPath %>/destroy/<%= cloudName %>/+/+" {
  capabilities = ["update"]
}
