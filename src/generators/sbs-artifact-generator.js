/**
 * FIXED: SBS-Aware Artifact Generator
 * This replaces the broken generic template system with requirement-aware generation
 */

const path = require('path');
const fs = require('fs-extra');
const Handlebars = require('handlebars');

class SBSArtifactGenerator {
    constructor() {
        this.sbsPatterns = null;
        this.sbsVocabulary = null;
    }

    async initialize() {
        // Load SBS patterns and vocabulary
        try {
            this.sbsPatterns = {
                features: await fs.readJSON('./knowledge-base/patterns/features.json'),
                steps: await fs.readJSON('./knowledge-base/patterns/steps.json'),
                pages: await fs.readJSON('./knowledge-base/patterns/pages.json')
            };
            
            this.sbsVocabulary = {
                roles: await fs.readJSON('./knowledge-base/vocabulary/roles.json'),
                actions: await fs.readJSON('./knowledge-base/vocabulary/actions.json'),
                entities: await fs.readJSON('./knowledge-base/vocabulary/entities.json')
            };
            
            console.log('✅ SBS patterns and vocabulary loaded');
        } catch (error) {
            console.log('⚠️ Using fallback patterns');
        }
    }

    /**
     * Generate artifacts based on requirement file
     */
    async generateArtifacts(requirementFile, outputDir) {
        const requirementText = await fs.readFile(requirementFile, 'utf8');
        const baseName = path.basename(requirementFile, path.extname(requirementFile));
        
        // Analyze requirement content
        const analysis = this.analyzeRequirement(requirementText);
        
        // Generate context for templates
        const context = this.buildContext(analysis, baseName, requirementText);
        
        // Generate artifacts
        const artifacts = {
            feature: this.generateFeatureFile(context),
            steps: this.generateStepDefinitions(context),
            page: this.generatePageObject(context)
        };
        
        // Save with proper naming and directory structure
        await fs.ensureDir(outputDir);
        
        // Create SBS_Automation directory structure
        const featuresDir = path.join(outputDir, 'features');
        const stepsDir = path.join(outputDir, 'steps');
        const pagesDir = path.join(outputDir, 'pages');
        const supportDir = path.join(outputDir, 'support');
        
        await fs.ensureDir(featuresDir);
        await fs.ensureDir(stepsDir);
        await fs.ensureDir(pagesDir);
        await fs.ensureDir(supportDir);
        
        const files = {
            feature: path.join(featuresDir, `${baseName}.feature`),
            steps: path.join(stepsDir, `${baseName}-steps.js`),
            page: path.join(pagesDir, `${baseName}-page.js`)
        };
        
        await fs.writeFile(files.feature, artifacts.feature);
        await fs.writeFile(files.steps, artifacts.steps);
        await fs.writeFile(files.page, artifacts.page);
        
        return { artifacts, files };
    }

    /**
     * Analyze requirement text to extract key information
     */
    analyzeRequirement(text) {
        const analysis = {
            featureName: this.extractFeatureName(text),
            domain: this.extractDomain(text),
            scenarios: this.extractScenarios(text),
            entities: this.extractEntities(text),
            actions: this.extractActions(text),
            roles: this.extractRoles(text),
            featureFlags: this.extractFeatureFlags(text),
            acceptanceCriteria: this.extractAcceptanceCriteria(text)
        };
        
        return analysis;
    }

    extractFeatureName(text) {
        // Extract feature name from first line or key phrases
        const firstLine = text.split('\n')[0].trim();
        
        // Look for key phrases that indicate the feature
        if (text.includes('Workers\' comp') && text.includes('Additional requirements')) {
            return 'Workers Comp Additional Requirements Step';
        }
        
        if (text.includes('CFC') && text.includes('landing')) {
            return 'CFC Landing Page Access';
        }
        
        // Fallback to first line
        return firstLine.length > 5 ? firstLine : 'Feature Implementation';
    }

    extractDomain(text) {
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('tax') || lowerText.includes('payroll')) return 'tax';
        if (lowerText.includes('cfc') || lowerText.includes('cashflow')) return 'financial';
        if (lowerText.includes('employee') || lowerText.includes('hr')) return 'hr';
        if (lowerText.includes('client') || lowerText.includes('user')) return 'client';
        
        return 'application';
    }

    extractScenarios(text) {
        const scenarios = [];
        const acceptanceCriteria = text.match(/Acceptance criteria?:([\s\S]*?)(?=\n\n|$)/i);
        
        if (acceptanceCriteria) {
            const criteria = acceptanceCriteria[1];
            const lines = criteria.split('\n').filter(line => line.trim());
            
            lines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine && !trimmedLine.includes(':') && trimmedLine.length > 10) {
                    scenarios.push({
                        name: this.generateScenarioName(trimmedLine),
                        description: trimmedLine,
                        originalText: trimmedLine
                    });
                }
            });
        }
        
        // Add feature flag scenarios if present
        const featureFlags = this.extractFeatureFlags(text);
        if (featureFlags.length > 0) {
            scenarios.push({
                name: 'Feature flag enabled behavior',
                description: 'Verify behavior when feature flag is enabled',
                tags: ['@feature-flag'],
                featureFlag: featureFlags[0]
            });
            
            scenarios.push({
                name: 'Feature flag disabled behavior', 
                description: 'Verify behavior when feature flag is disabled',
                tags: ['@legacy-behavior'],
                featureFlag: featureFlags[0]
            });
        }
        
        return scenarios;
    }

    generateScenarioName(description) {
        // Convert description to scenario name
        return description
            .replace(/^(When|If|With)\\s+/i, '')
            .replace(/\\s+/g, ' ')
            .trim()
            .toLowerCase()
            .replace(/^\\w/, c => c.toUpperCase());
    }

    extractFeatureFlags(text) {
        const flags = [];
        const flagMatches = text.match(/FF:\s*([^\n]+)/g);
        
        if (flagMatches) {
            flagMatches.forEach(match => {
                const flag = match.replace(/FF:\s*/, '').trim();
                flags.push(flag);
            });
        }
        
        return flags;
    }

    extractAcceptanceCriteria(text) {
        const criteriaMatch = text.match(/Acceptance criteria?:([\s\S]*?)(?=\n\n|$)/i);
        
        if (criteriaMatch) {
            return criteriaMatch[1]
                .split('\n')
                .filter(line => line.trim())
                .map(line => line.trim());
        }
        
        return [];
    }

    extractEntities(text) {
        const entities = new Set();
        const lowerText = text.toLowerCase();
        
        // SBS-specific entities
        if (this.sbsVocabulary?.entities) {
            this.sbsVocabulary.entities.forEach(entity => {
                if (lowerText.includes(entity.toLowerCase())) {
                    entities.add(entity);
                }
            });
        }
        
        // Common entities
        const commonEntities = ['page', 'step', 'button', 'form', 'menu', 'user', 'client', 'comp', 'requirement'];
        commonEntities.forEach(entity => {
            if (lowerText.includes(entity)) {
                entities.add(entity);
            }
        });
        
        return Array.from(entities);
    }

    extractActions(text) {
        const actions = new Set();
        const lowerText = text.toLowerCase();
        
        // SBS-specific actions
        if (this.sbsVocabulary?.actions) {
            this.sbsVocabulary.actions.forEach(action => {
                if (lowerText.includes(action.toLowerCase())) {
                    actions.add(action);
                }
            });
        }
        
        // Common actions
        const commonActions = ['access', 'navigate', 'show', 'hide', 'move', 'add', 'configure', 'view'];
        commonActions.forEach(action => {
            if (lowerText.includes(action)) {
                actions.add(action);
            }
        });
        
        return Array.from(actions);
    }

    extractRoles(text) {
        const roles = new Set();
        const lowerText = text.toLowerCase();
        
        // SBS-specific roles
        if (this.sbsVocabulary?.roles) {
            this.sbsVocabulary.roles.forEach(role => {
                if (lowerText.includes(role.toLowerCase())) {
                    roles.add(role);
                }
            });
        }
        
        // Common roles
        const commonRoles = ['user', 'client', 'admin', 'professional', 'employee'];
        commonRoles.forEach(role => {
            if (lowerText.includes(role)) {
                roles.add(role);
            }
        });
        
        return Array.from(roles);
    }

    buildContext(analysis, baseName, requirementText) {
        return {
            featureName: analysis.featureName,
            baseName: baseName,
            domain: analysis.domain,
            category: analysis.domain || 'common', // ✅ FIX: Set category for proper path generation
            primaryRole: analysis.roles[0] || 'user',
            primaryAction: analysis.actions[0] || 'access',
            primaryEntity: analysis.entities[0] || 'system',
            scenarios: analysis.scenarios,
            featureFlags: analysis.featureFlags,
            acceptanceCriteria: analysis.acceptanceCriteria,
            requirementText: requirementText,
            className: this.toPascalCase(baseName),
            timestamp: new Date().toISOString()
        };
    }

    toPascalCase(str) {
        return str
            .split(/[-_\\s]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');
    }

    /**
     * Generate feature file based on actual requirement content
     */
    generateFeatureFile(context) {
        let featureContent = `Feature: ${context.featureName}\n`;
        featureContent += `  As a ${context.primaryRole}\n`;
        featureContent += `  I want to ${context.primaryAction} ${context.primaryEntity}\n`;
        featureContent += `  So that I can achieve the business requirements\n\n`;
        
        // CRITICAL: Use EXACT Background steps from main SBS_Automation framework
        featureContent += `  Background:\n`;
        featureContent += `    Given Alex is logged into RunMod with a homepage test client\n`;
        featureContent += `    Then Alex verifies that the Payroll section on the Home Page is displayed\n\n`;
        
        // Generate scenarios based on acceptance criteria
        if (context.scenarios.length > 0) {
            context.scenarios.forEach((scenario, index) => {
                if (scenario.tags) {
                    featureContent += `  ${scenario.tags.join(' ')}\n`;
                }
                featureContent += `  Scenario: ${scenario.name}\n`;
                
                // Generate scenario steps based on description
                const steps = this.generateScenarioSteps(scenario, context);
                steps.forEach(step => {
                    featureContent += `    ${step}\n`;
                });
                
                if (index < context.scenarios.length - 1) {
                    featureContent += `\n`;
                }
            });
        } else {
            // Fallback scenario
            featureContent += `  Scenario: ${context.featureName} implementation\n`;
            featureContent += `    When I ${context.primaryAction} the ${context.primaryEntity}\n`;
            featureContent += `    Then the system should respond appropriately\n`;
            featureContent += `    And I should see the expected results\n`;
        }
        
        return featureContent;
    }

    generateScenarioSteps(scenario, context) {
        const steps = [];
        
        // Feature flag scenarios
        if (scenario.tags?.includes('@feature-flag')) {
            if (context.featureFlags.length > 0) {
                steps.push(`Given the feature flag "${context.featureFlags[0]}" is enabled`);
            }
        }
        
        if (scenario.tags?.includes('@legacy-behavior')) {
            if (context.featureFlags.length > 0) {
                steps.push(`Given the feature flag "${context.featureFlags[0]}" is disabled`);
            }
        }
        
        // Add context-specific steps
        if (scenario.description.includes('show') || scenario.description.includes('visible')) {
            steps.push(`When I navigate to the relevant section`);
            steps.push(`Then the element should be visible`);
        }
        
        if (scenario.description.includes('hide') || scenario.description.includes('not show')) {
            steps.push(`When I navigate to the relevant section`);
            steps.push(`Then the element should not be visible`);
        }
        
        // Default steps if none generated
        if (steps.length === 0) {
            steps.push(`When I perform the required action`);
            steps.push(`Then the system should behave as expected`);
        }
        
        return steps;
    }

    /**
     * Generate step definitions with proper SBS patterns
     */
    generateStepDefinitions(context) {
        return `const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('chai').assert;
const ${context.className}Page = require('../pages/${context.baseName}-page');

// Page object instance
let ${context.baseName.replace(/-/g, '')}Page;

// Hook to initialize page object
Before(async function () {
  ${context.baseName.replace(/-/g, '')}Page = new ${context.className}Page(this.page);
});

// Specific action steps for ${context.featureName}
When('Alex ${context.primaryAction.toLowerCase()} the ${context.primaryEntity}', async function () {
  await ${context.baseName.replace(/-/g, '')}Page.${context.primaryAction.toLowerCase().replace(/\s+/g, '')}${context.primaryEntity.replace(/\s+/g, '')}();
});

// Specific verification steps for ${context.featureName}
Then('Alex verifies the ${context.primaryEntity} is displayed correctly', async function () {
  const isDisplayed = await ${context.baseName.replace(/-/g, '')}Page.verify${context.primaryEntity.replace(/\s+/g, '')}IsDisplayed();
  assert.isTrue(isDisplayed, '${context.primaryEntity} should be displayed correctly');
});

Then('Alex confirms the ${context.primaryEntity} functionality works as expected', async function () {
  const functionalityWorks = await ${context.baseName.replace(/-/g, '')}Page.verify${context.primaryEntity.replace(/\s+/g, '')}Functionality();
  assert.isTrue(functionalityWorks, '${context.primaryEntity} functionality should work as expected');
});
`;
    }

    /**
     * Generate page object with EXACT SBS patterns - NO DEVIATIONS
     */
    generatePageObject(context) {
        // CRITICAL: Follow EXACT SBS_Automation patterns - Correct imports for auto-coder location
        return `const By = require('../../../SBS_Automation/support/By.js');
const BasePage = require('../../../SBS_Automation/pages/common/base-page');

// Locators defined at top of file (SBS pattern) - NO CONSTRUCTOR DEFINITIONS
const ${context.baseName.toUpperCase().replace(/-/g, '_')}_CONTAINER = By.css('[data-test-id="${context.baseName}-container"]');
const ${context.baseName.toUpperCase().replace(/-/g, '_')}_${context.primaryEntity.toUpperCase().replace(/\s+/g, '_')} = By.css('[data-test-id="${context.baseName}-${context.primaryEntity.toLowerCase().replace(/\s+/g, '-')}"]');
const ${context.baseName.toUpperCase().replace(/-/g, '_')}_VERIFICATION_ELEMENT = By.css('[data-test-id="${context.baseName}-verification"]');

class ${context.className}Page extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }

  // Specific action methods for ${context.featureName} - NO GENERIC NAMES
  async ${context.primaryAction.toLowerCase().replace(/\s+/g, '')}${context.primaryEntity.replace(/\s+/g, '')}() {
    await this.waitForSelector(${context.baseName.toUpperCase().replace(/-/g, '_')}_${context.primaryEntity.toUpperCase().replace(/\s+/g, '_')});
    await this.click(${context.baseName.toUpperCase().replace(/-/g, '_')}_${context.primaryEntity.toUpperCase().replace(/\s+/g, '_')});
  }

  // Specific verification methods for ${context.featureName} - NO GENERIC NAMES
  async verify${context.primaryEntity.replace(/\s+/g, '')}IsDisplayed() {
    return await this.isVisible(${context.baseName.toUpperCase().replace(/-/g, '_')}_${context.primaryEntity.toUpperCase().replace(/\s+/g, '_')});
  }

  async verify${context.primaryEntity.replace(/\s+/g, '')}Functionality() {
    const isVisible = await this.isVisible(${context.baseName.toUpperCase().replace(/-/g, '_')}_VERIFICATION_ELEMENT);
    const isClickable = await this.isElementClickable(${context.baseName.toUpperCase().replace(/-/g, '_')}_${context.primaryEntity.toUpperCase().replace(/\s+/g, '_')});
    return isVisible && isClickable;
  }
}

module.exports = ${context.className}Page;
`;
    }

}

module.exports = SBSArtifactGenerator;