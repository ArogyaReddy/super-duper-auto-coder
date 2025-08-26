/**
 * Pattern Matcher - Intelligent matching engine for finding best patterns
 * Uses NLP analysis to select appropriate SBS patterns for generation
 */

const natural = require('natural');
const fs = require('fs-extra');
const path = require('path');

class PatternMatcher {
    constructor() {
        this.patterns = {};
        this.vocabulary = {};
        this.matchingRules = {};
        this.initialized = false;
    }

    /**
     * Initialize the pattern matcher
     */
    async initialize() {
        if (this.initialized) return;

        // Silent initialization
        try {
            await this.loadKnowledgeBase();
            this.setupMatchingRules();
            
            this.initialized = true;
            // Initialization complete - no console output
        } catch (error) {
            console.error('❌ Failed to initialize Pattern Matcher:', error.message);
            throw error;
        }
    }

    /**
     * Load knowledge base
     */
    async loadKnowledgeBase() {
        const basePath = path.join(__dirname, '../../knowledge-base');
        
        // Load patterns
        this.patterns.features = await fs.readJson(path.join(basePath, 'patterns/features.json'));
        this.patterns.steps = await fs.readJson(path.join(basePath, 'patterns/steps.json'));
        this.patterns.pages = await fs.readJson(path.join(basePath, 'patterns/pages.json'));
        
        // Load vocabulary
        this.vocabulary.roles = await fs.readJson(path.join(basePath, 'vocabulary/roles.json'));
        this.vocabulary.actions = await fs.readJson(path.join(basePath, 'vocabulary/actions.json'));
        this.vocabulary.entities = await fs.readJson(path.join(basePath, 'vocabulary/entities.json'));
        
        // Knowledge base loaded silently
    }

    /**
     * Setup pattern matching rules
     */
    setupMatchingRules() {
        this.matchingRules = {
            // Domain-specific matching weights
            domainWeights: {
                exact: 1.0,
                related: 0.7,
                general: 0.3
            },
            
            // Pattern type priorities for different intents
            intentPriorities: {
                testing: ['features', 'steps', 'pages'],
                creation: ['features', 'pages', 'steps'],
                modification: ['steps', 'features', 'pages'],
                deletion: ['steps', 'features', 'pages'],
                navigation: ['pages', 'steps', 'features'],
                general: ['features', 'steps', 'pages']
            },
            
            // Complexity-based pattern selection
            complexityFilters: {
                low: { maxSteps: 5, preferSimple: true },
                medium: { maxSteps: 10, preferModerate: true },
                high: { maxSteps: 20, preferComplex: true }
            },
            
            // Minimum similarity thresholds
            similarityThresholds: {
                features: 0.3,
                steps: 0.4,
                pages: 0.3
            }
        };
    }

    /**
     * Find best matching patterns for analyzed requirement
     */
    async findBestPatterns(analysis) {
        if (!this.initialized) {
            await this.initialize();
        }

        // Finding best patterns silently
        
        const matches = {
            features: this.matchFeaturePatterns(analysis),
            steps: this.matchStepPatterns(analysis),
            pages: this.matchPagePatterns(analysis),
            
            // Combined recommendations
            recommendations: [],
            confidence: 0,
            reasoning: []
        };

        // Generate recommendations based on intent priorities
        matches.recommendations = this.generateRecommendations(analysis, matches);
        
        // Calculate overall confidence
        matches.confidence = this.calculateOverallConfidence(matches);
        
        // Generate reasoning
        matches.reasoning = this.generateReasoning(analysis, matches);
        
                
        // Pattern matching completed silently
        return matches;
        
        return matches;
    }

    /**
     * Match feature patterns
     */
    matchFeaturePatterns(analysis) {
        const matches = [];
        const threshold = this.matchingRules.similarityThresholds.features;
        
        this.patterns.features.forEach(feature => {
            const score = this.calculatePatternScore(analysis, feature, 'feature');
            
            if (score.total >= threshold) {
                matches.push({
                    pattern: feature,
                    score: score.total,
                    breakdown: score.breakdown,
                    type: 'feature'
                });
            }
        });
        
        return matches.sort((a, b) => b.score - a.score).slice(0, 10);
    }

    /**
     * Match step patterns
     */
    matchStepPatterns(analysis) {
        const matches = [];
        const threshold = this.matchingRules.similarityThresholds.steps;
        
        this.patterns.steps.forEach(step => {
            const score = this.calculatePatternScore(analysis, step, 'step');
            
            if (score.total >= threshold) {
                matches.push({
                    pattern: step,
                    score: score.total,
                    breakdown: score.breakdown,
                    type: 'step'
                });
            }
        });
        
        return matches.sort((a, b) => b.score - a.score).slice(0, 10);
    }

    /**
     * Match page patterns
     */
    matchPagePatterns(analysis) {
        const matches = [];
        const threshold = this.matchingRules.similarityThresholds.pages;
        
        this.patterns.pages.forEach(page => {
            const score = this.calculatePatternScore(analysis, page, 'page');
            
            if (score.total >= threshold) {
                matches.push({
                    pattern: page,
                    score: score.total,
                    breakdown: score.breakdown,
                    type: 'page'
                });
            }
        });
        
        return matches.sort((a, b) => b.score - a.score).slice(0, 10);
    }

    /**
     * Calculate comprehensive pattern score
     */
    calculatePatternScore(analysis, pattern, patternType) {
        const breakdown = {
            domainMatch: 0,
            textSimilarity: 0,
            entityMatch: 0,
            actionMatch: 0,
            roleMatch: 0,
            complexityMatch: 0
        };

        // Domain matching
        if (pattern.domain === analysis.domain) {
            breakdown.domainMatch = this.matchingRules.domainWeights.exact;
        } else if (pattern.domain === 'general' || analysis.domain === 'general') {
            breakdown.domainMatch = this.matchingRules.domainWeights.general;
        } else {
            // Check if domains are related through shared entities/actions
            const sharedTerms = this.findSharedDomainTerms(analysis.domain, pattern.domain);
            if (sharedTerms > 0) {
                breakdown.domainMatch = this.matchingRules.domainWeights.related;
            }
        }

        // Text similarity
        const patternText = pattern.content || pattern.name || pattern.title || '';
        breakdown.textSimilarity = natural.JaroWinklerDistance(analysis.originalText.toLowerCase(), patternText.toLowerCase());

        // Entity matching
        const patternEntities = this.extractPatternEntities(pattern);
        const sharedEntities = analysis.entities.filter(e => 
            patternEntities.some(pe => pe.includes(e.entity) || e.entity.includes(pe))
        ).length;
        breakdown.entityMatch = sharedEntities / Math.max(analysis.entities.length, 1);

        // Action matching
        const patternActions = this.extractPatternActions(pattern);
        const sharedActions = analysis.actions.filter(a => 
            patternActions.some(pa => pa.includes(a.action) || a.action.includes(pa))
        ).length;
        breakdown.actionMatch = sharedActions / Math.max(analysis.actions.length, 1);

        // Role matching
        const patternRoles = this.extractPatternRoles(pattern);
        const sharedRoles = analysis.roles.filter(r => 
            patternRoles.some(pr => pr.includes(r.role) || r.role.includes(pr))
        ).length;
        breakdown.roleMatch = sharedRoles / Math.max(analysis.roles.length, 1);

        // Complexity matching
        const patternComplexity = this.assessPatternComplexity(pattern);
        breakdown.complexityMatch = this.calculateComplexityMatch(analysis.complexity, patternComplexity);

        // Calculate weighted total
        const weights = {
            domainMatch: 0.25,
            textSimilarity: 0.20,
            entityMatch: 0.20,
            actionMatch: 0.15,
            roleMatch: 0.10,
            complexityMatch: 0.10
        };

        const total = Object.keys(breakdown).reduce((sum, key) => {
            return sum + (breakdown[key] * weights[key]);
        }, 0);

        return { total, breakdown };
    }

    /**
     * Extract entities mentioned in pattern
     */
    extractPatternEntities(pattern) {
        const text = (pattern.content || pattern.name || pattern.title || '').toLowerCase();
        const entities = [];
        
        Object.keys(this.vocabulary.entities).forEach(entity => {
            if (text.includes(entity)) {
                entities.push(entity);
            }
        });
        
        return entities;
    }

    /**
     * Extract actions mentioned in pattern
     */
    extractPatternActions(pattern) {
        const text = (pattern.content || pattern.name || pattern.title || '').toLowerCase();
        const actions = [];
        
        Object.keys(this.vocabulary.actions).forEach(action => {
            if (text.includes(action)) {
                actions.push(action);
            }
        });
        
        return actions;
    }

    /**
     * Extract roles mentioned in pattern
     */
    extractPatternRoles(pattern) {
        const text = (pattern.content || pattern.name || pattern.title || '').toLowerCase();
        const roles = [];
        
        Object.keys(this.vocabulary.roles).forEach(role => {
            if (text.includes(role)) {
                roles.push(role);
            }
        });
        
        return roles;
    }

    /**
     * Assess pattern complexity
     */
    assessPatternComplexity(pattern) {
        const text = pattern.content || pattern.name || pattern.title || '';
        const words = text.split(/\s+/).length;
        
        if (words > 15) return 'high';
        if (words > 8) return 'medium';
        return 'low';
    }

    /**
     * Calculate complexity matching score
     */
    calculateComplexityMatch(analysisComplexity, patternComplexity) {
        if (analysisComplexity === patternComplexity) return 1.0;
        
        const complexityLevels = ['low', 'medium', 'high'];
        const analysisIndex = complexityLevels.indexOf(analysisComplexity);
        const patternIndex = complexityLevels.indexOf(patternComplexity);
        
        const distance = Math.abs(analysisIndex - patternIndex);
        return Math.max(0, 1 - (distance * 0.3));
    }

    /**
     * Find shared terms between domains
     */
    findSharedDomainTerms(domain1, domain2) {
        let sharedCount = 0;
        
        // Check entities
        Object.values(this.vocabulary.entities).forEach(entity => {
            if (entity.domains && entity.domains.includes(domain1) && entity.domains.includes(domain2)) {
                sharedCount++;
            }
        });
        
        // Check actions
        Object.values(this.vocabulary.actions).forEach(action => {
            if (action.domains && action.domains.includes(domain1) && action.domains.includes(domain2)) {
                sharedCount++;
            }
        });
        
        return sharedCount;
    }

    /**
     * Generate pattern recommendations
     */
    generateRecommendations(analysis, matches) {
        const priorities = this.matchingRules.intentPriorities[analysis.intent] || 
                          this.matchingRules.intentPriorities.general;
        
        const recommendations = [];
        
        priorities.forEach(patternType => {
            const typeMatches = matches[patternType] || [];
            const topMatches = typeMatches.slice(0, 3); // Top 3 per type
            
            topMatches.forEach(match => {
                recommendations.push({
                    ...match,
                    priority: priorities.indexOf(patternType) + 1,
                    reason: `Best ${patternType} match for ${analysis.intent} intent in ${analysis.domain} domain`
                });
            });
        });
        
        return recommendations.sort((a, b) => {
            // Sort by priority first, then by score
            if (a.priority !== b.priority) return a.priority - b.priority;
            return b.score - a.score;
        }).slice(0, 10); // Top 10 overall
    }

    /**
     * Calculate overall confidence
     */
    calculateOverallConfidence(matches) {
        const allScores = matches.recommendations.map(r => r.score);
        if (allScores.length === 0) return 0;
        
        const avgScore = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
        const maxScore = Math.max(...allScores);
        
        // Confidence based on both average quality and best match
        return (avgScore * 0.6) + (maxScore * 0.4);
    }

    /**
     * Generate reasoning for matches
     */
    generateReasoning(analysis, matches) {
        const reasoning = [];
        
        reasoning.push(`Domain: ${analysis.domain} (confidence: ${Math.round(analysis.confidence * 100)}%)`);
        reasoning.push(`Intent: ${analysis.intent} - prioritizing ${this.matchingRules.intentPriorities[analysis.intent]?.join(', ') || 'general'} patterns`);
        reasoning.push(`Complexity: ${analysis.complexity} - filtering for appropriate pattern complexity`);
        
        if (analysis.entities.length > 0) {
            reasoning.push(`Key entities: ${analysis.entities.slice(0, 3).map(e => e.entity).join(', ')}`);
        }
        
        if (analysis.actions.length > 0) {
            reasoning.push(`Key actions: ${analysis.actions.slice(0, 3).map(a => a.action).join(', ')}`);
        }
        
        if (matches.recommendations.length > 0) {
            const topMatch = matches.recommendations[0];
            reasoning.push(`Best match: ${topMatch.type} pattern with ${Math.round(topMatch.score * 100)}% relevance`);
        }
        
        return reasoning;
    }
}

module.exports = PatternMatcher;
