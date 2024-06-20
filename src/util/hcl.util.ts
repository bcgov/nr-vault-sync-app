import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';
import { injectable } from 'inversify';
import { Application } from '../services/app.service';
import EnvironmentUtil from './environment.util';
import FsUtil from './fs.util';

export interface HlcRenderSpec {
  group: string;
  templateName: string;
  data?: ejs.Data | undefined;
}

/**
 * Utility class for HCL
 */
export default class HclUtil {
  private static templatesdir = path.join('config', 'templates');

  /**
   * Renders a body from the template
   * @param spec The information to use to render the body
   */
  public renderBody(spec: HlcRenderSpec): string {
    const fsUtil = new FsUtil();
    const pathArray = [
      HclUtil.templatesdir,
      spec.group,
      `${spec.templateName}.hcl.tpl`,
    ].filter((s): s is string => s != undefined);
    const filePath = path.join(...pathArray);
    return ejs.render(fsUtil.readFile(filePath), {
      ...spec.data,
    });
  }

  /**
   * Renders a name from the template if it exists or parameters
   * @param spec The information to use to render the body
   */
  public renderName(spec: HlcRenderSpec): string {
    const pathArray = [
      HclUtil.templatesdir,
      spec.group,
      `${spec.templateName}.name.tpl`,
    ].filter((s): s is string => s != undefined);
    const filePath = path.join(...pathArray);
    if (fs.existsSync(filePath)) {
      return `${spec.group}/${ejs.render(
        fs.readFileSync(filePath, { encoding: 'utf8' }),
        {
          ...spec.data,
        },
      )}`;
    } else {
      return spec.group
        ? `${spec.group}/${spec.templateName}`
        : spec.templateName;
    }
  }

  /**
   * Renders the app role from the parameters
   * @param app The application to generate the role for
   * @param env The environment of that role
   * @returns string
   */
  renderApproleName(app: Application, env: string): string {
    return `${app.project.toLowerCase()}_${app.app.toLowerCase()}_${EnvironmentUtil.normalize(
      env,
    )}`;
  }
}
