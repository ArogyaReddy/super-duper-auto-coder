/**
 * Framework Manager - Manages and coordinates        this.adapters.set(frameworkName, adapter);
        // Adapter registered silently
    }fferent testing framework adapters
 * Provides unified interface for multi-framework test generation
 */

const PlaywrightAdapter = require('./playwright-adapter');
const JestAdapter = require('./jest-adapter');
const CucumberAdapter = require('./cucumber-adapter');
const MinimalCucumberAdapter = require('./minimal-cucumber-adapter');
const fs = require('fs-extra');
const path = require('path');

class FrameworkManager {
    constructor() {
        this.adapters = new Map();
        this.defaultFramework = 'playwright';
        this.initialized = false;
        
        // Framework detection patterns
        this.detectionPatterns = {
            playwright: ['playwright.config', '@playwright/test', 'tests/**/*.spec.ts'],
            jest: ['jest.config', '@jest/globals', '**/*.test.js', '**/*.spec.js'],
            cypress: ['cypress.config', 'cypress/**/*.cy.js'],
            cucumber: ['**/*.feature', '@cucumber/cucumber'],
            sbs: ['SBS_Automation/**/*.feature', 'features/**/*.feature']
        };
    }

    /**
     * Initialize framework manager with adapters
     */
    async initialize() {
        if (this.initialized) return;

        console.log('🔧 Initializing Framework Manager...');

        try {
            // Register available adapters
            this.registerAdapter('playwright', PlaywrightAdapter);
            this.registerAdapter('jest', JestAdapter);
            this.registerAdapter('cucumber', CucumberAdapter);
            this.registerAdapter('minimal', MinimalCucumberAdapter);
            this.registerAdapter('sbs', CucumberAdapter); // SBS uses Cucumber adapter with SBS patterns
            
            this.initialized = true;
            // Framework Manager initialized silently
        } catch (error) {
            console.error('❌ Failed to initialize Framework Manager:', error.message);
            throw error;
        }
    }

    /**
     * Register a framework adapter
     */
    registerAdapter(frameworkName, AdapterClass) {
        this.adapters.set(frameworkName, AdapterClass);
        console.log(`📝 Registered ${frameworkName} adapter`);
    }

    /**
     * Get available frameworks
     */
    getAvailableFrameworks() {
        return Array.from(this.adapters.keys());
    }

    /**
     * Auto-detect framework from project structure
     */
    async detectFramework(projectPath = process.cwd()) {
        console.log(`🔍 Auto-detecting framework in ${projectPath}...`);

        const detectedFrameworks = [];

        for (const [framework, patterns] of Object.entries(this.detectionPatterns)) {
            for (const pattern of patterns) {
                // Check for config files
                if (pattern.includes('config') || pattern.includes('package.json')) {
                    const configPath = path.join(projectPath, pattern);
                    if (await fs.pathExists(configPath)) {
                        detectedFrameworks.push({
                            framework,
                            confidence: 0.9,
                            evidence: `Found ${pattern}`
                        });
                        break;
                    }
                }

                // Check package.json dependencies
                const packageJsonPath = path.join(projectPath, 'package.json');
                if (await fs.pathExists(packageJsonPath)) {
                    const packageJson = await fs.readJson(packageJsonPath);
                    const allDeps = {
                        ...packageJson.dependencies,
                        ...packageJson.devDependencies
                    };

                    if (pattern.startsWith('@') && allDeps[pattern]) {
                        detectedFrameworks.push({
                            framework,
                            confidence: 0.8,
                            evidence: `Found dependency ${pattern}`
                        });
                    }
                }

                // Check for test file patterns
                if (pattern.includes('*')) {
                    // This would require glob checking - simplified for now
                    const testDirs = ['tests', 'test', '__tests__', 'cypress', 'spec'];
                    for (const dir of testDirs) {
                        const testDirPath = path.join(projectPath, dir);
                        if (await fs.pathExists(testDirPath)) {
                            if (pattern.includes(framework)) {
                                detectedFrameworks.push({
                                    framework,
                                    confidence: 0.6,
                                    evidence: `Found ${dir} directory`
                                });
                            }
                        }
                    }
                }
            }
        }

        // Sort by confidence and return the best match
        detectedFrameworks.sort((a, b) => b.confidence - a.confidence);

        if (detectedFrameworks.length > 0) {
            const detected = detectedFrameworks[0];
            console.log(`✅ Detected framework: ${detected.framework} (${Math.round(detected.confidence * 100)}% confidence)`);
            console.log(`   Evidence: ${detected.evidence}`);
            return detected.framework;
        }

        console.log(`⚠️ No framework detected, using default: ${this.defaultFramework}`);
        return this.defaultFramework;
    }

    /**
     * Create framework adapter instance
     */
    async createAdapter(frameworkName, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        const AdapterClass = this.adapters.get(frameworkName);
        if (!AdapterClass) {
            throw new Error(`Framework adapter not found: ${frameworkName}`);
        }

        const adapter = new AdapterClass(options);
        await adapter.initialize();

        return adapter;
    }

    /**
     * Generate artifacts using specified framework
     */
    async generateWithFramework(frameworkName, analysis, matches, templateContext, options = {}) {
        // Generating artifacts silently

        const adapter = await this.createAdapter(frameworkName, options);
        const artifacts = await adapter.generateArtifacts(analysis, matches, templateContext);

        // Add framework metadata
        artifacts.metadata.framework = frameworkName;
        artifacts.metadata.adapterCapabilities = adapter.getCapabilities();

        return artifacts;
    }

    /**
     * Generate artifacts with auto-detected framework
     */
    async generateWithAutoDetection(analysis, matches, templateContext, options = {}) {
        const detectedFramework = await this.detectFramework(options.projectPath);
        return this.generateWithFramework(detectedFramework, analysis, matches, templateContext, options);
    }

    /**
     * Generate artifacts for multiple frameworks
     */
    async generateMultiFramework(frameworks, analysis, matches, templateContext, options = {}) {
        console.log(`🎨 Generating artifacts for ${frameworks.length} frameworks...`);

        const results = {};

        for (const framework of frameworks) {
            try {
                console.log(`\n📝 Generating ${framework} artifacts...`);
                results[framework] = await this.generateWithFramework(
                    framework, 
                    analysis, 
                    matches, 
                    templateContext, 
                    { ...options, framework }
                );
            } catch (error) {
                console.error(`❌ Failed to generate ${framework} artifacts:`, error.message);
                results[framework] = {
                    success: false,
                    error: error.message
                };
            }
        }

        return {
            frameworks: frameworks,
            results: results,
            summary: this.generateMultiFrameworkSummary(results)
        };
    }

    /**
     * Generate summary for multi-framework generation
     */
    generateMultiFrameworkSummary(results) {
        const summary = {
            total: Object.keys(results).length,
            successful: 0,
            failed: 0,
            frameworks: {},
            totalFiles: 0
        };

        Object.entries(results).forEach(([framework, result]) => {
            if (result.success !== false) {
                summary.successful++;
                summary.frameworks[framework] = {
                    status: 'success',
                    fileCount: Object.keys(result.files || {}).length
                };
                summary.totalFiles += Object.keys(result.files || {}).length;
            } else {
                summary.failed++;
                summary.frameworks[framework] = {
                    status: 'failed',
                    error: result.error
                };
            }
        });

        return summary;
    }

    /**
     * Compare frameworks and suggest best fit
     */
    async suggestFramework(analysis, projectContext = {}) {
        const suggestions = [];

        // Analyze requirement characteristics
        const characteristics = this.analyzeRequirementCharacteristics(analysis);

        // Score each framework
        for (const framework of this.getAvailableFrameworks()) {
            const adapter = await this.createAdapter(framework);
            const capabilities = adapter.getCapabilities();
            
            const score = this.calculateFrameworkScore(characteristics, capabilities, projectContext);
            
            suggestions.push({
                framework,
                score,
                reasoning: this.generateFrameworkReasoning(characteristics, capabilities),
                capabilities
            });
        }

        // Sort by score
        suggestions.sort((a, b) => b.score - a.score);

        return {
            recommended: suggestions[0],
            alternatives: suggestions.slice(1),
            characteristics
        };
    }

    /**
     * Analyze requirement characteristics
     */
    analyzeRequirementCharacteristics(analysis) {
        return {
            testType: this.inferTestType(analysis),
            complexity: analysis.complexity,
            intent: analysis.intent,
            entities: analysis.entities.length,
            actions: analysis.actions.length,
            needsUI: this.needsUITesting(analysis),
            needsAPI: this.needsAPITesting(analysis),
            needsUnit: this.needsUnitTesting(analysis)
        };
    }

    /**
     * Infer test type from analysis
     */
    inferTestType(analysis) {
        if (analysis.intent === 'navigation' || analysis.entities.some(e => e.entity.includes('page'))) {
            return 'e2e';
        } else if (analysis.intent === 'testing' && analysis.entities.some(e => e.entity.includes('component'))) {
            return 'component';
        } else if (analysis.actions.some(a => a.action.includes('api') || a.action.includes('request'))) {
            return 'api';
        } else {
            return 'unit';
        }
    }

    /**
     * Check if requirement needs UI testing
     */
    needsUITesting(analysis) {
        const uiKeywords = ['click', 'button', 'form', 'page', 'navigate', 'select'];
        return analysis.actions.some(a => uiKeywords.includes(a.action)) ||
               analysis.entities.some(e => uiKeywords.some(keyword => e.entity.includes(keyword)));
    }

    /**
     * Check if requirement needs API testing
     */
    needsAPITesting(analysis) {
        const apiKeywords = ['api', 'request', 'response', 'endpoint', 'service'];
        return analysis.actions.some(a => apiKeywords.includes(a.action)) ||
               analysis.entities.some(e => apiKeywords.some(keyword => e.entity.includes(keyword)));
    }

    /**
     * Check if requirement needs unit testing
     */
    needsUnitTesting(analysis) {
        const unitKeywords = ['function', 'method', 'class', 'module', 'utility'];
        return analysis.entities.some(e => unitKeywords.some(keyword => e.entity.includes(keyword)));
    }

    /**
     * Calculate framework score based on characteristics
     */
    calculateFrameworkScore(characteristics, capabilities, projectContext) {
        let score = 0;

        // Base scoring
        if (characteristics.testType === 'e2e' && capabilities.framework === 'playwright') {
            score += 50;
        } else if (characteristics.testType === 'unit' && capabilities.framework === 'jest') {
            score += 50;
        } else if (characteristics.testType === 'component' && capabilities.framework === 'jest') {
            score += 45;
        }

        // UI testing bonus
        if (characteristics.needsUI && capabilities.framework === 'playwright') {
            score += 20;
        }

        // Complexity scoring
        if (characteristics.complexity === 'high' && capabilities.framework === 'playwright') {
            score += 15; // Playwright handles complex scenarios better
        } else if (characteristics.complexity === 'low' && capabilities.framework === 'jest') {
            score += 15; // Jest is simpler for basic tests
        }

        // Project context
        if (projectContext.hasExistingTests && projectContext.primaryFramework) {
            if (capabilities.framework === projectContext.primaryFramework) {
                score += 30; // Consistency bonus
            }
        }

        return Math.min(score, 100); // Cap at 100
    }

    /**
     * Generate reasoning for framework suggestion
     */
    generateFrameworkReasoning(characteristics, capabilities) {
        const reasons = [];

        if (characteristics.testType === 'e2e' && capabilities.framework === 'playwright') {
            reasons.push('Playwright excels at end-to-end testing with auto-waiting and multi-browser support');
        }

        if (characteristics.needsUI && capabilities.framework === 'playwright') {
            reasons.push('UI interactions are well-suited for Playwright\'s robust element handling');
        }

        if (characteristics.testType === 'unit' && capabilities.framework === 'jest') {
            reasons.push('Jest provides excellent unit testing capabilities with mocking and snapshots');
        }

        if (characteristics.complexity === 'high') {
            if (capabilities.framework === 'playwright') {
                reasons.push('Complex scenarios benefit from Playwright\'s debugging and tracing features');
            }
        }

        return reasons;
    }

    /**
     * Validate framework compatibility
     */
    async validateFrameworkCompatibility(frameworkName, projectPath = process.cwd()) {
        const issues = [];
        const adapter = await this.createAdapter(frameworkName);
        const capabilities = adapter.getCapabilities();

        // Check if framework is already installed
        const packageJsonPath = path.join(projectPath, 'package.json');
        if (await fs.pathExists(packageJsonPath)) {
            const packageJson = await fs.readJson(packageJsonPath);
            const allDeps = {
                ...packageJson.dependencies,
                ...packageJson.devDependencies
            };

            const requiredPackages = this.getRequiredPackages(frameworkName);
            const missingPackages = requiredPackages.filter(pkg => !allDeps[pkg]);

            if (missingPackages.length > 0) {
                issues.push({
                    type: 'missing-dependencies',
                    packages: missingPackages,
                    severity: 'warning'
                });
            }
        }

        // Check Node.js version compatibility
        const nodeVersion = process.version;
        const minNodeVersion = this.getMinNodeVersion(frameworkName);
        if (this.compareVersions(nodeVersion, minNodeVersion) < 0) {
            issues.push({
                type: 'node-version',
                current: nodeVersion,
                required: minNodeVersion,
                severity: 'error'
            });
        }

        return {
            compatible: issues.filter(i => i.severity === 'error').length === 0,
            issues,
            capabilities
        };
    }

    /**
     * Get required packages for framework
     */
    getRequiredPackages(frameworkName) {
        const packages = {
            playwright: ['@playwright/test'],
            jest: ['jest', '@jest/globals'],
            cypress: ['cypress'],
            cucumber: ['@cucumber/cucumber']
        };

        return packages[frameworkName] || [];
    }

    /**
     * Get minimum Node.js version for framework
     */
    getMinNodeVersion(frameworkName) {
        const versions = {
            playwright: 'v16.0.0',
            jest: 'v14.0.0',
            cypress: 'v16.0.0',
            cucumber: 'v14.0.0'
        };

        return versions[frameworkName] || 'v14.0.0';
    }

    /**
     * Compare version strings
     */
    compareVersions(version1, version2) {
        const v1 = version1.replace('v', '').split('.').map(Number);
        const v2 = version2.replace('v', '').split('.').map(Number);

        for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
            const num1 = v1[i] || 0;
            const num2 = v2[i] || 0;

            if (num1 > num2) return 1;
            if (num1 < num2) return -1;
        }

        return 0;
    }

    /**
     * Get framework manager status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            availableFrameworks: this.getAvailableFrameworks(),
            defaultFramework: this.defaultFramework,
            adapterCount: this.adapters.size
        };
    }
}

module.exports = FrameworkManager;
