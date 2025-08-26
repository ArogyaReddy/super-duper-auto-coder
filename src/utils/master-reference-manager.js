/**
 * 🎯 INTEGRATED MASTER SOLUTION
 * 
 * COMBINES: All 4 solutions into one intelligent system
 * APPROACH: Adaptive architecture based on context and preferences
 * 
 * BENEFITS:
 * ✅ Maximum flexibility - choose best solution per situation
 * ✅ Fallback mechanisms - if one fails, try another
 * ✅ User preference support - configure preferred approach
 * ✅ Comprehensive monitoring and reporting
 */

const fs = require('fs');
const path = require('path');
const PathResolver = require('./path-resolver');
const AutoDeployFramework = require('./auto-deploy-framework');
const SymlinkReferenceSystem = require('./symlink-reference-system');
const VirtualEnvironmentManager = require('./virtual-environment-manager');

class MasterReferenceManager {
    constructor() {
        this.config = {
            preferredSolution: 'auto', // auto, path-resolver, auto-deploy, symlink, virtual
            fallbackOrder: ['path-resolver', 'auto-deploy', 'symlink', 'virtual'],
            enableMonitoring: true,
            retryAttempts: 3
        };
        
        this.solutions = {
            'path-resolver': new PathResolver(),
            'auto-deploy': new AutoDeployFramework(),
            'symlink': new SymlinkReferenceSystem(),
            'virtual': new VirtualEnvironmentManager()
        };
        
        this.currentSolution = null;
        this.metrics = {
            solutionUsage: new Map(),
            successRates: new Map(),
            performanceData: new Map()
        };
    }

    /**
     * INTELLIGENT SOLUTION SELECTION
     * Choose the best solution based on context
     */
    async selectOptimalSolution(context = {}) {
        console.log(`🎯 Selecting optimal solution...`);
        
        const factors = {
            platform: process.platform,
            hasAdminRights: await this.checkAdminRights(),
            stagingArtifacts: context.artifactCount || 0,
            performanceMode: context.performanceMode || 'balanced',
            userPreference: this.config.preferredSolution
        };
        
        console.log(`📊 Context factors:`, factors);
        
        if (factors.userPreference !== 'auto') {
            console.log(`👤 Using user preference: ${factors.userPreference}`);
            return factors.userPreference;
        }
        
        // Intelligent selection logic
        if (factors.platform === 'win32' && !factors.hasAdminRights) {
            console.log(`🪟 Windows without admin rights - using path-resolver`);
            return 'path-resolver';
        }
        
        if (factors.stagingArtifacts > 10) {
            console.log(`📦 Large artifact count - using virtual environment`);
            return 'virtual';
        }
        
        if (factors.performanceMode === 'fast') {
            console.log(`⚡ Fast mode - using symlink system`);
            return 'symlink';
        }
        
        if (factors.performanceMode === 'safe') {
            console.log(`🛡️ Safe mode - using auto-deploy`);
            return 'auto-deploy';
        }
        
        // Default to path-resolver for balanced approach
        console.log(`⚖️ Balanced mode - using path-resolver`);
        return 'path-resolver';
    }

    /**
     * SETUP REFERENCE SYSTEM
     * Initialize the selected solution
     */
    async setupReferenceSystem(context = {}) {
        console.log(`🚀 Setting up Master Reference System...`);
        const startTime = Date.now();
        
        try {
            // Select optimal solution
            const selectedSolution = await this.selectOptimalSolution(context);
            this.currentSolution = selectedSolution;
            
            console.log(`🎯 Selected solution: ${selectedSolution}`);
            
            // Setup with fallback mechanism
            const result = await this.setupWithFallback(selectedSolution, context);
            
            // Record metrics
            const duration = Date.now() - startTime;
            this.recordMetrics(selectedSolution, true, duration);
            
            console.log(`✅ Reference system ready! Solution: ${selectedSolution} (${duration}ms)`);
            return result;
            
        } catch (error) {
            const duration = Date.now() - startTime;
            this.recordMetrics(this.currentSolution, false, duration);
            
            console.error(`❌ Reference system setup failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * SETUP WITH FALLBACK
     * Try selected solution, fallback if it fails
     */
    async setupWithFallback(primarySolution, context) {
        const attemptOrder = [primarySolution, ...this.config.fallbackOrder.filter(s => s !== primarySolution)];
        
        for (let i = 0; i < attemptOrder.length; i++) {
            const solution = attemptOrder[i];
            
            try {
                console.log(`🔄 Attempting solution: ${solution} (attempt ${i + 1})`);
                
                const result = await this.setupSolution(solution, context);
                
                if (result.success) {
                    this.currentSolution = solution;
                    
                    if (i > 0) {
                        console.log(`⚠️ Primary solution failed, using fallback: ${solution}`);
                    }
                    
                    return {
                        success: true,
                        solution,
                        isPrimary: i === 0,
                        result
                    };
                }
                
            } catch (error) {
                console.log(`❌ Solution ${solution} failed: ${error.message}`);
                
                if (i === attemptOrder.length - 1) {
                    throw new Error(`All solutions failed. Last error: ${error.message}`);
                }
            }
        }
    }

    /**
     * SETUP INDIVIDUAL SOLUTION
     * Initialize a specific solution
     */
    async setupSolution(solutionName, context) {
        const solution = this.solutions[solutionName];
        
        if (!solution) {
            throw new Error(`Unknown solution: ${solutionName}`);
        }
        
        switch (solutionName) {
            case 'path-resolver':
                return await this.setupPathResolver(solution, context);
                
            case 'auto-deploy':
                return await this.setupAutoDeploy(solution, context);
                
            case 'symlink':
                return await this.setupSymlinkSystem(solution, context);
                
            case 'virtual':
                return await this.setupVirtualEnvironment(solution, context);
                
            default:
                throw new Error(`Setup not implemented for: ${solutionName}`);
        }
    }

    /**
     * SETUP PATH RESOLVER
     */
    async setupPathResolver(pathResolver, context) {
        const validation = pathResolver.validatePaths();
        
        if (!validation.valid) {
            throw new Error(`Path validation failed: ${validation.missing.join(', ')}`);
        }
        
        return {
            success: true,
            type: 'path-resolver',
            details: validation
        };
    }

    /**
     * SETUP AUTO DEPLOY
     */
    async setupAutoDeploy(autoDeploy, context) {
        // Auto-deploy doesn't need setup, it's used during generation
        return {
            success: true,
            type: 'auto-deploy',
            details: 'Ready for deployment-based testing'
        };
    }

    /**
     * SETUP SYMLINK SYSTEM
     */
    async setupSymlinkSystem(symlinkSystem, context) {
        const result = await symlinkSystem.setupReferenceSystem();
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        return {
            success: true,
            type: 'symlink',
            details: result
        };
    }

    /**
     * SETUP VIRTUAL ENVIRONMENT
     */
    async setupVirtualEnvironment(virtualEnvManager, context) {
        const envId = context.environmentId || 'master-ref-env';
        const result = await virtualEnvManager.setupVirtualEnvironment(envId);
        
        return {
            success: true,
            type: 'virtual',
            details: result
        };
    }

    /**
     * EXECUTE TESTS
     * Run tests using the active solution
     */
    async executeTests(artifacts, options = {}) {
        console.log(`🧪 Executing tests with solution: ${this.currentSolution}`);
        
        if (!this.currentSolution) {
            throw new Error('No reference system active. Call setupReferenceSystem() first.');
        }
        
        const solution = this.solutions[this.currentSolution];
        
        switch (this.currentSolution) {
            case 'path-resolver':
                return await this.executeWithPathResolver(artifacts, options);
                
            case 'auto-deploy':
                return await solution.deployAndTest(artifacts);
                
            case 'symlink':
                return await this.executeWithSymlinks(artifacts, options);
                
            case 'virtual':
                return await this.executeWithVirtual(artifacts, options);
                
            default:
                throw new Error(`Execution not implemented for: ${this.currentSolution}`);
        }
    }

    /**
     * EXECUTE WITH PATH RESOLVER
     */
    async executeWithPathResolver(artifacts, options) {
        // Path resolver enables direct execution in staging
        const results = [];
        
        for (const artifact of artifacts) {
            if (artifact.type === 'feature') {
                try {
                    // Execute using standard cucumber but with intelligent paths
                    const cmd = `npx cucumber-js ${artifact.path} --require auto-coder/SBS_Automation/steps/**/*.js`;
                    const result = require('child_process').execSync(cmd, { encoding: 'utf8' });
                    
                    results.push({
                        artifact: artifact.path,
                        success: true,
                        output: result
                    });
                    
                } catch (error) {
                    results.push({
                        artifact: artifact.path,
                        success: false,
                        error: error.message
                    });
                }
            }
        }
        
        return {
            success: results.every(r => r.success),
            results
        };
    }

    /**
     * EXECUTE WITH SYMLINKS
     */
    async executeWithSymlinks(artifacts, options) {
        // First ensure symlinks are healthy
        const health = this.solutions.symlink.healthCheck();
        
        if (health.status !== 'HEALTHY') {
            await this.solutions.symlink.autoRepair();
        }
        
        // Execute normally - symlinks handle the references
        return await this.executeWithPathResolver(artifacts, options);
    }

    /**
     * EXECUTE WITH VIRTUAL ENVIRONMENT
     */
    async executeWithVirtual(artifacts, options) {
        const envId = options.environmentId || 'test-execution';
        const virtualEnv = this.solutions.virtual;
        
        const results = [];
        
        for (const artifact of artifacts) {
            if (artifact.type === 'feature') {
                try {
                    const result = await virtualEnv.runCucumberVirtual(envId, artifact.path, {
                        tags: options.tags || '@Generated'
                    });
                    
                    results.push({
                        artifact: artifact.path,
                        success: result.success,
                        output: result.stdout
                    });
                    
                } catch (error) {
                    results.push({
                        artifact: artifact.path,
                        success: false,
                        error: error.message
                    });
                }
            }
        }
        
        return {
            success: results.every(r => r.success),
            results
        };
    }

    /**
     * HEALTH CHECK
     * Verify the active solution is working
     */
    async healthCheck() {
        console.log(`🏥 Running health check for: ${this.currentSolution}`);
        
        if (!this.currentSolution) {
            return {
                status: 'INACTIVE',
                message: 'No reference system active'
            };
        }
        
        const solution = this.solutions[this.currentSolution];
        
        switch (this.currentSolution) {
            case 'path-resolver':
                const validation = solution.validatePaths();
                return {
                    status: validation.valid ? 'HEALTHY' : 'UNHEALTHY',
                    details: validation
                };
                
            case 'symlink':
                return solution.healthCheck();
                
            case 'virtual':
                return solution.getEnvironmentStatus();
                
            case 'auto-deploy':
                return {
                    status: 'HEALTHY',
                    message: 'Auto-deploy is stateless and always ready'
                };
                
            default:
                return {
                    status: 'UNKNOWN',
                    message: `Health check not implemented for: ${this.currentSolution}`
                };
        }
    }

    /**
     * RECORD METRICS
     */
    recordMetrics(solution, success, duration) {
        if (!this.config.enableMonitoring) return;
        
        // Update usage count
        const currentUsage = this.metrics.solutionUsage.get(solution) || 0;
        this.metrics.solutionUsage.set(solution, currentUsage + 1);
        
        // Update success rate
        const currentStats = this.metrics.successRates.get(solution) || { total: 0, successful: 0 };
        currentStats.total++;
        if (success) currentStats.successful++;
        this.metrics.successRates.set(solution, currentStats);
        
        // Update performance data
        const currentPerf = this.metrics.performanceData.get(solution) || { totalTime: 0, executions: 0 };
        currentPerf.totalTime += duration;
        currentPerf.executions++;
        this.metrics.performanceData.set(solution, currentPerf);
    }

    /**
     * GET METRICS REPORT
     */
    getMetricsReport() {
        const report = {
            currentSolution: this.currentSolution,
            usage: {},
            successRates: {},
            performance: {},
            recommendations: []
        };
        
        // Usage statistics
        for (const [solution, count] of this.metrics.solutionUsage.entries()) {
            report.usage[solution] = count;
        }
        
        // Success rates
        for (const [solution, stats] of this.metrics.successRates.entries()) {
            report.successRates[solution] = {
                rate: (stats.successful / stats.total * 100).toFixed(1) + '%',
                successful: stats.successful,
                total: stats.total
            };
        }
        
        // Performance data
        for (const [solution, perf] of this.metrics.performanceData.entries()) {
            report.performance[solution] = {
                avgTime: Math.round(perf.totalTime / perf.executions),
                totalTime: perf.totalTime,
                executions: perf.executions
            };
        }
        
        // Generate recommendations
        report.recommendations = this.generateRecommendations();
        
        return report;
    }

    /**
     * GENERATE RECOMMENDATIONS
     */
    generateRecommendations() {
        const recommendations = [];
        
        // Analyze success rates
        for (const [solution, stats] of this.metrics.successRates.entries()) {
            const successRate = stats.successful / stats.total;
            
            if (successRate < 0.8 && stats.total > 3) {
                recommendations.push({
                    type: 'reliability',
                    message: `Solution '${solution}' has low success rate (${(successRate * 100).toFixed(1)}%). Consider using fallback.`,
                    severity: 'warning'
                });
            }
        }
        
        // Analyze performance
        let fastestSolution = null;
        let fastestTime = Infinity;
        
        for (const [solution, perf] of this.metrics.performanceData.entries()) {
            const avgTime = perf.totalTime / perf.executions;
            if (avgTime < fastestTime) {
                fastestTime = avgTime;
                fastestSolution = solution;
            }
        }
        
        if (fastestSolution && this.currentSolution !== fastestSolution) {
            recommendations.push({
                type: 'performance',
                message: `Solution '${fastestSolution}' is faster than current '${this.currentSolution}' (${Math.round(fastestTime)}ms vs ${Math.round(this.metrics.performanceData.get(this.currentSolution).totalTime / this.metrics.performanceData.get(this.currentSolution).executions)}ms)`,
                severity: 'info'
            });
        }
        
        return recommendations;
    }

    /**
     * CHECK ADMIN RIGHTS
     */
    async checkAdminRights() {
        if (process.platform !== 'win32') {
            return true; // Unix systems handle symlinks without admin
        }
        
        try {
            require('child_process').execSync('net session', { stdio: 'ignore' });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * CLEANUP
     */
    async cleanup() {
        console.log(`🧹 Cleaning up Master Reference System...`);
        
        if (this.currentSolution) {
            const solution = this.solutions[this.currentSolution];
            
            switch (this.currentSolution) {
                case 'symlink':
                    await solution.cleanupSymlinks();
                    break;
                    
                case 'virtual':
                    // Cleanup all virtual environments
                    const status = solution.getEnvironmentStatus();
                    for (const env of status.environments) {
                        await solution.cleanupVirtualEnvironment(env.id);
                    }
                    break;
            }
        }
        
        this.currentSolution = null;
        console.log(`✅ Cleanup complete`);
    }
}

module.exports = MasterReferenceManager;
