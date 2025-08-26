/**
 * Enhanced Template Manager - Phase 3.2 Integration
 * Orchestrates custom template loading, theming, inheritance, and dynamic composition
 * Provides unified interface for advanced template customization
 */

const CustomTemplateLoader = require('./custom-template-loader');
const ThemeEngine = require('../themes/theme-engine');
const TemplateInheritanceEngine = require('../inheritance/template-inheritance-engine');
const DynamicCompositionEngine = require('../composition/dynamic-composition-engine');

class EnhancedTemplateManager {
    constructor(options = {}) {
        this.options = options;
        this.initialized = false;
        
        // Core components
        this.templateLoader = null;
        this.themeEngine = null;
        this.inheritanceEngine = null;
        this.compositionEngine = null;
        
        // Configuration
        this.config = {
            templateDirectories: options.templateDirectories || [
                './templates',
                './themes',
                './.auto-coder/templates'
            ],
            themeDirectories: options.themeDirectories || [
                './themes',
                './.auto-coder/themes'
            ],
            defaultTheme: options.defaultTheme || 'standard',
            enableInheritance: options.enableInheritance !== false,
            enableComposition: options.enableComposition !== false,
            enableAnalytics: options.enableAnalytics !== false,
            enableCaching: options.enableCaching !== false,
            hotReload: options.hotReload !== false
        };
        
        // State management
        this.state = {
            activeTheme: this.config.defaultTheme,
            loadedTemplates: 0,
            loadedThemes: 0,
            compositionHistory: [],
            performanceMetrics: {
                avgGenerationTime: 0,
                totalGenerations: 0,
                cacheHitRate: 0
            }
        };
        
        console.log('🎨 Enhanced Template Manager initialized');
    }

    /**
     * Initialize all template management components
     */
    async initialize() {
        if (this.initialized) {
            console.log('⚠️  Template manager already initialized');
            return this;
        }

        console.log('🚀 Initializing enhanced template management...');
        const startTime = Date.now();

        try {
            // Initialize Custom Template Loader
            await this.initializeTemplateLoader();
            
            // Initialize Theme Engine
            await this.initializeThemeEngine();
            
            // Initialize Template Inheritance Engine
            await this.initializeInheritanceEngine();
            
            // Initialize Dynamic Composition Engine
            await this.initializeCompositionEngine();
            
            // Setup cross-component integration
            await this.setupIntegration();
            
            // Update state
            this.updateState();
            
            this.initialized = true;
            const initTime = Date.now() - startTime;
            
            console.log(`✅ Enhanced template management initialized in ${initTime}ms`);
            this.logInitializationSummary();
            
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize template manager:', error);
            throw error;
        }
    }

    /**
     * Initialize Custom Template Loader
     */
    async initializeTemplateLoader() {
        console.log('📁 Initializing custom template loader...');
        
        this.templateLoader = new CustomTemplateLoader({
            templateDirectories: this.config.templateDirectories,
            hotReload: this.config.hotReload,
            enableCaching: this.config.enableCaching
        });
        
        await this.templateLoader.initialize();
        
        // Setup event listeners
        this.templateLoader.events.on('templateLoaded', (template) => {
            console.log(`🔄 Template loaded: ${template.id}`);
            this.onTemplateLoaded(template);
        });
        
        this.templateLoader.events.on('templateReloaded', (template) => {
            console.log(`🔄 Template reloaded: ${template.id}`);
            this.onTemplateReloaded(template);
        });
        
        this.templateLoader.events.on('templateRemoved', (template) => {
            console.log(`🗑️  Template removed: ${template.id}`);
            this.onTemplateRemoved(template);
        });
    }

    /**
     * Initialize Theme Engine
     */
    async initializeThemeEngine() {
        console.log('🎨 Initializing theme engine...');
        
        this.themeEngine = new ThemeEngine({
            themeDirectories: this.config.themeDirectories,
            defaultTheme: this.config.defaultTheme
        });
        
        await this.themeEngine.initialize();
        
        // Set active theme
        await this.themeEngine.setActiveTheme(this.config.defaultTheme);
        this.state.activeTheme = this.config.defaultTheme;
    }

    /**
     * Initialize Template Inheritance Engine
     */
    async initializeInheritanceEngine() {
        if (!this.config.enableInheritance) {
            console.log('⏭️  Template inheritance disabled');
            return;
        }

        console.log('🏗️ Initializing template inheritance engine...');
        
        this.inheritanceEngine = new TemplateInheritanceEngine({
            enableCaching: this.config.enableCaching,
            validateInheritance: true
        });
        
        await this.inheritanceEngine.initialize();
        
        // Register existing templates with inheritance support
        if (this.templateLoader) {
            const templates = this.templateLoader.getAllTemplates();
            for (const template of templates) {
                this.inheritanceEngine.registerTemplate(template);
            }
        }
    }

    /**
     * Initialize Dynamic Composition Engine
     */
    async initializeCompositionEngine() {
        if (!this.config.enableComposition) {
            console.log('⏭️  Dynamic composition disabled');
            return;
        }

        console.log('🧠 Initializing dynamic composition engine...');
        
        this.compositionEngine = new DynamicCompositionEngine({
            templateLoader: this.templateLoader,
            themeEngine: this.themeEngine,
            inheritanceEngine: this.inheritanceEngine,
            enableAnalytics: this.config.enableAnalytics,
            enableCaching: this.config.enableCaching
        });
        
        await this.compositionEngine.initialize();
    }

    /**
     * Setup cross-component integration
     */
    async setupIntegration() {
        console.log('🔗 Setting up component integration...');
        
        // Template loader integration
        if (this.templateLoader) {
            // Register new templates with inheritance engine
            this.templateLoader.events.on('templateLoaded', (template) => {
                if (this.inheritanceEngine) {
                    this.inheritanceEngine.registerTemplate(template);
                }
            });
            
            // Clear composition cache when templates change
            this.templateLoader.events.on('templateReloaded', () => {
                if (this.compositionEngine) {
                    this.compositionEngine.clearCache();
                }
            });
        }
        
        // Theme integration
        if (this.themeEngine) {
            // Apply theme to new templates automatically
            // This could be enhanced with more sophisticated integration
        }
    }

    /**
     * Generate template with full customization support
     */
    async generateTemplate(context, options = {}) {
        if (!this.initialized) {
            throw new Error('Template manager not initialized');
        }

        const startTime = Date.now();
        console.log(`🎭 Generating template with advanced customization...`);
        console.log(`Context: ${JSON.stringify(context, null, 2)}`);

        try {
            // Use composition engine for intelligent template selection and assembly
            if (this.compositionEngine) {
                const composition = await this.compositionEngine.composeTemplate(context, options);
                
                // Record performance metrics
                const generationTime = Date.now() - startTime;
                this.updatePerformanceMetrics(generationTime);
                
                // Add to composition history
                this.state.compositionHistory.push({
                    timestamp: new Date().toISOString(),
                    context: context,
                    composition: {
                        id: composition.id,
                        strategy: composition.metadata.composition.strategy,
                        score: composition.metadata.composition.score
                    },
                    generationTime
                });
                
                console.log(`✅ Template generated in ${generationTime}ms with score ${composition.metadata.composition.score}`);
                return composition;
            }
            
            // Fallback to manual template selection
            return await this.generateTemplateFallback(context, options);
            
        } catch (error) {
            console.error('❌ Template generation failed:', error);
            throw error;
        }
    }

    /**
     * Fallback template generation without composition engine
     */
    async generateTemplateFallback(context, options) {
        console.log('🔄 Using fallback template generation...');
        
        // Find suitable template
        const candidates = this.templateLoader.findTemplates({
            framework: context.framework,
            type: context.type,
            theme: options.theme || this.state.activeTheme
        });
        
        if (candidates.length === 0) {
            throw new Error(`No suitable templates found for context: ${JSON.stringify(context)}`);
        }
        
        // Select best candidate (first one for now)
        const template = candidates[0];
        
        // Apply theme
        let themedContext = context;
        if (this.themeEngine) {
            themedContext = this.themeEngine.applyTheme(context, {
                theme: options.theme || this.state.activeTheme,
                framework: context.framework
            });
        }
        
        // Resolve inheritance
        let resolvedTemplate = template;
        if (this.inheritanceEngine && template.inheritance?.extends) {
            resolvedTemplate = await this.inheritanceEngine.resolveTemplate(template.id, themedContext);
        }
        
        // Generate final template
        const compiled = resolvedTemplate.compiled || this.templateLoader.getCompiledTemplate(template.id);
        const generated = compiled(themedContext);
        
        return {
            id: `fallback-${Date.now()}`,
            template: generated,
            compiled,
            metadata: {
                ...template.metadata,
                generatedAt: new Date().toISOString(),
                method: 'fallback',
                context: themedContext
            }
        };
    }

    /**
     * Set active theme
     */
    async setTheme(themeId) {
        if (!this.themeEngine) {
            throw new Error('Theme engine not available');
        }

        console.log(`🎨 Setting active theme: ${themeId}`);
        
        await this.themeEngine.setActiveTheme(themeId);
        this.state.activeTheme = themeId;
        
        // Clear caches to force regeneration with new theme
        this.clearCaches();
        
        console.log(`✅ Active theme set to: ${themeId}`);
    }

    /**
     * Register custom template
     */
    async registerTemplate(templateData) {
        if (!this.templateLoader) {
            throw new Error('Template loader not available');
        }

        console.log(`📝 Registering custom template: ${templateData.id}`);
        
        // Register with template loader
        const template = await this.templateLoader.loadTemplate(templateData.path, templateData.baseDirectory);
        
        // Register with inheritance engine if available
        if (this.inheritanceEngine) {
            this.inheritanceEngine.registerTemplate(template);
        }
        
        console.log(`✅ Custom template registered: ${template.id}`);
        return template;
    }

    /**
     * Register custom theme
     */
    async registerTheme(themeData) {
        if (!this.themeEngine) {
            throw new Error('Theme engine not available');
        }

        console.log(`🎨 Registering custom theme: ${themeData.id}`);
        
        // This would require extending the theme engine to support runtime theme registration
        // For now, themes need to be loaded from files during initialization
        
        throw new Error('Runtime theme registration not yet implemented');
    }

    /**
     * Get available templates
     */
    getAvailableTemplates(criteria = {}) {
        if (!this.templateLoader) {
            return [];
        }

        return this.templateLoader.findTemplates(criteria);
    }

    /**
     * Get available themes
     */
    getAvailableThemes() {
        if (!this.themeEngine) {
            return [];
        }

        return this.themeEngine.getAvailableThemes();
    }

    /**
     * Get template recommendations
     */
    getTemplateRecommendations(context) {
        if (!this.templateLoader) {
            return [];
        }

        return this.templateLoader.getRecommendations(context);
    }

    /**
     * Get composition analytics
     */
    getAnalytics() {
        const analytics = {
            state: { ...this.state },
            templates: {
                total: this.templateLoader?.getAllTemplates().length || 0,
                byFramework: {},
                byType: {},
                byTheme: {}
            },
            themes: {
                total: this.themeEngine?.getAvailableThemes().length || 0,
                active: this.state.activeTheme
            },
            performance: { ...this.state.performanceMetrics }
        };

        // Aggregate template statistics
        if (this.templateLoader) {
            const templates = this.templateLoader.getAllTemplates();
            
            for (const template of templates) {
                const metadata = template.metadata;
                
                // By framework
                for (const framework of metadata.framework || ['unknown']) {
                    analytics.templates.byFramework[framework] = 
                        (analytics.templates.byFramework[framework] || 0) + 1;
                }
                
                // By type
                analytics.templates.byType[metadata.type || 'unknown'] = 
                    (analytics.templates.byType[metadata.type || 'unknown'] || 0) + 1;
                
                // By theme
                analytics.templates.byTheme[metadata.theme || 'unknown'] = 
                    (analytics.templates.byTheme[metadata.theme || 'unknown'] || 0) + 1;
            }
        }

        // Add composition engine analytics if available
        if (this.compositionEngine) {
            analytics.composition = this.compositionEngine.getAnalyticsSummary();
        }

        return analytics;
    }

    /**
     * Event handlers
     */
    onTemplateLoaded(template) {
        this.state.loadedTemplates++;
        
        // Register with inheritance engine
        if (this.inheritanceEngine) {
            this.inheritanceEngine.registerTemplate(template);
        }
    }

    onTemplateReloaded(template) {
        // Clear caches to ensure fresh generation
        this.clearCaches();
    }

    onTemplateRemoved(template) {
        this.state.loadedTemplates--;
        
        // Clear caches
        this.clearCaches();
    }

    /**
     * Update state
     */
    updateState() {
        if (this.templateLoader) {
            this.state.loadedTemplates = this.templateLoader.getAllTemplates().length;
        }
        
        if (this.themeEngine) {
            this.state.loadedThemes = this.themeEngine.getAvailableThemes().length;
        }
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(generationTime) {
        const metrics = this.state.performanceMetrics;
        
        metrics.totalGenerations++;
        metrics.avgGenerationTime = (
            (metrics.avgGenerationTime * (metrics.totalGenerations - 1)) + generationTime
        ) / metrics.totalGenerations;
    }

    /**
     * Clear all caches
     */
    clearCaches() {
        console.log('🧹 Clearing template manager caches...');
        
        if (this.inheritanceEngine) {
            this.inheritanceEngine.clearCache();
        }
        
        if (this.compositionEngine) {
            this.compositionEngine.clearCache();
        }
        
        console.log('✅ All caches cleared');
    }

    /**
     * Log initialization summary
     */
    logInitializationSummary() {
        console.log('\n📊 Enhanced Template Manager Summary:');
        console.log(`   Templates: ${this.state.loadedTemplates}`);
        console.log(`   Themes: ${this.state.loadedThemes}`);
        console.log(`   Active Theme: ${this.state.activeTheme}`);
        console.log(`   Inheritance: ${this.config.enableInheritance ? 'Enabled' : 'Disabled'}`);
        console.log(`   Composition: ${this.config.enableComposition ? 'Enabled' : 'Disabled'}`);
        console.log(`   Analytics: ${this.config.enableAnalytics ? 'Enabled' : 'Disabled'}`);
        console.log(`   Hot Reload: ${this.config.hotReload ? 'Enabled' : 'Disabled'}`);
        
        if (this.templateLoader) {
            console.log('\n📁 Template Directories:');
            this.config.templateDirectories.forEach(dir => console.log(`   - ${dir}`));
        }
        
        if (this.themeEngine) {
            console.log('\n🎨 Available Themes:');
            this.themeEngine.getAvailableThemes().slice(0, 5).forEach(theme => 
                console.log(`   - ${theme.name} (${theme.type})`)
            );
        }
        
        console.log('\n✨ Advanced template customization ready!\n');
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        console.log('🧹 Cleaning up template manager...');
        
        if (this.templateLoader) {
            await this.templateLoader.cleanup();
        }
        
        this.clearCaches();
        this.initialized = false;
        
        console.log('✅ Template manager cleanup complete');
    }
}

module.exports = EnhancedTemplateManager;
