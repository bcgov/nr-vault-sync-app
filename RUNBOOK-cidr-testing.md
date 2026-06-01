# Local CIDR Testing Runbook

This runbook validates AppRole sync with environment-specific CIDR values end to end.

## 0. Set local paths

Set these once in your shell before running the steps below:

```bash
# Path to your local NR Broker worktree or clone.
export BROKER_WT="/path/to/nr-broker"

# Path to your local nr-vault-sync-app clone.
export VS_APP="/path/to/nr-vault-sync-app"
```

## 1. Start local infrastructure

```bash
podman run -p 27017:27017 --name broker-mongo \
  -e MONGO_INITDB_ROOT_USERNAME=mongoadmin \
  -e MONGO_INITDB_ROOT_PASSWORD=secret \
  -d mongo:8 --wiredTigerCacheSizeGB 0.25

podman run -p 6379:6379 -p 8001:8001 --name broker-redis -d redis/redis-stack

podman run -p 8200:8200 --cap-add=IPC_LOCK \
  -e VAULT_DEV_ROOT_TOKEN_ID=myroot \
  -d --name broker-vault hashicorp/vault
```

## 2. Bootstrap NR Broker (from your local broker worktree)

```bash
cd "$BROKER_WT"

cp -n scripts/setenv-common.sh.tmp scripts/setenv-common.sh

# Update OIDC values in scripts/setenv-common.sh before continuing:
# - OAUTH2_CLIENT_PROVIDER_OIDC_ISSUER
# - OAUTH2_CLIENT_REGISTRATION_LOGIN_CLIENT_ID
# - OAUTH2_CLIENT_REGISTRATION_LOGIN_CLIENT_SECRET
# Keep OAUTH2_CLIENT_REGISTRATION_LOGIN_SCOPE as needed (default "openid profile").
#
# Quick sanity check (should NOT show REPLACE_WITH_* placeholders):
# grep -E 'OAUTH2_CLIENT_PROVIDER_OIDC_ISSUER|OAUTH2_CLIENT_REGISTRATION_LOGIN_CLIENT_ID|OAUTH2_CLIENT_REGISTRATION_LOGIN_CLIENT_SECRET' scripts/setenv-common.sh

./scripts/mongo-setup.sh
./scripts/vault-setup.sh
```

If the Vault DB setup step fails because container host resolution does not work, use `host.containers.internal` (or `127.0.0.1`) in the DB connection URL and rerun `./scripts/vault-setup.sh`.

Permanent local fallback for Vault DB plugin setup:

```bash
export VAULT_ADDR="http://localhost:8200"
export VAULT_TOKEN="myroot"

vault write database/config/my-mongodb-database \
  plugin_name=mongodb-database-plugin \
  allowed_roles=broker-role \
  connection_url="mongodb://{{username}}:{{password}}@host.containers.internal:27017/admin" \
  username=admin_db_engine \
  password=admin_secret || return 1

vault read database/config/my-mongodb-database || return 1
vault read database/creds/broker-role || return 1
```

## 3. Start NR Broker API and UI

```bash
cd "$BROKER_WT/api" && npm ci && npm run watch
```

```bash
cd "$BROKER_WT/ui" && npm ci && npm run watch
```

## 4. Generate and validate the broker token (same shell you will sync from)

```bash
cd "$BROKER_WT"
source ./scripts/setenv-curl-local.sh

# Vault Sync reads BROKER_TOKEN, not BROKER_JWT.
export BROKER_TOKEN="${BROKER_JWT:-}"
export BROKER_API_URL="http://localhost:3000"
export VAULT_ADDR="http://127.0.0.1:8200"
export VAULT_TOKEN="myroot"

# Fail fast if broker mode is not configured.
test -n "$BROKER_TOKEN"

./scripts/token-check.sh
```

## 5. Ensure test app exists in broker data

Use the Broker UI to create or update a service with:
- Vault enabled
- AppRole enabled
- CIDR by environment set for production
- Service deployed to production

For token behavior testing from your local machine, use a production CIDR that includes the client source IP Vault sees.
In Podman setups this is often a bridge address (for example `192.168.0.29/32`), not `127.0.0.1/32`.

Then verify broker output includes your test service:

```bash
curl -s -H "Authorization: Bearer $BROKER_TOKEN" \
  "$BROKER_API_URL/v1/graph/data/project-services" | jq
```

## 6. Run test suites

```bash
cd "$BROKER_WT/api" && npm test
cd "$BROKER_WT/ui" && npm test
cd "$VS_APP" && npm test
```

## 6.5 Preflight check before sync

Run this in the same terminal where you will run sync:

```bash
printf "BROKER_API_URL=%s\n" "${BROKER_API_URL-<unset>}"
printf "BROKER_TOKEN_LEN=%s\n" "${#BROKER_TOKEN}"
printf "VAULT_ADDR=%s\n" "${VAULT_ADDR-<unset>}"
printf "VAULT_TOKEN_LEN=%s\n" "${#VAULT_TOKEN}"

curl -s -H "Authorization: Bearer $BROKER_TOKEN" \
  "$BROKER_API_URL/v1/graph/data/project-services" | jq '.[0] | keys'
```

If `BROKER_TOKEN_LEN` is `0` or the `curl|jq` command fails, stop and re-run Step 4 in this same shell.

## 7. Run AppRole sync (recommended direct path)

```bash
cd "$VS_APP"

npx ts-node -e "import 'reflect-metadata'; import { bindBroker, bindVault, vsContainer } from './src/inversify.config'; import { TYPES } from './src/inversify.types'; import VaultApproleController from './src/vault/vault-approle.controller'; (async()=>{ const brokerApiUrl = process.env.BROKER_API_URL || ''; const brokerToken = process.env.BROKER_TOKEN || ''; bindVault(process.env.VAULT_ADDR || 'http://127.0.0.1:8200', process.env.VAULT_TOKEN || 'myroot'); bindBroker(brokerApiUrl, brokerToken); const c = vsContainer.get<VaultApproleController>(TYPES.VaultApproleController); await c.sync(); console.log('approle sync completed'); })().catch((e)=>{ console.error(e); process.exit(1); });"
```

Note: `npm run start -- approle-sync ...` may silently no-op in some local setups. Use the direct path above for deterministic results.

## 8. Verify role creation and CIDR values

```bash
vault list auth/vs_apps_approle/role/
vault read auth/vs_apps_approle/role/cidrtest_test-cidr_prod | \
  grep -E 'secret_id_bound_cidrs|token_bound_cidrs'
```

Expected example:
- `secret_id_bound_cidrs      [10.20.0.0/24]`
- `token_bound_cidrs          []`

## 9. Diagnose broker mode vs file mode if results are unexpected

```bash
cd "$VS_APP"

npx ts-node -e "import 'reflect-metadata'; import { bindBroker, bindVault, vsContainer } from './src/inversify.config'; import { TYPES } from './src/inversify.types'; import VaultApproleController from './src/vault/vault-approle.controller'; (async()=>{ bindVault(process.env.VAULT_ADDR ?? 'http://127.0.0.1:8200', process.env.VAULT_TOKEN ?? 'myroot'); bindBroker(process.env.BROKER_API_URL ?? 'http://localhost:3000', process.env.BROKER_TOKEN); const c = vsContainer.get<VaultApproleController>(TYPES.VaultApproleController); const d = await c.buildApproleDict(); console.log(Object.keys(d).sort().join('\\n')); })().catch((e)=>{ console.error(e); process.exit(1); });"
```

If you only see sample roles, `BROKER_TOKEN` is missing or empty in that shell.

## 10. Verify CIDR enforcement during AppRole login and token issuance

Role names are rendered as `<project>_<app>_<env-short>`. Example below uses `cidrtest_test-cidr_prod`.

### 10a. Denied-first check (should fail)

Use a CIDR that does not include your current Vault-evaluated source IP.
You can use the existing example value `10.20.0.0/24` for this first check.

1. In Broker UI, set production CIDR for the app to `10.20.0.0/24`.
2. Run Step 7 again to sync the updated CIDR settings.
3. Attempt AppRole login and confirm it fails with a CIDR restriction error.

### 10b. Allowed CIDR test (should succeed)

First determine the source IP Vault evaluates for CIDR checks.
If login fails with a CIDR error, Vault usually prints it directly (for example `source address "192.168.0.29" unauthorized ...`).
Use that IP in Broker for the production CIDR value (for example `192.168.0.29/32`), then rerun Step 7.

```bash
ROLE_NAME="cidrtest_test-cidr_prod"

# 1) Get role_id
ROLE_ID="$(vault read -field=role_id auth/vs_apps_approle/role/${ROLE_NAME}/role-id)"

# 2) Generate secret_id (allowed when client IP matches secret_id_bound_cidrs)
SECRET_ID="$(vault write -field=secret_id -f auth/vs_apps_approle/role/${ROLE_NAME}/secret-id)"

# 3) Login and get client token (allowed when client IP satisfies CIDR restrictions)
CLIENT_TOKEN="$(vault write -field=token auth/vs_apps_approle/login role_id="$ROLE_ID" secret_id="$SECRET_ID")"

# 4) Verify token is valid
VAULT_TOKEN="$CLIENT_TOKEN" vault token lookup
```

### 10c. Optional extra denied CIDR test (should fail)

After a successful allowed test, you can switch to another non-matching CIDR and confirm denial again.

1. In Broker UI, set production CIDR for the same app to a range that does not include the source IP Vault sees (example `203.0.113.0/24`).
2. Run Step 7 again to sync the updated CIDR settings.
3. Retry secret-id creation and AppRole login:

```bash
ROLE_NAME="cidrtest_test-cidr_prod"
ROLE_ID="$(vault read -field=role_id auth/vs_apps_approle/role/${ROLE_NAME}/role-id)"

# Expected to fail due to CIDR restriction
vault write -f auth/vs_apps_approle/role/${ROLE_NAME}/secret-id

# If secret-id creation is still allowed for your policy setup, login should fail instead
vault write auth/vs_apps_approle/login role_id="$ROLE_ID" secret_id="<secret-id>"
```

At least one of these should fail when CIDR is restricted away from your client source IP.
