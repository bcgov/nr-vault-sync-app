
path "<%= secretKvCloudsPath %>/metadata" {
  capabilities = ["list"]
}

path "<%= secretKvCloudsPath %>/metadata/<%= cloudName %>" {
  capabilities = ["list"]
}

path "<%= secretKvCloudsPath %>/metadata/<%= cloudName %>/*" {
  capabilities = ["list"]
}

path "<%= secretKvCloudsPath %>/subkeys/<%= cloudName %>/* {
  capabilities = ["read"]
}

path "<%= secretKvCloudsPath %>/data/<%= cloudName %>/+/+" {
  capabilities = ["read"]
}
