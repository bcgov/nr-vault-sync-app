import 'reflect-metadata';
import EnvironmentUtil from './environment.util';

describe('environment util', () => {
  afterEach(() => jest.restoreAllMocks());

  it('normalize - PRODUCTION', () => {
    const rVal = EnvironmentUtil.normalize('PRODUCTION');
    expect(rVal).toBe('prod');
  });

  it('normalize - TEST', () => {
    const rVal = EnvironmentUtil.normalize('TEST');
    expect(rVal).toBe('test');
  });

  it('normalize - DEVELOPMENT', () => {
    const rVal = EnvironmentUtil.normalize('DEVELOPMENT');
    expect(rVal).toBe('dev');
  });

  it('normalize - INTEGRATION', () => {
    const rVal = EnvironmentUtil.normalize('INTEGRATION');
    expect(rVal).toBe('int');
  });

  it('normalize - WFPRD', () => {
    const rVal = EnvironmentUtil.normalize('WFPRD');
    expect(rVal).toBe('prod');
  });

  it('normalize - WFTST', () => {
    const rVal = EnvironmentUtil.normalize('WFTST');
    expect(rVal).toBe('test');
  });

  it('normalize - WFDLV', () => {
    const rVal = EnvironmentUtil.normalize('WFDLV');
    expect(rVal).toBe('dev');
  });

  it('normalize - WFINT', () => {
    const rVal = EnvironmentUtil.normalize('WFINT');
    expect(rVal).toBe('int');
  });

  it('normalize - SMTPRODUCTION', () => {
    const rVal = EnvironmentUtil.normalize('SMTPRODUCTION');
    expect(rVal).toBe('prod');
  });

  it('normalize - SMTTEST', () => {
    const rVal = EnvironmentUtil.normalize('TEST');
    expect(rVal).toBe('test');
  });

  it('normalize - SMTDELIVERY', () => {
    const rVal = EnvironmentUtil.normalize('SMTDELIVERY');
    expect(rVal).toBe('dev');
  });

  it('normalize - garbage', () => {
    expect(() => {
      EnvironmentUtil.normalize('octopus');
    }).toThrow('Unsupported env: octopus');
  });
});
