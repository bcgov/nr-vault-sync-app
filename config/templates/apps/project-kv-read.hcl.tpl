
path "<%= secretKvPath %>/metadata" {
  capabilities = ["list"]
}

path "apps/metadata/<%= environment %>" {
  capabilities = ["list"]
}

path "apps/metadata/<%= environment %>/<%= project %>" {
  capabilities = ["read", "list"]
}

path "apps/metadata/<%= environment %>/<%= project %>/+" {
  capabilities = ["read", "list"]
}

path "apps/subkeys/<%= environment %>/<%= project %>" {
  capabilities = ["read"]
}

path "apps/subkeys/<%= environment %>/<%= project %>/+" {
  capabilities = ["read"]
}

path "apps/subkeys/<%= environment %>/<%= project %>/+/+" {
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
