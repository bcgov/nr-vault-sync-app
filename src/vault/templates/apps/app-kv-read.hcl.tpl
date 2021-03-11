# Read policy for application
# Scope: Approle

path "<%= secertKvPath %>/data/<%= environment %>/<%= project %>/<%= application %>" {
  capabilities = ["read", "list"]
}

path "<%= secertKvPath %>/data/<%= environment %>/<%= project %>/<%= application %>/*" {
  capabilities = ["read", "list"]
}
