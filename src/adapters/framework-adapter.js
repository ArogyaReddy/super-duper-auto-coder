/**
 * Framework Adapter Base - Abstract base class for all framework adapters
 * Provides common interface and functionality for different testing frameworks
 */

const fs = require('fs-extra');
const path = require('path');
const Handlebars = require('handlebars');

class FrameworkAdapter {
    constructor(options = {}) {
        this.frameworkName = this.constructor.name.replace('Adapter', '').toLowerCase();
        this.options = {
            outputPath: options.outputPath || './SBS_Automation',
            includeComments: options.includeComments !== false,
            includeExamples: options.includeExamples !== false,
            templatePath: options.templatePath,
            ...options
        };
        
        this.templates = {};
        this.helpers = {};
        this.initialized = false;
    }

    /**
     * Initialize the adapter - must be implemented by subclasses
     */
    async initialize() {
        if (this.initialized) return;

        // Adapter initialized silently
        
        try {
            await this.loadFrameworkTemplates();
            this.registerFrameworkHelpers();
            this.setupFrameworkConfig();
            
            this.initialized = true;
            console.log(`✅ ${this.frameworkName} adapter initialized`);
        } catch (error) {
            console.error(`❌ Failed to initialize ${this.frameworkName} adapter:`, error.message);
            throw error;
        }
    }

    /**
     * Load framework-specific templates
     */
    async loadFrameworkTemplates() {
        const templatePath = this.options.templatePath || 
            path.join(__dirname, `../../templates/${this.frameworkName}`);
        
        if (await fs.pathExists(templatePath)) {
            const templateFiles = await fs.readdir(templatePath);
            
            for (const file of templateFiles) {
                if (file.endsWith('.hbs')) {
                    const templateName = path.basename(file, '.hbs');
                    const templateContent = await fs.readFile(path.join(templatePath, file), 'utf8');
                    this.templates[templateName] = Handlebars.compile(templateContent);
                }
            }
            
            console.log(`📄 Loaded ${Object.keys(this.templates).length} ${this.frameworkName} templates`);
        } else {
            console.log(`⚠️ No templates found for ${this.frameworkName}, using defaults`);
            this.createDefaultTemplates();
        }
    }

    /**
     * Register framework-specific Handlebars helpers
     */
    registerFrameworkHelpers() {
        // Base helpers - can be overridden by subclasses
        this.helpers = {
            frameworkName: () => this.frameworkName,
            frameworkImport: () => this.getFrameworkImport(),
            testDeclaration: () => this.getTestDeclaration(),
            assertionSyntax: (actual, expected, type) => this.getAssertionSyntax(actual, expected, type),
            setupCode: () => this.getSetupCode(),
            teardownCode: () => this.getTeardownCode()
        };

        // Register helpers with Handlebars
        Object.keys(this.helpers).forEach(name => {
            Handlebars.registerHelper(`${this.frameworkName}_${name}`, this.helpers[name]);
        });
    }

    /**
     * Setup framework-specific configuration
     */
    setupFrameworkConfig() {
        // Override in subclasses for framework-specific setup
    }

    /**
     * Generate test artifacts for the framework
     */
    async generateArtifacts(analysis, matches, templateContext) {
        if (!this.initialized) {
            await this.initialize();
        }

        console.log(`🎨 Generating ${this.frameworkName} artifacts...`);

        const artifacts = {
            framework: this.frameworkName,
            files: {},
            metadata: {
                generatedAt: new Date().toISOString(),
                framework: this.frameworkName,
                analysis: analysis,
                confidence: matches.confidence
            }
        };

        // Generate framework-specific files
        const context = this.enhanceContext(templateContext, analysis, matches);
        
        // Main test file
        artifacts.files.test = await this.generateTestFile(context);
        
        // Page object (if applicable)
        if (this.supportsPageObjects()) {
            artifacts.files.page = await this.generatePageObject(context);
        }
        
        // Configuration file
        artifacts.files.config = await this.generateConfigFile(context);
        
        // Utility/helper files
        artifacts.files.helpers = await this.generateHelperFiles(context);

                // Generation completed silently
        return artifacts;
    }

    /**
     * Enhance template context with framework-specific data
     */
    enhanceContext(baseContext, analysis, matches) {
        return {
            ...baseContext,
            framework: {
                name: this.frameworkName,
                import: this.getFrameworkImport(),
                testDeclaration: this.getTestDeclaration(),
                setupCode: this.getSetupCode(),
                teardownCode: this.getTeardownCode(),
                fileExtension: this.getFileExtension()
            },
            selectors: this.generateSelectors(analysis),
            actions: this.generateActions(analysis),
            assertions: this.generateAssertions(analysis, matches)
        };
    }

    /**
     * Generate selectors based on entities
     */
    generateSelectors(analysis) {
        return analysis.entities.map(entity => ({
            name: entity.entity,
            selector: this.getDefaultSelector(entity.entity),
            type: 'element'
        }));
    }

    /**
     * Generate actions based on analysis
     */
    generateActions(analysis) {
        return analysis.actions.map(action => ({
            name: action.action,
            method: this.getActionMethod(action.action),
            description: `${action.action} action`
        }));
    }

    /**
     * Generate assertions based on intent and matches
     */
    generateAssertions(analysis, matches) {
        const assertions = [];
        
        switch (analysis.intent) {
            case 'testing':
                assertions.push(this.getAssertionSyntax('result', 'expected', 'toBe'));
                break;
            case 'creation':
                assertions.push(this.getAssertionSyntax('element', true, 'toBeVisible'));
                break;
            case 'navigation':
                assertions.push(this.getAssertionSyntax('url', 'expectedUrl', 'toContain'));
                break;
            default:
                assertions.push(this.getAssertionSyntax('result', 'defined', 'toBeDefined'));
        }
        
        return assertions;
    }

    // Abstract methods to be implemented by subclasses
    
    /**
     * Get framework import statement
     */
    getFrameworkImport() {
        throw new Error('getFrameworkImport must be implemented by subclass');
    }

    /**
     * Get test declaration syntax
     */
    getTestDeclaration() {
        throw new Error('getTestDeclaration must be implemented by subclass');
    }

    /**
     * Get assertion syntax
     */
    getAssertionSyntax(actual, expected, type) {
        throw new Error('getAssertionSyntax must be implemented by subclass');
    }

    /**
     * Get setup code
     */
    getSetupCode() {
        return '// Setup code';
    }

    /**
     * Get teardown code
     */
    getTeardownCode() {
        return '// Teardown code';
    }

    /**
     * Get file extension for test files
     */
    getFileExtension() {
        return '.js';
    }

    /**
     * Check if framework supports page objects
     */
    supportsPageObjects() {
        return true;
    }

    /**
     * Get default selector for entity
     */
    getDefaultSelector(entityName) {
        return `[data-cy="${entityName.toLowerCase()}"]`;
    }

    /**
     * Get action method name for framework
     */
    getActionMethod(actionName) {
        const actionMap = {
            'click': 'click',
            'type': 'fill',
            'select': 'selectOption',
            'verify': 'expect'
        };
        return actionMap[actionName] || actionName;
    }

    // Generation methods to be implemented/overridden by subclasses

    async generateTestFile(context) {
        const template = this.templates.test || this.createDefaultTestTemplate();
        return template(context);
    }

    async generatePageObject(context) {
        if (!this.supportsPageObjects()) return null;
        
        const template = this.templates.page || this.createDefaultPageTemplate();
        return template(context);
    }

    async generateConfigFile(context) {
        const template = this.templates.config || this.createDefaultConfigTemplate();
        return template(context);
    }

    async generateHelperFiles(context) {
        const template = this.templates.helpers || this.createDefaultHelpersTemplate();
        return template(context);
    }

    // Default template creators - can be overridden by subclasses

    createDefaultTemplates() {
        this.templates = {
            test: this.createDefaultTestTemplate(),
            page: this.createDefaultPageTemplate(),
            config: this.createDefaultConfigTemplate(),
            helpers: this.createDefaultHelpersTemplate()
        };
    }

    createDefaultTestTemplate() {
        return Handlebars.compile(`// Generated ${this.frameworkName} test
{{framework.import}}

describe('{{titleCase featureName}}', () => {
  {{#if framework.setupCode}}
  beforeEach(() => {
    {{framework.setupCode}}
  });
  {{/if}}

  it('should {{primaryAction}} {{primaryEntity}}', async () => {
    // Test implementation
    {{#each actions}}
    // {{description}}
    {{/each}}
    
    // Assertions
    {{#each assertions}}
    {{this}}
    {{/each}}
  });

  {{#if framework.teardownCode}}
  afterEach(() => {
    {{framework.teardownCode}}
  });
  {{/if}}
});`);
    }

    createDefaultPageTemplate() {
        return Handlebars.compile(`// Generated ${this.frameworkName} page object
class {{titleCase className}} {
  constructor(page) {
    this.page = page;
  }

  {{#each selectors}}
  get {{camelCase name}}() {
    return this.page.locator('{{selector}}');
  }
  {{/each}}

  {{#each actions}}
  async {{camelCase name}}{{titleCase ../primaryEntity}}() {
    // Implementation for {{name}}
  }
  {{/each}}
}

module.exports = {{titleCase className}};`);
    }

    createDefaultConfigTemplate() {
        return Handlebars.compile(`// Generated ${this.frameworkName} configuration
module.exports = {
  // Framework-specific configuration
  framework: '{{framework.name}}',
  testDir: './tests',
  timeout: 30000
};`);
    }

    createDefaultHelpersTemplate() {
        return Handlebars.compile(`// Generated ${this.frameworkName} helpers
{{#each actions}}
function {{camelCase name}}Helper() {
  // Helper for {{name}} action
}
{{/each}}

module.exports = {
  {{#each actions}}
  {{camelCase name}}Helper,
  {{/each}}
};`);
    }

    /**
     * Validate generated artifacts
     */
    validateArtifacts(artifacts) {
        const issues = [];
        
        // Check required files
        if (!artifacts.files.test) {
            issues.push('Missing test file');
        }
        
        // Framework-specific validation can be added in subclasses
        
        return {
            valid: issues.length === 0,
            issues
        };
    }

    /**
     * Get framework capabilities
     */
    getCapabilities() {
        return {
            framework: this.frameworkName,
            supportsPageObjects: this.supportsPageObjects(),
            supportedFileTypes: this.getSupportedFileTypes(),
            features: this.getFrameworkFeatures()
        };
    }

    getSupportedFileTypes() {
        return ['test', 'page', 'config', 'helpers'];
    }

    getFrameworkFeatures() {
        return [];
    }
}

module.exports = FrameworkAdapter;
