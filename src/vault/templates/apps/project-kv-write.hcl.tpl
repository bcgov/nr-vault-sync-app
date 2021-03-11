
path "<%= secertKvPath %>/data/<%= environment %>/<%= project %>" {
  capabilities = ["create", "update"]
}

path "<%= secertKvPath %>/data/<%= environment %>/<%= project %>/+" {
  capabilities = ["create", "update"]
}

path "<%= secertKvPath %>/data/<%= environment %>/<%= project %>/+/+" {
  capabilities = ["create", "update"]
}
