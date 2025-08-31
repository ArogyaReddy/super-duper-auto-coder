const fs = require('fs');
const path = require('path');

class UserConfigManager {
    constructor(configPath = null) {
        this.configPath = configPath || path.join(__dirname, '../config/test-users-config.json');
        this.config = null;
        this.loadConfig();
    }

    loadConfig() {
        try {
            if (!fs.existsSync(this.configPath)) {
                throw new Error(`Config file not found: ${this.configPath}`);
            }

            const configData = fs.readFileSync(this.configPath, 'utf8');
            this.config = JSON.parse(configData);
            
            console.log('✅ User configuration loaded successfully');
            console.log(`📁 Config path: ${this.configPath}`);
            console.log(`🏢 Client IID: ${this.config.testEnvironment.clientIID}`);
            console.log(`🌐 Environment: ${this.config.testEnvironment.environment}`);
            
        } catch (error) {
            console.error(`❌ Failed to load user config: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get user configuration by role name
     * @param {string} roleName - Name of the role (e.g., 'Owner', 'PayrollAdmin')
     * @returns {object} User configuration object
     */
    getUserByRole(roleName) {
        if (!this.config || !this.config.userRoles) {
            throw new Error('Configuration not loaded');
        }

        const user = this.config.userRoles[roleName];
        if (!user) {
            const availableRoles = Object.keys(this.config.userRoles);
            throw new Error(`Role '${roleName}' not found. Available roles: ${availableRoles.join(', ')}`);
        }

        return {
            ...user,
            baseUrl: this.config.testEnvironment.baseUrl,
            clientIID: this.config.testEnvironment.clientIID,
            environment: this.config.testEnvironment.environment
        };
    }

    /**
     * Get user configuration by role number
     * @param {string|number} roleNumber - Role number (e.g., '1', '25', '100')
     * @returns {object} User configuration object
     */
    getUserByRoleNumber(roleNumber) {
        if (!this.config || !this.config.userRoles) {
            throw new Error('Configuration not loaded');
        }

        const roleStr = roleNumber.toString();
        const roleName = Object.keys(this.config.userRoles).find(
            key => this.config.userRoles[key].role === roleStr
        );

        if (!roleName) {
            throw new Error(`Role number '${roleNumber}' not found in configuration`);
        }

        return this.getUserByRole(roleName);
    }

    /**
     * Get all users that support a specific test scenario
     * @param {string} scenarioName - Test scenario name (e.g., 'broken-links')
     * @returns {array} Array of user configuration objects
     */
    getUsersForScenario(scenarioName) {
        if (!this.config || !this.config.userRoles) {
            throw new Error('Configuration not loaded');
        }

        const supportedUsers = [];
        
        Object.entries(this.config.userRoles).forEach(([roleName, userData]) => {
            if (userData.testScenarios && userData.testScenarios.includes(scenarioName)) {
                supportedUsers.push({
                    roleName,
                    ...userData,
                    baseUrl: this.config.testEnvironment.baseUrl,
                    clientIID: this.config.testEnvironment.clientIID,
                    environment: this.config.testEnvironment.environment
                });
            }
        });

        return supportedUsers;
    }

    /**
     * Get test scenario configuration
     * @param {string} scenarioName - Test scenario name
     * @returns {object} Scenario configuration
     */
    getScenarioConfig(scenarioName) {
        if (!this.config || !this.config.testScenarios) {
            throw new Error('Configuration not loaded');
        }

        const scenario = this.config.testScenarios[scenarioName];
        if (!scenario) {
            const availableScenarios = Object.keys(this.config.testScenarios);
            throw new Error(`Scenario '${scenarioName}' not found. Available scenarios: ${availableScenarios.join(', ')}`);
        }

        return scenario;
    }

    /**
     * Validate if a role supports a specific test scenario
     * @param {string} roleName - Role name
     * @param {string} scenarioName - Test scenario name
     * @returns {boolean} True if role supports the scenario
     */
    isRoleValidForScenario(roleName, scenarioName) {
        try {
            const user = this.getUserByRole(roleName);
            const scenario = this.getScenarioConfig(scenarioName);
            
            return scenario.supportedRoles.includes(user.role);
        } catch (error) {
            return false;
        }
    }

    /**
     * Get browser settings from configuration
     * @returns {object} Browser configuration
     */
    getBrowserSettings() {
        return this.config?.browserSettings || {
            headless: false,
            viewport: { width: 1920, height: 1080 },
            timeout: 30000
        };
    }

    /**
     * Get reporting settings from configuration
     * @returns {object} Reporting configuration
     */
    getReportingSettings() {
        return this.config?.reporting || {
            outputDir: './test-results',
            screenshotOnFailure: true,
            detailedLogs: true
        };
    }

    /**
     * List all available roles
     * @returns {array} Array of role information
     */
    listAllRoles() {
        if (!this.config || !this.config.userRoles) {
            throw new Error('Configuration not loaded');
        }

        return Object.entries(this.config.userRoles).map(([roleName, userData]) => ({
            roleName,
            roleNumber: userData.role,
            description: userData.description,
            permissions: userData.permissions,
            testScenarios: userData.testScenarios
        }));
    }

    /**
     * Get all role names
     * @returns {array} Array of role names
     */
    getAllRoleNames() {
        if (!this.config || !this.config.userRoles) {
            throw new Error('Configuration not loaded');
        }
        return Object.keys(this.config.userRoles);
    }

    /**
     * Display configuration summary
     */
    displayConfigSummary() {
        console.log('');
        console.log('📋 USER CONFIGURATION SUMMARY');
        console.log('==============================');
        console.log(`🏢 Client IID: ${this.config.testEnvironment.clientIID}`);
        console.log(`🌐 Environment: ${this.config.testEnvironment.environment}`);
        console.log(`🔗 Base URL: ${this.config.testEnvironment.baseUrl}`);
        console.log('');
        
        console.log('👥 AVAILABLE ROLES:');
        console.log('===================');
        const roles = this.listAllRoles();
        roles.forEach(role => {
            console.log(`• ${role.roleName} (Role ${role.roleNumber})`);
            console.log(`  📝 ${role.description}`);
            console.log(`  🔑 Permissions: ${role.permissions.join(', ')}`);
            console.log(`  🧪 Test Scenarios: ${role.testScenarios.join(', ')}`);
            console.log('');
        });

        console.log('🧪 AVAILABLE TEST SCENARIOS:');
        console.log('============================');
        Object.entries(this.config.testScenarios).forEach(([scenarioName, scenarioData]) => {
            console.log(`• ${scenarioName}`);
            console.log(`  📝 ${scenarioData.description}`);
            console.log(`  👥 Supported Roles: ${scenarioData.supportedRoles.join(', ')}`);
            console.log(`  ⏱️  Timeout: ${scenarioData.timeout / 1000}s`);
            console.log('');
        });
    }
}

// Export the class
module.exports = UserConfigManager;

// Demo usage if run directly
if (require.main === module) {
    console.log('🧪 USER CONFIGURATION MANAGER DEMO');
    console.log('===================================');

    try {
        const configManager = new UserConfigManager();
        
        // Display full summary
        configManager.displayConfigSummary();

        // Test specific role lookup
        console.log('🔍 TESTING SPECIFIC ROLE LOOKUP:');
        console.log('=================================');
        const ownerUser = configManager.getUserByRole('Owner');
        console.log('Owner user config:', JSON.stringify(ownerUser, null, 2));

        // Test role number lookup
        console.log('');
        console.log('🔢 TESTING ROLE NUMBER LOOKUP:');
        console.log('===============================');
        const serviceUser = configManager.getUserByRoleNumber('100');
        console.log('Service user config:', JSON.stringify(serviceUser, null, 2));

        // Test scenario-based user lookup
        console.log('');
        console.log('🎯 TESTING SCENARIO-BASED LOOKUP:');
        console.log('==================================');
        const brokenLinksUsers = configManager.getUsersForScenario('broken-links');
        console.log(`Users supporting broken-links scenario: ${brokenLinksUsers.length}`);
        brokenLinksUsers.forEach(user => {
            console.log(`• ${user.roleName} (${user.description})`);
        });

    } catch (error) {
        console.error(`💥 Demo failed: ${error.message}`);
    }
}
