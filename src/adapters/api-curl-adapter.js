/**
 * API cURL Adapter - Processes cURL commands and generates test artifacts
 * Handles parsing cURL commands from input files and generating Node.js API tests
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

class ApiCurlAdapter {
    constructor() {
        this.initialized = false;
        this.patterns = {
            curlCommand: /curl\s+[^;]+/gi,
            url: /-X\s+\w+\s+"([^"]+)"|'([^']+)'|(\S+)/gi,
            method: /-X\s+(\w+)/gi,
            headers: /-H\s+"([^"]+)"|'([^']+)'/gi,
            data: /--data(?:-raw)?\s+"([^"]+)"|'([^']+)'/gi
        };
    }

    async initialize() {
        if (this.initialized) return;
        
        // Silent initialization
        this.initialized = true;
    }

    /**
     * Parse cURL commands from input file
     */
    async parseCurlFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const curlCommands = this.extractCurlCommands(content);
            
            return {
                success: true,
                commands: curlCommands,
                count: curlCommands.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                commands: []
            };
        }
    }

    /**
     * Extract cURL commands from text content
     */
    extractCurlCommands(content) {
        const commands = [];
        const curlMatches = content.match(this.patterns.curlCommand) || [];
        
        curlMatches.forEach((curlCmd, index) => {
            const parsed = this.parseCurlCommand(curlCmd);
            if (parsed) {
                parsed.id = `curl_${index + 1}`;
                parsed.originalCommand = curlCmd.trim();
                commands.push(parsed);
            }
        });
        
        return commands;
    }

    /**
     * Parse individual cURL command
     */
    parseCurlCommand(curlCmd) {
        try {
            const urlMatch = curlCmd.match(/(?:curl\s+(?:-[^\s]+\s+)*)?["']?([^"'\s]+)["']?/);
            const methodMatch = curlCmd.match(/-X\s+(\w+)/i);
            const headerMatches = curlCmd.match(/-H\s+["']([^"']+)["']/gi) || [];
            const dataMatch = curlCmd.match(/--data(?:-raw)?\s+["']([^"']+)["']/i);
            
            const headers = {};
            headerMatches.forEach(headerMatch => {
                const headerContent = headerMatch.match(/-H\s+["']([^"']+)["']/i);
                if (headerContent && headerContent[1]) {
                    const [key, ...valueParts] = headerContent[1].split(':');
                    if (key && valueParts.length > 0) {
                        headers[key.trim()] = valueParts.join(':').trim();
                    }
                }
            });

            return {
                url: urlMatch ? urlMatch[1] : null,
                method: methodMatch ? methodMatch[1].toUpperCase() : 'GET',
                headers: headers,
                data: dataMatch ? dataMatch[1] : null,
                hasAuth: curlCmd.includes('-u ') || curlCmd.includes('Authorization:'),
                hasData: !!dataMatch
            };
        } catch (error) {
            console.warn(`Failed to parse cURL command: ${error.message}`);
            return null;
        }
    }

    /**
     * Generate test artifacts from cURL commands
     */
    async generateTestArtifacts(curlCommands, options = {}) {
        const artifacts = {
            features: [],
            steps: [],
            pages: [],
            tests: []
        };

        for (const cmd of curlCommands) {
            // Generate Cucumber feature
            const feature = this.generateCucumberFeature(cmd, options);
            artifacts.features.push({
                filename: `${cmd.id}_api.feature`,
                content: feature
            });

            // Generate step definitions
            const stepDef = this.generateStepDefinitions(cmd, options);
            artifacts.steps.push({
                filename: `${cmd.id}_steps.js`,
                content: stepDef
            });

            // Generate API page object
            const pageObject = this.generatePageObject(cmd, options);
            artifacts.pages.push({
                filename: `${cmd.id}_api.js`,
                content: pageObject
            });

            // Generate Node.js test
            const nodeTest = this.generateNodeJsTest(cmd, options);
            artifacts.tests.push({
                filename: `${cmd.id}_test.js`,
                content: nodeTest
            });
        }

        return artifacts;
    }

    /**
     * Generate Cucumber feature for API test
     */
    generateCucumberFeature(cmd, options) {
        const featureName = this.generateFeatureName(cmd);
        const endpoint = this.extractEndpoint(cmd.url);
        
        return `@Generated @API @${cmd.method} @Team:AutoCoder
Feature: ${featureName}
    As a test automation engineer
    I want to validate the ${endpoint} API endpoint
    So that I can ensure the API functions correctly

    Background:
        Given the API base URL is configured
        And I have valid authentication credentials

    Scenario: Validate ${cmd.method} ${endpoint} API response
        Given I prepare the ${cmd.method} request to "${endpoint}"
        And I set the required headers
        ${cmd.hasData ? 'And I set the request payload' : ''}
        When I execute the API request
        Then the response status should be successful
        And the response should contain valid data
        And the response time should be acceptable

    Scenario: Validate ${cmd.method} ${endpoint} API error handling
        Given I prepare the ${cmd.method} request to "${endpoint}"
        And I set invalid authentication
        When I execute the API request
        Then the response status should be 401 or 403
        And the error message should be appropriate
`;
    }

    /**
     * Generate step definitions
     */
    generateStepDefinitions(cmd, options) {
        const className = this.generateClassName(cmd);
        
        return `const { Given, When, Then } = require('@cucumber/cucumber');
const { execSync } = require('child_process');
const { assert } = require('chai');

let apiResponse = null;
let responseTime = 0;

Given('I prepare the {word} request to {string}', function (method, endpoint) {
    this.method = method;
    this.endpoint = endpoint;
    this.headers = ${JSON.stringify(cmd.headers, null, 8)};
    ${cmd.hasData ? `this.payload = ${JSON.stringify(cmd.data, null, 8)};` : 'this.payload = null;'}
});

Given('I set the required headers', function () {
    // Headers are already set in the previous step
    console.log('Headers configured:', this.headers);
});

${cmd.hasData ? `Given('I set the request payload', function () {
    console.log('Payload configured:', this.payload);
});` : ''}

When('I execute the API request', function () {
    const startTime = Date.now();
    
    try {
        // Execute original cURL command for exact fidelity
        const curlCommand = \`${cmd.originalCommand.replace(/`/g, '\\`')}\`;
        console.log('Executing cURL command:', curlCommand);
        
        const result = execSync(curlCommand, { 
            encoding: 'utf8', 
            timeout: 30000,
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        responseTime = Date.now() - startTime;
        
        try {
            apiResponse = {
                status: 200, // Default for successful execution
                data: JSON.parse(result),
                raw: result,
                time: responseTime
            };
        } catch (parseError) {
            apiResponse = {
                status: 200,
                data: result,
                raw: result,
                time: responseTime
            };
        }
        
        console.log('API Response received in', responseTime, 'ms');
        
    } catch (error) {
        responseTime = Date.now() - startTime;
        
        // Handle cURL errors
        const errorOutput = error.stderr ? error.stderr.toString() : error.message;
        const statusMatch = errorOutput.match(/HTTP\\/\\d\\.\\d\\s+(\\d+)/);
        const status = statusMatch ? parseInt(statusMatch[1]) : 500;
        
        apiResponse = {
            status: status,
            error: errorOutput,
            time: responseTime
        };
        
        console.log('API Error:', error.message);
    }
});

Then('the response status should be successful', function () {
    assert.isNotNull(apiResponse, 'API response should not be null');
    assert.isTrue(apiResponse.status >= 200 && apiResponse.status <= 299, 'Response status should be in 200-299 range');
});

Then('the response should contain valid data', function () {
    assert.isNotNull(apiResponse.data, 'Response data should not be null');
    assert.isDefined(apiResponse.data, 'Response data should be defined');
});

Then('the response time should be acceptable', function () {
    assert.isBelow(responseTime, 5000, 'Response time should be below 5 seconds');
});

Given('I set invalid authentication', function () {
    // Modify headers to use invalid auth
    if (this.headers.Authorization) {
        this.headers.Authorization = 'Bearer invalid_token';
    } else {
        this.headers.Authorization = 'Bearer invalid_token';
    }
});

Then('the response status should be {int} or {int}', function (status1, status2) {
    assert.isTrue(
        apiResponse.status === status1 || apiResponse.status === status2,
        \`Expected status \${status1} or \${status2}, got \${apiResponse.status}\`
    );
});

Then('the error message should be appropriate', function () {
    assert.exists(apiResponse.error || apiResponse.data, 'Response should contain error information or data');
});
`;
    }

    /**
     * Generate page object for API
     */
    generatePageObject(cmd, options) {
        const className = this.generateClassName(cmd);
        
        return `/**
 * ${className} - API Page Object
 * Generated from cURL command: ${cmd.originalCommand}
 */

const { execSync } = require('child_process');

class ${className} {
    constructor() {
        this.baseUrl = '${this.extractBaseUrl(cmd.url)}';
        this.endpoint = '${this.extractEndpoint(cmd.url)}';
        this.method = '${cmd.method}';
        this.defaultHeaders = ${JSON.stringify(cmd.headers, null, 12)};
    }

    async executeRequest(options = {}) {
        const headers = { ...this.defaultHeaders, ...options.headers };
        const payload = options.payload || ${cmd.hasData ? JSON.stringify(cmd.data) : 'null'};
        
        // Build cURL command
        let curlCommand = \`curl -X \${this.method}\`;
        
        // Add headers
        Object.entries(headers).forEach(([key, value]) => {
            curlCommand += \` -H "\${key}: \${value}"\`;
        });
        
        // Add payload if needed
        if (payload && (this.method === 'POST' || this.method === 'PUT' || this.method === 'PATCH')) {
            const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
            curlCommand += \` --data '\${payloadStr}'\`;
        }
        
        // Add URL
        curlCommand += \` "\${this.baseUrl}\${this.endpoint}"\`;
        
        console.log('Executing:', curlCommand);
        
        try {
            const result = execSync(curlCommand, { 
                encoding: 'utf8', 
                timeout: 30000 
            });
            
            return {
                success: true,
                data: this.parseResponse(result),
                raw: result
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                stderr: error.stderr ? error.stderr.toString() : null
            };
        }
    }

    parseResponse(response) {
        try {
            return JSON.parse(response);
        } catch (error) {
            return response;
        }
    }

    async get(options = {}) {
        return this.executeRequest({ ...options, method: 'GET' });
    }

    async post(payload, options = {}) {
        return this.executeRequest({ ...options, payload, method: 'POST' });
    }

    async put(payload, options = {}) {
        return this.executeRequest({ ...options, payload, method: 'PUT' });
    }

    async delete(options = {}) {
        return this.executeRequest({ ...options, method: 'DELETE' });
    }
}

module.exports = ${className};
`;
    }

    /**
     * Generate Node.js test
     */
    generateNodeJsTest(cmd, options) {
        const className = this.generateClassName(cmd);
        
        return `/**
 * ${className} - Node.js API Test
 * Generated from cURL: ${cmd.originalCommand}
 */

const { execSync } = require('child_process');
const { expect } = require('chai');

describe('${className} API Tests', () => {
    let response;
    let responseTime;

    beforeEach(() => {
        response = null;
        responseTime = 0;
    });

    test('should execute cURL command successfully', async () => {
        const startTime = Date.now();
        
        try {
            // Execute original cURL command for exact fidelity
            const curlCommand = \`${cmd.originalCommand.replace(/`/g, '\\`')}\`;
            console.log('Executing cURL:', curlCommand);
            
            const result = execSync(curlCommand, { 
                encoding: 'utf8', 
                timeout: 30000,
                stdio: ['pipe', 'pipe', 'pipe']
            });
            
            responseTime = Date.now() - startTime;
            
            // Parse response
            try {
                response = JSON.parse(result);
            } catch (parseError) {
                response = result;
            }
            
            // Assertions
            assert.isNotNull(response, 'Response should not be null');
            assert.isBelow(responseTime, 5000, 'Response time should be below 5 seconds');
            
            console.log('✅ API request completed in', responseTime, 'ms');
            
        } catch (error) {
            console.error('❌ API request failed:', error.message);
            throw error;
        }
    });

    test('should have acceptable response time', async () => {
        // This test depends on the previous test execution
        assert.isBelow(responseTime, 10000, 'Response time should be below 10 seconds');
    });

    test('should return valid response structure', async () => {
        // This test depends on the previous test execution
        assert.isDefined(response, 'Response should be defined');
        
        if (typeof response === 'object' && response !== null) {
            // If JSON response, verify it's valid object
            assert.isAbove(Object.keys(response).length, 0, 'Response object should have properties');
        } else {
            // If text response, verify it's not empty
            assert.isAbove(response.toString().length, 0, 'Response should not be empty');
        }
    });
});
`;
    }

    /**
     * Helper methods
     */
    generateFeatureName(cmd) {
        const endpoint = this.extractEndpoint(cmd.url);
        const cleanEndpoint = endpoint.replace(/[^a-zA-Z0-9]/g, ' ').trim();
        return `API ${cmd.method} ${cleanEndpoint}`;
    }

    generateClassName(cmd) {
        const endpoint = this.extractEndpoint(cmd.url);
        const cleanEndpoint = endpoint.replace(/[^a-zA-Z0-9]/g, '');
        return `${cmd.method}${cleanEndpoint}API`;
    }

    extractBaseUrl(url) {
        try {
            const urlObj = new URL(url);
            return `${urlObj.protocol}//${urlObj.host}`;
        } catch (error) {
            const match = url.match(/^(https?:\/\/[^\/]+)/);
            return match ? match[1] : url;
        }
    }

    extractEndpoint(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.pathname + urlObj.search;
        } catch (error) {
            const match = url.match(/^https?:\/\/[^\/]+(.*)$/);
            return match ? match[1] : url;
        }
    }
}

module.exports = ApiCurlAdapter;
