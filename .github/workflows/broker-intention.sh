#!/usr/bin/env bash

echo "===> Create Intention"
# Create intention
cat ./.github/workflows/vault-config-intention.json | jq "\
    .event.url=\"$GITHUB_SERVER_URL$GITHUB_EVENT_PATH\" | \
    .user.name=\"mbystedt@azureidir\" | \
    (.actions[] | select(.id == \"configure\") .cloud.target.account.id) |= \"$VAULT_OCP_ACCOUNT_ID\" | \
    (.actions[] | select(.id == \"configure\") .service.environment) |= (\"$GITHUB_ENVIRONMENT\"|ascii_downcase) \
    " > intention.json
