const path = require('path');
const SBSAnalyzer = require('./sbs-analyzer.js');

/**
 * Pattern Matcher - Matches generated artifacts against SBS_Automation patterns
 * Ensures 100% compliance with SBS directory structure and naming conventions
 */
class PatternMatcher {
  constructor() {
    this.sbsAnalyzer = new SBSAnalyzer();
    this.sbsBasePath = '/Users/gadea/auto/auto/qa_automation/SBS_Automation';
  }

  /**
   * Match directory structure against SBS patterns
   */
  async matchDirectoryStructure(module, feature, submodule = null) {
    const patterns = await this.sbsAnalyzer.getPatterns();
    
    // Generate SBS-compliant directory structure
    const structure = {
      feature: this.generateFeaturePath(module, feature, submodule, patterns),
      steps: this.generateStepsPath(module, feature, patterns),
      pageObject: this.generatePageObjectPath(module, feature, patterns),
      testData: this.generateTestDataPath(module, feature, patterns)
    };

    // Validate against existing SBS patterns
    const validation = {
      feature: await this.validatePath(structure.feature, 'feature', patterns),
      steps: await this.validatePath(structure.steps, 'steps', patterns),
      pageObject: await this.validatePath(structure.pageObject, 'pages', patterns),
      testData: await this.validatePath(structure.testData, 'data', patterns)
    };

    return {
      structure,
      validation,
      isCompliant: Object.values(validation).every(v => v.isValid)
    };
  }

  /**
   * Generate SBS-compliant feature file path
   */
  generateFeaturePath(module, feature, submodule, patterns) {
    const featureName = this.sanitizeFileName(feature);
    
    // Check if submodule is commonly used in this module
    if (submodule) {
      const commonSubmodule = this.findCommonSubmodule(module, submodule, patterns);
      return `features/${module}/${commonSubmodule}/${featureName}.feature`;
    }
    
    // Use most common submodule pattern for this module
    const defaultSubmodule = this.getDefaultSubmodule(module, patterns);
    return `features/${module}/${defaultSubmodule}/${featureName}.feature`;
  }

  /**
   * Generate SBS-compliant steps file path
   */
  generateStepsPath(module, feature, patterns) {
    const featureName = this.sanitizeFileName(feature);
    const stepsFileName = this.generateStepsFileName(featureName, patterns);
    return `steps/${module}/${stepsFileName}`;
  }

  /**
   * Generate SBS-compliant page object path
   */
  generatePageObjectPath(module, feature, patterns) {
    const featureName = this.sanitizeFileName(feature);
    const pageFileName = this.generatePageFileName(featureName, patterns);
    return `pages/${module}/${pageFileName}`;
  }

  /**
   * Generate SBS-compliant test data path
   */
  generateTestDataPath(module, feature, patterns) {
    const featureName = this.sanitizeFileName(feature);
    const dataFileName = this.generateDataFileName(featureName, patterns);
    return `data/iat/${module}/${dataFileName}`;
  }

  /**
   * Validate naming conventions against SBS patterns
   */
  async validateNamingConventions(generatedFiles) {
    const patterns = await this.sbsAnalyzer.getPatterns();
    const validations = {};

    for (const [type, filePath] of Object.entries(generatedFiles)) {
      const fileName = path.basename(filePath);
      const validation = this.validateFileName(fileName, type, patterns);
      
      validations[type] = {
        fileName,
        isValid: validation.isValid,
        suggestions: validation.suggestions,
        pattern: validation.expectedPattern
      };
    }

    return {
      validations,
      allValid: Object.values(validations).every(v => v.isValid)
    };
  }

  /**
   * Find matching SBS pattern for given requirements
   */
  async findMatchingPattern(requirement, type) {
    const patterns = await this.sbsAnalyzer.getPatterns();
    
    switch (type) {
      case 'feature':
        return this.findFeaturePattern(requirement, patterns);
      case 'steps':
        return this.findStepsPattern(requirement, patterns);
      case 'pageObject':
        return this.findPageObjectPattern(requirement, patterns);
      case 'testData':
        return this.findTestDataPattern(requirement, patterns);
      default:
        throw new Error(`Unknown pattern type: ${type}`);
    }
  }

  /**
   * Generate SBS-compliant file content structure
   */
  async generateSBSCompliantStructure(type, content) {
    const patterns = await this.sbsAnalyzer.getPatterns();
    
    switch (type) {
      case 'feature':
        return this.generateFeatureStructure(content, patterns);
      case 'steps':
        return this.generateStepsStructure(content, patterns);
      case 'pageObject':
        return this.generatePageObjectStructure(content, patterns);
      case 'testData':
        return this.generateTestDataStructure(content, patterns);
      default:
        throw new Error(`Unknown structure type: ${type}`);
    }
  }

  // Helper methods

  /**
   * Sanitize file name to follow SBS conventions
   */
  sanitizeFileName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
      .replace(/\s+/g, '-')         // Replace spaces with hyphens
      .replace(/-+/g, '-')          // Remove multiple hyphens
      .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
  }

  /**
   * Find common submodule for a given module
   */
  findCommonSubmodule(module, suggestedSubmodule, patterns) {
    const moduleFeatures = patterns.directoryStructure.features[module];
    if (!moduleFeatures) return suggestedSubmodule;

    // Find most used submodule in this module
    const submoduleCounts = {};
    Object.keys(moduleFeatures).forEach(submodule => {
      submoduleCounts[submodule] = moduleFeatures[submodule].length;
    });

    const mostCommon = Object.keys(submoduleCounts)
      .sort((a, b) => submoduleCounts[b] - submoduleCounts[a])[0];

    return mostCommon || suggestedSubmodule || 'common';
  }

  /**
   * Get default submodule for a module
   */
  getDefaultSubmodule(module, patterns) {
    const moduleFeatures = patterns.directoryStructure.features[module];
    if (!moduleFeatures) return 'common';

    // Return most used submodule
    const submodules = Object.keys(moduleFeatures);
    return submodules.length > 0 ? submodules[0] : 'common';
  }

  /**
   * Generate steps file name following SBS conventions
   */
  generateStepsFileName(featureName, patterns) {
    // Analyze existing steps file naming patterns
    const stepsFiles = patterns.namingConventions.stepFiles;
    
    // Check if they follow [feature]-steps.js pattern
    const hasStepsPattern = stepsFiles.some(file => file.endsWith('-steps'));
    
    if (hasStepsPattern) {
      return `${featureName}-steps.js`;
    }
    
    // Fallback to most common pattern
    return `${featureName}-steps.js`;
  }

  /**
   * Generate page file name following SBS conventions
   */
  generatePageFileName(featureName, patterns) {
    // Analyze existing page file naming patterns
    const pageFiles = patterns.namingConventions.pageFiles;
    
    // Check if they follow [feature]-page.js pattern
    const hasPagePattern = pageFiles.some(file => file.endsWith('-page'));
    
    if (hasPagePattern) {
      return `${featureName}-page.js`;
    }
    
    // Fallback to most common pattern
    return `${featureName}-page.js`;
  }

  /**
   * Generate data file name following SBS conventions
   */
  generateDataFileName(featureName, patterns) {
    // Analyze existing data file naming patterns
    const dataFiles = patterns.dataPatterns.fileNamingPatterns;
    
    // Check common patterns: [feature]_data, [feature]-data, [feature]Data
    const hasUnderscorePattern = dataFiles.some(file => file.includes('_data'));
    const hasDashPattern = dataFiles.some(file => file.includes('-data'));
    
    if (hasUnderscorePattern) {
      return `${featureName}_data.json`;
    } else if (hasDashPattern) {
      return `${featureName}-data.json`;
    }
    
    // Fallback
    return `${featureName}_data.json`;
  }

  /**
   * Validate file path against SBS patterns
   */
  async validatePath(filePath, type, patterns) {
    const pathParts = filePath.split('/');
    const fileName = path.basename(filePath);
    
    switch (type) {
      case 'feature':
        return this.validateFeaturePath(pathParts, fileName, patterns);
      case 'steps':
        return this.validateStepsPath(pathParts, fileName, patterns);
      case 'pages':
        return this.validatePagesPath(pathParts, fileName, patterns);
      case 'data':
        return this.validateDataPath(pathParts, fileName, patterns);
      default:
        return { isValid: false, reason: `Unknown type: ${type}` };
    }
  }

  /**
   * Validate feature file path
   */
  validateFeaturePath(pathParts, fileName, patterns) {
    const isValid = 
      pathParts[0] === 'features' &&
      pathParts.length >= 3 &&
      patterns.directoryStructure.modules.includes(pathParts[1]) &&
      fileName.endsWith('.feature');

    return {
      isValid,
      reason: isValid ? 'Valid feature path' : 'Invalid feature path structure',
      expectedPattern: 'features/[module]/[submodule]/[feature].feature'
    };
  }

  /**
   * Validate steps file path
   */
  validateStepsPath(pathParts, fileName, patterns) {
    const isValid = 
      pathParts[0] === 'steps' &&
      pathParts.length >= 3 &&
      patterns.directoryStructure.modules.includes(pathParts[1]) &&
      fileName.endsWith('-steps.js');

    return {
      isValid,
      reason: isValid ? 'Valid steps path' : 'Invalid steps path structure',
      expectedPattern: 'steps/[module]/[feature]-steps.js'
    };
  }

  /**
   * Validate pages file path
   */
  validatePagesPath(pathParts, fileName, patterns) {
    const isValid = 
      pathParts[0] === 'pages' &&
      pathParts.length >= 3 &&
      patterns.directoryStructure.modules.includes(pathParts[1]) &&
      fileName.endsWith('-page.js');

    return {
      isValid,
      reason: isValid ? 'Valid pages path' : 'Invalid pages path structure',
      expectedPattern: 'pages/[module]/[feature]-page.js'
    };
  }

  /**
   * Validate data file path
   */
  validateDataPath(pathParts, fileName, patterns) {
    const isValid = 
      pathParts[0] === 'data' &&
      pathParts.length >= 4 &&
      patterns.dataPatterns.environments.includes(pathParts[1]) &&
      patterns.directoryStructure.modules.includes(pathParts[2]) &&
      fileName.endsWith('.json');

    return {
      isValid,
      reason: isValid ? 'Valid data path' : 'Invalid data path structure',
      expectedPattern: 'data/[environment]/[module]/[feature]_data.json'
    };
  }

  /**
   * Validate file name against SBS conventions
   */
  validateFileName(fileName, type, patterns) {
    switch (type) {
      case 'feature':
        return this.validateFeatureFileName(fileName, patterns);
      case 'steps':
        return this.validateStepsFileName(fileName, patterns);
      case 'pageObject':
        return this.validatePageFileName(fileName, patterns);
      case 'testData':
        return this.validateDataFileName(fileName, patterns);
      default:
        return { isValid: false, expectedPattern: 'Unknown type' };
    }
  }

  validateFeatureFileName(fileName, patterns) {
    const isValid = fileName.endsWith('.feature') && 
                   fileName.length > 8 && // More than just '.feature'
                   /^[a-z0-9-]+\.feature$/.test(fileName);

    return {
      isValid,
      suggestions: isValid ? [] : ['Use lowercase letters, numbers, and hyphens only'],
      expectedPattern: '[feature-name].feature'
    };
  }

  validateStepsFileName(fileName, patterns) {
    const isValid = fileName.endsWith('-steps.js') && 
                   /^[a-z0-9-]+-steps\.js$/.test(fileName);

    return {
      isValid,
      suggestions: isValid ? [] : ['Use [feature-name]-steps.js pattern'],
      expectedPattern: '[feature-name]-steps.js'
    };
  }

  validatePageFileName(fileName, patterns) {
    const isValid = fileName.endsWith('-page.js') && 
                   /^[a-z0-9-]+-page\.js$/.test(fileName);

    return {
      isValid,
      suggestions: isValid ? [] : ['Use [feature-name]-page.js pattern'],
      expectedPattern: '[feature-name]-page.js'
    };
  }

  validateDataFileName(fileName, patterns) {
    const isValid = fileName.endsWith('.json') && 
                   (fileName.includes('_data') || fileName.includes('-data')) &&
                   /^[a-z0-9-_]+\.json$/.test(fileName);

    return {
      isValid,
      suggestions: isValid ? [] : ['Use [feature-name]_data.json or [feature-name]-data.json pattern'],
      expectedPattern: '[feature-name]_data.json'
    };
  }

  // Content structure generators

  generateFeatureStructure(content, patterns) {
    // Analyze common feature file structures from patterns
    return {
      header: this.generateFeatureHeader(),
      tags: this.generateFeatureTags(patterns),
      feature: this.generateFeatureDefinition(content),
      scenarios: this.generateScenarios(content, patterns)
    };
  }

  generateStepsStructure(content, patterns) {
    return {
      imports: this.generateStepsImports(patterns),
      givenSteps: this.generateGivenSteps(content, patterns),
      whenSteps: this.generateWhenSteps(content, patterns),
      thenSteps: this.generateThenSteps(content, patterns)
    };
  }

  generatePageObjectStructure(content, patterns) {
    return {
      imports: this.generatePageObjectImports(patterns),
      class: this.generatePageObjectClass(content, patterns),
      constructor: this.generatePageObjectConstructor(patterns),
      locators: this.generatePageObjectLocators(content, patterns),
      methods: this.generatePageObjectMethods(content, patterns)
    };
  }

  generateTestDataStructure(content, patterns) {
    return {
      structure: this.generateDataStructure(content, patterns),
      environments: this.generateEnvironmentData(patterns),
      commonFields: this.generateCommonFields(patterns)
    };
  }

  // Structure component generators (simplified implementations)
  generateFeatureHeader() {
    return '# Generated with Auto-Coder MCP - SBS Compliant';
  }

  generateFeatureTags(patterns) {
    return ['@testUseMcp', '@generated'];
  }

  generateFeatureDefinition(content) {
    return `Feature: ${content.title || 'Generated Feature'}`;
  }

  generateScenarios(content, patterns) {
    return [{
      name: content.scenario || 'Generated Scenario',
      steps: content.steps || []
    }];
  }

  generateStepsImports(patterns) {
    // Use common import patterns from SBS
    return [
      "const { Given, When, Then } = require('@cucumber/cucumber');",
      "const { expect } = require('@playwright/test');"
    ];
  }

  generateGivenSteps(content, patterns) {
    return content.givenSteps || [];
  }

  generateWhenSteps(content, patterns) {
    return content.whenSteps || [];
  }

  generateThenSteps(content, patterns) {
    return content.thenSteps || [];
  }

  generatePageObjectImports(patterns) {
    return ["const { expect } = require('@playwright/test');"];
  }

  generatePageObjectClass(content, patterns) {
    const className = this.generateClassName(content.feature);
    return `class ${className}`;
  }

  generateClassName(feature) {
    return feature
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') + 'Page';
  }

  generatePageObjectConstructor(patterns) {
    return 'constructor(page) { this.page = page; }';
  }

  generatePageObjectLocators(content, patterns) {
    return content.locators || [];
  }

  generatePageObjectMethods(content, patterns) {
    return content.methods || [];
  }

  generateDataStructure(content, patterns) {
    return content.data || {};
  }

  generateEnvironmentData(patterns) {
    return patterns.dataPatterns.environments;
  }

  generateCommonFields(patterns) {
    return patterns.dataPatterns.commonFields;
  }

  // Pattern matching methods
  findFeaturePattern(requirement, patterns) {
    try {
      const featurePatterns = patterns.directoryStructure?.features || {};
      const namingPatterns = patterns.namingConventions?.featureFiles || [];
      
      return {
        success: true,
        pattern: 'feature',
        suggestions: namingPatterns.slice(0, 3),
        structure: featurePatterns
      };
    } catch (error) {
      return { success: false, error: error.message, pattern: 'feature' };
    }
  }

  findStepsPattern(requirement, patterns) {
    try {
      const stepPatterns = patterns.stepPatterns || {};
      const namingPatterns = patterns.namingConventions?.stepFiles || [];
      
      return {
        success: true,
        pattern: 'steps',
        suggestions: namingPatterns.slice(0, 3),
        commonSteps: stepPatterns.givenSteps?.slice(0, 5) || []
      };
    } catch (error) {
      return { success: false, error: error.message, pattern: 'steps' };
    }
  }

  findPageObjectPattern(requirement, patterns) {
    try {
      const pagePatterns = patterns.pageObjectPatterns || {};
      const namingPatterns = patterns.namingConventions?.pageFiles || [];
      
      return {
        success: true,
        pattern: 'pageObject',
        suggestions: namingPatterns.slice(0, 3),
        methodPatterns: pagePatterns.methodPatterns?.slice(0, 5) || []
      };
    } catch (error) {
      return { success: false, error: error.message, pattern: 'pageObject' };
    }
  }

  findTestDataPattern(requirement, patterns) {
    try {
      const dataPatterns = patterns.dataPatterns || {};
      
      return {
        success: true,
        pattern: 'testData',
        environments: Array.from(dataPatterns.environments || []),
        commonFields: Array.from(dataPatterns.commonFields || [])
      };
    } catch (error) {
      return { success: false, error: error.message, pattern: 'testData' };
    }
  }
}

module.exports = PatternMatcher;
