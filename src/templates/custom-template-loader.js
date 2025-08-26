/**
 * Custom Template Loader - Phase 3.2.1
 * Enhanced template discovery, loading, and management system
 * Builds on existing template engine with advanced customization capabilities
 */

const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const Handlebars = require('handlebars');
const yaml = require('js-yaml');

class CustomTemplateLoader {
    constructor(options = {}) {
        this.templateDirectories = options.templateDirectories || [
            path.join(__dirname, '../../templates'),
            path.join(process.cwd(), 'templates'),
            path.join(process.cwd(), '.auto-coder/templates')
        ];
        
        this.templates = new Map();
        this.metadata = new Map();
        this.watchers = new Map();
        this.validationRules = new Map();
        
        // Template discovery patterns
        this.templatePatterns = {
            handlebars: '**/*.hbs',
            metadata: '**/*.meta.{json,yaml,yml}',
            config: '**/template.{json,yaml,yml}',
            validation: '**/*.validation.js'
        };
        
        // Template validation schema
        this.templateSchema = {
            required: ['id', 'name', 'type', 'framework'],
            properties: {
                id: { type: 'string', pattern: '^[a-z0-9-_]+$' },
                name: { type: 'string', minLength: 1 },
                version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
                type: { enum: ['feature', 'step', 'page', 'test', 'config', 'component'] },
                framework: { type: 'array', items: { type: 'string' } },
                theme: { type: 'string' },
                baseTemplate: { type: 'string' },
                dependencies: { type: 'array', items: { type: 'string' } }
            }
        };
        
        // Hot reload configuration
        this.hotReload = options.hotReload !== false;
        this.reloadDebounce = options.reloadDebounce || 300;
        
        // Event emitter for template changes
        this.events = new (require('events'))();
        
        console.log('🎨 Custom Template Loader initialized');
    }

    /**
     * Initialize template loader
     */
    async initialize() {
        console.log('🔍 Discovering custom templates...');
        
        // Ensure template directories exist
        await this.ensureTemplateDirectories();
        
        // Load all templates from directories
        await this.loadAllTemplates();
        
        // Setup hot reloading if enabled
        if (this.hotReload) {
            await this.setupHotReload();
        }
        
        // Validate all loaded templates
        await this.validateAllTemplates();
        
        console.log(`✅ Loaded ${this.templates.size} custom templates`);
        this.logTemplateSummary();
        
        return this;
    }

    /**
     * Ensure template directories exist
     */
    async ensureTemplateDirectories() {
        for (const dir of this.templateDirectories) {
            await fs.ensureDir(dir);
            console.log(`📁 Template directory: ${dir}`);
        }
    }

    /**
     * Load all templates from directories
     */
    async loadAllTemplates() {
        for (const directory of this.templateDirectories) {
            if (await fs.pathExists(directory)) {
                await this.loadTemplatesFromDirectory(directory);
            }
        }
    }

    /**
     * Load templates from specific directory
     */
    async loadTemplatesFromDirectory(directory) {
        console.log(`📂 Loading templates from: ${directory}`);
        
        // Find all Handlebars templates
        const templateFiles = await this.findFiles(directory, this.templatePatterns.handlebars);
        
        for (const templateFile of templateFiles) {
            try {
                await this.loadTemplate(templateFile, directory);
            } catch (error) {
                console.warn(`⚠️  Failed to load template: ${templateFile}`, error.message);
            }
        }
    }

    /**
     * Load individual template
     */
    async loadTemplate(templatePath, baseDirectory) {
        const relativePath = path.relative(baseDirectory, templatePath);
        const templateId = this.generateTemplateId(relativePath);
        
        console.log(`📄 Loading template: ${templateId}`);
        
        // Load template content
        const content = await fs.readFile(templatePath, 'utf8');
        
        // Load metadata
        const metadata = await this.loadTemplateMetadata(templatePath);
        
        // Load validation rules
        const validation = await this.loadTemplateValidation(templatePath);
        
        // Create template object
        const template = {
            id: templateId,
            path: templatePath,
            relativePath,
            baseDirectory,
            content,
            compiled: null, // Will be compiled on demand
            metadata: {
                ...this.getDefaultMetadata(templateId, relativePath),
                ...metadata
            },
            validation,
            loadedAt: new Date().toISOString(),
            lastModified: (await fs.stat(templatePath)).mtime.toISOString()
        };
        
        // Validate template
        this.validateTemplate(template);
        
        // Store template
        this.templates.set(templateId, template);
        this.metadata.set(templateId, template.metadata);
        
        if (validation) {
            this.validationRules.set(templateId, validation);
        }
        
        // Emit template loaded event
        this.events.emit('templateLoaded', template);
        
        return template;
    }

    /**
     * Load template metadata from .meta files
     */
    async loadTemplateMetadata(templatePath) {
        const metadataFiles = [
            templatePath.replace(/\.hbs$/, '.meta.json'),
            templatePath.replace(/\.hbs$/, '.meta.yaml'),
            templatePath.replace(/\.hbs$/, '.meta.yml')
        ];
        
        for (const metaFile of metadataFiles) {
            if (await fs.pathExists(metaFile)) {
                const content = await fs.readFile(metaFile, 'utf8');
                
                if (metaFile.endsWith('.json')) {
                    return JSON.parse(content);
                } else {
                    return yaml.load(content);
                }
            }
        }
        
        return {};
    }

    /**
     * Load template validation rules
     */
    async loadTemplateValidation(templatePath) {
        const validationFile = templatePath.replace(/\.hbs$/, '.validation.js');
        
        if (await fs.pathExists(validationFile)) {
            try {
                // Clear require cache for hot reloading
                delete require.cache[require.resolve(validationFile)];
                return require(validationFile);
            } catch (error) {
                console.warn(`⚠️  Failed to load validation for template: ${templatePath}`, error.message);
            }
        }
        
        return null;
    }

    /**
     * Generate template ID from file path
     */
    generateTemplateId(relativePath) {
        return relativePath
            .replace(/\.hbs$/, '')
            .replace(/[\/\\]/g, '-')
            .toLowerCase();
    }

    /**
     * Get default metadata for template
     */
    getDefaultMetadata(templateId, relativePath) {
        const pathParts = relativePath.split(path.sep);
        
        return {
            id: templateId,
            name: templateId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            version: '1.0.0',
            type: this.inferTemplateType(pathParts),
            framework: this.inferFrameworks(pathParts),
            theme: this.inferTheme(pathParts),
            category: pathParts[0] || 'general',
            tags: this.generateTags(pathParts),
            description: `Auto-generated template: ${templateId}`,
            author: 'Auto-Coder Framework',
            compatibility: ['all'],
            dependencies: [],
            variables: [],
            examples: []
        };
    }

    /**
     * Infer template type from path
     */
    inferTemplateType(pathParts) {
        const path = pathParts.join('/').toLowerCase();
        
        if (path.includes('feature')) return 'feature';
        if (path.includes('step')) return 'step';
        if (path.includes('page')) return 'page';
        if (path.includes('test')) return 'test';
        if (path.includes('config')) return 'config';
        if (path.includes('component')) return 'component';
        
        return 'general';
    }

    /**
     * Infer supported frameworks from path
     */
    inferFrameworks(pathParts) {
        const path = pathParts.join('/').toLowerCase();
        const frameworks = [];
        
        if (path.includes('playwright')) frameworks.push('playwright');
        if (path.includes('jest')) frameworks.push('jest');
        if (path.includes('cypress')) frameworks.push('cypress');
        if (path.includes('cucumber')) frameworks.push('cucumber');
        
        return frameworks.length > 0 ? frameworks : ['all'];
    }

    /**
     * Infer theme from path
     */
    inferTheme(pathParts) {
        const themes = ['minimal', 'standard', 'detailed', 'enterprise'];
        const path = pathParts.join('/').toLowerCase();
        
        for (const theme of themes) {
            if (path.includes(theme)) {
                return theme;
            }
        }
        
        return 'standard';
    }

    /**
     * Generate tags from path
     */
    generateTags(pathParts) {
        return pathParts
            .filter(part => part !== '.' && part !== '..')
            .map(part => part.toLowerCase())
            .filter((tag, index, arr) => arr.indexOf(tag) === index);
    }

    /**
     * Validate all loaded templates
     */
    async validateAllTemplates() {
        const errors = [];
        
        for (const [templateId, template] of this.templates) {
            try {
                this.validateTemplate(template);
            } catch (error) {
                errors.push(`Template ${templateId}: ${error.message}`);
            }
        }
        
        if (errors.length > 0) {
            console.warn(`⚠️  Template validation warnings:\n${errors.join('\n')}`);
        } else {
            console.log(`✅ All ${this.templates.size} templates validated successfully`);
        }
        
        return errors;
    }

    /**
     * Validate template structure and metadata
     */
    validateTemplate(template) {
        const errors = [];
        
        // Validate metadata against schema
        const metadataErrors = this.validateMetadata(template.metadata);
        errors.push(...metadataErrors);
        
        // Validate template content
        const contentErrors = this.validateTemplateContent(template.content);
        errors.push(...contentErrors);
        
        // Validate dependencies
        const dependencyErrors = this.validateDependencies(template.metadata.dependencies);
        errors.push(...dependencyErrors);
        
        if (errors.length > 0) {
            throw new Error(`Template validation failed for ${template.id}:\n${errors.join('\n')}`);
        }
        
        return true;
    }

    /**
     * Validate metadata against schema
     */
    validateMetadata(metadata) {
        const errors = [];
        
        // Check required fields
        for (const field of this.templateSchema.required) {
            if (!metadata[field]) {
                errors.push(`Missing required field: ${field}`);
            }
        }
        
        // Validate field types and constraints
        if (metadata.id && !/^[a-z0-9-_]+$/.test(metadata.id)) {
            errors.push('Template ID must contain only lowercase letters, numbers, hyphens, and underscores');
        }
        
        if (metadata.version && !/^\d+\.\d+\.\d+$/.test(metadata.version)) {
            errors.push('Version must follow semantic versioning (x.y.z)');
        }
        
        if (metadata.type && !['feature', 'step', 'page', 'test', 'config', 'component'].includes(metadata.type)) {
            errors.push('Invalid template type');
        }
        
        return errors;
    }

    /**
     * Validate template content for Handlebars syntax
     */
    validateTemplateContent(content) {
        const errors = [];
        
        try {
            // Try to compile the template
            Handlebars.compile(content);
        } catch (error) {
            errors.push(`Invalid Handlebars syntax: ${error.message}`);
        }
        
        return errors;
    }

    /**
     * Validate template dependencies
     */
    validateDependencies(dependencies) {
        const errors = [];
        
        if (dependencies && Array.isArray(dependencies)) {
            for (const dep of dependencies) {
                if (!this.templates.has(dep)) {
                    errors.push(`Missing dependency template: ${dep}`);
                }
            }
        }
        
        return errors;
    }

    /**
     * Setup hot reloading for templates
     */
    async setupHotReload() {
        console.log('🔥 Setting up hot reload for templates...');
        
        for (const directory of this.templateDirectories) {
            if (await fs.pathExists(directory)) {
                const watcher = chokidar.watch(directory, {
                    ignored: /(^|[\/\\])\../, // ignore dotfiles
                    persistent: true,
                    ignoreInitial: true
                });
                
                watcher
                    .on('add', path => this.handleTemplateChange('add', path, directory))
                    .on('change', path => this.handleTemplateChange('change', path, directory))
                    .on('unlink', path => this.handleTemplateChange('unlink', path, directory));
                
                this.watchers.set(directory, watcher);
            }
        }
    }

    /**
     * Handle template file changes
     */
    async handleTemplateChange(event, filePath, baseDirectory) {
        const debounceKey = `${event}:${filePath}`;
        
        // Debounce rapid file changes
        if (this.debounceTimers && this.debounceTimers[debounceKey]) {
            clearTimeout(this.debounceTimers[debounceKey]);
        }
        
        this.debounceTimers = this.debounceTimers || {};
        this.debounceTimers[debounceKey] = setTimeout(async () => {
            try {
                if (event === 'unlink') {
                    await this.handleTemplateRemoval(filePath, baseDirectory);
                } else {
                    await this.handleTemplateReload(filePath, baseDirectory);
                }
            } catch (error) {
                console.error(`Error handling template ${event}:`, error);
            }
            
            delete this.debounceTimers[debounceKey];
        }, this.reloadDebounce);
    }

    /**
     * Handle template reload
     */
    async handleTemplateReload(filePath, baseDirectory) {
        if (filePath.endsWith('.hbs')) {
            console.log(`🔄 Reloading template: ${filePath}`);
            
            try {
                const template = await this.loadTemplate(filePath, baseDirectory);
                this.events.emit('templateReloaded', template);
                console.log(`✅ Template reloaded: ${template.id}`);
            } catch (error) {
                console.error(`❌ Failed to reload template: ${filePath}`, error.message);
                this.events.emit('templateError', { path: filePath, error });
            }
        }
    }

    /**
     * Handle template removal
     */
    async handleTemplateRemoval(filePath, baseDirectory) {
        const relativePath = path.relative(baseDirectory, filePath);
        const templateId = this.generateTemplateId(relativePath);
        
        if (this.templates.has(templateId)) {
            console.log(`🗑️  Removing template: ${templateId}`);
            
            const template = this.templates.get(templateId);
            this.templates.delete(templateId);
            this.metadata.delete(templateId);
            this.validationRules.delete(templateId);
            
            this.events.emit('templateRemoved', template);
        }
    }

    /**
     * Get template by ID
     */
    getTemplate(templateId) {
        return this.templates.get(templateId);
    }

    /**
     * Get compiled template
     */
    getCompiledTemplate(templateId) {
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }
        
        if (!template.compiled) {
            template.compiled = Handlebars.compile(template.content);
        }
        
        return template.compiled;
    }

    /**
     * Find templates by criteria
     */
    findTemplates(criteria = {}) {
        const results = [];
        
        for (const [id, template] of this.templates) {
            if (this.matchesCriteria(template, criteria)) {
                results.push(template);
            }
        }
        
        return results;
    }

    /**
     * Check if template matches criteria
     */
    matchesCriteria(template, criteria) {
        const metadata = template.metadata;
        
        // Framework match
        if (criteria.framework) {
            if (!metadata.framework.includes('all') && !metadata.framework.includes(criteria.framework)) {
                return false;
            }
        }
        
        // Type match
        if (criteria.type && metadata.type !== criteria.type) {
            return false;
        }
        
        // Theme match
        if (criteria.theme && metadata.theme !== criteria.theme) {
            return false;
        }
        
        // Tag match
        if (criteria.tags) {
            const requiredTags = Array.isArray(criteria.tags) ? criteria.tags : [criteria.tags];
            if (!requiredTags.every(tag => metadata.tags.includes(tag))) {
                return false;
            }
        }
        
        // Category match
        if (criteria.category && metadata.category !== criteria.category) {
            return false;
        }
        
        return true;
    }

    /**
     * Get template recommendations for context
     */
    getRecommendations(context) {
        const candidates = this.findTemplates(context);
        
        // Score templates based on context match
        const scored = candidates.map(template => ({
            template,
            score: this.scoreTemplate(template, context)
        }));
        
        // Sort by score descending
        scored.sort((a, b) => b.score - a.score);
        
        return scored.map(item => ({
            ...item.template,
            score: item.score,
            reason: this.getRecommendationReason(item.template, context)
        }));
    }

    /**
     * Score template against context
     */
    scoreTemplate(template, context) {
        let score = 0;
        const metadata = template.metadata;
        
        // Framework match (high weight)
        if (context.framework) {
            if (metadata.framework.includes(context.framework)) {
                score += 50;
            } else if (metadata.framework.includes('all')) {
                score += 25;
            }
        }
        
        // Type match (high weight)
        if (context.type && metadata.type === context.type) {
            score += 40;
        }
        
        // Theme match (medium weight)
        if (context.theme && metadata.theme === context.theme) {
            score += 20;
        }
        
        // Tag overlap (medium weight)
        if (context.tags && metadata.tags) {
            const commonTags = context.tags.filter(tag => metadata.tags.includes(tag));
            score += commonTags.length * 10;
        }
        
        // Category match (low weight)
        if (context.category && metadata.category === context.category) {
            score += 10;
        }
        
        // Compatibility (low weight)
        if (metadata.compatibility.includes('all') || 
            (context.compatibility && metadata.compatibility.includes(context.compatibility))) {
            score += 5;
        }
        
        return score;
    }

    /**
     * Get recommendation reason
     */
    getRecommendationReason(template, context) {
        const reasons = [];
        const metadata = template.metadata;
        
        if (context.framework && metadata.framework.includes(context.framework)) {
            reasons.push(`Supports ${context.framework} framework`);
        }
        
        if (context.type && metadata.type === context.type) {
            reasons.push(`Matches ${context.type} template type`);
        }
        
        if (context.theme && metadata.theme === context.theme) {
            reasons.push(`Uses ${context.theme} theme`);
        }
        
        return reasons.join(', ') || 'General compatibility';
    }

    /**
     * Find files matching pattern
     */
    async findFiles(directory, pattern) {
        const glob = require('glob');
        
        return new Promise((resolve, reject) => {
            glob(pattern, { cwd: directory, absolute: true }, (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }
            });
        });
    }

    /**
     * Log template loading summary
     */
    logTemplateSummary() {
        const summary = {
            total: this.templates.size,
            byType: {},
            byFramework: {},
            byTheme: {}
        };
        
        for (const template of this.templates.values()) {
            const metadata = template.metadata;
            
            // Count by type
            summary.byType[metadata.type] = (summary.byType[metadata.type] || 0) + 1;
            
            // Count by framework
            for (const framework of metadata.framework) {
                summary.byFramework[framework] = (summary.byFramework[framework] || 0) + 1;
            }
            
            // Count by theme
            summary.byTheme[metadata.theme] = (summary.byTheme[metadata.theme] || 0) + 1;
        }
        
        console.log('📊 Template Summary:');
        console.log(`   Total: ${summary.total}`);
        console.log(`   Types: ${JSON.stringify(summary.byType, null, 2)}`);
        console.log(`   Frameworks: ${JSON.stringify(summary.byFramework, null, 2)}`);
        console.log(`   Themes: ${JSON.stringify(summary.byTheme, null, 2)}`);
    }

    /**
     * Get all templates
     */
    getAllTemplates() {
        return Array.from(this.templates.values());
    }

    /**
     * Get template metadata
     */
    getTemplateMetadata(templateId) {
        return this.metadata.get(templateId);
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        console.log('🧹 Cleaning up template loader...');
        
        // Close file watchers
        for (const watcher of this.watchers.values()) {
            await watcher.close();
        }
        
        this.watchers.clear();
        this.templates.clear();
        this.metadata.clear();
        this.validationRules.clear();
        
        console.log('✅ Template loader cleanup complete');
    }
}

module.exports = CustomTemplateLoader;
