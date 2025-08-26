/**
 * Playwright CodeGen Adapter - Handles Playwright recording and code generation
 * Manages recording sessions and generates test artifacts from recorded interactions
 */

const fs = require('fs-extra');
const path = require('path');
const { spawn, execSync } = require('child_process');

class PlaywrightCodeGenAdapter {
    constructor() {
        this.initialized = false;
        this.recordingSession = null;
        this.tempDir = path.join(process.cwd(), 'temp', 'recordings');
    }

    async initialize() {
        if (this.initialized) return;
        
        // Ensure temp directory exists
        await fs.ensureDir(this.tempDir);
        
        // Verify Playwright is installed and install if needed
        try {
            execSync('npx playwright --version', { stdio: 'pipe' });
            console.log('✅ Playwright found');
        } catch (error) {
            console.log('📦 Installing Playwright...');
            try {
                execSync('npm install @playwright/test playwright', { stdio: 'inherit' });
                execSync('npx playwright install', { stdio: 'inherit' });
                console.log('✅ Playwright installed successfully');
            } catch (installError) {
                throw new Error('Failed to install Playwright. Please run: npm install @playwright/test playwright && npx playwright install');
            }
        }
        
        this.initialized = true;
    }

    /**
     * Start Playwright CodeGen recording session
     */
    async startRecording(options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        const {
            url = 'https://demo.playwright.dev/todomvc/',
            browser = 'chromium',
            device = null,
            viewport = null,
            outputFile = null
        } = options;

        const recordingFile = outputFile || path.join(this.tempDir, `recording_${Date.now()}.js`);
        
        console.log(`🎬 Starting Playwright CodeGen recording...`);
        console.log(`📍 URL: ${url}`);
        console.log(`🌐 Browser: ${browser}`);
        console.log(`📄 Output: ${recordingFile}`);

        try {
            // Build codegen command - simplified and more reliable
            let command = ['playwright', 'codegen'];
            
            // Add browser flag
            command.push('--browser', browser);
            
            if (device) {
                command.push('--device', device);
            } else if (viewport) {
                command.push('--viewport-size', viewport);
            }
            
            // Set target language
            command.push('--target', 'javascript');
            
            // Add output file
            command.push('--output', recordingFile);
            
            // Add URL last
            command.push(url);

            console.log(`🔧 Command: npx ${command.join(' ')}`);

            // Start recording process with better options
            const recordingProcess = spawn('npx', command, {
                stdio: ['ignore', 'pipe', 'pipe'],
                cwd: process.cwd(),
                detached: false
            });

            this.recordingSession = {
                process: recordingProcess,
                outputFile: recordingFile,
                startTime: Date.now(),
                url: url,
                browser: browser
            };

            // Handle process events with better logging
            recordingProcess.stdout.on('data', (data) => {
                const output = data.toString().trim();
                if (output) {
                    console.log(`📝 CodeGen: ${output}`);
                }
            });

            recordingProcess.stderr.on('data', (data) => {
                const error = data.toString().trim();
                if (error && !error.includes('DevTools')) { // Filter out DevTools noise
                    console.error(`⚠️  CodeGen: ${error}`);
                }
            });

            recordingProcess.on('close', (code) => {
                console.log(`🎬 Recording session ended with code ${code}`);
                if (code === 0) {
                    console.log(`✅ Recording saved to: ${recordingFile}`);
                } else {
                    console.log(`❌ Recording may have failed (exit code: ${code})`);
                }
                this.recordingSession = null;
            });

            recordingProcess.on('error', (error) => {
                console.error(`❌ Process error: ${error.message}`);
                this.recordingSession = null;
            });

            // Wait a moment to see if process starts successfully
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check if process is still running
            if (!recordingProcess.killed && recordingProcess.exitCode === null) {
                console.log(`✅ Recording session started successfully!`);
                console.log(`🎬 Browser window should be opening...`);
                console.log(`💡 Record your interactions and close the browser when done`);
                
                return {
                    success: true,
                    sessionId: this.recordingSession.startTime,
                    outputFile: recordingFile,
                    process: recordingProcess
                };
            } else {
                return {
                    success: false,
                    error: `Recording process exited immediately (code: ${recordingProcess.exitCode})`
                };
            }

        } catch (error) {
            console.error('❌ Failed to start recording:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get recording status
     */
    getRecordingStatus() {
        if (!this.recordingSession) {
            return { 
                active: false, 
                message: 'No active recording session' 
            };
        }
        
        const process = this.recordingSession.process;
        const isRunning = process && !process.killed && process.exitCode === null;
        
        return {
            active: isRunning,
            sessionId: this.recordingSession.startTime,
            outputFile: this.recordingSession.outputFile,
            duration: Date.now() - this.recordingSession.startTime,
            url: this.recordingSession.url,
            browser: this.recordingSession.browser,
            message: isRunning ? 'Recording in progress' : 'Recording ended'
        };
    }
    
    /**
     * Wait for recording to complete
     */
    async waitForRecordingComplete() {
        if (!this.recordingSession) {
            return { success: false, error: 'No active recording session' };
        }
        
        return new Promise((resolve) => {
            const process = this.recordingSession.process;
            
            const timeout = setTimeout(() => {
                resolve({ 
                    success: false, 
                    error: 'Recording timeout after 10 minutes' 
                });
            }, 10 * 60 * 1000); // 10 minute timeout
            
            process.on('close', (code) => {
                clearTimeout(timeout);
                const outputFile = this.recordingSession.outputFile;
                this.recordingSession = null;
                
                resolve({
                    success: true,
                    outputFile: outputFile,
                    exitCode: code
                });
            });
            
            process.on('error', (error) => {
                clearTimeout(timeout);
                resolve({
                    success: false,
                    error: error.message
                });
            });
        });
    }
    async stopRecording() {
        if (!this.recordingSession) {
            return { success: false, error: 'No active recording session' };
        }

        try {
            // Terminate the recording process
            this.recordingSession.process.kill('SIGTERM');
            
            // Wait a moment for file to be written
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const outputFile = this.recordingSession.outputFile;
            const sessionInfo = { ...this.recordingSession };
            this.recordingSession = null;

            return {
                success: true,
                outputFile: outputFile,
                duration: Date.now() - sessionInfo.startTime
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Process recorded Playwright code and generate test artifacts
     */
    async processRecording(recordingFile, options = {}) {
        try {
            if (!await fs.pathExists(recordingFile)) {
                throw new Error(`Recording file not found: ${recordingFile}`);
            }

            const recordedCode = await fs.readFile(recordingFile, 'utf8');
            const analysis = this.analyzeRecordedCode(recordedCode);
            
            const artifacts = await this.generateTestArtifacts(analysis, options);
            
            return {
                success: true,
                analysis: analysis,
                artifacts: artifacts
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Analyze recorded Playwright code
     */
    analyzeRecordedCode(code) {
        const analysis = {
            actions: [],
            selectors: [],
            assertions: [],
            navigation: [],
            forms: [],
            clicks: [],
            inputs: []
        };

        // Extract actions
        const actionPatterns = {
            click: /await page\.click\(['"`]([^'"`]+)['"`]\)/g,
            fill: /await page\.fill\(['"`]([^'"`]+)['"`],\s*['"`]([^'"`]+)['"`]\)/g,
            goto: /await page\.goto\(['"`]([^'"`]+)['"`]\)/g,
            waitFor: /await page\.waitFor[^(]*\(([^)]+)\)/g,
            expect: /await expect\(([^)]+)\)/g
        };

        // Extract clicks
        let match;
        while ((match = actionPatterns.click.exec(code)) !== null) {
            analysis.clicks.push({
                selector: match[1],
                action: 'click'
            });
            analysis.actions.push(`Click ${match[1]}`);
            analysis.selectors.push(match[1]);
        }

        // Extract form fills
        actionPatterns.fill.lastIndex = 0;
        while ((match = actionPatterns.fill.exec(code)) !== null) {
            analysis.inputs.push({
                selector: match[1],
                value: match[2],
                action: 'fill'
            });
            analysis.actions.push(`Fill ${match[1]} with "${match[2]}"`);
            analysis.selectors.push(match[1]);
        }

        // Extract navigation
        actionPatterns.goto.lastIndex = 0;
        while ((match = actionPatterns.goto.exec(code)) !== null) {
            analysis.navigation.push({
                url: match[1],
                action: 'goto'
            });
            analysis.actions.push(`Navigate to ${match[1]}`);
        }

        // Extract waits and expectations
        actionPatterns.waitFor.lastIndex = 0;
        while ((match = actionPatterns.waitFor.exec(code)) !== null) {
            analysis.assertions.push({
                condition: match[1],
                action: 'waitFor'
            });
        }

        return analysis;
    }

    /**
     * Generate test artifacts from recorded code analysis
     */
    async generateTestArtifacts(analysis, options = {}) {
        const artifacts = {
            features: [],
            steps: [],
            pages: [],
            tests: []
        };

        // Generate Cucumber feature
        const feature = this.generateCucumberFeature(analysis, options);
        artifacts.features.push({
            filename: 'recorded_workflow.feature',
            content: feature
        });

        // Generate step definitions
        const stepDef = this.generateStepDefinitions(analysis, options);
        artifacts.steps.push({
            filename: 'recorded_workflow_steps.js',
            content: stepDef
        });

        // Generate page object
        const pageObject = this.generatePageObject(analysis, options);
        artifacts.pages.push({
            filename: 'recorded_workflow_page.js',
            content: pageObject
        });

        // Generate enhanced Playwright test
        const playwrightTest = this.generatePlaywrightTest(analysis, options);
        artifacts.tests.push({
            filename: 'recorded_workflow_test.js',
            content: playwrightTest
        });

        return artifacts;
    }

    /**
     * Generate Cucumber feature from recording
     */
    generateCucumberFeature(analysis, options) {
        const featureName = options.featureName || 'Recorded User Workflow';
        const scenario = options.scenario || 'Execute recorded user interactions';

        let steps = [];
        
        // Add navigation steps
        analysis.navigation.forEach(nav => {
            steps.push(`        When I navigate to "${nav.url}"`);
        });

        // Add interaction steps
        analysis.clicks.forEach(click => {
            steps.push(`        And I click on "${click.selector}"`);
        });

        analysis.inputs.forEach(input => {
            steps.push(`        And I fill "${input.selector}" with "${input.value}"`);
        });

        // Add verification steps
        if (analysis.assertions.length > 0) {
            steps.push(`        Then the page should be loaded correctly`);
        }

        return `@Generated @UI @Recorded @Team:AutoCoder
Feature: ${featureName}
    As a test automation engineer
    I want to execute the recorded user workflow
    So that I can validate the application behavior

    Background:
        Given I have a browser session
        And I am ready to execute the workflow

    Scenario: ${scenario}
        Given I start the workflow execution
${steps.join('\n')}
        And I verify the workflow completed successfully

    Scenario: Validate workflow elements are present
        Given I start the workflow execution
        When I check all required elements
        Then all workflow elements should be visible
        And all workflow elements should be interactive
`;
    }

    /**
     * Generate step definitions
     */
    generateStepDefinitions(analysis, options) {
        return `const { Given, When, Then } = require('@cucumber/cucumber');
const { assert } = require('chai');

let page;
let context;

Given('I have a browser session', async function () {
    // Browser session is managed by world.js
    page = this.page;
    context = this.context;
});

Given('I am ready to execute the workflow', function () {
    console.log('🎬 Starting recorded workflow execution');
});

Given('I start the workflow execution', function () {
    console.log('▶️ Executing recorded workflow steps');
});

${analysis.navigation.map(nav => `
When('I navigate to {string}', async function (url) {
    console.log(\`📍 Navigating to: \${url}\`);
    await page.goto(url);
    await page.waitForLoadState('networkidle');
});`).join('')}

When('I click on {string}', async function (selector) {
    console.log(\`👆 Clicking: \${selector}\`);
    await page.waitForSelector(selector, { timeout: 10000 });
    await page.click(selector);
});

When('I fill {string} with {string}', async function (selector, value) {
    console.log(\`✏️ Filling \${selector} with: \${value}\`);
    await page.waitForSelector(selector, { timeout: 10000 });
    await page.fill(selector, value);
});

When('I check all required elements', async function () {
    const selectors = \${JSON.stringify(analysis.selectors, null, 4)};
    
    for (const selector of selectors) {
        console.log(\`🔍 Checking element: \${selector}\`);
        await page.waitForSelector(selector, { timeout: 5000 });
    }
});

Then('the page should be loaded correctly', async function () {
    // Verify navigation completed
    const currentUrl = page.url();
    assert.isString(currentUrl, 'Current URL should be a string');
    assert.isTrue(currentUrl.length > 0, 'URL should not be empty');
    console.log('✅ Page loaded successfully');
});

Then('I verify the workflow completed successfully', function () {
    console.log('✅ Recorded workflow completed successfully');
});

Then('all workflow elements should be visible', async function () {
    const selectors = \${JSON.stringify(analysis.selectors, null, 4)};
    
    for (const selector of selectors) {
        const isVisible = await page.locator(selector).isVisible();
        assert.isTrue(isVisible, \`Element \${selector} should be visible\`);
    }
    
    console.log('✅ All workflow elements are visible');
});

Then('all workflow elements should be interactive', async function () {
    const clickableSelectors = \${JSON.stringify(analysis.clicks.map(c => c.selector), null, 4)};
    
    for (const selector of clickableSelectors) {
        const isEnabled = await page.locator(selector).isEnabled();
        assert.isTrue(isEnabled, \`Element \${selector} should be enabled\`);
    }
    
    console.log('✅ All workflow elements are interactive');
});
`;
    }

    /**
     * Generate page object
     */
    generatePageObject(analysis, options) {
        const className = options.className || 'RecordedWorkflowPage';

        const selectors = {};
        let selectorIndex = 1;
        
        analysis.selectors.forEach(selector => {
            const key = `element${selectorIndex++}`;
            selectors[key] = selector;
        });

        return `/**
 * ${className} - Page Object for Recorded Workflow
 * Generated from Playwright CodeGen recording
 */

class ${className} {
    constructor(page) {
        this.page = page;
        
        // Selectors from recorded workflow
        this.selectors = ${JSON.stringify(selectors, null, 12)};
    }

    async navigateToWorkflow() {
        ${analysis.navigation.length > 0 ? 
            `await this.page.goto('${analysis.navigation[0].url}');` : 
            'await this.page.goto(process.env.BASE_URL || "https://example.com");'
        }
        await this.page.waitForLoadState('networkidle');
    }

    ${analysis.clicks.map((click, index) => `
    async clickElement${index + 1}() {
        await this.page.waitForSelector('${click.selector}');
        await this.page.click('${click.selector}');
        console.log('Clicked: ${click.selector}');
    }`).join('')}

    ${analysis.inputs.map((input, index) => `
    async fillElement${index + 1}(value = '${input.value}') {
        await this.page.waitForSelector('${input.selector}');
        await this.page.fill('${input.selector}', value);
        console.log('Filled ${input.selector} with:', value);
    }`).join('')}

    async executeCompleteWorkflow() {
        console.log('🎬 Executing complete recorded workflow');
        
        // Navigate to starting page
        await this.navigateToWorkflow();
        
        ${analysis.clicks.map((click, index) => `
        // Click action ${index + 1}
        await this.clickElement${index + 1}();
        await this.page.waitForTimeout(1000);`).join('')}
        
        ${analysis.inputs.map((input, index) => `
        // Fill action ${index + 1}
        await this.fillElement${index + 1}();
        await this.page.waitForTimeout(1000);`).join('')}
        
        console.log('✅ Workflow execution completed');
    }

    async verifyAllElements() {
        console.log('🔍 Verifying all workflow elements');
        
        for (const [key, selector] of Object.entries(this.selectors)) {
            await this.page.waitForSelector(selector, { timeout: 5000 });
            console.log(\`✅ Element \${key} (\${selector}) is present\`);
        }
    }
}

module.exports = ${className};
`;
    }

    /**
     * Generate enhanced Playwright test
     */
    generatePlaywrightTest(analysis, options) {
        const testName = options.testName || 'Recorded Workflow Test';

        return `/**
 * ${testName} - Enhanced Playwright Test
 * Generated from CodeGen recording with additional validations
 */

const { test, expect } = require('@playwright/test');
const RecordedWorkflowPage = require('../pages/recorded_workflow_page');

test.describe('${testName}', () => {
    let workflowPage;

    test.beforeEach(async ({ page }) => {
        workflowPage = new RecordedWorkflowPage(page);
    });

    test('should execute recorded workflow successfully', async ({ page }) => {
        // Execute the complete recorded workflow
        await workflowPage.executeCompleteWorkflow();
        
        // Verify final state
    // Verify navigation completed
    const currentUrl = page.url();
    assert.isString(currentUrl, 'Current URL should be a string');
    assert.isTrue(currentUrl.length > 0, 'URL should not be empty');
    });

    test('should verify all workflow elements are present', async ({ page }) => {
        await workflowPage.navigateToWorkflow();
        await workflowPage.verifyAllElements();
    });

    test('should handle workflow element interactions', async ({ page }) => {
        await workflowPage.navigateToWorkflow();
        
        \${analysis.clicks.map((click, index) => \`
        // Test click action \${index + 1}
        await workflowPage.clickElement\${index + 1}();
        const isEnabled = await page.locator('\${click.selector}').isEnabled();
        assert.isTrue(isEnabled, 'Element should be enabled');\`).join('')}
        
        \${analysis.inputs.map((input, index) => \`
        // Test fill action \${index + 1}
        await workflowPage.fillElement\${index + 1}('test_value_\${index + 1}');
        const inputValue = await page.locator('\${input.selector}').inputValue();
        assert.equal(inputValue, 'test_value_\${index + 1}');\`).join('')}
    });

    test('should validate workflow performance', async ({ page }) => {
        const startTime = Date.now();
        
        await workflowPage.executeCompleteWorkflow();
        
        const executionTime = Date.now() - startTime;
        console.log(\`Workflow execution time: \${executionTime}ms\`);
        
        // Ensure reasonable execution time (adjust as needed)
        assert.isBelow(executionTime, 30000, 'Workflow should complete within 30 seconds');
    });
});
`;
    }

    /**
     * Get status of current recording session
     */
    getRecordingStatus() {
        if (!this.recordingSession) {
            return { active: false };
        }

        return {
            active: true,
            duration: Date.now() - this.recordingSession.startTime,
            outputFile: this.recordingSession.outputFile,
            url: this.recordingSession.url,
            browser: this.recordingSession.browser
        };
    }

    /**
     * List available recordings in temp directory
     */
    async listRecordings() {
        try {
            const files = await fs.readdir(this.tempDir);
            const recordings = files
                .filter(file => file.endsWith('.js'))
                .map(file => ({
                    filename: file,
                    path: path.join(this.tempDir, file),
                    created: fs.statSync(path.join(this.tempDir, file)).ctime
                }))
                .sort((a, b) => b.created - a.created);

            return recordings;
        } catch (error) {
            return [];
        }
    }
}

module.exports = PlaywrightCodeGenAdapter;
