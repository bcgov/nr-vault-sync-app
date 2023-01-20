#!/usr/bin/env bash

cd "${0%/*}"

echo "===> Intention open"
# Open intention
# -u "$BASIC_HTTP_USER:$BASIC_HTTP_PASSWORD" \
TEMP_FILE=$(mktemp)
cat ./vault-config-intention.json | jq ".event.url=\"$GITHUB_SERVER_URL$GITHUB_ACTION_PATH\" | \
            .user.id=\"$GITHUB_ACTOR@github\" \
        " >> $TEMP_FILE
cat $TEMP_FILE
RESPONSE=$(curl -s -X POST $BROKER_ADDR/v1/intention/open \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $BROKER_JWT" \
    -d @$TEMP_FILE \
    )
echo "$BROKER_ADDR/v1/intention/open:"
if [ "$(echo $RESPONSE | jq '.error')" != "null" ]; then
    echo "Exit: Error detected"
    echo $RESPONSE
    exit 0
fi

# Save intention token for later
INTENTION_TOKEN=$(echo $RESPONSE | jq -r '.token')
echo "::add-mask::$INTENTION_TOKEN"
echo "INTENTION_TOKEN=$INTENTION_TOKEN" >> $GITHUB_ENV


# Get token for provisioning a db access
ACTION_TOKEN=$(echo $RESPONSE | jq -r '.actions.configure.token')

# Get wrapped id for db access
WRAPPED_VAULT_TOKEN_JSON=$(curl -s -X POST $BROKER_ADDR/v1/provision/token/self -H 'X-Broker-Token: '"$ACTION_TOKEN"'' -H 'X-Vault-Role-Id: '"$PROVISION_ROLE_ID"'')
if [ "$(echo $WRAPPED_VAULT_TOKEN_JSON | jq '.error')" != "null" ]; then
    echo "Exit: Error detected"
    echo $WRAPPED_VAULT_TOKEN_JSON
    exit 0
fi
WRAPPED_VAULT_TOKEN=$(echo $WRAPPED_VAULT_TOKEN_JSON | jq -r '.wrap_info.token')

VAULT_TOKEN_JSON=$(curl -s -X POST $VAULT_ADDR/v1/sys/wrapping/unwrap -H 'X-Vault-Token: '"$WRAPPED_VAULT_TOKEN"'')
if [ "$(echo $VAULT_TOKEN_JSON | jq '.error')" != "null" ]; then
    echo "Exit: Error detected"
    echo $VAULT_TOKEN_JSON
    exit 0
fi

VAULT_TOKEN=$(echo -n $VAULT_TOKEN_JSON | jq -r '.auth.client_token')
echo "::add-mask::$VAULT_TOKEN"
echo "VAULT_TOKEN=$VAULT_TOKEN" >> $GITHUB_ENV
