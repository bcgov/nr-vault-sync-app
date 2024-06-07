# Shared policy
# Scope: Users who need read access to the nrsci credentials (e.g. fluent bit deployers)

path "groups/appdelivery/jenkins-isss-ci" {
  capabilities = ["read"]
}

path "groups/data/appdelivery/jenkins-isss-ci" {
  capabilities = ["read"]
}
