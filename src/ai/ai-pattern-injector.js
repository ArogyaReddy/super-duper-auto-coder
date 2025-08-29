
class AIPatternInjector {
    constructor(realSBSPatterns) {
        this.realPatterns = realSBSPatterns;
    }

    injectRealPatternsIntoAIPrompt(userRequest, artifactType) {
        const basePrompt = this.buildBasePrompt(userRequest);
        const patternInstructions = this.buildPatternInstructions(artifactType);
        const examples = this.buildRealExamples(artifactType);
        
        return `${basePrompt}

MANDATORY: You MUST follow these EXACT patterns from the real SBS_Automation framework:

${patternInstructions}

REAL SBS EXAMPLES TO FOLLOW:
${examples}

FORBIDDEN: Do NOT use simple selectors like data-testid, #id, .class
REQUIRED: Use complex By.xpath() and By.css() patterns like the examples above
REQUIRED: Use Alex persona in all scenarios
REQUIRED: Include @Team:Agnostics and @regression tags
REQUIRED: Use 420 * 1000 timeout in step definitions
`;
    }

    buildBasePrompt(userRequest) {
        return `Generate test artifacts for: ${userRequest}`;
    }

    buildPatternInstructions(artifactType) {
        switch(artifactType) {
            case 'feature':
                return `
FEATURE FILE PATTERNS:
- Start with @Team:Agnostics tag
- Include @regression tag
- Use Alex persona: "Given Alex is logged into RunMod..."
- Scenario format: "Alex can [action] [object]"
`;
            
            case 'steps':
                return `
STEPS FILE PATTERNS:
- Import: const { assert, expect } = require('chai');
- Import: const { Given, When, Then } = require('@cucumber/cucumber');
- Timeout: { timeout: 420 * 1000 }
- Assertions: assert.isTrue(condition, message)
`;
            
            case 'page':
                return `
PAGE FILE PATTERNS:
- Import: const By = require('../../support/By.js');
- Import: const BasePage = require('../base-page');
- Locators: const element = By.xpath("//complex/xpath");
- Locators: const element = By.css('[complex="selector"]');
- Methods: await this.waitForSelector(locator, timeout);
`;
            
            default:
                return 'Follow real SBS patterns from examples';
        }
    }

    buildRealExamples(artifactType) {
        switch(artifactType) {
            case 'feature':
                return this.realPatterns.feature?.template || '';
            case 'steps':
                return this.realPatterns.steps?.template || '';
            case 'page':
                return this.realPatterns.page?.template || '';
            default:
                return '';
        }
    }

    enhanceAIResponse(aiResponse, artifactType) {
        // Post-process AI response to ensure compliance
        let enhanced = aiResponse;
        
        // Force real SBS patterns
        enhanced = this.forceRealSBSPatterns(enhanced, artifactType);
        
        // Remove forbidden patterns
        enhanced = this.removeForbiddenPatterns(enhanced);
        
        return enhanced;
    }

    forceRealSBSPatterns(content, artifactType) {
        let enhanced = content;
        
        // Force Alex persona
        enhanced = enhanced.replace(/(?<!Alex )(?:I|User|Someone) (can|should|will)/g, 'Alex $1');
        
        // Force real tags
        if (artifactType === 'feature' && !enhanced.includes('@Team:Agnostics')) {
            enhanced = '@Team:Agnostics\n' + enhanced;
        }
        
        // Force timeout pattern
        if (artifactType === 'steps') {
            enhanced = enhanced.replace(/Given\(/g, 'Given(');
            enhanced = enhanced.replace(/When\(/g, 'When(');
            enhanced = enhanced.replace(/Then\(/g, 'Then(');
            
            // Add timeout to async functions
            enhanced = enhanced.replace(
                /(Given|When|Then)\([^,]+,\s*async\s*function/g,
                '$1($2, { timeout: 420 * 1000 }, async function'
            );
        }
        
        return enhanced;
    }

    removeForbiddenPatterns(content) {
        let cleaned = content;
        
        // Remove simple selectors
        cleaned = cleaned.replace(/data-testid=[^\s>]+/g, 'REPLACE_WITH_XPATH');
        cleaned = cleaned.replace(/getElementById\([^)]+\)/g, 'By.xpath("//complex/xpath")');
        cleaned = cleaned.replace(/querySelector\([^)]+\)/g, 'By.css("[complex=\"selector\"]")');
        
        return cleaned;
    }
}

module.exports = { AIPatternInjector };
