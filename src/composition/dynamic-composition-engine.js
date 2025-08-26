/**
 * Dynamic Composition Engine - Phase 3.2.4
 * Intelligent template selection and assembly system
 * Context-aware template composition and optimization
 */

const fs = require('fs-extra');
const path = require('path');

class DynamicCompositionEngine {
    constructor(options = {}) {
        this.templateLoader = options.templateLoader;
        this.themeEngine = options.themeEngine;
        this.inheritanceEngine = options.inheritanceEngine;
        
        // Composition configuration
        this.enableAnalytics = options.enableAnalytics !== false;
        this.enableOptimization = options.enableOptimization !== false;
        this.enableCaching = options.enableCaching !== false;
        
        // Scoring weights for template selection
        this.scoringWeights = {
            frameworkMatch: 0.25,      // Framework compatibility
            typeMatch: 0.20,           // Template type match
            complexityMatch: 0.15,     // Complexity level match
            themeMatch: 0.10,          // Theme compatibility
            qualityScore: 0.15,        // Template quality metrics
            usageHistory: 0.10,        // Historical usage success
            performance: 0.05          // Template performance metrics
        };
        
        // Feature detection patterns
        this.featurePatterns = {
            authentication: ['login', 'auth', 'signin', 'credential'],
            navigation: ['menu', 'nav', 'route', 'page', 'redirect'],
            forms: ['form', 'input', 'submit', 'validate', 'field'],
            api: ['api', 'endpoint', 'request', 'response', 'http'],
            database: ['data', 'db', 'query', 'record', 'entity'],
            ui: ['button', 'click', 'element', 'component', 'widget'],
            validation: ['validate', 'check', 'verify', 'assert', 'test'],
            error: ['error', 'exception', 'fail', 'catch', 'handle']
        };
        
        // Analytics storage
        this.analytics = {
            templateUsage: new Map(),
            selectionHistory: [],
            performanceMetrics: new Map(),
            qualityFeedback: new Map()
        };
        
        // Cache storage
        this.compositionCache = new Map();
        this.scoringCache = new Map();
        
        console.log('🧠 Dynamic Composition Engine initialized');
    }

    /**
     * Initialize composition engine
     */
    async initialize() {
        console.log('🔍 Initializing dynamic composition...');
        
        // Load analytics data if available
        await this.loadAnalytics();
        
        // Initialize performance tracking
        this.initializePerformanceTracking();
        
        console.log('✅ Dynamic composition engine ready');
        return this;
    }

    /**
     * Compose optimal template for context
     */
    async composeTemplate(context, options = {}) {
        const startTime = Date.now();
        console.log(`🎼 Composing template for context: ${JSON.stringify(context, null, 2)}`);
        
        // Check cache first
        const cacheKey = this.getCacheKey(context, options);
        if (this.enableCaching && this.compositionCache.has(cacheKey)) {
            const cached = this.compositionCache.get(cacheKey);
            console.log(`💨 Cache hit for composition: ${cacheKey}`);
            return cached;
        }
        
        // Analyze context and extract features
        const analysis = await this.analyzeContext(context);
        
        // Find candidate templates
        const candidates = await this.findCandidateTemplates(analysis, options);
        
        // Score candidates
        const scoredCandidates = await this.scoreCandidates(candidates, analysis, options);
        
        // Select optimal template combination
        const selection = await this.selectOptimalComposition(scoredCandidates, analysis, options);
        
        // Apply theme and customization
        const themed = await this.applyThemeAndCustomization(selection, analysis, options);
        
        // Compose final template
        const composition = await this.composeFromSelection(themed, analysis, options);
        
        // Track analytics
        await this.trackComposition(context, selection, composition, Date.now() - startTime);
        
        // Cache result
        if (this.enableCaching) {
            this.compositionCache.set(cacheKey, composition);
        }
        
        console.log(`✅ Template composition complete in ${Date.now() - startTime}ms`);
        return composition;
    }

    /**
     * Analyze context to extract features and requirements
     */
    async analyzeContext(context) {
        console.log('🔍 Analyzing context for composition...');
        
        const analysis = {
            framework: context.framework || 'unknown',
            type: context.type || 'general',
            complexity: this.assessComplexity(context),
            features: this.extractFeatures(context),
            requirements: this.extractRequirements(context),
            constraints: context.constraints || {},
            preferences: context.preferences || {},
            domain: context.domain || 'general',
            scope: context.scope || 'single'
        };
        
        // Enhance analysis with NLP if available
        if (context.description || context.requirements) {
            analysis.nlpFeatures = await this.extractNLPFeatures(
                context.description || context.requirements
            );
        }
        
        console.log(`📊 Context analysis: ${JSON.stringify(analysis, null, 2)}`);
        return analysis;
    }

    /**
     * Assess complexity level from context
     */
    assessComplexity(context) {
        let complexity = 0;
        
        // Count features and requirements
        const featureCount = Object.keys(context.features || {}).length;
        const requirementCount = (context.requirements || []).length;
        
        complexity += featureCount * 2;
        complexity += requirementCount * 1.5;
        
        // Framework complexity
        if (context.framework) {
            const frameworkComplexity = {
                playwright: 3,
                jest: 2,
                cypress: 3,
                cucumber: 2
            };
            complexity += frameworkComplexity[context.framework] || 1;
        }
        
        // Categorize complexity
        if (complexity <= 5) return 'low';
        if (complexity <= 15) return 'medium';
        return 'high';
    }

    /**
     * Extract features from context
     */
    extractFeatures(context) {
        const features = new Set();
        
        // Check explicit features
        if (context.features) {
            Object.keys(context.features).forEach(feature => features.add(feature));
        }
        
        // Extract features from text content
        const textContent = [
            context.description,
            context.requirements,
            context.title,
            ...(context.steps || [])
        ].filter(Boolean).join(' ').toLowerCase();
        
        // Match against feature patterns
        for (const [feature, patterns] of Object.entries(this.featurePatterns)) {
            if (patterns.some(pattern => textContent.includes(pattern))) {
                features.add(feature);
            }
        }
        
        return Array.from(features);
    }

    /**
     * Extract requirements from context
     */
    extractRequirements(context) {
        const requirements = {
            functional: [],
            technical: [],
            quality: []
        };
        
        // Parse explicit requirements
        if (context.requirements) {
            if (Array.isArray(context.requirements)) {
                requirements.functional = context.requirements;
            } else if (typeof context.requirements === 'object') {
                Object.assign(requirements, context.requirements);
            }
        }
        
        // Extract technical requirements
        if (context.framework) {
            requirements.technical.push(`Framework: ${context.framework}`);
        }
        
        if (context.browser) {
            requirements.technical.push(`Browser: ${context.browser}`);
        }
        
        if (context.environment) {
            requirements.technical.push(`Environment: ${context.environment}`);
        }
        
        // Extract quality requirements
        if (context.coverage) {
            requirements.quality.push(`Coverage: ${context.coverage}`);
        }
        
        if (context.performance) {
            requirements.quality.push(`Performance: ${context.performance}`);
        }
        
        return requirements;
    }

    /**
     * Extract NLP features from text
     */
    async extractNLPFeatures(text) {
        // Simplified NLP feature extraction
        // In a full implementation, this would use advanced NLP libraries
        
        const features = {
            entities: this.extractEntities(text),
            actions: this.extractActions(text),
            objects: this.extractObjects(text),
            sentiment: this.analyzeSentiment(text),
            complexity: this.analyzeTextComplexity(text)
        };
        
        return features;
    }

    /**
     * Extract entities from text
     */
    extractEntities(text) {
        const entities = [];
        const entityPatterns = [
            /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g, // Proper nouns
            /\b(user|admin|customer|client|manager)\b/gi, // Role entities
            /\b(page|form|button|field|element)\b/gi // UI entities
        ];
        
        entityPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                entities.push(match[1]);
            }
        });
        
        return [...new Set(entities)];
    }

    /**
     * Extract actions from text
     */
    extractActions(text) {
        const actions = [];
        const actionPatterns = [
            /\b(click|tap|press|select|choose|enter|type|input|submit|save|delete|edit|update|create|add|remove|navigate|go|visit|open|close|verify|check|assert|validate|test)\b/gi
        ];
        
        actionPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                actions.push(match[1].toLowerCase());
            }
        });
        
        return [...new Set(actions)];
    }

    /**
     * Extract objects from text
     */
    extractObjects(text) {
        const objects = [];
        const objectPatterns = [
            /\b(page|form|button|field|element|menu|link|table|list|dialog|modal|popup|panel|section|header|footer|sidebar)\b/gi
        ];
        
        objectPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                objects.push(match[1].toLowerCase());
            }
        });
        
        return [...new Set(objects)];
    }

    /**
     * Analyze text sentiment
     */
    analyzeSentiment(text) {
        // Simplified sentiment analysis
        const positiveWords = ['success', 'pass', 'correct', 'valid', 'good', 'working'];
        const negativeWords = ['fail', 'error', 'invalid', 'wrong', 'bad', 'broken'];
        
        const words = text.toLowerCase().split(/\s+/);
        const positive = words.filter(word => positiveWords.includes(word)).length;
        const negative = words.filter(word => negativeWords.includes(word)).length;
        
        if (positive > negative) return 'positive';
        if (negative > positive) return 'negative';
        return 'neutral';
    }

    /**
     * Analyze text complexity
     */
    analyzeTextComplexity(text) {
        const sentences = text.split(/[.!?]+/).length;
        const words = text.split(/\s+/).length;
        const avgWordsPerSentence = words / sentences;
        
        if (avgWordsPerSentence > 20) return 'high';
        if (avgWordsPerSentence > 10) return 'medium';
        return 'low';
    }

    /**
     * Find candidate templates based on analysis
     */
    async findCandidateTemplates(analysis, options) {
        console.log('🔍 Finding candidate templates...');
        
        if (!this.templateLoader) {
            throw new Error('Template loader not available');
        }
        
        // Build search criteria
        const criteria = {
            framework: analysis.framework,
            type: analysis.type,
            features: analysis.features,
            complexity: analysis.complexity
        };
        
        // Get templates from loader
        const templates = this.templateLoader.findTemplates(criteria);
        
        // Get recommendations from loader
        const recommendations = this.templateLoader.getRecommendations(criteria);
        
        // Combine and deduplicate
        const allCandidates = [...templates, ...recommendations];
        const candidates = this.deduplicateTemplates(allCandidates);
        
        console.log(`📋 Found ${candidates.length} candidate templates`);
        return candidates;
    }

    /**
     * Deduplicate templates
     */
    deduplicateTemplates(templates) {
        const seen = new Set();
        return templates.filter(template => {
            const id = template.id || template.metadata?.id;
            if (seen.has(id)) {
                return false;
            }
            seen.add(id);
            return true;
        });
    }

    /**
     * Score candidate templates
     */
    async scoreCandidates(candidates, analysis, options) {
        console.log(`📊 Scoring ${candidates.length} candidates...`);
        
        const scored = [];
        
        for (const candidate of candidates) {
            const score = await this.scoreTemplate(candidate, analysis, options);
            scored.push({
                template: candidate,
                score: score.total,
                breakdown: score.breakdown,
                reasoning: score.reasoning
            });
        }
        
        // Sort by score descending
        scored.sort((a, b) => b.score - a.score);
        
        return scored;
    }

    /**
     * Score individual template
     */
    async scoreTemplate(template, analysis, options) {
        const metadata = template.metadata || {};
        const breakdown = {};
        const reasoning = [];
        
        // Framework match score
        breakdown.frameworkMatch = this.scoreFrameworkMatch(metadata, analysis);
        if (breakdown.frameworkMatch > 0.7) {
            reasoning.push(`Strong framework match (${analysis.framework})`);
        }
        
        // Type match score
        breakdown.typeMatch = this.scoreTypeMatch(metadata, analysis);
        if (breakdown.typeMatch > 0.8) {
            reasoning.push(`Exact type match (${analysis.type})`);
        }
        
        // Complexity match score
        breakdown.complexityMatch = this.scoreComplexityMatch(metadata, analysis);
        if (breakdown.complexityMatch > 0.7) {
            reasoning.push(`Complexity level match (${analysis.complexity})`);
        }
        
        // Theme match score
        breakdown.themeMatch = this.scoreThemeMatch(metadata, analysis, options);
        
        // Quality score
        breakdown.qualityScore = await this.getQualityScore(template);
        if (breakdown.qualityScore > 0.8) {
            reasoning.push('High quality template');
        }
        
        // Usage history score
        breakdown.usageHistory = this.getUsageHistoryScore(template);
        if (breakdown.usageHistory > 0.7) {
            reasoning.push('Proven track record');
        }
        
        // Performance score
        breakdown.performance = this.getPerformanceScore(template);
        
        // Calculate weighted total
        let total = 0;
        for (const [metric, weight] of Object.entries(this.scoringWeights)) {
            total += (breakdown[metric] || 0) * weight;
        }
        
        return {
            total,
            breakdown,
            reasoning: reasoning.join(', ') || 'General compatibility'
        };
    }

    /**
     * Score framework compatibility
     */
    scoreFrameworkMatch(metadata, analysis) {
        if (!metadata.framework || !analysis.framework) return 0.5;
        
        const frameworks = Array.isArray(metadata.framework) ? metadata.framework : [metadata.framework];
        
        // Exact match
        if (frameworks.includes(analysis.framework)) return 1.0;
        
        // Universal compatibility
        if (frameworks.includes('all')) return 0.8;
        
        // Framework family compatibility
        const frameworkFamilies = {
            testing: ['jest', 'mocha', 'jasmine'],
            e2e: ['playwright', 'cypress', 'selenium'],
            bdd: ['cucumber', 'gherkin']
        };
        
        for (const family of Object.values(frameworkFamilies)) {
            if (family.includes(analysis.framework) && 
                frameworks.some(f => family.includes(f))) {
                return 0.6;
            }
        }
        
        return 0.2;
    }

    /**
     * Score type compatibility
     */
    scoreTypeMatch(metadata, analysis) {
        if (!metadata.type || !analysis.type) return 0.5;
        
        // Exact match
        if (metadata.type === analysis.type) return 1.0;
        
        // Compatible types
        const typeCompatibility = {
            'feature': ['test', 'scenario'],
            'test': ['feature', 'spec'],
            'component': ['test', 'unit'],
            'page': ['component', 'element']
        };
        
        const compatible = typeCompatibility[analysis.type] || [];
        if (compatible.includes(metadata.type)) return 0.7;
        
        // General compatibility
        if (metadata.type === 'general' || analysis.type === 'general') return 0.6;
        
        return 0.3;
    }

    /**
     * Score complexity match
     */
    scoreComplexityMatch(metadata, analysis) {
        const templateComplexity = metadata.complexity || 'medium';
        const contextComplexity = analysis.complexity;
        
        // Exact match
        if (templateComplexity === contextComplexity) return 1.0;
        
        // Adjacent complexity levels
        const complexityLevels = ['low', 'medium', 'high'];
        const templateIndex = complexityLevels.indexOf(templateComplexity);
        const contextIndex = complexityLevels.indexOf(contextComplexity);
        
        const distance = Math.abs(templateIndex - contextIndex);
        
        if (distance === 1) return 0.7;
        if (distance === 2) return 0.4;
        
        return 0.5;
    }

    /**
     * Score theme compatibility
     */
    scoreThemeMatch(metadata, analysis, options) {
        if (!this.themeEngine) return 0.5;
        
        const requestedTheme = options.theme || analysis.preferences?.theme;
        const templateTheme = metadata.theme;
        
        if (!requestedTheme || !templateTheme) return 0.5;
        
        // Exact match
        if (templateTheme === requestedTheme) return 1.0;
        
        // Theme family compatibility
        const themeFamilies = {
            minimal: ['minimal', 'clean', 'simple'],
            standard: ['standard', 'default', 'balanced'],
            detailed: ['detailed', 'comprehensive', 'verbose'],
            enterprise: ['enterprise', 'professional', 'corporate']
        };
        
        for (const family of Object.values(themeFamilies)) {
            if (family.includes(requestedTheme) && family.includes(templateTheme)) {
                return 0.8;
            }
        }
        
        return 0.4;
    }

    /**
     * Get quality score for template
     */
    async getQualityScore(template) {
        const templateId = template.id || template.metadata?.id;
        
        // Check cache
        if (this.analytics.qualityFeedback.has(templateId)) {
            return this.analytics.qualityFeedback.get(templateId);
        }
        
        // Calculate base quality score
        let score = 0.5; // Default score
        
        // Template completeness
        if (template.content && template.content.length > 100) score += 0.1;
        if (template.metadata?.description) score += 0.1;
        if (template.metadata?.examples?.length > 0) score += 0.1;
        
        // Template structure
        if (template.inheritance?.blocks && Object.keys(template.inheritance.blocks).length > 0) {
            score += 0.1;
        }
        
        // Validation
        if (template.validation) score += 0.1;
        
        // Ensure score is between 0 and 1
        score = Math.max(0, Math.min(1, score));
        
        return score;
    }

    /**
     * Get usage history score
     */
    getUsageHistoryScore(template) {
        const templateId = template.id || template.metadata?.id;
        const usage = this.analytics.templateUsage.get(templateId);
        
        if (!usage) return 0.5;
        
        // Calculate score based on usage success rate
        const successRate = usage.successful / (usage.total || 1);
        const popularityBonus = Math.min(0.2, usage.total / 100);
        
        return Math.min(1, successRate + popularityBonus);
    }

    /**
     * Get performance score
     */
    getPerformanceScore(template) {
        const templateId = template.id || template.metadata?.id;
        const metrics = this.analytics.performanceMetrics.get(templateId);
        
        if (!metrics) return 0.7; // Default performance score
        
        // Score based on generation time (lower is better)
        const avgTime = metrics.totalTime / metrics.count;
        let timeScore = 1.0;
        
        if (avgTime > 1000) timeScore = 0.5;      // > 1 second
        else if (avgTime > 500) timeScore = 0.7;   // > 500ms
        else if (avgTime > 100) timeScore = 0.9;   // > 100ms
        
        return timeScore;
    }

    /**
     * Select optimal template composition
     */
    async selectOptimalComposition(scoredCandidates, analysis, options) {
        console.log('🎯 Selecting optimal composition...');
        
        if (scoredCandidates.length === 0) {
            throw new Error('No suitable templates found for context');
        }
        
        // Take top candidate as primary
        const primary = scoredCandidates[0];
        
        // Consider composition strategy
        const strategy = this.determineCompositionStrategy(analysis, options);
        
        let composition = {
            primary: primary.template,
            score: primary.score,
            reasoning: primary.reasoning,
            strategy,
            supplements: []
        };
        
        // Add supplemental templates based on strategy
        if (strategy === 'multi-template') {
            composition.supplements = await this.selectSupplementalTemplates(
                scoredCandidates,
                primary.template,
                analysis
            );
        }
        
        console.log(`✅ Selected composition with strategy: ${strategy}`);
        return composition;
    }

    /**
     * Determine composition strategy
     */
    determineCompositionStrategy(analysis, options) {
        // Force single template for simple cases
        if (analysis.complexity === 'low' || options.strategy === 'single') {
            return 'single-template';
        }
        
        // Multi-template for complex scenarios
        if (analysis.features.length > 3 || analysis.complexity === 'high') {
            return 'multi-template';
        }
        
        // Hybrid for medium complexity
        if (analysis.complexity === 'medium') {
            return 'hybrid';
        }
        
        return 'single-template';
    }

    /**
     * Select supplemental templates
     */
    async selectSupplementalTemplates(scoredCandidates, primaryTemplate, analysis) {
        const supplements = [];
        const primaryFeatures = new Set(primaryTemplate.metadata?.features || []);
        
        // Find templates that cover missing features
        const missingFeatures = analysis.features.filter(feature => !primaryFeatures.has(feature));
        
        for (const feature of missingFeatures) {
            const supplement = scoredCandidates.find(candidate => 
                candidate.template.metadata?.features?.includes(feature) &&
                candidate.template.id !== primaryTemplate.id
            );
            
            if (supplement) {
                supplements.push({
                    template: supplement.template,
                    feature,
                    score: supplement.score
                });
            }
        }
        
        return supplements.slice(0, 3); // Limit to 3 supplements
    }

    /**
     * Apply theme and customization
     */
    async applyThemeAndCustomization(selection, analysis, options) {
        console.log('🎨 Applying theme and customization...');
        
        if (!this.themeEngine) {
            return selection;
        }
        
        const theme = options.theme || analysis.preferences?.theme || 'standard';
        
        // Apply theme to primary template
        const themedPrimary = {
            ...selection.primary,
            theme: await this.themeEngine.applyTheme(selection.primary, { 
                theme,
                framework: analysis.framework 
            })
        };
        
        // Apply theme to supplements
        const themedSupplements = [];
        for (const supplement of selection.supplements) {
            themedSupplements.push({
                ...supplement,
                template: {
                    ...supplement.template,
                    theme: await this.themeEngine.applyTheme(supplement.template, {
                        theme,
                        framework: analysis.framework
                    })
                }
            });
        }
        
        return {
            ...selection,
            primary: themedPrimary,
            supplements: themedSupplements,
            appliedTheme: theme
        };
    }

    /**
     * Compose from selection
     */
    async composeFromSelection(themedSelection, analysis, options) {
        console.log('🔧 Composing final template...');
        
        const primary = themedSelection.primary;
        
        // Handle inheritance if available
        let resolvedTemplate;
        if (this.inheritanceEngine && primary.inheritance?.extends) {
            resolvedTemplate = await this.inheritanceEngine.resolveTemplate(primary.id, analysis);
        } else {
            resolvedTemplate = {
                template: primary.content,
                compiled: primary.compiled,
                metadata: primary.metadata
            };
        }
        
        // Compose final result
        const composition = {
            id: `composed-${Date.now()}`,
            template: resolvedTemplate.template,
            compiled: resolvedTemplate.compiled,
            metadata: {
                ...resolvedTemplate.metadata,
                composition: {
                    strategy: themedSelection.strategy,
                    primary: primary.id,
                    supplements: themedSelection.supplements.map(s => s.template.id),
                    theme: themedSelection.appliedTheme,
                    score: themedSelection.score,
                    reasoning: themedSelection.reasoning
                },
                generatedAt: new Date().toISOString(),
                context: analysis
            },
            performance: {
                generation: Date.now(),
                score: themedSelection.score
            }
        };
        
        return composition;
    }

    /**
     * Track composition analytics
     */
    async trackComposition(context, selection, composition, duration) {
        if (!this.enableAnalytics) return;
        
        console.log('📈 Tracking composition analytics...');
        
        const templateId = selection.primary.id;
        
        // Update usage statistics
        if (!this.analytics.templateUsage.has(templateId)) {
            this.analytics.templateUsage.set(templateId, {
                total: 0,
                successful: 0,
                failed: 0,
                avgScore: 0
            });
        }
        
        const usage = this.analytics.templateUsage.get(templateId);
        usage.total++;
        usage.successful++; // Assume successful unless feedback indicates otherwise
        usage.avgScore = (usage.avgScore * (usage.total - 1) + selection.score) / usage.total;
        
        // Update performance metrics
        if (!this.analytics.performanceMetrics.has(templateId)) {
            this.analytics.performanceMetrics.set(templateId, {
                count: 0,
                totalTime: 0,
                avgTime: 0
            });
        }
        
        const performance = this.analytics.performanceMetrics.get(templateId);
        performance.count++;
        performance.totalTime += duration;
        performance.avgTime = performance.totalTime / performance.count;
        
        // Record selection history
        this.analytics.selectionHistory.push({
            timestamp: new Date().toISOString(),
            context,
            selection: {
                templateId,
                score: selection.score,
                reasoning: selection.reasoning
            },
            duration
        });
        
        // Persist analytics
        await this.saveAnalytics();
    }

    /**
     * Get cache key for composition
     */
    getCacheKey(context, options) {
        const key = {
            framework: context.framework,
            type: context.type,
            features: context.features?.sort(),
            complexity: context.complexity,
            theme: options.theme
        };
        
        return require('crypto')
            .createHash('md5')
            .update(JSON.stringify(key))
            .digest('hex')
            .substring(0, 16);
    }

    /**
     * Load analytics data
     */
    async loadAnalytics() {
        const analyticsPath = path.join(process.cwd(), '.auto-coder', 'analytics.json');
        
        if (await fs.pathExists(analyticsPath)) {
            try {
                const data = await fs.readJson(analyticsPath);
                
                // Convert Maps
                if (data.templateUsage) {
                    this.analytics.templateUsage = new Map(Object.entries(data.templateUsage));
                }
                
                if (data.performanceMetrics) {
                    this.analytics.performanceMetrics = new Map(Object.entries(data.performanceMetrics));
                }
                
                if (data.qualityFeedback) {
                    this.analytics.qualityFeedback = new Map(Object.entries(data.qualityFeedback));
                }
                
                if (data.selectionHistory) {
                    this.analytics.selectionHistory = data.selectionHistory;
                }
                
                console.log('📊 Analytics data loaded');
            } catch (error) {
                console.warn('⚠️  Failed to load analytics data:', error.message);
            }
        }
    }

    /**
     * Save analytics data
     */
    async saveAnalytics() {
        if (!this.enableAnalytics) return;
        
        const analyticsPath = path.join(process.cwd(), '.auto-coder', 'analytics.json');
        await fs.ensureDir(path.dirname(analyticsPath));
        
        const data = {
            templateUsage: Object.fromEntries(this.analytics.templateUsage),
            performanceMetrics: Object.fromEntries(this.analytics.performanceMetrics),
            qualityFeedback: Object.fromEntries(this.analytics.qualityFeedback),
            selectionHistory: this.analytics.selectionHistory.slice(-1000) // Keep last 1000 entries
        };
        
        await fs.writeJson(analyticsPath, data, { spaces: 2 });
    }

    /**
     * Initialize performance tracking
     */
    initializePerformanceTracking() {
        // Track memory usage periodically
        setInterval(() => {
            const memUsage = process.memoryUsage();
            console.log(`🧠 Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
        }, 60000); // Every minute
    }

    /**
     * Get analytics summary
     */
    getAnalyticsSummary() {
        return {
            totalTemplates: this.analytics.templateUsage.size,
            totalGenerations: Array.from(this.analytics.templateUsage.values())
                .reduce((sum, usage) => sum + usage.total, 0),
            avgScore: Array.from(this.analytics.templateUsage.values())
                .reduce((sum, usage) => sum + usage.avgScore, 0) / this.analytics.templateUsage.size,
            performanceData: Object.fromEntries(this.analytics.performanceMetrics),
            recentSelections: this.analytics.selectionHistory.slice(-10)
        };
    }

    /**
     * Clear caches
     */
    clearCache() {
        this.compositionCache.clear();
        this.scoringCache.clear();
        console.log('🧹 Composition cache cleared');
    }
}

module.exports = DynamicCompositionEngine;
