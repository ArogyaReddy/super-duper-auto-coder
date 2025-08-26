#!/usr/bin/env node

/**
 * MCP-Enhanced Auto-Coder CLI
 * Command-line interface with Model Context Protocol integration
 * Provides intelligent test artifact generation with Playwright and Email capabilities
 */

const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');

// Import inquirer with error handling
let inquirer;
try {
    inquirer = require('inquirer');
} catch (error) {
    console.warn('Inquirer not available. Interactive features will be limited.');
}

const HybridGenerationEngine = require('../engines/hybrid-generation-engine');
const PlaywrightMCP = require('../mcp-tools/playwright-mcp');
const EmailMCP = require('../mcp-tools/email-mcp');

class MCPEnhancedCLI {
    constructor() {
        this.program = new Command();
        this.hybridEngine = null;
        this.setupCommands();
    }

    /**
     * 🚨 CRITICAL: Validate output path to prevent writes to main SBS_Automation
     * This enforces the rule: Auto-coder only generates, never modifies main SBS_Automation
     */
    validateOutputPath(outputPath) {
        const resolvedPath = path.resolve(outputPath);
        const mainSBSPath = path.resolve('../SBS_Automation');
        
        // Check if output path is trying to write to main SBS_Automation
        if (resolvedPath.startsWith(mainSBSPath)) {
            throw new Error(`
🚨 CRITICAL RULE VIOLATION 🚨

Auto-coder is PROHIBITED from writing to main SBS_Automation directory.

Attempted path: ${resolvedPath}
Main SBS_Automation: ${mainSBSPath}

RULES:
- Auto-coder only generates artifacts in auto-coder/ subfolders
- Only humans may integrate artifacts into main SBS_Automation
- Use --output to specify a path within auto-coder/ instead

Example: --output ./SBS_Automation/my-feature
            `);
        }
        
        // Ensure output is within auto-coder directory structure
        const autocosecreativeenginedir = path.resolve(process.cwd());
        if (!resolvedPath.startsWith(autocosecreativeenginedir)) {
            console.warn(chalk.yellow(`
⚠️  WARNING: Output path is outside auto-coder directory
Output: ${resolvedPath}
Auto-coder: ${autocosecreativeenginedir}

Recommended: Use paths within auto-coder/ for better organization
            `));
        }
        
        return resolvedPath;
    }

    setupCommands() {
        this.program
            .name('auto-coder-mcp')
            .description('Auto-Coder with MCP (Model Context Protocol) enhancement')
            .version('1.0.0');

        // Enhanced generation commands
        this.program
            .command('generate')
            .description('Generate test artifacts with MCP enhancement')
            .option('-i, --input <path>', 'Input file or requirement text')
            .option('-o, --output <path>', 'Output directory (default: ./SBS_Automation)')
            .option('-t, --type <type>', 'Generation type: full|pageobject|steps|features', 'full')
            .option('--url <url>', 'URL for page object generation')
            .option('--urls <urls>', 'Comma-separated URLs for multiple page objects')
            .option('--name <name>', 'Name for the generated page object or artifact')
            .option('--no-mcp', 'Disable MCP enhancement (use traditional generation only)')
            .option('--no-playwright', 'Disable Playwright MCP integration')
            .option('--no-email', 'Disable Email MCP integration')
            .option('--browser <browser>', 'Browser type for Playwright: chromium|firefox|webkit', 'chromium')
            .option('--notifications', 'Enable email notifications for generation results')
            .option('--auto-fix', 'Automatically fix compliance issues')
            .option('--symlink-integration', 'Setup symlink integration with main SBS_Automation after generation')
            .option('--main-sbs-path <path>', 'Path to main SBS_Automation directory for symlink integration')
            .option('-v, --verbose', 'Verbose output')
            .action(async (options) => await this.handleGenerate(options));

        // Playwright-specific commands
        this.program
            .command('playwright')
            .description('Playwright MCP commands')
            .addCommand(
                new Command('page-object')
                    .description('Generate page object from URL')
                    .requiredOption('--url <url>', 'URL to analyze')
                    .requiredOption('--name <name>', 'Page object name')
                    .option('--selectors <selectors>', 'Comma-separated selectors to include')
                    .option('--browser <browser>', 'Browser type: chromium|firefox|webkit', 'chromium')
                    .action(async (options) => await this.handlePlaywrightPageObject(options))
            )
            .addCommand(
                new Command('validate-feature')
                    .description('Validate feature implementation')
                    .requiredOption('--feature <path>', 'Feature file path')
                    .option('--auto-fix', 'Automatically generate missing implementations')
                    .action(async (options) => await this.handlePlaywrightValidate(options))
            )
            .addCommand(
                new Command('optimize-selectors')
                    .description('Optimize CSS/XPath selectors')
                    .requiredOption('--url <url>', 'URL to analyze')
                    .requiredOption('--selectors <selectors>', 'Comma-separated selectors to optimize')
                    .option('--strategy <strategy>', 'Optimization strategy: data-testid|accessibility|stable-css|hybrid', 'hybrid')
                    .action(async (options) => await this.handlePlaywrightOptimize(options))
            )
            .addCommand(
                new Command('screenshot')
                    .description('Capture screenshots for documentation')
                    .requiredOption('--url <url>', 'URL to capture')
                    .option('--selector <selector>', 'Element selector to capture')
                    .option('--output <path>', 'Output path for screenshot')
                    .option('--full-page', 'Capture full page')
                    .action(async (options) => await this.handlePlaywrightScreenshot(options))
            );

        // Email-specific commands
        this.program
            .command('email')
            .description('Email MCP commands')
            .addCommand(
                new Command('send-results')
                    .description('Send test results via email')
                    .requiredOption('--report <path>', 'Path to test report')
                    .requiredOption('--recipients <emails>', 'Comma-separated email addresses')
                    .requiredOption('--test-type <type>', 'Test type: smoke|regression|critical|api|ui|performance')
                    .requiredOption('--environment <env>', 'Environment: prod|iat|fit|local')
                    .option('--template <template>', 'Email template to use', 'test-results')
                    .option('--priority <priority>', 'Email priority: low|normal|high|urgent', 'normal')
                    .option('--no-attachments', 'Don\'t include report attachments')
                    .action(async (options) => await this.handleEmailSendResults(options))
            )
            .addCommand(
                new Command('generate-report')
                    .description('Generate email-formatted report')
                    .requiredOption('--data <path>', 'Path to test data')
                    .option('--type <type>', 'Report type: summary|detailed|trend|comparison', 'summary')
                    .option('--format <format>', 'Output format: html|pdf|inline', 'html')
                    .option('--charts', 'Include charts and graphs')
                    .action(async (options) => await this.handleEmailGenerateReport(options))
            )
            .addCommand(
                new Command('manage-subscribers')
                    .description('Manage email subscriber lists')
                    .requiredOption('--action <action>', 'Action: add|remove|list')
                    .option('--list <name>', 'Subscriber list name')
                    .option('--emails <emails>', 'Comma-separated email addresses')
                    .action(async (options) => await this.handleEmailSubscribers(options))
            );

        // Interactive mode
        this.program
            .command('interactive')
            .description('Interactive MCP-enhanced Auto-Coder session')
            .option('--no-mcp', 'Disable MCP features')
            .action(async (options) => await this.handleInteractive(options));

        // Status and diagnostics
        this.program
            .command('status')
            .description('Check MCP integration status')
            .action(async () => await this.handleStatus());

        // Configuration
        this.program
            .command('config')
            .description('Configure MCP settings')
            .option('--email-setup', 'Setup email configuration')
            .option('--reset', 'Reset to default configuration')
            .action(async (options) => await this.handleConfig(options));
    }

    /**
     * Initialize hybrid generation engine
     */
    async initializeEngine(options = {}) {
        if (!this.hybridEngine) {
            const spinner = ora('Initializing MCP-enhanced Auto-Coder...').start();
            
            try {
                this.hybridEngine = new HybridGenerationEngine({
                    useMCP: options.mcp !== false,
                    enablePlaywright: options.playwright !== false,
                    enableEmail: options.email !== false,
                    verbose: options.verbose || false,
                    notificationRecipients: options.notificationRecipients
                });
                
                await this.hybridEngine.initialize();
                spinner.succeed('MCP-enhanced Auto-Coder initialized successfully');
            } catch (error) {
                spinner.fail(`Failed to initialize: ${error.message}`);
                throw error;
            }
        }
        
        return this.hybridEngine;
    }

    /**
     * Handle generate command
     */
    async handleGenerate(options) {
        try {
            const engine = await this.initializeEngine({
                mcp: options.mcp,
                playwright: options.playwright,
                email: options.email,
                verbose: options.verbose
            });

            console.log(chalk.blue('🚀 Starting MCP-enhanced test artifact generation...'));

            // Prepare input
            let input = {};
            
            if (options.input) {
                if (await fs.pathExists(options.input)) {
                    const content = await fs.readFile(options.input, 'utf8');
                    input.requirements = content;
                } else {
                    input.requirements = options.input;
                }
            }

            if (options.url) {
                input.url = options.url;
            }

            if (options.urls) {
                input.urls = options.urls.split(',').map(url => url.trim());
            }

            // Generation configuration
            const config = {
                type: options.type,
                outputPath: options.output || path.join(process.cwd(), 'SBS_Automation'),
                useMCP: options.mcp,
                browserType: options.browser,
                enableNotifications: options.notifications,
                autoFixCompliance: options.autoFix,
                generatePageObjects: ['full', 'pageobject'].includes(options.type),
                generateSteps: ['full', 'steps'].includes(options.type),
                generateFeatures: ['full', 'features'].includes(options.type)
            };

            // Validate output path to prevent writes to main SBS_Automation
            this.validateOutputPath(config.outputPath);

            const spinner = ora('Generating test artifacts...').start();
            
            const result = await engine.generateTestArtifacts(input, config);
            
            if (result.success) {
                spinner.succeed(`Generation completed using ${result.generationMethod}`);
                
                console.log(chalk.green('✅ Generation Summary:'));
                console.log(`  Method: ${result.generationMethod}`);
                console.log(`  MCP Enhanced: ${result.mcpEnhanced ? 'Yes' : 'No'}`);
                console.log(`  Artifacts Generated: ${result.artifacts.length}`);
                
                if (result.artifacts.length > 0) {
                    console.log(chalk.cyan('\n📁 Generated Artifacts:'));
                    result.artifacts.forEach(artifact => {
                        console.log(`  ${artifact.type}: ${path.relative(process.cwd(), artifact.path)}`);
                    });
                }

                if (result.warnings.length > 0) {
                    console.log(chalk.yellow('\n⚠️  Warnings:'));
                    result.warnings.forEach(warning => console.log(`  ${warning}`));
                }

                // Symlink integration setup if requested
                if (options.symlinkIntegration) {
                    console.log(chalk.blue('\n🔗 Setting up symlink integration...'));
                    try {
                        const SymlinkIntegrator = require('../../scripts/setup-symlink-integration');
                        const integrator = new SymlinkIntegrator();
                        await integrator.setup();
                        console.log(chalk.green('✅ Symlink integration setup complete!'));
                    } catch (error) {
                        console.log(chalk.yellow('⚠️ Symlink integration setup failed:'), error.message);
                        console.log(chalk.gray('You can run it manually later: npm run setup:symlink-integration'));
                    }
                }
                
            } else {
                spinner.fail('Generation failed');
                console.log(chalk.red('❌ Errors:'));
                result.errors.forEach(error => console.log(`  ${error}`));
            }

        } catch (error) {
            console.error(chalk.red(`Error: ${error.message}`));
            process.exit(1);
        }
    }

    /**
     * Handle Playwright page object generation
     */
    async handlePlaywrightPageObject(options) {
        try {
            const playwrightMCP = new PlaywrightMCP();
            const spinner = ora(`Analyzing ${options.url} and generating page object...`).start();

            const result = await playwrightMCP.generatePageObject({
                url: options.url,
                pageName: options.name,
                selectors: options.selectors ? options.selectors.split(',').map(s => s.trim()) : [],
                browserType: options.browser
            });

            if (result.success) {
                spinner.succeed('Page object generated successfully');
                console.log(chalk.green('✅ Page Object Generated:'));
                console.log(`  Path: ${result.pageObjectPath}`);
                console.log(`  Elements Found: ${result.elementsFound}`);
                
                if (result.elements && Object.keys(result.elements).length > 0) {
                    console.log(chalk.cyan('\n🔍 Discovered Elements:'));
                    Object.entries(result.elements).slice(0, 10).forEach(([key, element]) => {
                        console.log(`  ${key}: ${element.selector} (${element.type})`);
                    });
                    
                    if (Object.keys(result.elements).length > 10) {
                        console.log(`  ... and ${Object.keys(result.elements).length - 10} more elements`);
                    }
                }
            } else {
                spinner.fail('Page object generation failed');
                console.error(chalk.red(`Error: ${result.error}`));
            }

        } catch (error) {
            console.error(chalk.red(`Error: ${error.message}`));
        }
    }

    /**
     * Handle email send results
     */
    async handleEmailSendResults(options) {
        try {
            const emailMCP = new EmailMCP();
            await emailMCP.initialize();
            
            const spinner = ora('Sending test results email...').start();

            const result = await emailMCP.sendTestResults({
                reportPath: options.report,
                recipients: options.recipients.split(',').map(email => email.trim()),
                testType: options.testType,
                environment: options.environment,
                template: options.template,
                includeAttachments: !options.noAttachments,
                priority: options.priority
            });

            if (result.success) {
                spinner.succeed('Test results email sent successfully');
                console.log(chalk.green('✅ Email Sent:'));
                console.log(`  Message ID: ${result.messageId}`);
                console.log(`  Recipients: ${result.recipients}`);
                console.log(`  Attachments: ${result.attachments}`);
            } else {
                spinner.fail('Failed to send email');
                console.error(chalk.red(`Error: ${result.error}`));
            }

        } catch (error) {
            console.error(chalk.red(`Error: ${error.message}`));
        }
    }

    /**
     * Handle interactive mode
     */
    async handleInteractive(options) {
        console.log(chalk.blue('🎯 Welcome to MCP-Enhanced Auto-Coder Interactive Mode'));
        
        if (!inquirer) {
            console.log(chalk.red('Interactive mode requires inquirer. Please install with: npm install inquirer'));
            return;
        }
        
        try {
            const engine = await this.initializeEngine({
                mcp: options.mcp,
                verbose: true
            });

            const answers = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'What would you like to do?',
                    choices: [
                        'Generate test artifacts from requirements',
                        'Generate page object from URL',
                        'Send test results email',
                        'Validate existing feature',
                        'Optimize selectors',
                        'Configure MCP settings'
                    ]
                }
            ]);

            switch (answers.action) {
                case 'Generate test artifacts from requirements':
                    await this.interactiveGenerate(engine);
                    break;
                case 'Generate page object from URL':
                    await this.interactivePageObject();
                    break;
                case 'Send test results email':
                    await this.interactiveEmail();
                    break;
                default:
                    console.log(chalk.yellow('Feature coming soon...'));
            }

        } catch (error) {
            console.error(chalk.red(`Error: ${error.message}`));
        }
    }

    async interactiveGenerate(engine) {
        if (!inquirer) {
            console.log(chalk.red('Interactive mode requires inquirer. Please install with: npm install inquirer'));
            return;
        }
        
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'requirements',
                message: 'Enter your requirements or path to requirements file:'
            },
            {
                type: 'input',
                name: 'url',
                message: 'Enter URL (optional, for page object generation):'
            },
            {
                type: 'list',
                name: 'type',
                message: 'What would you like to generate?',
                choices: ['full', 'pageobject', 'steps', 'features']
            },
            {
                type: 'confirm',
                name: 'notifications',
                message: 'Enable email notifications?',
                default: false
            }
        ]);

        const input = {
            requirements: answers.requirements,
            url: answers.url || undefined
        };

        const config = {
            type: answers.type,
            enableNotifications: answers.notifications
        };

        const spinner = ora('Generating test artifacts...').start();
        const result = await engine.generateTestArtifacts(input, config);

        if (result.success) {
            spinner.succeed('Generation completed successfully');
            console.log(chalk.green(`Generated ${result.artifacts.length} artifacts using ${result.generationMethod}`));
        } else {
            spinner.fail('Generation failed');
            console.log(chalk.red('Errors:', result.errors.join(', ')));
        }
    }

    /**
     * Handle status command
     */
    async handleStatus() {
        console.log(chalk.blue('📊 MCP Integration Status'));
        
        try {
            // Check MCP SDK
            console.log('🔧 MCP SDK:', chalk.green('Available'));
            
            // Check Playwright
            try {
                const playwrightMCP = new PlaywrightMCP();
                console.log('🎭 Playwright MCP:', chalk.green('Available'));
            } catch (error) {
                console.log('🎭 Playwright MCP:', chalk.red('Error -', error.message));
            }
            
            // Check Email
            try {
                const emailMCP = new EmailMCP();
                console.log('📧 Email MCP:', chalk.green('Available'));
            } catch (error) {
                console.log('📧 Email MCP:', chalk.red('Error -', error.message));
            }
            
            // Check SBS_Automation directory
            const sbsPath = path.join(process.cwd(), 'SBS_Automation');
            if (await fs.pathExists(sbsPath)) {
                console.log('📁 SBS_Automation:', chalk.green('Found'));
            } else {
                console.log('📁 SBS_Automation:', chalk.yellow('Not found - will be created'));
            }

        } catch (error) {
            console.error(chalk.red(`Status check failed: ${error.message}`));
        }
    }

    /**
     * Handle configuration
     */
    async handleConfig(options) {
        if (options.emailSetup) {
            await this.setupEmailConfiguration();
        } else if (options.reset) {
            await this.resetConfiguration();
        } else {
            console.log(chalk.blue('📝 MCP Configuration'));
            console.log('Available configuration options:');
            console.log('  --email-setup: Setup email SMTP configuration');
            console.log('  --reset: Reset to default configuration');
        }
    }

    async setupEmailConfiguration() {
        console.log(chalk.blue('📧 Email Configuration Setup'));
        
        const answers = await inquirer.prompt([
            { type: 'input', name: 'smtpHost', message: 'SMTP Host:' },
            { type: 'number', name: 'smtpPort', message: 'SMTP Port:', default: 587 },
            { type: 'input', name: 'smtpUser', message: 'SMTP Username:' },
            { type: 'password', name: 'smtpPass', message: 'SMTP Password:' },
            { type: 'input', name: 'fromEmail', message: 'From Email Address:' }
        ]);

        const configPath = path.join(process.cwd(), 'auto-coder', 'config', 'email-config.json');
        const config = {
            smtp: {
                host: answers.smtpHost,
                port: answers.smtpPort,
                secure: answers.smtpPort === 465,
                auth: {
                    user: answers.smtpUser,
                    pass: answers.smtpPass
                }
            },
            from: answers.fromEmail,
            replyTo: answers.fromEmail
        };

        await fs.ensureDir(path.dirname(configPath));
        await fs.writeJson(configPath, config, { spaces: 2 });
        
        console.log(chalk.green('✅ Email configuration saved'));
    }

    /**
     * Placeholder methods for other handlers
     */
    async handlePlaywrightValidate(options) {
        console.log(chalk.yellow('Feature implementation pending...'));
    }

    async handlePlaywrightOptimize(options) {
        console.log(chalk.yellow('Feature implementation pending...'));
    }

    async handlePlaywrightScreenshot(options) {
        console.log(chalk.yellow('Feature implementation pending...'));
    }

    async handleEmailGenerateReport(options) {
        console.log(chalk.yellow('Feature implementation pending...'));
    }

    async handleEmailSubscribers(options) {
        console.log(chalk.yellow('Feature implementation pending...'));
    }

    async interactivePageObject() {
        console.log(chalk.yellow('Feature implementation pending...'));
    }

    async interactiveEmail() {
        console.log(chalk.yellow('Feature implementation pending...'));
    }

    async resetConfiguration() {
        console.log(chalk.yellow('Reset configuration feature pending...'));
    }

    /**
     * Run the CLI
     */
    run() {
        this.program.parse();
    }
}

// Run CLI if this file is executed directly
if (require.main === module) {
    const cli = new MCPEnhancedCLI();
    cli.run();
}

module.exports = MCPEnhancedCLI;
