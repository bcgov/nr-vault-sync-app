# Vault Sync Tool

The Vault Sync tool or VST is for generating and syncing vault policies, groups and appRoles.

See: [Confluence Documentation](https://apps.nrs.gov.bc.ca/int/confluence/x/m4FvBQ)

<!-- toc -->
* [Vault Sync Tool](#vault-sync-tool)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

## Building the Docker image

`podman build . -t vsync`

## Environment Variables

The tool can use the following environment variables in place of command arguments. The default is in the brackets. The defaults are for testing with a local Vault instance.

* VAULT_ADDR - The address of the vault server ('http://127.0.0.1:8200')
* VAULT_TOKEN - The token to use when connecting to vault (myroot)

To set the environment variables, source the target environment's setenv-*.sh file. For example, to set the address and token for the dev environment, run the following command:

`source setenv-dev.sh`

You will need vault and jq installed to run the above.

## Supported npm commands

* npm start - deploy configuration to provided vault instance
* npm run lint - lint source code
* npm run test - Run unit tests
* npm run e2e - Run end-to-end tests

## Configuration

See: [Confluence Documentation](https://apps.nrs.gov.bc.ca/int/confluence/x/m4FvBQ)

## Local testing

The following will start up vault in docker. The Vault Sync Tool defaults for the address and token should work with it.

`podman run --rm -e 'VAULT_DEV_ROOT_TOKEN_ID=myroot' -e 'VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200' --name=dev-vault -p 8200:8200 vault`

You will need to add an OIDC authentication method to do local testing of group syncs.

```
source setenv-local.sh
vault auth enable oidc
vault auth enable -path=vs_apps_approle approle
vault secrets enable -path=apps -version=2 kv
```

# Usage
<!-- usage -->
```sh-session
$ npm install -g vstool
$ vstool COMMAND
running command...
$ vstool (--version)
vstool/1.0.0 darwin-x64 node-v20.11.1
$ vstool --help [COMMAND]
USAGE
  $ vstool COMMAND
...
```
<!-- usagestop -->

The script /bin/dev.js can run the code without installing it.

```sh-session
$ ./bin/dev.js COMMAND
running command...
$ ./bin/dev.js (-v|--version|version)
...
```

# Commands
<!-- commands -->
* [`vstool approle-sync`](#vstool-approle-sync)
* [`vstool group-sync`](#vstool-group-sync)
* [`vstool health`](#vstool-health)
* [`vstool help [COMMAND]`](#vstool-help-command)
* [`vstool init`](#vstool-init)
* [`vstool policy-sync`](#vstool-policy-sync)

## `vstool approle-sync`

Syncs approles in Vault

```
USAGE
  $ vstool approle-sync [-h] [--broker-api-url <value>] [--broker-token <value>] [--vault-token <value>]
    [--vault-addr <value>]

FLAGS
  -h, --help                    Show CLI help.
      --broker-api-url=<value>  [default: https://nr-broker.apps.silver.devops.gov.bc.ca/] The broker api base url
      --broker-token=<value>    The broker JWT
      --vault-addr=<value>      [default: http://127.0.0.1:8200] The vault address
      --vault-token=<value>     [default: myroot] The vault token

DESCRIPTION
  Syncs approles in Vault
```

## `vstool group-sync`

Syncs external groups in Vault to connect roles with Vault policies

```
USAGE
  $ vstool group-sync [-h] [--broker-api-url <value>] [--broker-token <value>] [--vault-token <value>]
    [--vault-addr <value>]

FLAGS
  -h, --help                    Show CLI help.
      --broker-api-url=<value>  [default: https://nr-broker.apps.silver.devops.gov.bc.ca/] The broker api base url
      --broker-token=<value>    The broker JWT
      --vault-addr=<value>      [default: http://127.0.0.1:8200] The vault address
      --vault-token=<value>     [default: myroot] The vault token

DESCRIPTION
  Syncs external groups in Vault to connect roles with Vault policies
```

## `vstool health`

Display Vault health

```
USAGE
  $ vstool health [-h] [--vault-token <value>] [--vault-addr <value>]

FLAGS
  -h, --help                 Show CLI help.
      --vault-addr=<value>   [default: http://127.0.0.1:8200] The vault address
      --vault-token=<value>  [default: myroot] The vault token

DESCRIPTION
  Display Vault health
```

## `vstool help [COMMAND]`

Display help for vstool.

```
USAGE
  $ vstool help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for vstool.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.0.18/src/commands/help.ts)_

## `vstool init`

Initialize a Vault instance and save root token and unseal keys.

```
USAGE
  $ vstool init [-h] [--secret-shares <value>] [--secret-threshold <value>] [--vault-token <value>]
    [--vault-addr <value>]

FLAGS
  -h, --help                      Show CLI help.
      --secret-shares=<value>     [default: 1] The number of shares to split the master key into
      --secret-threshold=<value>  [default: 1] The number of shares required to reconstruct the master key
      --vault-addr=<value>        [default: http://127.0.0.1:8200] The vault address
      --vault-token=<value>       [default: myroot] The vault token

DESCRIPTION
  Initialize a Vault instance and save root token and unseal keys.
```

## `vstool policy-sync`

Syncs policies to Vault

```
USAGE
  $ vstool policy-sync [-h] [--broker-api-url <value>] [--broker-token <value>] [--vault-token <value>]
    [--vault-addr <value>] [--root <value>]

FLAGS
  -h, --help                    Show CLI help.
      --broker-api-url=<value>  [default: https://nr-broker.apps.silver.devops.gov.bc.ca/] The broker api base url
      --broker-token=<value>    The broker JWT
      --root=<value>...         [default: ] The root to constrict the policy sync to. Some roots can be further
                                constricted such as -root=apps -root=cool-app-war
      --vault-addr=<value>      [default: http://127.0.0.1:8200] The vault address
      --vault-token=<value>     [default: myroot] The vault token

DESCRIPTION
  Syncs policies to Vault
```
<!-- commandsstop -->
