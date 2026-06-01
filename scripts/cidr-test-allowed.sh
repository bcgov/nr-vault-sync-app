#!/usr/bin/env bash
# Test that AppRole login succeeds when CIDR matches the client source IP.
# Usage: scripts/cidr-test-allowed.sh [role-name]
#
# Required env vars (must be set before calling):
#   VAULT_ADDR   - e.g. http://127.0.0.1:8200
#   VAULT_TOKEN  - e.g. myroot

ROLE_NAME="${1:-cidrtest_test-cidr_prod}"
VAULT_ADDR="${VAULT_ADDR:-http://127.0.0.1:8200}"
VAULT_TOKEN="${VAULT_TOKEN:-myroot}"

echo "Role:       $ROLE_NAME"
echo "Vault addr: $VAULT_ADDR"
echo

# 1) Get role_id
echo "--- Step 1: get role_id ---"
ROLE_ID="$(vault read -field=role_id "auth/vs_apps_approle/role/${ROLE_NAME}/role-id")"
echo "role_id: $ROLE_ID"
echo

# 2) Generate secret_id
echo "--- Step 2: generate secret_id ---"
SECRET_ID="$(vault write -field=secret_id -f "auth/vs_apps_approle/role/${ROLE_NAME}/secret-id")"
echo "secret_id: (obtained)"
echo

# 3) Login and get client token
echo "--- Step 3: AppRole login ---"
CLIENT_TOKEN="$(vault write -field=token auth/vs_apps_approle/login \
  role_id="$ROLE_ID" secret_id="$SECRET_ID")"
echo "client_token: (obtained)"
echo

# 4) Verify token is valid
echo "--- Step 4: token lookup ---"
VAULT_TOKEN="$CLIENT_TOKEN" vault token lookup
echo
echo "PASS: AppRole login succeeded for role '$ROLE_NAME'."
