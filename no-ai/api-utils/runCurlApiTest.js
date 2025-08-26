const CurlApiRunner = require('./curlApiRunner');

/**
 * Entry point to run cURL/API tests from a file
 * Usage: node runCurlApiTest.js <path-to-curl-file>
 */
async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node runCurlApiTest.js <path-to-curl-file>');
    process.exit(1);
  }
  try {
    await CurlApiRunner.runFromFile(filePath);
    console.log('All API tests completed.');
  } catch (err) {
    console.error('Error running API tests:', err);
    process.exit(2);
  }
}

if (require.main === module) {
  main();
}
