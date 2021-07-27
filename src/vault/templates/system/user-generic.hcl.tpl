# Adobe/cryptr support
# Scope: All users

# Read all policies
path "sys/policy/*" {
    policy = "read"
}

# Grant permissions on user specific paths (data, destroy, metadata)
path "user/data/{{identity.entity.aliases.<%= global_oidc_accessor %>.name}}" {
    capabilities = [ "create", "update", "read", "delete", "list" ]
}
path "user/data/{{identity.entity.aliases.<%= global_oidc_accessor %>.name}}/*" {
    capabilities = [ "create", "update", "read", "delete", "list" ]
}
path "user/destroy/{{identity.entity.aliases.<%= global_oidc_accessor %>.name}}" {
    capabilities = [ "create", "update", "read", "delete", "list" ]
}
path "user/destroy/{{identity.entity.aliases.<%= global_oidc_accessor %>.name}}/*" {
    capabilities = [ "create", "update", "read", "delete", "list" ]
}
path "user/metadata/{{identity.entity.aliases.<%= global_oidc_accessor %>.name}}" {
    capabilities = [ "create", "update", "read", "delete", "list" ]
}
path "user/metadata/{{identity.entity.aliases.<%= global_oidc_accessor %>.name}}/*" {
    capabilities = [ "create", "update", "read", "delete", "list" ]
}

// path "user/+/{{identity.entity.aliases.<%= global_oidc_accessor %>.name}}" {
//     capabilities = [ "create", "update", "read", "delete", "list" ]
// }
// path "user/+/{{identity.entity.aliases.<%= global_oidc_accessor %>.name}}/*" {
//     capabilities = [ "create", "update", "read", "delete", "list" ]
// }

# For Web UI usage of user specific path
path "user/metadata" {
  capabilities = ["list"]
}
