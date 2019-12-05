import * as fs from 'fs';
import * as path from 'path';

import ConfigurationManager from './configuration-manager';
import GroupManager from './group-manager';

const CONFIG_DIR = path.join(__dirname, '../config');

// Scan config folder
const configurationFiles = fs.readdirSync(CONFIG_DIR);

console.log('Starting sync...');

const gm = new GroupManager();
(async () => {
  for (const file of configurationFiles) {
    console.log(`Config: ${file}`);
    const cm = new ConfigurationManager(path.join(CONFIG_DIR, file), gm);
    await cm.sync();
  }

  await gm.sync();
  
  console.log('Done!');
})();

