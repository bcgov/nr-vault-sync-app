import nv from 'node-vault';
import { vaultFactory } from './vault.factory';

jest.mock('node-vault');

describe('vault.factory', () => {
  afterEach(() => jest.restoreAllMocks());

  it('Returns a nv.client', () => {
    const mockNodeVault = jest.mocked(nv);
    const val = 'return';
    mockNodeVault.mockReturnValue(val as unknown as nv.client);

    // Test command
    const rVal = vaultFactory('addr', 'token');

    expect(mockNodeVault).toHaveBeenCalledTimes(1);
    expect(mockNodeVault).toHaveBeenCalledWith({
      apiVersion: 'v1',
      endpoint: 'addr',
      token: 'token',
    });
    expect(rVal).toEqual(val);
  });

  // Disabled because the factory only runs once
  it.skip('Returns a nv.client (without ending slash)', () => {
    const mockNodeVault = jest.mocked(nv);
    const val = 'return';
    mockNodeVault.mockReturnValue(val as unknown as nv.client);

    // Test command
    const rVal = vaultFactory('addr/', 'token');

    expect(mockNodeVault).toHaveBeenCalledTimes(1);
    expect(mockNodeVault).toHaveBeenCalledWith({
      apiVersion: 'v1',
      endpoint: 'addr',
      token: 'token',
    });
    expect(rVal).toEqual(val);
  });
});
