
path "<%= secertKvPath %>/data/<%= environment %>/<%= project %>" {
  capabilities = ["create", "update", "delete"]
}

path "<%= secertKvPath %>/data/<%= environment %>/<%= project %>/+" {
  capabilities = ["create", "update", "delete"]
}

path "<%= secertKvPath %>/data/<%= environment %>/<%= project %>/+/+" {
  capabilities = ["create", "update", "delete"]
}

path "<%= secertKvPath %>/metadata/<%= environment %>/<%= project %>/+" {
  capabilities = ["create", "update", "delete"]
}

path "<%= secertKvPath %>/metadata/<%= environment %>/<%= project %>/+/+" {
  capabilities = ["create", "update", "delete"]
}

path "<%= secertKvPath %>/delete/<%= environment %>/<%= project %>/+" {
  capabilities = ["create", "update"]
}

path "<%= secertKvPath %>/delete/<%= environment %>/<%= project %>/+/+" {
  capabilities = ["create", "update"]
}

path "<%= secertKvPath %>/undelete/<%= environment %>/<%= project %>/+" {
  capabilities = ["create", "update"]
}

path "<%= secertKvPath %>/undelete/<%= environment %>/<%= project %>/+/+" {
  capabilities = ["create", "update"]
}

path "<%= secertKvPath %>/destroy/<%= environment %>/<%= project %>/+" {
  capabilities = ["create", "update"]
}

path "<%= secertKvPath %>/destroy/<%= environment %>/<%= project %>/+/+" {
  capabilities = ["create", "update"]
}
