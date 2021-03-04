
path "<%= secertKvPath %>/+/<%= project %>/<%= application %>" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "<%= secertKvPath %>/+/<%= project %>/<%= application %>/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
