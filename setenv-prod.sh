export VAULT_ADDR="https://vault-iit.apps.silver.devops.gov.bc.ca"
export VAULT_TOKEN=$(vault login -method=oidc -format json | jq -r '.auth.client_token')
export BROKER_TOKEN=

