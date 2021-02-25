
import nv from 'node-vault';

export const vault = nv({
  apiVersion: 'v1',
  endpoint: process.env.VAULT_ADDR || 'http://127.0.0.1:8200',
  token: process.env.VAULT_TOKEN || 'myroot',
});
