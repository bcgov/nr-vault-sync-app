
path "<%= secertKvPath %>/metadata" {
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

path "<%= secertKvPath %>/data/<%= environment %>/<%= project %>/+" {
  capabilities = ["read"]
}

path "apps/metadata/<%= environment %>/<%= project %>/+/+" {
  capabilities = ["read", "list"]
}

path "<%= secertKvPath %>/data/<%= environment %>/<%= project %>/+/+" {
  capabilities = ["read"]
}
