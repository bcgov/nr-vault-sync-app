import * as fs from 'fs';
import * as ejs from 'ejs';
import * as path from 'path';
import HclUtil from './hcl.util';
import FsUtil from './fs.util';

jest.mock('fs');
jest.mock('ejs');
const mockFs = jest.mocked(fs);
const mockEjs = jest.mocked(ejs);

describe('hcl util', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('renderBody - renders a body', () => {
    const mockFsUtil = {
      readFileSync: jest.fn(() => 'template'),
    } as unknown as FsUtil;
    const hclUtil = new HclUtil(mockFsUtil);
    mockEjs.render.mockReturnValue('rendered!');

    const rVal = hclUtil.renderBody({
      group: 'group',
      templateName: 'cool-temp',
      data: { data: 'data' },
    });
    const filePath = path.join('group', 'cool-temp.hcl.tpl');

    expect(rVal).toBe('rendered!');
    expect(mockFsUtil.readFileSync).toHaveBeenCalledTimes(1);
    expect(mockFsUtil.readFileSync).toHaveBeenCalledWith(
      expect.stringContaining(filePath),
      { encoding: 'utf8' },
    );

    expect(mockEjs.render).toHaveBeenCalledTimes(1);
    expect(mockEjs.render).toHaveBeenCalledWith('template', { data: 'data' });
  });

  it('renderName - renders a name with template', () => {
    const mockFsUtil = {
      readFileSync: jest.fn(() => 'template'),
    } as unknown as FsUtil;
    const hclUtil = new HclUtil(mockFsUtil);
    mockFs.existsSync.mockReturnValue(true);
    mockEjs.render.mockReturnValue('rendered!');

    const rVal = hclUtil.renderName({
      group: 'group',
      templateName: 'cool-temp',
      data: { data: 'data' },
    });
    const filePath = path.join('group', 'cool-temp.name.tpl');

    expect(rVal).toBe('group/rendered!');
    expect(mockFs.existsSync).toHaveBeenCalledTimes(1);
    expect(mockFs.existsSync).toHaveBeenCalledWith(
      expect.stringContaining(filePath),
    );
    expect(mockFsUtil.readFileSync).toHaveBeenCalledTimes(1);
    expect(mockFsUtil.readFileSync).toHaveBeenCalledWith(
      expect.stringContaining(filePath),
      { encoding: 'utf8' },
    );

    expect(mockEjs.render).toHaveBeenCalledTimes(1);
    expect(mockEjs.render).toHaveBeenCalledWith('template', { data: 'data' });
  });

  it('renderName - renders a name without a template', () => {
    const mockFsUtil = {
      readFileSync: jest.fn(() => 'template'),
    } as unknown as FsUtil;
    const hclUtil = new HclUtil(mockFsUtil);
    mockFs.existsSync.mockReturnValue(false);

    const rVal = hclUtil.renderName({
      group: '',
      templateName: 'cool-temp',
      data: { data: 'data' },
    });
    const filePath = path.join('cool-temp.name.tpl');

    expect(rVal).toBe('cool-temp');
    expect(mockFs.existsSync).toHaveBeenCalledTimes(1);
    expect(mockFs.existsSync).toHaveBeenCalledWith(
      expect.stringContaining(filePath),
    );

    expect(mockEjs.render).not.toHaveBeenCalled();
  });

  it('renderApproleName - renders approles', () => {
    const mockFsUtil = {
      readFileSync: jest.fn(() => 'template'),
    } as unknown as FsUtil;
    const hclUtil = new HclUtil(mockFsUtil);

    const rVal = hclUtil.renderApproleName(
      {
        env: [],
        app: 'BananA',
        project: 'FARM',
      },
      'PRODUCTION',
    );

    expect(rVal).toBe('farm_banana_prod');
  });
});
