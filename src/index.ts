import * as fs from 'fs';
import * as path from 'path';

import ConfigurationManager from './configuration-manager';
import GroupManager from './group-manager';

const CONFIG_DIR = path.join(__dirname, '../config');

// Scan config folder
const configurationFiles = fs.readdirSync(CONFIG_DIR);

const gm = new GroupManager();

for (const file of configurationFiles) {
  const cm = new ConfigurationManager(path.join(CONFIG_DIR, file), gm);
  cm.sync();
}

gm.sync();
