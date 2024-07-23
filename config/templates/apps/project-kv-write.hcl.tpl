
path "<%= secretKvPath %>/data/<%= environment %>/<%= project %>" {
  capabilities = ["create", "update", "patch", "delete"]
}

path "<%= secretKvPath %>/data/<%= environment %>/<%= project %>/+" {
  capabilities = ["create", "update", "patch", "delete"]
}

path "<%= secretKvPath %>/data/<%= environment %>/<%= project %>/+/+" {
  capabilities = ["create", "update", "patch", "delete"]
}

path "<%= secretKvPath %>/metadata/<%= environment %>/<%= project %>/+" {
  capabilities = ["create", "update", "delete"]
}

path "<%= secretKvPath %>/metadata/<%= environment %>/<%= project %>/+/+" {
  capabilities = ["create", "update", "delete"]
}

path "<%= secretKvPath %>/delete/<%= environment %>/<%= project %>/+" {
  capabilities = ["create", "update"]
}

path "<%= secretKvPath %>/delete/<%= environment %>/<%= project %>/+/+" {
  capabilities = ["create", "update"]
}

path "<%= secretKvPath %>/undelete/<%= environment %>/<%= project %>/+" {
  capabilities = ["create", "update"]
}

path "<%= secretKvPath %>/undelete/<%= environment %>/<%= project %>/+/+" {
  capabilities = ["create", "update"]
}

path "<%= secretKvPath %>/destroy/<%= environment %>/<%= project %>/+" {
  capabilities = ["create", "update"]
}

path "<%= secretKvPath %>/destroy/<%= environment %>/<%= project %>/+/+" {
  capabilities = ["create", "update"]
}
