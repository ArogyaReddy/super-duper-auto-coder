/**
 * Template Engine - Intelligent template selection and generation
 * Uses matched patterns to create dynamic, contextual templates
 */

const Handlebars = require('handlebars');
const fs = require('fs-extra');
const path = require('path');

class TemplateEngine {
    constructor() {
        this.templates = {};
        this.helpers = {};
        this.partials = {};
        this.initialized = false;
    }

    /**
     * Initialize template engine
     */
    async initialize() {
        if (this.initialized) return;

        // Silent initialization
        try {
            await this.loadTemplates();
            this.registerHelpers();
            this.registerPartials();
            
            this.initialized = true;
            // Initialization complete - no console output
        } catch (error) {
            console.error('❌ Failed to initialize Template Engine:', error.message);
            throw error;
        }
    }

    /**
     * Load templates from file system
     */
    async loadTemplates() {
        const templatesPath = path.join(__dirname, '../../templates');
        
        // Ensure templates directory exists
        await fs.ensureDir(templatesPath);
        
        // Load different template types
        await this.loadTemplateType('features', templatesPath);
        await this.loadTemplateType('steps', templatesPath);
        await this.loadTemplateType('pages', templatesPath);
        await this.loadTemplateType('scenarios', templatesPath);
        
        // Templates loaded silently
    }

    /**
     * Load specific template type
     */
    async loadTemplateType(type, basePath) {
        const typePath = path.join(basePath, type);
        
        if (await fs.pathExists(typePath)) {
            const files = await fs.readdir(typePath);
            this.templates[type] = {};
            
            for (const file of files) {
                if (file.endsWith('.hbs')) {
                    const templateName = path.basename(file, '.hbs');
                    const templateContent = await fs.readFile(path.join(typePath, file), 'utf8');
                    this.templates[type][templateName] = Handlebars.compile(templateContent);
                }
            }
        } else {
            this.templates[type] = {};
        }
    }

    /**
     * Register Handlebars helpers
     */
    registerHelpers() {
        // Capitalize helper
        Handlebars.registerHelper('capitalize', function(str) {
            if (!str) return '';
            return str.charAt(0).toUpperCase() + str.slice(1);
        });

        // Title case helper
        Handlebars.registerHelper('titleCase', function(str) {
            if (!str) return '';
            return str.replace(/\w\S*/g, (txt) => 
                txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
        });

        // Camel case helper
        Handlebars.registerHelper('camelCase', function(str) {
            if (!str) return '';
            return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
                return index === 0 ? word.toLowerCase() : word.toUpperCase();
            }).replace(/\s+/g, '');
        });

        // Pascal case helper
        Handlebars.registerHelper('pascalCase', function(str) {
            if (!str) return '';
            return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
                return word.toUpperCase();
            }).replace(/\s+/g, '');
        });

        // Snake case helper
        Handlebars.registerHelper('snakeCase', function(str) {
            if (!str) return '';
            return str.replace(/\W+/g, ' ')
                     .split(/ |\B(?=[A-Z])/)
                     .map(word => word.toLowerCase())
                     .join('_');
        });

        // Kebab case helper
        Handlebars.registerHelper('kebabCase', function(str) {
            if (!str) return '';
            return str.replace(/\W+/g, ' ')
                     .split(/ |\B(?=[A-Z])/)
                     .map(word => word.toLowerCase())
                     .join('-');
        });

        // Plural helper
        Handlebars.registerHelper('plural', function(str) {
            if (!str) return '';
            if (str.endsWith('y')) return str.slice(0, -1) + 'ies';
            if (str.endsWith('s')) return str + 'es';
            return str + 's';
        });

        // Date formatting helper
        Handlebars.registerHelper('formatDate', function(date, format) {
            if (!date) return '';
            const d = new Date(date);
            if (format === 'short') return d.toLocaleDateString();
            if (format === 'long') return d.toLocaleDateString('en-US', { 
                year: 'numeric', month: 'long', day: 'numeric' 
            });
            return d.toISOString();
        });

        // Conditional helper
        Handlebars.registerHelper('if_eq', function(a, b, opts) {
            if (a === b) return opts.fn(this);
            return opts.inverse(this);
        });

        // Array contains helper
        Handlebars.registerHelper('contains', function(array, item, opts) {
            if (Array.isArray(array) && array.includes(item)) {
                return opts.fn(this);
            }
            return opts.inverse(this);
        });

        // Join array helper
        Handlebars.registerHelper('join', function(array, separator) {
            if (!Array.isArray(array)) return '';
            return array.join(separator || ', ');
        });

        // Random selection helper
        Handlebars.registerHelper('random', function(array) {
            if (!Array.isArray(array) || array.length === 0) return '';
            return array[Math.floor(Math.random() * array.length)];
        });

        
        // Helpers registered silently
    }    /**
     * Register Handlebars partials
     */
    registerPartials() {
        // Common partials for reusable template components
        const commonPartials = {
            'step-action': '{{capitalize action}} {{entity}}',
            'step-verification': 'Verify that {{entity}} {{expectedResult}}',
            'feature-header': 'Feature: {{titleCase featureName}}',
            'scenario-header': 'Scenario: {{titleCase scenarioName}}',
            'page-element': '{{elementType}}("{{elementName}}")',
            'test-assertion': 'expect({{actual}}).to{{assertion}}({{expected}})'
        };

        Object.keys(commonPartials).forEach(name => {
            Handlebars.registerPartial(name, commonPartials[name]);
        });

        
        // Partials registered silently
    }    /**
     * Generate template from matched patterns
     */
    async generateFromPatterns(analysis, matches, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        console.log(`🎨 Generating template for ${analysis.intent} in ${analysis.domain} domain`);
        
        const context = this.buildTemplateContext(analysis, matches, options);
        const templateData = this.selectTemplateData(analysis, matches, options);
        
        const result = {
            context,
            templates: {},
            metadata: {
                generatedAt: new Date().toISOString(),
                analysis: analysis,
                matchingConfidence: matches.confidence,
                templateType: options.templateType || 'auto'
            }
        };

        // Generate different types of templates based on matches
        if (matches.recommendations.length > 0) {
            // Feature file template
            result.templates.feature = await this.generateFeatureTemplate(templateData, context);
            
            // Step definitions template
            result.templates.steps = await this.generateStepsTemplate(templateData, context);
            
            // Page object template
            result.templates.page = await this.generatePageTemplate(templateData, context);
            
            // Test scenario template
            result.templates.scenario = await this.generateScenarioTemplate(templateData, context);
        } else {
            // Fallback to basic templates
            result.templates = await this.generateFallbackTemplates(analysis, context);
        }

        console.log(`✅ Generated ${Object.keys(result.templates).length} templates`);
        return result;
    }

    /**
     * Build template context from analysis and matches
     */
    buildTemplateContext(analysis, matches, options) {
        const topFeature = matches.recommendations.find(r => r.type === 'feature');
        const topStep = matches.recommendations.find(r => r.type === 'step');
        const topPage = matches.recommendations.find(r => r.type === 'page');

        return {
            // Analysis data
            domain: analysis.domain,
            category: analysis.domain || 'common', // ✅ FIX: Set category for proper path generation
            intent: analysis.intent,
            complexity: analysis.complexity,
            originalText: analysis.originalText,
            
            // Extracted elements
            entities: analysis.entities.map(e => e.entity),
            actions: analysis.actions.map(a => a.action),
            roles: analysis.roles.map(r => r.role),
            
            // Primary elements (most frequent/relevant)
            primaryEntity: analysis.entities[0]?.entity || 'item',
            primaryAction: analysis.actions[0]?.action || 'process',
            primaryRole: analysis.roles[0]?.role || 'user',
            
            // Pattern-based suggestions
            suggestedFeature: topFeature?.pattern?.name || this.generateFeatureName(analysis),
            suggestedSteps: this.extractStepSuggestions(matches),
            suggestedPages: this.extractPageSuggestions(matches),
            
            // Generation options
            generateTimestamp: new Date().toISOString(),
            generateUser: options.user || 'auto-coder',
            projectName: options.projectName || 'test-project',
            
            // Formatting helpers
            featureName: this.generateFeatureName(analysis),
            scenarioName: this.generateScenarioName(analysis),
            className: this.generateClassName(analysis),
            methodName: this.generateMethodName(analysis)
        };
    }

    /**
     * Select template data based on matched patterns
     */
    selectTemplateData(analysis, matches, options) {
        const data = {
            patterns: {
                features: matches.recommendations.filter(r => r.type === 'feature').slice(0, 3),
                steps: matches.recommendations.filter(r => r.type === 'step').slice(0, 5),
                pages: matches.recommendations.filter(r => r.type === 'page').slice(0, 3)
            },
            
            confidence: matches.confidence,
            reasoning: matches.reasoning,
            
            // Template selection preferences
            preferSimple: analysis.complexity === 'low',
            preferDetailed: analysis.complexity === 'high',
            includeComments: options.includeComments !== false,
            includeExamples: options.includeExamples !== false
        };

        return data;
    }

    /**
     * Generate feature template
     */
    async generateFeatureTemplate(templateData, context) {
        const template = this.templates.features?.standard || this.createDefaultFeatureTemplate();
        
        return template({
            ...context,
            scenarios: this.generateScenarios(templateData, context),
            background: this.generateBackground(templateData, context),
            examples: templateData.includeExamples ? this.generateExamples(context) : null
        });
    }

    /**
     * Generate steps template
     */
    async generateStepsTemplate(templateData, context) {
        const template = this.templates.steps?.standard || this.createDefaultStepsTemplate();
        
        return template({
            ...context,
            stepDefinitions: this.generateStepDefinitions(templateData, context),
            imports: this.generateImports(context),
            helpers: this.generateHelpers(context)
        });
    }

    /**
     * Generate page template
     */
    async generatePageTemplate(templateData, context) {
        const template = this.templates.pages?.standard || this.createDefaultPageTemplate();
        
        return template({
            ...context,
            elements: this.generatePageElements(templateData, context),
            methods: this.generatePageMethods(templateData, context),
            locators: this.generateLocators(templateData, context)
        });
    }

    /**
     * Generate scenario template
     */
    async generateScenarioTemplate(templateData, context) {
        const template = this.templates.scenarios?.standard || this.createDefaultScenarioTemplate();
        
        return template({
            ...context,
            testSteps: this.generateTestSteps(templateData, context),
            assertions: this.generateAssertions(templateData, context),
            setup: this.generateSetup(context),
            teardown: this.generateTeardown(context)
        });
    }

    /**
     * Generate scenarios for feature
     */
    generateScenarios(templateData, context) {
        const scenarios = [];
        
        // Main scenario based on requirement
        scenarios.push({
            name: context.scenarioName,
            steps: this.generateMainScenarioSteps(templateData, context)
        });
        
        // Additional scenarios based on complexity
        if (context.complexity !== 'low' && templateData.patterns.features.length > 1) {
            scenarios.push({
                name: `Alternative ${context.scenarioName}`,
                steps: this.generateAlternativeSteps(templateData, context)
            });
        }
        
        return scenarios;
    }

    /**
     * Generate main scenario steps
     */
    generateMainScenarioSteps(templateData, context) {
        const steps = [];
        
        // Given steps (setup)
        steps.push(`Given I am logged in as a ${context.primaryRole}`);
        if (context.entities.length > 0) {
            steps.push(`And I have access to ${context.entities[0]} management`);
        }
        
        // When steps (action)
        steps.push(`When I ${context.primaryAction} the ${context.primaryEntity}`);
        
        // Then steps (verification)
        steps.push(`Then the ${context.primaryEntity} should be ${this.getExpectedResult(context.intent)}`);
        steps.push(`And I should see a confirmation message`);
        
        return steps;
    }

    /**
     * Get expected result based on intent
     */
    getExpectedResult(intent) {
        const results = {
            creation: 'created successfully',
            modification: 'updated successfully',
            deletion: 'deleted successfully',
            testing: 'validated correctly',
            navigation: 'displayed correctly'
        };
        
        return results[intent] || 'processed successfully';
    }

    /**
     * Generate helper methods for naming
     */
    /**
     * Generate business-contextual feature name
     */
    generateFeatureName(analysis) {
        // ✅ IMPROVED: Use business context instead of generic entity+action
        if (analysis.originalText) {
            // Extract meaningful business terms from the requirement
            const businessTerms = this.extractBusinessTerms(analysis.originalText);
            if (businessTerms.length > 0) {
                return businessTerms.join(' ');
            }
        }
        
        // Fallback to improved entity+action pattern
        const entity = analysis.entities[0]?.entity || 'Application';
        const action = analysis.actions[0]?.action || 'Management';
        return `${this.titleCase(action)} ${this.titleCase(entity)}`;
    }

    generateScenarioName(analysis) {
        const entity = analysis.entities[0]?.entity || 'feature';
        const action = analysis.actions[0]?.action || 'functionality';
        return `${this.titleCase(action)} ${entity} workflow`;
    }

    generateClassName(analysis, options = {}) {
        // ✅ CRITICAL FIX: Generate business-contextual class names
        if (analysis.originalText) {
            const businessContext = this.extractBusinessContext(analysis.originalText);
            if (businessContext) {
                return `${this.pascalCase(businessContext)}Page`;
            }
        }
        
        // Use domain-specific naming
        const domain = analysis.domain || 'Application';
        const entity = analysis.entities[0]?.entity || 'Management';
        
        // Create professional business-contextual name
        const contextualNames = {
            client: 'ClientPortfolio',
            financial: 'FinancialPlanning', 
            hr: 'HumanResources',
            payroll: 'PayrollProcessing',
            onboarding: 'UserOnboarding',
            auth: 'Authentication',
            portfolio: 'PortfolioManagement',
            api: 'ApiIntegration'
        };
        
        const contextualName = contextualNames[domain.toLowerCase()] || 
                              contextualNames[entity.toLowerCase()] ||
                              `${this.pascalCase(domain)}${this.pascalCase(entity)}`;
                              
        return `${contextualName}Page`;
    }

    /**
     * Extract business terms from requirement text
     */
    extractBusinessTerms(text) {
        const businessPatterns = [
            /(?:manage|create|update|delete|view)\s+([a-z]+\s+[a-z]+)/gi,
            /(?:as\s+a|I\s+am\s+a)\s+([a-z\s]+)(?:\s+I\s+want)/gi,
            /(?:I\s+want\s+to)\s+([a-z\s]+)(?:\s+so\s+that)/gi
        ];
        
        const terms = [];
        for (const pattern of businessPatterns) {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                if (match[1] && match[1].trim().length > 3) {
                    terms.push(this.titleCase(match[1].trim()));
                }
            }
        }
        
        return terms.slice(0, 3); // Return top 3 business terms
    }

    /**
     * Extract business context for professional naming
     */
    extractBusinessContext(text) {
        const contextPatterns = {
            'Client Portfolio Management': /portfolio|investment|client.*manage/i,
            'Financial Planning': /financial|planning|advisor/i,
            'User Authentication': /login|auth|sign.*in|credential/i,
            'Payroll Processing': /payroll|employee|payment/i,
            'HR Management': /hr|human.*resource|employee.*manage/i,
            'API Integration': /api|endpoint|curl|integration/i,
            'User Onboarding': /onboard|register|signup|new.*user/i
        };
        
        for (const [context, pattern] of Object.entries(contextPatterns)) {
            if (pattern.test(text)) {
                return context.replace(/\s+/g, '');
            }
        }
        
        return null;
    }

    generateMethodName(analysis) {
        const action = analysis.actions[0]?.action || 'process';
        const entity = analysis.entities[0]?.entity || 'item';
        return `${this.camelCase(action)}${this.pascalCase(entity)}`;
    }

    /**
     * String formatting utilities
     */
    titleCase(str) {
        if (!str) return '';
        return str.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }

    pascalCase(str) {
        if (!str) return '';
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
            return word.toUpperCase();
        }).replace(/\s+/g, '');
    }

    camelCase(str) {
        if (!str) return '';
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
    }

    /**
     * Create default templates if files don't exist
     */
    createDefaultFeatureTemplate() {
        return Handlebars.compile(`Feature: {{featureName}}
  As a {{primaryRole}}
  I want to {{primaryAction}} {{primaryEntity}}
  So that I can manage my {{domain}} operations

  {{#each scenarios}}
  Scenario: {{name}}
    {{#each steps}}
    {{this}}
    {{/each}}
  {{/each}}`);
    }

    createDefaultStepsTemplate() {
        return Handlebars.compile(`const { Given, When, Then } = require('@cucumber/cucumber');
const {{className}} = require('../pages/{{kebabCase className}}');

// Step definitions for {{featureName}}
const {{camelCase className}} = new {{className}}();

Given('I am logged in as a {string}', function (role) {
  // Implementation for login
});

When('I {{primaryAction}} the {{primaryEntity}}', function () {
  // Implementation for {{primaryAction}}
});

Then('the {{primaryEntity}} should be {string}', function (expectedState) {
  // Implementation for verification
});`);
    }

    createDefaultPageTemplate() {
        return Handlebars.compile(`class {{className}} {
  constructor() {
    this.page = null;
  }

  // Page elements
  get {{camelCase primaryEntity}}Input() {
    return this.page.locator('[data-cy="{{kebabCase primaryEntity}}-input"]');
  }

  get {{camelCase primaryAction}}Button() {
    return this.page.locator('[data-cy="{{kebabCase primaryAction}}-button"]');
  }

  // Page methods
  async {{methodName}}(data) {
    // Implementation for {{primaryAction}} {{primaryEntity}}
  }

  async verify{{pascalCase primaryEntity}}{{pascalCase primaryAction}}() {
    // Implementation for verification
  }
}

module.exports = {{className}};`);
    }

    createDefaultScenarioTemplate() {
        return Handlebars.compile(`describe('{{featureName}}', () => {
  let {{camelCase className}};

  beforeEach(async () => {
    {{camelCase className}} = new {{className}}();
    // Setup
  });

  it('should {{primaryAction}} {{primaryEntity}} successfully', async () => {
    // Test implementation
    await {{camelCase className}}.{{methodName}}();
    // Assertions
  });

  afterEach(async () => {
    // Cleanup
  });
});`);
    }

    /**
     * Generate fallback templates when no patterns match
     */
    async generateFallbackTemplates(analysis, context) {
        console.log('⚠️ Using fallback templates due to low pattern confidence');
        
        return {
            feature: this.createDefaultFeatureTemplate()(context),
            steps: this.createDefaultStepsTemplate()(context),
            page: this.createDefaultPageTemplate()(context),
            scenario: this.createDefaultScenarioTemplate()(context)
        };
    }

    // Additional helper methods for template generation...
    extractStepSuggestions(matches) {
        return matches.recommendations
            .filter(r => r.type === 'step')
            .slice(0, 5)
            .map(r => r.pattern.content || r.pattern.name);
    }

    extractPageSuggestions(matches) {
        return matches.recommendations
            .filter(r => r.type === 'page')
            .slice(0, 3)
            .map(r => r.pattern.name || r.pattern.title);
    }

    generateStepDefinitions(templateData, context) {
        // Generate step definitions based on patterns
        return templateData.patterns.steps.map(step => ({
            pattern: step.pattern.content,
            implementation: `// Implementation based on ${step.pattern.domain} domain pattern`
        }));
    }

    generatePageElements(templateData, context) {
        // Generate page elements based on patterns
        return context.entities.map(entity => ({
            name: `${this.camelCase(entity)}Element`,
            selector: `[data-cy="${this.kebabCase(entity)}"]`,
            type: 'input'
        }));
    }

    generatePageMethods(templateData, context) {
        // Generate page methods based on actions
        return context.actions.map(action => ({
            name: `${this.camelCase(action)}${this.pascalCase(context.primaryEntity)}`,
            description: `${this.titleCase(action)} the ${context.primaryEntity}`
        }));
    }

    generateTestSteps(templateData, context) {
        // Generate test steps based on intent
        const steps = [];
        steps.push(`// Setup: Prepare test data`);
        steps.push(`// Action: ${context.primaryAction} ${context.primaryEntity}`);
        steps.push(`// Verification: Check expected result`);
        return steps;
    }

    generateAssertions(templateData, context) {
        // Generate assertions based on intent
        return [
            `expect(result).toBeDefined()`,
            `expect(result.status).toBe('${this.getExpectedResult(context.intent)}')`
        ];
    }

    generateBackground(templateData, context) {
        if (context.complexity === 'low') return null;
        
        return {
            steps: [
                `Given the system is running`,
                `And I have valid credentials`
            ]
        };
    }

    generateExamples(context) {
        return {
            headers: ['Entity', 'Action', 'Expected'],
            rows: [
                [context.primaryEntity, context.primaryAction, this.getExpectedResult(context.intent)]
            ]
        };
    }

    generateAlternativeSteps(templateData, context) {
        return [
            `Given I am on the ${context.primaryEntity} page`,
            `When I attempt to ${context.primaryAction} an invalid ${context.primaryEntity}`,
            `Then I should see an error message`,
            `And the ${context.primaryEntity} should not be ${this.getExpectedResult(context.intent)}`
        ];
    }

    generateImports(context) {
        // Fixed path calculation: For SBS_Automation structure
        // steps/ -> pages/ requires ../pages/ (pages are directly in pages/, not in subdirectories)
        const pagePathPrefix = '../pages/';
        const pageFileName = this.kebabCase(context.className);
        
        return [
            `const { Given, When, Then } = require('@cucumber/cucumber');`,
            `const ${context.className} = require('${pagePathPrefix}${pageFileName}')`
        ];
    }

    generateHelpers(context) {
        return [
            `// Helper functions for ${context.featureName}`,
            `function validate${this.pascalCase(context.primaryEntity)}Data(data) {`,
            `  // Validation logic`,
            `}`
        ];
    }

    generateLocators(templateData, context) {
        return context.entities.map(entity => ({
            name: entity,
            selector: `[data-cy="${this.kebabCase(entity)}"]`,
            description: `Locator for ${entity} element`
        }));
    }

    generateSetup(context) {
        return [
            `// Setup test environment`,
            `// Initialize ${context.className}`,
            `// Prepare test data`
        ];
    }

    generateTeardown(context) {
        return [
            `// Clean up test data`,
            `// Reset state`,
            `// Close resources`
        ];
    }

    kebabCase(str) {
        if (!str) return '';
        return str.replace(/\W+/g, ' ')
                 .split(/ |\B(?=[A-Z])/)
                 .map(word => word.toLowerCase())
                 .join('-');
    }
}

module.exports = TemplateEngine;
