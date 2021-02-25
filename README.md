# Vault Sync Tool #

The Vault Sync tool or VST is for generating and syncing vault policies, groups and appRoles.


<!-- toc -->
* [Vault Sync Tool #](#vault-sync-tool-)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
* [Vault Sync Tool #](#vault-sync-tool-)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

## Environment Variables ##

The tool will take following environment variables. The default is in the brackets.

* VAULT_ADDR - The address of the vault server ('http://127.0.0.1:8200')
* VAULT_TOKEN - The token to use when connecting (myroot)


## Supported npm commands ##

* npm start - deploy configuration to provided vault instance
* npm run lint - lint source code

## Configuration ##

See: [Confluence Documentation](https://apps.nrs.gov.bc.ca/int/confluence/display/AD/How+to+configure+the+Vault+Policy+Generator+tool)

## Local testing ##

The following will start up vault in docker. The default environment variables should work with it.

`docker run --rm --cap-add=IPC_LOCK -e 'VAULT_DEV_ROOT_TOKEN_ID=myroot' -e 'VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200' --name=dev-vault -p 8200:8200 vault`

You will need to enable the 'AppRole' authentication method.

`vault auth enable approle`

# Usage
<!-- usage -->
```sh-session
$ npm install -g vstool
$ vstool COMMAND
running command...
$ vstool (-v|--version|version)
vstool/1.0.0 win32-x64 node-v12.16.2
$ vstool --help [COMMAND]
USAGE
  $ vstool COMMAND
...
```
<!-- usagestop -->
```sh-session
$ npm install -g vstool
$ vstool COMMAND
running command...
$ vstool (-v|--version|version)
vstool/1.0.0 win32-x64 node-v12.16.2
$ vstool --help [COMMAND]
USAGE
  $ vstool COMMAND
...
```
<!-- usagestop -->
<!-- usagestop -->

# Commands
<!-- commands -->
* [`vstool health [FILE]`](#vstool-health-file)
* [`vstool help [COMMAND]`](#vstool-help-command)
* [`vstool init [VAULTADDR] [VAULTTOKEN]`](#vstool-init-vaultaddr-vaulttoken)

## `vstool health [FILE]`

describe the command here

```
USAGE
  $ vstool health [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

## `vstool help [COMMAND]`

display help for vstool

```
USAGE
  $ vstool help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `vstool init [VAULTADDR] [VAULTTOKEN]`

Initialize a Vault instance and save root token and unseal keys.

```
USAGE
  $ vstool init [VAULTADDR] [VAULTTOKEN]

OPTIONS
  -h, --help                         show CLI help
  --secretShares=secretShares        [default: 1] The number of shares to split the master key into
  --secretThreshold=secretThreshold  [default: 1] The number of shares required to reconstruct the master key
  --vaultAddr=vaultAddr              [default: http://127.0.0.1:8200] The vault address
  --vaultToken=vaultToken            [default: myroot] The vault token
```
<!-- commandsstop -->
* [`vstool help [COMMAND]`](#vstool-help-command)

## `vstool help [COMMAND]`

display help for vstool

```
USAGE
  $ vstool help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_
<!-- commandsstop -->
