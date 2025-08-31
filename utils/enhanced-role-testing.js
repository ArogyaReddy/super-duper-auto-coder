#!/usr/bin/env node

/**
 * Enhanced Role-Based Testing Framework
 * Extends the basic role-based testing with advanced features
 */

const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const UserConfigManager = require('./user-config-manager');
const RoleBasedBrokenLinksTest = require('./role-based-broken-links-test');

class EnhancedRoleTesting {
    constructor() {
        this.userManager = new UserConfigManager();
        this.testEngine = new RoleBasedBrokenLinksTest();
        this.reportDir = path.join(__dirname, '..', 'reports', 'role-based');
        this.ensureReportDirectory();
    }

    async ensureReportDirectory() {
        await fs.ensureDir(this.reportDir);
    }

    /**
     * Advanced Feature 1: Role Comparison Testing
     * Compare how different roles behave with the same test scenarios
     */
    async compareRoles(roles, scenario = 'broken-links') {
        console.log(chalk.blue.bold('\n🔄 ROLE COMPARISON TESTING'));
        console.log(chalk.gray(`Comparing roles: ${roles.join(', ')} with scenario: ${scenario}\n`));

        const results = {};
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        for (const role of roles) {
            console.log(chalk.yellow(`\n🧪 Testing role: ${role}`));
            
            try {
                const result = await this.testEngine.testBrokenLinksForRole(role, {
                    scenario,
                    generateReport: true,
                    verbose: true
                });
                
                results[role] = {
                    status: 'success',
                    data: result,
                    timestamp: new Date().toISOString()
                };
                
                console.log(chalk.green(`✅ ${role} test completed`));
                
            } catch (error) {
                results[role] = {
                    status: 'error',
                    error: error.message,
                    timestamp: new Date().toISOString()
                };
                
                console.log(chalk.red(`❌ ${role} test failed: ${error.message}`));
            }
        }

        // Generate comparison report
        const comparisonReport = await this.generateComparisonReport(results, scenario, timestamp);
        console.log(chalk.green(`\n📊 Comparison report generated: ${comparisonReport}`));

        return results;
    }

    /**
     * Advanced Feature 2: Permission Matrix Testing
     * Test role permissions across different features/pages
     */
    async testPermissionMatrix(roles = null, features = null) {
        console.log(chalk.blue.bold('\n🔐 PERMISSION MATRIX TESTING'));
        
        const testRoles = roles || this.userManager.listAllRoles().map(r => r.role);
        const testFeatures = features || [
            'dashboard',
            'payroll',
            'hr-admin',
            'reports',
            'settings',
            'user-management'
        ];

        console.log(chalk.gray(`Testing ${testRoles.length} roles across ${testFeatures.length} features\n`));

        const matrix = {};
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        for (const role of testRoles) {
            matrix[role] = {};
            console.log(chalk.yellow(`\n🧪 Testing permissions for: ${role}`));
            
            for (const feature of testFeatures) {
                try {
                    const hasAccess = await this.testFeatureAccess(role, feature);
                    matrix[role][feature] = hasAccess;
                    
                    const status = hasAccess ? chalk.green('✅') : chalk.red('❌');
                    console.log(`  ${status} ${feature}: ${hasAccess ? 'ALLOWED' : 'DENIED'}`);
                    
                } catch (error) {
                    matrix[role][feature] = 'ERROR';
                    console.log(`  ${chalk.red('⚠️')} ${feature}: ERROR - ${error.message}`);
                }
            }
        }

        // Generate matrix report
        const matrixReport = await this.generatePermissionMatrixReport(matrix, timestamp);
        console.log(chalk.green(`\n📊 Permission matrix report: ${matrixReport}`));

        return matrix;
    }

    /**
     * Advanced Feature 3: Role Performance Testing
     * Measure performance differences between roles
     */
    async performanceTest(roles, iterations = 3) {
        console.log(chalk.blue.bold('\n⚡ ROLE PERFORMANCE TESTING'));
        console.log(chalk.gray(`Testing ${roles.length} roles with ${iterations} iterations each\n`));

        const performanceData = {};
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        for (const role of roles) {
            performanceData[role] = [];
            console.log(chalk.yellow(`\n📊 Performance testing: ${role}`));
            
            for (let i = 1; i <= iterations; i++) {
                console.log(chalk.gray(`  Iteration ${i}/${iterations}`));
                
                const startTime = Date.now();
                
                try {
                    await this.testEngine.testBrokenLinksForRole(role, {
                        scenario: 'performance',
                        measureTime: true
                    });
                    
                    const endTime = Date.now();
                    const duration = endTime - startTime;
                    
                    performanceData[role].push({
                        iteration: i,
                        duration,
                        status: 'success',
                        timestamp: new Date().toISOString()
                    });
                    
                    console.log(chalk.green(`    ✅ ${duration}ms`));
                    
                } catch (error) {
                    const endTime = Date.now();
                    const duration = endTime - startTime;
                    
                    performanceData[role].push({
                        iteration: i,
                        duration,
                        status: 'error',
                        error: error.message,
                        timestamp: new Date().toISOString()
                    });
                    
                    console.log(chalk.red(`    ❌ ${duration}ms (Failed)`));
                }
            }

            // Calculate statistics
            const successful = performanceData[role].filter(d => d.status === 'success');
            if (successful.length > 0) {
                const durations = successful.map(d => d.duration);
                const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
                const min = Math.min(...durations);
                const max = Math.max(...durations);
                
                console.log(chalk.blue(`  📈 ${role} stats: avg=${avg.toFixed(0)}ms, min=${min}ms, max=${max}ms`));
            }
        }

        // Generate performance report
        const perfReport = await this.generatePerformanceReport(performanceData, timestamp);
        console.log(chalk.green(`\n📊 Performance report: ${perfReport}`));

        return performanceData;
    }

    /**
     * Advanced Feature 4: Scenario Builder
     * Build custom test scenarios dynamically
     */
    async buildCustomScenario(scenarioName, config) {
        console.log(chalk.blue.bold('\n🏗️ CUSTOM SCENARIO BUILDER'));
        console.log(chalk.gray(`Building scenario: ${scenarioName}\n`));

        const scenario = {
            name: scenarioName,
            description: config.description || `Custom scenario: ${scenarioName}`,
            steps: config.steps || [],
            roles: config.roles || [],
            environment: config.environment || 'iat',
            timeout: config.timeout || 30000,
            created: new Date().toISOString()
        };

        // Save scenario
        const scenarioPath = path.join(__dirname, '..', 'config', 'custom-scenarios', `${scenarioName}.json`);
        await fs.ensureDir(path.dirname(scenarioPath));
        await fs.writeJson(scenarioPath, scenario, { spaces: 2 });

        console.log(chalk.green(`✅ Custom scenario saved: ${scenarioPath}`));

        return scenario;
    }

    /**
     * Advanced Feature 5: Automated Role Discovery
     * Discover available features/permissions for each role
     */
    async discoverRoleCapabilities(role) {
        console.log(chalk.blue.bold('\n🔍 ROLE CAPABILITY DISCOVERY'));
        console.log(chalk.gray(`Discovering capabilities for: ${role}\n`));

        const capabilities = {
            role,
            discovered: new Date().toISOString(),
            navigation: {},
            permissions: {},
            features: {},
            errors: []
        };

        try {
            // Test basic navigation
            console.log(chalk.yellow('🧭 Testing navigation capabilities...'));
            capabilities.navigation = await this.discoverNavigation(role);

            // Test feature access
            console.log(chalk.yellow('🎯 Testing feature access...'));
            capabilities.features = await this.discoverFeatures(role);

            // Test permissions
            console.log(chalk.yellow('🔐 Testing permission levels...'));
            capabilities.permissions = await this.discoverPermissions(role);

        } catch (error) {
            capabilities.errors.push({
                type: 'discovery_error',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }

        // Save discovery report
        const discoveryPath = path.join(this.reportDir, `discovery-${role}-${Date.now()}.json`);
        await fs.writeJson(discoveryPath, capabilities, { spaces: 2 });

        console.log(chalk.green(`📊 Discovery report: ${discoveryPath}`));

        return capabilities;
    }

    /**
     * Helper Methods
     */

    async testFeatureAccess(role, feature) {
        // Simulate feature access testing
        // In real implementation, this would use the browser automation
        const user = this.userManager.getUserByRole(role);
        if (!user) return false;

        // Check if user permissions include the feature
        return user.permissions && user.permissions.includes(feature);
    }

    async discoverNavigation(role) {
        // Simulate navigation discovery
        const commonPages = [
            'dashboard', 'profile', 'settings', 'reports',
            'payroll', 'hr', 'admin', 'help'
        ];

        const accessible = {};
        for (const page of commonPages) {
            accessible[page] = await this.testFeatureAccess(role, page);
        }

        return accessible;
    }

    async discoverFeatures(role) {
        const user = this.userManager.getUserByRole(role);
        return {
            available: user?.permissions || [],
            count: user?.permissions?.length || 0
        };
    }

    async discoverPermissions(role) {
        const user = this.userManager.getUserByRole(role);
        return {
            level: user?.permissionLevel || 'standard',
            specific: user?.permissions || []
        };
    }

    async generateComparisonReport(results, scenario, timestamp) {
        const reportPath = path.join(this.reportDir, `comparison-${scenario}-${timestamp}.json`);
        
        const report = {
            type: 'role_comparison',
            scenario,
            timestamp,
            summary: {
                total_roles: Object.keys(results).length,
                successful: Object.values(results).filter(r => r.status === 'success').length,
                failed: Object.values(results).filter(r => r.status === 'error').length
            },
            results
        };

        await fs.writeJson(reportPath, report, { spaces: 2 });
        return reportPath;
    }

    async generatePermissionMatrixReport(matrix, timestamp) {
        const reportPath = path.join(this.reportDir, `permission-matrix-${timestamp}.json`);
        
        const report = {
            type: 'permission_matrix',
            timestamp,
            matrix,
            summary: this.calculateMatrixSummary(matrix)
        };

        await fs.writeJson(reportPath, report, { spaces: 2 });
        return reportPath;
    }

    async generatePerformanceReport(performanceData, timestamp) {
        const reportPath = path.join(this.reportDir, `performance-${timestamp}.json`);
        
        const report = {
            type: 'performance_analysis',
            timestamp,
            data: performanceData,
            summary: this.calculatePerformanceSummary(performanceData)
        };

        await fs.writeJson(reportPath, report, { spaces: 2 });
        return reportPath;
    }

    calculateMatrixSummary(matrix) {
        const summary = {
            roles_tested: Object.keys(matrix).length,
            features_tested: 0,
            total_access_granted: 0,
            total_access_denied: 0,
            errors: 0
        };

        for (const role in matrix) {
            const features = Object.keys(matrix[role]);
            if (features.length > summary.features_tested) {
                summary.features_tested = features.length;
            }

            for (const feature in matrix[role]) {
                const access = matrix[role][feature];
                if (access === true) summary.total_access_granted++;
                else if (access === false) summary.total_access_denied++;
                else summary.errors++;
            }
        }

        return summary;
    }

    calculatePerformanceSummary(performanceData) {
        const summary = {
            roles_tested: Object.keys(performanceData).length,
            total_iterations: 0,
            average_times: {},
            fastest_role: null,
            slowest_role: null
        };

        let fastestAvg = Infinity;
        let slowestAvg = 0;

        for (const role in performanceData) {
            const successful = performanceData[role].filter(d => d.status === 'success');
            summary.total_iterations += performanceData[role].length;

            if (successful.length > 0) {
                const durations = successful.map(d => d.duration);
                const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
                
                summary.average_times[role] = {
                    average: Math.round(avg),
                    min: Math.min(...durations),
                    max: Math.max(...durations),
                    successful_runs: successful.length,
                    total_runs: performanceData[role].length
                };

                if (avg < fastestAvg) {
                    fastestAvg = avg;
                    summary.fastest_role = role;
                }

                if (avg > slowestAvg) {
                    slowestAvg = avg;
                    summary.slowest_role = role;
                }
            }
        }

        return summary;
    }
}

module.exports = EnhancedRoleTesting;

// CLI usage
if (require.main === module) {
    const enhanced = new EnhancedRoleTesting();
    const args = process.argv.slice(2);
    
    async function main() {
        try {
            if (args.includes('--compare-roles')) {
                const rolesArg = args.find(arg => arg.startsWith('--roles='));
                const scenarioArg = args.find(arg => arg.startsWith('--scenario='));
                
                const roles = rolesArg ? rolesArg.split('=')[1].split(',') : ['Owner', 'PayrollAdmin'];
                const scenario = scenarioArg ? scenarioArg.split('=')[1] : 'broken-links';
                
                await enhanced.compareRoles(roles, scenario);
                
            } else if (args.includes('--permission-matrix')) {
                const rolesArg = args.find(arg => arg.startsWith('--roles='));
                const roles = rolesArg ? rolesArg.split('=')[1].split(',') : null;
                
                await enhanced.testPermissionMatrix(roles);
                
            } else if (args.includes('--performance-test')) {
                const rolesArg = args.find(arg => arg.startsWith('--roles='));
                const iterationsArg = args.find(arg => arg.startsWith('--iterations='));
                
                const roles = rolesArg ? rolesArg.split('=')[1].split(',') : ['Owner', 'PayrollAdmin'];
                const iterations = iterationsArg ? parseInt(iterationsArg.split('=')[1]) : 3;
                
                await enhanced.performanceTest(roles, iterations);
                
            } else if (args.includes('--discover-role')) {
                const roleArg = args.find(arg => arg.startsWith('--role='));
                const role = roleArg ? roleArg.split('=')[1] : 'Owner';
                
                await enhanced.discoverRoleCapabilities(role);
                
            } else {
                console.log(chalk.blue.bold('🚀 Enhanced Role-Based Testing Framework\n'));
                console.log(chalk.yellow('Available commands:'));
                console.log('  --compare-roles --roles=role1,role2 --scenario=scenario');
                console.log('  --permission-matrix --roles=role1,role2');
                console.log('  --performance-test --roles=role1,role2 --iterations=3');
                console.log('  --discover-role --role=RoleName');
                console.log('\nExamples:');
                console.log('  node enhanced-role-testing.js --compare-roles --roles=Owner,PayrollAdmin');
                console.log('  node enhanced-role-testing.js --permission-matrix');
                console.log('  node enhanced-role-testing.js --performance-test --roles=Owner,PayrollAdmin --iterations=5');
                console.log('  node enhanced-role-testing.js --discover-role --role=HRAdmin');
            }
            
        } catch (error) {
            console.log(chalk.red('❌ Error:', error.message));
            process.exit(1);
        }
    }
    
    main();
}
