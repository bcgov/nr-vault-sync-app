import 'reflect-metadata';
import {VaultController} from '../vault/vault.controller';
import {vaultFactory} from '../vault/vault.factory';

describe('user groups in Vault', () => {
  const log = jest.fn(() => {});
  const error = jest.fn(() => {});
  const vault = vaultFactory('addr', 'token');
  afterEach(() => {
    log.mockClear();
    error.mockClear();
  });

  test('group exists', async () => {
    const readFn = jest.fn().mockResolvedValue('exists');
    vault.read = readFn;

    const vc = new VaultController(vault, log, error);
    await vc.syncGroup('existing');
    expect(readFn).toBeCalledTimes(1);
    expect(log).toBeCalledTimes(1);
    expect(log).toBeCalledWith(`Group existing already exists in Vault.`);
    expect(error).toBeCalledTimes(0);
  });

  test('group does not exist', async () => {
    const readFn = jest.fn().mockRejectedValueOnce({response: {statusCode: 404}}).mockResolvedValueOnce('newgroup');
    const writeFn = jest.fn().mockResolvedValue({name: 'new'});
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

  test('group lookup fails', async () => {
    const readFn = jest.fn().mockRejectedValue({response: {statusCode: 999}});
    vault.read = readFn;

    const vc = new VaultController(vault, log, error);
    await vc.syncGroup('find-fails')
      .then(() => {
        expect(readFn).toHaveBeenCalledTimes(1);
        expect(log).toHaveBeenCalledTimes(0);
        expect(error).toHaveBeenCalledTimes(1);
        expect(error).toHaveBeenCalledWith(`Error searching for group 'find-fails' in Vault: Error 999!`);
      });
  });

  test('group creation fails', async () => {
    const readFn = jest.fn().mockRejectedValue({response: {statusCode: 404}});
    const writeFn = jest.fn().mockRejectedValue({response: {statusCode: 999}});

    vault.read = readFn;
    vault.write = writeFn;

    const vc = new VaultController(vault, log, error);
    await vc.syncGroup('newgroup-fails')
      .catch(() => {
        expect(readFn).toHaveBeenCalledTimes(1);
        expect(writeFn).toHaveBeenCalledTimes(1);
        expect(log).toHaveBeenCalledTimes(0);
        expect(error).toHaveBeenCalledTimes(1);
        expect(error).toHaveBeenCalledWith(`Error creating group 'newgroup-fails' in Vault: Error 999!`);
      });
  });
});
