import * as fs from 'fs';

import DeliverableFactory from './template/deliverable-factory';
// eslint-disable-next-line no-unused-vars
import {ProjectConfig} from './types';
// eslint-disable-next-line no-unused-vars
import GroupManager from './group-manager';

/**
 * Reads the configuration and calls factory to sync vault setup
 */
class ConfigurationManager {
    private config: ProjectConfig;

    /**
     * Constructs the configuration manager
     * @param path The path to the configuration
     * @param gm The group manager
     */
    constructor(private path: string, private gm: GroupManager) {
      console.log(`ConfigurationManager file: ${path}`);
      this.config = JSON.parse(fs.readFileSync(this.path, 'utf-8'));
    }

    /**
     * Syncs the configuration with vault
     */
    async sync(): Promise<any> {
      for (const dp of DeliverableFactory.generate(this.config.project, undefined, this.gm)) {
        await dp.sync();
      }
      for (const appConfig of this.config.applications) {
        for (const dp of DeliverableFactory.generate(appConfig, this.config.project, this.gm)) {
          await dp.sync();
        }
      }
    }
}

export default ConfigurationManager;
