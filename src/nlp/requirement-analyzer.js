/**
 * Requirement Analyzer - Core NLP engine for understanding user requirements
 * Uses extracted SBS patterns and vocabulary for intelligent analysis
 */

const natural = require('natural');
const compromise = require('compromise');
const fs = require('fs-extra');
const path = require('path');

class RequirementAnalyzer {
    constructor() {
        this.tokenizer = new natural.WordTokenizer();
        this.stemmer = natural.PorterStemmer;
        this.tfidf = new natural.TfIdf();
        
        // Load knowledge base
        this.vocabulary = {};
        this.patterns = {};
        this.domainClassifier = new natural.BayesClassifier();
        
        this.initialized = false;
    }

    /**
     * Initialize the analyzer with knowledge base
     */
    async initialize() {
        if (this.initialized) return;

        // Load SBS vocabulary and patterns
        await this.loadSBSVocabulary();
        await this.loadSBSPatterns();
        
        this.initialized = true;
        // NLP Analyzer initialized with SBS patterns
    }

    /**
     * Load SBS_Automation vocabulary patterns
     */
    async loadSBSVocabulary() {
        try {
            // Load extracted SBS vocabulary
            this.sbsRoles = await fs.readJSON('./knowledge-base/vocabulary/roles.json');
            this.sbsActions = await fs.readJSON('./knowledge-base/vocabulary/actions.json');
            this.sbsEntities = await fs.readJSON('./knowledge-base/vocabulary/entities.json');
            
            console.log(`📚 Loaded SBS vocabulary: ${this.sbsRoles.length} roles, ${this.sbsActions.length} actions, ${this.sbsEntities.length} entities`);
        } catch (error) {
            console.log('⚠️  SBS vocabulary not found, using defaults');
            this.sbsRoles = ['user', 'admin', 'client'];
            this.sbsActions = ['access', 'process', 'manage'];
            this.sbsEntities = ['page', 'data', 'system'];
        }
    }

    /**
     * Load SBS_Automation feature patterns
     */
    async loadSBSPatterns() {
        try {
            this.sbsFeatures = await fs.readJSON('./knowledge-base/patterns/features.json');
            this.sbsSteps = await fs.readJSON('./knowledge-base/patterns/steps.json');
            this.sbsPages = await fs.readJSON('./knowledge-base/patterns/pages.json');
            
            console.log(`🎯 Loaded SBS patterns: ${this.sbsFeatures.length} features, ${this.sbsSteps.length} steps, ${this.sbsPages.length} pages`);
        } catch (error) {
            console.log('⚠️  SBS patterns not found');
            this.sbsFeatures = [];
            this.sbsSteps = [];
            this.sbsPages = [];
        }
    }

    /**
     * Load vocabulary from knowledge base
     */
    async loadVocabulary() {
        const vocabPath = path.join(__dirname, '../../knowledge-base/vocabulary');
        
        // Load roles, actions, and entities
        this.vocabulary.roles = await fs.readJson(path.join(vocabPath, 'roles.json'));
        this.vocabulary.actions = await fs.readJson(path.join(vocabPath, 'actions.json'));
        this.vocabulary.entities = await fs.readJson(path.join(vocabPath, 'entities.json'));
        
        // Vocabulary loaded silently
    }

    /**
     * Load patterns from knowledge base
     */
    async loadPatterns() {
        const patternsPath = path.join(__dirname, '../../knowledge-base/patterns');
        
        this.patterns.features = await fs.readJson(path.join(patternsPath, 'features.json'));
        this.patterns.steps = await fs.readJson(path.join(patternsPath, 'steps.json'));
        this.patterns.pages = await fs.readJson(path.join(patternsPath, 'pages.json'));
        
        // Patterns loaded silently
    }

    /**
     * Train domain classifier using extracted patterns
     */
    async trainDomainClassifier() {
        // Silent training
        
        // Enhanced training with better domain detection
        const domainKeywords = {
            'employee': ['employee', 'staff', 'worker', 'personnel', 'contractor', 'w2', 'employment'],
            'payroll': ['payroll', 'salary', 'wage', 'pay', 'compensation', 'benefit', 'tax'],
            'client': ['client', 'customer', 'account', 'organization', 'company'],
            'system': ['system', 'application', 'platform', 'software', 'admin'],
            'financial': ['cash', 'money', 'finance', 'accounting', 'invoice', 'billing'],
            'ui': ['page', 'landing', 'interface', 'button', 'form', 'display', 'navigation']
        };

        // Train with domain keywords
        Object.entries(domainKeywords).forEach(([domain, keywords]) => {
            keywords.forEach(keyword => {
                this.domainClassifier.addDocument(keyword, domain);
                this.domainClassifier.addDocument(`${keyword} management`, domain);
                this.domainClassifier.addDocument(`${keyword} process`, domain);
            });
        });
        
        // Train on feature patterns with enhanced domain extraction
        if (this.patterns.features && Array.isArray(this.patterns.features)) {
            this.patterns.features.forEach(feature => {
                try {
                    if (feature.path || feature.source) {
                        // Extract domain from file path
                        const pathParts = (feature.path || feature.source).split('/');
                        const possibleDomain = pathParts.find(part => 
                            Object.keys(domainKeywords).some(domain => 
                                part.toLowerCase().includes(domain) || 
                                domainKeywords[domain].some(keyword => part.toLowerCase().includes(keyword))
                            )
                        );
                        
                        const content = this.extractFeatureContent(feature);
                        if (content && possibleDomain) {
                            const detectedDomain = this.detectDomainFromKeywords(content, domainKeywords);
                            this.domainClassifier.addDocument(content, detectedDomain || 'general');
                        }
                    }
                } catch (error) {
                    console.warn(`⚠️ Failed to process feature: ${error.message}`);
                }
            });
        }
        
        // Train on step patterns with enhanced domain extraction  
        if (this.patterns.steps && Array.isArray(this.patterns.steps)) {
            this.patterns.steps.forEach(step => {
                try {
                    const content = this.extractStepContent(step);
                    if (content) {
                        const detectedDomain = this.detectDomainFromKeywords(content, domainKeywords);
                        this.domainClassifier.addDocument(content, detectedDomain || 'general');
                    }
                } catch (error) {
                    console.warn(`⚠️ Failed to process step: ${error.message}`);
                }
            });
        }
        
        this.domainClassifier.train();
        // Training completed silently
    }

    /**
     * Extract meaningful content from feature pattern
     */
    extractFeatureContent(feature) {
        if (feature.structure) {
            const parts = [];
            if (feature.structure.titlePattern) parts.push(feature.structure.titlePattern);
            if (feature.structure.scenarioPatterns) parts.push(...feature.structure.scenarioPatterns);
            if (feature.structure.stepPatterns) {
                feature.structure.stepPatterns.forEach(step => {
                    if (step.pattern) parts.push(step.pattern);
                });
            }
            return parts.join(' ').replace(/\{[^}]+\}/g, ''); // Remove template variables
        }
        return '';
    }

    /**
     * Extract meaningful content from step pattern
     */
    extractStepContent(step) {
        if (step.stepDefinitions && Array.isArray(step.stepDefinitions)) {
            return step.stepDefinitions
                .map(def => def.pattern || def.originalText || '')
                .join(' ')
                .replace(/\{[^}]+\}/g, ''); // Remove template variables
        }
        return '';
    }

    /**
     * Detect domain from content using keywords
     */
    detectDomainFromKeywords(content, domainKeywords) {
        const lowerContent = content.toLowerCase();
        let bestMatch = null;
        let maxMatches = 0;

        Object.entries(domainKeywords).forEach(([domain, keywords]) => {
            const matches = keywords.filter(keyword => lowerContent.includes(keyword)).length;
            if (matches > maxMatches) {
                maxMatches = matches;
                bestMatch = domain;
            }
        });

        return bestMatch;
    }

    /**
     * Analyze user requirement text
     */
    async analyzeRequirement(requirementText) {
        if (!this.initialized) {
            await this.initialize();
        }

        // Analyzing requirement silently
        
        const analysis = {
            originalText: requirementText,
            timestamp: new Date().toISOString(),
            
            // Basic NLP analysis
            tokens: this.extractTokens(requirementText),
            entities: this.extractEntities(requirementText),
            actions: this.extractActions(requirementText),
            roles: this.extractRoles(requirementText),
            
            // Domain classification
            domain: this.classifyDomain(requirementText),
            confidence: this.getDomainConfidence(requirementText),
            
            // Pattern matching
            matchingFeatures: this.findMatchingFeatures(requirementText),
            matchingSteps: this.findMatchingSteps(requirementText),
            matchingPages: this.findMatchingPages(requirementText),
            
            // Intent analysis
            intent: this.analyzeIntent(requirementText),
            complexity: this.assessComplexity(requirementText)
        };

        // Analysis completed silently
        
        return analysis;
    }

    /**
     * Extract and normalize tokens
     */
    extractTokens(text) {
        const tokens = this.tokenizer.tokenize(text.toLowerCase());
        return tokens.map(token => this.stemmer.stem(token));
    }

    /**
     * Extract entities using SBS vocabulary
     */
    extractEntities(text) {
        const found = [];
        const lowerText = text.toLowerCase();
        
        // Use extracted SBS entities
        if (this.sbsEntities && this.sbsEntities.length > 0) {
            this.sbsEntities.forEach(entity => {
                if (lowerText.includes(entity.toLowerCase())) {
                    found.push({
                        entity,
                        confidence: 0.8,
                        type: 'sbs_entity'
                    });
                }
            });
        }
        
        // Fallback to original vocabulary if no SBS entities found
        if (found.length === 0 && this.vocabulary.entities) {
            Object.keys(this.vocabulary.entities).forEach(entity => {
                if (lowerText.includes(entity)) {
                    found.push({
                        entity,
                        count: this.vocabulary.entities[entity].count,
                        domains: this.vocabulary.entities[entity].domains
                    });
                }
            });
        }
        
        return found.sort((a, b) => (b.confidence || b.count || 0) - (a.confidence || a.count || 0));
    }

    /**
     * Extract actions using SBS vocabulary
     */
    extractActions(text) {
        const found = [];
        const lowerText = text.toLowerCase();
        
        // Use extracted SBS actions
        if (this.sbsActions && this.sbsActions.length > 0) {
            this.sbsActions.forEach(action => {
                if (lowerText.includes(action.toLowerCase())) {
                    found.push({
                        action,
                        confidence: 0.8,
                        type: 'sbs_action'
                    });
                }
            });
        }
        
        // Fallback to original vocabulary if no SBS actions found
        if (found.length === 0 && this.vocabulary.actions) {
            Object.keys(this.vocabulary.actions).forEach(action => {
                if (lowerText.includes(action)) {
                    found.push({
                        action,
                        count: this.vocabulary.actions[action].count,
                        domains: this.vocabulary.actions[action].domains
                    });
                }
            });
        }
        
        return found.sort((a, b) => (b.confidence || b.count || 0) - (a.confidence || a.count || 0));
    }

    /**
     * Extract roles using SBS vocabulary
     */
    extractRoles(text) {
        const found = [];
        const lowerText = text.toLowerCase();
        
        // Use extracted SBS roles
        if (this.sbsRoles && this.sbsRoles.length > 0) {
            this.sbsRoles.forEach(role => {
                if (lowerText.includes(role.toLowerCase())) {
                    found.push({
                        role,
                        confidence: 0.8,
                        type: 'sbs_role'
                    });
                }
            });
        }
        
        // Fallback to original vocabulary if no SBS roles found
        if (found.length === 0 && this.vocabulary.roles) {
            Object.keys(this.vocabulary.roles).forEach(role => {
                if (lowerText.includes(role)) {
                    found.push({
                        role,
                        count: this.vocabulary.roles[role].count,
                        domains: this.vocabulary.roles[role].domains
                    });
                }
            });
        }
        
        return found.sort((a, b) => (b.confidence || b.count || 0) - (a.confidence || a.count || 0));
    }

    /**
     * Classify domain using trained classifier with fallback logic
     */
    classifyDomain(text) {
        try {
            const classification = this.domainClassifier.classify(text);
            const confidence = this.getDomainConfidence(text);
            
            // If confidence is very low, try keyword-based classification
            if (confidence < 0.3) {
                const keywordDomain = this.classifyByKeywords(text);
                if (keywordDomain) {
                    return keywordDomain;
                }
            }
            
            return classification || 'general';
        } catch (error) {
            console.warn('⚠️ Domain classification failed, using keyword fallback');
            return this.classifyByKeywords(text) || 'general';
        }
    }

    /**
     * Classify domain using keyword matching as fallback
     */
    classifyByKeywords(text) {
        const lowerText = text.toLowerCase();
        
        // Domain keywords for classification
        const domainPatterns = {
            'employee': /\b(employee|staff|worker|personnel|contractor|w2|employment|termination|onboard|hire)\b/g,
            'payroll': /\b(payroll|salary|wage|pay|compensation|benefit|tax|withhold|calculation)\b/g,
            'client': /\b(client|customer|account|organization|company|run|cfc|cashflow)\b/g,
            'system': /\b(system|application|platform|software|admin|configuration|setting)\b/g,
            'financial': /\b(cash|money|finance|accounting|invoice|billing|central|flow)\b/g,
            'ui': /\b(page|landing|interface|button|form|display|navigation|footer|header|promo)\b/g
        };

        let bestMatch = null;
        let maxMatches = 0;

        Object.entries(domainPatterns).forEach(([domain, pattern]) => {
            const matches = (lowerText.match(pattern) || []).length;
            if (matches > maxMatches) {
                maxMatches = matches;
                bestMatch = domain;
            }
        });

        return bestMatch;
    }

    /**
     * Get domain classification confidence with enhanced calculation
     */
    getDomainConfidence(text) {
        try {
            const classifications = this.domainClassifier.getClassifications(text);
            if (classifications.length > 0) {
                const topClassification = classifications[0];
                
                // Boost confidence if keyword matching agrees
                const keywordDomain = this.classifyByKeywords(text);
                if (keywordDomain === topClassification.label) {
                    return Math.min(topClassification.value + 0.2, 1.0); // Boost confidence
                }
                
                return topClassification.value;
            }
            return 0;
        } catch (error) {
            console.warn('⚠️ Domain confidence calculation failed');
            
            // Fallback: calculate confidence based on keyword matches
            const keywordDomain = this.classifyByKeywords(text);
            return keywordDomain ? 0.6 : 0.3; // Reasonable confidence for keyword matches
        }
    }

    /**
     * Find matching feature patterns using SBS patterns
     */
    findMatchingFeatures(text) {
        // Use SBS feature patterns if available
        if (this.sbsFeatures && this.sbsFeatures.length > 0) {
            return this.findSimilarPatterns(text, this.sbsFeatures, 0.3);
        }
        
        // Fallback to original patterns
        return this.findSimilarPatterns(text, this.patterns.features || [], 0.3);
    }

    /**
     * Find matching step patterns using SBS patterns
     */
    findMatchingSteps(text) {
        // Use SBS step patterns if available
        if (this.sbsSteps && this.sbsSteps.length > 0) {
            return this.findSimilarPatterns(text, this.sbsSteps, 0.4);
        }
        
        // Fallback to original patterns
        return this.findSimilarPatterns(text, this.patterns.steps || [], 0.4);
    }

    /**
     * Find matching page patterns using SBS patterns
     */
    findMatchingPages(text) {
        // Use SBS page patterns if available
        if (this.sbsPages && this.sbsPages.length > 0) {
            return this.findSimilarPatterns(text, this.sbsPages, 0.3);
        }
        
        // Fallback to original patterns
        return this.findSimilarPatterns(text, this.patterns.pages || [], 0.3);
    }

    /**
     * Find similar patterns using TF-IDF similarity
     */
    findSimilarPatterns(text, patterns, threshold = 0.3) {
        if (!patterns || !Array.isArray(patterns) || patterns.length === 0) {
            console.log('⚠️ No patterns available for similarity matching');
            return [];
        }
        
        // Create temporary TF-IDF for this comparison
        const tempTfidf = new natural.TfIdf();
        
        // Add user text
        tempTfidf.addDocument(text);
        
        // Add patterns
        patterns.forEach(pattern => {
            tempTfidf.addDocument(pattern.content || pattern.name || '');
        });
        
        const similarities = [];
        
        // Calculate similarities
        for (let i = 1; i < patterns.length + 1; i++) {
            const similarity = natural.JaroWinklerDistance(text, patterns[i - 1].content || patterns[i - 1].name || '');
            
            if (similarity > threshold) {
                similarities.push({
                    pattern: patterns[i - 1],
                    similarity: similarity,
                    score: Math.round(similarity * 100)
                });
            }
        }
        
        return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
    }

    /**
     * Analyze intent from requirement
     */
    analyzeIntent(text) {
        const doc = compromise(text);
        const lowerText = text.toLowerCase();
        
        // Check for test-related keywords
        if (lowerText.includes('test') || lowerText.includes('testing') || 
            lowerText.includes('verify') || lowerText.includes('validate') || 
            lowerText.includes('check')) {
            return 'testing';
        }
        
        // Check for creation keywords
        if (lowerText.includes('create') || lowerText.includes('add') || 
            lowerText.includes('new') || lowerText.includes('generate')) {
            return 'creation';
        }
        
        // Check for modification keywords
        if (lowerText.includes('update') || lowerText.includes('modify') || 
            lowerText.includes('change') || lowerText.includes('edit')) {
            return 'modification';
        }
        
        // Check for deletion keywords
        if (lowerText.includes('delete') || lowerText.includes('remove') || 
            lowerText.includes('cancel')) {
            return 'deletion';
        }
        
        // Check for navigation keywords
        if (lowerText.includes('navigate') || lowerText.includes('go to') || 
            lowerText.includes('open') || lowerText.includes('access')) {
            return 'navigation';
        }
        
        return 'general';
    }

    /**
     * Assess complexity based on multiple factors
     */
    assessComplexity(text) {
        let score = 0;
        
        // Length factor
        const words = text.split(/\s+/).length;
        if (words > 20) score += 2;
        else if (words > 10) score += 1;
        
        // Multiple actions factor
        const actionWords = ['and', 'then', 'after', 'before', 'when'];
        actionWords.forEach(word => {
            if (text.toLowerCase().includes(word)) score += 1;
        });
        
        // Conditional logic factor
        const conditionalWords = ['if', 'unless', 'depending', 'based on'];
        conditionalWords.forEach(word => {
            if (text.toLowerCase().includes(word)) score += 2;
        });
        
        // Multiple entities factor
        const entities = this.extractEntities(text);
        if (entities.length > 3) score += 2;
        else if (entities.length > 1) score += 1;
        
        // Return complexity level
        if (score >= 6) return 'high';
        if (score >= 3) return 'medium';
        return 'low';
    }
}

module.exports = RequirementAnalyzer;
