path "<%= secretKvCloudPath %>/metadata/<%= cloudName %>/*" {
  capabilities = ["list"]
}

path "<%= secretKvCloudPath %>/subkeys/<%= cloudName %>/+/nr-broker-sync" {
  capabilities = ["read"]
}

path "<%= secretKvCloudPath %>/data/<%= cloudName %>/+/nr-broker-sync" {
  capabilities = ["read"]
}
