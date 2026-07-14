# Access and update project infrastructure secrets
# Scope: Users that should be able to make changes to project infrastructure for the environment
# Comment: 'env' -> environment, 'p' -> project, 's' -> service or shared (project-level)

# path: secret-mount-path/data/env/p/infrastructure/nr-broker-sync
path "<%= secretKvPath %>/data/<%= environment %>/<%= project %>/infrastructure/nr-broker-sync" {
  capabilities = ["create", "read", "update", "patch"]
}
# path: secret-mount-path/data/env/p/infrastructure/nr-broker-sync
path "<%= secretKvPath %>/metadata/<%= environment %>/<%= project %>/infrastructure/nr-broker-sync" {
  capabilities = ["create", "read", "list", "update", "patch"]
}
# path: secret-mount-path/delete/env/p/infrastructure/nr-broker-sync
path "<%= secretKvPath %>/delete/<%= environment %>/<%= project %>/infrastructure/nr-broker-sync" {
  capabilities = ["create", "update"]
}
# path: secret-mount-path/undelete/env/p/infrastructure/nr-broker-sync
path "<%= secretKvPath %>/undelete/<%= environment %>/<%= project %>/infrastructure/nr-broker-sync" {
  capabilities = ["create", "update"]
}
# path: secret-mount-path/destroy/env/p/infrastructure/nr-broker-sync
path "<%= secretKvPath %>/destroy/<%= environment %>/<%= project %>/infrastructure/nr-broker-sync" {
  capabilities = ["create", "update"]
}
