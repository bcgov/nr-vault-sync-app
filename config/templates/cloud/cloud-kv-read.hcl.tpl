path "<%= secretKvCloudPath %>/config" {
  capabilities = ["read"]
}
path "<%= secretKvCloudPath %>/subkeys/openshift" {
  capabilities = ["list"]
}

path "<%= secretKvCloudPath %>/metadata/openshift" {
  capabilities = ["read", "list"]
}

path "<%= secretKvCloudPath %>/data/openshift" {
  capabilities = ["list"]
}

path "<%= secretKvCloudPath %>/subkeys/openshift/+" {
  capabilities = ["read"]
}

path "<%= secretKvCloudPath %>/metadata/openshift/+" {
  capabilities = ["read", "list"]
}

path "<%= secretKvCloudPath %>/data/openshift/+" {
  capabilities = ["read"]
}

path "<%= secretKvCloudPath %>/subkeys/openshift/+/+" {
  capabilities = ["read"]
}

path "<%= secretKvCloudPath %>/metadata/openshift/+/+" {
  capabilities = ["read", "list"]
}

path "<%= secretKvCloudPath %>/data/openshift/+/+" {
  capabilities = ["read"]
}