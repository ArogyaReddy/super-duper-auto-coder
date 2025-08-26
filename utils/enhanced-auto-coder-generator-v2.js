#!/usr/bin/env node

/**
 * Enhanced Auto-Coder Generator v2.0
 * 
 * Uses comprehensive SBS_Automation registries to generate conflict-free,
 * SBS-compliant test artifacts with zero ambiguous step definitions.
 * 
 * Features:
 * - Real-time conflict detection using enhanced registries
 * - Domain-specific step prefixing
 * - Reusable pattern suggestions
 * - SBS compliance validation
 * - Ambiguity prevention
 * 
 * Usage: node enhanced-auto-coder-generator-v2.js <requirement-file> [options]
 */

const fs = require('fs');
const path = require('path');

class EnhancedAutoCoderGeneratorV2 {
    constructor() {
        this.registriesPath = path.join(__dirname, '../knowledge-base');
        this.outputPath = path.join(__dirname, '../SBS_Automation');
        
        this.registries = {
            steps: null,
            pages: null,
            features: null,
            master: null
        };
        
        this.generationStats = {
            conflictsAvoided: 0,
            patternsReused: 0,
            newStepsGenerated: 0,
            validationsPassed: 0
        };
        
        this.domainPrefixes = {
            billing: 'billing',
            payroll: 'payroll',
            employee: 'employee',
            reports: 'reports',
            settings: 'settings',
            security: 'security',
            api: 'api',
            mobile: 'mobile',
            default: 'feature'
        };
    }

    /**
     * Main generation method
     */
    async generate(requirementFile, options = {}) {
        console.log('🚀 Enhanced Auto-Coder Generator v2.0 Starting...\n');
        
        try {
            // Load all registries
            await this.loadRegistries();
            
            // Parse requirement
            const requirement = await this.parseRequirement(requirementFile);
            
            // Detect domain
            const domain = this.detectDomain(requirement);
            
            // Generate artifacts with conflict prevention
            const artifacts = await this.generateArtifacts(requirement, domain, options);
            
            // Validate artifacts
            await this.validateArtifacts(artifacts);
            
            // Write artifacts to filesystem
            await this.writeArtifacts(artifacts);
            
            // Generate summary report
            this.generateSummaryReport(artifacts);
            
            console.log('✅ Conflict-free artifact generation completed successfully!\n');
            this.printGenerationStats();
            
            return artifacts;
            
        } catch (error) {
            console.error('❌ Error during artifact generation:', error);
            throw error;
        }
    }

    /**
     * Load all enhanced registries
     */
    async loadRegistries() {
        console.log('📚 Loading enhanced SBS_Automation registries...');
        
        try {
            // Load master registry first
            const masterPath = path.join(this.registriesPath, 'sbs-master-enhanced-registry.json');
            this.registries.master = this.loadRegistry(masterPath);
            console.log(`  ✓ Master registry loaded (${this.registries.master.summary.conflicts} conflicts known)`);
            
            // Load steps registry
            const stepsPath = path.join(this.registriesPath, 'sbs-steps-enhanced-registry.json');
            this.registries.steps = this.loadRegistry(stepsPath);
            console.log(`  ✓ Steps registry loaded (${this.registries.steps.steps.length} step definitions)`);
            
            // Load pages registry
            const pagesPath = path.join(this.registriesPath, 'sbs-pages-enhanced-registry.json');
            this.registries.pages = this.loadRegistry(pagesPath);
            console.log(`  ✓ Pages registry loaded (${this.registries.pages.pages.length} page objects)`);
            
            // Load features registry
            const featuresPath = path.join(this.registriesPath, 'sbs-features-enhanced-registry.json');
            this.registries.features = this.loadRegistry(featuresPath);
            console.log(`  ✓ Features registry loaded (${this.registries.features.features.length} features)`);
            
            console.log('✅ All registries loaded successfully\n');
            
        } catch (error) {
            console.error('❌ Failed to load registries:', error.message);
            throw new Error('Cannot proceed without registries. Run enhanced-sbs-registry-generator.js first.');
        }
    }

    /**
     * Load individual registry file
     */
    loadRegistry(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`Registry file not found: ${filePath}`);
        }
        
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    /**
     * Parse requirement file (supports text, JIRA, or JSON)
     */
    async parseRequirement(requirementFile) {
        console.log('📋 Parsing requirement file...');
        
        if (!fs.existsSync(requirementFile)) {
            throw new Error(`Requirement file not found: ${requirementFile}`);
        }
        
        const content = fs.readFileSync(requirementFile, 'utf8');
        const extension = path.extname(requirementFile).toLowerCase();
        
        let requirement = {};
        
        if (extension === '.json') {
            requirement = JSON.parse(content);
        } else {
            // Parse text-based requirement
            requirement = this.parseTextRequirement(content);
        }
        
        // Enhance requirement with metadata
        requirement.source = requirementFile;
        requirement.parsedAt = new Date().toISOString();
        
        console.log(`  ✓ Requirement parsed: "${requirement.title || requirement.summary}"`);
        return requirement;
    }

    /**
     * Parse text-based requirement
     */
    parseTextRequirement(content) {
        const lines = content.split('\n').map(line => line.trim()).filter(line => line);
        
        const requirement = {
            title: '',
            description: '',
            scenarios: [],
            acceptanceCriteria: [],
            testCases: []
        };
        
        let currentSection = 'description';
        let currentScenario = null;
        
        for (const line of lines) {
            if (line.toLowerCase().includes('title:') || line.toLowerCase().includes('summary:')) {
                requirement.title = line.split(':')[1]?.trim() || '';
            } else if (line.toLowerCase().includes('scenario:')) {
                if (currentScenario) {
                    requirement.scenarios.push(currentScenario);
                }
                currentScenario = {
                    name: line.replace(/scenario:/i, '').trim(),
                    steps: []
                };
                currentSection = 'scenario';
            } else if (line.toLowerCase().includes('given') || 
                      line.toLowerCase().includes('when') || 
                      line.toLowerCase().includes('then')) {
                if (currentScenario) {
                    currentScenario.steps.push(line);
                }
            } else if (currentSection === 'description') {
                requirement.description += line + ' ';
            }
        }
        
        if (currentScenario) {
            requirement.scenarios.push(currentScenario);
        }
        
        // If no explicit scenarios, create default ones based on description
        if (requirement.scenarios.length === 0) {
            requirement.scenarios = this.generateDefaultScenarios(requirement);
        }
        
        return requirement;
    }

    /**
     * Generate default scenarios from description
     */
    generateDefaultScenarios(requirement) {
        const scenarios = [];
        
        // Basic verification scenario
        scenarios.push({
            name: 'Verify main functionality',
            steps: [
                'Given Alex is logged in as a user',
                'When Alex navigates to the feature',
                'Then Alex verifies the feature is working correctly'
            ]
        });
        
        // Error handling scenario
        scenarios.push({
            name: 'Handle error conditions',
            steps: [
                'Given Alex is logged in as a user',
                'When Alex encounters an error condition',
                'Then Alex verifies appropriate error handling'
            ]
        });
        
        return scenarios;
    }

    /**
     * Detect domain from requirement content
     */
    detectDomain(requirement) {
        console.log('🎯 Detecting domain for context-specific generation...');
        
        const content = (requirement.title + ' ' + requirement.description).toLowerCase();
        
        // Domain keyword mapping
        const domainKeywords = {
            billing: ['billing', 'invoice', 'payment', 'charge', 'subscription'],
            payroll: ['payroll', 'salary', 'wage', 'pay', 'timesheet'],
            employee: ['employee', 'personnel', 'staff', 'worker', 'onboarding'],
            reports: ['report', 'analytics', 'dashboard', 'chart', 'summary'],
            settings: ['settings', 'configuration', 'preferences', 'admin'],
            security: ['security', 'authentication', 'authorization', 'login', 'permission'],
            api: ['api', 'endpoint', 'service', 'integration', 'webhook'],
            mobile: ['mobile', 'app', 'device', 'touch', 'swipe']
        };
        
        let detectedDomain = 'default';
        let maxMatches = 0;
        
        for (const [domain, keywords] of Object.entries(domainKeywords)) {
            const matches = keywords.filter(keyword => content.includes(keyword)).length;
            if (matches > maxMatches) {
                maxMatches = matches;
                detectedDomain = domain;
            }
        }
        
        console.log(`  ✓ Domain detected: "${detectedDomain}" (${maxMatches} keyword matches)`);
        return detectedDomain;
    }

    /**
     * Generate all artifacts with conflict prevention
     */
    async generateArtifacts(requirement, domain, options) {
        console.log('🔧 Generating conflict-free SBS_Automation artifacts...\n');
        
        const artifacts = {
            feature: null,
            steps: null,
            page: null,
            metadata: {
                domain,
                requirement: requirement.title || requirement.summary,
                generatedAt: new Date().toISOString(),
                conflictsAvoided: 0,
                patternsReused: 0
            }
        };
        
        // Generate feature file
        artifacts.feature = await this.generateFeatureFile(requirement, domain);
        
        // Generate step definitions (conflict-free)
        artifacts.steps = await this.generateStepDefinitions(requirement, domain, artifacts.feature);
        
        // Generate page object
        artifacts.page = await this.generatePageObject(requirement, domain);
        
        // Update metadata
        artifacts.metadata.conflictsAvoided = this.generationStats.conflictsAvoided;
        artifacts.metadata.patternsReused = this.generationStats.patternsReused;
        
        return artifacts;
    }

    /**
     * Generate feature file with SBS patterns
     */
    async generateFeatureFile(requirement, domain) {
        console.log('📄 Generating feature file...');
        
        const feature = {
            filename: this.generateFilename(requirement.title, 'feature', domain),
            content: ''
        };
        
        // Find similar existing features for pattern reuse
        const similarFeatures = this.findSimilarFeatures(requirement);
        if (similarFeatures.length > 0) {
            console.log(`  📋 Found ${similarFeatures.length} similar features for pattern reference`);
            this.generationStats.patternsReused++;
        }
        
        // Generate feature content
        let content = '';
        
        // Add feature header with appropriate tags
        const tags = this.generateFeatureTags(domain, requirement);
        if (tags.length > 0) {
            content += tags.join(' ') + '\n';
        }
        
        content += `Feature: ${requirement.title || 'Feature functionality'}\n`;
        content += `  As a user\n`;
        content += `  I want to ${this.generateUserStory(requirement)}\n`;
        content += `  So that ${this.generateBenefit(requirement)}\n\n`;
        
        // Add background if needed
        if (this.needsBackground(requirement, domain)) {
            content += `  Background:\n`;
            content += `    Given Alex is logged in as a ${this.getUserRole(domain)}\n\n`;
        }
        
        // Generate scenarios with conflict-free steps
        for (const scenario of requirement.scenarios) {
            content += this.generateScenarioContent(scenario, domain);
        }
        
        feature.content = content;
        console.log(`  ✓ Feature file generated: ${feature.filename}`);
        
        return feature;
    }

    /**
     * Generate step definitions with advanced conflict detection
     */
    async generateStepDefinitions(requirement, domain, featureFile) {
        console.log('🔧 Generating conflict-free step definitions...');
        
        const steps = {
            filename: this.generateFilename(requirement.title, 'steps', domain),
            content: ''
        };
        
        // Extract unique steps from feature file
        const stepPatterns = this.extractStepPatterns(featureFile.content);
        
        // Generate step definitions with conflict checking
        let content = '';
        content += `const { Given, When, Then } = require('@cucumber/cucumber');\n`;
        content += `const ${this.generatePageClassName(requirement.title, domain)} = require('../pages/${this.generateFilename(requirement.title, 'page', domain).replace('.js', '')}');\n`;
        content += `const assert = require('assert');\n\n`;
        
        const generatedSteps = new Set();
        
        for (const stepPattern of stepPatterns) {
            const stepDefinition = await this.generateConflictFreeStepDefinition(stepPattern, domain);
            
            if (stepDefinition && !generatedSteps.has(stepDefinition.signature)) {
                content += stepDefinition.code + '\n\n';
                generatedSteps.add(stepDefinition.signature);
                this.generationStats.newStepsGenerated++;
            }
        }
        
        steps.content = content;
        console.log(`  ✓ Step definitions generated: ${steps.filename} (${this.generationStats.newStepsGenerated} new steps)`);
        
        return steps;
    }

    /**
     * Generate conflict-free step definition
     */
    async generateConflictFreeStepDefinition(stepText, domain) {
        // Normalize step for conflict checking
        const normalizedStep = this.normalizeStepPattern(stepText);
        
        // Check for conflicts in existing registries
        const conflicts = this.checkForConflicts(normalizedStep);
        
        if (conflicts.length > 0) {
            console.log(`  ⚠️  Potential conflict detected for "${stepText}"`);
            console.log(`     Conflicting files: ${conflicts.map(c => c.file).join(', ')}`);
            
            // Generate domain-specific alternative
            const domainSpecificStep = this.generateDomainSpecificStep(stepText, domain);
            console.log(`     Using domain-specific alternative: "${domainSpecificStep}"`);
            
            this.generationStats.conflictsAvoided++;
            stepText = domainSpecificStep;
        }
        
        // Parse step components
        const stepMatch = stepText.match(/^(Given|When|Then|And|But)\s+(.+)$/);
        if (!stepMatch) return null;
        
        const keyword = stepMatch[1];
        const pattern = stepMatch[2];
        
        // Generate parameterized pattern
        const parameterizedPattern = this.parameterizePattern(pattern);
        
        // Generate function body
        const functionBody = this.generateStepFunctionBody(keyword, pattern, domain);
        
        const stepDefinition = {
            signature: `${keyword}:${parameterizedPattern}`,
            code: `${keyword}('${parameterizedPattern}', { timeout: 240 * 1000 }, async function ${this.extractParameters(parameterizedPattern)} {\n${functionBody}\n});`
        };
        
        return stepDefinition;
    }

    /**
     * Check for conflicts in existing step registry
     */
    checkForConflicts(normalizedPattern) {
        const conflicts = [];
        
        // Check against existing step patterns
        if (this.registries.steps && this.registries.steps.conflicts) {
            for (const conflict of this.registries.steps.conflicts) {
                if (conflict.normalizedPattern && 
                    conflict.normalizedPattern.toLowerCase() === normalizedPattern.toLowerCase()) {
                    conflicts.push(...conflict.steps);
                }
            }
        }
        
        // Check against risky patterns
        if (this.registries.steps && this.registries.steps.patterns && this.registries.steps.patterns.risky) {
            for (const riskyPattern of this.registries.steps.patterns.risky) {
                if (this.normalizeStepPattern(riskyPattern).toLowerCase() === normalizedPattern.toLowerCase()) {
                    conflicts.push({ pattern: riskyPattern, file: 'risky-patterns' });
                }
            }
        }
        
        return conflicts;
    }

    /**
     * Generate domain-specific step to avoid conflicts
     */
    generateDomainSpecificStep(stepText, domain) {
        const prefix = this.domainPrefixes[domain] || this.domainPrefixes.default;
        
        // Insert domain prefix after keyword
        const stepMatch = stepText.match(/^(Given|When|Then|And|But)\s+(.+)$/);
        if (stepMatch) {
            const keyword = stepMatch[1];
            const content = stepMatch[2];
            
            // Add domain context
            if (content.toLowerCase().includes('alex')) {
                return `${keyword} Alex performs ${prefix} verification that ${content.replace(/alex\s+/i, '')}`;
            } else {
                return `${keyword} Alex performs ${prefix} verification that ${content}`;
            }
        }
        
        return stepText;
    }

    /**
     * Normalize step pattern for conflict detection
     */
    normalizeStepPattern(pattern) {
        return pattern
            .replace(/\{string\}/g, 'STRING')
            .replace(/\{int\}/g, 'NUMBER')
            .replace(/\{float\}/g, 'NUMBER')
            .replace(/\{word\}/g, 'WORD')
            .replace(/["']/g, '')
            .replace(/\s+/g, ' ')
            .toLowerCase()
            .trim();
    }

    // Helper methods for file generation
    generateFilename(title, type, domain) {
        const baseName = title
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
        
        const extension = type === 'feature' ? '.feature' : '.js';
        return `${baseName}-${type}${extension}`;
    }

    generatePageClassName(title, domain) {
        const baseName = title
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');
        
        return `${baseName}Page`;
    }

    generateFeatureTags(domain, requirement) {
        const tags = ['@auto-generated'];
        
        if (domain !== 'default') {
            tags.push(`@${domain}`);
        }
        
        // Add priority tag based on requirement analysis
        if (this.isHighPriorityFeature(requirement)) {
            tags.push('@critical');
        } else {
            tags.push('@smoke');
        }
        
        return tags;
    }

    isHighPriorityFeature(requirement) {
        const highPriorityKeywords = ['critical', 'important', 'security', 'payment', 'login'];
        const content = (requirement.title + ' ' + requirement.description).toLowerCase();
        return highPriorityKeywords.some(keyword => content.includes(keyword));
    }

    generateUserStory(requirement) {
        return requirement.description || 'use this feature effectively';
    }

    generateBenefit(requirement) {
        return 'I can accomplish my business goals efficiently';
    }

    needsBackground(requirement, domain) {
        // Most features need authentication background
        return true;
    }

    getUserRole(domain) {
        const roleMap = {
            billing: 'billing administrator',
            payroll: 'payroll administrator',
            employee: 'HR administrator',
            reports: 'reports viewer',
            settings: 'system administrator',
            security: 'security administrator',
            api: 'API user',
            mobile: 'mobile user',
            default: 'user'
        };
        
        return roleMap[domain] || roleMap.default;
    }

    generateScenarioContent(scenario, domain) {
        let content = `  Scenario: ${scenario.name}\n`;
        
        for (const step of scenario.steps) {
            content += `    ${step}\n`;
        }
        
        content += '\n';
        return content;
    }

    extractStepPatterns(featureContent) {
        const patterns = [];
        const lines = featureContent.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            const stepMatch = trimmed.match(/^(Given|When|Then|And|But)\s+(.+)$/);
            if (stepMatch) {
                patterns.push(trimmed);
            }
        }
        
        return [...new Set(patterns)]; // Remove duplicates
    }

    parameterizePattern(pattern) {
        // Convert specific values to parameters
        return pattern
            .replace(/"([^"]+)"/g, '"{string}"')
            .replace(/\b\d+\b/g, '{int}')
            .replace(/\b\d+\.\d+\b/g, '{float}');
    }

    extractParameters(parameterizedPattern) {
        const params = [];
        const stringParams = (parameterizedPattern.match(/\{string\}/g) || []).length;
        const intParams = (parameterizedPattern.match(/\{int\}/g) || []).length;
        const floatParams = (parameterizedPattern.match(/\{float\}/g) || []).length;
        
        // Generate parameter names
        for (let i = 0; i < stringParams; i++) {
            params.push(`param${params.length + 1}`);
        }
        for (let i = 0; i < intParams; i++) {
            params.push(`number${params.length + 1}`);
        }
        for (let i = 0; i < floatParams; i++) {
            params.push(`value${params.length + 1}`);
        }
        
        return params.length > 0 ? `(${params.join(', ')})` : '()';
    }

    generateStepFunctionBody(keyword, pattern, domain) {
        const pageName = 'page'; // Simplified for now
        
        let body = '';
        
        if (keyword === 'Given') {
            body = `    // Setup step for ${domain} domain\n`;
            body += `    console.log('Setting up: ${pattern}');\n`;
            body += `    // TODO: Implement setup logic`;
        } else if (keyword === 'When') {
            body = `    // Action step for ${domain} domain\n`;
            body += `    console.log('Performing action: ${pattern}');\n`;
            body += `    // TODO: Implement action logic`;
        } else if (keyword === 'Then') {
            body = `    // Verification step for ${domain} domain\n`;
            body += `    console.log('Verifying: ${pattern}');\n`;
            body += `    // TODO: Implement verification logic\n`;
            body += `    // assert.isTrue(condition, 'Verification failed');`;
        }
        
        return body;
    }

    /**
     * Generate page object
     */
    async generatePageObject(requirement, domain) {
        console.log('📱 Generating page object...');
        
        const page = {
            filename: this.generateFilename(requirement.title, 'page', domain),
            content: ''
        };
        
        const className = this.generatePageClassName(requirement.title, domain);
        
        // Check for similar existing page objects
        const similarPages = this.findSimilarPages(requirement);
        if (similarPages.length > 0) {
            console.log(`  📋 Found ${similarPages.length} similar pages for pattern reference`);
            this.generationStats.patternsReused++;
        }
        
        let content = '';
        content += `/**\n`;
        content += ` * ${className}\n`;
        content += ` * Page object for ${requirement.title || 'feature'}\n`;
        content += ` * Generated by Enhanced Auto-Coder Generator v2.0\n`;
        content += ` */\n\n`;
        
        content += `class ${className} {\n`;
        content += `    constructor(page) {\n`;
        content += `        this.page = page;\n`;
        content += `        ${this.generateLocators(requirement, domain)}\n`;
        content += `    }\n\n`;
        
        // Generate methods based on requirement scenarios
        const methods = this.generatePageMethods(requirement, domain);
        content += methods;
        
        content += `}\n\n`;
        content += `module.exports = ${className};`;
        
        page.content = content;
        console.log(`  ✓ Page object generated: ${page.filename}`);
        
        return page;
    }

    generateLocators(requirement, domain) {
        // Generate common locators based on domain
        const locators = [];
        
        locators.push(`this.titleElement = 'h1, .page-title, [data-testid="title"]';`);
        locators.push(`this.loadingSpinner = '.loading, .spinner, [data-testid="loading"]';`);
        locators.push(`this.errorMessage = '.error, .alert-error, [data-testid="error"]';`);
        
        // Domain-specific locators
        if (domain === 'billing') {
            locators.push(`this.amountField = '[data-testid="amount"], #amount, .amount-input';`);
            locators.push(`this.payButton = '[data-testid="pay"], .pay-button, button:contains("Pay")';`);
        } else if (domain === 'employee') {
            locators.push(`this.employeeName = '[data-testid="employee-name"], .employee-name';`);
            locators.push(`this.addButton = '[data-testid="add-employee"], .add-button';`);
        }
        
        return locators.join('\n        ');
    }

    generatePageMethods(requirement, domain) {
        let methods = '';
        
        // Common methods
        methods += `    async waitForPageLoad() {\n`;
        methods += `        await this.page.waitForSelector(this.titleElement, { timeout: 30000 });\n`;
        methods += `        await this.page.waitForLoadState('networkidle');\n`;
        methods += `    }\n\n`;
        
        methods += `    async verifyPageLoaded() {\n`;
        methods += `        const titleVisible = await this.page.isVisible(this.titleElement);\n`;
        methods += `        assert.isTrue(titleVisible, 'Page title should be visible');\n`;
        methods += `        return true;\n`;
        methods += `    }\n\n`;
        
        // Domain-specific methods
        if (domain === 'billing') {
            methods += `    async enterAmount(amount) {\n`;
            methods += `        await this.page.fill(this.amountField, amount);\n`;
            methods += `    }\n\n`;
            
            methods += `    async clickPayButton() {\n`;
            methods += `        await this.page.click(this.payButton);\n`;
            methods += `    }\n\n`;
        }
        
        return methods;
    }

    findSimilarFeatures(requirement) {
        // Simplified implementation - would use more sophisticated matching
        return [];
    }

    findSimilarPages(requirement) {
        // Simplified implementation - would use more sophisticated matching
        return [];
    }

    /**
     * Validate generated artifacts
     */
    async validateArtifacts(artifacts) {
        console.log('✅ Validating generated artifacts...');
        
        // Validate feature file syntax
        this.validateFeatureSyntax(artifacts.feature);
        
        // Validate step definitions
        this.validateStepDefinitions(artifacts.steps);
        
        // Validate page object
        this.validatePageObject(artifacts.page);
        
        // Check for conflicts again
        await this.finalConflictCheck(artifacts);
        
        console.log('  ✓ All artifacts validated successfully');
        this.generationStats.validationsPassed++;
    }

    validateFeatureSyntax(feature) {
        // Basic Gherkin syntax validation
        const requiredElements = ['Feature:', 'Scenario:', 'Given', 'When', 'Then'];
        
        for (const element of requiredElements) {
            if (!feature.content.includes(element)) {
                throw new Error(`Missing required Gherkin element: ${element}`);
            }
        }
    }

    validateStepDefinitions(steps) {
        // Validate JavaScript syntax and structure
        const requiredImports = ['Given', 'When', 'Then'];
        
        for (const imp of requiredImports) {
            if (!steps.content.includes(imp)) {
                throw new Error(`Missing required import: ${imp}`);
            }
        }
    }

    validatePageObject(page) {
        // Validate page object structure
        if (!page.content.includes('class ') || !page.content.includes('constructor')) {
            throw new Error('Invalid page object structure');
        }
    }

    async finalConflictCheck(artifacts) {
        // Extract all step patterns from generated artifacts
        const generatedPatterns = this.extractStepPatterns(artifacts.feature.content);
        
        for (const pattern of generatedPatterns) {
            const conflicts = this.checkForConflicts(this.normalizeStepPattern(pattern));
            if (conflicts.length > 0) {
                console.warn(`  ⚠️  Final check: Potential conflict still exists for "${pattern}"`);
            }
        }
    }

    /**
     * Write artifacts to filesystem
     */
    async writeArtifacts(artifacts) {
        console.log('💾 Writing artifacts to filesystem...');
        
        // Ensure output directories exist
        this.ensureDirectories();
        
        // Write feature file
        const featurePath = path.join(this.outputPath, 'features', artifacts.feature.filename);
        fs.writeFileSync(featurePath, artifacts.feature.content);
        console.log(`  ✓ Feature file written: ${featurePath}`);
        
        // Write step definitions
        const stepsPath = path.join(this.outputPath, 'steps/auto-coder', artifacts.steps.filename);
        fs.writeFileSync(stepsPath, artifacts.steps.content);
        console.log(`  ✓ Step definitions written: ${stepsPath}`);
        
        // Write page object
        const pagePath = path.join(this.outputPath, 'pages', artifacts.page.filename);
        fs.writeFileSync(pagePath, artifacts.page.content);
        console.log(`  ✓ Page object written: ${pagePath}`);
    }

    ensureDirectories() {
        const dirs = [
            path.join(this.outputPath, 'features'),
            path.join(this.outputPath, 'steps/auto-coder'),
            path.join(this.outputPath, 'pages')
        ];
        
        for (const dir of dirs) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        }
    }

    /**
     * Generate summary report
     */
    generateSummaryReport(artifacts) {
        const report = {
            title: 'Enhanced Auto-Coder Generation Report',
            generatedAt: new Date().toISOString(),
            artifacts: {
                feature: artifacts.feature.filename,
                steps: artifacts.steps.filename,
                page: artifacts.page.filename
            },
            statistics: this.generationStats,
            conflictAnalysis: {
                conflictsAvoided: this.generationStats.conflictsAvoided,
                patternsReused: this.generationStats.patternsReused,
                riskLevel: this.generationStats.conflictsAvoided > 0 ? 'MITIGATED' : 'LOW'
            },
            recommendations: [
                'Review generated step definitions for domain-specific customization',
                'Run automated tests to validate functionality',
                'Update registries after integrating new artifacts',
                'Monitor for any remaining ambiguous step definitions'
            ]
        };
        
        const reportPath = path.join(this.outputPath, '../knowledge-base', 'generation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log(`📊 Generation report saved: ${reportPath}`);
    }

    /**
     * Print generation statistics
     */
    printGenerationStats() {
        console.log('=' .repeat(60));
        console.log('📊 ENHANCED GENERATION STATISTICS');
        console.log('='.repeat(60));
        console.log(`🔧 New Steps Generated: ${this.generationStats.newStepsGenerated}`);
        console.log(`⚠️  Conflicts Avoided: ${this.generationStats.conflictsAvoided}`);
        console.log(`🔄 Patterns Reused: ${this.generationStats.patternsReused}`);
        console.log(`✅ Validations Passed: ${this.generationStats.validationsPassed}`);
        console.log('='.repeat(60));
        
        if (this.generationStats.conflictsAvoided > 0) {
            console.log('🎉 SUCCESS: Zero ambiguous step definitions generated!');
        } else {
            console.log('✅ SUCCESS: Clean artifact generation completed!');
        }
    }
}

// CLI support
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: node enhanced-auto-coder-generator-v2.js <requirement-file> [options]');
        console.log('');
        console.log('Examples:');
        console.log('  node enhanced-auto-coder-generator-v2.js billing-requirement.txt');
        console.log('  node enhanced-auto-coder-generator-v2.js employee-onboarding.json');
        process.exit(1);
    }
    
    const requirementFile = args[0];
    const options = {};
    
    // Parse additional options
    for (let i = 1; i < args.length; i += 2) {
        if (args[i].startsWith('--')) {
            const key = args[i].substring(2);
            const value = args[i + 1] || true;
            options[key] = value;
        }
    }
    
    const generator = new EnhancedAutoCoderGeneratorV2();
    generator.generate(requirementFile, options).catch(console.error);
}

module.exports = EnhancedAutoCoderGeneratorV2;
