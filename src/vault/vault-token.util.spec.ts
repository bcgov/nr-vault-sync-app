import * as fs from 'fs';
import nv from 'node-vault';
import { resolveVaultToken } from './vault-token.util';

jest.mock('fs');
jest.mock('node-vault');

describe('vault-token.util', () => {
  afterEach(() => jest.restoreAllMocks());

  describe('resolveVaultToken', () => {
    it('returns the direct token when no file is provided', async () => {
      const result = await resolveVaultToken({
        'vault-token': 'my-token',
        'vault-addr': 'http://127.0.0.1:8200',
      });
      expect(result).toBe('my-token');
    });

    it('reads token from file when vault-token-file is provided', async () => {
      const mockReadFileSync = jest.mocked(fs.readFileSync);
      mockReadFileSync.mockReturnValue('file-token\n');

      const result = await resolveVaultToken({
        'vault-token': 'default-token',
        'vault-token-file': '/path/to/token',
        'vault-addr': 'http://127.0.0.1:8200',
      });

      expect(result).toBe('file-token');
      expect(mockReadFileSync).toHaveBeenCalledWith('/path/to/token', 'utf8');
    });

    it('trims whitespace from file token', async () => {
      const mockReadFileSync = jest.mocked(fs.readFileSync);
      mockReadFileSync.mockReturnValue('  token-with-spaces  \n');

      const result = await resolveVaultToken({
        'vault-token': 'default',
        'vault-token-file': '/path/to/token',
        'vault-addr': 'http://127.0.0.1:8200',
      });

      expect(result).toBe('token-with-spaces');
    });

    it('prefers file token over direct token', async () => {
      const mockReadFileSync = jest.mocked(fs.readFileSync);
      mockReadFileSync.mockReturnValue('file-token');

      const result = await resolveVaultToken({
        'vault-token': 'direct-token',
        'vault-token-file': '/path/to/token',
        'vault-addr': 'http://127.0.0.1:8200',
      });

      expect(result).toBe('file-token');
    });

    it('throws when no token is available', async () => {
      await expect(
        resolveVaultToken({
          'vault-addr': 'http://127.0.0.1:8200',
        }),
      ).rejects.toThrow('Vault token is required');
    });

    it('unwraps token when vault-token-unwrap is true', async () => {
      const mockWrite = jest.fn().mockResolvedValue({
        auth: { client_token: 'unwrapped-token' },
      });
      const mockNodeVault = jest.mocked(nv);
      mockNodeVault.mockReturnValue({
        write: mockWrite,
      } as unknown as nv.client);

      const result = await resolveVaultToken({
        'vault-token': 'wrapped-token',
        'vault-token-unwrap': true,
        'vault-addr': 'http://127.0.0.1:8200',
      });

      expect(result).toBe('unwrapped-token');
      expect(mockNodeVault).toHaveBeenCalledWith({
        apiVersion: 'v1',
        endpoint: 'http://127.0.0.1:8200',
        token: 'wrapped-token',
      });
      expect(mockWrite).toHaveBeenCalledWith('sys/wrapping/unwrap', {});
    });

    it('strips trailing slash from vault address when unwrapping', async () => {
      const mockWrite = jest.fn().mockResolvedValue({
        auth: { client_token: 'unwrapped-token' },
      });
      const mockNodeVault = jest.mocked(nv);
      mockNodeVault.mockReturnValue({
        write: mockWrite,
      } as unknown as nv.client);

      await resolveVaultToken({
        'vault-token': 'wrapped-token',
        'vault-token-unwrap': true,
        'vault-addr': 'http://127.0.0.1:8200/',
      });

      expect(mockNodeVault).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: 'http://127.0.0.1:8200',
        }),
      );
    });
  });
});
