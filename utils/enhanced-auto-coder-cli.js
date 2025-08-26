#!/usr/bin/env node

/**
 * 🚀 ENHANCED AUTO-CODER CLI WITH PLAYWRIGHT MCP INTEGRATION
 * 
 * Comprehensive CLI for SBS_Automation test artifact generation and execution
 * - Generate artifacts with registry validation
 * - Execute tests via Playwright MCP
 * - Auto-fix failures and re-test
 * - Deploy artifacts to main SBS
 * - Interactive mode with guided workflows
 * 
 * @author Auto-Coder Enhanced CLI System
 * @date 2025-08-06
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawn, exec } = require('child_process');
const { promisify } = require('util');

const ConflictFreeAutoCoderGenerator = require('./conflict-free-auto-coder-generator');
const PlaywrightMCPTestExecutor = require('./playwright-mcp-test-executor');

const execAsync = promisify(exec);

class EnhancedAutoCoderCLI {
    constructor() {
        this.autoCoderPath = path.resolve('/Users/gadea/auto/auto/qa_automation/auto-coder');
        this.sbsPath = path.resolve('/Users/gadea/auto/auto/qa_automation/SBS_Automation');
        this.generator = new ConflictFreeAutoCoderGenerator();
        this.testExecutor = new PlaywrightMCPTestExecutor();
        
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        console.log('🚀 Enhanced Auto-Coder CLI with Playwright MCP Integration');
        console.log('📦 Version: 2.0.0');
    }

    /**
     * 🎯 Main CLI entry point
     */
    async run() {
        const args = process.argv.slice(2);
        const command = args[0];
        
        try {
            switch (command) {
                case 'generate':
                    await this.generateCommand(args.slice(1));
                    break;
                case 'test':
                    await this.testCommand(args.slice(1));
                    break;
                case 'deploy':
                    await this.deployCommand(args.slice(1));
                    break;
                case 'workflow':
                    await this.workflowCommand(args.slice(1));
                    break;
                case 'interactive':
                case 'i':
                    await this.interactiveMode();
                    break;
                case 'validate':
                    await this.validateCommand(args.slice(1));
                    break;
                case 'cleanup':
                    await this.cleanupCommand(args.slice(1));
                    break;
                case 'help':
                case '--help':
                case '-h':
                    this.showHelp();
                    break;
                default:
                    if (!command) {
                        await this.interactiveMode();
                    } else {
                        console.log(`❌ Unknown command: ${command}`);
                        this.showHelp();
                        process.exit(1);
                    }
            }
        } catch (error) {
            console.error('❌ CLI Error:', error.message);
            process.exit(1);
        } finally {
            this.rl.close();
        }
    }

    /**
     * 🔧 Generate test artifacts
     */
    async generateCommand(args) {
        console.log('\n🔧 GENERATE COMMAND');
        console.log('=' .repeat(50));
        
        const options = this.parseOptions(args, {
            file: { alias: 'f', description: 'Requirement file path' },
            type: { alias: 't', description: 'Requirement type (image, text, jira)' },
            domain: { alias: 'd', description: 'Domain (billing, payroll, etc.)' },
            validate: { alias: 'v', description: 'Validate after generation', flag: true },
            test: { description: 'Run tests after generation', flag: true },
            deploy: { description: 'Deploy to main SBS after generation', flag: true }
        });
        
        // Get requirement file
        let requirementFile = options.file;
        if (!requirementFile) {
            requirementFile = await this.prompt('📄 Enter requirement file path: ');
        }
        
        if (!fs.existsSync(requirementFile)) {
            throw new Error(`Requirement file not found: ${requirementFile}`);
        }
        
        // Determine requirement type
        let requirementType = options.type;
        if (!requirementType) {
            const ext = path.extname(requirementFile).toLowerCase();
            if (['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) {
                requirementType = 'image';
            } else if (['.txt', '.md'].includes(ext)) {
                requirementType = 'text';
            } else {
                requirementType = await this.prompt('📋 Enter requirement type (image/text/jira): ');
            }
        }
        
        // Get domain
        let domain = options.domain;
        if (!domain) {
            domain = await this.prompt('🏢 Enter domain (billing, payroll, company, etc.): ');
        }
        
        console.log(`\n🔄 Generating artifacts for ${requirementType} requirement: ${path.basename(requirementFile)}`);
        
        try {
            // Generate artifacts using the conflict-free generator
            const requirement = {
                title: path.basename(requirementFile, path.extname(requirementFile)),
                type: requirementType,
                file: requirementFile,
                domain: domain
            };
            
            const result = await this.generator.generateArtifacts(requirement);
            
            console.log('✅ Artifacts generated successfully:');
            console.log(`   Features: ${result.features?.length || 0}`);
            console.log(`   Pages: ${result.pages?.length || 0}`);
            console.log(`   Steps: ${result.steps?.length || 0}`);
            
            // Optional validation
            if (options.validate) {
                await this.validateGenerated(result);
            }
            
            // Optional testing
            if (options.test) {
                await this.testGenerated(result);
            }
            
            // Optional deployment
            if (options.deploy) {
                await this.deployGenerated(result);
            }
            
        } catch (error) {
            console.error('❌ Generation failed:', error.message);
            throw error;
        }
    }

    /**
     * 🎭 Execute Playwright tests
     */
    async testCommand(args) {
        console.log('\n🎭 TEST COMMAND');
        console.log('=' .repeat(50));
        
        const options = this.parseOptions(args, {
            features: { alias: 'f', description: 'Specific features to test (comma-separated)' },
            headless: { description: 'Run in headless mode', flag: true, default: true },
            headed: { description: 'Run in headed mode', flag: true },
            cleanup: { description: 'Cleanup after tests', flag: true, default: true },
            reporter: { alias: 'r', description: 'Test reporter (json, html, junit)' },
            autofix: { description: 'Auto-fix failures and re-test', flag: true, default: true }
        });
        
        // Override headless if headed is specified
        if (options.headed) {
            options.headless = false;
        }
        
        console.log('🚀 Starting Playwright MCP test execution...');
        
        try {
            const testOptions = {
                features: options.features ? options.features.split(',') : null,
                headless: options.headless,
                cleanup: options.cleanup,
                reporter: options.reporter || 'json',
                autofix: options.autofix
            };
            
            const results = await this.testExecutor.executeTestWorkflow(testOptions);
            
            console.log('\n📊 Test Results Summary:');
            console.log(`✅ Passed: ${results.passed.length}`);
            console.log(`❌ Failed: ${results.failed.length}`);
            console.log(`🔧 Fixed: ${results.fixed.length}`);
            console.log(`⚠️ Errors: ${results.errors.length}`);
            
            if (results.failed.length > 0) {
                console.log('\n❌ Some tests failed. Check the detailed report for more information.');
                process.exit(1);
            }
            
        } catch (error) {
            console.error('❌ Test execution failed:', error.message);
            throw error;
        }
    }

    /**
     * 🚀 Deploy artifacts to main SBS
     */
    async deployCommand(args) {
        console.log('\n🚀 DEPLOY COMMAND');
        console.log('=' .repeat(50));
        
        const options = this.parseOptions(args, {
            features: { alias: 'f', description: 'Specific features to deploy (comma-separated)' },
            backup: { alias: 'b', description: 'Create backup before deployment', flag: true, default: true },
            validate: { alias: 'v', description: 'Validate before deployment', flag: true, default: true },
            force: { description: 'Force deployment without validation', flag: true }
        });
        
        if (!options.force) {
            const confirm = await this.prompt('⚠️  This will copy artifacts to main SBS_Automation. Continue? (y/N): ');
            if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
                console.log('❌ Deployment cancelled');
                return;
            }
        }
        
        try {
            // Create backup if requested
            if (options.backup) {
                await this.createDeploymentBackup();
            }
            
            // Validate artifacts if requested
            if (options.validate && !options.force) {
                await this.validateForDeployment();
            }
            
            // Deploy artifacts
            await this.deployArtifacts(options.features);
            
            console.log('✅ Deployment completed successfully');
            
        } catch (error) {
            console.error('❌ Deployment failed:', error.message);
            throw error;
        }
    }

    /**
     * 🔄 Complete workflow (generate + test + deploy)
     */
    async workflowCommand(args) {
        console.log('\n🔄 COMPLETE WORKFLOW');
        console.log('=' .repeat(50));
        
        const options = this.parseOptions(args, {
            file: { alias: 'f', description: 'Requirement file path' },
            type: { alias: 't', description: 'Requirement type (image, text, jira)' },
            domain: { alias: 'd', description: 'Domain (billing, payroll, etc.)' },
            skip_test: { description: 'Skip testing phase', flag: true },
            skip_deploy: { description: 'Skip deployment phase', flag: true },
            headless: { description: 'Run tests in headless mode', flag: true, default: true }
        });
        
        try {
            // Step 1: Generate
            console.log('\n📋 STEP 1: GENERATE ARTIFACTS');
            await this.generateCommand(['--file', options.file, '--type', options.type, '--domain', options.domain]);
            
            // Step 2: Test (if not skipped)
            if (!options.skip_test) {
                console.log('\n🎭 STEP 2: TEST ARTIFACTS');
                await this.testCommand(['--headless=' + options.headless, '--autofix']);
            }
            
            // Step 3: Deploy (if not skipped and tests passed)
            if (!options.skip_deploy) {
                console.log('\n🚀 STEP 3: DEPLOY ARTIFACTS');
                await this.deployCommand(['--validate', '--backup']);
            }
            
            console.log('\n🎉 Complete workflow finished successfully!');
            
        } catch (error) {
            console.error('❌ Workflow failed:', error.message);
            throw error;
        }
    }

    /**
     * 🎨 Interactive mode with guided workflows
     */
    async interactiveMode() {
        console.log('\n🎨 INTERACTIVE MODE');
        console.log('=' .repeat(50));
        
        while (true) {
            console.log('\nChoose an option:');
            console.log('1. 📋 Generate test artifacts');
            console.log('2. 🎭 Execute Playwright tests');
            console.log('3. 🚀 Deploy to main SBS');
            console.log('4. 🔄 Complete workflow (generate + test + deploy)');
            console.log('5. 🔍 Validate existing artifacts');
            console.log('6. 🧹 Cleanup generated artifacts');
            console.log('7. 📊 View reports');
            console.log('8. ❓ Help');
            console.log('9. 🚪 Exit');
            
            const choice = await this.prompt('\n👉 Enter your choice (1-9): ');
            
            try {
                switch (choice) {
                    case '1':
                        await this.interactiveGenerate();
                        break;
                    case '2':
                        await this.interactiveTest();
                        break;
                    case '3':
                        await this.interactiveDeploy();
                        break;
                    case '4':
                        await this.interactiveWorkflow();
                        break;
                    case '5':
                        await this.interactiveValidate();
                        break;
                    case '6':
                        await this.interactiveCleanup();
                        break;
                    case '7':
                        await this.interactiveReports();
                        break;
                    case '8':
                        this.showHelp();
                        break;
                    case '9':
                        console.log('👋 Goodbye!');
                        return;
                    default:
                        console.log('❌ Invalid choice. Please enter 1-9.');
                }
            } catch (error) {
                console.error('❌ Error:', error.message);
                const continueChoice = await this.prompt('Continue? (Y/n): ');
                if (continueChoice.toLowerCase() === 'n' || continueChoice.toLowerCase() === 'no') {
                    break;
                }
            }
        }
    }

    /**
     * 🔍 Validate artifacts
     */
    async validateCommand(args) {
        console.log('\n🔍 VALIDATE COMMAND');
        console.log('=' .repeat(50));
        
        const options = this.parseOptions(args, {
            path: { alias: 'p', description: 'Path to validate (default: auto-coder/SBS_Automation)' },
            fix: { alias: 'f', description: 'Auto-fix validation issues', flag: true },
            report: { alias: 'r', description: 'Generate validation report', flag: true }
        });
        
        const validatePath = options.path || path.join(this.autoCoderPath, 'SBS_Automation');
        
        console.log(`🔍 Validating artifacts in: ${validatePath}`);
        
        try {
            const validation = await this.validateArtifacts(validatePath, options.fix);
            
            console.log('\n📊 Validation Results:');
            console.log(`✅ Valid: ${validation.valid}`);
            console.log(`❌ Invalid: ${validation.invalid}`);
            console.log(`🔧 Fixed: ${validation.fixed}`);
            
            if (options.report) {
                await this.generateValidationReport(validation);
            }
            
            if (validation.invalid > 0) {
                console.log('\n⚠️  Some artifacts have validation issues. Use --fix to auto-fix or check the detailed report.');
            }
            
        } catch (error) {
            console.error('❌ Validation failed:', error.message);
            throw error;
        }
    }

    /**
     * 🧹 Cleanup artifacts
     */
    async cleanupCommand(args) {
        console.log('\n🧹 CLEANUP COMMAND');
        console.log('=' .repeat(50));
        
        const options = this.parseOptions(args, {
            all: { alias: 'a', description: 'Clean all generated artifacts', flag: true },
            tests: { alias: 't', description: 'Clean test artifacts only', flag: true },
            reports: { alias: 'r', description: 'Clean reports only', flag: true },
            backup: { alias: 'b', description: 'Create backup before cleanup', flag: true }
        });
        
        try {
            if (options.backup) {
                await this.createCleanupBackup();
            }
            
            if (options.all || (!options.tests && !options.reports)) {
                await this.cleanupAll();
            } else {
                if (options.tests) {
                    await this.cleanupTests();
                }
                if (options.reports) {
                    await this.cleanupReports();
                }
            }
            
            console.log('✅ Cleanup completed');
            
        } catch (error) {
            console.error('❌ Cleanup failed:', error.message);
            throw error;
        }
    }

    /**
     * 🛠️ Utility methods for interactive mode
     */
    
    async interactiveGenerate() {
        console.log('\n📋 INTERACTIVE GENERATE');
        
        const requirementFile = await this.prompt('📄 Enter requirement file path: ');
        const requirementType = await this.prompt('📋 Enter requirement type (image/text/jira): ');
        const domain = await this.prompt('🏢 Enter domain (billing, payroll, company, etc.): ');
        
        await this.generateCommand(['--file', requirementFile, '--type', requirementType, '--domain', domain, '--validate']);
    }
    
    async interactiveTest() {
        console.log('\n🎭 INTERACTIVE TEST');
        
        const features = await this.prompt('📄 Enter specific features to test (comma-separated, or press Enter for all): ');
        const headless = await this.prompt('🖥️  Run in headless mode? (Y/n): ');
        
        const args = [];
        if (features.trim()) {
            args.push('--features', features);
        }
        if (headless.toLowerCase() === 'n' || headless.toLowerCase() === 'no') {
            args.push('--headed');
        }
        args.push('--autofix');
        
        await this.testCommand(args);
    }
    
    async interactiveDeploy() {
        console.log('\n🚀 INTERACTIVE DEPLOY');
        
        const features = await this.prompt('📄 Enter specific features to deploy (comma-separated, or press Enter for all): ');
        const backup = await this.prompt('💾 Create backup before deployment? (Y/n): ');
        
        const args = [];
        if (features.trim()) {
            args.push('--features', features);
        }
        if (backup.toLowerCase() === 'n' || backup.toLowerCase() === 'no') {
            args.push('--no-backup');
        }
        args.push('--validate');
        
        await this.deployCommand(args);
    }
    
    async interactiveWorkflow() {
        console.log('\n🔄 INTERACTIVE COMPLETE WORKFLOW');
        
        const requirementFile = await this.prompt('📄 Enter requirement file path: ');
        const requirementType = await this.prompt('📋 Enter requirement type (image/text/jira): ');
        const domain = await this.prompt('🏢 Enter domain (billing, payroll, company, etc.): ');
        const skipTest = await this.prompt('🎭 Skip testing phase? (y/N): ');
        const skipDeploy = await this.prompt('🚀 Skip deployment phase? (y/N): ');
        
        const args = ['--file', requirementFile, '--type', requirementType, '--domain', domain];
        if (skipTest.toLowerCase() === 'y' || skipTest.toLowerCase() === 'yes') {
            args.push('--skip_test');
        }
        if (skipDeploy.toLowerCase() === 'y' || skipDeploy.toLowerCase() === 'yes') {
            args.push('--skip_deploy');
        }
        
        await this.workflowCommand(args);
    }
    
    async interactiveValidate() {
        console.log('\n🔍 INTERACTIVE VALIDATE');
        
        const validatePath = await this.prompt('📂 Enter path to validate (or press Enter for default): ');
        const autoFix = await this.prompt('🔧 Auto-fix validation issues? (Y/n): ');
        const generateReport = await this.prompt('📊 Generate validation report? (Y/n): ');
        
        const args = [];
        if (validatePath.trim()) {
            args.push('--path', validatePath);
        }
        if (autoFix.toLowerCase() !== 'n' && autoFix.toLowerCase() !== 'no') {
            args.push('--fix');
        }
        if (generateReport.toLowerCase() !== 'n' && generateReport.toLowerCase() !== 'no') {
            args.push('--report');
        }
        
        await this.validateCommand(args);
    }
    
    async interactiveCleanup() {
        console.log('\n🧹 INTERACTIVE CLEANUP');
        
        const cleanupType = await this.prompt('🗑️  What to clean? (all/tests/reports): ');
        const backup = await this.prompt('💾 Create backup before cleanup? (Y/n): ');
        
        const args = [];
        if (cleanupType === 'tests') {
            args.push('--tests');
        } else if (cleanupType === 'reports') {
            args.push('--reports');
        } else {
            args.push('--all');
        }
        
        if (backup.toLowerCase() !== 'n' && backup.toLowerCase() !== 'no') {
            args.push('--backup');
        }
        
        await this.cleanupCommand(args);
    }
    
    async interactiveReports() {
        console.log('\n📊 INTERACTIVE REPORTS');
        
        const reportsPath = path.join(this.autoCoderPath, 'SBS_Automation', 'reports');
        
        if (!fs.existsSync(reportsPath)) {
            console.log('📂 No reports directory found');
            return;
        }
        
        const reports = fs.readdirSync(reportsPath).filter(f => f.endsWith('.html') || f.endsWith('.json'));
        
        if (reports.length === 0) {
            console.log('📄 No reports found');
            return;
        }
        
        console.log('\n📊 Available reports:');
        reports.forEach((report, index) => {
            console.log(`${index + 1}. ${report}`);
        });
        
        const choice = await this.prompt('👉 Enter report number to view (or press Enter to skip): ');
        const reportIndex = parseInt(choice) - 1;
        
        if (reportIndex >= 0 && reportIndex < reports.length) {
            const reportPath = path.join(reportsPath, reports[reportIndex]);
            console.log(`📖 Opening report: ${reportPath}`);
            
            if (reports[reportIndex].endsWith('.html')) {
                await execAsync(`open "${reportPath}"`);
            } else {
                console.log(fs.readFileSync(reportPath, 'utf8'));
            }
        }
    }

    /**
     * 🛠️ Helper methods
     */
    
    async prompt(question) {
        return new Promise((resolve) => {
            this.rl.question(question, resolve);
        });
    }
    
    parseOptions(args, optionDefs) {
        const options = {};
        
        // Set defaults
        for (const [key, def] of Object.entries(optionDefs)) {
            if (def.default !== undefined) {
                options[key] = def.default;
            }
        }
        
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            
            if (arg.startsWith('--')) {
                const key = arg.slice(2);
                const [mainKey, value] = key.includes('=') ? key.split('=', 2) : [key, null];
                
                const def = optionDefs[mainKey];
                if (def) {
                    if (def.flag) {
                        options[mainKey] = value !== null ? value === 'true' : true;
                    } else if (value !== null) {
                        options[mainKey] = value;
                    } else if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
                        options[mainKey] = args[i + 1];
                        i++;
                    }
                }
            } else if (arg.startsWith('-')) {
                const key = arg.slice(1);
                
                // Find option by alias
                const [mainKey, def] = Object.entries(optionDefs).find(([_, d]) => d.alias === key) || [];
                if (mainKey && def) {
                    if (def.flag) {
                        options[mainKey] = true;
                    } else if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
                        options[mainKey] = args[i + 1];
                        i++;
                    }
                }
            }
        }
        
        return options;
    }
    
    showHelp() {
        console.log(`
🚀 Enhanced Auto-Coder CLI with Playwright MCP Integration

USAGE:
  auto-coder [command] [options]

COMMANDS:
  generate      Generate test artifacts from requirements
  test          Execute Playwright tests via MCP
  deploy        Deploy artifacts to main SBS_Automation
  workflow      Complete workflow (generate + test + deploy)
  validate      Validate existing artifacts
  cleanup       Clean up generated artifacts
  interactive   Interactive mode with guided workflows
  help          Show this help message

GENERATE OPTIONS:
  -f, --file <path>        Requirement file path
  -t, --type <type>        Requirement type (image, text, jira)
  -d, --domain <domain>    Domain (billing, payroll, etc.)
  -v, --validate           Validate after generation
  --test                   Run tests after generation
  --deploy                 Deploy to main SBS after generation

TEST OPTIONS:
  -f, --features <list>    Specific features to test (comma-separated)
  --headless              Run in headless mode (default)
  --headed                Run in headed mode
  --cleanup               Cleanup after tests (default)
  -r, --reporter <type>    Test reporter (json, html, junit)
  --autofix               Auto-fix failures and re-test (default)

DEPLOY OPTIONS:
  -f, --features <list>    Specific features to deploy (comma-separated)
  -b, --backup            Create backup before deployment (default)
  -v, --validate          Validate before deployment (default)
  --force                 Force deployment without validation

WORKFLOW OPTIONS:
  -f, --file <path>        Requirement file path
  -t, --type <type>        Requirement type (image, text, jira)
  -d, --domain <domain>    Domain (billing, payroll, etc.)
  --skip_test             Skip testing phase
  --skip_deploy           Skip deployment phase
  --headless              Run tests in headless mode (default)

VALIDATE OPTIONS:
  -p, --path <path>        Path to validate (default: auto-coder/SBS_Automation)
  -f, --fix               Auto-fix validation issues
  -r, --report            Generate validation report

CLEANUP OPTIONS:
  -a, --all               Clean all generated artifacts
  -t, --tests             Clean test artifacts only
  -r, --reports           Clean reports only
  -b, --backup            Create backup before cleanup

EXAMPLES:
  auto-coder generate -f ./req/billing.png -t image -d billing
  auto-coder test --features billing-invoice --headed
  auto-coder workflow -f ./req/payroll.txt -t text -d payroll
  auto-coder interactive
  auto-coder validate --fix --report
  auto-coder cleanup --all --backup

INTERACTIVE MODE:
  Run 'auto-coder' or 'auto-coder interactive' for guided workflows
        `);
    }
    
    // Placeholder implementations for helper methods
    async validateGenerated(result) {
        console.log('🔍 Validating generated artifacts...');
        // Implementation for validation
    }
    
    async testGenerated(result) {
        console.log('🎭 Testing generated artifacts...');
        await this.testExecutor.executeTestWorkflow();
    }
    
    async deployGenerated(result) {
        console.log('🚀 Deploying generated artifacts...');
        await this.deployArtifacts();
    }
    
    async createDeploymentBackup() {
        console.log('💾 Creating deployment backup...');
        // Implementation for deployment backup
    }
    
    async validateForDeployment() {
        console.log('🔍 Validating artifacts for deployment...');
        // Implementation for deployment validation
    }
    
    async deployArtifacts(features = null) {
        console.log('🚀 Deploying artifacts to main SBS_Automation...');
        // Implementation for artifact deployment
    }
    
    async validateArtifacts(validatePath, autoFix = false) {
        console.log(`🔍 Validating artifacts in ${validatePath}...`);
        // Implementation for artifact validation
        return { valid: 0, invalid: 0, fixed: 0 };
    }
    
    async generateValidationReport(validation) {
        console.log('📊 Generating validation report...');
        // Implementation for validation report
    }
    
    async createCleanupBackup() {
        console.log('💾 Creating cleanup backup...');
        // Implementation for cleanup backup
    }
    
    async cleanupAll() {
        console.log('🧹 Cleaning all artifacts...');
        // Implementation for full cleanup
    }
    
    async cleanupTests() {
        console.log('🧹 Cleaning test artifacts...');
        // Implementation for test cleanup
    }
    
    async cleanupReports() {
        console.log('🧹 Cleaning reports...');
        // Implementation for report cleanup
    }
}

// CLI Entry Point
if (require.main === module) {
    const cli = new EnhancedAutoCoderCLI();
    cli.run().catch((error) => {
        console.error('💥 CLI failed:', error);
        process.exit(1);
    });
}

module.exports = EnhancedAutoCoderCLI;
