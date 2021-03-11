
path "<%= secertKvPath %>/metadata" {
  capabilities = ["list"]
}

path "apps/metadata/<%= environment %>" {
  capabilities = ["list"]
}

path "apps/metadata/<%= environment %>/<%= project %>" {
  capabilities = ["list", "read"]
}

path "apps/metadata/<%= environment %>/<%= project %>/*" {
  capabilities = ["list", "read"]
}

path "<%= secertKvPath %>/data/<%= environment %>/<%= project %>/*" {
  capabilities = ["read", "list"]
}
