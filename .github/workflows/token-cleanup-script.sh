#!/usr/bin/env bash

cd "${0%/*}"

echo "===> Revoke token"

curl \
    --header "X-Vault-Token: " \
    --request POST \
    $VAULT_ADDR/v1/auth/token/revoke-self

ACTION_END=$(curl -s -X POST $BROKER_ADDR/v1/intention/action/end -H 'X-Broker-Token: '"$ACTION_TOKEN"'')

echo "===> Intention close"

# Use saved intention token to close intention
curl -s -X POST $BROKER_ADDR/v1/intention/close -H 'X-Broker-Token: '"$INTENTION_TOKEN"''
