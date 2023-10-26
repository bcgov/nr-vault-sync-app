# Shared policy
# Scope: Users who need read access to the nrcd credentials (e.g. fluent bit deployers)

path "groups/oneteam/nrcd" {
  capabilities = ["read"]
}

path "groups/data/oneteam/nrcd" {
  capabilities = ["read"]
}
