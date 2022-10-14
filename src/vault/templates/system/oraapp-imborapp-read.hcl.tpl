# System policy
# Scope: Users who need read access to the oraapp/imborapp credentials (e.g. to deploy fluent bit to Windows servers)

path "groups/appdelivery/oraapp_imborapp" {
  capabilities = ["read"]
}

path "groups/data/appdelivery/oraapp_imborapp" {
  capabilities = ["read"]
}
