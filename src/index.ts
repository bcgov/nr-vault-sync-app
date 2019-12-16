import * as fs from 'fs';
import * as path from 'path';

import ConfigurationManager from './configuration-manager';
import GroupManager from './group-manager';
import {vault} from './vault';

const CONFIG_DIR = path.join(__dirname, '../config');

console.log('Vault Policy Application Sync');
console.log(`Server: ${vault.endpoint}`);

// Scan config folder
const configurationFiles = fs.readdirSync(CONFIG_DIR);

console.log('Starting sync...');

const gm = new GroupManager();
(async () => {
  for (const file of configurationFiles) {
    const cm = new ConfigurationManager(path.join(CONFIG_DIR, file), gm);
    await cm.sync();
  }

  await gm.sync();
})().catch(e => {
  console.log('Error');
  process.exit(-1);
}).then(() => {
  console.log('Done!');
});

