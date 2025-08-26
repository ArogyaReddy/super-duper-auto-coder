/**
 * Environment Configuration Manager
 * Handles environment switching and configuration loading for different environments
 */

const fs = require('fs');
const path = require('path');

class EnvironmentManager {
    constructor() {
        this.currentEnvironment = process.env.ADP_ENV || 'fit';
        this.configCache = new Map();
    }

    /**
     * Get the current environment
     * @returns {string} Current environment (fit, iat, prod, etc.)
     */
    getCurrentEnvironment() {
        return this.currentEnvironment;
    }

    /**
     * Set the environment for testing
     * @param {string} environment - Environment to switch to (fit, iat, prod)
     */
    setEnvironment(environment) {
        this.currentEnvironment = environment;
        process.env.ADP_ENV = environment;
        console.log(`🌍 Environment switched to: ${environment}`);
    }

    /**
     * Get configuration for the current environment
     * @returns {object} Environment configuration
     */
    getEnvironmentConfig() {
        const cacheKey = this.currentEnvironment;
        
        if (this.configCache.has(cacheKey)) {
            return this.configCache.get(cacheKey);
        }

        const configPath = this.getConfigPath();
        
        if (!fs.existsSync(configPath)) {
            throw new Error(`Configuration file not found for environment: ${this.currentEnvironment} at ${configPath}`);
        }

        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            this.configCache.set(cacheKey, config);
            return config;
        } catch (error) {
            throw new Error(`Failed to load configuration for environment ${this.currentEnvironment}: ${error.message}`);
        }
    }

    /**
     * Get the configuration file path for the current environment
     * @returns {string} Path to configuration file
     */
    getConfigPath() {
        // Check if we're in the auto-coder directory
        const autoCoderSBSPath = path.join(process.cwd(), 'SBS_Automation', 'data', this.currentEnvironment, 'config.json');
        if (fs.existsSync(autoCoderSBSPath)) {
            return autoCoderSBSPath;
        }

        // Try SBS_Automation in parent directory structure
        const parentSBSPath = path.join(process.cwd(), '..', 'SBS_Automation', 'data', this.currentEnvironment, 'config.json');
        if (fs.existsSync(parentSBSPath)) {
            return parentSBSPath;
        }

        // Try direct SBS_Automation reference
        const directSBSPath = path.join(__dirname, '..', '..', 'SBS_Automation', 'data', this.currentEnvironment, 'config.json');
        if (fs.existsSync(directSBSPath)) {
            return directSBSPath;
        }

        // Fallback paths
        const fallbackPaths = [
            path.join(process.cwd(), 'data', this.currentEnvironment, 'config.json'),
            path.join(process.cwd(), 'config', `${this.currentEnvironment}.json`),
            path.join(__dirname, '..', 'config', `${this.currentEnvironment}.json`)
        ];

        for (const fallbackPath of fallbackPaths) {
            if (fs.existsSync(fallbackPath)) {
                return fallbackPath;
            }
        }

        // Return the primary expected path for error reporting
        return autoCoderSBSPath;
    }

    /**
     * Get application URL for the current environment
     * @returns {string} Application URL
     */
    getApplicationUrl() {
        const config = this.getEnvironmentConfig();
        return config.url;
    }

    /**
     * Get associate URL for the current environment
     * @returns {string} Associate portal URL
     */
    getAssociateUrl() {
        const config = this.getEnvironmentConfig();
        return config.associate_url;
    }

    /**
     * Get credentials for associate login
     * @returns {object} Associate credentials
     */
    getAssociateCredentials() {
        const config = this.getEnvironmentConfig();
        return {
            username: config.runmodassociate_id,
            password: config.runmodassociate_password
        };
    }

    /**
     * Check if environment supports feature
     * @param {string} feature - Feature name to check
     * @returns {boolean} Whether feature is supported
     */
    supportsFeature(feature) {
        const config = this.getEnvironmentConfig();
        
        // Define feature support by environment
        const featureSupport = {
            'production_data': this.currentEnvironment === 'prod',
            'atp_scripts': this.currentEnvironment !== 'prod',
            'step_up_auth': this.currentEnvironment !== 'fit',
            'two_factor_auth': this.currentEnvironment === 'prod' || this.currentEnvironment === 'iat'
        };

        return featureSupport[feature] || false;
    }

    /**
     * Get environment-specific test data
     * @param {string} dataType - Type of test data needed
     * @returns {object} Test data for the environment
     */
    getTestData(dataType) {
        const dataPath = path.join(
            process.cwd(), 
            'SBS_Automation', 
            'data', 
            this.currentEnvironment, 
            `${dataType}.json`
        );

        if (!fs.existsSync(dataPath)) {
            console.warn(`Test data file not found: ${dataPath}`);
            return {};
        }

        try {
            return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        } catch (error) {
            console.error(`Failed to load test data ${dataType}: ${error.message}`);
            return {};
        }
    }

    /**
     * Get all available environments
     * @returns {string[]} Array of available environments
     */
    getAvailableEnvironments() {
        const possibleDataDirs = [
            path.join(process.cwd(), 'SBS_Automation', 'data'),
            path.join(process.cwd(), '..', 'SBS_Automation', 'data'),
            path.join(__dirname, '..', '..', 'SBS_Automation', 'data'),
            path.join(process.cwd(), 'data')
        ];

        for (const dataDir of possibleDataDirs) {
            if (fs.existsSync(dataDir)) {
                return fs.readdirSync(dataDir)
                    .filter(item => {
                        const itemPath = path.join(dataDir, item);
                        return fs.statSync(itemPath).isDirectory() && 
                               fs.existsSync(path.join(itemPath, 'config.json'));
                    });
            }
        }
        
        return ['fit', 'iat', 'prod', 'local']; // Default environments
    }

    /**
     * Validate environment configuration
     * @returns {boolean} Whether configuration is valid
     */
    validateConfiguration() {
        try {
            const config = this.getEnvironmentConfig();
            const requiredFields = ['url', 'associate_url', 'runmodassociate_id', 'runmodassociate_password'];
            
            for (const field of requiredFields) {
                if (!config[field]) {
                    console.error(`Missing required field in configuration: ${field}`);
                    return false;
                }
            }
            
            return true;
        } catch (error) {
            console.error(`Configuration validation failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Get environment display name
     * @returns {string} Formatted environment name
     */
    getEnvironmentDisplayName() {
        const names = {
            'fit': 'QA FIT',
            'iat': 'Integration Testing (IAT)', 
            'prod': 'Production',
            'prod_can': 'Production Canada',
            'iat_can': 'IAT Canada'
        };
        
        return names[this.currentEnvironment] || this.currentEnvironment.toUpperCase();
    }
}

module.exports = EnvironmentManager;
