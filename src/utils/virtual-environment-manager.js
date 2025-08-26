/**
 * 🌐 VIRTUAL ENVIRONMENT MANAGER
 * 
 * SOLVES: Isolated staging execution with production references
 * APPROACH: Create virtual execution environment with path redirection
 * 
 * BENEFITS:
 * ✅ Complete isolation between staging and production
 * ✅ Real-time testing without affecting production
 * ✅ Advanced debugging and monitoring capabilities
 * ✅ Support for multiple parallel environments
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const Module = require('module');

class VirtualEnvironmentManager {
    constructor() {
        this.config = {
            stagingRoot: 'auto-coder/SBS_Automation',
            productionRoot: '../SBS_Automation',
            virtualEnvPath: 'auto-coder/temp/virtual-env',
            moduleCache: new Map(),
            pathMappings: new Map()
        };
        
        this.activeEnvironments = new Map();
        this.originalRequire = Module.prototype.require;
        this.setupComplete = false;
    }

    /**
     * SETUP VIRTUAL ENVIRONMENT
     * Initialize path redirection and module interception
     */
    async setupVirtualEnvironment(envId = 'default') {
        console.log(`🌐 Setting up Virtual Environment: ${envId}`);
        
        try {
            // Create environment directory
            const envPath = path.join(this.config.virtualEnvPath, envId);
            fs.mkdirSync(envPath, { recursive: true });
            
            // Initialize path mappings for this environment
            this.initializePathMappings(envId);
            
            // Setup module interception
            this.setupModuleInterception(envId);
            
            // Create environment configuration
            const envConfig = {
                id: envId,
                path: envPath,
                created: new Date().toISOString(),
                status: 'ACTIVE',
                mappings: this.config.pathMappings.get(envId)
            };
            
            this.activeEnvironments.set(envId, envConfig);
            
            console.log(`✅ Virtual Environment ready: ${envId}`);
            return envConfig;
            
        } catch (error) {
            console.error(`❌ Virtual Environment setup failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * INITIALIZE PATH MAPPINGS
     * Define how staging paths map to production
     */
    initializePathMappings(envId) {
        const mappings = new Map();
        
        // Core SBS_Automation dependencies
        mappings.set(
            './../../pages/common/base-page',
            path.resolve('../SBS_Automation/pages/common/base-page.js')
        );
        
        mappings.set(
            './../../support/By.js',
            path.resolve('../SBS_Automation/support/By.js')
        );
        
        mappings.set(
            './../../support/helpers.js',
            path.resolve('../SBS_Automation/support/helpers.js')
        );
        
        mappings.set(
            './../../hooks',
            path.resolve('../SBS_Automation/hooks')
        );
        
        // Dynamic mapping for any SBS_Automation reference
        mappings.set(
            /^\.\.\/\.\.\/(.+)$/,
            (match) => path.resolve(`../SBS_Automation/${match[1]}`)
        );
        
        this.config.pathMappings.set(envId, mappings);
        console.log(`🗺️ Path mappings initialized for ${envId}: ${mappings.size} mappings`);
    }

    /**
     * SETUP MODULE INTERCEPTION
     * Intercept require() calls and redirect to production
     */
    setupModuleInterception(envId) {
        console.log(`🔌 Setting up module interception for ${envId}`);
        
        const self = this;
        const mappings = this.config.pathMappings.get(envId);
        
        // Override Module.prototype.require
        Module.prototype.require = function(id) {
            const originalId = id;
            
            // Check if this require should be redirected
            const redirectedPath = self.resolveVirtualPath(id, mappings, this.filename);
            
            if (redirectedPath && redirectedPath !== id) {
                console.log(`🔀 Redirecting: ${originalId} → ${redirectedPath}`);
                id = redirectedPath;
            }
            
            // Use original require with potentially modified path
            try {
                return self.originalRequire.call(this, id);
            } catch (error) {
                // If redirected path fails, try original
                if (redirectedPath && redirectedPath !== originalId) {
                    console.log(`⚠️ Redirect failed, trying original: ${originalId}`);
                    return self.originalRequire.call(this, originalId);
                }
                throw error;
            }
        };
        
        this.setupComplete = true;
    }

    /**
     * RESOLVE VIRTUAL PATH
     * Determine if a require path should be redirected
     */
    resolveVirtualPath(requirePath, mappings, callerFilename) {
        // Only redirect if the calling file is in staging area
        if (!callerFilename || !callerFilename.includes('auto-coder/SBS_Automation')) {
            return requirePath; // No redirection needed
        }
        
        // Check direct mappings first
        if (mappings.has(requirePath)) {
            const mapping = mappings.get(requirePath);
            return typeof mapping === 'function' ? mapping() : mapping;
        }
        
        // Check regex mappings
        for (const [pattern, resolver] of mappings.entries()) {
            if (pattern instanceof RegExp) {
                const match = requirePath.match(pattern);
                if (match) {
                    return typeof resolver === 'function' ? resolver(match) : resolver;
                }
            }
        }
        
        return requirePath; // No mapping found
    }

    /**
     * EXECUTE IN VIRTUAL ENVIRONMENT
     * Run code with virtual environment active
     */
    async executeInVirtualEnv(envId, executionFunction) {
        console.log(`🚀 Executing in Virtual Environment: ${envId}`);
        
        const env = this.activeEnvironments.get(envId);
        if (!env) {
            throw new Error(`Virtual environment not found: ${envId}`);
        }
        
        // Set environment context
        process.env.AUTO_CODER_VIRTUAL_ENV = envId;
        process.env.AUTO_CODER_STAGING_ROOT = this.config.stagingRoot;
        
        try {
            const result = await executionFunction();
            console.log(`✅ Virtual environment execution completed: ${envId}`);
            return result;
        } catch (error) {
            console.error(`❌ Virtual environment execution failed: ${error.message}`);
            throw error;
        } finally {
            // Cleanup environment context
            delete process.env.AUTO_CODER_VIRTUAL_ENV;
            delete process.env.AUTO_CODER_STAGING_ROOT;
        }
    }

    /**
     * RUN CUCUMBER IN VIRTUAL ENVIRONMENT
     * Execute Cucumber tests with virtual environment
     */
    async runCucumberVirtual(envId, featureFile, options = {}) {
        console.log(`🥒 Running Cucumber in Virtual Environment: ${envId}`);
        
        return await this.executeInVirtualEnv(envId, async () => {
            const cucumberOptions = {
                features: featureFile,
                steps: 'auto-coder/SBS_Automation/steps/**/*.js',
                ...options
            };
            
            // Build cucumber command
            const cmd = [
                'npx', 'cucumber-js',
                cucumberOptions.features,
                '--require', cucumberOptions.steps,
                '--format', 'json:auto-coder/temp/cucumber-results.json',
                '--format', 'html:auto-coder/temp/cucumber-report.html'
            ];
            
            if (options.tags) {
                cmd.push('--tags', options.tags);
            }
            
            // Execute cucumber in virtual environment
            return new Promise((resolve, reject) => {
                const cucumber = spawn(cmd[0], cmd.slice(1), {
                    stdio: 'pipe',
                    env: {
                        ...process.env,
                        AUTO_CODER_VIRTUAL_ENV: envId,
                        NODE_PATH: path.resolve('node_modules')
                    }
                });
                
                let stdout = '';
                let stderr = '';
                
                cucumber.stdout.on('data', (data) => {
                    stdout += data.toString();
                });
                
                cucumber.stderr.on('data', (data) => {
                    stderr += data.toString();
                });
                
                cucumber.on('close', (code) => {
                    const results = {
                        exitCode: code,
                        stdout,
                        stderr,
                        success: code === 0
                    };
                    
                    if (code === 0) {
                        console.log(`✅ Cucumber execution successful in ${envId}`);
                        resolve(results);
                    } else {
                        console.log(`❌ Cucumber execution failed in ${envId}: Exit code ${code}`);
                        reject(new Error(`Cucumber failed with exit code: ${code}\n${stderr}`));
                    }
                });
            });
        });
    }

    /**
     * VIRTUAL ENVIRONMENT STATUS
     * Get status of all virtual environments
     */
    getEnvironmentStatus() {
        const status = {
            total: this.activeEnvironments.size,
            environments: [],
            moduleInterceptionActive: this.setupComplete
        };
        
        for (const [id, env] of this.activeEnvironments.entries()) {
            status.environments.push({
                id,
                status: env.status,
                created: env.created,
                mappingsCount: env.mappings.size
            });
        }
        
        return status;
    }

    /**
     * CLEANUP VIRTUAL ENVIRONMENT
     * Remove virtual environment and restore original state
     */
    async cleanupVirtualEnvironment(envId) {
        console.log(`🧹 Cleaning up Virtual Environment: ${envId}`);
        
        // Remove from active environments
        this.activeEnvironments.delete(envId);
        
        // Remove path mappings
        this.config.pathMappings.delete(envId);
        
        // Clean up temporary files
        const envPath = path.join(this.config.virtualEnvPath, envId);
        if (fs.existsSync(envPath)) {
            fs.rmSync(envPath, { recursive: true, force: true });
        }
        
        // Restore original require if no environments left
        if (this.activeEnvironments.size === 0) {
            Module.prototype.require = this.originalRequire;
            this.setupComplete = false;
            console.log(`🔌 Module interception restored`);
        }
        
        console.log(`✅ Virtual Environment cleanup complete: ${envId}`);
    }

    /**
     * CREATE STAGING TEST SCRIPT
     * Generate a test script that uses virtual environment
     */
    createVirtualTestScript(envId, featureFile, outputPath) {
        const script = `
/**
 * 🌐 AUTO-GENERATED VIRTUAL TEST SCRIPT
 * Environment: ${envId}
 * Feature: ${featureFile}
 */

const VirtualEnvironmentManager = require('./src/utils/virtual-environment-manager');

async function runVirtualTest() {
    const vem = new VirtualEnvironmentManager();
    
    try {
        console.log('🌐 Setting up virtual environment...');
        await vem.setupVirtualEnvironment('${envId}');
        
        console.log('🧪 Running tests in virtual environment...');
        const results = await vem.runCucumberVirtual('${envId}', '${featureFile}', {
            tags: '@Generated'
        });
        
        console.log('✅ Virtual test completed successfully');
        console.log('Results:', results);
        
        return results;
        
    } catch (error) {
        console.error('❌ Virtual test failed:', error.message);
        throw error;
        
    } finally {
        console.log('🧹 Cleaning up virtual environment...');
        await vem.cleanupVirtualEnvironment('${envId}');
    }
}

// Run if called directly
if (require.main === module) {
    runVirtualTest()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = runVirtualTest;
`;
        
        fs.writeFileSync(outputPath, script);
        console.log(`📝 Virtual test script created: ${outputPath}`);
    }
}

module.exports = VirtualEnvironmentManager;
