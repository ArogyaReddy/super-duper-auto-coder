/**
 * 🎯 MASTER FEATURES LIBRARY
 * 
 * This library contains battle-tested, reusable feature patterns extracted from
 * the main SBS_Automation framework. These features follow 100% SBS patterns.
 * 
 * ✅ USAGE: Always check this library FIRST before creating new features
 * ✅ PATTERNS: All features match main SBS_Automation exactly
 * ✅ REUSE: Eliminates duplication and ensures consistency
 */

const path = require('path');
const fs = require('fs-extra');

class MasterFeaturesLibrary {
  constructor() {
    this.masterFeatures = new Map();
    this.featureTemplates = new Map();
    this.sbsPatterns = this.loadSBSFeaturePatterns();
    
    this.initializeMasterFeatures();
    console.log('🎯 Master Features Library initialized with', this.masterFeatures.size, 'battle-tested feature patterns');
  }

  loadSBSFeaturePatterns() {
    return {
      tags: {
        team: '@Team:SBSBusinessContinuity',
        priorities: ['@Priority:High', '@Priority:Medium', '@Priority:Low'],
        types: ['@smoke', '@regression', '@integration'],
        modules: ['@runmod', '@max', '@classic'],
        functional: ['@login', '@navigation', '@reports', '@payroll', '@employees']
      },
      background: {
        standard: [
          'Given Alex is logged into RunMod with a homepage test client',
          'Then Alex verifies that the Payroll section on the Home Page is displayed'
        ],
        max: [
          'Given Alex is logged into MAX with digitalplus test credentials',
          'Then RUN Homepage is displayed'
        ],
        classic: [
          'Given Alex is logged into Classic RunMod as an Owner client',
          'Then the classic Home page is displayed'
        ]
      },
      scenarioStructure: {
        standard: ['Given', 'When', 'Then'],
        extended: ['Given', 'And', 'When', 'And', 'Then', 'And']
      }
    };
  }

  initializeMasterFeatures() {
    // 🔐 LOGIN FEATURE TEMPLATE
    this.addMasterFeature('login', 'User Authentication', {
      description: 'As a user, I want to be able to login to the system so that I can access my account',
      tags: ['@Team:SBSBusinessContinuity', '@smoke', '@login'],
      background: 'standard',
      scenarios: [
        {
          name: 'Successful login with valid credentials',
          tags: ['@smoke'],
          steps: [
            'Given Alex is on the login page',
            'When Alex enters valid username and password',
            'And Alex clicks the login button',
            'Then Alex should be redirected to the homepage',
            'And Alex should see the welcome message'
          ]
        },
        {
          name: 'Login with invalid credentials',
          tags: ['@regression'],
          steps: [
            'Given Alex is on the login page',
            'When Alex enters invalid username and password',
            'And Alex clicks the login button',
            'Then Alex should see an error message',
            'And Alex should remain on the login page'
          ]
        }
      ]
    });

    // 🏠 HOME PAGE FEATURE TEMPLATE
    this.addMasterFeature('homepage', 'Home Page Navigation', {
      description: 'As a user, I want to navigate the home page so that I can access different features',
      tags: ['@Team:SBSBusinessContinuity', '@smoke', '@navigation'],
      background: 'standard',
      scenarios: [
        {
          name: 'Verify home page sections are displayed',
          tags: ['@smoke'],
          steps: [
            'When Alex is on the home page',
            'Then Alex should see the Payroll section',
            'And Alex should see the Reports section',
            'And Alex should see the ToDos section',
            'And Alex should see the Calendar section'
          ]
        },
        {
          name: 'Navigate to payroll section',
          tags: ['@regression', '@payroll'],
          steps: [
            'When Alex clicks on the Payroll section',
            'Then Alex should be taken to the payroll page',
            'And Alex should see payroll options'
          ]
        }
      ]
    });

    // 🧭 NAVIGATION FEATURE TEMPLATE
    this.addMasterFeature('navigation', 'Left Navigation Menu', {
      description: 'As a user, I want to use the left navigation menu so that I can access different modules',
      tags: ['@Team:SBSBusinessContinuity', '@smoke', '@navigation'],
      background: 'standard',
      scenarios: [
        {
          name: 'Navigate using left menu options',
          tags: ['@smoke'],
          steps: [
            'When Alex clicks on the "Employees" Left Menu icon',
            'Then Alex should be taken to the employees page',
            'When Alex clicks on the "Reports" Left Menu icon',
            'Then Alex should be taken to the reports page'
          ]
        }
      ]
    });

    // 👥 EMPLOYEES FEATURE TEMPLATE
    this.addMasterFeature('employees', 'Employee Management', {
      description: 'As a user, I want to manage employees so that I can maintain employee records',
      tags: ['@Team:SBSBusinessContinuity', '@regression', '@employees'],
      background: 'standard',
      scenarios: [
        {
          name: 'Add new employee',
          tags: ['@regression'],
          steps: [
            'When Alex navigates to the employees section',
            'And Alex clicks on "Add Employee" button',
            'And Alex fills in the employee details',
            'And Alex clicks "Save" button',
            'Then Alex should see a success message',
            'And the new employee should appear in the employee list'
          ]
        }
      ]
    });

    // 📊 REPORTS FEATURE TEMPLATE
    this.addMasterFeature('reports', 'Reports and Analytics', {
      description: 'As a user, I want to generate and view reports so that I can analyze business data',
      tags: ['@Team:SBSBusinessContinuity', '@regression', '@reports'],
      background: 'standard',
      scenarios: [
        {
          name: 'Generate payroll report',
          tags: ['@regression', '@payroll'],
          steps: [
            'When Alex navigates to the reports section',
            'And Alex selects "Payroll Reports" from the menu',
            'And Alex selects the date range',
            'And Alex clicks "Generate Report" button',
            'Then Alex should see the payroll report',
            'And the report should contain payroll data'
          ]
        }
      ]
    });

    // 🔍 SEARCH FEATURE TEMPLATE
    this.addMasterFeature('search', 'Search Functionality', {
      description: 'As a user, I want to search for information so that I can quickly find what I need',
      tags: ['@Team:SBSBusinessContinuity', '@smoke', '@search'],
      background: 'standard',
      scenarios: [
        {
          name: 'Search for menu options',
          tags: ['@smoke'],
          steps: [
            'When Alex searches for "Payroll" at home page',
            'Then Alex should be able to see "Payroll" from search results in homepage',
            'When Alex selects "Payroll" from the search results in homepage',
            'Then Alex should be taken to the payroll section'
          ]
        }
      ]
    });

    // 🛡️ SECURITY FEATURE TEMPLATE
    this.addMasterFeature('security', 'Security Verification', {
      description: 'As a user, I want secure access verification so that my account remains protected',
      tags: ['@Team:SBSBusinessContinuity', '@smoke', '@security'],
      background: 'standard',
      scenarios: [
        {
          name: 'Complete security verification',
          tags: ['@smoke'],
          steps: [
            'When Alex performs a sensitive operation',
            'Then verify and complete security verification if displayed',
            'And Alex should be able to continue with the operation'
          ]
        }
      ]
    });

    console.log(`✅ Initialized ${this.masterFeatures.size} master feature templates`);
  }

  addMasterFeature(category, title, metadata) {
    const featureKey = `${category}:${title}`;
    
    this.masterFeatures.set(featureKey, {
      category,
      title,
      ...metadata,
      source: 'SBS_Automation',
      tested: true,
      reusable: true
    });
  }

  /**
   * Find feature templates by category
   */
  findFeaturesByCategory(category) {
    const results = [];
    for (const [featureKey, featureData] of this.masterFeatures.entries()) {
      if (featureData.category === category) {
        results.push({
          featureKey,
          ...featureData
        });
      }
    }
    return results;
  }

  /**
   * Find similar features using keywords
   */
  findSimilarFeatures(keywords, threshold = 0.6) {
    const matches = [];
    const normalizedKeywords = keywords.map(k => k.toLowerCase());

    for (const [featureKey, featureData] of this.masterFeatures.entries()) {
      const featureText = `${featureData.title} ${featureData.description}`.toLowerCase();
      const matchCount = normalizedKeywords.filter(keyword => 
        featureText.includes(keyword)
      ).length;

      if (matchCount > 0) {
        const relevanceScore = matchCount / normalizedKeywords.length;
        if (relevanceScore >= threshold) {
          matches.push({
            ...featureData,
            featureKey,
            relevanceScore
          });
        }
      }
    }

    return matches.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Generate feature file content using master template
   */
  generateFeatureFile(featureData, customization = {}) {
    const {
      title,
      description,
      tags = [],
      background,
      scenarios = []
    } = { ...featureData, ...customization };

    let content = '';

    // Add tags
    const featureTags = tags.length > 0 ? tags : ['@Team:SBSBusinessContinuity', '@smoke'];
    content += featureTags.join(' ') + '\n';

    // Add feature title and description
    content += `Feature: ${title}\n\n`;
    content += `  ${description}\n\n`;

    // Add background if specified
    if (background && this.sbsPatterns.background[background]) {
      content += '  Background:\n';
      this.sbsPatterns.background[background].forEach(step => {
        content += `    ${step}\n`;
      });
      content += '\n';
    }

    // Add scenarios
    scenarios.forEach(scenario => {
      const scenarioTags = scenario.tags ? scenario.tags.join(' ') + '\n  ' : '';
      content += `  ${scenarioTags}Scenario: ${scenario.name}\n`;
      
      scenario.steps.forEach(step => {
        content += `    ${step}\n`;
      });
      content += '\n';
    });

    return content;
  }

  /**
   * 📋 GENERATE FEATURE CONTENT FROM TEMPLATE
   * Creates feature file content using SBS patterns
   */
  generateFeatureContent(featureTemplate) {
    let content = '';
    
    // Add tags
    if (featureTemplate.tags && featureTemplate.tags.length > 0) {
      content += featureTemplate.tags.join(' ') + '\n';
    }
    
    // Add feature title and description
    content += `Feature: ${featureTemplate.title}\n\n`;
    if (featureTemplate.description) {
      content += `  ${featureTemplate.description}\n\n`;
    }
    
    // Add mandatory background
    const mandatoryBackground = this.getMandatoryBackground();
    content += mandatoryBackground.pattern + '\n\n';
    
    // Add scenarios
    if (featureTemplate.scenarios && featureTemplate.scenarios.length > 0) {
      featureTemplate.scenarios.forEach(scenario => {
        content += `  Scenario: ${scenario.name}\n`;
        if (scenario.steps) {
          scenario.steps.forEach(step => {
            content += `    ${step}\n`;
          });
        }
        content += '\n';
      });
    }
    
    return content;
  }

  /**
   * Suggest feature structure based on requirements
   */
  suggestFeatureStructure(requirement) {
    const keywords = this.extractKeywords(requirement);
    const suggestions = this.findSimilarFeatures(keywords);
    
    if (suggestions.length > 0) {
      const bestMatch = suggestions[0];
      return {
        suggested: true,
        template: bestMatch,
        customizations: this.generateCustomizations(requirement, bestMatch),
        alternatives: suggestions.slice(1, 3)
      };
    }

    return {
      suggested: false,
      template: this.getGenericTemplate(),
      customizations: {},
      alternatives: []
    };
  }

  /**
   * Get generic feature template
   */
  getGenericTemplate() {
    return {
      category: 'general',
      title: 'Feature Template',
      description: 'As a user, I want to perform an action so that I can achieve a goal',
      tags: ['@Team:SBSBusinessContinuity', '@smoke'],
      background: 'standard',
      scenarios: [
        {
          name: 'Basic scenario',
          tags: ['@smoke'],
          steps: [
            'Given I am on the application page',
            'When I perform the required action',
            'Then I should see the expected result'
          ]
        }
      ]
    };
  }

  /**
   * Generate customizations for a feature template
   */
  generateCustomizations(requirement, template) {
    const keywords = this.extractKeywords(requirement);
    const customizations = {};

    // Customize title
    if (keywords.length > 0) {
      customizations.title = `${keywords[0].toUpperCase()}${keywords[0].slice(1)} Management`;
    }

    // Customize description
    customizations.description = `As a user, I want to manage ${keywords.join(' and ')} so that I can achieve my business goals`;

    // Suggest additional tags
    const functionalTags = this.sbsPatterns.tags.functional.filter(tag => 
      keywords.some(keyword => tag.includes(keyword.toLowerCase()))
    );
    customizations.additionalTags = functionalTags;

    return customizations;
  }

  /**
   * Get all categories
   */
  getCategories() {
    const categories = new Set();
    for (const [featureKey, featureData] of this.masterFeatures.entries()) {
      categories.add(featureData.category);
    }
    return Array.from(categories);
  }

  /**
   * Get master feature statistics
   */
  getStatistics() {
    const stats = {
      totalFeatures: this.masterFeatures.size,
      categories: {},
      totalScenarios: 0
    };

    for (const [featureKey, featureData] of this.masterFeatures.entries()) {
      // Count by category
      if (!stats.categories[featureData.category]) {
        stats.categories[featureData.category] = 0;
      }
      stats.categories[featureData.category]++;

      // Count scenarios
      if (featureData.scenarios) {
        stats.totalScenarios += featureData.scenarios.length;
      }
    }

    return stats;
  }

  /**
   * 📋 GET MANDATORY SBS BACKGROUND STEPS
   * These are REQUIRED for ALL feature files - extracted from main SBS_Automation
   * Source: /Users/gadea/auto/auto/qa_automation/SBS_Automation/features/runMod/home/homepage-checks.feature
   */
  getMandatoryBackground() {
    return {
      keywords: ['background', 'login', 'authentication', 'payroll', 'home'],
      pattern: `  Background:
    Given Alex is logged into RunMod with a homepage test client
    Then Alex verifies that the Payroll section on the Home Page is displayed`,
      explanation: 'Mandatory SBS background - login + payroll verification from main SBS_Automation',
      source: '/Users/gadea/auto/auto/qa_automation/SBS_Automation/features/runMod/home/homepage-checks.feature',
      priority: 100 // Highest priority - always use this
    };
  }

  /**
   * 🚫 VALIDATE BACKGROUND COMPLIANCE
   * Ensures generated features use only approved SBS background steps
   */
  validateBackgroundCompliance(featureContent) {
    const mandatoryBackground = this.getMandatoryBackground();
    const hasCorrectBackground = featureContent.includes('Given Alex is logged into RunMod with a homepage test client') &&
                                 featureContent.includes('Then Alex verifies that the Payroll section on the Home Page is displayed');
    
    if (!hasCorrectBackground) {
      throw new Error(`❌ BACKGROUND COMPLIANCE ERROR: Feature must use mandatory SBS background steps:\n${mandatoryBackground.pattern}`);
    }
    
    return true;
  }

  // Helper methods
  extractKeywords(text) {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['that', 'with', 'from', 'this', 'they', 'have', 'will', 'been'].includes(word))
      .slice(0, 5); // Take top 5 keywords
  }
}

module.exports = MasterFeaturesLibrary;
