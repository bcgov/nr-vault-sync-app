
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

path "<%= secretKvPath %>/data/<%= environment %>/<%= project %>/+" {
  capabilities = ["read"]
}

path "apps/metadata/<%= environment %>/<%= project %>/+/+" {
  capabilities = ["read", "list"]
}

path "<%= secretKvPath %>/data/<%= environment %>/<%= project %>/+/+" {
  capabilities = ["read"]
}
