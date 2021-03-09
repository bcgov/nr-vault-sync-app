
path "<%= secertKvPath %>/data/<%= project %>/<%= application %>" {
  capabilities = ["read", "list"]
}

path "<%= secertKvPath %>/data/<%= project %>/<%= application %>/*" {
  capabilities = ["read", "list"]
}
