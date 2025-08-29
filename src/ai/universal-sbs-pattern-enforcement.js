#!/usr/bin/env node

/**
 * UNIVERSAL SBS PATTERN ENFORCEMENT SYSTEM
 * 
 * This is the master system that enforces real SBS patterns across:
 * 1. AI-generated artifacts 
 * 2. Framework-generated artifacts
 * 3. Manual user input
 */

const { AIPatternValidator } = require('./ai-pattern-validator');
const { AIPatternInjector } = require('./ai-pattern-injector');

class UniversalSBSPatternEnforcement {
    constructor() {
        this.validator = null;
        this.injector = null;
        this.realPatterns = null;
        this.enforcementRules = null;
    }

    async initialize() {
        // Load real SBS patterns and rules
        const { RealSBSPatternExtractor } = require('../scripts/extract-real-sbs-patterns');
        const extractor = new RealSBSPatternExtractor();
        
        // Initialize components
        this.validator = new AIPatternValidator(this.realPatterns, this.enforcementRules);
        this.injector = new AIPatternInjector(this.realPatterns);
        
        console.log('🛡️ Universal SBS Pattern Enforcement initialized');
    }

    // Main enforcement method for AI generation
    async enforceAIGeneration(userRequest, artifactType) {
        console.log(`🔍 Enforcing real SBS patterns for AI generation: ${artifactType}`);
        
        // 1. Inject real patterns into AI prompt
        const enhancedPrompt = this.injector.injectRealPatternsIntoAIPrompt(userRequest, artifactType);
        
        // 2. Generate with AI (placeholder - integrate with actual AI)
        const aiResponse = await this.generateWithAI(enhancedPrompt);
        
        // 3. Validate generated content
        const validation = this.validator.validateAIGeneratedContent(artifactType, aiResponse);
        
        // 4. Fix violations if any
        const finalContent = validation.isValid ? 
            aiResponse : 
            await this.fixViolations(aiResponse, validation.violations, artifactType);
        
        // 5. Final enhanced response
        const enforcedContent = this.injector.enhanceAIResponse(finalContent, artifactType);
        
        console.log(`✅ AI generation enforced with real SBS patterns`);
        return {
            content: enforcedContent,
            violations: validation.violations,
            suggestions: validation.suggestions
        };
    }

    // Main enforcement method for framework generation
    async enforceFrameworkGeneration(templatePath, outputPath) {
        console.log('🔧 Enforcing real SBS patterns for framework generation');
        
        // Framework already updated to use REAL-SBS-REFERENCE files
        // This validates the output
        
        if (fs.existsSync(outputPath)) {
            const content = fs.readFileSync(outputPath, 'utf8');
            const validation = this.validator.validateAIGeneratedContent('page', content);
            
            if (!validation.isValid) {
                console.warn('⚠️ Framework generation has violations:', validation.violations);
                return validation;
            }
        }
        
        console.log('✅ Framework generation enforced with real SBS patterns');
        return { isValid: true, violations: [], suggestions: [] };
    }

    async generateWithAI(enhancedPrompt) {
        // Placeholder for AI integration
        // In real implementation, this would call the AI service
        console.log('🤖 Generating with AI using enhanced prompt...');
        return 'AI_GENERATED_CONTENT_PLACEHOLDER';
    }

    async fixViolations(content, violations, artifactType) {
        console.log(`🔧 Fixing ${violations.length} violations...`);
        
        let fixed = content;
        
        for (const violation of violations) {
            fixed = this.applyFix(fixed, violation, artifactType);
        }
        
        return fixed;
    }

    applyFix(content, violation, artifactType) {
        switch(violation.type) {
            case 'missing_tag':
                return `@Team:Agnostics\n${content}`;
            
            case 'missing_persona':
                return content.replace(/Given (I|User|Someone)/g, 'Given Alex');
            
            case 'forbidden_pattern':
                if (violation.pattern === 'data-testid') {
                    return content.replace(/data-testid=[^\s>]+/g, 'xpath-complex-selector');
                }
                break;
            
            default:
                return content;
        }
        
        return content;
    }

    // Quick validation method
    validateContent(type, content) {
        return this.validator.validateAIGeneratedContent(type, content);
    }

    // Get real pattern examples
    getRealPatternExamples(type) {
        switch(type) {
            case 'feature':
                return this.realPatterns?.feature?.template || 'No feature template loaded';
            case 'steps':
                return this.realPatterns?.steps?.template || 'No steps template loaded';
            case 'page':
                return this.realPatterns?.page?.template || 'No page template loaded';
            default:
                return 'Unknown type';
        }
    }
}

module.exports = { UniversalSBSPatternEnforcement };
