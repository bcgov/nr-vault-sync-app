import {VaultController} from '../vault/vault.controller';
import {vaultFactory} from '../vault/vault.factory';
// eslint-disable-next-line no-unused-vars

describe('user groups in Vault', () => {
  afterEach(() => jest.restoreAllMocks());

  test('group exists', async () => {
    const log = jest.fn((message: string) => {});
    const error = jest.fn((message: string) => {});
    const readFn = jest.fn().mockResolvedValue('exists');
    const vault = vaultFactory('addr', 'token');
    vault.read = readFn;

    const vc = new VaultController(vault, log, error);
    await vc.syncGroup('existing');
    expect(readFn).toBeCalledTimes(1);
    expect(log).toBeCalledTimes(1);
    expect(log).toBeCalledWith(`Group existing already exists in Vault.`);
    expect(error).toBeCalledTimes(0);
  });

  test('group does not exist', async () => {
    const log = jest.fn((message: string) => {});
    const error = jest.fn((message: string) => {});
    const readFn = jest.fn().mockRejectedValueOnce({response: {statusCode: 404}}).mockResolvedValueOnce('newgroup');
    const writeFn = jest.fn().mockResolvedValue({name: 'new'});
    const vault = vaultFactory('addr', 'token');
    vault.read = readFn;
    vault.write = writeFn;

    const vc = new VaultController(vault, log, error);
    await vc.syncGroup('newgroup')
      .then(() => {
        expect(readFn).toHaveBeenCalledTimes(2);
        expect(writeFn).toHaveBeenCalledTimes(1);
        expect(log).toHaveBeenCalledTimes(1);
        expect(log).toHaveBeenCalledWith(`Group newgroup created in Vault.`);
        expect(error).toHaveBeenCalledTimes(0);
      });
  });

  test('group lookup fails', () => {

  });

  test('group creation fails', () => {

  });
});
