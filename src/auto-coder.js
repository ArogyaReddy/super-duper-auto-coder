/**
 * Auto Coder Main Engine - Orchestrates the intelligent test generation process
 * Combines NLP analysis, pattern matching, and template generation
 */

const RequirementAnalyzer = require('./nlp/requirement-analyzer');
const PatternMatcher = require('./nlp/pattern-matcher');
const TemplateEngine = require('./templates/template-engine');
const FrameworkManager = require('./adapters/framework-manager');
const fs = require('fs-extra');
const path = require('path');

class AutoCoder {
    constructor(options = {}) {
        this.options = {
            outputPath: options.outputPath || './SBS_Automation',
            includeMetadata: options.includeMetadata !== false,
            generateComments: options.generateComments !== false,
            templateFormat: options.templateFormat || 'cucumber',
            confidenceThreshold: options.confidenceThreshold || 0.3,
            ...options
        };

        // Initialize components
        this.analyzer = new RequirementAnalyzer();
        this.matcher = new PatternMatcher();
        this.templateEngine = new TemplateEngine();
        this.frameworkManager = new FrameworkManager();
        
        this.initialized = false;
        this.stats = {
            totalRequirements: 0,
            successfulGenerations: 0,
            averageConfidence: 0,
            domainDistribution: {},
            intentDistribution: {}
        };
    }

    /**
     * Initialize all components
     */
    async initialize() {
        if (this.initialized) return;

        // Silent initialization - no console output
        try {
            // Initialize components in parallel
            await Promise.all([
                this.analyzer.initialize(),
                this.matcher.initialize(),
                this.templateEngine.initialize(),
                this.frameworkManager.initialize()
            ]);

            // Ensure output directory exists
            await fs.ensureDir(this.options.outputPath);
            
            this.initialized = true;
            // Silent initialization completed
        } catch (error) {
            console.error('❌ Failed to initialize Auto Coder Framework:', error.message);
            throw error;
        }
    }

    /**
     * Generate test artifacts from requirement
     */
    async generateFromRequirement(requirementText, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        const startTime = Date.now();
        // Processing requirement silently
        
        try {
            // Step 1: Analyze the requirement
            console.log('📊 Step 1: Analyzing requirement...');
            const analysis = await this.analyzer.analyzeRequirement(requirementText);
            
            // Step 2: Find matching patterns
            console.log('🔍 Step 2: Finding matching patterns...');
            const matches = await this.matcher.findBestPatterns(analysis);
            
            // Check confidence threshold
            if (matches.confidence < this.options.confidenceThreshold) {
                // Low confidence - using fallback generation silently
            }
            
            // Step 3: Generate templates
            console.log('🎨 Step 3: Generating templates...');
            const templateOptions = { ...this.options, ...options };
            
            // Determine framework to use
            const framework = options.framework || templateOptions.templateFormat || 'cucumber';
            
            let generation;
            if (framework === 'multi' || Array.isArray(framework)) {
                // Multi-framework generation
                const frameworks = Array.isArray(framework) ? framework : ['cucumber', 'playwright'];
                generation = await this.frameworkManager.generateMultiFramework(
                    frameworks, analysis, matches, templateOptions
                );
            } else {
                // Single framework generation
                const artifacts = await this.frameworkManager.generateWithFramework(
                    framework, analysis, matches, this.buildTemplateContext(analysis, matches, templateOptions)
                );
                generation = { 
                    files: artifacts.files,      // CRITICAL FIX: Use files not templates 
                    templates: artifacts.artifacts, // Put actual template content in templates
                    metadata: artifacts.metadata 
                };
            }
            
            // Step 4: Save artifacts
            console.log('💾 Step 4: Saving generated artifacts...');
            const outputResult = await this.saveArtifacts(generation, analysis, options);
            
            // Update statistics
            this.updateStats(analysis, matches);
            
            const duration = Date.now() - startTime;
            console.log(`✅ Generation completed in ${duration}ms`);
            
            return {
                success: true,
                analysis,
                matches,
                generation,
                output: outputResult,
                duration,
                confidence: matches.confidence,
                metadata: {
                    timestamp: new Date().toISOString(),
                    requirement: requirementText,
                    options: templateOptions
                }
            };
            
        } catch (error) {
            console.error('❌ Generation failed:', error.message);
            return {
                success: false,
                error: error.message,
                requirement: requirementText,
                duration: Date.now() - startTime
            };
        }
    }

    /**
     * Generate test artifacts from requirement file
     */
    async generateFromFile(filePath, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        console.log(`\n📄 Reading requirement file: ${filePath}`);
        
        try {
            // Check if file exists
            if (!await fs.pathExists(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }

            // Read file content
            const requirementText = await fs.readFile(filePath, 'utf8');
            
            if (!requirementText.trim()) {
                throw new Error(`File is empty: ${filePath}`);
            }

            console.log(`📝 File content (${requirementText.length} characters)`);
            
            // Add file path to options for context
            const fileOptions = {
                ...options,
                sourceFile: filePath,
                fileName: path.basename(filePath, path.extname(filePath))
            };

            // Generate from the file content
            const result = await this.generateFromRequirement(requirementText, fileOptions);
            
            if (result.success) {
                result.sourceFile = filePath;
            }
            
            return result;
            
        } catch (error) {
            console.error(`❌ Failed to process file ${filePath}:`, error.message);
            return {
                success: false,
                error: error.message,
                sourceFile: filePath,
                duration: 0
            };
        }
    }

    /**
     * Generate from multiple requirements (batch processing)
     */
    async generateBatch(requirements, options = {}) {
        console.log(`\n🔄 Processing batch of ${requirements.length} requirements...`);
        
        const results = [];
        const batchOptions = { ...options, batch: true };
        
        for (let i = 0; i < requirements.length; i++) {
            const requirement = requirements[i];
            console.log(`\n📋 Processing requirement ${i + 1}/${requirements.length}`);
            
            const result = await this.generateFromRequirement(requirement, batchOptions);
            results.push(result);
            
            // Add delay between requests to prevent overwhelming
            if (i < requirements.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        // Generate batch summary
        const summary = this.generateBatchSummary(results);
        
        // Save batch report
        if (options.generateReport !== false) {
            await this.saveBatchReport(results, summary, options);
        }
        
        console.log(`\n✅ Batch processing completed: ${summary.successful}/${summary.total} successful`);
        
        return {
            results,
            summary,
            batchOptions
        };
    }

    /**
     * Save generated artifacts to files
     */
    async saveArtifacts(generation, analysis, options = {}) {
        // CRITICAL FIX: If framework manager already saved files, use those instead of re-saving with timestamps
        if (generation.files && Object.keys(generation.files).length > 0) {
            console.log('💾 Step 4: Using artifacts already saved by Framework Manager...');
            
            // Framework Manager already saved the files with proper names - just report them
            for (const [type, filePath] of Object.entries(generation.files)) {
                const fileName = path.basename(filePath);
                console.log(`📁 Saved ${type}: ${fileName}`);
            }

            // Save summary metadata if needed
            if (this.options.includeMetadata) {
                const outputPath = options.outputPath || this.options.outputPath;
                const summaryDir = path.join(outputPath, 'summary');
                await fs.ensureDir(summaryDir);
                
                // Use content-based naming for summary, not timestamp  
                const baseName = generation.metadata?.baseName || this.generateContentBaseName(analysis);
                const metadataPath = path.join(summaryDir, `${baseName}-summary.json`);
                
                const metadata = {
                    // Detailed requirement analysis summary as requested by user
                    requirementAnalysis: {
                        originalText: analysis.originalText,
                        extractedEntities: analysis.entities,
                        extractedActions: analysis.actions,
                        extractedRoles: analysis.roles,
                        domain: analysis.domain,
                        intent: analysis.intent,
                        complexity: analysis.complexity,
                        keyFeatures: this.extractKeyFeatures(analysis.originalText),
                        acceptanceCriteria: this.extractAcceptanceCriteria(analysis.originalText),
                        testScenarios: this.extractTestScenarios(analysis.originalText)
                    },
                    
                    // Generated test artifacts summary
                    generatedArtifacts: {
                        featureFile: {
                            path: generation.files.feature,
                            scenarios: this.extractScenariosFromFeature(generation.templates?.feature || ''),
                            backgroundSteps: this.extractBackgroundSteps(generation.templates?.feature || '')
                        },
                        stepDefinitions: {
                            path: generation.files.steps,
                            stepCount: this.countSteps(generation.templates?.steps || '')
                        },
                        pageObjects: {
                            path: generation.files.page,
                            methods: this.extractPageMethods(generation.templates?.page || '')
                        }
                    },
                    
                    // Quality metrics
                    qualityMetrics: {
                        requirementCoverage: this.calculateRequirementCoverage(analysis, generation),
                        sbsPatternMatches: analysis.matchingFeatures?.length || 0,
                        confidenceScore: generation.metadata.matchingConfidence || 0
                    },
                    
                    // Technical metadata
                    technicalDetails: {
                        framework: generation.metadata.framework,
                        generatedAt: generation.metadata.generatedAt,
                        baseName: generation.metadata.baseName,
                        requirementLength: generation.metadata.requirementLength
                    },
                    
                    files: generation.files,
                    generatedAt: new Date().toISOString()
                };

                await fs.writeJson(metadataPath, metadata, { spaces: 2 });
            }

            return {
                files: generation.files,
                metadata: generation.metadata,
                summary: 'Used Framework Manager generated files'
            };
        }

        // Fallback to old behavior only if Framework Manager didn't provide files
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const baseName = this.generateBaseName(analysis, timestamp);
        const outputPath = options.outputPath || this.options.outputPath;
        
        // Ensure directory structure exists
        await this.ensureDirectoryStructure(outputPath);
        
        const savedFiles = {};
        
        // Save each template type to appropriate directories
        for (const [templateType, content] of Object.entries(generation.templates)) {
            if (content && content.trim()) {
                const fileName = this.generateFileName(baseName, templateType);
                const filePath = this.getFilePathForType(outputPath, templateType, fileName);
                
                await fs.writeFile(filePath, content, 'utf8');
                savedFiles[templateType] = filePath;
                
                console.log(`📁 Saved ${templateType}: ${fileName}`);
            }
        }
        
        // Save summary metadata
        if (this.options.includeMetadata) {
            const summaryDir = path.join(outputPath, 'summary');
            const metadataPath = path.join(summaryDir, `${baseName}-summary.json`);
            const metadata = {
                generation: generation.metadata,
                analysis: {
                    domain: analysis.domain,
                    intent: analysis.intent,
                    complexity: analysis.complexity,
                    confidence: generation.metadata.matchingConfidence
                },
                files: savedFiles,
                generatedAt: new Date().toISOString()
            };
            
            await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
            savedFiles.summary = metadataPath;
        }
        
        return {
            baseName,
            files: savedFiles,
            outputPath
        };
    }

    /**
     * Ensure proper directory structure exists
     */
    async ensureDirectoryStructure(outputPath) {
        const directories = [
            'features',
            'steps', 
            'pages',
            'tests',
            'summary'
        ];
        
        for (const dir of directories) {
            await fs.ensureDir(path.join(outputPath, dir));
        }
    }

    /**
     * Get file path based on template type
     */
    getFilePathForType(outputPath, templateType, fileName) {
        const directoryMap = {
            feature: 'features',
            steps: 'steps',
            page: 'pages', 
            test: 'tests',
            scenario: 'tests',
            config: 'tests',
            helpers: 'tests',
            fixtures: 'tests'
        };
        
        const directory = directoryMap[templateType] || 'tests';
        return path.join(outputPath, directory, fileName);
    }

    /**
     * Generate base name for files
     */
    generateBaseName(analysis, timestamp) {
        const domain = analysis.domain || 'general';
        const intent = analysis.intent || 'test';
        const entity = analysis.entities[0]?.entity || 'item';
        
        return `${domain}-${intent}-${entity}-${timestamp}`.replace(/[^a-zA-Z0-9-]/g, '-');
    }

    /**
     * Generate content-based name without timestamp for better organization
     */
    generateContentBaseName(analysis) {
        // Use the baseName from metadata if available (from source file)
        if (analysis.metadata?.baseName) {
            return analysis.metadata.baseName;
        }
        
        // Extract meaningful name from content dynamically (no hardcoding)
        const originalText = analysis.originalText || '';
        const entities = analysis.entities || [];
        const primaryEntity = entities[0]?.entity || 'item';
        const domain = analysis.domain || 'general';
        
        // Generate intelligent base name from requirement content
        const keyTerms = this.extractKeyTerms(originalText);
        if (keyTerms.length > 0) {
            return `jira-story-${keyTerms.join('-')}`.toLowerCase().replace(/[^a-zA-Z0-9-]/g, '-');
        }
        
        // Fallback to domain and entity
        return `jira-story-${domain}-${primaryEntity}`.replace(/[^a-zA-Z0-9-]/g, '-');
    }

    /**
     * Extract key terms from requirement text for naming
     */
    extractKeyTerms(text) {
        const terms = [];
        
        // Look for acronyms (CFC, ESO, etc.)
        const acronyms = text.match(/\b[A-Z]{2,}\b/g);
        if (acronyms) {
            terms.push(...acronyms.slice(0, 2).map(a => a.toLowerCase()));
        }
        
        // Look for key business terms
        const businessTerms = text.match(/\b(bundle|provisioning|worker|comp|menu|page|profile|task|order)\b/gi);
        if (businessTerms) {
            terms.push(...businessTerms.slice(0, 2).map(t => t.toLowerCase()));
        }
        
        return [...new Set(terms)].slice(0, 3); // Max 3 terms
    }

    /**
     * Generate file name with appropriate extension
     */
    generateFileName(baseName, templateType) {
        const extensions = {
            feature: '.feature',
            steps: '.js',
            page: '.js',
            scenario: '.spec.js'
        };
        
        const extension = extensions[templateType] || '.txt';
        return `${baseName}-${templateType}${extension}`;
    }

    /**
     * Update generation statistics
     */
    updateStats(analysis, matches) {
        this.stats.totalRequirements++;
        
        if (matches.confidence >= this.options.confidenceThreshold) {
            this.stats.successfulGenerations++;
        }
        
        // Update averages
        const total = this.stats.totalRequirements;
        this.stats.averageConfidence = ((this.stats.averageConfidence * (total - 1)) + matches.confidence) / total;
        
        // Update domain distribution
        this.stats.domainDistribution[analysis.domain] = (this.stats.domainDistribution[analysis.domain] || 0) + 1;
        
        // Update intent distribution
        this.stats.intentDistribution[analysis.intent] = (this.stats.intentDistribution[analysis.intent] || 0) + 1;
    }

    /**
     * Generate batch summary
     */
    generateBatchSummary(results) {
        const summary = {
            total: results.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            averageConfidence: 0,
            averageDuration: 0,
            domains: {},
            intents: {},
            errors: []
        };
        
        const successfulResults = results.filter(r => r.success);
        
        if (successfulResults.length > 0) {
            summary.averageConfidence = successfulResults.reduce((sum, r) => sum + r.confidence, 0) / successfulResults.length;
            summary.averageDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
            
            // Aggregate domains and intents
            successfulResults.forEach(result => {
                const domain = result.analysis.domain;
                const intent = result.analysis.intent;
                
                summary.domains[domain] = (summary.domains[domain] || 0) + 1;
                summary.intents[intent] = (summary.intents[intent] || 0) + 1;
            });
        }
        
        // Collect errors
        summary.errors = results.filter(r => !r.success).map(r => ({
            requirement: r.requirement,
            error: r.error
        }));
        
        return summary;
    }

    /**
     * Save batch processing report
     */
    async saveBatchReport(results, summary, options) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportPath = path.join(options.outputPath || this.options.outputPath, `batch-report-${timestamp}.json`);
        
        const report = {
            summary,
            results: results.map(r => ({
                requirement: r.requirement,
                success: r.success,
                confidence: r.confidence,
                domain: r.analysis?.domain,
                intent: r.analysis?.intent,
                duration: r.duration,
                error: r.error
            })),
            generatedAt: new Date().toISOString()
        };
        
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
        console.log(`📊 Batch report saved: ${reportPath}`);
    }

    /**
     * Get current statistics
     */
    getStats() {
        return {
            ...this.stats,
            successRate: this.stats.totalRequirements > 0 ? 
                (this.stats.successfulGenerations / this.stats.totalRequirements) * 100 : 0
        };
    }

    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            totalRequirements: 0,
            successfulGenerations: 0,
            averageConfidence: 0,
            domainDistribution: {},
            intentDistribution: {}
        };
    }

    /**
     * Interactive requirement analysis (for debugging)
     */
    async analyzeOnly(requirementText) {
        if (!this.initialized) {
            await this.initialize();
        }

        const analysis = await this.analyzer.analyzeRequirement(requirementText);
        const matches = await this.matcher.findBestPatterns(analysis);
        
        return {
            analysis,
            matches,
            recommendations: matches.recommendations.slice(0, 5).map(r => ({
                type: r.type,
                score: Math.round(r.score * 100),
                pattern: r.pattern.name || r.pattern.content?.substring(0, 50) + '...',
                reason: r.reason
            }))
        };
    }

    /**
     * Build template context for generation
     */
    buildTemplateContext(analysis, matches, options) {
        const topFeature = matches.recommendations.find(r => r.type === 'feature');
        const topStep = matches.recommendations.find(r => r.type === 'step');
        const topPage = matches.recommendations.find(r => r.type === 'page');

        return {
            // Analysis data
            domain: analysis.domain,
            intent: analysis.intent,
            complexity: analysis.complexity,
            originalText: analysis.originalText,
            requirementText: analysis.originalText, // CRITICAL FIX: Add requirementText for cucumber adapter
            
            // Source file information for consistent naming
            sourceFile: options.sourceFile,
            fileName: options.fileName,
            
            // Output directory
            outputDir: options.outputDir || options.outputPath || './SBS_Automation',
            
            // Extracted elements
            entities: analysis.entities.map(e => e.entity),
            actions: analysis.actions.map(a => a.action),
            roles: analysis.roles.map(r => r.role),
            
            // Primary elements (most frequent/relevant)
            primaryEntity: analysis.entities[0]?.entity || 'item',
            primaryAction: analysis.actions[0]?.action || 'process',
            primaryRole: analysis.roles[0]?.role || 'user',
            
            // Pattern-based suggestions
            suggestedFeature: topFeature?.pattern?.name || this.generateFeatureName(analysis),
            suggestedSteps: this.extractStepSuggestions(matches),
            suggestedPages: this.extractPageSuggestions(matches),
            
            // Generation options
            generateTimestamp: new Date().toISOString(),
            generateUser: options.user || 'auto-coder',
            projectName: options.projectName || 'test-project',
            outputDir: options.outputDir || this.options.outputPath, // CRITICAL FIX: Add outputDir for cucumber adapter
            
            // Formatting helpers
            featureName: this.generateFeatureName(analysis),
            scenarioName: this.generateScenarioName(analysis),
            className: this.generateClassName(analysis),
            methodName: this.generateMethodName(analysis)
        };
    }

    /**
     * Generate helper methods for naming
     */
    generateFeatureName(analysis) {
        const entity = analysis.entities[0]?.entity || 'item';
        const action = analysis.actions[0]?.action || 'manage';
        return `${this.titleCase(action)} ${this.titleCase(entity)}`;
    }

    generateScenarioName(analysis) {
        const entity = analysis.entities[0]?.entity || 'item';
        const action = analysis.actions[0]?.action || 'process';
        return `${this.titleCase(action)} a ${entity}`;
    }

    generateClassName(analysis) {
        const entity = analysis.entities[0]?.entity || 'item';
        return `${this.pascalCase(entity)}Page`;
    }

    generateMethodName(analysis) {
        const action = analysis.actions[0]?.action || 'process';
        const entity = analysis.entities[0]?.entity || 'item';
        return `${this.camelCase(action)}${this.pascalCase(entity)}`;
    }

    /**
     * String formatting utilities
     */
    titleCase(str) {
        if (!str) return '';
        return str.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }

    pascalCase(str) {
        if (!str) return '';
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
            return word.toUpperCase();
        }).replace(/\s+/g, '');
    }

    camelCase(str) {
        if (!str) return '';
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
    }

    extractStepSuggestions(matches) {
        return matches.recommendations
            .filter(r => r.type === 'step')
            .slice(0, 5)
            .map(r => r.pattern.content || r.pattern.name);
    }

    extractPageSuggestions(matches) {
        return matches.recommendations
            .filter(r => r.type === 'page')
            .slice(0, 3)
            .map(r => r.pattern.name || r.pattern.title);
    }

    /**
     * Suggest best framework for requirement
     */
    async suggestFramework(requirementText, projectContext = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        const analysis = await this.analyzer.analyzeRequirement(requirementText);
        return this.frameworkManager.suggestFramework(analysis, projectContext);
    }

    /**
     * Validate configuration
     */
    validateConfiguration() {
        const issues = [];
        
        if (!this.options.outputPath) {
            issues.push('Output path not configured');
        }
        
        if (this.options.confidenceThreshold < 0 || this.options.confidenceThreshold > 1) {
            issues.push('Confidence threshold must be between 0 and 1');
        }
        
        return {
            valid: issues.length === 0,
            issues
        };
    }

    /**
     * Helper methods for detailed summary generation
     */
    extractKeyFeatures(text) {
        const features = [];
        const lines = text.split('\n');
        
        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('Add ') || trimmed.startsWith('Create ') || 
                trimmed.startsWith('Update ') || trimmed.startsWith('Remove ')) {
                features.push(trimmed);
            }
        });
        
        return features.slice(0, 5);
    }

    extractAcceptanceCriteria(text) {
        const criteria = [];
        const lines = text.split('\n');
        let inCriteria = false;
        
        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.toLowerCase().includes('acceptance criteria')) {
                inCriteria = true;
                return;
            }
            if (inCriteria && trimmed.length > 10) {
                criteria.push(trimmed);
            }
        });
        
        return criteria;
    }

    extractTestScenarios(text) {
        const scenarios = [];
        const lines = text.split('\n');
        
        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.includes('should') || trimmed.includes('when') || 
                trimmed.includes('given') || trimmed.includes('then')) {
                scenarios.push(trimmed);
            }
        });
        
        return scenarios.slice(0, 3);
    }

    extractScenariosFromFeature(featureContent) {
        const scenarios = [];
        const lines = featureContent.split('\n');
        
        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('Scenario:')) {
                scenarios.push(trimmed.replace('Scenario:', '').trim());
            }
        });
        
        return scenarios;
    }

    extractBackgroundSteps(featureContent) {
        const steps = [];
        const lines = featureContent.split('\n');
        let inBackground = false;
        
        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('Background:')) {
                inBackground = true;
                return;
            }
            if (trimmed.startsWith('Scenario:')) {
                inBackground = false;
                return;
            }
            if (inBackground && (trimmed.startsWith('Given') || trimmed.startsWith('And'))) {
                steps.push(trimmed);
            }
        });
        
        return steps;
    }

    countSteps(stepContent) {
        const givenCount = (stepContent.match(/Given\(/g) || []).length;
        const whenCount = (stepContent.match(/When\(/g) || []).length;
        const thenCount = (stepContent.match(/Then\(/g) || []).length;
        
        return { given: givenCount, when: whenCount, then: thenCount, total: givenCount + whenCount + thenCount };
    }

    extractPageMethods(pageContent) {
        const methods = [];
        const lines = pageContent.split('\n');
        
        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.includes('async ') && trimmed.includes('(')) {
                const methodName = trimmed.match(/async\s+(\w+)\s*\(/);
                if (methodName) {
                    methods.push(methodName[1]);
                }
            }
        });
        
        return methods;
    }

    calculateRequirementCoverage(analysis, generation) {
        const totalEntities = analysis.entities?.length || 0;
        const totalActions = analysis.actions?.length || 0;
        const featureContent = generation.templates?.feature || '';
        
        let coveredEntities = 0;
        let coveredActions = 0;
        
        analysis.entities?.forEach(entity => {
            if (featureContent.toLowerCase().includes(entity.entity.toLowerCase())) {
                coveredEntities++;
            }
        });
        
        analysis.actions?.forEach(action => {
            if (featureContent.toLowerCase().includes(action.action.toLowerCase())) {
                coveredActions++;
            }
        });
        
        const entityCoverage = totalEntities > 0 ? coveredEntities / totalEntities : 0;
        const actionCoverage = totalActions > 0 ? coveredActions / totalActions : 0;
        
        return Math.round(((entityCoverage + actionCoverage) / 2) * 100);
    }
}

module.exports = AutoCoder;
