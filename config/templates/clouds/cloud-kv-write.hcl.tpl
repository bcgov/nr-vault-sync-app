
path "<%= secretKvCloudsPath %>/subkeys/<%= cloudName %>/+/nr-broker-sync" {
  capabilities = ["read"]
}

path "<%= secretKvCloudsPath %>/data/<%= cloudName %>/+/+" {
  capabilities = ["create", "update", "read", "delete", "patch"]
}

path "<%= secretKvCloudsPath %>/metadata/<%= cloudName %>" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "<%= secretKvCloudsPath %>/metadata/<%= cloudName %>/+" {
  capabilities = ["create", "update", "patch", "delete"]
}

path "<%= secretKvCloudsPath %>/metadata/<%= cloudName %>/+/+" {
  capabilities = ["create", "update", "patch", "delete"]
}

path "<%= secretKvCloudsPath %>/undelete/<%= cloudName %>/+/+" {
  capabilities = ["update"]
}

path "<%= secretKvCloudsPath %>/destroy/<%= cloudName %>/+/+" {
  capabilities = ["update"]
}
