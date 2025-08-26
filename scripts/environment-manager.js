#!/usr/bin/env node

/**
 * Environment Configuration Manager
 * Switch between environments (fit/iat/dev) seamlessly like SBS_Automation
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class EnvironmentManager {
    constructor() {
        this.sbsPath = path.join(process.cwd(), 'SBS_Automation');
        this.configPath = path.join(this.sbsPath, 'web.config.json');
        this.availableEnvironments = ['fit', 'iat', 'dev', 'prod'];
    }

    async switchEnvironment(targetEnv, options = {}) {
        const { verbose = false } = options;
        
        console.log(chalk.blue.bold('🔄 Environment Configuration Manager'));
        console.log(chalk.gray(`Switching to: ${targetEnv}\n`));

        try {
            // Validate environment
            if (!this.availableEnvironments.includes(targetEnv)) {
                throw new Error(`Invalid environment: ${targetEnv}. Available: ${this.availableEnvironments.join(', ')}`);
            }

            // Load current config
            const config = await this.loadConfig();
            const oldEnv = config.environment;

            // Update config
            config.environment = targetEnv;
            await this.saveConfig(config);

            // Validate data files exist
            await this.validateEnvironmentData(targetEnv);

            console.log(chalk.green(`✅ Environment switched: ${oldEnv} → ${targetEnv}`));
            
            if (verbose) {
                await this.showEnvironmentInfo(targetEnv);
            }

        } catch (error) {
            console.error(chalk.red('❌ Environment switch failed:'), error.message);
            process.exit(1);
        }
    }

    async loadConfig() {
        if (!await fs.pathExists(this.configPath)) {
            // Create default config if it doesn't exist
            const defaultConfig = {
                environment: "fit",
                steps: "./steps",
                pageObjects: "./pages",
                data: "./data",
                featureFiles: "./features",
                reports: "./reports",
                browser: "chrome",
                timeout: 180000,
                headless: false,
                world: "./support/world.js",
                hooks: "./support/hooks.js",
                format: ["rerun:@rerun.txt"]
            };
            await this.saveConfig(defaultConfig);
            return defaultConfig;
        }
        
        return JSON.parse(await fs.readFile(this.configPath, 'utf8'));
    }

    async saveConfig(config) {
        await fs.ensureDir(path.dirname(this.configPath));
        await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
    }

    async validateEnvironmentData(environment) {
        const dataPath = path.join(this.sbsPath, 'data', environment);
        const testDataPath = path.join(dataPath, 'test-data.json');

        if (!await fs.pathExists(dataPath)) {
            console.log(chalk.yellow(`⚠️ Creating data directory for ${environment}...`));
            await fs.ensureDir(dataPath);
        }

        if (!await fs.pathExists(testDataPath)) {
            console.log(chalk.yellow(`⚠️ Creating test data for ${environment}...`));
            await this.createDefaultTestData(environment, testDataPath);
        }
    }

    async createDefaultTestData(environment, testDataPath) {
        const envSuffix = environment === 'fit' ? '' : `-${environment}`;
        
        const defaultData = {
            environment: environment,
            baseUrl: `https://runmod${envSuffix}.es.ad.adp.com`,
            apiUrl: `https://api${envSuffix}.es.ad.adp.com`,
            timeouts: {
                implicit: 10000,
                explicit: 30000,
                page: 60000
            },
            users: {
                admin: {
                    username: `admin@autocoder${envSuffix}.com`,
                    password: "AutoCoder123!",
                    role: "Administrator"
                },
                user: {
                    username: `user@autocoder${envSuffix}.com`,
                    password: "AutoCoder123!",
                    role: "User"
                }
            },
            testData: {
                company: `AutoCoder ${environment.toUpperCase()} Company`,
                department: "QA Automation",
                validSSN: environment === 'fit' ? "123-45-6789" : "987-65-4321",
                validEmail: `test@autocoder${envSuffix}.com`
            }
        };

        await fs.writeFile(testDataPath, JSON.stringify(defaultData, null, 2));
    }

    async showEnvironmentInfo(environment) {
        const dataPath = path.join(this.sbsPath, 'data', environment, 'test-data.json');
        
        if (await fs.pathExists(dataPath)) {
            const testData = JSON.parse(await fs.readFile(dataPath, 'utf8'));
            
            console.log(chalk.cyan('\n📊 Environment Information:'));
            console.log(chalk.gray(`   Base URL: ${testData.baseUrl}`));
            console.log(chalk.gray(`   API URL: ${testData.apiUrl}`));
            console.log(chalk.gray(`   Test Users: ${Object.keys(testData.users).join(', ')}`));
            console.log(chalk.gray(`   Company: ${testData.testData.company}`));
        }
    }

    async listEnvironments() {
        console.log(chalk.blue.bold('📋 Available Environments'));
        
        const config = await this.loadConfig();
        const currentEnv = config.environment;
        
        for (const env of this.availableEnvironments) {
            const dataPath = path.join(this.sbsPath, 'data', env);
            const hasData = await fs.pathExists(dataPath);
            const isCurrent = env === currentEnv;
            
            const status = isCurrent ? chalk.green('● CURRENT') : hasData ? chalk.blue('○ Available') : chalk.gray('○ Not configured');
            
            console.log(`   ${env.padEnd(8)} ${status}`);
            
            if (hasData) {
                const testDataPath = path.join(dataPath, 'test-data.json');
                if (await fs.pathExists(testDataPath)) {
                    const testData = JSON.parse(await fs.readFile(testDataPath, 'utf8'));
                    console.log(chalk.gray(`            ${testData.baseUrl}`));
                }
            }
        }
        
        console.log(chalk.cyan('\n🔄 To switch environment:'));
        console.log(chalk.gray('   npm run env:switch fit'));
        console.log(chalk.gray('   npm run env:switch iat'));
        console.log(chalk.gray('   npm run env:switch dev'));
    }

    async getCurrentEnvironment() {
        const config = await this.loadConfig();
        return config.environment;
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const environment = args[1];
    const verbose = args.includes('--verbose') || args.includes('-v');
    const help = args.includes('--help') || args.includes('-h');
    
    if (help || !command) {
        console.log(chalk.blue.bold('🔄 Environment Configuration Manager'));
        console.log('Switch between environments seamlessly like SBS_Automation\n');
        console.log(chalk.cyan('Usage:'));
        console.log('  node scripts/environment-manager.js <command> [environment] [options]\n');
        console.log(chalk.cyan('Commands:'));
        console.log('  switch <env>    Switch to specified environment (fit/iat/dev/prod)');
        console.log('  list            List all available environments');
        console.log('  current         Show current environment\n');
        console.log(chalk.cyan('Options:'));
        console.log('  --verbose       Show detailed environment information');
        console.log('  --help          Show this help message\n');
        console.log(chalk.cyan('Examples:'));
        console.log('  npm run env:switch fit');
        console.log('  npm run env:list');
        console.log('  npm run env:current');
        return;
    }
    
    const manager = new EnvironmentManager();
    
    switch (command) {
        case 'switch':
            if (!environment) {
                console.error(chalk.red('❌ Environment required for switch command'));
                process.exit(1);
            }
            await manager.switchEnvironment(environment, { verbose });
            break;
            
        case 'list':
            await manager.listEnvironments();
            break;
            
        case 'current':
            const currentEnv = await manager.getCurrentEnvironment();
            console.log(chalk.green(`Current environment: ${currentEnv}`));
            break;
            
        default:
            console.error(chalk.red(`❌ Unknown command: ${command}`));
            process.exit(1);
    }
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
    console.error(chalk.red('❌ Unhandled error:'), error);
    process.exit(1);
});

// Run if called directly
if (require.main === module) {
    main().catch((error) => {
        console.error(chalk.red('❌ Error:'), error.message);
        process.exit(1);
    });
}

module.exports = EnvironmentManager;
