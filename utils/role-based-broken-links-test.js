const { UltraFreshSmartLogin } = require('./ultra-fresh-smart-login');
const UserConfigManager = require('./user-config-manager');

class RoleBasedBrokenLinksTest {
    constructor() {
        this.configManager = new UserConfigManager();
        this.ultraLogin = new UltraFreshSmartLogin();
        this.currentUser = null;
        this.testResults = [];
    }

    /**
     * Run broken links test for a specific role
     * @param {string} roleName - Role name (e.g., 'Owner', 'PayrollAdmin')
     * @returns {object} Test results
     */
    async testBrokenLinksForRole(roleName) {
        console.log('🔗 ROLE-BASED BROKEN LINKS TESTING');
        console.log('==================================');
        console.log(`🎯 Testing with role: ${roleName}`);
        console.log('');

        try {
            // Get user configuration for the role
            this.currentUser = this.configManager.getUserByRole(roleName);
            
            // Validate role supports broken-links scenario
            if (!this.configManager.isRoleValidForScenario(roleName, 'broken-links')) {
                throw new Error(`Role '${roleName}' does not support broken-links testing`);
            }

            console.log('👤 USER CONFIGURATION:');
            console.log('======================');
            console.log(`📝 Description: ${this.currentUser.description}`);
            console.log(`🔢 Role Number: ${this.currentUser.role}`);
            console.log(`👤 Username: ${this.currentUser.username}`);
            console.log(`🔑 Permissions: ${this.currentUser.permissions.join(', ')}`);
            console.log(`🌐 Environment: ${this.currentUser.environment}`);
            console.log('');

            // Perform ultra-fresh login with role-specific credentials
            const loginResult = await this.performRoleBasedLogin();
            
            if (!loginResult.success) {
                return {
                    success: false,
                    role: roleName,
                    error: 'Login failed',
                    loginResult
                };
            }

            // Perform broken links testing
            const brokenLinksResult = await this.performBrokenLinksTest();

            return {
                success: true,
                role: roleName,
                user: this.currentUser,
                loginResult,
                brokenLinksResult,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error(`💥 Role-based test failed for ${roleName}: ${error.message}`);
            return {
                success: false,
                role: roleName,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        } finally {
            await this.cleanup();
        }
    }

    /**
     * Run broken links test for multiple roles
     * @param {array} roleNames - Array of role names
     * @returns {array} Array of test results
     */
    async testBrokenLinksForMultipleRoles(roleNames) {
        console.log('🔗 MULTI-ROLE BROKEN LINKS TESTING');
        console.log('==================================');
        console.log(`🎯 Testing ${roleNames.length} roles: ${roleNames.join(', ')}`);
        console.log('');

        const allResults = [];

        for (let i = 0; i < roleNames.length; i++) {
            const roleName = roleNames[i];
            console.log(`🔄 ROLE ${i + 1}/${roleNames.length}: ${roleName}`);
            console.log('='.repeat(50));

            const result = await this.testBrokenLinksForRole(roleName);
            allResults.push(result);

            // Wait between role tests to avoid session conflicts
            if (i < roleNames.length - 1) {
                console.log('⏳ Waiting between role tests...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        // Generate summary report
        this.generateMultiRoleReport(allResults);
        return allResults;
    }

    /**
     * Test all roles that support broken-links scenario
     * @returns {array} Array of test results
     */
    async testAllSupportedRoles() {
        console.log('🔗 COMPREHENSIVE BROKEN LINKS TESTING');
        console.log('=====================================');
        console.log('🎯 Testing all roles that support broken-links scenario');
        console.log('');

        // Get all users that support broken-links
        const supportedUsers = this.configManager.getUsersForScenario('broken-links');
        const roleNames = supportedUsers.map(user => user.roleName);

        console.log(`📋 Found ${roleNames.length} roles supporting broken-links:`);
        roleNames.forEach(roleName => {
            const user = supportedUsers.find(u => u.roleName === roleName);
            console.log(`• ${roleName} (Role ${user.role}) - ${user.description}`);
        });
        console.log('');

        return await this.testBrokenLinksForMultipleRoles(roleNames);
    }

    async performRoleBasedLogin() {
        console.log('🚀 ROLE-BASED LOGIN');
        console.log('===================');

        try {
            // Use the current user's credentials
            const result = await this.ultraLogin.performUltraFreshLogin(
                this.currentUser.baseUrl,
                this.currentUser.username,
                this.currentUser.password
            );

            if (result.success) {
                console.log('✅ Role-based login successful');
                console.log(`🎯 Logged in as: ${this.currentUser.description}`);
            } else {
                console.log('❌ Role-based login failed');
                console.log(`Issue: ${result.issue}`);
                console.log(`Message: ${result.message}`);
            }

            return result;

        } catch (error) {
            console.error(`💥 Role-based login error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                role: this.currentUser?.roleName
            };
        }
    }

    async performBrokenLinksTest() {
        console.log('');
        console.log('🔍 ROLE-SPECIFIC BROKEN LINKS ANALYSIS');
        console.log('======================================');

        try {
            const page = this.ultraLogin.getPage();
            const currentUrl = page.url();
            const pageTitle = await page.title();

            console.log(`📄 Current Page: ${pageTitle}`);
            console.log(`🔗 Current URL: ${currentUrl}`);
            console.log(`👤 Testing as: ${this.currentUser.description}`);
            console.log('');

            // Find all links on the page
            const links = await page.evaluate(() => {
                const linkElements = Array.from(document.querySelectorAll('a[href]'));
                return linkElements.map(link => ({
                    href: link.href,
                    text: link.textContent.trim(),
                    tagName: link.tagName,
                    target: link.target
                }));
            });

            console.log(`📊 Found ${links.length} total links on the page`);

            // Filter for internal ADP links
            const internalLinks = links.filter(link => 
                link.href.includes('adp.com') && 
                !link.href.includes('mailto:') &&
                !link.href.includes('tel:') &&
                !link.href.includes('javascript:') &&
                !link.href.includes('#')
            );

            console.log(`🎯 Testing ${internalLinks.length} internal links for broken status`);

            const results = {
                role: this.currentUser.roleName,
                roleNumber: this.currentUser.role,
                description: this.currentUser.description,
                pageTitle,
                currentUrl,
                totalLinks: links.length,
                internalLinks: internalLinks.length,
                testedLinks: 0,
                workingLinks: 0,
                brokenLinks: 0,
                skippedLinks: 0,
                linkDetails: [],
                permissions: this.currentUser.permissions,
                testStartTime: new Date().toISOString()
            };

            // Test each internal link (limit to 15 for practical testing)
            const maxLinksToTest = Math.min(internalLinks.length, 15);
            
            for (let i = 0; i < maxLinksToTest; i++) {
                const link = internalLinks[i];
                console.log(`🔗 Testing link ${i + 1}/${maxLinksToTest}: ${link.href}`);

                try {
                    const response = await page.goto(link.href, { 
                        waitUntil: 'networkidle',
                        timeout: 30000 
                    });

                    const status = response.status();
                    const isWorking = status >= 200 && status < 400;
                    
                    // Check for permission-specific errors
                    const pageContent = await page.textContent('body');
                    const hasPermissionError = pageContent.toLowerCase().includes('access denied') ||
                                            pageContent.toLowerCase().includes('unauthorized') ||
                                            pageContent.toLowerCase().includes('permission denied');

                    results.testedLinks++;
                    if (isWorking && !hasPermissionError) {
                        results.workingLinks++;
                    } else {
                        results.brokenLinks++;
                    }

                    results.linkDetails.push({
                        url: link.href,
                        text: link.text,
                        status,
                        working: isWorking && !hasPermissionError,
                        permissionError: hasPermissionError,
                        role: this.currentUser.roleName
                    });

                    const statusEmoji = isWorking && !hasPermissionError ? '✅' : '❌';
                    const permissionNote = hasPermissionError ? ' (Permission Error)' : '';
                    console.log(`${statusEmoji} Status: ${status}${permissionNote}`);

                } catch (error) {
                    results.testedLinks++;
                    results.brokenLinks++;
                    results.linkDetails.push({
                        url: link.href,
                        text: link.text,
                        status: 'ERROR',
                        working: false,
                        error: error.message,
                        role: this.currentUser.roleName
                    });

                    console.log(`❌ Error: ${error.message}`);
                }

                // Small delay between tests
                await page.waitForTimeout(1000);
            }

            results.testEndTime = new Date().toISOString();
            results.skippedLinks = internalLinks.length - maxLinksToTest;

            // Display role-specific results
            this.displayRoleSpecificResults(results);
            return results;

        } catch (error) {
            console.error(`💥 Broken links test error: ${error.message}`);
            throw error;
        }
    }

    displayRoleSpecificResults(results) {
        console.log('');
        console.log('📊 ROLE-SPECIFIC BROKEN LINKS RESULTS');
        console.log('=====================================');
        console.log(`👤 Role: ${results.role} (${results.description})`);
        console.log(`🔢 Role Number: ${results.roleNumber}`);
        console.log(`📄 Page: ${results.pageTitle}`);
        console.log(`🔗 URL: ${results.currentUrl}`);
        console.log(`📊 Total links found: ${results.totalLinks}`);
        console.log(`🎯 Internal links: ${results.internalLinks}`);
        console.log(`🧪 Links tested: ${results.testedLinks}`);
        console.log(`✅ Working links: ${results.workingLinks}`);
        console.log(`❌ Broken links: ${results.brokenLinks}`);
        console.log(`⚠️  Skipped links: ${results.skippedLinks}`);

        if (results.brokenLinks === 0) {
            console.log('');
            console.log('🎉 NO BROKEN LINKS FOUND FOR THIS ROLE!');
            console.log('=======================================');
            console.log(`All tested links work properly for ${results.description}`);
        } else {
            console.log('');
            console.log('🚨 BROKEN LINKS DETECTED FOR THIS ROLE!');
            console.log('=======================================');
            results.linkDetails.filter(link => !link.working).forEach((link, index) => {
                console.log(`${index + 1}. ❌ ${link.url}`);
                console.log(`   Status: ${link.status}`);
                console.log(`   Text: "${link.text}"`);
                console.log(`   Role: ${link.role}`);
                if (link.permissionError) {
                    console.log(`   ⚠️  Permission Error: Access denied for this role`);
                }
                if (link.error) {
                    console.log(`   Error: ${link.error}`);
                }
                console.log('');
            });
        }
    }

    generateMultiRoleReport(allResults) {
        console.log('');
        console.log('📊 MULTI-ROLE TESTING SUMMARY REPORT');
        console.log('====================================');
        
        const successfulTests = allResults.filter(r => r.success);
        const failedTests = allResults.filter(r => !r.success);
        
        console.log(`🧪 Total roles tested: ${allResults.length}`);
        console.log(`✅ Successful tests: ${successfulTests.length}`);
        console.log(`❌ Failed tests: ${failedTests.length}`);
        console.log('');

        if (successfulTests.length > 0) {
            console.log('✅ SUCCESSFUL ROLE TESTS:');
            console.log('=========================');
            successfulTests.forEach(result => {
                const brokenLinksResult = result.brokenLinksResult;
                console.log(`• ${result.role} (Role ${result.user.role})`);
                console.log(`  📝 ${result.user.description}`);
                console.log(`  🧪 Links tested: ${brokenLinksResult.testedLinks}`);
                console.log(`  ✅ Working: ${brokenLinksResult.workingLinks}`);
                console.log(`  ❌ Broken: ${brokenLinksResult.brokenLinks}`);
                console.log('');
            });
        }

        if (failedTests.length > 0) {
            console.log('❌ FAILED ROLE TESTS:');
            console.log('=====================');
            failedTests.forEach(result => {
                console.log(`• ${result.role}: ${result.error}`);
            });
            console.log('');
        }

        // Generate consolidated broken links report
        const allBrokenLinks = [];
        successfulTests.forEach(result => {
            if (result.brokenLinksResult && result.brokenLinksResult.linkDetails) {
                const brokenLinks = result.brokenLinksResult.linkDetails.filter(link => !link.working);
                allBrokenLinks.push(...brokenLinks);
            }
        });

        if (allBrokenLinks.length > 0) {
            console.log('🚨 CONSOLIDATED BROKEN LINKS ACROSS ALL ROLES:');
            console.log('==============================================');
            
            // Group by URL to avoid duplicates
            const brokenByUrl = {};
            allBrokenLinks.forEach(link => {
                if (!brokenByUrl[link.url]) {
                    brokenByUrl[link.url] = {
                        ...link,
                        affectedRoles: [link.role]
                    };
                } else {
                    brokenByUrl[link.url].affectedRoles.push(link.role);
                }
            });

            Object.values(brokenByUrl).forEach((link, index) => {
                console.log(`${index + 1}. ❌ ${link.url}`);
                console.log(`   Status: ${link.status}`);
                console.log(`   Text: "${link.text}"`);
                console.log(`   Affected Roles: ${link.affectedRoles.join(', ')}`);
                if (link.permissionError) {
                    console.log(`   ⚠️  Permission-related issue`);
                }
                console.log('');
            });
        } else {
            console.log('🎉 NO BROKEN LINKS FOUND ACROSS ALL TESTED ROLES!');
            console.log('=================================================');
        }
    }

    async cleanup() {
        try {
            if (this.ultraLogin) {
                await this.ultraLogin.cleanup();
            }
        } catch (error) {
            console.log(`⚠️  Cleanup error: ${error.message}`);
        }
    }
}

// CLI interface for easy testing
async function runRoleBasedTest() {
    const args = process.argv.slice(2);
    const roleBasedTest = new RoleBasedBrokenLinksTest();

    try {
        if (args.length === 0) {
            // No arguments - test all supported roles
            console.log('🔗 Running comprehensive broken links test for all supported roles...');
            await roleBasedTest.testAllSupportedRoles();
        } else if (args[0] === '--role' && args[1]) {
            // Specific role testing
            console.log(`🔗 Running broken links test for role: ${args[1]}`);
            await roleBasedTest.testBrokenLinksForRole(args[1]);
        } else if (args[0] === '--roles' && args.length > 1) {
            // Multiple roles testing
            const roles = args.slice(1);
            console.log(`🔗 Running broken links test for roles: ${roles.join(', ')}`);
            await roleBasedTest.testBrokenLinksForMultipleRoles(roles);
        } else if (args[0] === '--list-roles') {
            // List available roles
            const configManager = new UserConfigManager();
            configManager.displayConfigSummary();
        } else {
            console.log('📋 USAGE:');
            console.log('=========');
            console.log('node role-based-broken-links-test.js                    # Test all supported roles');
            console.log('node role-based-broken-links-test.js --role Owner       # Test specific role');
            console.log('node role-based-broken-links-test.js --roles Owner PayrollAdmin  # Test multiple roles');
            console.log('node role-based-broken-links-test.js --list-roles       # List available roles');
        }
    } catch (error) {
        console.error(`💥 Test execution failed: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    runRoleBasedTest().catch(console.error);
}

module.exports = RoleBasedBrokenLinksTest;
