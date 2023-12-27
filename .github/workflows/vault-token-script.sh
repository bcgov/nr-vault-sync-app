#!/usr/bin/env bash

echo "===> Provision Vault token"
ACTION_START=$(curl -s -X POST $BROKER_ADDR/v1/intention/action/start -H 'X-Broker-Token: '"$ACTION_TOKEN_CONFIGURE"'')
# Get wrapped id for db access
WRAPPED_VAULT_TOKEN_JSON=$(curl -s -X POST $BROKER_ADDR/v1/provision/token/self -H 'X-Broker-Token: '"$ACTION_TOKEN_CONFIGURE"'' -H 'X-Vault-Role-Id: '"$PROVISION_ROLE_ID"'')
if [ "$(echo $WRAPPED_VAULT_TOKEN_JSON | jq '.error')" != "null" ]; then
    echo "Exit: Error detected"
    echo $WRAPPED_VAULT_TOKEN_JSON | jq '.'
    exit 1
fi
WRAPPED_VAULT_TOKEN=$(echo $WRAPPED_VAULT_TOKEN_JSON | jq -r '.wrap_info.token')
echo "::add-mask::$WRAPPED_VAULT_TOKEN"

echo "===> Unwrap token"
echo $VAULT_ADDR/v1/sys/wrapping/unwrap
VAULT_TOKEN_JSON=$(curl -s -X POST $VAULT_ADDR/v1/sys/wrapping/unwrap -H 'X-Vault-Token: '"$WRAPPED_VAULT_TOKEN"'')

VAULT_TOKEN=$(echo -n $VAULT_TOKEN_JSON | jq -r '.auth.client_token')
echo "::add-mask::$VAULT_TOKEN"
echo "VAULT_TOKEN=$VAULT_TOKEN" >> $GITHUB_ENV
