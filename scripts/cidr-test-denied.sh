#!/usr/bin/env bash
# Test that AppRole login is denied when CIDR does not include the client source IP.
# Usage: scripts/cidr-test-denied.sh [role-name]
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

# 1) Get role_id (should succeed regardless of CIDR)
echo "--- Step 1: get role_id ---"
ROLE_ID="$(vault read -field=role_id "auth/vs_apps_approle/role/${ROLE_NAME}/role-id")"
echo "role_id: $ROLE_ID"
echo

# 2) Attempt secret_id generation — expected to fail if secret_id_bound_cidrs is set
echo "--- Step 2: attempt secret_id generation (expect CIDR failure here or at login) ---"
if SECRET_ID="$(vault write -field=secret_id -f "auth/vs_apps_approle/role/${ROLE_NAME}/secret-id" 2>&1)"; then
  echo "secret_id generation succeeded (CIDR check deferred to login)"
  echo

  # 3) Attempt login — expected to fail due to CIDR restriction
  echo "--- Step 3: attempt AppRole login (expect CIDR failure here) ---"
  if vault write auth/vs_apps_approle/login role_id="$ROLE_ID" secret_id="$SECRET_ID" 2>&1; then
    echo
    echo "UNEXPECTED PASS: login succeeded. Verify that CIDR is set to a non-matching range in Broker and that sync was rerun."
    exit 1
  else
    echo
    echo "PASS: AppRole login was denied as expected for role '$ROLE_NAME'."
  fi
else
  echo "$SECRET_ID"
  echo
  echo "PASS: secret_id generation was denied as expected for role '$ROLE_NAME'."
fi
