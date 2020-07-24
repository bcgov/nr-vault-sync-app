
path "<%= secertKvPath %>/data/<%= project %>/<%= application %>" {
  capabilities = ["update", "list"]
}

path "<%= secertKvPath %>/data/<%= project %>/<%= application %>/*" {
  capabilities = ["update", "list"]
}

