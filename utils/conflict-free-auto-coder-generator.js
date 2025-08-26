#!/usr/bin/env node

/**
 * Conflict-Free Auto-Coder Generator
 * Uses SBS Master Registries to Generate ZERO-CONFLICT Test Artifacts
 * 
 * ROOT CAUSE SOLUTION:
 * - Prevents AMBIGUOUS steps by checking against registry before generation
 * - Reuses existing SBS steps where possible
 * - Generates domain-specific steps when needed
 * - Validates no conflicts exist in final artifacts
 * 
 * @author Auto-Coder Registry-Integrated System
 * @date 2025-08-06
 */

const fs = require('fs');
const path = require('path');

class ConflictFreeAutoCoderGenerator {
    constructor() {
        this.registriesPath = path.join(process.cwd(), 'auto-coder', 'knowledge-base', 'sbs-master-registries');
        this.outputPath = path.join(process.cwd(), 'auto-coder', 'SBS_Automation');
        
        // Load all registries
        this.registries = this.loadRegistries();
        this.config = this.loadConfig();
        
        console.log('🚀 Conflict-Free Auto-Coder Generator Initialized');
        console.log(`📊 Loaded ${this.registries.steps?.steps?.length || 0} existing steps`);
        console.log(`⚠️  Monitoring ${this.registries.steps?.conflicts?.length || 0} known conflicts`);
    }

    /**
     * Load all SBS registries
     */
    loadRegistries() {
        const registries = {};
        
        try {
            const registryFiles = [
                'sbs-steps-master-registry.json',
                'sbs-features-master-registry.json', 
                'sbs-pages-master-registry.json',
                'sbs-actions-master-registry.json',
                'sbs-locators-master-registry.json'
            ];

            for (const file of registryFiles) {
                const filePath = path.join(this.registriesPath, file);
                if (fs.existsSync(filePath)) {
                    const key = file.replace('sbs-', '').replace('-master-registry.json', '');
                    registries[key] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    console.log(`✅ Loaded ${key} registry`);
                }
            }
        } catch (error) {
            console.warn('⚠️  Could not load registries:', error.message);
        }

        return registries;
    }

    /**
     * Load auto-coder configuration
     */
    loadConfig() {
        try {
            const configPath = path.join(this.registriesPath, 'auto-coder-registry-config.json');
            if (fs.existsSync(configPath)) {
                return JSON.parse(fs.readFileSync(configPath, 'utf8'));
            }
        } catch (error) {
            console.warn('⚠️  Could not load config:', error.message);
        }

        // Default configuration
        return {
            stepGeneration: {
                requireDomainPrefix: true,
                maxGenericParameters: 1,
                reuseThreshold: 0.8,
                conflictTolerance: "zero"
            },
            domainPrefixes: {
                billing: "billing_",
                payroll: "payroll_",
                company: "company_",
                people: "people_",
                reports: "reports_"
            }
        };
    }

    /**
     * Generate conflict-free test artifacts for a requirement
     */
    async generateArtifacts(requirement) {
        console.log(`\n🔧 Generating Artifacts for: ${requirement.title}`);
        
        try {
            // 1. Analyze requirement and determine domain
            const domain = this.determineDomain(requirement);
            console.log(`🎯 Domain: ${domain}`);

            // 2. Generate feature file with conflict-free steps
            const feature = await this.generateFeature(requirement, domain);
            
            // 3. Generate or reuse step definitions
            const steps = await this.generateSteps(feature, domain);
            
            // 4. Generate or reuse page objects
            const page = await this.generatePage(requirement, domain);
            
            // 5. Validate no conflicts exist
            await this.validateNoConflicts(feature, steps, page);
            
            // 6. Write files
            await this.writeArtifacts(requirement, feature, steps, page, domain);
            
            console.log('✅ Conflict-free artifacts generated successfully!');
            
            return {
                feature,
                steps, 
                page,
                domain,
                conflictCheck: 'PASSED'
            };
            
        } catch (error) {
            console.error('❌ Error generating artifacts:', error.message);
            throw error;
        }
    }

    /**
     * Determine domain from requirement
     */
    determineDomain(requirement) {
        const text = (requirement.title + ' ' + requirement.description).toLowerCase();
        
        if (text.includes('billing') || text.includes('invoice')) return 'billing';
        if (text.includes('payroll') || text.includes('salary')) return 'payroll';
        if (text.includes('company') || text.includes('organization')) return 'company';
        if (text.includes('people') || text.includes('employee')) return 'people';
        if (text.includes('report') || text.includes('analytics')) return 'reports';
        if (text.includes('wholesale')) return 'wholesale';
        
        return 'general';
    }

    /**
     * Generate feature file with conflict-free steps
     */
    async generateFeature(requirement, domain) {
        console.log('📋 Generating Feature File...');
        
        // Check for existing similar features
        const existingFeatures = this.findSimilarFeatures(requirement);
        
        const scenarios = this.generateScenarios(requirement, domain);
        
        const feature = {
            name: requirement.title,
            description: requirement.description,
            background: this.generateBackground(domain),
            scenarios: scenarios,
            tags: [`@${domain}`, '@automated', '@regression']
        };

        console.log(`   📝 Generated ${scenarios.length} scenarios`);
        return feature;
    }

    /**
     * Generate scenarios with conflict-free steps
     */
    generateScenarios(requirement, domain) {
        const scenarios = [];
        
        // Main functionality scenario
        scenarios.push({
            name: `Verify ${requirement.title} functionality`,
            steps: this.generateConflictFreeSteps(requirement, domain, 'main')
        });

        // Navigation scenario
        scenarios.push({
            name: `Verify ${requirement.title} page navigation`,
            steps: this.generateConflictFreeSteps(requirement, domain, 'navigation')
        });

        // Validation scenario  
        scenarios.push({
            name: `Verify ${requirement.title} element validation`,
            steps: this.generateConflictFreeSteps(requirement, domain, 'validation')
        });

        return scenarios;
    }

    /**
     * Generate conflict-free steps using registry intelligence
     */
    generateConflictFreeSteps(requirement, domain, scenarioType) {
        const steps = [];
        const domainPrefix = this.config.domainPrefixes[domain] || `${domain}_`;
        
        switch (scenarioType) {
            case 'main':
                // Find or create navigation step
                const navStep = this.findOrCreateStep(
                    'navigation',
                    `Alex navigates to ${requirement.title} page`,
                    domain
                );
                steps.push(navStep);
                
                // Find or create verification step
                const verifyStep = this.findOrCreateStep(
                    'verification',
                    `${requirement.title} page is displayed`,
                    domain
                );
                steps.push(verifyStep);
                
                // Find or create interaction steps
                const actionSteps = this.generateActionSteps(requirement, domain);
                steps.push(...actionSteps);
                break;
                
            case 'navigation':
                steps.push(this.findOrCreateStep('given', 'Alex is logged into RunMod with a homepage test client', 'general'));
                steps.push(this.findOrCreateStep('navigation', `Alex navigates to ${requirement.title} page`, domain));
                steps.push(this.findOrCreateStep('verification', `${requirement.title} page title is displayed`, domain));
                break;
                
            case 'validation':
                steps.push(this.findOrCreateStep('given', `Alex is on the ${requirement.title} page`, domain));
                steps.push(this.findOrCreateStep('verification', `all ${domain} page elements are properly loaded`, domain));
                break;
        }
        
        return steps;
    }

    /**
     * Find existing step or create new conflict-free step
     */
    findOrCreateStep(type, description, domain) {
        // 1. Search for exact match in existing steps
        const exactMatch = this.findExactStepMatch(description);
        if (exactMatch) {
            console.log(`   ♻️  Reusing: ${exactMatch.pattern}`);
            return {
                keyword: exactMatch.keyword,
                text: exactMatch.pattern,
                source: 'existing',
                file: exactMatch.file
            };
        }

        // 2. Search for similar steps
        const similarSteps = this.findSimilarSteps(description, domain);
        if (similarSteps.length > 0) {
            const bestMatch = similarSteps[0];
            if (this.calculateSimilarity(description, bestMatch.pattern) > this.config.stepGeneration.reuseThreshold) {
                console.log(`   🔄 Adapting: ${bestMatch.pattern}`);
                return {
                    keyword: bestMatch.keyword,
                    text: bestMatch.pattern,
                    source: 'adapted',
                    file: bestMatch.file
                };
            }
        }

        // 3. Create new conflict-free step
        const newStep = this.createConflictFreeStep(type, description, domain);
        console.log(`   ✨ Creating: ${newStep.text}`);
        return newStep;
    }

    /**
     * Create new step that won't conflict with existing steps
     */
    createConflictFreeStep(type, description, domain) {
        const domainPrefix = this.config.domainPrefixes[domain] || `${domain}_`;
        
        let keyword = 'When';
        let stepText = description;
        
        // Determine keyword based on type
        if (type === 'given' || type === 'background') keyword = 'Given';
        if (type === 'verification' || type === 'assert') keyword = 'Then';
        
        // Make step domain-specific to avoid conflicts
        if (!stepText.toLowerCase().includes(domain)) {
            stepText = stepText.replace(/Alex/, `Alex`);
            
            // Add domain context
            if (type === 'navigation') {
                stepText = `Alex navigates to ${domain} ${stepText.replace('Alex navigates to', '').replace('page', '').trim()} page`;
            } else if (type === 'verification') {
                stepText = `Alex verifies the ${domain} ${stepText.replace('is displayed', '').replace('page', '').trim()} page is displayed`;
            }
        }

        // Validate step doesn't conflict
        const normalizedStep = this.normalizeStepPattern(stepText);
        const conflicts = this.checkStepConflicts(normalizedStep);
        
        if (conflicts.length > 0) {
            // Add disambiguating suffix
            stepText += ` in ${domain} context`;
            console.log(`   ⚠️  Added disambiguation: ${stepText}`);
        }

        return {
            keyword,
            text: stepText,
            source: 'generated',
            domain: domain,
            conflictChecked: true
        };
    }

    /**
     * Generate action steps based on requirement
     */
    generateActionSteps(requirement, domain) {
        const steps = [];
        
        // Common UI interactions based on requirement
        if (requirement.description.toLowerCase().includes('button')) {
            steps.push(this.findOrCreateStep('interaction', `Alex clicks the ${domain} Get Started button`, domain));
        }
        
        if (requirement.description.toLowerCase().includes('link')) {
            steps.push(this.findOrCreateStep('interaction', `Alex clicks the ${domain} Learn More link`, domain));
        }
        
        if (requirement.description.toLowerCase().includes('form') || requirement.description.toLowerCase().includes('input')) {
            steps.push(this.findOrCreateStep('interaction', `Alex fills the ${domain} form with valid data`, domain));
        }
        
        return steps;
    }

    /**
     * Generate step definitions file
     */
    async generateSteps(feature, domain) {
        console.log('🔧 Generating Step Definitions...');
        
        const allSteps = [];
        feature.scenarios.forEach(scenario => {
            allSteps.push(...scenario.steps);
        });
        
        // Filter to only new steps that need implementation
        const newSteps = allSteps.filter(step => step.source === 'generated');
        
        const stepDefinitions = newSteps.map(step => {
            return this.generateStepImplementation(step, domain);
        });

        console.log(`   🔧 Generated ${stepDefinitions.length} new step implementations`);
        
        return {
            imports: this.generateStepImports(domain),
            stepDefinitions: stepDefinitions,
            newStepCount: stepDefinitions.length,
            reusedStepCount: allSteps.length - stepDefinitions.length
        };
    }

    /**
     * Generate step implementation
     */
    generateStepImplementation(step, domain) {
        const pageClassName = `${this.capitalize(domain)}Page`;
        
        return {
            keyword: step.keyword,
            pattern: step.text,
            implementation: `${step.keyword}('${step.text}', async function () {
    // ${step.text}
    const ${domain}Page = new ${pageClassName}(this.driver, this.platform);
    
    ${this.generateStepBody(step, domain)}
});`
        };
    }

    /**
     * Generate step body based on step type
     */
    generateStepBody(step, domain) {
        const text = step.text.toLowerCase();
        
        if (text.includes('navigate')) {
            return `await ${domain}Page.navigateToPage();`;
        } else if (text.includes('displayed') || text.includes('verify')) {
            return `const isDisplayed = await ${domain}Page.isPageDisplayed();
    assert.isTrue(isDisplayed, '${step.text}');`;
        } else if (text.includes('click')) {
            const element = this.extractElementFromStep(step.text);
            return `await ${domain}Page.click${this.capitalize(element)}();`;
        } else if (text.includes('fill') || text.includes('enter')) {
            return `await ${domain}Page.fillForm(data);`;
        } else {
            return `// TODO: Implement ${step.text}
    console.log('Executing: ${step.text}');`;
        }
    }

    /**
     * Generate page object
     */
    async generatePage(requirement, domain) {
        console.log('📄 Generating Page Object...');
        
        // Check for existing page object
        const existingPage = this.findExistingPage(domain);
        if (existingPage) {
            console.log(`   ♻️  Found existing page: ${existingPage.className}`);
            return existingPage;
        }
        
        const className = `${this.capitalize(domain)}Page`;
        const pageObject = {
            className,
            imports: [
                "const { By, until } = require('selenium-webdriver');",
                "const BasePage = require('../base/BasePage');"
            ],
            locators: this.generatePageLocators(requirement, domain),
            methods: this.generatePageMethods(requirement, domain)
        };

        console.log(`   📄 Generated ${className} with ${pageObject.methods.length} methods`);
        return pageObject;
    }

    /**
     * Generate page locators
     */
    generatePageLocators(requirement, domain) {
        const locators = [];
        
        // Common locators based on requirement
        locators.push({
            name: 'pageTitle',
            selector: `[data-testid="${domain}-page-title"]`,
            description: `${domain} page title element`
        });
        
        if (requirement.description.toLowerCase().includes('button')) {
            locators.push({
                name: 'getStartedButton',
                selector: `[data-testid="${domain}-get-started-button"]`,
                description: 'Get Started button'
            });
        }
        
        if (requirement.description.toLowerCase().includes('link')) {
            locators.push({
                name: 'learnMoreLink',
                selector: `[data-testid="${domain}-learn-more-link"]`,
                description: 'Learn More link'
            });
        }
        
        return locators;
    }

    /**
     * Generate page methods
     */
    generatePageMethods(requirement, domain) {
        const methods = [];
        
        // Navigation method
        methods.push({
            name: 'navigateToPage',
            implementation: `async navigateToPage() {
        await this.driver.get(this.baseUrl + '/${domain}');
        await this.waitForPageLoad();
    }`
        });
        
        // Page verification method
        methods.push({
            name: 'isPageDisplayed',
            implementation: `async isPageDisplayed() {
        try {
            await this.driver.wait(until.elementLocated(By.css(this.pageTitle)), 10000);
            return true;
        } catch (error) {
            return false;
        }
    }`
        });
        
        // Common interaction methods based on requirement
        if (requirement.description.toLowerCase().includes('button')) {
            methods.push({
                name: 'clickGetStartedButton',
                implementation: `async clickGetStartedButton() {
        const button = await this.driver.findElement(By.css(this.getStartedButton));
        await this.driver.wait(until.elementIsEnabled(button), 5000);
        await button.click();
    }`
            });
        }
        
        return methods;
    }

    /**
     * Validate no conflicts exist in generated artifacts
     */
    async validateNoConflicts(feature, steps, page) {
        console.log('🔍 Validating No Conflicts...');
        
        const conflicts = [];
        
        // Check step conflicts
        if (steps.stepDefinitions) {
            for (const step of steps.stepDefinitions) {
                const stepConflicts = this.checkStepConflicts(step.pattern);
                if (stepConflicts.length > 0) {
                    conflicts.push({
                        type: 'step',
                        pattern: step.pattern,
                        conflicts: stepConflicts
                    });
                }
            }
        }
        
        if (conflicts.length > 0) {
            console.error('❌ CONFLICTS DETECTED:');
            conflicts.forEach(conflict => {
                console.error(`   - ${conflict.pattern}: ${conflict.conflicts.length} conflicts`);
            });
            throw new Error(`Validation failed: ${conflicts.length} conflicts detected`);
        }
        
        console.log('✅ No conflicts detected - artifacts are safe to use');
    }

    /**
     * Write all artifacts to files
     */
    async writeArtifacts(requirement, feature, steps, page, domain) {
        console.log('💾 Writing Artifacts...');
        
        const kebabTitle = requirement.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        // Ensure directories exist
        const featureDir = path.join(this.outputPath, 'features');
        const stepsDir = path.join(this.outputPath, 'steps');
        const pagesDir = path.join(this.outputPath, 'pages');
        
        [featureDir, stepsDir, pagesDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
        
        // Write feature file
        const featureContent = this.generateFeatureFileContent(feature);
        const featureFile = path.join(featureDir, `${kebabTitle}.feature`);
        fs.writeFileSync(featureFile, featureContent);
        console.log(`   📋 ${path.basename(featureFile)}`);
        
        // Write steps file (only if new steps were generated)
        if (steps.stepDefinitions && steps.stepDefinitions.length > 0) {
            const stepsContent = this.generateStepsFileContent(steps, domain);
            const stepsFile = path.join(stepsDir, `${kebabTitle}-steps.js`);
            fs.writeFileSync(stepsFile, stepsContent);
            console.log(`   🔧 ${path.basename(stepsFile)}`);
        }
        
        // Write page file
        const pageContent = this.generatePageFileContent(page, domain);
        const pageFile = path.join(pagesDir, `${kebabTitle}-page.js`);
        fs.writeFileSync(pageFile, pageContent);
        console.log(`   📄 ${path.basename(pageFile)}`);
    }

    // Helper Methods
    findExactStepMatch(description) {
        if (!this.registries.steps?.steps) return null;
        
        return this.registries.steps.steps.find(step => 
            step.pattern.toLowerCase() === description.toLowerCase()
        );
    }

    findSimilarSteps(description, domain) {
        if (!this.registries.steps?.steps) return [];
        
        return this.registries.steps.steps
            .filter(step => step.domain === domain || step.domain === 'general')
            .filter(step => this.calculateSimilarity(description, step.pattern) > 0.5)
            .sort((a, b) => this.calculateSimilarity(description, b.pattern) - this.calculateSimilarity(description, a.pattern));
    }

    calculateSimilarity(text1, text2) {
        const words1 = text1.toLowerCase().split(/\s+/);
        const words2 = text2.toLowerCase().split(/\s+/);
        const intersection = words1.filter(word => words2.includes(word));
        return intersection.length / Math.max(words1.length, words2.length);
    }

    normalizeStepPattern(pattern) {
        return pattern
            .replace(/\{[^}]+\}/g, '{param}')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    checkStepConflicts(pattern) {
        if (!this.registries.steps?.conflicts) return [];
        
        const normalized = this.normalizeStepPattern(pattern);
        
        return this.registries.steps.conflicts.filter(conflict => 
            conflict.pattern === normalized
        );
    }

    findSimilarFeatures(requirement) {
        if (!this.registries.features?.features) return [];
        
        return this.registries.features.features.filter(feature =>
            this.calculateSimilarity(requirement.title, feature.name) > 0.7
        );
    }

    findExistingPage(domain) {
        if (!this.registries.pages?.pages) return null;
        
        return this.registries.pages.pages.find(page => 
            page.domain === domain
        );
    }

    generateBackground(domain) {
        return [
            'Given Alex is logged into RunMod with a homepage test client',
            `And Alex has access to ${domain} functionality`
        ];
    }

    generateStepImports(domain) {
        return [
            "const { Given, When, Then } = require('@cucumber/cucumber');",
            "const { assert } = require('chai');",
            `const ${this.capitalize(domain)}Page = require('../pages/${domain}-page');`
        ];
    }

    generateFeatureFileContent(feature) {
        let content = `@${feature.tags.join(' @')}\nFeature: ${feature.name}\n`;
        content += `  ${feature.description}\n\n`;
        
        if (feature.background.length > 0) {
            content += '  Background:\n';
            feature.background.forEach(step => {
                content += `    ${step}\n`;
            });
            content += '\n';
        }
        
        feature.scenarios.forEach(scenario => {
            content += `  Scenario: ${scenario.name}\n`;
            scenario.steps.forEach(step => {
                content += `    ${step.keyword} ${step.text}\n`;
            });
            content += '\n';
        });
        
        return content;
    }

    generateStepsFileContent(steps, domain) {
        let content = steps.imports.join('\n') + '\n\n';
        
        steps.stepDefinitions.forEach(step => {
            content += step.implementation + '\n\n';
        });
        
        return content;
    }

    generatePageFileContent(page, domain) {
        let content = page.imports.join('\n') + '\n\n';
        
        content += `class ${page.className} extends BasePage {\n`;
        content += '    constructor(driver, platform) {\n';
        content += '        super(driver, platform);\n';
        
        // Add locators
        page.locators.forEach(locator => {
            content += `        this.${locator.name} = '${locator.selector}'; // ${locator.description}\n`;
        });
        
        content += '    }\n\n';
        
        // Add methods
        page.methods.forEach(method => {
            content += `    ${method.implementation}\n\n`;
        });
        
        content += '}\n\n';
        content += `module.exports = ${page.className};\n`;
        
        return content;
    }

    extractElementFromStep(stepText) {
        const match = stepText.match(/clicks?\s+(?:the\s+)?(\w+)/i);
        return match ? match[1] : 'element';
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Export for use in other modules
module.exports = ConflictFreeAutoCoderGenerator;

// Execute if called directly
if (require.main === module) {
    const generator = new ConflictFreeAutoCoderGenerator();
    
    // Example usage
    const sampleRequirement = {
        title: "CFC Bundle Configuration Management",
        description: "As a client user, I want to access and manage CFC bundle configurations so that I can configure my bundles effectively"
    };
    
    generator.generateArtifacts(sampleRequirement)
        .then(result => {
            console.log('\n🎉 CONFLICT-FREE ARTIFACTS GENERATED SUCCESSFULLY!');
            console.log(`   Domain: ${result.domain}`);
            console.log(`   Conflict Check: ${result.conflictCheck}`);
        })
        .catch(error => {
            console.error('\n❌ GENERATION FAILED:', error.message);
            process.exit(1);
        });
}
