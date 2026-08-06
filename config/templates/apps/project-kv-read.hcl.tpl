
path "<%= secretKvPath %>/metadata" {
  capabilities = ["list"]
}

path "<%= secretKvPath %>/metadata/<%= environment %>" {
  capabilities = ["list"]
}

path "<%= secretKvPath %>/metadata/<%= environment %>/<%= project %>" {
  capabilities = ["read", "list"]
}

path "<%= secretKvPath %>/metadata/<%= environment %>/<%= project %>/+" {
  capabilities = ["read", "list"]
}

path "<%= secretKvPath %>/subkeys/<%= environment %>/<%= project %>" {
  capabilities = ["read"]
}

path "<%= secretKvPath %>/subkeys/<%= environment %>/<%= project %>/+" {
  capabilities = ["read"]
}

path "<%= secretKvPath %>/subkeys/<%= environment %>/<%= project %>/+/+" {
  capabilities = ["read"]
}

path "<%= secretKvPath %>/data/<%= environment %>/<%= project %>/+" {
  capabilities = ["read"]
}

path "<%= secretKvPath %>/metadata/<%= environment %>/<%= project %>/+/+" {
  capabilities = ["read", "list"]
}

path "<%= secretKvPath %>/data/<%= environment %>/<%= project %>/+/+" {
  capabilities = ["read"]
}
