# Vault Policy Generator #

VPG is a tool for generating and syncing vault policies, groups and appRoles for applications.

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

`docker run --cap-add=IPC_LOCK -e 'VAULT_DEV_ROOT_TOKEN_ID=myroot' -e 'VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200' --name=dev-vault -p 8200:8200 vault`

You will need to enable the 'AppRole' authentication method.

`vault auth enable approle`
