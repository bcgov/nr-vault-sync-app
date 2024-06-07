# Shared policy
# Scope: Users who need read access to the nrscuda credentials (e.g. fluent bit deployers)

path "groups/appdelivery/jenkins-isss-cdua" {
  capabilities = ["read"]
}

path "groups/data/appdelivery/jenkins-isss-cdua" {
  capabilities = ["read"]
}
