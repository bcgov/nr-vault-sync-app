path "<%= secretKvCloudPath %>/subkeys/openshift" {
  capabilities = ["create", "update", "patch", "delete"]
}

path "<%= secretKvCloudPath %>/metadata/openshift" {
  capabilities = ["create", "update", "patch", "delete"]
}

path "<%= secretKvCloudPath %>/data/openshift" {
  capabilities = ["create", "update", "patch", "delete"]
}

path "<%= secretKvCloudPath %>/subkeys/openshift/+" {
  capabilities = ["create", "update", "patch", "delete"]
}

path "<%= secretKvCloudPath %>/metadata/openshift/+" {
  capabilities = ["create", "update", "patch", "delete"]
}

path "<%= secretKvCloudPath %>/data/openshift/+" {
  capabilities = ["create", "update", "patch", "delete"]
}

path "<%= secretKvCloudPath %>/subkeys/openshift/+/+" {
  capabilities = ["create", "update", "patch", "delete"]
}

path "<%= secretKvCloudPath %>/metadata/openshift/+/+" {
  capabilities = ["create", "update", "patch", "delete"]
}

path "<%= secretKvCloudPath %>/data/openshift/+/+" {
  capabilities = ["create", "update", "patch", "delete"]
}

path "<%= secretKvCloudPath %>/delete/openshift/+" {
  capabilities = ["create", "update"]
}

path "<%= secretKvCloudPath %>/delete/openshift/+/+" {
  capabilities = ["create", "update"]
}

path "<%= secretKvCloudPath %>/undelete/openshift/+" {
  capabilities = ["create", "update"]
}

path "<%= secretKvCloudPath %>/undelete/openshift/+/+" {
  capabilities = ["create", "update"]
}

path "<%= secretKvCloudPath %>/destroy/openshift/+" {
  capabilities = ["create", "update"]
}

path "<%= secretKvCloudPath %>/destroy/openshift/+/+" {
  capabilities = ["create", "update"]
}