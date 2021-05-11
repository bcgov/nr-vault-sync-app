# Vault Sync Tool

The Vault Sync tool or VST is for generating and syncing vault policies, groups and appRoles.

See: [Confluence Documentation](https://apps.nrs.gov.bc.ca/int/confluence/x/m4FvBQ)

<!-- toc -->
* [Vault Sync Tool](#vault-sync-tool)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

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

`docker run --rm --cap-add=IPC_LOCK -e 'VAULT_DEV_ROOT_TOKEN_ID=myroot' -e 'VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200' --name=dev-vault -p 8200:8200 vault`

You will need to add an OIDC authentication method to do local testing of group syncs.

`vault auth enable oidc`
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

The script in /bin/run can also run the code without installing it.

```sh-session
$ ./bin/run COMMAND
running command...
$ ./bin/run (-v|--version|version)
...
```

# Commands
<!-- commands -->
* [`vstool group-sync`](#vstool-group-sync)
* [`vstool health`](#vstool-health)
* [`vstool help [COMMAND]`](#vstool-help-command)
* [`vstool init [VAULT-ADDR] [VAULT-TOKEN]`](#vstool-init-vault-addr-vault-token)
* [`vstool policy-sync`](#vstool-policy-sync)

## `vstool group-sync`

Syncs external groups in Vault to connect roles with Vault policies

```
USAGE
  $ vstool group-sync

OPTIONS
  -h, --help                 show CLI help
  --vault-addr=vault-addr    [default: http://127.0.0.1:8200] The vault address
  --vault-token=vault-token  [default: myroot] The vault token
```

## `vstool health`

Display Vault health

```
USAGE
  $ vstool health

OPTIONS
  -h, --help                 show CLI help
  --vault-addr=vault-addr    [default: http://127.0.0.1:8200] The vault address
  --vault-token=vault-token  [default: myroot] The vault token
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

## `vstool init [VAULT-ADDR] [VAULT-TOKEN]`

Initialize a Vault instance and save root token and unseal keys.

```
USAGE
  $ vstool init [VAULT-ADDR] [VAULT-TOKEN]

OPTIONS
  -h, --help                           show CLI help
  --secret-shares=secret-shares        [default: 1] The number of shares to split the master key into
  --secret-threshold=secret-threshold  [default: 1] The number of shares required to reconstruct the master key
  --vault-addr=vault-addr              [default: http://127.0.0.1:8200] The vault address
  --vault-token=vault-token            [default: myroot] The vault token
```

## `vstool policy-sync`

Syncs policies to Vault

```
USAGE
  $ vstool policy-sync

OPTIONS
  -h, --help                 show CLI help

  --root=root                [default: ] The root to constrict the policy sync to. Some roots can be further constricted
                             such as -root=apps -root=cool-app-war

  --vault-addr=vault-addr    [default: http://127.0.0.1:8200] The vault address

  --vault-token=vault-token  [default: myroot] The vault token
```
<!-- commandsstop -->
