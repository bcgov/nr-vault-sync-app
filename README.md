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
podman run --rm ghcr.io/bcgov-nr/vault-sync-app:v2.0.1 health
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
vstool/1.0.0 darwin-x64 node-v20.11.1
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
* [`vstool plugins`](#vstool-plugins)
* [`vstool plugins:add PLUGIN`](#vstool-pluginsadd-plugin)
* [`vstool plugins:inspect PLUGIN...`](#vstool-pluginsinspect-plugin)
* [`vstool plugins:install PLUGIN`](#vstool-pluginsinstall-plugin)
* [`vstool plugins:link PATH`](#vstool-pluginslink-path)
* [`vstool plugins:remove [PLUGIN]`](#vstool-pluginsremove-plugin)
* [`vstool plugins:reset`](#vstool-pluginsreset)
* [`vstool plugins:uninstall [PLUGIN]`](#vstool-pluginsuninstall-plugin)
* [`vstool plugins:unlink [PLUGIN]`](#vstool-pluginsunlink-plugin)
* [`vstool plugins:update`](#vstool-pluginsupdate)
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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.6/src/commands/help.ts)_

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

## `vstool plugins`

List installed plugins.

```
USAGE
  $ vstool plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ vstool plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.7/src/commands/plugins/index.ts)_

## `vstool plugins:add PLUGIN`

Installs a plugin into vstool.

```
USAGE
  $ vstool plugins:add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into vstool.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the VSTOOL_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the VSTOOL_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ vstool plugins:add

EXAMPLES
  Install a plugin from npm registry.

    $ vstool plugins:add myplugin

  Install a plugin from a github url.

    $ vstool plugins:add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ vstool plugins:add someuser/someplugin
```

## `vstool plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ vstool plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ vstool plugins:inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.7/src/commands/plugins/inspect.ts)_

## `vstool plugins:install PLUGIN`

Installs a plugin into vstool.

```
USAGE
  $ vstool plugins:install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into vstool.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the VSTOOL_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the VSTOOL_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ vstool plugins:add

EXAMPLES
  Install a plugin from npm registry.

    $ vstool plugins:install myplugin

  Install a plugin from a github url.

    $ vstool plugins:install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ vstool plugins:install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.7/src/commands/plugins/install.ts)_

## `vstool plugins:link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ vstool plugins:link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ vstool plugins:link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.7/src/commands/plugins/link.ts)_

## `vstool plugins:remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ vstool plugins:remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ vstool plugins:unlink
  $ vstool plugins:remove

EXAMPLES
  $ vstool plugins:remove myplugin
```

## `vstool plugins:reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ vstool plugins:reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.7/src/commands/plugins/reset.ts)_

## `vstool plugins:uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ vstool plugins:uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ vstool plugins:unlink
  $ vstool plugins:remove

EXAMPLES
  $ vstool plugins:uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.7/src/commands/plugins/uninstall.ts)_

## `vstool plugins:unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ vstool plugins:unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ vstool plugins:unlink
  $ vstool plugins:remove

EXAMPLES
  $ vstool plugins:unlink myplugin
```

## `vstool plugins:update`

Update installed plugins.

```
USAGE
  $ vstool plugins:update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.7/src/commands/plugins/update.ts)_

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
