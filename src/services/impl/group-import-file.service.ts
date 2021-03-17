import {inject, injectable} from 'inversify';
import {TYPES} from '../../inversify.types';
import winston from 'winston';
import * as fs from 'fs';
import * as path from 'path';
import {GroupImportService} from '../group-import.service';

@injectable()
/**
 * A file based group import implementation
 */
export class GroupImportFileService implements GroupImportService {
  private static readonly defaultFilePath
    = path.join(__dirname, '../../../inputs', 'test.json');

  /**
   * @param filePath The path to a JSON file to import from.
   */
  constructor(
    private filePath: string = GroupImportFileService.defaultFilePath,
    @inject(TYPES.Logger) private logger: winston.Logger,
  ) {}

  /**
   * Gets the groups from a file.
   * @returns The JSON group data (see reference inputs/test.json)
   */
  public getGroups() {
    try {
      const infile = fs.readFileSync(this.filePath, 'utf8');
      console.log(infile);
      console.log(JSON.parse(infile));
      return JSON.parse(infile).groups;
    } catch (errors) {
      return this.logger.error(`Something went wrong with a file read: ${errors}!`);
    }
  }
}
