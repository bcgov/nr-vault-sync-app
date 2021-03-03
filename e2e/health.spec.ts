import {exec} from 'child_process';

describe('Vault', () => {
  test('Health command gets vault info', async () => {
    return new Promise<void>((resolve) => {
      exec('node ./bin/run health', (error, stdout, stderr) => {
        expect(error).toBeNull();
        expect(stderr).toBe('');

        expect(stdout).toMatch(/^Vault health - http:\/\/0.0.0.0:8200/);
        resolve();
      });
    });
  });
});
