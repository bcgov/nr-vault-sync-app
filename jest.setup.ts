import 'reflect-metadata';
import { platform as osPlatform } from 'node:os';

// @oclif/core's getPlatform() uses a dynamic import() to detect WSL, which Jest's
// CJS module runtime cannot execute without --experimental-vm-modules. Stub it out
// so command tests don't hit that dynamic import at all.
jest.mock('./node_modules/@oclif/core/lib/util/os.js', () => {
  const actual = jest.requireActual(
    './node_modules/@oclif/core/lib/util/os.js',
  );
  return {
    ...actual,
    getPlatform: jest.fn(async () => osPlatform()),
  };
});
