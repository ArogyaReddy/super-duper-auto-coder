#!/usr/bin/env node

/**
 * Cross-Platform Runner for Auto-Coder Framework
 * Handles platform-specific commands and file operations
 */

const CrossPlatformRunner = require('../src/cross-platform-runner');
const CrossPlatformPathManager = require('../src/cross-platform-paths');
const fs = require('fs-extra');
const path = require('path');

class AutoCoderCrossPlatformCLI {
    constructor() {
        this.runner = new CrossPlatformRunner();
        this.pathManager = new CrossPlatformPathManager();
    }

    async fixImports() {
        console.log('🔧 Fixing import paths for cross-platform compatibility...');
        
        const generatedPagesDir = this.pathManager.resolvePath('generated', 'pages');
        
        if (!await this.pathManager.pathExists(generatedPagesDir)) {
            console.log('No generated pages directory found, skipping import fixes.');
            return;
        }

        try {
            const files = await fs.readdir(generatedPagesDir);
            const jsFiles = files.filter(file => file.endsWith('.js'));

            for (const file of jsFiles) {
                const filePath = path.join(generatedPagesDir, file);
                let content = await fs.readFile(filePath, 'utf8');
                
                // Fix common import path issues
                content = content.replace(
                    /require\(['"]\.\.\/common\/base-page['"]\)/g, 
                    "require('../../support/common/base-page')"
                );
                
                await fs.writeFile(filePath, content);
            }
            
            console.log(`✅ Fixed imports in ${jsFiles.length} page files`);
        } catch (error) {
            console.error('❌ Error fixing imports:', error.message);
        }
    }

    async openReports() {
        console.log('📊 Opening test reports...');
        
        const reportDir = this.pathManager.resolvePath('generated', 'reports');
        
        // Try Playwright report first
        const playwrightReport = path.join(reportDir, 'playwright-report', 'index.html');
        if (await this.pathManager.pathExists(playwrightReport)) {
            await this.runner.openFile(playwrightReport);
            console.log('✅ Opened Playwright report');
        } else {
            console.log('⚠️  Playwright report not found');
        }
    }

    async openDetailedReport() {
        console.log('📋 Opening detailed test report...');
        
        const detailedReport = this.pathManager.resolvePath('generated', 'reports', 'custom', 'detailed-test-report.html');
        
        if (await this.pathManager.pathExists(detailedReport)) {
            await this.runner.openFile(detailedReport);
            console.log('✅ Opened detailed report');
        } else {
            console.log('⚠️  Detailed report not found');
        }
    }

    async cleanReports() {
        console.log('🧹 Cleaning report directories...');
        
        const reportDir = this.pathManager.resolvePath('generated', 'reports');
        
        if (await this.pathManager.pathExists(reportDir)) {
            await this.runner.removeFile(reportDir);
            await this.runner.createDirectory(reportDir);
            console.log('✅ Cleaned reports directory');
        } else {
            console.log('⚠️  Reports directory not found');
        }
    }

    async generateArtifacts(inputFile) {
        console.log(`🎯 Generating test artifacts from: ${inputFile}`);
        
        if (!await this.pathManager.pathExists(inputFile)) {
            console.error(`❌ Input file not found: ${inputFile}`);
            process.exit(1);
        }

        // Check if this is a markdown template file
        if (inputFile.endsWith('.md') && inputFile.includes('bdd-requirement-template')) {
            console.log('📝 Processing BDD markdown template...');
            await this.processMarkdownTemplate(inputFile);
            return;
        }

        // Ensure generated directories exist
        const dirs = ['SBS_Automation', 'SBS_Automation/features', 'SBS_Automation/steps', 'SBS_Automation/pages', 'SBS_Automation/tests', 'SBS_Automation/reports'];
        for (const dir of dirs) {
            await this.runner.createDirectory(this.pathManager.resolvePath(dir));
        }

        try {
            // RULE #10: Use absolute path to ensure correct framework location
            const frameworkRoot = path.resolve(__dirname, '..');
            const autoCoderPath = path.join(frameworkRoot, 'bin', 'auto-coder.js');
            
            console.log(`🔧 Using auto-coder path: ${autoCoderPath}`);
            
            const result = await this.runner.executeCommand('node', [autoCoderPath, 'generate', inputFile]);
            
            if (result.code === 0) {
                console.log('✅ Test artifacts generated successfully');
                console.log(result.stdout);
            } else {
                console.error('❌ Generation failed:', result.stderr);
            }
        } catch (error) {
            console.error('❌ Error generating artifacts:', error.message);
        }
    }

    async processMarkdownTemplate(templatePath) {
        try {
            const MarkdownTemplateProcessor = require('../src/templates/markdown-template-processor');
            const processor = new MarkdownTemplateProcessor();
            
            // Process the markdown template into a text requirement
            const requirementPath = await processor.processTemplate(templatePath);
            
            console.log('🔄 Generating test artifacts from processed requirement...');
            
            // Now generate artifacts from the processed requirement
            await this.generateArtifacts(requirementPath);
            
        } catch (error) {
            console.error('❌ Error processing markdown template:', error.message);
            process.exit(1);
        }
    }

    async runTest(testFile) {
        console.log(`🧪 Running test: ${testFile}`);
        
        if (!await this.pathManager.pathExists(testFile)) {
            console.error(`❌ Test file not found: ${testFile}`);
            process.exit(1);
        }

        const extension = path.extname(testFile).toLowerCase();
        
        try {
            if (extension === '.feature') {
                console.log('Running Cucumber test...');
                await this.runner.runCucumberTest(testFile, {
                    format: 'progress'
                });
            } else if (extension === '.js') {
                if (testFile.includes('test') || testFile.includes('spec')) {
                    console.log('Running Playwright test...');
                    await this.runner.runPlaywrightTest(testFile);
                } else {
                    console.log('Running Node.js script...');
                    await this.runner.executeCommand('node', [testFile]);
                }
            } else {
                console.error(`❌ Unknown test file type: ${extension}`);
                process.exit(1);
            }
            
            console.log('✅ Test execution completed');
        } catch (error) {
            console.error('❌ Test execution failed:', error.message);
        }
    }

    async showPlatformInfo() {
        console.log('🖥️  Platform Information:');
        const info = this.pathManager.getPlatformInfo();
        console.log(JSON.stringify(info, null, 2));
        
        console.log('\n🔍 Path Validation:');
        const validation = await this.pathManager.validatePaths();
        console.log(JSON.stringify(validation, null, 2));
    }

    async showUsage() {
        console.log(`
🎯 Auto-Coder Cross-Platform Runner

Usage: node bin/cross-platform-runner.js <command> [arguments]

Commands:
  generate <input_file>     Generate test artifacts from input file
  test <test_file>         Run test file (supports .feature, .js)
  run <test_file>          Alias for test command
  fix-imports              Fix import paths in generated files
  open-reports             Open Playwright test reports
  open-detailed-report     Open detailed custom report
  clean-reports            Clean all report directories
  platform-info           Show platform and path information
  help                     Show this help message

Examples:
  node bin/cross-platform-runner.js generate input/jira/story.txt
  node bin/cross-platform-runner.js test SBS_Automation/tests/story-test.js
  node bin/cross-platform-runner.js fix-imports
  node bin/cross-platform-runner.js open-reports

Platform: ${process.platform}
Framework Root: ${this.pathManager.getFrameworkRoot()}
        `);
    }
}

// CLI execution
async function main() {
    const cli = new AutoCoderCrossPlatformCLI();
    const args = process.argv.slice(2);
    const command = args[0];
    const argument = args[1];

    switch (command) {
        case 'generate':
            if (!argument) {
                console.error('❌ Input file required for generate command');
                process.exit(1);
            }
            await cli.generateArtifacts(argument);
            break;

        case 'test':
        case 'run':
            if (!argument) {
                console.error('❌ Test file required for test/run command');
                process.exit(1);
            }
            await cli.runTest(argument);
            break;

        case 'fix-imports':
            await cli.fixImports();
            break;

        case 'open-reports':
            await cli.openReports();
            break;

        case 'open-detailed-report':
            await cli.openDetailedReport();
            break;

        case 'clean-reports':
            await cli.cleanReports();
            break;

        case 'platform-info':
            await cli.showPlatformInfo();
            break;

        case 'help':
        case undefined:
            await cli.showUsage();
            break;

        default:
            console.error(`❌ Unknown command: ${command}`);
            await cli.showUsage();
            process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = AutoCoderCrossPlatformCLI;
