#!/usr/bin/env bash

cd "${0%/*}"

echo "===> Revoke token"

curl \
    --header "X-Vault-Token: $VAULT_TOKEN" \
    --request POST \
    $VAULT_ADDR/v1/auth/token/revoke-self
