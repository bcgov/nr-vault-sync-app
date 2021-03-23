import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';
import {injectable} from 'inversify';

@injectable()
/**
 * Utility class for HCL
 */
export default class HclUtil {
  private static templatesdir = path.join(__dirname, '..', 'vault', 'templates');

  /**
   * Renders a body from the template
   * @param baseDir The base directory for the templates
   * @param group The template logical grouping folder
   * @param templateName The template name
   * @param data Additional data to pass to the template
   */
  public renderBody(baseDir: string, group: string | undefined, templateName: string, data: ejs.Data | undefined) {
    const pathArray = [HclUtil.templatesdir, baseDir, group, `${templateName}.hcl.tpl`]
      .filter((s): s is string => s != undefined);
    const filePath = path.join(...pathArray);
    return ejs.render(
      fs.readFileSync(filePath, 'UTF8'),
      {
        ...data,
      },
    );
  }

  /**
   * Renders a name from the template if it exists or parameters
   * @param baseDir The base directory for the templates
   * @param group The template logical grouping folder
   * @param templateName The template name
   * @param data Additional data to pass to the template
   */
  public renderName(baseDir: string, group: string | undefined, templateName: string, data: ejs.Data | undefined) {
    const pathArray = [HclUtil.templatesdir, baseDir, group, `${templateName}.name.tpl`]
      .filter((s): s is string => s != undefined);
    const filePath = path.join(...pathArray);
    if (fs.existsSync(filePath)) {
      return `${group}/${ejs.render(
        fs.readFileSync(filePath, 'UTF8'),
        {
          ...data,
        },
      )}`;
    } else {
      return `${group}/${templateName}`;
    }
  }
}
