# Vault Sync Tool - Development

Back: [README.md](README.md)

This document is aimed at developers looking to setup the Vault Sync Tool to run or make modifications to it.

See: [Oclif CLI](https://oclif.io)

## Requirements

* Podman
* Node.js

## Supported NPM commands

* npm run lint - lint source code
* npm run test - Run unit tests
* npm run prepack - Build and update CLI README

## Build with Podman

```
podman build . -t vsync
```

## Hashicorp Vault Setup for local testing

### With NR Broker

Setting up NR Broker locally involves starting a Vault container and executing a setup script. This process enables the Vault Sync Tool to operate seamlessly with the local installation, requiring no additional setup.

This is currently the only practical way to run the Vault Sync Tool because NR Broker is the only implemented data source for applications.

### Without NR Broker

The following will start up Vault in Podman. The Vault Sync Tool defaults to 'localhost:8200' for the address and 'myroot' for the token.

`podman run --rm -e 'VAULT_DEV_ROOT_TOKEN_ID=myroot' -e 'VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200' --name=dev-vault -p 8200:8200 vault`

You will need to ensure the expected auth and kv mounts exist in Vault.

```
source setenv-local.sh
vault auth enable oidc
vault auth enable -path=vs_apps_approle approle
vault secrets enable -path=apps -version=2 kv
vault secrets enable -path=groups -version=2 kv
```

## Running Vault Sync Tool

### With NR Broker

See: [Running Vault Sync Tool](https://bcgov-nr.github.io/nr-broker/#/development?id=running-vault-sync-tool)

### Without NR Broker

This is unsupported currently.
