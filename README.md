# Vault Sync Tool

The Vault Sync Tool configures HashiCorp Vault by utilizing data sources, enabling secure access for applications and users. It can either read a static configuration or dynamically retrieve data from the business intelligence tool, [NR Broker](https://github.com/bcgov-nr/nr-broker). Additionally, it can monitor data source changes or be run on-demand.

<!-- toc -->
* [Vault Sync Tool](#vault-sync-tool)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

## Running

The tool can be run from the source using Node.js or a container image by using Podman or Docker.

```
./bin/dev health
```

```
podman run --rm ghcr.io/bcgov/nr-vault-sync-app:v2.3.0 health
```

The sample command runs the health command. All the commands will probably require some arguments set up to work with your installation of Hashicorp Vault. With no arguments set, it will try to use a local Vault installation with a static token.

## Environment Variables

The tool can utilize environment variables instead of most command arguments. It is recommended to set all confidential parameters (such as tokens) using environment variables. Specifically, the argument 'vault-token' should always be configured with the environment variable 'VAULT_TOKEN'.

These can be found by looking in the [src/flags.ts](src/flags.ts) file.

A sample env file is provided. To setup for running the tool using a local dev environment, run the following command:

`source setenv-local.sh`

## Development

This document is aimed at developers looking to setup the Vault Sync Tool to run or make modifications to it.

See: [Development](README-dev.md)

## Configuration

This document is aimed at Vault Administrators looking to alter the policies and access the Vault Sync Tool configures.

See: [Configuration](README-config.md)

# Usage
<!-- usage -->
```sh-session
$ npm install -g vstool
$ vstool COMMAND
running command...
$ vstool (--version)
vstool/1.0.0 darwin-x64 node-v24.6.0
$ vstool --help [COMMAND]
USAGE
  $ vstool COMMAND
...
```
<!-- usagestop -->

The script /bin/dev can run the code without installing it.

```sh-session
$ ./bin/dev COMMAND
running command...
$ ./bin/dev (-v|--version|version)
...
```

# Commands
<!-- commands -->
* [`vstool approle-sync`](#vstool-approle-sync)
* [`vstool find`](#vstool-find)
* [`vstool group-sync`](#vstool-group-sync)
* [`vstool health`](#vstool-health)
* [`vstool help [COMMAND]`](#vstool-help-command)
* [`vstool init`](#vstool-init)
* [`vstool monitor`](#vstool-monitor)
* [`vstool policy-sync`](#vstool-policy-sync)

## `vstool approle-sync`

Syncs approles in Vault

```
USAGE
  $ vstool approle-sync [-h] [--broker-api-url <value>] [--broker-token <value>] [--vault-token <value>]
    [--vault-addr <value>]

FLAGS
  -h, --help                    Show CLI help.
      --broker-api-url=<value>  [default: https://broker.io.nrs.gov.bc.ca/] The broker api base url
      --broker-token=<value>    The broker JWT
      --vault-addr=<value>      [default: http://127.0.0.1:8200] The vault address
      --vault-token=<value>     [default: myroot] The vault token

DESCRIPTION
  Syncs approles in Vault
```

## `vstool find`

Find Vault creds

```
USAGE
  $ vstool find [-h] [--vault-token <value>] [--vault-addr <value>]

FLAGS
  -h, --help                 Show CLI help.
      --vault-addr=<value>   [default: http://127.0.0.1:8200] The vault address
      --vault-token=<value>  [default: myroot] The vault token

DESCRIPTION
  Find Vault creds
```

## `vstool group-sync`

Syncs external groups in Vault to connect roles with Vault policies

```
USAGE
  $ vstool group-sync [-h] [--broker-api-url <value>] [--broker-token <value>] [--vault-token <value>]
    [--vault-addr <value>]

FLAGS
  -h, --help                    Show CLI help.
      --broker-api-url=<value>  [default: https://broker.io.nrs.gov.bc.ca/] The broker api base url
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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.32/src/commands/help.ts)_

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

## `vstool monitor`

Monitor for changes to sync to vault

```
USAGE
  $ vstool monitor [-h] [--broker-api-url <value>] [--broker-token <value>] [--vault-token <value>]
    [--vault-addr <value>] [--root <value>...]

FLAGS
  -h, --help                    Show CLI help.
      --broker-api-url=<value>  [default: https://broker.io.nrs.gov.bc.ca/] The broker api base url
      --broker-token=<value>    The broker JWT
      --root=<value>...         [default: ] The root to constrict the policy sync to. Some roots can be further
                                constricted such as -root=apps -root=cool-app-war
      --vault-addr=<value>      [default: http://127.0.0.1:8200] The vault address
      --vault-token=<value>     [default: myroot] The vault token

DESCRIPTION
  Monitor for changes to sync to vault
```

## `vstool policy-sync`

Syncs policies to Vault

```
USAGE
  $ vstool policy-sync [-h] [--broker-api-url <value>] [--broker-token <value>] [--vault-token <value>]
    [--vault-addr <value>] [--root <value>...]

FLAGS
  -h, --help                    Show CLI help.
      --broker-api-url=<value>  [default: https://broker.io.nrs.gov.bc.ca/] The broker api base url
      --broker-token=<value>    The broker JWT
      --root=<value>...         [default: ] The root to constrict the policy sync to. Some roots can be further
                                constricted such as -root=apps -root=cool-app-war
      --vault-addr=<value>      [default: http://127.0.0.1:8200] The vault address
      --vault-token=<value>     [default: myroot] The vault token

DESCRIPTION
  Syncs policies to Vault
```
<!-- commandsstop -->
