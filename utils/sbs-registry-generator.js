#!/usr/bin/env node

/**
 * SBS_Automation Registry Generator
 * Scans the main SBS_Automation framework and creates comprehensive JSON registries
 * for features, steps, pages, actions, and locators to prevent ambiguous steps
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SBSRegistryGenerator {
  constructor() {
    this.sbsPath = path.join(__dirname, '../../../SBS_Automation');
    this.outputDir = path.join(__dirname, '../knowledge-base/registries');
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * 1. SCAN ALL STEP DEFINITIONS FROM SBS_AUTOMATION
   */
  scanStepDefinitions() {
    console.log('🔍 Scanning SBS_Automation step definitions...');
    
    const stepFiles = this.findFiles(`${this.sbsPath}/steps`, '**/*-steps.js');
    const stepRegistry = {
      metadata: {
        generated_date: new Date().toISOString().split('T')[0],
        purpose: "Complete registry of all SBS_Automation step definitions",
        total_files: stepFiles.length,
        version: "1.0"
      },
      step_definitions: {},
      ambiguous_patterns: [],
      safe_patterns: []
    };

    const stepPatterns = new Map();

    stepFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const steps = this.extractStepsFromFile(content, filePath);
        
        const relativePath = path.relative(this.sbsPath, filePath);
        stepRegistry.step_definitions[relativePath] = steps;

        // Track patterns for ambiguity detection
        steps.forEach(step => {
          const pattern = this.extractStepPattern(step.definition);
          if (stepPatterns.has(pattern)) {
            stepPatterns.get(pattern).push({ file: relativePath, step: step.definition });
          } else {
            stepPatterns.set(pattern, [{ file: relativePath, step: step.definition }]);
          }
        });

      } catch (error) {
        console.warn(`⚠️ Error processing ${filePath}: ${error.message}`);
      }
    });

    // Identify ambiguous patterns
    stepPatterns.forEach((occurrences, pattern) => {
      if (occurrences.length > 1) {
        stepRegistry.ambiguous_patterns.push({
          pattern,
          occurrences: occurrences.length,
          files: occurrences.map(o => o.file),
          warning: "This pattern creates ambiguous steps - avoid in auto-coder"
        });
      } else {
        stepRegistry.safe_patterns.push({
          pattern,
          file: occurrences[0].file,
          safe_to_reuse: true
        });
      }
    });

    return stepRegistry;
  }

  /**
   * 2. SCAN ALL PAGE OBJECTS FROM SBS_AUTOMATION
   */
  scanPageObjects() {
    console.log('🔍 Scanning SBS_Automation page objects...');
    
    const pageFiles = this.findFiles(`${this.sbsPath}/pages`, '**/*-page.js');
    const pageRegistry = {
      metadata: {
        generated_date: new Date().toISOString().split('T')[0],
        purpose: "Complete registry of all SBS_Automation page objects",
        total_files: pageFiles.length,
        version: "1.0"
      },
      page_objects: {},
      common_methods: [],
      locator_patterns: []
    };

    const allMethods = new Set();
    const allLocators = new Set();

    pageFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const pageInfo = this.extractPageInfo(content, filePath);
        
        const relativePath = path.relative(this.sbsPath, filePath);
        pageRegistry.page_objects[relativePath] = pageInfo;

        // Collect all methods and locators
        pageInfo.methods.forEach(method => allMethods.add(method));
        pageInfo.locators.forEach(locator => allLocators.add(locator));

      } catch (error) {
        console.warn(`⚠️ Error processing ${filePath}: ${error.message}`);
      }
    });

    // Find common methods (appears in multiple pages)
    const methodCounts = new Map();
    pageFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      const methods = this.extractMethods(content);
      methods.forEach(method => {
        methodCounts.set(method, (methodCounts.get(method) || 0) + 1);
      });
    });

    methodCounts.forEach((count, method) => {
      if (count >= 3) { // Method appears in 3+ pages
        pageRegistry.common_methods.push({
          method,
          usage_count: count,
          reusable: true
        });
      }
    });

    pageRegistry.locator_patterns = Array.from(allLocators).slice(0, 50); // Top 50 patterns

    return pageRegistry;
  }

  /**
   * 3. SCAN FEATURE FILES FROM SBS_AUTOMATION
   */
  scanFeatureFiles() {
    console.log('🔍 Scanning SBS_Automation feature files...');
    
    const featureFiles = this.findFiles(`${this.sbsPath}/features`, '**/*.feature');
    const featureRegistry = {
      metadata: {
        generated_date: new Date().toISOString().split('T')[0],
        purpose: "Complete registry of all SBS_Automation features",
        total_files: featureFiles.length,
        version: "1.0"
      },
      features: {},
      common_scenarios: [],
      background_patterns: []
    };

    const scenarioPatterns = new Map();
    const backgroundPatterns = new Set();

    featureFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const featureInfo = this.extractFeatureInfo(content, filePath);
        
        const relativePath = path.relative(this.sbsPath, filePath);
        featureRegistry.features[relativePath] = featureInfo;

        // Track scenario patterns
        featureInfo.scenarios.forEach(scenario => {
          const pattern = this.extractScenarioPattern(scenario);
          if (scenarioPatterns.has(pattern)) {
            scenarioPatterns.get(pattern).push(relativePath);
          } else {
            scenarioPatterns.set(pattern, [relativePath]);
          }
        });

        // Track background patterns
        if (featureInfo.background) {
          backgroundPatterns.add(featureInfo.background);
        }

      } catch (error) {
        console.warn(`⚠️ Error processing ${filePath}: ${error.message}`);
      }
    });

    // Identify common scenarios
    scenarioPatterns.forEach((files, pattern) => {
      if (files.length >= 2) {
        featureRegistry.common_scenarios.push({
          pattern,
          usage_count: files.length,
          files: files.slice(0, 5), // Top 5 examples
          reusable: true
        });
      }
    });

    featureRegistry.background_patterns = Array.from(backgroundPatterns);

    return featureRegistry;
  }

  /**
   * 4. SCAN ACTIONS/INTERACTIONS FROM SBS_AUTOMATION
   */
  scanActions() {
    console.log('🔍 Scanning SBS_Automation actions...');
    
    const stepFiles = this.findFiles(`${this.sbsPath}/steps`, '**/*-steps.js');
    const actionRegistry = {
      metadata: {
        generated_date: new Date().toISOString().split('T')[0],
        purpose: "Registry of all user actions/interactions in SBS_Automation",
        version: "1.0"
      },
      navigation_actions: [],
      interaction_actions: [],
      verification_actions: [],
      data_actions: []
    };

    const actions = {
      navigation: new Set(),
      interaction: new Set(),
      verification: new Set(),
      data: new Set()
    };

    stepFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileActions = this.extractActions(content);
        
        fileActions.navigation.forEach(action => actions.navigation.add(action));
        fileActions.interaction.forEach(action => actions.interaction.add(action));
        fileActions.verification.forEach(action => actions.verification.add(action));
        fileActions.data.forEach(action => actions.data.add(action));

      } catch (error) {
        console.warn(`⚠️ Error processing ${filePath}: ${error.message}`);
      }
    });

    actionRegistry.navigation_actions = Array.from(actions.navigation);
    actionRegistry.interaction_actions = Array.from(actions.interaction);
    actionRegistry.verification_actions = Array.from(actions.verification);
    actionRegistry.data_actions = Array.from(actions.data);

    return actionRegistry;
  }

  /**
   * 5. SCAN LOCATORS/ELEMENTS FROM SBS_AUTOMATION
   */
  scanLocators() {
    console.log('🔍 Scanning SBS_Automation locators...');
    
    const pageFiles = this.findFiles(`${this.sbsPath}/pages`, '**/*-page.js');
    const locatorRegistry = {
      metadata: {
        generated_date: new Date().toISOString().split('T')[0],
        purpose: "Registry of all locators/elements in SBS_Automation",
        version: "1.0"
      },
      css_selectors: [],
      xpath_selectors: [],
      data_testid_patterns: [],
      common_element_patterns: []
    };

    const locators = {
      css: new Set(),
      xpath: new Set(),
      dataTestId: new Set(),
      patterns: new Map()
    };

    pageFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileLocators = this.extractLocators(content);
        
        fileLocators.css.forEach(loc => locators.css.add(loc));
        fileLocators.xpath.forEach(loc => locators.xpath.add(loc));
        fileLocators.dataTestId.forEach(loc => locators.dataTestId.add(loc));
        
        fileLocators.patterns.forEach((count, pattern) => {
          locators.patterns.set(pattern, (locators.patterns.get(pattern) || 0) + count);
        });

      } catch (error) {
        console.warn(`⚠️ Error processing ${filePath}: ${error.message}`);
      }
    });

    locatorRegistry.css_selectors = Array.from(locators.css).slice(0, 100);
    locatorRegistry.xpath_selectors = Array.from(locators.xpath).slice(0, 100);
    locatorRegistry.data_testid_patterns = Array.from(locators.dataTestId).slice(0, 50);
    
    // Common patterns (used multiple times)
    locatorRegistry.common_element_patterns = Array.from(locators.patterns.entries())
      .filter(([pattern, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([pattern, count]) => ({ pattern, usage_count: count }));

    return locatorRegistry;
  }

  // Helper methods for extraction
  extractStepsFromFile(content, filePath) {
    const steps = [];
    const stepRegex = /(Given|When|Then)\s*\(\s*['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = stepRegex.exec(content)) !== null) {
      steps.push({
        type: match[1],
        definition: match[2],
        full_match: match[0]
      });
    }
    
    return steps;
  }

  extractStepPattern(definition) {
    // Convert specific values to generic patterns
    return definition
      .replace(/\{string\}/g, '{string}')
      .replace(/\{int\}/g, '{int}')
      .replace(/\{float\}/g, '{float}')
      .replace(/"[^"]+"/g, '"{string}"')
      .replace(/'[^']+'/g, "'{string}'");
  }

  extractPageInfo(content, filePath) {
    const className = this.extractClassName(content);
    const methods = this.extractMethods(content);
    const locators = this.extractLocatorsFromPage(content);
    
    return {
      file: path.basename(filePath),
      class_name: className,
      methods,
      locators,
      line_count: content.split('\n').length
    };
  }

  extractClassName(content) {
    const classMatch = content.match(/class\s+(\w+)\s+extends/);
    return classMatch ? classMatch[1] : 'Unknown';
  }

  extractMethods(content) {
    const methodRegex = /async\s+(\w+)\s*\(/g;
    const methods = [];
    let match;
    
    while ((match = methodRegex.exec(content)) !== null) {
      methods.push(match[1]);
    }
    
    return [...new Set(methods)]; // Remove duplicates
  }

  extractLocatorsFromPage(content) {
    const locators = [];
    const locatorRegex = /const\s+\w+\s*=\s*By\.(css|xpath|id)\s*\(\s*['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = locatorRegex.exec(content)) !== null) {
      locators.push({
        type: match[1],
        selector: match[2]
      });
    }
    
    return locators;
  }

  extractFeatureInfo(content, filePath) {
    const lines = content.split('\n');
    const featureName = this.extractFeatureName(content);
    const scenarios = this.extractScenarios(content);
    const background = this.extractBackground(content);
    const tags = this.extractTags(content);
    
    return {
      file: path.basename(filePath),
      feature_name: featureName,
      scenarios: scenarios.map(s => s.name),
      background,
      tags,
      line_count: lines.length
    };
  }

  extractFeatureName(content) {
    const featureMatch = content.match(/Feature:\s*(.+)/);
    return featureMatch ? featureMatch[1].trim() : 'Unknown';
  }

  extractScenarios(content) {
    const scenarios = [];
    const scenarioRegex = /Scenario:\s*(.+)/g;
    let match;
    
    while ((match = scenarioRegex.exec(content)) !== null) {
      scenarios.push({ name: match[1].trim() });
    }
    
    return scenarios;
  }

  extractScenarioPattern(scenario) {
    // Extract pattern from scenario name
    return scenario.name
      .replace(/[0-9]+/g, '{number}')
      .replace(/"[^"]+"/g, '"{string}"')
      .replace(/'[^']+'/g, "'{string}'");
  }

  extractBackground(content) {
    const backgroundMatch = content.match(/Background:([\s\S]*?)(?=Scenario:|$)/);
    return backgroundMatch ? backgroundMatch[1].trim() : null;
  }

  extractTags(content) {
    const tagMatches = content.match(/@\w+/g);
    return tagMatches || [];
  }

  extractActions(content) {
    const actions = {
      navigation: new Set(),
      interaction: new Set(),
      verification: new Set(),
      data: new Set()
    };

    // Navigation actions
    const navRegex = /Alex\s+(navigates?\s+to|goes?\s+to|visits?)\s+([^'"]+)/gi;
    let match;
    while ((match = navRegex.exec(content)) !== null) {
      actions.navigation.add(match[0]);
    }

    // Interaction actions
    const interactionRegex = /Alex\s+(clicks?|selects?|enters?|types?|uploads?)\s+([^'"]+)/gi;
    while ((match = interactionRegex.exec(content)) !== null) {
      actions.interaction.add(match[0]);
    }

    // Verification actions
    const verificationRegex = /Alex\s+(verifies?|checks?|validates?|confirms?)\s+([^'"]+)/gi;
    while ((match = verificationRegex.exec(content)) !== null) {
      actions.verification.add(match[0]);
    }

    // Data actions
    const dataRegex = /Alex\s+(enters?|inputs?|fills?|submits?)\s+([^'"]+)/gi;
    while ((match = dataRegex.exec(content)) !== null) {
      actions.data.add(match[0]);
    }

    return {
      navigation: Array.from(actions.navigation),
      interaction: Array.from(actions.interaction),
      verification: Array.from(actions.verification),
      data: Array.from(actions.data)
    };
  }

  extractLocators(content) {
    const locators = {
      css: new Set(),
      xpath: new Set(),
      dataTestId: new Set(),
      patterns: new Map()
    };

    // CSS selectors
    const cssRegex = /By\.css\s*\(\s*['"]([^'"]+)['"]/g;
    let match;
    while ((match = cssRegex.exec(content)) !== null) {
      locators.css.add(match[1]);
      this.trackElementPattern(match[1], locators.patterns);
    }

    // XPath selectors
    const xpathRegex = /By\.xpath\s*\(\s*['"]([^'"]+)['"]/g;
    while ((match = xpathRegex.exec(content)) !== null) {
      locators.xpath.add(match[1]);
      this.trackElementPattern(match[1], locators.patterns);
    }

    // data-test-id patterns
    const testIdRegex = /data-test-id\s*=\s*['"]([^'"]+)['"]/g;
    while ((match = testIdRegex.exec(content)) !== null) {
      locators.dataTestId.add(match[1]);
    }

    return locators;
  }

  trackElementPattern(selector, patterns) {
    // Extract element type patterns
    const elementPatterns = [
      'button', 'input', 'select', 'textarea', 'div', 'span', 'a', 'img',
      'form', 'table', 'tr', 'td', 'ul', 'li', 'nav', 'header', 'footer'
    ];

    elementPatterns.forEach(pattern => {
      if (selector.toLowerCase().includes(pattern)) {
        patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
      }
    });
  }

  findFiles(dir, pattern) {
    try {
      const command = `find "${dir}" -name "*.js" -o -name "*.feature" 2>/dev/null || true`;
      const result = execSync(command, { encoding: 'utf8' });
      return result.trim().split('\n').filter(line => line.length > 0);
    } catch (error) {
      console.warn(`⚠️ Error finding files in ${dir}: ${error.message}`);
      return [];
    }
  }

  /**
   * GENERATE ALL REGISTRIES
   */
  generateAllRegistries() {
    console.log('🚀 Generating comprehensive SBS_Automation registries...');
    
    try {
      // 1. Step Definitions Registry
      const stepRegistry = this.scanStepDefinitions();
      fs.writeFileSync(
        path.join(this.outputDir, 'sbs-step-definitions-registry.json'),
        JSON.stringify(stepRegistry, null, 2)
      );
      console.log('✅ Step definitions registry generated');

      // 2. Page Objects Registry
      const pageRegistry = this.scanPageObjects();
      fs.writeFileSync(
        path.join(this.outputDir, 'sbs-page-objects-registry.json'),
        JSON.stringify(pageRegistry, null, 2)
      );
      console.log('✅ Page objects registry generated');

      // 3. Features Registry
      const featureRegistry = this.scanFeatureFiles();
      fs.writeFileSync(
        path.join(this.outputDir, 'sbs-features-registry.json'),
        JSON.stringify(featureRegistry, null, 2)
      );
      console.log('✅ Features registry generated');

      // 4. Actions Registry
      const actionRegistry = this.scanActions();
      fs.writeFileSync(
        path.join(this.outputDir, 'sbs-actions-registry.json'),
        JSON.stringify(actionRegistry, null, 2)
      );
      console.log('✅ Actions registry generated');

      // 5. Locators Registry
      const locatorRegistry = this.scanLocators();
      fs.writeFileSync(
        path.join(this.outputDir, 'sbs-locators-registry.json'),
        JSON.stringify(locatorRegistry, null, 2)
      );
      console.log('✅ Locators registry generated');

      // 6. Generate Master Index
      this.generateMasterIndex();

      console.log('\n🎉 ALL REGISTRIES GENERATED SUCCESSFULLY!');
      console.log(`📁 Output directory: ${this.outputDir}`);
      
      return {
        success: true,
        registries: [
          'sbs-step-definitions-registry.json',
          'sbs-page-objects-registry.json',
          'sbs-features-registry.json',
          'sbs-actions-registry.json',
          'sbs-locators-registry.json',
          'sbs-master-index.json'
        ]
      };

    } catch (error) {
      console.error('❌ Error generating registries:', error.message);
      return { success: false, error: error.message };
    }
  }

  generateMasterIndex() {
    const masterIndex = {
      metadata: {
        generated_date: new Date().toISOString().split('T')[0],
        purpose: "Master index of all SBS_Automation registries",
        version: "1.0"
      },
      registries: {
        step_definitions: "sbs-step-definitions-registry.json",
        page_objects: "sbs-page-objects-registry.json", 
        features: "sbs-features-registry.json",
        actions: "sbs-actions-registry.json",
        locators: "sbs-locators-registry.json"
      },
      usage_guide: {
        before_generation: [
          "1. Load step definitions registry to check for conflicts",
          "2. Load page objects registry to reuse existing methods",
          "3. Load features registry to follow established patterns",
          "4. Load actions registry to use consistent verbs",
          "5. Load locators registry to follow selector patterns"
        ],
        conflict_prevention: [
          "Search step definitions before creating new steps",
          "Use domain-specific prefixes to avoid ambiguity",
          "Reuse existing page object methods where possible",
          "Follow established feature file patterns"
        ]
      }
    };

    fs.writeFileSync(
      path.join(this.outputDir, 'sbs-master-index.json'),
      JSON.stringify(masterIndex, null, 2)
    );
    console.log('✅ Master index generated');
  }
}

// CLI usage
if (require.main === module) {
  const generator = new SBSRegistryGenerator();
  const result = generator.generateAllRegistries();
  process.exit(result.success ? 0 : 1);
}

module.exports = SBSRegistryGenerator;
