/**
 * Enhanced Visual Integration Manager
 * 
 * Orchestrates all Phase 3.3 Visual & Integration Features.
 * Follows SBS_Automation patterns for unified visual development experience.
 * 
 * Phase 3.3: Visual & Integration Features - Master Controller
 */

const fs = require('fs-extra');
const path = require('path');
const EventEmitter = require('events');

// Import Phase 3.3 components
const VisualTemplateBuilder = require('../visual/template-builder');
const IDEIntegrationManager = require('../integration/ide-integration-manager');
const RealTimePreviewEngine = require('../preview/real-time-preview-engine');
const TemplateMarketplaceIntegration = require('../marketplace/template-marketplace-integration');
const VisualWorkflowAutomation = require('../workflow/visual-workflow-automation');

class EnhancedVisualIntegrationManager extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.config = {
            // Component settings
            components: {
                templateBuilder: options.templateBuilder !== false,
                ideIntegration: options.ideIntegration !== false,
                previewEngine: options.previewEngine !== false,
                marketplace: options.marketplace !== false,
                workflowAutomation: options.workflowAutomation !== false
            },
            
            // Integration settings
            integration: {
                crossComponentEvents: options.crossComponentEvents !== false,
                sharedDataStore: options.sharedDataStore !== false,
                unifiedAPI: options.unifiedAPI !== false
            },
            
            // UI settings
            ui: {
                theme: options.theme || 'auto-coder-default',
                layout: options.layout || 'integrated',
                enableTabs: options.enableTabs !== false,
                enableSplitView: options.enableSplitView !== false
            },
            
            // Performance settings
            performance: {
                enableLazyLoading: options.enableLazyLoading !== false,
                maxConcurrentOperations: options.maxConcurrentOperations || 5,
                cacheSize: options.cacheSize || 100
            }
        };
        
        // Component instances
        this.components = {
            templateBuilder: null,
            ideIntegration: null,
            previewEngine: null,
            marketplace: null,
            workflowAutomation: null
        };
        
        // Shared state
        this.sharedDataStore = new Map();
        this.activeSession = null;
        this.crossComponentEventBus = new EventEmitter();
        
        // Integration state
        this.integrationState = {
            initialized: false,
            activeComponents: new Set(),
            eventSubscriptions: new Map(),
            sharedResources: new Map()
        };
        
        console.log('🎨 Enhanced Visual Integration Manager initialized');
    }

    /**
     * Initialize all Phase 3.3 components
     */
    async initialize() {
        console.log('🎨 Initializing Enhanced Visual Integration Manager...');
        
        try {
            // Initialize components based on configuration
            await this.initializeComponents();
            
            // Setup cross-component integration
            await this.setupCrossComponentIntegration();
            
            // Setup unified API
            if (this.config.integration.unifiedAPI) {
                this.setupUnifiedAPI();
            }
            
            // Setup shared data store
            if (this.config.integration.sharedDataStore) {
                this.setupSharedDataStore();
            }
            
            this.integrationState.initialized = true;
            
            console.log(`✅ Enhanced Visual Integration ready (${this.integrationState.activeComponents.size} components)`);
            this.emit('visual-integration-ready');
            
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize visual integration:', error.message);
            throw error;
        }
    }

    /**
     * Initialize individual components
     */
    async initializeComponents() {
        const initPromises = [];
        
        // Initialize Visual Template Builder
        if (this.config.components.templateBuilder) {
            initPromises.push(this.initializeTemplateBuilder());
        }
        
        // Initialize IDE Integration Manager
        if (this.config.components.ideIntegration) {
            initPromises.push(this.initializeIDEIntegration());
        }
        
        // Initialize Real-time Preview Engine
        if (this.config.components.previewEngine) {
            initPromises.push(this.initializePreviewEngine());
        }
        
        // Initialize Template Marketplace Integration
        if (this.config.components.marketplace) {
            initPromises.push(this.initializeMarketplace());
        }
        
        // Initialize Visual Workflow Automation
        if (this.config.components.workflowAutomation) {
            initPromises.push(this.initializeWorkflowAutomation());
        }
        
        await Promise.all(initPromises);
    }

    /**
     * Initialize Visual Template Builder
     */
    async initializeTemplateBuilder() {
        console.log('🎨 Initializing Visual Template Builder...');
        
        this.components.templateBuilder = new VisualTemplateBuilder({
            theme: this.config.ui.theme,
            layout: this.config.ui.layout,
            previewSettings: {
                livePreview: true,
                updateInterval: 300
            }
        });
        
        await this.components.templateBuilder.initialize();
        this.integrationState.activeComponents.add('templateBuilder');
        
        // Setup template builder events
        this.components.templateBuilder.on('template-saved', (data) => {
            this.handleTemplateBuilderEvent('template-saved', data);
        });
        
        this.components.templateBuilder.on('preview-updated', (data) => {
            this.handleTemplateBuilderEvent('preview-updated', data);
        });
        
        console.log('✅ Visual Template Builder ready');
    }

    /**
     * Initialize IDE Integration Manager
     */
    async initializeIDEIntegration() {
        console.log('🔌 Initializing IDE Integration Manager...');
        
        this.components.ideIntegration = new IDEIntegrationManager({
            vscode: true,
            intellij: true,
            languageServer: true,
            autoDetection: true
        });
        
        await this.components.ideIntegration.initialize();
        this.integrationState.activeComponents.add('ideIntegration');
        
        // Setup IDE integration events
        this.components.ideIntegration.on('integrations-ready', (data) => {
            this.handleIDEIntegrationEvent('integrations-ready', data);
        });
        
        console.log('✅ IDE Integration Manager ready');
    }

    /**
     * Initialize Real-time Preview Engine
     */
    async initializePreviewEngine() {
        console.log('👀 Initializing Real-time Preview Engine...');
        
        this.components.previewEngine = new RealTimePreviewEngine({
            updateInterval: 300,
            enableSyntaxHighlighting: true,
            enableErrorHighlighting: true,
            enableRealTimeValidation: true
        });
        
        await this.components.previewEngine.initialize();
        this.integrationState.activeComponents.add('previewEngine');
        
        // Setup preview engine events
        this.components.previewEngine.on('preview-updated', (data) => {
            this.handlePreviewEngineEvent('preview-updated', data);
        });
        
        this.components.previewEngine.on('validation-completed', (data) => {
            this.handlePreviewEngineEvent('validation-completed', data);
        });
        
        console.log('✅ Real-time Preview Engine ready');
    }

    /**
     * Initialize Template Marketplace Integration
     */
    async initializeMarketplace() {
        console.log('🛒 Initializing Template Marketplace Integration...');
        
        this.components.marketplace = new TemplateMarketplaceIntegration({
            enabled: true,
            defaultRegistry: 'https://templates.auto-coder.dev',
            validateRemoteTemplates: true,
            enableAutoSync: false
        });
        
        await this.components.marketplace.initialize();
        this.integrationState.activeComponents.add('marketplace');
        
        // Setup marketplace events
        this.components.marketplace.on('template-downloaded', (data) => {
            this.handleMarketplaceEvent('template-downloaded', data);
        });
        
        this.components.marketplace.on('template-installed', (data) => {
            this.handleMarketplaceEvent('template-installed', data);
        });
        
        console.log('✅ Template Marketplace Integration ready');
    }

    /**
     * Initialize Visual Workflow Automation
     */
    async initializeWorkflowAutomation() {
        console.log('⚡ Initializing Visual Workflow Automation...');
        
        this.components.workflowAutomation = new VisualWorkflowAutomation({
            enableVisualBuilder: true,
            allowParallelExecution: true,
            enableDebugMode: false
        });
        
        await this.components.workflowAutomation.initialize();
        this.integrationState.activeComponents.add('workflowAutomation');
        
        // Setup workflow automation events
        this.components.workflowAutomation.on('workflow-executed', (data) => {
            this.handleWorkflowAutomationEvent('workflow-executed', data);
        });
        
        console.log('✅ Visual Workflow Automation ready');
    }

    /**
     * Setup cross-component integration
     */
    async setupCrossComponentIntegration() {
        console.log('🔗 Setting up cross-component integration...');
        
        // Template Builder <-> Preview Engine Integration
        if (this.components.templateBuilder && this.components.previewEngine) {
            await this.integrateTemplateBuilderWithPreview();
        }
        
        // Template Builder <-> IDE Integration
        if (this.components.templateBuilder && this.components.ideIntegration) {
            await this.integrateTemplateBuilderWithIDE();
        }
        
        // Marketplace <-> Template Builder Integration
        if (this.components.marketplace && this.components.templateBuilder) {
            await this.integrateMarketplaceWithTemplateBuilder();
        }
        
        // Workflow Automation <-> All Components Integration
        if (this.components.workflowAutomation) {
            await this.integrateWorkflowAutomationWithComponents();
        }
        
        console.log('✅ Cross-component integration complete');
    }

    /**
     * Integrate Template Builder with Preview Engine
     */
    async integrateTemplateBuilderWithPreview() {
        console.log('🔗 Integrating Template Builder with Preview Engine...');
        
        // When template content changes in builder, update preview
        this.components.templateBuilder.on('component-added', async (data) => {
            try {
                const templateContent = await this.components.templateBuilder.generateTemplateContent();
                
                // Check if preview session exists, create if not
                const previewSessions = this.components.previewEngine.getActiveSessions();
                const existingSession = previewSessions.find(s => s.templateSessionId === data.session.id);
                
                if (existingSession) {
                    await this.components.previewEngine.updateTemplateContent(data.session.id, templateContent);
                } else {
                    // Create new preview session
                    await this.components.previewEngine.createPreviewSession(
                        data.session.id,
                        templateContent,
                        data.session.templateConfig
                    );
                }
            } catch (error) {
                console.warn('⚠️  Preview update failed:', error.message);
            }
        });
        
        this.components.templateBuilder.on('component-updated', async (data) => {
            try {
                const templateContent = await this.components.templateBuilder.generateTemplateContent();
                
                // Check if preview session exists, create if not
                const previewSessions = this.components.previewEngine.getActiveSessions();
                const existingSession = previewSessions.find(s => s.templateSessionId === data.session.id);
                
                if (existingSession) {
                    await this.components.previewEngine.updateTemplateContent(data.session.id, templateContent);
                } else {
                    // Create new preview session
                    await this.components.previewEngine.createPreviewSession(
                        data.session.id,
                        templateContent,
                        data.session.templateConfig
                    );
                }
            } catch (error) {
                console.warn('⚠️  Preview update failed:', error.message);
            }
        });
        
        // When preview validation completes, update template builder
        this.components.previewEngine.on('validation-completed', (data) => {
            this.crossComponentEventBus.emit('template-validation-updated', {
                sessionId: data.sessionId,
                validation: data.validation,
                source: 'previewEngine'
            });
        });
        
        console.log('✅ Template Builder <-> Preview Engine integration ready');
    }

    /**
     * Integrate Template Builder with IDE
     */
    async integrateTemplateBuilderWithIDE() {
        console.log('🔗 Integrating Template Builder with IDE...');
        
        // Send template builder commands to IDE
        this.components.templateBuilder.on('template-saved', (data) => {
            this.crossComponentEventBus.emit('ide-open-file', {
                filePath: data.filePath,
                source: 'templateBuilder'
            });
        });
        
        // Handle IDE commands for template builder
        this.crossComponentEventBus.on('ide-open-template-builder', async (data) => {
            if (this.components.templateBuilder.currentTemplate) {
                // Open current template in IDE
                const filePath = await this.components.templateBuilder.saveTemplate(
                    this.components.templateBuilder.currentTemplate.id
                );
                
                this.emit('ide-file-request', { filePath });
            }
        });
        
        console.log('✅ Template Builder <-> IDE integration ready');
    }

    /**
     * Integrate Marketplace with Template Builder
     */
    async integrateMarketplaceWithTemplateBuilder() {
        console.log('🔗 Integrating Marketplace with Template Builder...');
        
        // When template is downloaded from marketplace, offer to open in builder
        this.components.marketplace.on('template-downloaded', async (data) => {
            this.crossComponentEventBus.emit('marketplace-template-available', {
                template: data.template,
                source: 'marketplace'
            });
        });
        
        // Handle request to open marketplace template in builder
        this.crossComponentEventBus.on('open-marketplace-template', async (data) => {
            if (this.components.templateBuilder) {
                // Create new session with marketplace template
                const session = await this.components.templateBuilder.createTemplateSession({
                    name: data.template.name,
                    type: data.template.type,
                    framework: data.template.framework
                });
                
                // Load template content
                if (data.template.content) {
                    await this.components.templateBuilder.updateTemplateContent(session.id, data.template.content);
                }
            }
        });
        
        console.log('✅ Marketplace <-> Template Builder integration ready');
    }

    /**
     * Integrate Workflow Automation with all components
     */
    async integrateWorkflowAutomationWithComponents() {
        console.log('🔗 Integrating Workflow Automation with components...');
        
        // Provide template manager to workflow automation
        if (this.components.templateBuilder) {
            this.components.workflowAutomation.templateManager = {
                generateTemplate: async (templateId, context) => {
                    // Use template builder to generate template
                    const session = await this.components.templateBuilder.createTemplateSession({
                        name: context.name || 'Workflow Generated',
                        framework: context.framework || 'playwright'
                    });
                    
                    await this.components.templateBuilder.updateContext(session.id, context);
                    const content = await this.components.templateBuilder.generateTemplateContent();
                    
                    return {
                        content,
                        metadata: session.metadata
                    };
                }
            };
        }
        
        // Handle workflow execution events
        this.components.workflowAutomation.on('workflow-executed', (data) => {
            this.crossComponentEventBus.emit('workflow-completed', {
                workflowId: data.workflowId,
                result: data.result,
                source: 'workflowAutomation'
            });
        });
        
        console.log('✅ Workflow Automation integration ready');
    }

    /**
     * Setup unified API
     */
    setupUnifiedAPI() {
        console.log('🔗 Setting up unified API...');
        
        this.api = {
            // Template operations
            templates: {
                create: async (config) => {
                    if (!this.components.templateBuilder) {
                        throw new Error('Template Builder not available');
                    }
                    return await this.components.templateBuilder.createTemplateSession(config);
                },
                
                preview: async (sessionId, content, context) => {
                    if (!this.components.previewEngine) {
                        throw new Error('Preview Engine not available');
                    }
                    
                    let session = this.components.previewEngine.getPreviewSession(sessionId);
                    if (!session) {
                        session = await this.components.previewEngine.createPreviewSession(sessionId, content, context);
                    } else {
                        await this.components.previewEngine.updateTemplateContent(sessionId, content);
                        await this.components.previewEngine.updateContext(sessionId, context);
                    }
                    
                    return session;
                },
                
                save: async (sessionId, filePath) => {
                    if (!this.components.templateBuilder) {
                        throw new Error('Template Builder not available');
                    }
                    return await this.components.templateBuilder.saveTemplate(sessionId, filePath);
                }
            },
            
            // Marketplace operations
            marketplace: {
                search: async (query, options) => {
                    if (!this.components.marketplace) {
                        throw new Error('Marketplace not available');
                    }
                    return await this.components.marketplace.searchTemplates(query, options);
                },
                
                download: async (templateId, registryName) => {
                    if (!this.components.marketplace) {
                        throw new Error('Marketplace not available');
                    }
                    return await this.components.marketplace.downloadTemplate(templateId, registryName);
                },
                
                install: async (templateId, installPath, options) => {
                    if (!this.components.marketplace) {
                        throw new Error('Marketplace not available');
                    }
                    return await this.components.marketplace.installTemplate(templateId, installPath, options);
                }
            },
            
            // Workflow operations
            workflows: {
                create: async (config) => {
                    if (!this.components.workflowAutomation) {
                        throw new Error('Workflow Automation not available');
                    }
                    return await this.components.workflowAutomation.createWorkflow(config);
                },
                
                execute: async (workflowId, inputData, options) => {
                    if (!this.components.workflowAutomation) {
                        throw new Error('Workflow Automation not available');
                    }
                    return await this.components.workflowAutomation.executeWorkflow(workflowId, inputData, options);
                },
                
                save: async (workflowId, filePath) => {
                    if (!this.components.workflowAutomation) {
                        throw new Error('Workflow Automation not available');
                    }
                    return await this.components.workflowAutomation.saveWorkflow(workflowId, filePath);
                }
            },
            
            // Integration operations
            integration: {
                getStatus: () => {
                    return {
                        initialized: this.integrationState.initialized,
                        activeComponents: Array.from(this.integrationState.activeComponents),
                        availableFeatures: this.getAvailableFeatures()
                    };
                },
                
                triggerCrossComponentEvent: (eventName, data) => {
                    this.crossComponentEventBus.emit(eventName, data);
                },
                
                getSharedData: (key) => {
                    return this.sharedDataStore.get(key);
                },
                
                setSharedData: (key, value) => {
                    this.sharedDataStore.set(key, value);
                    this.crossComponentEventBus.emit('shared-data-updated', { key, value });
                }
            }
        };
        
        console.log('✅ Unified API ready');
    }

    /**
     * Setup shared data store
     */
    setupSharedDataStore() {
        console.log('🗄️  Setting up shared data store...');
        
        // Initialize with default shared data
        this.sharedDataStore.set('activeSession', null);
        this.sharedDataStore.set('currentTheme', this.config.ui.theme);
        this.sharedDataStore.set('recentTemplates', []);
        this.sharedDataStore.set('userPreferences', {});
        
        // Setup data change notifications
        this.crossComponentEventBus.on('shared-data-updated', (data) => {
            this.emit('shared-data-changed', data);
        });
        
        console.log('✅ Shared data store ready');
    }

    /**
     * Event handlers for cross-component communication
     */
    handleTemplateBuilderEvent(eventType, data) {
        this.crossComponentEventBus.emit(`template-builder:${eventType}`, data);
        
        // Update shared data
        if (eventType === 'template-saved') {
            const recent = this.sharedDataStore.get('recentTemplates') || [];
            recent.unshift(data);
            this.sharedDataStore.set('recentTemplates', recent.slice(0, 10));
        }
    }

    handleIDEIntegrationEvent(eventType, data) {
        this.crossComponentEventBus.emit(`ide-integration:${eventType}`, data);
    }

    handlePreviewEngineEvent(eventType, data) {
        this.crossComponentEventBus.emit(`preview-engine:${eventType}`, data);
    }

    handleMarketplaceEvent(eventType, data) {
        this.crossComponentEventBus.emit(`marketplace:${eventType}`, data);
    }

    handleWorkflowAutomationEvent(eventType, data) {
        this.crossComponentEventBus.emit(`workflow-automation:${eventType}`, data);
    }

    /**
     * Get available features based on active components
     */
    getAvailableFeatures() {
        const features = [];
        
        if (this.integrationState.activeComponents.has('templateBuilder')) {
            features.push('Visual Template Building', 'Component Palette', 'Property Editing');
        }
        
        if (this.integrationState.activeComponents.has('ideIntegration')) {
            features.push('IDE Integration', 'VS Code Extension', 'IntelliJ Plugin');
        }
        
        if (this.integrationState.activeComponents.has('previewEngine')) {
            features.push('Real-time Preview', 'Live Validation', 'Syntax Highlighting');
        }
        
        if (this.integrationState.activeComponents.has('marketplace')) {
            features.push('Template Marketplace', 'Template Search', 'Template Publishing');
        }
        
        if (this.integrationState.activeComponents.has('workflowAutomation')) {
            features.push('Visual Workflows', 'Automation Builder', 'Process Orchestration');
        }
        
        return features;
    }

    /**
     * Create comprehensive visual session
     */
    async createVisualSession(sessionConfig = {}) {
        console.log('🎨 Creating comprehensive visual session...');
        
        const sessionId = `visual_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const session = {
            id: sessionId,
            name: sessionConfig.name || 'Visual Development Session',
            created: new Date().toISOString(),
            components: {}
        };
        
        // Create template builder session
        if (this.components.templateBuilder) {
            session.components.templateBuilder = await this.components.templateBuilder.createTemplateSession({
                name: sessionConfig.templateName || session.name,
                framework: sessionConfig.framework || 'playwright',
                type: sessionConfig.type || 'test'
            });
        }
        
        // Create preview session
        if (this.components.previewEngine) {
            session.components.previewEngine = await this.components.previewEngine.createPreviewSession(
                sessionId,
                sessionConfig.initialTemplate || '{{!-- Template content --}}',
                sessionConfig.context || {}
            );
        }
        
        // Store as active session
        this.activeSession = session;
        this.sharedDataStore.set('activeSession', session);
        
        console.log(`✅ Visual session created: ${sessionId}`);
        this.emit('visual-session-created', { sessionId, session });
        
        return session;
    }

    /**
     * Get integration status
     */
    getIntegrationStatus() {
        return {
            initialized: this.integrationState.initialized,
            activeComponents: Array.from(this.integrationState.activeComponents),
            availableFeatures: this.getAvailableFeatures(),
            componentStatus: {
                templateBuilder: !!this.components.templateBuilder,
                ideIntegration: !!this.components.ideIntegration,
                previewEngine: !!this.components.previewEngine,
                marketplace: !!this.components.marketplace,
                workflowAutomation: !!this.components.workflowAutomation
            },
            activeSession: this.activeSession?.id || null,
            sharedDataKeys: Array.from(this.sharedDataStore.keys())
        };
    }

    /**
     * Get component by name
     */
    getComponent(componentName) {
        return this.components[componentName];
    }

    /**
     * Get unified API
     */
    getAPI() {
        if (!this.api) {
            throw new Error('Unified API not available - ensure integration is initialized');
        }
        return this.api;
    }

    /**
     * Cleanup all components and resources
     */
    async cleanup() {
        console.log('🧹 Cleaning up Enhanced Visual Integration Manager...');
        
        // Cleanup components
        const cleanupPromises = [];
        
        for (const [componentName, component] of Object.entries(this.components)) {
            if (component && typeof component.cleanup === 'function') {
                cleanupPromises.push(component.cleanup());
            }
        }
        
        await Promise.all(cleanupPromises);
        
        // Clear shared state
        this.sharedDataStore.clear();
        this.integrationState.activeComponents.clear();
        this.integrationState.eventSubscriptions.clear();
        this.integrationState.sharedResources.clear();
        
        // Remove all event listeners
        this.crossComponentEventBus.removeAllListeners();
        
        console.log('✅ Enhanced Visual Integration Manager cleanup complete');
    }
}

module.exports = EnhancedVisualIntegrationManager;
