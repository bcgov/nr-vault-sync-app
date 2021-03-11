# Write policy for application
# Scope: Approle

path "<%= secertKvPath %>/data/<%= environment %>/<%= project %>/<%= application %>" {
  capabilities = ["create", "update", "list"]
}

path "<%= secertKvPath %>/data/<%= environment %>/<%= project %>/<%= application %>/+" {
  capabilities = ["create", "update", "list"]
}

