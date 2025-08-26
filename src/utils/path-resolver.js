/**
 * 🎯 INTELLIGENT PATH RESOLUTION SYSTEM
 * 
 * SOLVES: Reference architecture while enabling staging execution
 * APPROACH: Dynamic path resolution based on execution context
 * 
 * BENEFITS:
 * ✅ Maintains reference architecture purity
 * ✅ Enables staging execution without duplicates
 * ✅ Automatic deployment-ready path conversion
 * ✅ Zero maintenance overhead
 */

const fs = require('fs');
const path = require('path');

class PathResolver {
    constructor() {
        this.executionContext = this.detectExecutionContext();
        this.pathMappings = this.initializePathMappings();
    }

    /**
     * CORE INTELLIGENCE: Detect where we're running
     * auto-coder/SBS_Automation (staging) vs main SBS_Automation (production)
     */
    detectExecutionContext() {
        const cwd = process.cwd();
        
        if (cwd.includes('auto-coder')) {
            return 'STAGING';  // Running in auto-coder/SBS_Automation
        } else if (cwd.includes('SBS_Automation')) {
            return 'PRODUCTION';  // Running in main SBS_Automation
        }
        
        return 'UNKNOWN';
    }

    /**
     * SMART PATH MAPPING: Different paths for different contexts
     */
    initializePathMappings() {
        return {
            STAGING: {
                // When running in staging, use absolute paths to main SBS_Automation
                basePage: path.resolve(__dirname, '../../../SBS_Automation/pages/common/base-page.js'),
                byHelper: path.resolve(__dirname, '../../../SBS_Automation/support/By.js'),
                helpers: path.resolve(__dirname, '../../../SBS_Automation/support/helpers.js')
            },
            PRODUCTION: {
                // When deployed to production, use relative paths
                basePage: './common/base-page',
                byHelper: './../../support/By.js', 
                helpers: './../../support/helpers.js'
            }
        };
    }

    /**
     * INTELLIGENT REQUIRE PATH GENERATION
     * Returns correct path based on execution context
     */
    getRequirePath(dependency) {
        const mapping = this.pathMappings[this.executionContext];
        
        if (!mapping || !mapping[dependency]) {
            throw new Error(`Unknown dependency: ${dependency} in context: ${this.executionContext}`);
        }

        return mapping[dependency];
    }

    /**
     * GENERATE DEPLOYMENT-READY IMPORTS
     * Always generates production-ready import statements
     */
    generateImportStatement(dependency, variableName = null) {
        const productionPath = this.pathMappings.PRODUCTION[dependency];
        
        if (!productionPath) {
            throw new Error(`Unknown dependency for production: ${dependency}`);
        }

        const varName = variableName || this.getDefaultVariableName(dependency);
        return `const ${varName} = require('${productionPath}');`;
    }

    /**
     * RUNTIME PATH RESOLUTION
     * Used during execution in staging
     */
    requireDependency(dependency) {
        const requirePath = this.getRequirePath(dependency);
        return require(requirePath);
    }

    /**
     * DUAL-MODE FILE GENERATION
     * Generates files that work in both staging and production
     */
    generateDualModeFile(template, outputPath) {
        // Replace template placeholders with context-aware paths
        let content = template;
        
        // For file generation: Always use production paths
        content = content.replace(/{{BASE_PAGE_IMPORT}}/g, 
            this.generateImportStatement('basePage', 'BasePage'));
        content = content.replace(/{{BY_IMPORT}}/g, 
            this.generateImportStatement('byHelper', 'By'));
        content = content.replace(/{{HELPERS_IMPORT}}/g, 
            this.generateImportStatement('helpers'));

        // Add runtime context detection for execution
        const contextAwareContent = this.addContextAwareExecution(content);
        
        fs.writeFileSync(outputPath, contextAwareContent);
        console.log(`✅ Generated dual-mode file: ${outputPath}`);
    }

    /**
     * CONTEXT-AWARE EXECUTION WRAPPER
     * Adds runtime context detection to generated files
     */
    addContextAwareExecution(content) {
        const wrapper = `
// 🎯 AUTO-CODER INTELLIGENT PATH RESOLUTION
// This file works in both staging and production environments
const PathResolver = require('./path-resolver');
const pathResolver = new PathResolver();

// Context-aware dependency loading
let BasePage, By, helpers;
try {
    // Try production paths first (when deployed)
    BasePage = require('../../support/base-page.js');
    By = require('../../support/By.js');
} catch (error) {
    // Fallback to staging paths (during development)
    BasePage = pathResolver.requireDependency('basePage');
    By = pathResolver.requireDependency('byHelper');
}

${content}
`;
        return wrapper;
    }

    getDefaultVariableName(dependency) {
        const nameMap = {
            basePage: 'BasePage',
            byHelper: 'By',
            helpers: 'helpers'
        };
        return nameMap[dependency] || dependency;
    }

    /**
     * VALIDATION: Ensure all paths exist
     */
    validatePaths() {
        const context = this.executionContext;
        const mapping = this.pathMappings[context];
        
        const results = {
            context,
            valid: true,
            missing: []
        };

        for (const [dep, pathValue] of Object.entries(mapping)) {
            if (context === 'STAGING') {
                // For staging, check absolute paths
                if (!fs.existsSync(pathValue)) {
                    results.valid = false;
                    results.missing.push({ dependency: dep, path: pathValue });
                }
            }
            // For production, paths are relative and checked at runtime
        }

        return results;
    }
}

module.exports = PathResolver;
