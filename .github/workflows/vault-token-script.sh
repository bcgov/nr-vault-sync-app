#!/usr/bin/env bash

cd "${0%/*}"

INSTALL_VERSION="12.0.3"

echo "===> Intention open"
# Open intention
# -u "$BASIC_HTTP_USER:$BASIC_HTTP_PASSWORD" \
RESPONSE=$(curl -s -X POST $BROKER_URL/v1/intention/open \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $BROKER_JWT" \
    -d @<(cat vault-config-intention.json | \
        jq ".event.url=\"$GITHUB_SERVER_URL$GITHUB_ACTION_PATH" | \
            .user.id=\"$GITHUB_ACTOR@github" \
        " \
    ))
echo "$BROKER_URL/v1/intention/open:"
if [ "$(echo $RESPONSE | jq '.error')" != "null" ]; then
    echo "Exit: Error detected"
    exit 0
fi

# Save intention token for later
INTENTION_TOKEN=$(echo $RESPONSE | jq -r '.token')
echo "INTENTION_TOKEN=$INTENTION_TOKEN" >> $ENV_INTENTION_TOKEN
echo "===> DB provision"

# Get token for provisioning a db access
DB_INTENTION_TOKEN=$(echo $RESPONSE | jq -r '.actions.database.token')

# Get wrapped id for db access
VAULT_TOKEN_WRAP=$(curl -s -X POST $BROKER_URL/v1/provision/token/self -H 'X-Broker-Token: '"$DB_INTENTION_TOKEN"'' -H 'X-Vault-Role-Id: '"$PROVISION_ROLE_ID"'')
WRAPPED_VAULT_TOKEN=$(echo $VAULT_TOKEN_WRAP | jq -r '.wrap_info.token')

UNWRAPPED_VAULT_TOKEN=$(curl -s -X POST $VAULT_ADDR/v1/sys/wrapping/unwrap -H 'X-Vault-Token: '"$WRAPPED_VAULT_TOKEN"'')

VAULT_TOKEN=$(echo -n $UNWRAPPED_VAULT_TOKEN | jq -r '.auth.client_token')
echo "VAULT_TOKEN=$UNWRAPPED_VAULT_TOKEN" >> $ENV_VAULT_TOKEN
echo "===> Intention close"
