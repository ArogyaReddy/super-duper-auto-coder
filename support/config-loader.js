/**
 * Configuration Loader for Auto-Coder Framework
 * Integrates with SBS_Automation framework configuration structure
 */

const fs = require('fs');
const path = require('path');

class ConfigLoader {
    constructor() {
        this.config = this.loadConfiguration();
    }

    loadConfiguration() {
        const configFile = process.env.AUTO_CODER_CONFIG || 'web.config.json';
        const configPath = path.resolve(process.cwd(), configFile);
        
        console.log(`Loading configuration from: ${configPath}`);
        
        let config = {
          environment: 'fit',
          steps: './support/steps',
          pageObjects: './support/pages',
          data: './support/data',
          featureFiles: './SBS_Automation/features',
          reports: './SBS_Automation/reports',
          browser: 'chrome',
          timeout: 180000,
          headless: false,
          cleanup: false,
          baseUrl: 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c'
        };

        if (fs.existsSync(configPath)) {
            try {
                const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                config = { ...config, ...fileConfig };
                console.log(`✅ Configuration loaded from ${configFile}`);
            } catch (error) {
                console.warn(`⚠️  Warning: Could not parse ${configFile}:`, error.message);
                console.log('Using default configuration');
            }
        } else {
            console.warn(`⚠️  Warning: ${configFile} not found, using defaults`);
        }

        // Set environment-specific configuration
        if (config.environments && config.environments[config.environment]) {
            const envConfig = config.environments[config.environment];
            config = { ...config, ...envConfig };
            console.log(`📍 Environment: ${config.environment}`);
            console.log(`🌐 Base URL: ${config.baseUrl}`);
        }

        return config;
    }

    getConfig() {
        return this.config;
    }

    getEnvironmentConfig(environment = null) {
        const env = environment || this.config.environment;
        return this.config.environments?.[env] || {};
    }

    getBaseUrl() {
        return this.config.baseUrl || 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';
    }

    getAuthConfig() {
        const envConfig = this.getEnvironmentConfig();
        return envConfig.auth || { enabled: false };
    }

    getBrowser() {
        return process.env.BROWSER || this.config.browser || 'chrome';
    }

    getTimeout() {
        return parseInt(process.env.TIMEOUT) || this.config.timeout || 180000;
    }

    isHeadless() {
        return process.env.HEADLESS === 'true' || this.config.headless || false;
    }

    getReportsPath() {
        return this.config.reports || './SBS_Automation/reports';
    }

    logConfiguration() {
        console.log('\n📋 Auto-Coder Configuration:');
        console.log(`   Environment: ${this.config.environment}`);
        console.log(`   Base URL: ${this.getBaseUrl()}`);
        console.log(`   Browser: ${this.getBrowser()}`);
        console.log(`   Timeout: ${this.getTimeout()}ms`);
        console.log(`   Headless: ${this.isHeadless()}`);
        console.log(`   Reports: ${this.getReportsPath()}`);
        
        const authConfig = this.getAuthConfig();
        if (authConfig.enabled) {
            console.log(`   Authentication: Enabled`);
            console.log(`   Login URL: ${authConfig.loginUrl || 'Not specified'}`);
        } else {
            console.log(`   Authentication: Disabled`);
        }
        console.log('');
    }
}

module.exports = ConfigLoader;
