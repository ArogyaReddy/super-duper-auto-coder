
class AIPatternValidator {
    constructor(realSBSPatterns, enforcementRules) {
        this.realPatterns = realSBSPatterns;
        this.rules = enforcementRules;
    }

    validateAIGeneratedContent(type, content) {
        const violations = [];
        
        switch(type) {
            case 'feature':
                violations.push(...this.validateFeature(content));
                break;
            case 'steps':
                violations.push(...this.validateSteps(content));
                break;
            case 'page':
                violations.push(...this.validatePage(content));
                break;
        }
        
        return {
            isValid: violations.length === 0,
            violations: violations,
            suggestions: this.generateSuggestions(violations)
        };
    }

    validateFeature(content) {
        const violations = [];
        
        // Check for mandatory tags
        const requiredTags = this.rules.mandatory.feature.tags;
        for (const tag of requiredTags) {
            if (!content.includes(tag)) {
                violations.push({
                    type: 'missing_tag',
                    missing: tag,
                    line: 'Feature header'
                });
            }
        }
        
        // Check for Alex persona usage
        if (!content.includes('Alex ')) {
            violations.push({
                type: 'missing_persona',
                expected: 'Alex',
                line: 'Scenario steps'
            });
        }
        
        return violations;
    }

    validateSteps(content) {
        const violations = [];
        
        // Check for required imports
        const requiredImports = this.rules.mandatory.steps.imports;
        for (const imp of requiredImports) {
            if (!content.includes(imp)) {
                violations.push({
                    type: 'missing_import',
                    missing: imp,
                    line: 'Import section'
                });
            }
        }
        
        // Check for timeout pattern
        if (!content.includes('timeout: 420 * 1000')) {
            violations.push({
                type: 'missing_timeout',
                expected: '{ timeout: 420 * 1000 }',
                line: 'Step definitions'
            });
        }
        
        // Check for forbidden patterns
        for (const forbidden of this.rules.forbidden.generic) {
            if (content.includes(forbidden)) {
                violations.push({
                    type: 'forbidden_pattern',
                    pattern: forbidden,
                    line: 'Throughout file'
                });
            }
        }
        
        return violations;
    }

    validatePage(content) {
        const violations = [];
        
        // Check for By.xpath/By.css usage
        const hasXpath = content.includes('By.xpath');
        const hasCss = content.includes('By.css');
        
        if (!hasXpath && !hasCss) {
            violations.push({
                type: 'missing_real_locators',
                expected: 'By.xpath() or By.css()',
                line: 'Locator definitions'
            });
        }
        
        // Check for forbidden simple selectors
        for (const forbidden of this.rules.forbidden.simple) {
            if (content.includes(forbidden)) {
                violations.push({
                    type: 'forbidden_simple_selector',
                    pattern: forbidden,
                    line: 'Locator definitions'
                });
            }
        }
        
        return violations;
    }

    generateSuggestions(violations) {
        return violations.map(v => {
            switch(v.type) {
                case 'missing_tag':
                    return `Add ${v.missing} to feature header`;
                case 'missing_persona':
                    return 'Use Alex persona in all scenario steps';
                case 'missing_import':
                    return `Add: const { ... } = require('${v.missing}');`;
                case 'missing_timeout':
                    return 'Add { timeout: 420 * 1000 } to async step definitions';
                case 'forbidden_pattern':
                    return `Replace ${v.pattern} with real SBS patterns`;
                case 'missing_real_locators':
                    return 'Use By.xpath() or By.css() for locators';
                case 'forbidden_simple_selector':
                    return `Replace ${v.pattern} with complex xpath/css selectors`;
                default:
                    return 'Follow real SBS patterns';
            }
        });
    }
}

module.exports = { AIPatternValidator };
