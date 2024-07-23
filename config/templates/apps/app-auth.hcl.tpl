# Authentication policy for application
# Scope: Approle

path "auth/<%= authMount %>/role/<%= project %>_<%= application %>_<%= environment %>/role-id" {
  capabilities = ["read"]
}

path "auth/<%= authMount %>/role/<%= project %>_<%= application %>_<%= environment %>/secret-id" {
  capabilities = ["update"]
}

path "<%= secretKvPath %>/subkeys/tools/<%= project %>/<%= application %>" {
  capabilities = ["read"]
}
path "<%= secretKvPath %>/data/tools/<%= project %>/<%= application %>" {
  capabilities = ["update"]
}