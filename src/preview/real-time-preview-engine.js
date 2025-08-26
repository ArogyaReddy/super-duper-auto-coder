/**
 * Real-time Preview Engine
 * 
 * Provides live preview and editing capabilities for templates.
 * Follows SBS_Automation patterns for reactive updates and validation.
 * 
 * Phase 3.3.3: Real-time Preview Engine
 */

const fs = require('fs-extra');
const path = require('path');
const EventEmitter = require('events');
const Handlebars = require('handlebars');
const chokidar = require('chokidar');

class RealTimePreviewEngine extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.config = {
            // Preview settings
            preview: {
                updateInterval: options.updateInterval || 300,
                debounceTime: options.debounceTime || 100,
                maxPreviewSize: options.maxPreviewSize || 100000, // 100KB
                enableSyntaxHighlighting: options.enableSyntaxHighlighting !== false,
                enableErrorHighlighting: options.enableErrorHighlighting !== false
            },
            
            // Rendering settings
            rendering: {
                engine: options.engine || 'handlebars',
                helpers: options.helpers || {},
                partials: options.partials || {},
                decorators: options.decorators || {},
                allowUnsafeEval: options.allowUnsafeEval || false
            },
            
            // Data generation
            dataGeneration: {
                contextTypes: options.contextTypes || ['playwright', 'jest', 'cucumber'],
                sampleDataSets: options.sampleDataSets || this.getDefaultSampleData(),
                dynamicDataGeneration: options.dynamicDataGeneration !== false
            },
            
            // Validation settings
            validation: {
                enableRealTimeValidation: options.enableRealTimeValidation !== false,
                validationRules: options.validationRules || [],
                showWarnings: options.showWarnings !== false,
                showHints: options.showHints !== false
            },
            
            // Performance settings
            performance: {
                enableCaching: options.enableCaching !== false,
                cacheSize: options.cacheSize || 50,
                enableProfiling: options.enableProfiling || false
            }
        };
        
        // Internal state
        this.previewStates = new Map();
        this.compiledTemplates = new Map();
        this.validationResults = new Map();
        this.watchers = new Map();
        this.updateTimers = new Map();
        this.renderingContexts = new Map();
        this.performanceMetrics = new Map();
        
        // Cache
        this.templateCache = new Map();
        this.dataCache = new Map();
        
        console.log('👀 Real-time Preview Engine initialized');
    }

    /**
     * Initialize the preview engine
     */
    async initialize() {
        console.log('👀 Initializing real-time preview engine...');
        
        try {
            // Setup rendering engine
            await this.setupRenderingEngine();
            
            // Register default helpers
            this.registerDefaultHelpers();
            
            // Setup validation
            if (this.config.validation.enableRealTimeValidation) {
                this.setupRealTimeValidation();
            }
            
            // Setup performance monitoring
            if (this.config.performance.enableProfiling) {
                this.setupPerformanceMonitoring();
            }
            
            console.log('✅ Real-time preview engine ready');
            this.emit('preview-engine-ready');
            
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize preview engine:', error.message);
            throw error;
        }
    }

    /**
     * Create a new preview session
     */
    async createPreviewSession(sessionId, templateContent, context = {}) {
        console.log(`👀 Creating preview session: ${sessionId}`);
        
        const session = {
            id: sessionId,
            templateContent: templateContent,
            context: context,
            lastUpdate: Date.now(),
            renderCount: 0,
            errorCount: 0,
            state: {
                isValid: false,
                hasErrors: false,
                hasWarnings: false,
                isRendering: false
            },
            preview: {
                rendered: '',
                compiled: null,
                errors: [],
                warnings: [],
                hints: []
            },
            metrics: {
                renderTime: 0,
                compilationTime: 0,
                validationTime: 0,
                lastRenderTime: null
            }
        };
        
        this.previewStates.set(sessionId, session);
        
        // Initial render
        await this.updatePreview(sessionId);
        
        this.emit('preview-session-created', { sessionId, session });
        return session;
    }

    /**
     * Update template content and trigger preview update
     */
    async updateTemplateContent(sessionId, templateContent) {
        const session = this.previewStates.get(sessionId);
        if (!session) {
            throw new Error(`Preview session not found: ${sessionId}`);
        }
        
        session.templateContent = templateContent;
        session.lastUpdate = Date.now();
        
        // Debounced update
        this.schedulePreviewUpdate(sessionId);
        
        this.emit('template-content-updated', { sessionId, templateContent });
    }

    /**
     * Update context data and trigger preview update
     */
    async updateContext(sessionId, context) {
        const session = this.previewStates.get(sessionId);
        if (!session) {
            throw new Error(`Preview session not found: ${sessionId}`);
        }
        
        session.context = { ...session.context, ...context };
        session.lastUpdate = Date.now();
        
        // Debounced update
        this.schedulePreviewUpdate(sessionId);
        
        this.emit('context-updated', { sessionId, context });
    }

    /**
     * Schedule a debounced preview update
     */
    schedulePreviewUpdate(sessionId) {
        // Clear existing timer
        if (this.updateTimers.has(sessionId)) {
            clearTimeout(this.updateTimers.get(sessionId));
        }
        
        // Schedule new update
        const timer = setTimeout(async () => {
            try {
                await this.updatePreview(sessionId);
            } catch (error) {
                console.error(`Preview update failed for ${sessionId}:`, error.message);
                this.emit('preview-update-error', { sessionId, error });
            }
            this.updateTimers.delete(sessionId);
        }, this.config.preview.debounceTime);
        
        this.updateTimers.set(sessionId, timer);
    }

    /**
     * Update preview for a session
     */
    async updatePreview(sessionId) {
        const startTime = Date.now();
        const session = this.previewStates.get(sessionId);
        
        if (!session) {
            throw new Error(`Preview session not found: ${sessionId}`);
        }
        
        session.state.isRendering = true;
        
        try {
            // Clear previous results
            session.preview.errors = [];
            session.preview.warnings = [];
            session.preview.hints = [];
            
            // Compile template
            const compilationStart = Date.now();
            const compiled = await this.compileTemplate(sessionId, session.templateContent);
            session.metrics.compilationTime = Date.now() - compilationStart;
            
            // Validate template
            const validationStart = Date.now();
            const validation = await this.validateTemplate(sessionId, session.templateContent, compiled);
            session.metrics.validationTime = Date.now() - validationStart;
            
            // Update validation state
            session.state.isValid = validation.isValid;
            session.state.hasErrors = validation.errors.length > 0;
            session.state.hasWarnings = validation.warnings.length > 0;
            session.preview.errors = validation.errors;
            session.preview.warnings = validation.warnings;
            session.preview.hints = validation.hints;
            
            // Generate context if needed
            const renderingContext = await this.generateRenderingContext(sessionId, session.context);
            
            // Render template
            const renderingStart = Date.now();
            const rendered = await this.renderTemplate(sessionId, compiled, renderingContext);
            session.metrics.renderTime = Date.now() - renderingStart;
            
            // Update session
            session.preview.rendered = rendered;
            session.preview.compiled = compiled;
            session.renderCount++;
            session.metrics.lastRenderTime = Date.now();
            
            // Store performance metrics
            const totalTime = Date.now() - startTime;
            this.updatePerformanceMetrics(sessionId, {
                totalTime,
                compilationTime: session.metrics.compilationTime,
                validationTime: session.metrics.validationTime,
                renderTime: session.metrics.renderTime
            });
            
            this.emit('preview-updated', {
                sessionId,
                session,
                rendered,
                validation,
                metrics: {
                    totalTime,
                    renderTime: session.metrics.renderTime
                }
            });
            
        } catch (error) {
            session.errorCount++;
            session.state.hasErrors = true;
            session.preview.errors.push({
                type: 'render-error',
                message: error.message,
                timestamp: new Date().toISOString()
            });
            
            console.error(`Preview update failed for ${sessionId}:`, error.message);
            this.emit('preview-error', { sessionId, error });
            
        } finally {
            session.state.isRendering = false;
        }
    }

    /**
     * Compile template with caching
     */
    async compileTemplate(sessionId, templateContent) {
        // Check cache first
        const cacheKey = this.generateCacheKey(templateContent);
        if (this.templateCache.has(cacheKey)) {
            return this.templateCache.get(cacheKey);
        }
        
        try {
            const compiled = Handlebars.compile(templateContent, {
                strict: false,
                assumeObjects: true,
                preventIndent: false,
                ignoreStandalone: true
            });
            
            // Cache compiled template
            if (this.config.performance.enableCaching) {
                this.cacheTemplate(cacheKey, compiled);
            }
            
            return compiled;
            
        } catch (error) {
            throw new Error(`Template compilation failed: ${error.message}`);
        }
    }

    /**
     * Validate template
     */
    async validateTemplate(sessionId, templateContent, compiled) {
        const validation = {
            isValid: true,
            errors: [],
            warnings: [],
            hints: []
        };
        
        try {
            // Syntax validation (already done during compilation)
            
            // Content validation
            await this.validateTemplateContent(templateContent, validation);
            
            // Context validation
            await this.validateTemplateContext(sessionId, templateContent, validation);
            
            // Custom validation rules
            await this.applyCustomValidationRules(sessionId, templateContent, validation);
            
            // Update overall validity
            validation.isValid = validation.errors.length === 0;
            
            // Store validation results
            this.validationResults.set(sessionId, validation);
            
            return validation;
            
        } catch (error) {
            validation.errors.push({
                type: 'validation-error',
                message: `Validation failed: ${error.message}`,
                timestamp: new Date().toISOString()
            });
            validation.isValid = false;
            return validation;
        }
    }

    /**
     * Validate template content
     */
    async validateTemplateContent(templateContent, validation) {
        // Check for common issues
        
        // Missing blocks
        const blockPattern = /\{\{#block\s+(\w+)\}\}/g;
        const endBlockPattern = /\{\{\/block\}\}/g;
        const blocks = [...templateContent.matchAll(blockPattern)];
        const endBlocks = [...templateContent.matchAll(endBlockPattern)];
        
        if (blocks.length !== endBlocks.length) {
            validation.errors.push({
                type: 'template-structure',
                message: 'Mismatched block tags - check for missing {{/block}}',
                line: this.findLineNumber(templateContent, blocks[blocks.length - 1]?.index || 0)
            });
        }
        
        // Undefined variables (heuristic check)
        const variablePattern = /\{\{\s*([^#/!>\s][^}]*)\s*\}\}/g;
        const variables = [...templateContent.matchAll(variablePattern)];
        
        for (const variable of variables) {
            const varName = variable[1].split(/\s+/)[0];
            if (varName && !this.isHelperOrBuiltIn(varName)) {
                validation.hints.push({
                    type: 'undefined-variable',
                    message: `Variable '${varName}' may be undefined - ensure it's provided in context`,
                    line: this.findLineNumber(templateContent, variable.index)
                });
            }
        }
        
        // Template size check
        if (templateContent.length > this.config.preview.maxPreviewSize) {
            validation.warnings.push({
                type: 'template-size',
                message: `Template is large (${templateContent.length} chars) - consider breaking into smaller templates`,
                line: 1
            });
        }
    }

    /**
     * Validate template context
     */
    async validateTemplateContext(sessionId, templateContent, validation) {
        const session = this.previewStates.get(sessionId);
        if (!session || !session.context) return;
        
        // Check for required context properties
        const requiredProps = this.extractRequiredProperties(templateContent);
        
        for (const prop of requiredProps) {
            if (!this.hasContextProperty(session.context, prop)) {
                validation.warnings.push({
                    type: 'missing-context',
                    message: `Context property '${prop}' is missing - template may not render correctly`,
                    property: prop
                });
            }
        }
    }

    /**
     * Apply custom validation rules
     */
    async applyCustomValidationRules(sessionId, templateContent, validation) {
        for (const rule of this.config.validation.validationRules) {
            try {
                const result = await rule.validate(sessionId, templateContent, this.previewStates.get(sessionId));
                
                if (result.errors) validation.errors.push(...result.errors);
                if (result.warnings) validation.warnings.push(...result.warnings);
                if (result.hints) validation.hints.push(...result.hints);
                
            } catch (error) {
                validation.errors.push({
                    type: 'validation-rule-error',
                    message: `Validation rule '${rule.name}' failed: ${error.message}`,
                    rule: rule.name
                });
            }
        }
    }

    /**
     * Generate rendering context
     */
    async generateRenderingContext(sessionId, baseContext) {
        const session = this.previewStates.get(sessionId);
        
        // Start with base context
        let context = { ...baseContext };
        
        // Add framework-specific context
        if (session.context.framework) {
            const frameworkContext = await this.generateFrameworkContext(session.context.framework);
            context = { ...context, ...frameworkContext };
        }
        
        // Add sample data if dynamic generation is enabled
        if (this.config.dataGeneration.dynamicDataGeneration) {
            const sampleData = await this.generateSampleData(sessionId, context);
            context = { ...context, ...sampleData };
        }
        
        // Add utility functions
        context._utils = this.getUtilityFunctions();
        context._session = {
            id: sessionId,
            timestamp: new Date().toISOString(),
            renderCount: session.renderCount
        };
        
        this.renderingContexts.set(sessionId, context);
        return context;
    }

    /**
     * Generate framework-specific context
     */
    async generateFrameworkContext(framework) {
        const frameworkContexts = {
            playwright: {
                page: 'page',
                browser: 'browser',
                context: 'context',
                baseUrl: 'https://example.com',
                selectors: {
                    button: '#submit-button',
                    input: '#username-input',
                    link: 'a[href="/home"]'
                },
                testData: {
                    username: 'testuser',
                    password: 'password123',
                    email: 'test@example.com'
                }
            },
            
            jest: {
                describe: 'describe',
                it: 'it',
                expect: 'expect',
                mockData: {
                    user: { id: 1, name: 'Test User' },
                    response: { success: true, data: [] }
                },
                testCases: [
                    { input: 5, expected: 10 },
                    { input: 0, expected: 0 },
                    { input: -1, expected: -2 }
                ]
            },
            
            cucumber: {
                feature: 'Sample Feature',
                scenario: 'Sample Scenario',
                steps: [
                    'Given I am on the login page',
                    'When I enter valid credentials',
                    'Then I should be logged in'
                ],
                background: 'Given the application is running',
                examples: [
                    { username: 'user1', password: 'pass1' },
                    { username: 'user2', password: 'pass2' }
                ]
            }
        };
        
        return frameworkContexts[framework] || {};
    }

    /**
     * Generate sample data
     */
    async generateSampleData(sessionId, context) {
        const sampleData = {};
        
        // Generate based on template type
        if (context.type === 'test') {
            sampleData.featureName = 'Sample Feature';
            sampleData.testName = 'should perform sample operation';
            sampleData.className = 'SampleTest';
        }
        
        if (context.type === 'page-object') {
            sampleData.pageClassName = 'SamplePage';
            sampleData.url = '/sample-page';
            sampleData.elements = {
                header: '#header',
                footer: '#footer',
                navigation: '.nav'
            };
        }
        
        // Add common sample data
        sampleData.timestamp = new Date().toISOString();
        sampleData.version = '1.0.0';
        sampleData.author = 'Auto-Coder Framework';
        
        return sampleData;
    }

    /**
     * Render template
     */
    async renderTemplate(sessionId, compiled, context) {
        try {
            const rendered = compiled(context);
            
            // Post-process rendered content
            return this.postProcessRenderedContent(rendered);
            
        } catch (error) {
            throw new Error(`Template rendering failed: ${error.message}`);
        }
    }

    /**
     * Post-process rendered content
     */
    postProcessRenderedContent(content) {
        // Clean up extra whitespace
        let processed = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        // Trim trailing whitespace from lines
        processed = processed.split('\n').map(line => line.trimEnd()).join('\n');
        
        // Ensure file ends with newline
        if (processed && !processed.endsWith('\n')) {
            processed += '\n';
        }
        
        return processed;
    }

    /**
     * Setup file watching for a template
     */
    async setupFileWatching(sessionId, filePath) {
        if (this.watchers.has(sessionId)) {
            this.watchers.get(sessionId).close();
        }
        
        const watcher = chokidar.watch(filePath, {
            persistent: true,
            ignoreInitial: true
        });
        
        watcher.on('change', async () => {
            try {
                const content = await fs.readFile(filePath, 'utf8');
                await this.updateTemplateContent(sessionId, content);
                
                console.log(`📁 Template file updated: ${filePath}`);
                this.emit('file-updated', { sessionId, filePath, content });
                
            } catch (error) {
                console.error(`File watch error for ${filePath}:`, error.message);
                this.emit('file-watch-error', { sessionId, filePath, error });
            }
        });
        
        this.watchers.set(sessionId, watcher);
        
        console.log(`👀 Watching file: ${filePath}`);
        this.emit('file-watch-started', { sessionId, filePath });
    }

    /**
     * Setup rendering engine
     */
    async setupRenderingEngine() {
        // Configure Handlebars
        Handlebars.logger.level = 0; // Reduce log verbosity
        
        // Register partials
        for (const [name, partial] of Object.entries(this.config.rendering.partials)) {
            Handlebars.registerPartial(name, partial);
        }
        
        // Register decorators
        for (const [name, decorator] of Object.entries(this.config.rendering.decorators)) {
            Handlebars.registerDecorator(name, decorator);
        }
        
        console.log('🎨 Rendering engine configured');
    }

    /**
     * Register default helpers
     */
    registerDefaultHelpers() {
        // Code formatting helpers
        Handlebars.registerHelper('indent', (content, spaces = 2) => {
            const indentation = ' '.repeat(spaces);
            return content.toString().split('\n').map(line => 
                line.trim() ? indentation + line : line
            ).join('\n');
        });
        
        Handlebars.registerHelper('camelCase', (str) => {
            return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        });
        
        Handlebars.registerHelper('kebabCase', (str) => {
            return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        });
        
        Handlebars.registerHelper('pascalCase', (str) => {
            return str.replace(/(^|-)([a-z])/g, (g, p1, p2) => p2.toUpperCase());
        });
        
        // Conditional helpers
        Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
        });
        
        Handlebars.registerHelper('ifContains', function(array, value, options) {
            if (Array.isArray(array) && array.includes(value)) {
                return options.fn(this);
            }
            return options.inverse(this);
        });
        
        // Date helpers
        Handlebars.registerHelper('formatDate', (date, format = 'YYYY-MM-DD') => {
            const d = new Date(date);
            return d.toISOString().split('T')[0];
        });
        
        Handlebars.registerHelper('timestamp', () => {
            return new Date().toISOString();
        });
        
        // Utility helpers
        Handlebars.registerHelper('json', (obj) => {
            return JSON.stringify(obj, null, 2);
        });
        
        Handlebars.registerHelper('escape', (str) => {
            return Handlebars.escapeExpression(str);
        });
        
        console.log('🔧 Default helpers registered');
    }

    /**
     * Setup real-time validation
     */
    setupRealTimeValidation() {
        this.on('template-content-updated', async ({ sessionId }) => {
            // Trigger validation after content update
            setTimeout(async () => {
                const session = this.previewStates.get(sessionId);
                if (session && !session.state.isRendering) {
                    await this.updatePreview(sessionId);
                }
            }, this.config.preview.debounceTime);
        });
        
        console.log('✅ Real-time validation enabled');
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        this.on('preview-updated', ({ sessionId, metrics }) => {
            this.updatePerformanceMetrics(sessionId, metrics);
        });
        
        // Log performance summary periodically
        setInterval(() => {
            this.logPerformanceSummary();
        }, 30000); // Every 30 seconds
        
        console.log('📊 Performance monitoring enabled');
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(sessionId, metrics) {
        if (!this.performanceMetrics.has(sessionId)) {
            this.performanceMetrics.set(sessionId, {
                totalRenders: 0,
                totalTime: 0,
                averageTime: 0,
                maxTime: 0,
                minTime: Infinity,
                lastUpdate: null
            });
        }
        
        const sessionMetrics = this.performanceMetrics.get(sessionId);
        sessionMetrics.totalRenders++;
        sessionMetrics.totalTime += metrics.totalTime;
        sessionMetrics.averageTime = sessionMetrics.totalTime / sessionMetrics.totalRenders;
        sessionMetrics.maxTime = Math.max(sessionMetrics.maxTime, metrics.totalTime);
        sessionMetrics.minTime = Math.min(sessionMetrics.minTime, metrics.totalTime);
        sessionMetrics.lastUpdate = Date.now();
    }

    /**
     * Log performance summary
     */
    logPerformanceSummary() {
        if (this.performanceMetrics.size === 0) return;
        
        console.log('📊 Performance Summary:');
        for (const [sessionId, metrics] of this.performanceMetrics) {
            console.log(`  ${sessionId}: ${metrics.totalRenders} renders, avg: ${metrics.averageTime.toFixed(1)}ms`);
        }
    }

    /**
     * Utility methods
     */
    generateCacheKey(content) {
        // Simple hash function for caching
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    cacheTemplate(key, compiled) {
        if (this.templateCache.size >= this.config.performance.cacheSize) {
            // Remove oldest entry
            const firstKey = this.templateCache.keys().next().value;
            this.templateCache.delete(firstKey);
        }
        
        this.templateCache.set(key, compiled);
    }

    findLineNumber(content, index) {
        return content.substring(0, index).split('\n').length;
    }

    isHelperOrBuiltIn(varName) {
        const helpers = ['if', 'unless', 'each', 'with', 'lookup', 'block', 'extend', 'override'];
        return helpers.includes(varName) || Handlebars.helpers[varName];
    }

    extractRequiredProperties(templateContent) {
        const properties = new Set();
        const variablePattern = /\{\{\s*([^#/!>\s][^}\s]*)/g;
        
        let match;
        while ((match = variablePattern.exec(templateContent)) !== null) {
            const varName = match[1].split('.')[0];
            if (!this.isHelperOrBuiltIn(varName)) {
                properties.add(varName);
            }
        }
        
        return Array.from(properties);
    }

    hasContextProperty(context, property) {
        return context && (context.hasOwnProperty(property) || context[property] !== undefined);
    }

    getUtilityFunctions() {
        return {
            formatCode: (code) => code.trim(),
            generateId: () => Math.random().toString(36).substr(2, 9),
            getCurrentDate: () => new Date().toISOString().split('T')[0],
            getCurrentTime: () => new Date().toISOString()
        };
    }

    getDefaultSampleData() {
        return {
            playwright: {
                featureName: 'User Login',
                pageObjectName: 'LoginPage',
                testUrl: 'https://example.com/login',
                selectors: {
                    username: '#username',
                    password: '#password',
                    submit: '#login-btn'
                }
            },
            jest: {
                moduleName: 'calculator',
                className: 'Calculator',
                methodName: 'add',
                testCases: [
                    { input: [2, 3], expected: 5 },
                    { input: [0, 0], expected: 0 }
                ]
            },
            cucumber: {
                featureName: 'User Registration',
                scenarios: [
                    'Successful registration with valid data',
                    'Registration fails with invalid email'
                ]
            }
        };
    }

    /**
     * Get preview session
     */
    getPreviewSession(sessionId) {
        return this.previewStates.get(sessionId);
    }

    /**
     * Get all preview sessions
     */
    getAllPreviewSessions() {
        return Array.from(this.previewStates.values());
    }

    /**
     * Remove preview session
     */
    async removePreviewSession(sessionId) {
        // Stop file watching
        if (this.watchers.has(sessionId)) {
            this.watchers.get(sessionId).close();
            this.watchers.delete(sessionId);
        }
        
        // Clear timers
        if (this.updateTimers.has(sessionId)) {
            clearTimeout(this.updateTimers.get(sessionId));
            this.updateTimers.delete(sessionId);
        }
        
        // Remove from maps
        this.previewStates.delete(sessionId);
        this.validationResults.delete(sessionId);
        this.renderingContexts.delete(sessionId);
        this.performanceMetrics.delete(sessionId);
        
        console.log(`🗑️  Removed preview session: ${sessionId}`);
        this.emit('preview-session-removed', { sessionId });
    }

    /**
     * Get all active preview sessions
     */
    getActiveSessions() {
        return Array.from(this.previewStates.entries()).map(([sessionId, session]) => ({
            sessionId,
            templateSessionId: session.templateSessionId,
            state: session.state,
            context: session.context,
            lastUpdate: session.lastUpdate,
            metrics: session.metrics
        }));
    }

    /**
     * Get preview session by ID
     */
    getPreviewSession(sessionId) {
        return this.previewStates.get(sessionId);
    }

    /**
     * Check if preview session exists
     */
    hasPreviewSession(sessionId) {
        return this.previewStates.has(sessionId);
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        // Close all watchers
        for (const watcher of this.watchers.values()) {
            watcher.close();
        }
        this.watchers.clear();
        
        // Clear all timers
        for (const timer of this.updateTimers.values()) {
            clearTimeout(timer);
        }
        this.updateTimers.clear();
        
        // Clear caches
        this.templateCache.clear();
        this.dataCache.clear();
        this.previewStates.clear();
        
        console.log('🧹 Real-time preview engine cleanup complete');
    }
}

module.exports = RealTimePreviewEngine;
