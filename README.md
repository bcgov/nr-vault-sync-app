# Vault Sync Tool #

The Vault Sync tool or VST is for generating and syncing vault policies, groups and appRoles.


<!-- toc -->
* [Vault Sync Tool #](#vault-sync-tool-)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

## Environment Variables

The tool can use the following environment variables in place of command arguments. The default is in the brackets.

* VAULT_ADDR - The address of the vault server ('http://127.0.0.1:8200')
* VAULT_TOKEN - The token to use when connecting to vault (myroot)

* KEYCLOAK_ADDR - The address of the keycloak server ('http://127.0.0.1:8080')
* KEYCLOAK_USERNAME - The username to use when connecting to Keycloak (admin)
* KEYCLOAK_PASSWORD - The password to use when connecting to Keycloak (password)


## Supported npm commands

* npm start - deploy configuration to provided vault instance
* npm run lint - lint source code
* npm run test - Run unit tests
* npm run e2e - Run end-to-end tests

## Configuration

See: [Confluence Documentation](https://apps.nrs.gov.bc.ca/int/confluence/x/m4FvBQ)

## Local testing

The following will start up vault in docker. The default environment variables should work with it.

`docker run --rm --cap-add=IPC_LOCK -e 'VAULT_DEV_ROOT_TOKEN_ID=myroot' -e 'VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200' --name=dev-vault -p 8200:8200 vault`

You will need to add a oidc authentication method to do local testing of group syncs.

`vault auth enable oidc`
`vault auth enable approle`

The following will start up keycloak in docker. The default environment variables should work with it.

`docker run -p 8080:8080 -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=password jboss/keycloak`

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
* [`vstool group-sync [FILE]`](#vstool-group-sync-file)
* [`vstool health`](#vstool-health)
* [`vstool help [COMMAND]`](#vstool-help-command)
* [`vstool init [VAULT-ADDR] [VAULT-TOKEN]`](#vstool-init-vault-addr-vault-token)
* [`vstool keycloak-group-sync [GROUPNAME]`](#vstool-keycloak-group-sync-groupname)
* [`vstool keycloak-groups-sync [FILEPATH]`](#vstool-keycloak-groups-sync-filepath)
* [`vstool policy-sync`](#vstool-policy-sync)

## `vstool group-sync [FILE]`

Syncs configured groups to Vault

```
USAGE
  $ vstool group-sync [FILE]

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

## `vstool keycloak-group-sync [GROUPNAME]`

Given a group name, creates that group in Keycloak and syncs it to Vault.

```
USAGE
  $ vstool keycloak-group-sync [GROUPNAME]

OPTIONS
  -h, --help                             show CLI help
  --keycloak-addr=keycloak-addr          [default: http://127.0.0.1:8080/auth] The keycloak address
  --keycloak-password=keycloak-password  [default: password] The keycloak password
  --keycloak-username=keycloak-username  [default: admin] The keycloak username
  --vault-addr=vault-addr                [default: http://127.0.0.1:8200] The vault address
  --vault-token=vault-token              [default: myroot] The vault token
```

## `vstool keycloak-groups-sync [FILEPATH]`

Given a JSON file, creates roles & users in Keycloak and groups in Vault

```
USAGE
  $ vstool keycloak-groups-sync [FILEPATH]

OPTIONS
  -h, --help                             show CLI help
  --keycloak-addr=keycloak-addr          [default: http://127.0.0.1:8080/auth] The keycloak address
  --keycloak-password=keycloak-password  [default: password] The keycloak password
  --keycloak-username=keycloak-username  [default: admin] The keycloak username
  --vault-addr=vault-addr                [default: http://127.0.0.1:8200] The vault address
  --vault-token=vault-token              [default: myroot] The vault token
```

## `vstool policy-sync`

Syncs configured policies to Vault

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
