/**
 * Template Inheritance System - Phase 3.2.3
 * Template specialization and reuse system based on SBS_Automation base class patterns
 * Enables clean override mechanisms and composition
 */

const fs = require('fs-extra');
const path = require('path');
const Handlebars = require('handlebars');

class TemplateInheritanceEngine {
    constructor(options = {}) {
        this.templates = new Map(); // Template registry
        this.baseTemplates = new Map(); // Base template registry
        this.inheritanceGraph = new Map(); // Template inheritance relationships
        this.compiledCache = new Map(); // Compiled template cache
        
        // Inheritance configuration
        this.maxInheritanceDepth = options.maxInheritanceDepth || 10;
        this.enableCaching = options.enableCaching !== false;
        this.validateInheritance = options.validateInheritance !== false;
        
        // Override rules
        this.overrideRules = {
            REPLACE: 'replace',     // Completely replace parent content
            EXTEND: 'extend',       // Extend parent content  
            PREPEND: 'prepend',     // Add before parent content
            APPEND: 'append',       // Add after parent content
            MERGE: 'merge'          // Merge with parent content
        };
        
        // Block types for template composition
        this.blockTypes = {
            CONTENT: 'content',
            IMPORTS: 'imports',
            METHODS: 'methods',
            PROPERTIES: 'properties',
            SETUP: 'setup',
            TEARDOWN: 'teardown',
            HELPERS: 'helpers'
        };
        
        console.log('🏗️ Template Inheritance Engine initialized');
    }

    /**
     * Initialize inheritance engine
     */
    async initialize() {
        console.log('🔍 Setting up template inheritance...');
        
        // Register Handlebars helpers for inheritance
        this.registerInheritanceHelpers();
        
        // Load base templates
        await this.loadBaseTemplates();
        
        console.log('✅ Template inheritance engine ready');
        return this;
    }

    /**
     * Register template with inheritance support
     */
    registerTemplate(templateData) {
        const template = this.processTemplateForInheritance(templateData);
        
        // Store in registry
        this.templates.set(template.id, template);
        
        // Build inheritance graph
        this.updateInheritanceGraph(template);
        
        // Validate inheritance chain
        if (this.validateInheritance) {
            this.validateInheritanceChain(template);
        }
        
        // Clear compiled cache for affected templates
        this.clearAffectedCache(template.id);
        
        console.log(`📝 Registered template with inheritance: ${template.id}`);
        return template;
    }

    /**
     * Process template for inheritance features
     */
    processTemplateForInheritance(templateData) {
        const template = {
            ...templateData,
            inheritance: {
                extends: templateData.extends || null,
                blocks: this.extractBlocks(templateData.content),
                overrides: templateData.overrides || {},
                composition: templateData.composition || {}
            },
            compiledInheritance: null
        };
        
        return template;
    }

    /**
     * Extract blocks from template content
     */
    extractBlocks(content) {
        const blocks = {};
        const blockRegex = /{{#block\s+(\w+)}}([\s\S]*?){{\/block}}/g;
        let match;
        
        while ((match = blockRegex.exec(content)) !== null) {
            const [, blockName, blockContent] = match;
            blocks[blockName] = {
                name: blockName,
                content: blockContent.trim(),
                type: this.inferBlockType(blockName, blockContent)
            };
        }
        
        return blocks;
    }

    /**
     * Infer block type from name and content
     */
    inferBlockType(blockName, content) {
        const name = blockName.toLowerCase();
        
        if (name.includes('import') || content.includes('import') || content.includes('require')) {
            return this.blockTypes.IMPORTS;
        }
        
        if (name.includes('method') || name.includes('function') || content.includes('function') || content.includes('=>')) {
            return this.blockTypes.METHODS;
        }
        
        if (name.includes('prop') || name.includes('property') || name.includes('var')) {
            return this.blockTypes.PROPERTIES;
        }
        
        if (name.includes('setup') || name.includes('before')) {
            return this.blockTypes.SETUP;
        }
        
        if (name.includes('teardown') || name.includes('after') || name.includes('cleanup')) {
            return this.blockTypes.TEARDOWN;
        }
        
        if (name.includes('helper') || name.includes('util')) {
            return this.blockTypes.HELPERS;
        }
        
        return this.blockTypes.CONTENT;
    }

    /**
     * Update inheritance graph
     */
    updateInheritanceGraph(template) {
        const templateId = template.id;
        const parentId = template.inheritance.extends;
        
        // Initialize graph entry
        if (!this.inheritanceGraph.has(templateId)) {
            this.inheritanceGraph.set(templateId, {
                id: templateId,
                parent: parentId,
                children: new Set(),
                depth: 0
            });
        }
        
        const node = this.inheritanceGraph.get(templateId);
        node.parent = parentId;
        
        // Update parent's children
        if (parentId) {
            if (!this.inheritanceGraph.has(parentId)) {
                this.inheritanceGraph.set(parentId, {
                    id: parentId,
                    parent: null,
                    children: new Set(),
                    depth: 0
                });
            }
            
            this.inheritanceGraph.get(parentId).children.add(templateId);
        }
        
        // Update depth
        this.updateDepth(templateId);
    }

    /**
     * Update inheritance depth
     */
    updateDepth(templateId, visited = new Set()) {
        if (visited.has(templateId)) {
            throw new Error(`Circular inheritance detected: ${Array.from(visited).join(' -> ')} -> ${templateId}`);
        }
        
        visited.add(templateId);
        const node = this.inheritanceGraph.get(templateId);
        
        if (!node.parent) {
            node.depth = 0;
        } else {
            const parentNode = this.inheritanceGraph.get(node.parent);
            if (parentNode) {
                this.updateDepth(node.parent, new Set(visited));
                node.depth = parentNode.depth + 1;
                
                if (node.depth > this.maxInheritanceDepth) {
                    throw new Error(`Inheritance depth exceeds maximum (${this.maxInheritanceDepth}): ${templateId}`);
                }
            }
        }
        
        visited.delete(templateId);
    }

    /**
     * Validate inheritance chain
     */
    validateInheritanceChain(template) {
        const errors = [];
        const chain = this.buildInheritanceChain(template.id);
        
        // Check for missing parents
        for (let i = 1; i < chain.length; i++) {
            const parentId = chain[i];
            if (!this.templates.has(parentId) && !this.baseTemplates.has(parentId)) {
                errors.push(`Parent template not found: ${parentId}`);
            }
        }
        
        // Check for compatible types
        for (let i = 0; i < chain.length - 1; i++) {
            const childTemplate = this.templates.get(chain[i]);
            const parentTemplate = this.templates.get(chain[i + 1]) || this.baseTemplates.get(chain[i + 1]);
            
            if (childTemplate && parentTemplate) {
                if (childTemplate.metadata?.type && parentTemplate.metadata?.type) {
                    if (!this.areTypesCompatible(childTemplate.metadata.type, parentTemplate.metadata.type)) {
                        errors.push(`Incompatible types: ${childTemplate.metadata.type} cannot extend ${parentTemplate.metadata.type}`);
                    }
                }
            }
        }
        
        if (errors.length > 0) {
            throw new Error(`Inheritance validation failed for ${template.id}:\n${errors.join('\n')}`);
        }
        
        return true;
    }

    /**
     * Check if template types are compatible
     */
    areTypesCompatible(childType, parentType) {
        // Same types are always compatible
        if (childType === parentType) return true;
        
        // Define compatibility matrix
        const compatibility = {
            'feature': ['feature', 'base'],
            'step': ['step', 'base'],
            'page': ['page', 'base'],
            'test': ['test', 'base'],
            'component': ['component', 'test', 'base']
        };
        
        return compatibility[childType]?.includes(parentType) || false;
    }

    /**
     * Build inheritance chain from child to root
     */
    buildInheritanceChain(templateId) {
        const chain = [templateId];
        let current = templateId;
        
        while (current) {
            const node = this.inheritanceGraph.get(current);
            if (!node || !node.parent) break;
            
            chain.push(node.parent);
            current = node.parent;
        }
        
        return chain;
    }

    /**
     * Resolve template with inheritance
     */
    async resolveTemplate(templateId, context = {}) {
        console.log(`🔗 Resolving template with inheritance: ${templateId}`);
        
        // Check cache
        const cacheKey = this.getCacheKey(templateId, context);
        if (this.enableCaching && this.compiledCache.has(cacheKey)) {
            return this.compiledCache.get(cacheKey);
        }
        
        // Get template
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }
        
        // Build inheritance chain
        const chain = this.buildInheritanceChain(templateId);
        
        // Resolve inheritance from root to child
        const resolved = await this.resolveInheritanceChain(chain, context);
        
        // Cache result
        if (this.enableCaching) {
            this.compiledCache.set(cacheKey, resolved);
        }
        
        return resolved;
    }

    /**
     * Resolve inheritance chain
     */
    async resolveInheritanceChain(chain, context) {
        // Start with root template (last in chain)
        let resolved = {
            content: '',
            blocks: {},
            metadata: {},
            context: { ...context }
        };
        
        // Process from root to child
        for (let i = chain.length - 1; i >= 0; i--) {
            const templateId = chain[i];
            const template = this.templates.get(templateId) || this.baseTemplates.get(templateId);
            
            if (template) {
                resolved = await this.mergeTemplate(resolved, template, context);
            }
        }
        
        // Compile final template
        const finalTemplate = this.assembleTemplate(resolved);
        const compiled = Handlebars.compile(finalTemplate);
        
        return {
            template: finalTemplate,
            compiled,
            metadata: resolved.metadata,
            blocks: resolved.blocks
        };
    }

    /**
     * Merge template with resolved inheritance
     */
    async mergeTemplate(resolved, template, context) {
        const merged = {
            content: resolved.content,
            blocks: { ...resolved.blocks },
            metadata: { ...resolved.metadata, ...template.metadata },
            context: { ...resolved.context, ...context }
        };
        
        // Merge blocks based on override rules
        if (template.inheritance && template.inheritance.blocks) {
            for (const [blockName, block] of Object.entries(template.inheritance.blocks)) {
                merged.blocks[blockName] = this.mergeBlock(
                    resolved.blocks[blockName],
                    block,
                    template.inheritance.overrides[blockName] || this.overrideRules.REPLACE
                );
            }
        }
        
        // Merge main content if no parent content
        if (!resolved.content && template.content) {
            merged.content = template.content;
        }
        
        return merged;
    }

    /**
     * Merge individual block with override rules
     */
    mergeBlock(parentBlock, childBlock, overrideRule) {
        if (!parentBlock) {
            return childBlock;
        }
        
        switch (overrideRule) {
            case this.overrideRules.REPLACE:
                return childBlock;
            
            case this.overrideRules.EXTEND:
                return {
                    ...parentBlock,
                    ...childBlock,
                    content: parentBlock.content + '\n' + childBlock.content
                };
            
            case this.overrideRules.PREPEND:
                return {
                    ...parentBlock,
                    content: childBlock.content + '\n' + parentBlock.content
                };
            
            case this.overrideRules.APPEND:
                return {
                    ...parentBlock,
                    content: parentBlock.content + '\n' + childBlock.content
                };
            
            case this.overrideRules.MERGE:
                return this.mergeBlockContent(parentBlock, childBlock);
            
            default:
                return childBlock;
        }
    }

    /**
     * Merge block content intelligently
     */
    mergeBlockContent(parentBlock, childBlock) {
        const merged = { ...parentBlock };
        
        switch (parentBlock.type) {
            case this.blockTypes.IMPORTS:
                merged.content = this.mergeImports(parentBlock.content, childBlock.content);
                break;
            
            case this.blockTypes.METHODS:
                merged.content = this.mergeMethods(parentBlock.content, childBlock.content);
                break;
            
            case this.blockTypes.PROPERTIES:
                merged.content = this.mergeProperties(parentBlock.content, childBlock.content);
                break;
            
            default:
                merged.content = parentBlock.content + '\n' + childBlock.content;
        }
        
        return merged;
    }

    /**
     * Merge import statements
     */
    mergeImports(parentImports, childImports) {
        const allImports = new Set();
        
        // Extract imports from parent
        const parentLines = parentImports.split('\n').filter(line => line.trim());
        parentLines.forEach(line => allImports.add(line.trim()));
        
        // Extract imports from child
        const childLines = childImports.split('\n').filter(line => line.trim());
        childLines.forEach(line => allImports.add(line.trim()));
        
        // Sort imports for consistency
        return Array.from(allImports).sort().join('\n');
    }

    /**
     * Merge method definitions
     */
    mergeMethods(parentMethods, childMethods) {
        // For methods, child overrides parent by default
        // Could be enhanced to detect method signatures and merge intelligently
        return parentMethods + '\n\n' + childMethods;
    }

    /**
     * Merge property definitions
     */
    mergeProperties(parentProperties, childProperties) {
        // For properties, child overrides parent by default
        // Could be enhanced to merge property objects
        return parentProperties + '\n' + childProperties;
    }

    /**
     * Assemble final template from resolved blocks
     */
    assembleTemplate(resolved) {
        let template = resolved.content;
        
        // Replace block placeholders with resolved content
        for (const [blockName, block] of Object.entries(resolved.blocks)) {
            const placeholder = `{{#block ${blockName}}}{{/block}}`;
            const content = `{{#block ${blockName}}}${block.content}{{/block}}`;
            template = template.replace(new RegExp(placeholder, 'g'), content);
        }
        
        return template;
    }

    /**
     * Load base templates
     */
    async loadBaseTemplates() {
        const baseTemplatesPath = path.join(__dirname, '../../templates/base');
        
        if (await fs.pathExists(baseTemplatesPath)) {
            console.log(`📂 Loading base templates from: ${baseTemplatesPath}`);
            
            const files = await fs.readdir(baseTemplatesPath);
            for (const file of files) {
                if (file.endsWith('.hbs')) {
                    await this.loadBaseTemplate(path.join(baseTemplatesPath, file));
                }
            }
        }
    }

    /**
     * Load individual base template
     */
    async loadBaseTemplate(templatePath) {
        const templateId = path.basename(templatePath, '.hbs');
        const content = await fs.readFile(templatePath, 'utf8');
        
        const baseTemplate = {
            id: templateId,
            path: templatePath,
            content,
            metadata: {
                id: templateId,
                name: templateId,
                type: 'base',
                isBase: true
            },
            inheritance: {
                extends: null,
                blocks: this.extractBlocks(content),
                overrides: {},
                composition: {}
            }
        };
        
        this.baseTemplates.set(templateId, baseTemplate);
        console.log(`📄 Loaded base template: ${templateId}`);
    }

    /**
     * Register Handlebars helpers for inheritance
     */
    registerInheritanceHelpers() {
        // Block helper
        Handlebars.registerHelper('block', function(name, options) {
            return options.fn(this);
        });
        
        // Extend helper
        Handlebars.registerHelper('extend', function(parentTemplate) {
            // This is handled during template resolution
            return '';
        });
        
        // Override helper
        Handlebars.registerHelper('override', function(blockName, rule, options) {
            return options.fn(this);
        });
        
        // Parent helper - access parent block content
        Handlebars.registerHelper('parent', function(blockName) {
            if (this._parent && this._parent.blocks && this._parent.blocks[blockName]) {
                return new Handlebars.SafeString(this._parent.blocks[blockName].content);
            }
            return '';
        });
    }

    /**
     * Get cache key for template resolution
     */
    getCacheKey(templateId, context) {
        const contextHash = require('crypto')
            .createHash('md5')
            .update(JSON.stringify(context))
            .digest('hex')
            .substring(0, 8);
        
        return `${templateId}:${contextHash}`;
    }

    /**
     * Clear affected cache entries
     */
    clearAffectedCache(templateId) {
        if (!this.enableCaching) return;
        
        // Clear cache for template and its children
        const affected = this.getAffectedTemplates(templateId);
        
        for (const cacheKey of this.compiledCache.keys()) {
            const [cachedTemplateId] = cacheKey.split(':');
            if (affected.has(cachedTemplateId)) {
                this.compiledCache.delete(cacheKey);
            }
        }
    }

    /**
     * Get templates affected by changes to given template
     */
    getAffectedTemplates(templateId) {
        const affected = new Set([templateId]);
        const queue = [templateId];
        
        while (queue.length > 0) {
            const current = queue.shift();
            const node = this.inheritanceGraph.get(current);
            
            if (node) {
                for (const child of node.children) {
                    if (!affected.has(child)) {
                        affected.add(child);
                        queue.push(child);
                    }
                }
            }
        }
        
        return affected;
    }

    /**
     * Get inheritance information for template
     */
    getInheritanceInfo(templateId) {
        const template = this.templates.get(templateId);
        if (!template) {
            return null;
        }
        
        return {
            id: templateId,
            extends: template.inheritance.extends,
            chain: this.buildInheritanceChain(templateId),
            children: Array.from(this.inheritanceGraph.get(templateId)?.children || []),
            depth: this.inheritanceGraph.get(templateId)?.depth || 0,
            blocks: Object.keys(template.inheritance.blocks),
            overrides: template.inheritance.overrides
        };
    }

    /**
     * Get all templates
     */
    getAllTemplates() {
        return Array.from(this.templates.values());
    }

    /**
     * Get base templates
     */
    getBaseTemplates() {
        return Array.from(this.baseTemplates.values());
    }

    /**
     * Clear caches
     */
    clearCache() {
        this.compiledCache.clear();
        console.log('🧹 Template inheritance cache cleared');
    }
}

module.exports = TemplateInheritanceEngine;
