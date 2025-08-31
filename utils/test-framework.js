#!/usr/bin/env node

const RoleBasedBrokenLinksTest = require('./role-based-broken-links-test');
const UserConfigManager = require('./user-config-manager');

class TestingCLI {
    constructor() {
        this.configManager = new UserConfigManager();
        this.roleBasedTest = new RoleBasedBrokenLinksTest();
    }

    displayHelp() {
        console.log('🚀 ADP ROLE-BASED TESTING FRAMEWORK');
        console.log('===================================');
        console.log('');
        console.log('📋 USAGE:');
        console.log('=========');
        console.log('node test-framework.js --help                           # Show this help');
        console.log('node test-framework.js --list-roles                     # List available roles');
        console.log('node test-framework.js --list-scenarios                 # List test scenarios');
        console.log('node test-framework.js --test-role Owner                # Test specific role');
        console.log('node test-framework.js --test-roles Owner PayrollAdmin  # Test multiple roles');
        console.log('node test-framework.js --test-all-roles                 # Test all supported roles');
        console.log('node test-framework.js --test-scenario broken-links     # Test specific scenario');
        console.log('');
        console.log('🎯 EXAMPLES:');
        console.log('============');
        console.log('# Test broken links for Owner role only');
        console.log('node test-framework.js --test-role Owner');
        console.log('');
        console.log('# Test multiple specific roles');
        console.log('node test-framework.js --test-roles Owner PayrollAdmin HRAdmin');
        console.log('');
        console.log('# Test all roles that support broken-links scenario');
        console.log('node test-framework.js --test-scenario broken-links');
        console.log('');
        console.log('# Test all supported roles');
        console.log('node test-framework.js --test-all-roles');
        console.log('');
        console.log('🔧 CONFIGURATION:');
        console.log('=================');
        console.log('• User credentials: config/test-users-config.json');
        console.log('• Add new roles by editing the JSON configuration');
        console.log('• Each role has specific permissions and test scenarios');
        console.log('');
    }

    displayRoles() {
        console.log('👥 AVAILABLE ROLES FOR TESTING');
        console.log('==============================');
        
        const roles = this.configManager.listAllRoles();
        roles.forEach((role, index) => {
            console.log(`${index + 1}. ${role.roleName} (Role ${role.roleNumber})`);
            console.log(`   📝 ${role.description}`);
            console.log(`   🔑 Permissions: ${role.permissions.join(', ')}`);
            console.log(`   🧪 Scenarios: ${role.testScenarios.join(', ')}`);
            console.log('');
        });

        console.log('💡 USAGE EXAMPLES:');
        console.log('==================');
        console.log('node test-framework.js --test-role Owner');
        console.log('node test-framework.js --test-role PayrollAdmin');
        console.log('node test-framework.js --test-roles Owner PayrollAdmin');
    }

    displayScenarios() {
        console.log('🧪 AVAILABLE TEST SCENARIOS');
        console.log('===========================');
        
        const scenarios = this.configManager.config.testScenarios;
        Object.entries(scenarios).forEach(([scenarioName, scenarioData], index) => {
            console.log(`${index + 1}. ${scenarioName}`);
            console.log(`   📝 ${scenarioData.description}`);
            console.log(`   👥 Supported Roles: ${scenarioData.supportedRoles.join(', ')}`);
            console.log(`   🕐 Timeout: ${scenarioData.timeout / 1000}s`);
            console.log(`   🔧 Type: ${scenarioData.testType}`);
            console.log('');
        });

        console.log('💡 USAGE EXAMPLES:');
        console.log('==================');
        console.log('node test-framework.js --test-scenario broken-links');
        console.log('node test-framework.js --test-scenario payroll-tests');
    }

    async executeTest(args) {
        try {
            if (args.includes('--help') || args.length === 0) {
                this.displayHelp();
                return;
            }

            if (args.includes('--list-roles')) {
                this.displayRoles();
                return;
            }

            if (args.includes('--list-scenarios')) {
                this.displayScenarios();
                return;
            }

            if (args.includes('--test-all-roles')) {
                console.log('🚀 TESTING ALL SUPPORTED ROLES');
                console.log('==============================');
                await this.roleBasedTest.testAllSupportedRoles();
                return;
            }

            if (args.includes('--test-role')) {
                const roleIndex = args.indexOf('--test-role');
                const roleName = args[roleIndex + 1];
                
                if (!roleName) {
                    console.error('❌ Error: Please specify a role name');
                    console.log('Example: node test-framework.js --test-role Owner');
                    return;
                }

                console.log(`🚀 TESTING SINGLE ROLE: ${roleName}`);
                console.log('='.repeat(50));
                await this.roleBasedTest.testBrokenLinksForRole(roleName);
                return;
            }

            if (args.includes('--test-roles')) {
                const rolesIndex = args.indexOf('--test-roles');
                const roles = args.slice(rolesIndex + 1);
                
                if (roles.length === 0) {
                    console.error('❌ Error: Please specify role names');
                    console.log('Example: node test-framework.js --test-roles Owner PayrollAdmin');
                    return;
                }

                console.log(`🚀 TESTING MULTIPLE ROLES: ${roles.join(', ')}`);
                console.log('='.repeat(50));
                await this.roleBasedTest.testBrokenLinksForMultipleRoles(roles);
                return;
            }

            if (args.includes('--test-scenario')) {
                const scenarioIndex = args.indexOf('--test-scenario');
                const scenarioName = args[scenarioIndex + 1];
                
                if (!scenarioName) {
                    console.error('❌ Error: Please specify a scenario name');
                    console.log('Example: node test-framework.js --test-scenario broken-links');
                    return;
                }

                console.log(`🚀 TESTING SCENARIO: ${scenarioName}`);
                console.log('='.repeat(50));
                
                // Get users for this scenario
                const users = this.configManager.getUsersForScenario(scenarioName);
                const roleNames = users.map(user => user.roleName);
                
                if (roleNames.length === 0) {
                    console.error(`❌ No roles support scenario '${scenarioName}'`);
                    return;
                }

                console.log(`📋 Found ${roleNames.length} roles supporting '${scenarioName}': ${roleNames.join(', ')}`);
                await this.roleBasedTest.testBrokenLinksForMultipleRoles(roleNames);
                return;
            }

            // Unknown command
            console.error('❌ Unknown command. Use --help for usage information.');
            
        } catch (error) {
            console.error(`💥 Test execution failed: ${error.message}`);
            process.exit(1);
        }
    }
}

// Main execution
async function main() {
    const cli = new TestingCLI();
    const args = process.argv.slice(2);
    await cli.executeTest(args);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = TestingCLI;
