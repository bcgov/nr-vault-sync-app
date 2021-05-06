import * as fs from 'fs';
import * as ejs from 'ejs';
import * as path from 'path';
import HclUtil from './hcl.util';
import {mocked} from 'ts-jest/utils';

jest.mock('fs');
jest.mock('ejs');
const mockFs = mocked(fs);
const mockEjs = mocked(ejs);

describe('hcl util', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('renderBody - renders a body', () => {
    const hclUtil = new HclUtil();
    mockFs.readFileSync.mockReturnValue('template');
    mockEjs.render.mockReturnValue('rendered!');

    const rVal = hclUtil.renderBody({group: 'group', templateName: 'cool-temp', data: {data: 'data'}});
    const filePath = path.join('group', 'cool-temp.hcl.tpl');

    expect(rVal).toBe('rendered!');
    expect(mockFs.readFileSync).toBeCalledTimes(1);
    expect(mockFs.readFileSync).toBeCalledWith(expect.stringContaining(filePath), 'UTF8');

    expect(mockEjs.render).toBeCalledTimes(1);
    expect(mockEjs.render).toBeCalledWith('template', {data: 'data'});
  });

  it('renderName - renders a name with template', () => {
    const hclUtil = new HclUtil();
    mockFs.readFileSync.mockReturnValue('template');
    mockFs.existsSync.mockReturnValue(true);
    mockEjs.render.mockReturnValue('rendered!');

    const rVal = hclUtil.renderName({group: 'group', templateName: 'cool-temp', data: {data: 'data'}});
    const filePath = path.join('group', 'cool-temp.name.tpl');

    expect(rVal).toBe('group/rendered!');
    expect(mockFs.existsSync).toBeCalledTimes(1);
    expect(mockFs.existsSync).toBeCalledWith(expect.stringContaining(filePath));
    expect(mockFs.readFileSync).toBeCalledTimes(1);
    expect(mockFs.readFileSync).toBeCalledWith(expect.stringContaining(filePath), 'UTF8');

    expect(mockEjs.render).toBeCalledTimes(1);
    expect(mockEjs.render).toBeCalledWith('template', {data: 'data'});
  });

  it('renderName - renders a name without a template', () => {
    const hclUtil = new HclUtil();
    mockFs.existsSync.mockReturnValue(false);

    const rVal = hclUtil.renderName({group: '', templateName: 'cool-temp', data: {data: 'data'}});
    const filePath = path.join('cool-temp.name.tpl');

    expect(rVal).toBe('cool-temp');
    expect(mockFs.existsSync).toBeCalledTimes(1);
    expect(mockFs.existsSync).toBeCalledWith(expect.stringContaining(filePath));

    expect(mockEjs.render).not.toBeCalled();
  });
});
