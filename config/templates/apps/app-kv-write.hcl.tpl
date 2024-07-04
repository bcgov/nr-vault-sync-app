# Write policy for application
# Scope: Approle

path "<%= secretKvPath %>/data/<%= environment %>/<%= project %>/<%= application %>" {
  capabilities = ["create", "update", "delete"]
}

path "<%= secretKvPath %>/data/<%= environment %>/<%= project %>/<%= application %>/+" {
  capabilities = ["create", "update", "delete"]
}

path "<%= secretKvPath %>/metadata/<%= environment %>/<%= project %>/<%= application %>" {
  capabilities = ["create", "update", "delete"]
}

path "<%= secretKvPath %>/metadata/<%= environment %>/<%= project %>/<%= application %>/+" {
  capabilities = ["create", "update", "delete"]
}

path "<%= secretKvPath %>/delete/<%= environment %>/<%= project %>/<%= application %>" {
  capabilities = ["create", "update"]
}

path "<%= secretKvPath %>/delete/<%= environment %>/<%= project %>/<%= application %>/+" {
  capabilities = ["create", "update"]
}

path "<%= secretKvPath %>/undelete/<%= environment %>/<%= project %>/<%= application %>" {
  capabilities = ["create", "update"]
}

path "<%= secretKvPath %>/undelete/<%= environment %>/<%= project %>/<%= application %>/+" {
  capabilities = ["create", "update"]
}

path "<%= secretKvPath %>/destroy/<%= environment %>/<%= project %>/<%= application %>" {
  capabilities = ["create", "update"]
}

path "<%= secretKvPath %>/destroy/<%= environment %>/<%= project %>/<%= application %>/+" {
  capabilities = ["create", "update"]
}
