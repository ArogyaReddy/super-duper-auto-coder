#!/usr/bin/env node

/**
 * 🔍 User Configuration Validator
 * 
 * Validates the test-users-config.json file and provides detailed feedback
 * about configuration issues and setup requirements.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class ConfigValidator {
    constructor() {
        this.configPath = path.join(__dirname, '../config/test-users-config.json');
        this.errors = [];
        this.warnings = [];
        this.info = [];
    }

    async validateConfiguration() {
        console.log(chalk.blue.bold('🔍 USER CONFIGURATION VALIDATOR'));
        console.log(chalk.blue.bold('================================'));
        console.log('');

        // Step 1: File existence
        this.validateFileExists();

        // Step 2: JSON syntax
        let config;
        try {
            config = this.validateJSONSyntax();
        } catch (error) {
            this.displayResults();
            return false;
        }

        // Step 3: Required sections
        this.validateRequiredSections(config);

        // Step 4: Environment configuration
        this.validateEnvironmentConfig(config);

        // Step 5: User roles configuration
        this.validateUserRoles(config);

        // Step 6: Test scenarios
        this.validateTestScenarios(config);

        // Display results
        this.displayResults();

        return this.errors.length === 0;
    }

    validateFileExists() {
        if (!fs.existsSync(this.configPath)) {
            this.errors.push(`Configuration file not found: ${this.configPath}`);
            this.info.push('Create the file using the template in docs/USER-CONFIGURATION-GUIDE.md');
        } else {
            this.info.push(`✅ Configuration file found: ${this.configPath}`);
        }
    }

    validateJSONSyntax() {
        try {
            const configData = fs.readFileSync(this.configPath, 'utf8');
            const config = JSON.parse(configData);
            this.info.push('✅ JSON syntax is valid');
            return config;
        } catch (error) {
            this.errors.push(`Invalid JSON syntax: ${error.message}`);
            throw error;
        }
    }

    validateRequiredSections(config) {
        const requiredSections = ['testEnvironment', 'userRoles', 'testScenarios', 'browserSettings'];
        
        for (const section of requiredSections) {
            if (!config[section]) {
                this.errors.push(`Missing required section: ${section}`);
            } else {
                this.info.push(`✅ Section present: ${section}`);
            }
        }
    }

    validateEnvironmentConfig(config) {
        if (!config.testEnvironment) return;

        const env = config.testEnvironment;
        const required = ['baseUrl', 'environment', 'clientIID'];

        for (const field of required) {
            if (!env[field]) {
                this.errors.push(`Missing testEnvironment.${field}`);
            } else {
                this.info.push(`✅ testEnvironment.${field}: ${env[field]}`);
            }
        }

        // Validate baseUrl format
        if (env.baseUrl && !env.baseUrl.includes('online-iat.adp.com')) {
            this.warnings.push('baseUrl does not appear to be an ADP IAT environment URL');
        }

        // Validate clientIID format
        if (env.clientIID && !/^\d+$/.test(env.clientIID)) {
            this.warnings.push('clientIID should be numeric');
        }
    }

    validateUserRoles(config) {
        if (!config.userRoles) return;

        const roles = config.userRoles;
        const roleNames = Object.keys(roles);

        if (roleNames.length === 0) {
            this.errors.push('No user roles configured');
            return;
        }

        this.info.push(`✅ Found ${roleNames.length} configured roles: ${roleNames.join(', ')}`);

        // Validate each role
        for (const [roleName, roleConfig] of Object.entries(roles)) {
            this.validateSingleRole(roleName, roleConfig, config.testEnvironment?.clientIID);
        }
    }

    validateSingleRole(roleName, roleConfig, clientIID) {
        const required = ['role', 'username', 'password', 'description'];

        for (const field of required) {
            if (!roleConfig[field]) {
                this.errors.push(`Role ${roleName}: Missing ${field}`);
            }
        }

        // Validate username format
        if (roleConfig.username) {
            if (clientIID && !roleConfig.username.includes(`@${clientIID}`)) {
                this.warnings.push(`Role ${roleName}: Username should include @${clientIID}`);
            }
            this.info.push(`✅ Role ${roleName}: Username format appears correct`);
        }

        // Validate password
        if (roleConfig.password) {
            if (roleConfig.password.length < 6) {
                this.warnings.push(`Role ${roleName}: Password seems too short`);
            }
            this.info.push(`✅ Role ${roleName}: Password configured`);
        }

        // Validate role number
        if (roleConfig.role && !/^\d+$/.test(roleConfig.role)) {
            this.warnings.push(`Role ${roleName}: Role ID should be numeric`);
        }
    }

    validateTestScenarios(config) {
        if (!config.testScenarios) return;

        const scenarios = config.testScenarios;
        const scenarioNames = Object.keys(scenarios);

        this.info.push(`✅ Found ${scenarioNames.length} test scenarios: ${scenarioNames.join(', ')}`);

        // Check if broken-links scenario exists (required for utilities)
        if (!scenarios['broken-links']) {
            this.warnings.push('broken-links scenario not configured - some utilities may not work');
        }
    }

    displayResults() {
        console.log('');
        console.log(chalk.blue.bold('📊 VALIDATION RESULTS'));
        console.log(chalk.blue.bold('==================='));
        console.log('');

        // Display errors
        if (this.errors.length > 0) {
            console.log(chalk.red.bold('❌ ERRORS:'));
            this.errors.forEach(error => {
                console.log(chalk.red(`  • ${error}`));
            });
            console.log('');
        }

        // Display warnings
        if (this.warnings.length > 0) {
            console.log(chalk.yellow.bold('⚠️  WARNINGS:'));
            this.warnings.forEach(warning => {
                console.log(chalk.yellow(`  • ${warning}`));
            });
            console.log('');
        }

        // Display info
        if (this.info.length > 0) {
            console.log(chalk.green.bold('ℹ️  INFORMATION:'));
            this.info.forEach(info => {
                console.log(chalk.green(`  • ${info}`));
            });
            console.log('');
        }

        // Summary
        if (this.errors.length === 0) {
            console.log(chalk.green.bold('🎉 CONFIGURATION IS VALID!'));
            console.log(chalk.green('Your role-based testing setup is ready to use.'));
            console.log('');
            console.log(chalk.cyan('Next steps:'));
            console.log(chalk.cyan('1. Run the CLI: node bin/interactive-cli.js'));
            console.log(chalk.cyan('2. Go to Utilities & Tools (option 6)'));
            console.log(chalk.cyan('3. Test broken link checker with role authentication'));
        } else {
            console.log(chalk.red.bold('❌ CONFIGURATION HAS ERRORS!'));
            console.log(chalk.red('Please fix the errors above before using role-based testing.'));
            console.log('');
            console.log(chalk.cyan('For help, see: docs/USER-CONFIGURATION-GUIDE.md'));
        }
        console.log('');
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new ConfigValidator();
    validator.validateConfiguration().then(isValid => {
        process.exit(isValid ? 0 : 1);
    });
}

module.exports = ConfigValidator;
