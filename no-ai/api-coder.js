// api-coder.js
// Usage: node api-coder.js curl.txt --env QAFIT

const fs = require('fs');
const path = require('path');
const template = require('./templates/api-test.template');
const { getEnvConfig } = require('./env-config');

function parseCurl(curlStr) {
  // Simple parser for GET cURL
  const lines = curlStr.split(/\r?\n/);
  let url = '';
  let headers = {};
  for (const line of lines) {
    if (line.startsWith('curl')) {
      // Handle URLs in single or double quotes
      const urlMatch = line.match(/'(.*?)'/) || line.match(/"(.*?)"/) || line.match(/curl\s+-X\s+\w+\s+(\S+)/);
      url = urlMatch ? urlMatch[1] : '';
    } else if (line.includes('--header')) {
      const [, key, value] = line.match(/--header\s+'([^:]+):\s*(.*?)'/) || [];
      if (key && value) headers[key.trim()] = value.trim();
    }
  }
  const urlObj = new URL(url);
  return {
    baseURL: urlObj.origin,
    endpoint: urlObj.pathname + urlObj.search,
    headers,
  };
}

function main() {
  const curlFile = process.argv[2];
  const env = (process.argv[3] || '').replace('--env', '').trim() || 'QAFIT';
  if (!curlFile) {
    console.error('Usage: node api-coder.js <curl.txt> [--env QAFIT|IAT]');
    process.exit(1);
  }
  const curlStr = fs.readFileSync(curlFile, 'utf-8');
  const curlData = parseCurl(curlStr);
  const envConfig = getEnvConfig(env);
  const testCode = template({
    baseURL: envConfig.baseURL,
    endpoint: curlData.endpoint,
    headers: curlData.headers,
  });
  const outPath = path.join(__dirname, 'generated', 'test-cashflowCentral.js');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, testCode);
  console.log('API test generated at:', outPath);
}

main();
