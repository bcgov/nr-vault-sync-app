#!/usr/bin/env bash

cd "${0%/*}"

VAULT_TOKEN=$(echo -n $UNWRAPPED_VAULT_TOKEN | jq -r '.auth.client_token')
echo "===> Intention close"

# Use saved intention token to close intention
curl -s -X POST $BROKER_URL/v1/intention/close -H 'X-Broker-Token: '"$INTENTION_TOKEN"''
curl \
    --header "X-Vault-Token: ..." \
    --request POST \
http://$VAULT_ADDR/v1/auth/token/revoke-self
