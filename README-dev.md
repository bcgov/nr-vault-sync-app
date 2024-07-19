# Vault Sync Tool - Development

Back: [README.md](README.md)

This document is aimed at developers looking to setup the Vault Sync Tool to run or make modifications to it.

## Supported npm commands

* npm start - Run commands to deploy configuration
* npm run lint - lint source code
* npm run test - Run unit tests
* npm run e2e - Run end-to-end tests

## Hashicorp Vault Setup for local testing

### With Broker

NR Broker's local setup will start a Vault container and run a setup script. No further setup should be required.

### Without Broker

The following will start up Vault in Podman. The Vault Sync Tool defaults to localhost:8200 for the address and myroot for the token.

`podman run --rm -e 'VAULT_DEV_ROOT_TOKEN_ID=myroot' -e 'VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200' --name=dev-vault -p 8200:8200 vault`

You will need to add an OIDC authentication method to do local testing of group syncs.

```
source setenv-local.sh
vault auth enable oidc
vault auth enable -path=vs_apps_approle approle
vault secrets enable -path=apps -version=2 kv
```

### Build with Podman

```
podman build . -t vsync
```

### Run with Podman

This assumes you are running vault in another container on port 8200.

```
VAULT_ADDR=http://$(podman inspect -f "{{.NetworkSettings.IPAddress}}" broker-vault):8200
podman run --rm vsync
```
