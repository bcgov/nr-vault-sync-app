path "<%= secretKvCloudPath %>/subkeys/<%= cloudName %>/+/nr-broker-sync" {
  capabilities = ["read"]
}

path "<%= secretKvCloudPath %>/metadata/<%= cloudName %>/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "<%= secretKvCloudPath %>/data/<%= cloudName %>/+/nr-broker-sync" {
  capabilities = ["create", "update", "read", "delete", "patch"]
}

path "<%= secretKvCloudPath %>/destroy/<%= cloudName %>/+/nr-broker-sync" {
  capabilities = ["update"]
}