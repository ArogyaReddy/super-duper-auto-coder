const axios = require('axios');
const fs = require('fs');

/**
 * Utility to run API tests from a cURL command or file
 */
class CurlApiRunner {
  constructor() {}

  /**
   * Parse a cURL command string and convert to axios config
   */
  static parseCurl(curlString) {
    // Basic parser for demonstration (expand as needed)
    const methodMatch = curlString.match(/-X (\w+)/);
    const urlMatch = curlString.match(/(https?:\/\/[^\s"']+)/);
    const headerMatches = [...curlString.matchAll(/-H "([^"]+)"/g)];
    const dataMatch = curlString.match(/--data-raw '([^']+)'/);

    const method = methodMatch ? methodMatch[1] : 'GET';
    const url = urlMatch ? urlMatch[1] : '';
    const headers = {};
    headerMatches.forEach(h => {
      const [key, value] = h[1].split(':').map(s => s.trim());
      headers[key] = value;
    });
    const data = dataMatch ? dataMatch[1] : undefined;

    return { method, url, headers, data };
  }

  /**
   * Run a cURL command string
   */
  static async runCurl(curlString) {
    const config = CurlApiRunner.parseCurl(curlString);
    try {
      const response = await axios({
        method: config.method,
        url: config.url,
        headers: config.headers,
        data: config.data,
      });
      console.log('Status:', response.status);
      console.log('Response:', response.data);
      return response;
    } catch (err) {
      console.error('API Error:', err.message);
      if (err.response) {
        console.error('Response:', err.response.data);
      }
      throw err;
    }
  }

  /**
   * Run API tests from a file containing cURL commands
   */
  static async runFromFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const curlCommands = content.split(/\n(?=curl )/); // Split by lines starting with 'curl '
    for (const curlCmd of curlCommands) {
      if (curlCmd.trim()) {
        await CurlApiRunner.runCurl(curlCmd);
      }
    }
  }
}

module.exports = CurlApiRunner;
