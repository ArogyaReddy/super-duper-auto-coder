/**
 * Feature Flag Manager
 * Handles feature flags for conditional test execution
 */

class FeatureFlagManager {
    constructor() {
        this.flags = this.loadFeatureFlags();
    }

    /**
     * Load feature flags from environment variables and configuration
     * @returns {object} Feature flags configuration
     */
    loadFeatureFlags() {
        return {
            // Login and Authentication Flags
            SKIP_LOGIN: this.getFlag('SKIP_LOGIN', false),
            ENABLE_STEP_UP_AUTH: this.getFlag('ENABLE_STEP_UP_AUTH', true),
            ENABLE_TWO_FACTOR_AUTH: this.getFlag('ENABLE_TWO_FACTOR_AUTH', true),
            USE_SSO_LOGIN: this.getFlag('USE_SSO_LOGIN', false),
            
            // Test Execution Flags
            API_ONLY_MODE: this.getFlag('API_ONLY_MODE', false),
            UI_ONLY_MODE: this.getFlag('UI_ONLY_MODE', false),
            SKIP_UI_LOGIN_FOR_API: this.getFlag('SKIP_UI_LOGIN_FOR_API', true),
            
            // Environment Specific Flags
            LOCAL_DEVELOPMENT: this.getFlag('LOCAL_DEVELOPMENT', false),
            BYPASS_AUTH_FOR_LOCAL: this.getFlag('BYPASS_AUTH_FOR_LOCAL', false),
            
            // Test Data Flags
            USE_GOLDEN_DATA: this.getFlag('USE_GOLDEN_DATA', true),
            GENERATE_FRESH_DATA: this.getFlag('GENERATE_FRESH_DATA', false),
            
            // Browser and Performance Flags
            HEADLESS_MODE: this.getFlag('HEADLESS_MODE', false),
            ENABLE_SCREENSHOTS: this.getFlag('ENABLE_SCREENSHOTS', true),
            ENABLE_VIDEO_RECORDING: this.getFlag('ENABLE_VIDEO_RECORDING', false),
            
            // Debug and Logging Flags
            DEBUG_MODE: this.getFlag('DEBUG_MODE', false),
            VERBOSE_LOGGING: this.getFlag('VERBOSE_LOGGING', false),
            ENABLE_TRACE: this.getFlag('ENABLE_TRACE', false)
        };
    }

    /**
     * Get a feature flag value from environment or default
     * @param {string} flagName - Name of the feature flag
     * @param {*} defaultValue - Default value if flag is not set
     * @returns {*} Feature flag value
     */
    getFlag(flagName, defaultValue) {
        const envValue = process.env[flagName];
        
        if (envValue === undefined || envValue === null) {
            return defaultValue;
        }
        
        // Handle boolean values
        if (typeof defaultValue === 'boolean') {
            return envValue.toLowerCase() === 'true';
        }
        
        // Handle numeric values
        if (typeof defaultValue === 'number') {
            const numValue = Number(envValue);
            return isNaN(numValue) ? defaultValue : numValue;
        }
        
        // Return string value
        return envValue;
    }

    /**
     * Check if a feature flag is enabled
     * @param {string} flagName - Name of the feature flag
     * @returns {boolean} Whether the flag is enabled
     */
    isEnabled(flagName) {
        return Boolean(this.flags[flagName]);
    }

    /**
     * Check if login should be skipped
     * @returns {boolean} Whether to skip login
     */
    shouldSkipLogin() {
        return this.isEnabled('SKIP_LOGIN') || 
               this.isEnabled('API_ONLY_MODE') ||
               (this.isEnabled('LOCAL_DEVELOPMENT') && this.isEnabled('BYPASS_AUTH_FOR_LOCAL'));
    }

    /**
     * Check if UI login should be skipped for API tests
     * @returns {boolean} Whether to skip UI login for API tests
     */
    shouldSkipUILoginForAPI() {
        return this.isEnabled('SKIP_UI_LOGIN_FOR_API') && this.isEnabled('API_ONLY_MODE');
    }

    /**
     * Check if step-up authentication should be used
     * @returns {boolean} Whether to use step-up authentication
     */
    shouldUseStepUpAuth() {
        return this.isEnabled('ENABLE_STEP_UP_AUTH') && !this.isEnabled('LOCAL_DEVELOPMENT');
    }

    /**
     * Check if two-factor authentication should be used
     * @returns {boolean} Whether to use two-factor authentication
     */
    shouldUseTwoFactorAuth() {
        return this.isEnabled('ENABLE_TWO_FACTOR_AUTH') && !this.isEnabled('LOCAL_DEVELOPMENT');
    }

    /**
     * Get test execution mode
     * @returns {string} Test execution mode (UI, API, MIXED)
     */
    getTestMode() {
        if (this.isEnabled('API_ONLY_MODE')) {
            return 'API';
        }
        if (this.isEnabled('UI_ONLY_MODE')) {
            return 'UI';
        }
        return 'MIXED';
    }

    /**
     * Check if screenshots should be taken
     * @returns {boolean} Whether to take screenshots
     */
    shouldTakeScreenshots() {
        return this.isEnabled('ENABLE_SCREENSHOTS');
    }

    /**
     * Check if video recording should be enabled
     * @returns {boolean} Whether to record video
     */
    shouldRecordVideo() {
        return this.isEnabled('ENABLE_VIDEO_RECORDING');
    }

    /**
     * Check if running in headless mode
     * @returns {boolean} Whether to run in headless mode
     */
    shouldRunHeadless() {
        return this.isEnabled('HEADLESS_MODE');
    }

    /**
     * Check if debug mode is enabled
     * @returns {boolean} Whether debug mode is enabled
     */
    isDebugMode() {
        return this.isEnabled('DEBUG_MODE');
    }

    /**
     * Check if verbose logging is enabled
     * @returns {boolean} Whether verbose logging is enabled
     */
    isVerboseLogging() {
        return this.isEnabled('VERBOSE_LOGGING');
    }

    /**
     * Set a feature flag value
     * @param {string} flagName - Name of the feature flag
     * @param {*} value - Value to set
     */
    setFlag(flagName, value) {
        this.flags[flagName] = value;
        process.env[flagName] = String(value);
        console.log(`🚩 Feature flag ${flagName} set to: ${value}`);
    }

    /**
     * Get all feature flags
     * @returns {object} All feature flags
     */
    getAllFlags() {
        return { ...this.flags };
    }

    /**
     * Print current feature flags status
     */
    printStatus() {
        console.log('\n🚩 Feature Flags Status:');
        console.log('========================');
        
        Object.entries(this.flags).forEach(([flag, value]) => {
            const status = value ? '✅ ENABLED' : '❌ DISABLED';
            console.log(`${flag.padEnd(25)}: ${status}`);
        });
        
        console.log('========================\n');
    }

    /**
     * Create feature flag configuration for different test scenarios
     * @param {string} scenario - Test scenario type
     */
    configureForScenario(scenario) {
        console.log(`🎭 Configuring feature flags for scenario: ${scenario}`);
        
        switch (scenario.toLowerCase()) {
            case 'local_development':
                this.setFlag('LOCAL_DEVELOPMENT', true);
                this.setFlag('BYPASS_AUTH_FOR_LOCAL', true);
                this.setFlag('SKIP_LOGIN', true);
                this.setFlag('HEADLESS_MODE', false);
                this.setFlag('DEBUG_MODE', true);
                break;
                
            case 'api_testing':
                this.setFlag('API_ONLY_MODE', true);
                this.setFlag('SKIP_UI_LOGIN_FOR_API', true);
                this.setFlag('HEADLESS_MODE', true);
                this.setFlag('ENABLE_SCREENSHOTS', false);
                break;
                
            case 'ui_testing':
                this.setFlag('UI_ONLY_MODE', true);
                this.setFlag('API_ONLY_MODE', false);
                this.setFlag('ENABLE_SCREENSHOTS', true);
                break;
                
            case 'ci_pipeline':
                this.setFlag('HEADLESS_MODE', true);
                this.setFlag('ENABLE_SCREENSHOTS', true);
                this.setFlag('ENABLE_VIDEO_RECORDING', false);
                this.setFlag('VERBOSE_LOGGING', false);
                break;
                
            case 'regression_testing':
                this.setFlag('USE_GOLDEN_DATA', true);
                this.setFlag('ENABLE_SCREENSHOTS', true);
                this.setFlag('ENABLE_VIDEO_RECORDING', true);
                this.setFlag('VERBOSE_LOGGING', true);
                break;
                
            default:
                console.log(`⚠️  Unknown scenario: ${scenario}. Using default configuration.`);
        }
    }
}

module.exports = FeatureFlagManager;
