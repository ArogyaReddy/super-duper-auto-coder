const fs = require('fs');
const path = require('path');

class SbsAutomationPatterns {
  constructor() {
    this.patterns = null;
    this.loadPatterns();
  }

  loadPatterns() {
    try {
      const patternsPath = path.join(__dirname, '..', 'config', 'sbs-automation-patterns.json');
      const patternsData = fs.readFileSync(patternsPath, 'utf8');
      this.patterns = JSON.parse(patternsData);
    } catch (error) {
      throw new Error(`Failed to load SBS_Automation patterns: ${error.message}`);
    }
  }

  // Base Page Pattern Methods
  getBasePageImports() {
    return this.patterns.basePage.classPattern.imports.join('\n');
  }

  getBasePageConstructor() {
    return this.patterns.basePage.classPattern.constructor;
  }

  getBasePageMethod(methodName) {
    return this.patterns.basePage.commonMethods[methodName];
  }

  getAllBasePageMethods() {
    return this.patterns.basePage.commonMethods;
  }

  // Step Definition Patterns
  getStepImports() {
    return this.patterns.stepDefinitions.imports.join('\n');
  }

  getPageInstantiationPattern() {
    return this.patterns.stepDefinitions.pageInstantiation;
  }

  getAssertionPattern(assertionType) {
    return this.patterns.stepDefinitions.assertionPatterns?.[assertionType] || '';
  }

  // Locator Patterns
  getLocatorPattern(patternType, elementId) {
    const pattern = this.patterns.locatorPatterns[patternType];
    if (patternType === 'byClass') {
      return pattern.replace('element-id', elementId);
    }
    return pattern;
  }

  generateConstantLocator(elementName, elementId) {
    const template = this.patterns.locatorPatterns.constants;
    return template.replace('ELEMENT_NAME', elementName.toUpperCase())
                  .replace('element-id', elementId);
  }

  // Feature Patterns
  getFeatureTags() {
    return this.patterns.featurePatterns.tags;
  }

  getBackgroundSteps() {
    return this.patterns.featurePatterns.backgroundStructure;
  }

  // Environment Configuration
  getEnvironmentConfig() {
    return this.patterns.environmentConfig;
  }

  getBaseUrl(environment = 'staging') {
    return this.patterns.environmentConfig.baseUrls[environment];
  }

  getTestData() {
    return this.patterns.environmentConfig.testData;
  }

  getBrowserConfig() {
    return this.patterns.environmentConfig.browserConfig;
  }

  // Common Elements
  getCommonElement(category, elementName) {
    return this.patterns.commonElements[category]?.[elementName];
  }

  getLoginElements() {
    return this.patterns.commonElements.login;
  }

  getNavigationElements() {
    return this.patterns.commonElements.navigation;
  }

  // Utility Methods
  generateBasePage(className, elements = {}) {
    const imports = this.getBasePageImports();
    const constructor = this.getBasePageConstructor();
    const methods = this.getAllBasePageMethods();

    let locatorConstants = '';
    Object.entries(elements).forEach(([name, selector]) => {
      locatorConstants += `const ${name.toUpperCase()} = By.css('${selector}');\n`;
    });

    let methodImplementations = '';
    Object.entries(methods).forEach(([name, implementation]) => {
      methodImplementations += `  ${implementation}\n\n`;
    });

    return `${imports}

// ${className} Page Locators
${locatorConstants}

class ${className} extends BasePage {
  ${constructor}

${methodImplementations}}

module.exports = ${className};`;
  }

  generateStepDefinition(featureName, steps = []) {
    const imports = this.getStepImports();
    const pageClass = `${featureName.replace(/-/g, '')}Page`;
    const pageInstantiation = this.getPageInstantiationPattern()
      .replace('pageObject', `${featureName.replace(/-/g, '')}Page`)
      .replace('PageClass', pageClass);

    let stepImplementations = '';
    steps.forEach(step => {
      const stepType = step.type || 'Given';
      stepImplementations += `${stepType}('${step.text}', async function () {
  ${pageInstantiation}
  ${step.implementation || '// Implementation needed'}
});

`;
    });

    return `${imports}
const ${pageClass} = require('../pages/${featureName}-page');

// Page object instance
let ${featureName.replace(/-/g, '')}Page;

${stepImplementations}`;
  }

  // Generate complete test artifacts
  generateCompleteArtifacts(businessName, requirements = {}) {
    const className = this.toPascalCase(businessName);
    const kebabName = this.toKebabCase(businessName);
    
    return {
      feature: this.generateFeatureFile(businessName, requirements),
      steps: this.generateStepDefinition(kebabName, requirements.steps || []),
      page: this.generateBasePage(className, requirements.elements || {})
    };
  }

  // Helper methods
  toPascalCase(str) {
    if (!str) return '';
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())
              .replace(/^[a-z]/, letter => letter.toUpperCase());
  }

  toKebabCase(str) {
    if (!str) return '';
    return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  }

  generateFeatureFile(businessName, requirements = {}) {
    const tags = this.getFeatureTags().join(' ');
    const backgroundSteps = this.getBackgroundSteps();
    
    const scenarios = requirements.scenarios && requirements.scenarios.length > 0 
      ? requirements.scenarios.map(scenario => 
          `  Scenario: ${scenario.title}\n    ${scenario.steps.join('\n    ')}`
        ).join('\n\n')
      : '  Scenario: Default scenario\n    Given I have the basic setup\n    When I perform the action\n    Then I should see the expected result';
    
    return `${tags}
Feature: ${businessName}
  ${requirements.description || 'Business feature description'}

  Background:
    ${backgroundSteps.map(step => step).join('\n    ')}

${scenarios}`;
  }
}

// Export singleton instance
module.exports = new SbsAutomationPatterns();
