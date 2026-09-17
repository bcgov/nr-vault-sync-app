# Super-admin policy
# Scope: All super admins - Should not be used except for recovery

path "*" {
  capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

# No access to user secrets except your own!
path "user/*" {
  capabilities = []
}

<% kvPaths.forEach(function(secretKvPath){ %>
path "<%= secretKvPath %>/config" {
  capabilities = ["read", "update"]
}
<% }); %>

# Secret mounts: Protect paths from deletion
path "sys/mounts/apps" {
    capabilities = [ "read" ]
}
path "sys/mounts/clouds" {
    capabilities = [ "read" ]
}
path "sys/mounts/db/dev" {
    capabilities = [ "read" ]
}
path "sys/mounts/db/prod" {
    capabilities = [ "read" ]
}
path "sys/mounts/db/test" {
    capabilities = [ "read" ]
}
path "sys/mounts/groups" {
    capabilities = [ "read" ]
}
path "sys/mounts/user" {
    capabilities = [ "read" ]
}
# Auth methods: prevent disabling/unmounting authentication
path "sys/auth/oidc" {
    capabilities = [ "read" ]
}
path "sys/auth/vs_apps_approle" {
    capabilities = [ "read" ]
}
