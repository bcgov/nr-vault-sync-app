# Write policy for application
# Scope: Approle

path "<%= secertKvPath %>/data/<%= environment %>/<%= project %>/<%= application %>" {
  capabilities = ["create", "update", "delete"]
}

path "<%= secertKvPath %>/data/<%= environment %>/<%= project %>/<%= application %>/+" {
  capabilities = ["create", "update", "delete"]
}

path "<%= secertKvPath %>/metadata/<%= environment %>/<%= project %>/<%= application %>" {
  capabilities = ["create", "update", "delete"]
}

path "<%= secertKvPath %>/metadata/<%= environment %>/<%= project %>/<%= application %>/+" {
  capabilities = ["create", "update", "delete"]
}

path "<%= secertKvPath %>/delete/<%= environment %>/<%= project %>/<%= application %>" {
  capabilities = ["create", "update"]
}

path "<%= secertKvPath %>/delete/<%= environment %>/<%= project %>/<%= application %>/+" {
  capabilities = ["create", "update"]
}

path "<%= secertKvPath %>/undelete/<%= environment %>/<%= project %>/<%= application %>" {
  capabilities = ["create", "update"]
}

path "<%= secertKvPath %>/undelete/<%= environment %>/<%= project %>/<%= application %>/+" {
  capabilities = ["create", "update"]
}

path "<%= secertKvPath %>/destroy/<%= environment %>/<%= project %>/<%= application %>" {
  capabilities = ["create", "update"]
}

path "<%= secertKvPath %>/destroy/<%= environment %>/<%= project %>/<%= application %>/+" {
  capabilities = ["create", "update"]
}
