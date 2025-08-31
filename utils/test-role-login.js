#!/usr/bin/env node

/**
 * 🧪 Role Login Tester
 * 
 * Tests login functionality for specific roles to validate configuration
 */

const { UltraFreshSmartLogin } = require('./ultra-fresh-smart-login');
const UserConfigManager = require('./user-config-manager');
const chalk = require('chalk');

class RoleLoginTester {
    constructor() {
        this.configManager = new UserConfigManager();
        this.ultraLogin = new UltraFreshSmartLogin();
    }

    async testRoleLogin(roleName) {
        console.log(chalk.blue.bold('🧪 ROLE LOGIN TESTER'));
        console.log(chalk.blue.bold('==================='));
        console.log(`🎯 Testing login for role: ${chalk.cyan(roleName)}`);
        console.log('');

        try {
            // Get user configuration
            const user = this.configManager.getUserByRole(roleName);
            
            console.log('👤 USER CONFIGURATION:');
            console.log('======================');
            console.log(`📝 Description: ${user.description}`);
            console.log(`🔢 Role Number: ${user.role}`);
            console.log(`👤 Username: ${user.username}`);
            console.log(`🔑 Password: ${'*'.repeat(user.password.length)}`);
            console.log(`🌐 Environment: ${user.environment}`);
            console.log('');

            // Attempt login
            console.log('🚀 STARTING LOGIN TEST...');
            console.log('========================');

            const loginResult = await this.ultraLogin.performUltraFreshLogin(
                user.baseUrl,
                user.username,
                user.password
            );

            console.log('');
            console.log('📊 LOGIN TEST RESULTS:');
            console.log('======================');

            if (loginResult.success) {
                console.log(chalk.green.bold('✅ LOGIN SUCCESSFUL!'));
                console.log(chalk.green(`🎯 Successfully logged in as: ${user.description}`));
                console.log(chalk.green(`🌐 Current URL: ${loginResult.finalUrl || 'Dashboard'}`));
                console.log(chalk.green(`⏱️  Login Time: ${loginResult.loginTime || 'N/A'}ms`));
                
                // Get current page info if available
                if (this.ultraLogin.getPage) {
                    try {
                        const page = this.ultraLogin.getPage();
                        const title = await page.title();
                        console.log(chalk.green(`📄 Page Title: ${title}`));
                    } catch (e) {
                        // Ignore page info errors
                    }
                }
            } else {
                console.log(chalk.red.bold('❌ LOGIN FAILED!'));
                console.log(chalk.red(`💥 Issue: ${loginResult.issue || 'Unknown'}`));
                console.log(chalk.red(`📝 Message: ${loginResult.message || 'No details available'}`));
                console.log(chalk.red(`🌐 Final URL: ${loginResult.finalUrl || 'N/A'}`));
            }

            console.log('');
            console.log('🔍 DIAGNOSTIC INFO:');
            console.log('==================');
            console.log(`📊 Result Object: ${JSON.stringify(loginResult, null, 2)}`);

            // Cleanup
            if (this.ultraLogin.cleanup) {
                await this.ultraLogin.cleanup();
                console.log('🧹 Cleanup completed');
            }

            return loginResult;

        } catch (error) {
            console.log('');
            console.log(chalk.red.bold('💥 LOGIN TEST ERROR!'));
            console.log(chalk.red.bold('==================='));
            console.log(chalk.red(`Error: ${error.message}`));
            console.log(chalk.red(`Stack: ${error.stack}`));
            
            return {
                success: false,
                error: error.message,
                stack: error.stack
            };
        }
    }

    async testAllRoles() {
        console.log(chalk.blue.bold('🧪 ALL ROLES LOGIN TESTER'));
        console.log(chalk.blue.bold('========================='));
        console.log('');

        const allRoles = this.configManager.getAllRoleNames();
        console.log(`🎯 Testing ${allRoles.length} roles: ${allRoles.join(', ')}`);
        console.log('');

        const results = [];

        for (let i = 0; i < allRoles.length; i++) {
            const roleName = allRoles[i];
            console.log(`🔄 Testing role ${i + 1}/${allRoles.length}: ${roleName}`);
            console.log('='.repeat(60));

            const result = await this.testRoleLogin(roleName);
            results.push({
                role: roleName,
                ...result
            });

            // Wait between tests
            if (i < allRoles.length - 1) {
                console.log('⏳ Waiting 3 seconds before next test...');
                await new Promise(resolve => setTimeout(resolve, 3000));
                console.log('');
            }
        }

        // Summary
        console.log('');
        console.log(chalk.blue.bold('📊 SUMMARY REPORT'));
        console.log(chalk.blue.bold('================'));

        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);

        console.log(`✅ Successful logins: ${successful.length}/${results.length}`);
        console.log(`❌ Failed logins: ${failed.length}/${results.length}`);
        console.log('');

        if (successful.length > 0) {
            console.log(chalk.green('✅ SUCCESSFUL ROLES:'));
            successful.forEach(r => {
                console.log(chalk.green(`  • ${r.role}`));
            });
            console.log('');
        }

        if (failed.length > 0) {
            console.log(chalk.red('❌ FAILED ROLES:'));
            failed.forEach(r => {
                console.log(chalk.red(`  • ${r.role}: ${r.issue || r.error || 'Unknown error'}`));
            });
            console.log('');
        }

        return results;
    }
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);
    const tester = new RoleLoginTester();

    try {
        if (args.includes('--role')) {
            const roleIndex = args.indexOf('--role');
            const roleName = args[roleIndex + 1];
            
            if (!roleName) {
                console.log(chalk.red('❌ Please specify a role name: --role RoleName'));
                process.exit(1);
            }

            await tester.testRoleLogin(roleName);
        } else if (args.includes('--all')) {
            await tester.testAllRoles();
        } else {
            console.log(chalk.cyan('🧪 Role Login Tester'));
            console.log(chalk.cyan('=================='));
            console.log('');
            console.log('Usage:');
            console.log('  node utils/test-role-login.js --role Owner');
            console.log('  node utils/test-role-login.js --all');
            console.log('');
            console.log('Available roles:');
            const roleNames = tester.configManager.getAllRoleNames();
            roleNames.forEach(role => {
                console.log(`  • ${role}`);
            });
        }
    } catch (error) {
        console.log(chalk.red.bold('💥 FATAL ERROR!'));
        console.log(chalk.red(error.message));
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = RoleLoginTester;
