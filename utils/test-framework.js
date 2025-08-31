#!/usr/bin/env node

const RoleBasedBrokenLinksTest = require('./role-based-broken-links-test');
const UserConfigManager = require('./user-config-manager');
const EnhancedRoleTesting = require('./enhanced-role-testing');

class TestingCLI {
    constructor() {
        this.configManager = new UserConfigManager();
        this.roleBasedTest = new RoleBasedBrokenLinksTest();
        this.enhancedTesting = new EnhancedRoleTesting();
    }

    displayHelp() {
        console.log('🚀 ADP ROLE-BASED TESTING FRAMEWORK');
        console.log('===================================');
        console.log('');
        console.log('📋 BASIC USAGE:');
        console.log('===============');
        console.log('node test-framework.js --help                           # Show this help');
        console.log('node test-framework.js --list-roles                     # List available roles');
        console.log('node test-framework.js --list-scenarios                 # List test scenarios');
        console.log('node test-framework.js --role Owner                     # Test specific role');
        console.log('node test-framework.js --multi-role Owner,PayrollAdmin  # Test multiple roles');
        console.log('node test-framework.js --scenario broken-links          # Test specific scenario');
        console.log('node test-framework.js --validate-config                # Validate configuration');
        console.log('');
        console.log('🔬 ADVANCED FEATURES:');
        console.log('=====================');
        console.log('node test-framework.js --compare-roles Owner,PayrollAdmin           # Compare role behaviors');
        console.log('node test-framework.js --permission-matrix                          # Test permission matrix');
        console.log('node test-framework.js --performance-test Owner,PayrollAdmin        # Performance testing');
        console.log('node test-framework.js --discover-capabilities Owner               # Discover role capabilities');
        console.log('');
        console.log('🎯 EXAMPLES:');
        console.log('============');
        console.log('# Basic single role test');
        console.log('node test-framework.js --role Owner --scenario broken-links');
        console.log('');
        console.log('# Multi-role comparison');
        console.log('node test-framework.js --compare-roles Owner,PayrollAdmin,HRAdmin');
        console.log('');
        console.log('# Permission matrix for all roles');
        console.log('node test-framework.js --permission-matrix');
        console.log('');
        console.log('# Performance benchmark');
        console.log('node test-framework.js --performance-test Owner,PayrollAdmin --iterations 5');
        console.log('');
        console.log('🔧 CONFIGURATION:');
        console.log('=================');
        console.log('• User credentials: config/test-users-config.json');
        console.log('• Add new roles by editing the JSON configuration');
        console.log('• Each role has specific permissions and test scenarios');
        console.log('• Reports generated in: reports/role-based/');
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

            if (args.includes('--validate-config')) {
                console.log('� VALIDATING CONFIGURATION');
                console.log('===========================');
                await this.validateConfiguration();
                return;
            }

            // Enhanced Features
            if (args.includes('--compare-roles')) {
                const rolesArg = args.find(arg => arg.includes('--compare-roles'));
                let roles;
                
                if (rolesArg && rolesArg.includes('=')) {
                    roles = rolesArg.split('=')[1].split(',');
                } else {
                    // Look for roles after the flag
                    const roleIndex = args.indexOf('--compare-roles');
                    const nextArg = args[roleIndex + 1];
                    if (nextArg && !nextArg.startsWith('--')) {
                        roles = nextArg.split(',');
                    } else {
                        roles = ['Owner', 'PayrollAdmin']; // Default roles
                    }
                }
                
                const scenarioArg = args.find(arg => arg.startsWith('--scenario='));
                const scenario = scenarioArg ? scenarioArg.split('=')[1] : 'broken-links';
                
                await this.enhancedTesting.compareRoles(roles, scenario);
                return;
            }

            if (args.includes('--permission-matrix')) {
                const rolesArg = args.find(arg => arg.startsWith('--roles='));
                const roles = rolesArg ? rolesArg.split('=')[1].split(',') : null;
                
                await this.enhancedTesting.testPermissionMatrix(roles);
                return;
            }

            if (args.includes('--performance-test')) {
                const rolesArg = args.find(arg => arg.startsWith('--roles=')) || 
                               args.find(arg => arg.includes('--performance-test'));
                
                let roles;
                if (rolesArg && rolesArg.includes('=')) {
                    roles = rolesArg.split('=')[1].split(',');
                } else {
                    const perfIndex = args.indexOf('--performance-test');
                    const nextArg = args[perfIndex + 1];
                    if (nextArg && !nextArg.startsWith('--')) {
                        roles = nextArg.split(',');
                    } else {
                        roles = ['Owner', 'PayrollAdmin'];
                    }
                }
                
                const iterationsArg = args.find(arg => arg.startsWith('--iterations='));
                const iterations = iterationsArg ? parseInt(iterationsArg.split('=')[1]) : 3;
                
                await this.enhancedTesting.performanceTest(roles, iterations);
                return;
            }

            if (args.includes('--discover-capabilities')) {
                const roleArg = args.find(arg => arg.startsWith('--role='));
                const role = roleArg ? roleArg.split('=')[1] : 
                           (args[args.indexOf('--discover-capabilities') + 1] || 'Owner');
                
                await this.enhancedTesting.discoverRoleCapabilities(role);
                return;
            }

            // Basic Features (updated syntax)
            if (args.includes('--role')) {
                const roleArg = args.find(arg => arg.startsWith('--role='));
                const roleName = roleArg ? roleArg.split('=')[1] : 
                               args[args.indexOf('--role') + 1];
                
                if (!roleName) {
                    console.error('❌ Error: Please specify a role name');
                    console.log('Example: node test-framework.js --role=Owner');
                    return;
                }

                const scenarioArg = args.find(arg => arg.startsWith('--scenario='));
                const scenario = scenarioArg ? scenarioArg.split('=')[1] : 'broken-links';

                console.log(`🚀 TESTING SINGLE ROLE: ${roleName} (${scenario})`);
                console.log('='.repeat(50));
                await this.roleBasedTest.testBrokenLinksForRole(roleName, { scenario });
                return;
            }

            if (args.includes('--multi-role')) {
                const rolesArg = args.find(arg => arg.startsWith('--multi-role='));
                const roles = rolesArg ? rolesArg.split('=')[1].split(',') :
                             args[args.indexOf('--multi-role') + 1]?.split(',');
                
                if (!roles || roles.length === 0) {
                    console.error('❌ Error: Please specify role names');
                    console.log('Example: node test-framework.js --multi-role=Owner,PayrollAdmin');
                    return;
                }

                console.log(`🚀 TESTING MULTIPLE ROLES: ${roles.join(', ')}`);
                console.log('='.repeat(50));
                await this.roleBasedTest.testBrokenLinksForMultipleRoles(roles);
                return;
            }

            if (args.includes('--scenario')) {
                const scenarioArg = args.find(arg => arg.startsWith('--scenario='));
                const scenarioName = scenarioArg ? scenarioArg.split('=')[1] :
                                   args[args.indexOf('--scenario') + 1];
                
                if (!scenarioName) {
                    console.error('❌ Error: Please specify a scenario name');
                    console.log('Example: node test-framework.js --scenario=broken-links');
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

            // Backward compatibility
            if (args.includes('--test-all-roles')) {
                console.log('🚀 TESTING ALL SUPPORTED ROLES');
                console.log('==============================');
                await this.roleBasedTest.testAllSupportedRoles();
                return;
            }

            // Unknown command
            console.error('❌ Unknown command. Use --help for usage information.');
            
        } catch (error) {
            console.error(`💥 Test execution failed: ${error.message}`);
            process.exit(1);
        }
    }

    async validateConfiguration() {
        try {
            const allRoles = this.configManager.listAllRoles();
            console.log(`✅ Configuration loaded successfully`);
            console.log(`📊 Found ${allRoles.length} configured roles`);
            
            let validRoles = 0;
            let invalidRoles = 0;
            
            for (const roleInfo of allRoles) {
                try {
                    const user = this.configManager.getUserByRole(roleInfo.role);
                    if (user && user.username && user.password) {
                        console.log(`✅ ${roleInfo.role}: Valid`);
                        validRoles++;
                    } else {
                        console.log(`❌ ${roleInfo.role}: Missing credentials`);
                        invalidRoles++;
                    }
                } catch (error) {
                    console.log(`❌ ${roleInfo.role}: ${error.message}`);
                    invalidRoles++;
                }
            }
            
            console.log(`\n📈 Summary: ${validRoles} valid, ${invalidRoles} invalid roles`);
            
            if (invalidRoles > 0) {
                console.log(`⚠️  Please check config/test-users-config.json for missing or invalid role configurations`);
            }
            
        } catch (error) {
            console.error(`❌ Configuration validation failed: ${error.message}`);
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
