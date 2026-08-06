
path "<%= secretKvCloudPath %>/metadata" {
  capabilities = ["list"]
}

path "<%= secretKvCloudPath %>/metadata/<%= cloudName %>" {
  capabilities = ["list"]
}

path "<%= secretKvCloudPath %>/metadata/<%= cloudName %>/*" {
  capabilities = ["list"]
}

path "<%= secretKvCloudPath %>/subkeys/<%= cloudName %>/* {
  capabilities = ["read"]
}

path "<%= secretKvCloudPath %>/data/<%= cloudName %>/+/+" {
  capabilities = ["read"]
}
