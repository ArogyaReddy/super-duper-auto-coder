/**
 * Template Marketplace Integration
 * 
 * Provides marketplace functionality for sharing and discovering templates.
 * Follows SBS_Automation patterns for extensible marketplace ecosystem.
 * 
 * Phase 3.3.4: Template Marketplace Integration
 */

const fs = require('fs-extra');
const path = require('path');
const EventEmitter = require('events');
const axios = require('axios');

class TemplateMarketplaceIntegration extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.config = {
            // Marketplace settings
            marketplace: {
                enabled: options.enabled !== false,
                defaultRegistry: options.defaultRegistry || 'https://templates.auto-coder.dev',
                customRegistries: options.customRegistries || [],
                cacheDirectory: options.cacheDirectory || path.join(process.cwd(), '.template-cache'),
                autoUpdate: options.autoUpdate !== false
            },
            
            // Authentication
            authentication: {
                apiKey: options.apiKey || process.env.AUTO_CODER_API_KEY,
                username: options.username || process.env.AUTO_CODER_USERNAME,
                requireAuth: options.requireAuth || false
            },
            
            // Template management
            templates: {
                allowRemoteExecution: options.allowRemoteExecution || false,
                validateRemoteTemplates: options.validateRemoteTemplates !== false,
                maxTemplateSize: options.maxTemplateSize || 1024 * 1024, // 1MB
                trustedPublishers: options.trustedPublishers || []
            },
            
            // Search and discovery
            search: {
                enableFuzzySearch: options.enableFuzzySearch !== false,
                maxResults: options.maxResults || 50,
                cacheSearchResults: options.cacheSearchResults !== false,
                searchTimeout: options.searchTimeout || 5000
            },
            
            // Sync settings
            sync: {
                enableAutoSync: options.enableAutoSync || false,
                syncInterval: options.syncInterval || 3600000, // 1 hour
                backgroundSync: options.backgroundSync !== false
            }
        };
        
        // Internal state
        this.registries = new Map();
        this.templateCache = new Map();
        this.searchCache = new Map();
        this.downloadQueue = new Map();
        this.syncTimers = new Map();
        this.authTokens = new Map();
        
        // Initialize registries
        this.initializeRegistries();
        
        console.log('🛒 Template Marketplace Integration initialized');
    }

    /**
     * Initialize marketplace integration
     */
    async initialize() {
        console.log('🛒 Initializing template marketplace integration...');
        
        try {
            // Setup cache directory
            await this.setupCacheDirectory();
            
            // Connect to registries
            await this.connectToRegistries();
            
            // Load cached templates
            await this.loadCachedTemplates();
            
            // Setup auto-sync if enabled
            if (this.config.sync.enableAutoSync) {
                this.setupAutoSync();
            }
            
            console.log(`✅ Marketplace integration ready (${this.registries.size} registries)`);
            this.emit('marketplace-ready');
            
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize marketplace integration:', error.message);
            throw error;
        }
    }

    /**
     * Search for templates
     */
    async searchTemplates(query, options = {}) {
        console.log(`🔍 Searching templates: "${query}"`);
        
        const searchOptions = {
            framework: options.framework,
            type: options.type,
            tags: options.tags || [],
            publisher: options.publisher,
            minRating: options.minRating || 0,
            maxResults: options.maxResults || this.config.search.maxResults,
            includePreview: options.includePreview || false,
            sortBy: options.sortBy || 'relevance' // relevance, downloads, rating, date
        };
        
        // Check cache first
        const cacheKey = this.generateSearchCacheKey(query, searchOptions);
        if (this.config.search.cacheSearchResults && this.searchCache.has(cacheKey)) {
            const cached = this.searchCache.get(cacheKey);
            if (Date.now() - cached.timestamp < 300000) { // 5 minutes
                console.log('📦 Returning cached search results');
                return cached.results;
            }
        }
        
        const allResults = [];
        
        // Search across all connected registries
        const searchPromises = Array.from(this.registries.values()).map(async (registry) => {
            try {
                const results = await this.searchRegistry(registry, query, searchOptions);
                return results.map(result => ({ ...result, registry: registry.name }));
            } catch (error) {
                console.warn(`Search failed for registry ${registry.name}:`, error.message);
                return [];
            }
        });
        
        const registryResults = await Promise.all(searchPromises);
        
        // Combine and deduplicate results
        for (const results of registryResults) {
            allResults.push(...results);
        }
        
        // Remove duplicates based on name and publisher
        const uniqueResults = this.deduplicateSearchResults(allResults);
        
        // Sort results
        const sortedResults = this.sortSearchResults(uniqueResults, searchOptions.sortBy);
        
        // Limit results
        const limitedResults = sortedResults.slice(0, searchOptions.maxResults);
        
        // Cache results
        if (this.config.search.cacheSearchResults) {
            this.searchCache.set(cacheKey, {
                results: limitedResults,
                timestamp: Date.now()
            });
        }
        
        console.log(`🔍 Found ${limitedResults.length} templates`);
        this.emit('search-completed', { query, results: limitedResults });
        
        return limitedResults;
    }

    /**
     * Search a specific registry
     */
    async searchRegistry(registry, query, options) {
        const searchUrl = `${registry.url}/api/search`;
        const params = {
            q: query,
            framework: options.framework,
            type: options.type,
            tags: options.tags.join(','),
            publisher: options.publisher,
            minRating: options.minRating,
            limit: options.maxResults
        };
        
        try {
            const response = await axios.get(searchUrl, {
                params,
                timeout: this.config.search.searchTimeout,
                headers: this.getAuthHeaders(registry)
            });
            
            return response.data.templates || [];
            
        } catch (error) {
            if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                throw new Error(`Registry ${registry.name} is not accessible`);
            }
            throw error;
        }
    }

    /**
     * Get template details
     */
    async getTemplateDetails(templateId, registryName = null) {
        console.log(`📄 Getting template details: ${templateId}`);
        
        // Try specific registry first if provided
        if (registryName) {
            const registry = this.registries.get(registryName);
            if (registry) {
                try {
                    return await this.getTemplateFromRegistry(registry, templateId);
                } catch (error) {
                    console.warn(`Failed to get template from ${registryName}:`, error.message);
                }
            }
        }
        
        // Search all registries
        for (const registry of this.registries.values()) {
            try {
                const template = await this.getTemplateFromRegistry(registry, templateId);
                if (template) {
                    return template;
                }
            } catch (error) {
                console.warn(`Failed to get template from ${registry.name}:`, error.message);
            }
        }
        
        throw new Error(`Template not found: ${templateId}`);
    }

    /**
     * Get template from specific registry
     */
    async getTemplateFromRegistry(registry, templateId) {
        const templateUrl = `${registry.url}/api/templates/${templateId}`;
        
        try {
            const response = await axios.get(templateUrl, {
                headers: this.getAuthHeaders(registry),
                timeout: 10000
            });
            
            return {
                ...response.data,
                registry: registry.name
            };
            
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return null;
            }
            throw error;
        }
    }

    /**
     * Download template
     */
    async downloadTemplate(templateId, registryName = null, options = {}) {
        console.log(`⬇️  Downloading template: ${templateId}`);
        
        // Check if already downloading
        if (this.downloadQueue.has(templateId)) {
            console.log('⏳ Template download already in progress');
            return await this.downloadQueue.get(templateId);
        }
        
        // Create download promise
        const downloadPromise = this.performTemplateDownload(templateId, registryName, options);
        this.downloadQueue.set(templateId, downloadPromise);
        
        try {
            const result = await downloadPromise;
            this.downloadQueue.delete(templateId);
            return result;
        } catch (error) {
            this.downloadQueue.delete(templateId);
            throw error;
        }
    }

    /**
     * Perform actual template download
     */
    async performTemplateDownload(templateId, registryName, options) {
        // Get template details
        const templateDetails = await this.getTemplateDetails(templateId, registryName);
        
        if (!templateDetails) {
            throw new Error(`Template not found: ${templateId}`);
        }
        
        // Validate template
        if (this.config.templates.validateRemoteTemplates) {
            await this.validateRemoteTemplate(templateDetails);
        }
        
        // Download template files
        const downloadUrl = `${templateDetails.registry_url || this.getRegistryUrl(templateDetails.registry)}/api/templates/${templateId}/download`;
        
        try {
            const response = await axios.get(downloadUrl, {
                headers: this.getAuthHeaders(this.registries.get(templateDetails.registry)),
                responseType: 'json',
                timeout: 30000
            });
            
            const templateData = response.data;
            
            // Process template data
            const processedTemplate = await this.processDownloadedTemplate(templateData, templateDetails);
            
            // Cache template
            await this.cacheTemplate(templateId, processedTemplate);
            
            console.log(`✅ Template downloaded: ${templateId}`);
            this.emit('template-downloaded', { templateId, template: processedTemplate });
            
            return processedTemplate;
            
        } catch (error) {
            console.error(`❌ Failed to download template ${templateId}:`, error.message);
            throw error;
        }
    }

    /**
     * Install template locally
     */
    async installTemplate(templateId, installPath = null, options = {}) {
        console.log(`📦 Installing template: ${templateId}`);
        
        // Download template if not cached
        let template = this.templateCache.get(templateId);
        if (!template) {
            template = await this.downloadTemplate(templateId, options.registry);
        }
        
        // Determine install path
        const targetPath = installPath || path.join(process.cwd(), 'templates', template.name);
        
        // Ensure target directory exists
        await fs.ensureDir(path.dirname(targetPath));
        
        // Write template files
        await this.writeTemplateFiles(template, targetPath);
        
        // Create metadata file
        await this.createTemplateMetadata(template, targetPath);
        
        console.log(`✅ Template installed: ${targetPath}`);
        this.emit('template-installed', { templateId, template, installPath: targetPath });
        
        return {
            templateId,
            template,
            installPath: targetPath
        };
    }

    /**
     * Publish template to marketplace
     */
    async publishTemplate(templatePath, publishOptions = {}) {
        console.log(`📤 Publishing template: ${templatePath}`);
        
        if (!this.config.authentication.apiKey) {
            throw new Error('API key required for publishing templates');
        }
        
        // Validate template before publishing
        const template = await this.loadAndValidateTemplate(templatePath);
        
        // Package template
        const packagedTemplate = await this.packageTemplate(template, publishOptions);
        
        // Choose registry
        const registry = this.registries.get(publishOptions.registry || 'default');
        if (!registry) {
            throw new Error(`Registry not found: ${publishOptions.registry || 'default'}`);
        }
        
        // Upload template
        const publishUrl = `${registry.url}/api/templates`;
        
        try {
            const response = await axios.post(publishUrl, packagedTemplate, {
                headers: {
                    ...this.getAuthHeaders(registry),
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            });
            
            const publishedTemplate = response.data;
            
            console.log(`✅ Template published: ${publishedTemplate.id}`);
            this.emit('template-published', { template: publishedTemplate, registry: registry.name });
            
            return publishedTemplate;
            
        } catch (error) {
            console.error('❌ Failed to publish template:', error.message);
            throw error;
        }
    }

    /**
     * Get featured templates
     */
    async getFeaturedTemplates(options = {}) {
        console.log('⭐ Getting featured templates');
        
        const featuredTemplates = [];
        
        for (const registry of this.registries.values()) {
            try {
                const response = await axios.get(`${registry.url}/api/featured`, {
                    headers: this.getAuthHeaders(registry),
                    params: {
                        framework: options.framework,
                        limit: options.limit || 10
                    },
                    timeout: 5000
                });
                
                const templates = response.data.templates || [];
                featuredTemplates.push(...templates.map(t => ({ ...t, registry: registry.name })));
                
            } catch (error) {
                console.warn(`Failed to get featured templates from ${registry.name}:`, error.message);
            }
        }
        
        return featuredTemplates.slice(0, options.limit || 20);
    }

    /**
     * Get popular templates
     */
    async getPopularTemplates(options = {}) {
        console.log('🔥 Getting popular templates');
        
        const popularTemplates = [];
        
        for (const registry of this.registries.values()) {
            try {
                const response = await axios.get(`${registry.url}/api/popular`, {
                    headers: this.getAuthHeaders(registry),
                    params: {
                        framework: options.framework,
                        period: options.period || 'week', // week, month, all
                        limit: options.limit || 10
                    },
                    timeout: 5000
                });
                
                const templates = response.data.templates || [];
                popularTemplates.push(...templates.map(t => ({ ...t, registry: registry.name })));
                
            } catch (error) {
                console.warn(`Failed to get popular templates from ${registry.name}:`, error.message);
            }
        }
        
        // Sort by download count
        return popularTemplates
            .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
            .slice(0, options.limit || 20);
    }

    /**
     * Rate template
     */
    async rateTemplate(templateId, rating, comment = null, registryName = null) {
        console.log(`⭐ Rating template: ${templateId} (${rating}/5)`);
        
        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }
        
        // Find template registry
        const template = await this.getTemplateDetails(templateId, registryName);
        const registry = this.registries.get(template.registry);
        
        if (!registry) {
            throw new Error(`Registry not found: ${template.registry}`);
        }
        
        try {
            const response = await axios.post(`${registry.url}/api/templates/${templateId}/rate`, {
                rating,
                comment
            }, {
                headers: this.getAuthHeaders(registry),
                timeout: 10000
            });
            
            console.log('✅ Template rated successfully');
            this.emit('template-rated', { templateId, rating, comment });
            
            return response.data;
            
        } catch (error) {
            console.error('❌ Failed to rate template:', error.message);
            throw error;
        }
    }

    /**
     * Initialize registries
     */
    initializeRegistries() {
        // Add default registry
        if (this.config.marketplace.defaultRegistry) {
            this.registries.set('default', {
                name: 'default',
                url: this.config.marketplace.defaultRegistry,
                type: 'official',
                enabled: true
            });
        }
        
        // Add custom registries
        for (const [index, registryUrl] of this.config.marketplace.customRegistries.entries()) {
            this.registries.set(`custom-${index}`, {
                name: `custom-${index}`,
                url: registryUrl,
                type: 'custom',
                enabled: true
            });
        }
    }

    /**
     * Connect to registries
     */
    async connectToRegistries() {
        const connectionPromises = Array.from(this.registries.values()).map(async (registry) => {
            try {
                await this.testRegistryConnection(registry);
                console.log(`✅ Connected to registry: ${registry.name}`);
            } catch (error) {
                console.warn(`⚠️  Failed to connect to registry ${registry.name}:`, error.message);
                registry.enabled = false;
            }
        });
        
        await Promise.all(connectionPromises);
    }

    /**
     * Test registry connection
     */
    async testRegistryConnection(registry) {
        try {
            const response = await axios.get(`${registry.url}/api/health`, {
                timeout: 5000,
                headers: this.getAuthHeaders(registry)
            });
            
            if (response.status !== 200) {
                throw new Error(`Registry returned status ${response.status}`);
            }
            
            return true;
            
        } catch (error) {
            throw new Error(`Registry connection failed: ${error.message}`);
        }
    }

    /**
     * Setup cache directory
     */
    async setupCacheDirectory() {
        await fs.ensureDir(this.config.marketplace.cacheDirectory);
        
        // Create subdirectories
        await fs.ensureDir(path.join(this.config.marketplace.cacheDirectory, 'templates'));
        await fs.ensureDir(path.join(this.config.marketplace.cacheDirectory, 'metadata'));
        await fs.ensureDir(path.join(this.config.marketplace.cacheDirectory, 'search'));
        
        console.log(`📁 Cache directory ready: ${this.config.marketplace.cacheDirectory}`);
    }

    /**
     * Load cached templates
     */
    async loadCachedTemplates() {
        const cacheDir = path.join(this.config.marketplace.cacheDirectory, 'templates');
        
        try {
            const files = await fs.readdir(cacheDir);
            
            for (const file of files) {
                if (file.endsWith('.json')) {
                    try {
                        const templateData = await fs.readJson(path.join(cacheDir, file));
                        const templateId = path.basename(file, '.json');
                        this.templateCache.set(templateId, templateData);
                    } catch (error) {
                        console.warn(`Failed to load cached template ${file}:`, error.message);
                    }
                }
            }
            
            console.log(`📦 Loaded ${this.templateCache.size} cached templates`);
            
        } catch (error) {
            console.warn('Failed to load cached templates:', error.message);
        }
    }

    /**
     * Cache template
     */
    async cacheTemplate(templateId, template) {
        const cacheFile = path.join(this.config.marketplace.cacheDirectory, 'templates', `${templateId}.json`);
        
        try {
            await fs.writeJson(cacheFile, template, { spaces: 2 });
            this.templateCache.set(templateId, template);
        } catch (error) {
            console.warn(`Failed to cache template ${templateId}:`, error.message);
        }
    }

    /**
     * Utility methods
     */
    getAuthHeaders(registry) {
        const headers = {};
        
        if (this.config.authentication.apiKey) {
            headers['Authorization'] = `Bearer ${this.config.authentication.apiKey}`;
        }
        
        if (this.authTokens.has(registry.name)) {
            headers['X-Auth-Token'] = this.authTokens.get(registry.name);
        }
        
        return headers;
    }

    generateSearchCacheKey(query, options) {
        const keyData = { query, ...options };
        return Buffer.from(JSON.stringify(keyData)).toString('base64');
    }

    deduplicateSearchResults(results) {
        const seen = new Set();
        return results.filter(result => {
            const key = `${result.name}:${result.publisher}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    sortSearchResults(results, sortBy) {
        switch (sortBy) {
            case 'downloads':
                return results.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
            case 'rating':
                return results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'date':
                return results.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
            case 'relevance':
            default:
                return results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        }
    }

    getRegistryUrl(registryName) {
        const registry = this.registries.get(registryName);
        return registry ? registry.url : null;
    }

    /**
     * Validation and processing methods
     */
    async validateRemoteTemplate(template) {
        // Size check
        if (template.size && template.size > this.config.templates.maxTemplateSize) {
            throw new Error(`Template too large: ${template.size} bytes`);
        }
        
        // Publisher check
        if (this.config.templates.trustedPublishers.length > 0 &&
            !this.config.templates.trustedPublishers.includes(template.publisher)) {
            console.warn(`⚠️  Template from untrusted publisher: ${template.publisher}`);
        }
        
        // Security scan (basic)
        if (template.content && this.containsSuspiciousContent(template.content)) {
            throw new Error('Template contains suspicious content');
        }
        
        return true;
    }

    containsSuspiciousContent(content) {
        const suspiciousPatterns = [
            /eval\s*\(/,
            /Function\s*\(/,
            /setTimeout\s*\(/,
            /setInterval\s*\(/,
            /require\s*\(/,
            /import\s*\(/
        ];
        
        return suspiciousPatterns.some(pattern => pattern.test(content));
    }

    async processDownloadedTemplate(templateData, templateDetails) {
        return {
            id: templateDetails.id,
            name: templateDetails.name,
            version: templateDetails.version,
            content: templateData.content,
            metadata: templateData.metadata,
            publisher: templateDetails.publisher,
            registry: templateDetails.registry,
            downloadedAt: new Date().toISOString()
        };
    }

    async writeTemplateFiles(template, targetPath) {
        // Write main template file
        const templateFile = `${targetPath}.hbs`;
        await fs.writeFile(templateFile, template.content, 'utf8');
        
        // Write additional files if present
        if (template.files) {
            for (const [filename, content] of Object.entries(template.files)) {
                const filePath = path.join(path.dirname(targetPath), filename);
                await fs.ensureDir(path.dirname(filePath));
                await fs.writeFile(filePath, content, 'utf8');
            }
        }
    }

    async createTemplateMetadata(template, targetPath) {
        const metadataPath = `${targetPath}.metadata.json`;
        const metadata = {
            id: template.id,
            name: template.name,
            version: template.version,
            publisher: template.publisher,
            registry: template.registry,
            installedAt: new Date().toISOString(),
            source: 'marketplace'
        };
        
        await fs.writeJson(metadataPath, metadata, { spaces: 2 });
    }

    /**
     * Setup auto-sync
     */
    setupAutoSync() {
        const syncInterval = setInterval(async () => {
            try {
                await this.syncWithRegistries();
            } catch (error) {
                console.error('Auto-sync failed:', error.message);
            }
        }, this.config.sync.syncInterval);
        
        this.syncTimers.set('auto-sync', syncInterval);
        console.log('🔄 Auto-sync enabled');
    }

    /**
     * Sync with registries
     */
    async syncWithRegistries() {
        console.log('🔄 Syncing with registries...');
        
        for (const registry of this.registries.values()) {
            if (!registry.enabled) continue;
            
            try {
                await this.syncWithRegistry(registry);
            } catch (error) {
                console.warn(`Sync failed for registry ${registry.name}:`, error.message);
            }
        }
        
        console.log('✅ Registry sync complete');
        this.emit('sync-completed');
    }

    async syncWithRegistry(registry) {
        // This would implement actual sync logic
        // For now, just test connection
        await this.testRegistryConnection(registry);
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        // Clear sync timers
        for (const timer of this.syncTimers.values()) {
            clearInterval(timer);
        }
        this.syncTimers.clear();
        
        // Clear caches
        this.templateCache.clear();
        this.searchCache.clear();
        this.downloadQueue.clear();
        
        console.log('🧹 Template marketplace cleanup complete');
    }
}

module.exports = TemplateMarketplaceIntegration;
