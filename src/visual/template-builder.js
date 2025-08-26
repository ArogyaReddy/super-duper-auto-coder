/**
 * Visual Template Builder
 * 
 * Provides visual interface for building and editing templates with real-time preview.
 * Follows SBS_Automation patterns for component-based development.
 * 
 * Phase 3.3.1: Visual Template Builder
 */

const fs = require('fs-extra');
const path = require('path');
const EventEmitter = require('events');
const Handlebars = require('handlebars');

class VisualTemplateBuilder extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.config = {
            // Component library for visual building
            componentLibrary: options.componentLibrary || this.getDefaultComponents(),
            
            // Template validation rules
            validationRules: options.validationRules || this.getDefaultValidationRules(),
            
            // Preview settings
            previewSettings: {
                updateInterval: options.updateInterval || 500,
                autoSave: options.autoSave !== false,
                livePreview: options.livePreview !== false,
                ...options.previewSettings
            },
            
            // UI settings
            uiSettings: {
                theme: options.theme || 'light',
                layout: options.layout || 'horizontal-split',
                fontSize: options.fontSize || 14,
                ...options.uiSettings
            },
            
            // Integration settings
            integrations: {
                vscode: options.vscode || false,
                webInterface: options.webInterface !== false,
                ...options.integrations
            }
        };
        
        // Internal state
        this.currentTemplate = null;
        this.previewData = null;
        this.validationErrors = [];
        this.unsavedChanges = false;
        this.previewTimer = null;
        
        // Component registry
        this.componentRegistry = new Map();
        this.templateSessions = new Map();
        
        console.log('🎨 Visual Template Builder initialized');
    }

    /**
     * Initialize the visual template builder
     */
    async initialize() {
        console.log('🎨 Initializing visual template builder...');
        
        try {
            // Register default components
            await this.registerDefaultComponents();
            
            // Setup UI components
            await this.setupUIComponents();
            
            // Initialize preview engine
            await this.initializePreviewEngine();
            
            // Setup auto-save if enabled
            if (this.config.previewSettings.autoSave) {
                this.setupAutoSave();
            }
            
            // Setup validation
            this.setupValidation();
            
            console.log('✅ Visual template builder ready');
            this.emit('builder-ready');
            
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize visual template builder:', error.message);
            throw error;
        }
    }

    /**
     * Create a new template building session
     */
    async createTemplateSession(templateConfig = {}) {
        const sessionId = this.generateSessionId();
        
        const session = {
            id: sessionId,
            templateConfig: {
                type: templateConfig.type || 'test',
                framework: templateConfig.framework || 'playwright',
                name: templateConfig.name || 'New Template',
                ...templateConfig
            },
            components: [],
            blocks: new Map(),
            metadata: {
                created: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                version: '1.0.0'
            },
            state: {
                isModified: false,
                validationStatus: 'pending',
                previewStatus: 'ready'
            }
        };
        
        this.templateSessions.set(sessionId, session);
        this.currentTemplate = session;
        
        console.log(`🎨 Created template session: ${sessionId}`);
        this.emit('session-created', { sessionId, session });
        
        return session;
    }

    /**
     * Add component to current template
     */
    async addComponent(componentType, configuration = {}) {
        if (!this.currentTemplate) {
            throw new Error('No active template session');
        }
        
        const component = await this.createComponent(componentType, configuration);
        this.currentTemplate.components.push(component);
        this.currentTemplate.state.isModified = true;
        this.currentTemplate.metadata.lastModified = new Date().toISOString();
        
        // Trigger preview update
        await this.updatePreview();
        
        console.log(`🧩 Added component: ${componentType}`);
        this.emit('component-added', { component, session: this.currentTemplate });
        
        return component;
    }

    /**
     * Create a component instance
     */
    async createComponent(type, config) {
        const componentDefinition = this.componentRegistry.get(type);
        if (!componentDefinition) {
            throw new Error(`Unknown component type: ${type}`);
        }
        
        const componentId = this.generateComponentId();
        
        return {
            id: componentId,
            type,
            config: {
                ...componentDefinition.defaultConfig,
                ...config
            },
            template: componentDefinition.template,
            validation: componentDefinition.validation,
            created: new Date().toISOString()
        };
    }

    /**
     * Update template preview
     */
    async updatePreview(immediate = false) {
        if (!this.currentTemplate) {
            return;
        }
        
        // Clear existing timer
        if (this.previewTimer) {
            clearTimeout(this.previewTimer);
        }
        
        const updateFn = async () => {
            try {
                const templateContent = await this.generateTemplateContent();
                const compiledTemplate = await this.compileTemplate(templateContent);
                
                // Generate preview with sample data
                const previewData = this.generatePreviewData();
                const renderedPreview = compiledTemplate(previewData);
                
                this.previewData = {
                    content: templateContent,
                    compiled: compiledTemplate,
                    rendered: renderedPreview,
                    data: previewData,
                    timestamp: new Date().toISOString()
                };
                
                this.emit('preview-updated', {
                    session: this.currentTemplate,
                    preview: this.previewData
                });
                
            } catch (error) {
                console.error('❌ Preview update failed:', error.message);
                this.emit('preview-error', { error, session: this.currentTemplate });
            }
        };
        
        if (immediate) {
            await updateFn();
        } else {
            this.previewTimer = setTimeout(updateFn, this.config.previewSettings.updateInterval);
        }
    }

    /**
     * Generate template content from components
     */
    async generateTemplateContent() {
        if (!this.currentTemplate) {
            throw new Error('No active template session');
        }
        
        let templateContent = '';
        
        // Add template header
        templateContent += this.generateTemplateHeader();
        
        // Process components in order
        for (const component of this.currentTemplate.components) {
            const componentContent = await this.renderComponent(component);
            templateContent += componentContent + '\n';
        }
        
        // Add template footer
        templateContent += this.generateTemplateFooter();
        
        return templateContent;
    }

    /**
     * Render individual component
     */
    async renderComponent(component) {
        const componentTemplate = Handlebars.compile(component.template);
        return componentTemplate(component.config);
    }

    /**
     * Generate template header
     */
    generateTemplateHeader() {
        const config = this.currentTemplate.templateConfig;
        
        return `{{!-- ${config.name} --}}
{{!-- Generated by Visual Template Builder --}}
{{!-- Framework: ${config.framework}, Type: ${config.type} --}}

`;
    }

    /**
     * Generate template footer
     */
    generateTemplateFooter() {
        return `
{{!-- End of ${this.currentTemplate.templateConfig.name} --}}
`;
    }

    /**
     * Compile template content
     */
    async compileTemplate(content) {
        try {
            return Handlebars.compile(content);
        } catch (error) {
            throw new Error(`Template compilation failed: ${error.message}`);
        }
    }

    /**
     * Generate sample preview data
     */
    generatePreviewData() {
        const config = this.currentTemplate.templateConfig;
        
        // Generate sample data based on template type and framework
        const baseData = {
            featureName: 'Sample Feature',
            moduleName: 'sampleModule',
            className: 'SampleClass',
            testName: 'should perform sample operation',
            framework: config.framework,
            type: config.type
        };
        
        // Add framework-specific data
        switch (config.framework) {
            case 'playwright':
                return {
                    ...baseData,
                    pageObjectName: 'SamplePage',
                    selector: '#sample-element',
                    url: '/sample-page',
                    baseUrl: 'https://example.com'
                };
                
            case 'jest':
                return {
                    ...baseData,
                    mockData: { id: 1, name: 'Sample' },
                    expectedResult: { success: true }
                };
                
            case 'cucumber':
                return {
                    ...baseData,
                    scenario: 'Sample scenario',
                    steps: [
                        'Given I am on the sample page',
                        'When I click the sample button',
                        'Then I should see the sample result'
                    ]
                };
                
            default:
                return baseData;
        }
    }

    /**
     * Validate current template
     */
    async validateTemplate() {
        if (!this.currentTemplate) {
            return { valid: false, errors: ['No active template'] };
        }
        
        const errors = [];
        
        try {
            // Validate template structure
            if (this.currentTemplate.components.length === 0) {
                errors.push('Template must contain at least one component');
            }
            
            // Validate each component
            for (const component of this.currentTemplate.components) {
                const componentErrors = await this.validateComponent(component);
                errors.push(...componentErrors);
            }
            
            // Validate template compilation
            try {
                const content = await this.generateTemplateContent();
                await this.compileTemplate(content);
            } catch (error) {
                errors.push(`Template compilation error: ${error.message}`);
            }
            
            // Apply custom validation rules
            const customErrors = await this.applyValidationRules();
            errors.push(...customErrors);
            
            this.validationErrors = errors;
            this.currentTemplate.state.validationStatus = errors.length === 0 ? 'valid' : 'invalid';
            
            this.emit('validation-completed', {
                session: this.currentTemplate,
                valid: errors.length === 0,
                errors
            });
            
            return { valid: errors.length === 0, errors };
            
        } catch (error) {
            console.error('❌ Validation failed:', error.message);
            return { valid: false, errors: [`Validation error: ${error.message}`] };
        }
    }

    /**
     * Validate individual component
     */
    async validateComponent(component) {
        const errors = [];
        
        // Check component definition exists
        const definition = this.componentRegistry.get(component.type);
        if (!definition) {
            errors.push(`Unknown component type: ${component.type}`);
            return errors;
        }
        
        // Apply component-specific validation
        if (definition.validation) {
            try {
                const validationResult = await definition.validation(component.config);
                if (!validationResult.valid) {
                    errors.push(...validationResult.errors);
                }
            } catch (error) {
                errors.push(`Component validation error: ${error.message}`);
            }
        }
        
        return errors;
    }

    /**
     * Apply custom validation rules
     */
    async applyValidationRules() {
        const errors = [];
        
        for (const rule of this.config.validationRules) {
            try {
                const result = await rule.validate(this.currentTemplate);
                if (!result.valid) {
                    errors.push(...result.errors);
                }
            } catch (error) {
                errors.push(`Validation rule error: ${error.message}`);
            }
        }
        
        return errors;
    }

    /**
     * Save current template
     */
    async saveTemplate(filePath) {
        if (!this.currentTemplate) {
            throw new Error('No active template to save');
        }
        
        // Validate before saving
        const validation = await this.validateTemplate();
        if (!validation.valid) {
            throw new Error(`Cannot save invalid template: ${validation.errors.join(', ')}`);
        }
        
        const templateContent = await this.generateTemplateContent();
        
        // Ensure directory exists
        await fs.ensureDir(path.dirname(filePath));
        
        // Save template file
        await fs.writeFile(filePath, templateContent, 'utf8');
        
        // Save metadata
        const metadataPath = filePath.replace('.hbs', '.metadata.json');
        await fs.writeFile(metadataPath, JSON.stringify({
            session: this.currentTemplate,
            validation: validation,
            savedAt: new Date().toISOString()
        }, null, 2));
        
        this.currentTemplate.state.isModified = false;
        
        console.log(`💾 Template saved: ${filePath}`);
        this.emit('template-saved', { filePath, session: this.currentTemplate });
        
        return filePath;
    }

    /**
     * Load template from file
     */
    async loadTemplate(filePath) {
        if (!await fs.pathExists(filePath)) {
            throw new Error(`Template file not found: ${filePath}`);
        }
        
        const content = await fs.readFile(filePath, 'utf8');
        const metadataPath = filePath.replace('.hbs', '.metadata.json');
        
        let session = null;
        if (await fs.pathExists(metadataPath)) {
            const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
            session = metadata.session;
        } else {
            // Create basic session from template content
            session = await this.createTemplateSession({
                name: path.basename(filePath, '.hbs'),
                type: 'imported'
            });
        }
        
        // Parse template content back to components (simplified)
        session.rawContent = content;
        
        this.templateSessions.set(session.id, session);
        this.currentTemplate = session;
        
        await this.updatePreview(true);
        
        console.log(`📂 Template loaded: ${filePath}`);
        this.emit('template-loaded', { filePath, session });
        
        return session;
    }

    /**
     * Export template for different targets
     */
    async exportTemplate(format = 'handlebars', options = {}) {
        if (!this.currentTemplate) {
            throw new Error('No active template to export');
        }
        
        const validation = await this.validateTemplate();
        if (!validation.valid && !options.allowInvalid) {
            throw new Error(`Cannot export invalid template: ${validation.errors.join(', ')}`);
        }
        
        switch (format) {
            case 'handlebars':
                return await this.generateTemplateContent();
                
            case 'json':
                return JSON.stringify(this.currentTemplate, null, 2);
                
            case 'package':
                return await this.exportAsPackage(options);
                
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Export template as package
     */
    async exportAsPackage(options = {}) {
        const templateContent = await this.generateTemplateContent();
        const packageData = {
            name: this.currentTemplate.templateConfig.name,
            version: this.currentTemplate.metadata.version,
            description: options.description || 'Generated template package',
            template: templateContent,
            metadata: this.currentTemplate.metadata,
            components: this.currentTemplate.components,
            validation: await this.validateTemplate(),
            exportedAt: new Date().toISOString()
        };
        
        return packageData;
    }

    /**
     * Register default components
     */
    async registerDefaultComponents() {
        // Register test framework components
        this.registerComponent('test-setup', {
            name: 'Test Setup',
            category: 'structure',
            template: `{{#block setup}}
describe('{{featureName}}', () => {
    {{#if beforeEach}}
    beforeEach(async () => {
        {{beforeEach}}
    });
    {{/if}}
{{/block}}`,
            defaultConfig: {
                featureName: 'Feature Name',
                beforeEach: '// Setup code'
            },
            validation: (config) => ({
                valid: !!config.featureName,
                errors: config.featureName ? [] : ['Feature name is required']
            })
        });
        
        this.registerComponent('test-case', {
            name: 'Test Case',
            category: 'test',
            template: `    it('{{testDescription}}', async () => {
        {{#each steps}}
        {{this}}
        {{/each}}
        
        {{#each assertions}}
        expect({{this.actual}}).{{this.matcher}}({{this.expected}});
        {{/each}}
    });`,
            defaultConfig: {
                testDescription: 'should do something',
                steps: ['// Test steps'],
                assertions: [
                    { actual: 'result', matcher: 'toBe', expected: 'expected' }
                ]
            },
            validation: (config) => ({
                valid: !!config.testDescription,
                errors: config.testDescription ? [] : ['Test description is required']
            })
        });
        
        this.registerComponent('page-object', {
            name: 'Page Object',
            category: 'playwright',
            template: `class {{className}} {
    constructor(page) {
        this.page = page;
        {{#each selectors}}
        this.{{@key}} = '{{this}}';
        {{/each}}
    }
    
    {{#each methods}}
    async {{this.name}}({{this.params}}) {
        {{this.body}}
    }
    
    {{/each}}
}`,
            defaultConfig: {
                className: 'PageObject',
                selectors: {
                    element: '#selector'
                },
                methods: [
                    {
                        name: 'clickElement',
                        params: '',
                        body: 'await this.page.click(this.element);'
                    }
                ]
            },
            validation: (config) => ({
                valid: !!config.className,
                errors: config.className ? [] : ['Class name is required']
            })
        });
        
        console.log(`🧩 Registered ${this.componentRegistry.size} default components`);
    }

    /**
     * Register a component
     */
    registerComponent(type, definition) {
        this.componentRegistry.set(type, {
            type,
            ...definition,
            registeredAt: new Date().toISOString()
        });
        
        this.emit('component-registered', { type, definition });
    }

    /**
     * Setup UI components
     */
    async setupUIComponents() {
        // This would integrate with actual UI framework
        // For now, just setup the component structure
        
        this.uiComponents = {
            componentPalette: this.createComponentPalette(),
            templateEditor: this.createTemplateEditor(),
            previewPane: this.createPreviewPane(),
            propertyPanel: this.createPropertyPanel()
        };
        
        console.log('🎨 UI components setup complete');
    }

    /**
     * Create component palette
     */
    createComponentPalette() {
        const categories = {};
        
        for (const [type, definition] of this.componentRegistry) {
            const category = definition.category || 'general';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push({
                type,
                name: definition.name,
                description: definition.description
            });
        }
        
        return {
            categories,
            search: (query) => {
                const results = [];
                for (const [type, definition] of this.componentRegistry) {
                    if (definition.name.toLowerCase().includes(query.toLowerCase()) ||
                        type.toLowerCase().includes(query.toLowerCase())) {
                        results.push({ type, definition });
                    }
                }
                return results;
            }
        };
    }

    /**
     * Create template editor
     */
    createTemplateEditor() {
        return {
            content: '',
            cursor: { line: 0, column: 0 },
            selection: null,
            history: [],
            
            // Editor operations
            insertComponent: (component, position) => {
                // Insert component at position
                this.emit('editor-component-inserted', { component, position });
            },
            
            updateComponent: (componentId, config) => {
                // Update component configuration
                this.emit('editor-component-updated', { componentId, config });
            },
            
            deleteComponent: (componentId) => {
                // Delete component
                this.emit('editor-component-deleted', { componentId });
            }
        };
    }

    /**
     * Create preview pane
     */
    createPreviewPane() {
        return {
            content: '',
            mode: 'rendered', // 'rendered', 'raw', 'compiled'
            splitView: false,
            
            setMode: (mode) => {
                this.uiComponents.previewPane.mode = mode;
                this.emit('preview-mode-changed', { mode });
            },
            
            toggleSplitView: () => {
                this.uiComponents.previewPane.splitView = !this.uiComponents.previewPane.splitView;
                this.emit('preview-split-toggled');
            }
        };
    }

    /**
     * Create property panel
     */
    createPropertyPanel() {
        return {
            selectedComponent: null,
            properties: {},
            
            selectComponent: (componentId) => {
                const component = this.findComponent(componentId);
                this.uiComponents.propertyPanel.selectedComponent = component;
                this.uiComponents.propertyPanel.properties = component ? component.config : {};
                this.emit('property-panel-component-selected', { component });
            },
            
            updateProperty: (property, value) => {
                if (this.uiComponents.propertyPanel.selectedComponent) {
                    this.uiComponents.propertyPanel.properties[property] = value;
                    this.emit('property-panel-property-updated', { property, value });
                }
            }
        };
    }

    /**
     * Initialize preview engine
     */
    async initializePreviewEngine() {
        // Setup Handlebars helpers for preview
        Handlebars.registerHelper('debugLog', (value) => {
            console.log('🔍 Template Debug:', value);
            return '';
        });
        
        Handlebars.registerHelper('formatCode', (code) => {
            // Basic code formatting for preview
            return code.trim().split('\n').map(line => `  ${line}`).join('\n');
        });
        
        // Register block helpers
        Handlebars.registerHelper('block', function(name, options) {
            if (!options) {
                return '';
            }
            const content = options.fn ? options.fn(this) : '';
            return content;
        });
        
        Handlebars.registerHelper('each', function(context, options) {
            if (!Array.isArray(context)) {
                return options.inverse ? options.inverse(this) : '';
            }
            let result = '';
            for (let i = 0; i < context.length; i++) {
                result += options.fn(context[i]);
            }
            return result;
        });
        
        Handlebars.registerHelper('if', function(condition, options) {
            if (condition) {
                return options.fn ? options.fn(this) : '';
            } else {
                return options.inverse ? options.inverse(this) : '';
            }
        });
        
        Handlebars.registerHelper('unless', function(condition, options) {
            if (!condition) {
                return options.fn ? options.fn(this) : '';
            } else {
                return options.inverse ? options.inverse(this) : '';
            }
        });
        
        // Register utility helpers
        Handlebars.registerHelper('eq', (a, b) => a === b);
        Handlebars.registerHelper('ne', (a, b) => a !== b);
        Handlebars.registerHelper('gt', (a, b) => a > b);
        Handlebars.registerHelper('lt', (a, b) => a < b);
        Handlebars.registerHelper('and', (a, b) => a && b);
        Handlebars.registerHelper('or', (a, b) => a || b);
        Handlebars.registerHelper('not', (a) => !a);
        Handlebars.registerHelper('capitalize', (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '');
        Handlebars.registerHelper('lowercase', (str) => str ? str.toLowerCase() : '');
        Handlebars.registerHelper('uppercase', (str) => str ? str.toUpperCase() : '');
        
        console.log('🔍 Preview engine initialized');
    }

    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        setInterval(() => {
            if (this.currentTemplate && this.currentTemplate.state.isModified) {
                this.autoSave();
            }
        }, 30000); // Auto-save every 30 seconds
        
        console.log('💾 Auto-save enabled (30s interval)');
    }

    /**
     * Auto-save current template
     */
    async autoSave() {
        if (!this.currentTemplate) return;
        
        try {
            const autoSavePath = this.getAutoSavePath();
            await this.saveTemplate(autoSavePath);
            console.log('💾 Auto-saved template');
        } catch (error) {
            console.error('❌ Auto-save failed:', error.message);
        }
    }

    /**
     * Setup validation
     */
    setupValidation() {
        // Real-time validation
        this.on('component-added', () => this.validateTemplate());
        this.on('component-updated', () => this.validateTemplate());
        this.on('component-deleted', () => this.validateTemplate());
        
        console.log('✅ Real-time validation enabled');
    }

    /**
     * Get default components
     */
    getDefaultComponents() {
        return [
            'test-setup',
            'test-case',
            'page-object',
            'step-definition',
            'mock-data',
            'assertion'
        ];
    }

    /**
     * Get default validation rules
     */
    getDefaultValidationRules() {
        return [
            {
                name: 'RequiredComponents',
                validate: (session) => {
                    const hasTestCase = session.components.some(c => c.type === 'test-case');
                    return {
                        valid: hasTestCase,
                        errors: hasTestCase ? [] : ['Template must contain at least one test case']
                    };
                }
            },
            {
                name: 'FrameworkConsistency',
                validate: (session) => {
                    const framework = session.templateConfig.framework;
                    const incompatibleComponents = session.components.filter(c => {
                        const definition = this.componentRegistry.get(c.type);
                        return definition && definition.framework && definition.framework !== framework;
                    });
                    
                    return {
                        valid: incompatibleComponents.length === 0,
                        errors: incompatibleComponents.map(c => 
                            `Component ${c.type} is not compatible with framework ${framework}`
                        )
                    };
                }
            }
        ];
    }

    /**
     * Utility methods
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateComponentId() {
        return `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    findComponent(componentId) {
        if (!this.currentTemplate) return null;
        return this.currentTemplate.components.find(c => c.id === componentId);
    }

    getAutoSavePath() {
        const sessionId = this.currentTemplate.id;
        return path.join(process.cwd(), '.auto-save', `${sessionId}.hbs`);
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        if (this.previewTimer) {
            clearTimeout(this.previewTimer);
        }
        
        console.log('🧹 Visual template builder cleanup complete');
    }
}

module.exports = VisualTemplateBuilder;
