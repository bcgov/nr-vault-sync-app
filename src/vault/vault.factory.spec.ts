import nv from 'node-vault';
import {mocked} from 'ts-jest/utils';
import {vaultFactory} from './vault.factory';

jest.mock('node-vault');

describe('vault.factory', () => {
  afterEach(() => jest.restoreAllMocks());

  it('Returns a nv.client', () => {
    const mockNodeVault = mocked(nv);
    const val = 'return';
    mockNodeVault.mockReturnValue(val as unknown as nv.client);

    // Test command
    const rVal = vaultFactory('addr', 'token');

    expect(mockNodeVault).toBeCalledTimes(1);
    expect(mockNodeVault).toBeCalledWith({
      apiVersion: 'v1',
      endpoint: 'addr',
      token: 'token',
    });
    expect(rVal).toEqual(val);
  });

  it('Returns a nv.client (without ending slash)', () => {
    const mockNodeVault = mocked(nv);
    const val = 'return';
    mockNodeVault.mockReturnValue(val as unknown as nv.client);

    // Test command
    const rVal = vaultFactory('addr/', 'token');

    expect(mockNodeVault).toBeCalledTimes(1);
    expect(mockNodeVault).toBeCalledWith({
      apiVersion: 'v1',
      endpoint: 'addr',
      token: 'token',
    });
    expect(rVal).toEqual(val);
  });
});
