import {vault} from './vault';
import nv from 'node-vault';

/* eslint @typescript-eslint/no-unsafe-assignment: "off", jest/no-disabled-tests: "off" */
describe.skip('Vault', () => {
  let appVault: nv.client;

  beforeAll(async () => {
    const roleResult = await vault.getApproleRoleId({role_name: 'foo-bob'});
    const secretResult = await vault.getApproleRoleSecret({role_name: 'foo-bob'});
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- No typing avialable
    const roleId = roleResult.data.role_id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- No typing avialable
    const secretId = secretResult.data.secret_id;
    const login = await vault.approleLogin({role_id: roleId, secret_id: secretId});
    // console.log(login);

    appVault = nv({
      apiVersion: 'v1',
      endpoint: process.env.VAULT_ADDR || 'http://127.0.0.1:8200',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- No typing avialable
      token: login.auth.client_token,
    });
  });

  test('Expect failure to read role id', async () => {
    await expect(async () => {
      await appVault.read('auth/approle/role/foo-bob/role-id');
    }).rejects.toThrow();
  });

  test('Expect error writing new secret', async () => {
    await expect(async () => {
      await appVault.write('secret/data/foo/bob', {test: 'true'});
    }).rejects.toThrow();
  });
});
