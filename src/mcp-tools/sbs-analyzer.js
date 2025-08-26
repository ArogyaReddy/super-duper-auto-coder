const fs = require('fs/promises');
const path = require('path');
const { glob } = require('glob');

/**
 * SBS Analyzer - Analyzes SBS_Automation framework patterns
 * Extracts patterns, naming conventions, and structure from existing SBS code
 */
class SBSAnalyzer {
  constructor() {
    this.sbsBasePath = '/Users/gadea/auto/auto/qa_automation/SBS_Automation';
    this.patterns = {
      directoryStructure: {},
      namingConventions: {},
      codePatterns: {},
      stepPatterns: {},
      pageObjectPatterns: {},
      dataPatterns: {}
    };
  }

  /**
   * Analyze all SBS_Automation patterns
   */
  async analyzeSBSPatterns(targetPath = null) {
    const basePath = targetPath || this.sbsBasePath;
    
    console.log(`🔍 Analyzing SBS patterns from: ${basePath}`);
    
    try {
      // Analyze directory structure
      this.patterns.directoryStructure = await this.analyzeDirectoryStructure(basePath);
      
      // Analyze naming conventions
      this.patterns.namingConventions = await this.analyzeNamingConventions(basePath);
      
      // Analyze code patterns
      this.patterns.codePatterns = await this.analyzeCodePatterns(basePath);
      
      // Analyze step patterns
      this.patterns.stepPatterns = await this.analyzeStepPatterns(basePath);
      
      // Analyze page object patterns
      this.patterns.pageObjectPatterns = await this.analyzePageObjectPatterns(basePath);
      
      // Analyze data patterns
      this.patterns.dataPatterns = await this.analyzeDataPatterns(basePath);
      
      return this.patterns;
    } catch (error) {
      console.error('❌ Error analyzing SBS patterns:', error);
      throw error;
    }
  }

  /**
   * Analyze SBS directory structure patterns
   */
  async analyzeDirectoryStructure(basePath) {
    const structure = {
      features: {},
      steps: {},
      pages: {},
      data: {},
      modules: new Set(),
      submodules: new Set()
    };

    try {
      // Analyze features directory
      const featureFiles = Array.from(await glob(`${basePath}/features/**/*.feature`) || []);
      for (const file of featureFiles) {
        const relativePath = path.relative(`${basePath}/features`, file);
        const pathParts = relativePath.split(path.sep);
        
        if (pathParts.length >= 2) {
          const module = pathParts[0];
          const submodule = pathParts[1];
          structure.modules.add(module);
          structure.submodules.add(`${module}/${submodule}`);
          
          if (!structure.features[module]) structure.features[module] = {};
          if (!structure.features[module][submodule]) structure.features[module][submodule] = [];
          structure.features[module][submodule].push(path.basename(file));
        }
      }

      // Analyze steps directory
      const stepFiles = Array.from(await glob(`${basePath}/steps/**/*.js`) || []);
      for (const file of stepFiles) {
        const relativePath = path.relative(`${basePath}/steps`, file);
        const pathParts = relativePath.split(path.sep);
        
        if (pathParts.length >= 2) {
          const module = pathParts[0];
          structure.modules.add(module);
          
          if (!structure.steps[module]) structure.steps[module] = [];
          structure.steps[module].push(path.basename(file));
        }
      }

      // Analyze pages directory
      const pageFiles = Array.from(await glob(`${basePath}/pages/**/*.js`) || []);
      for (const file of pageFiles) {
        const relativePath = path.relative(`${basePath}/pages`, file);
        const pathParts = relativePath.split(path.sep);
        
        if (pathParts.length >= 2) {
          const module = pathParts[0];
          structure.modules.add(module);
          
          if (!structure.pages[module]) structure.pages[module] = [];
          structure.pages[module].push(path.basename(file));
        }
      }

      // Convert Sets to Arrays for JSON serialization
      structure.modules = Array.from(structure.modules);
      structure.submodules = Array.from(structure.submodules);

      return structure;
    } catch (error) {
      console.error('❌ Error analyzing directory structure:', error);
      return structure;
    }
  }

  /**
   * Analyze SBS naming conventions
   */
  async analyzeNamingConventions(basePath) {
    const conventions = {
      featureFiles: [],
      stepFiles: [],
      pageFiles: [],
      classNames: [],
      methodNames: [],
      variableNames: []
    };

    try {
      // Analyze feature file naming
      const featureFiles = Array.from(await glob(`${basePath}/features/**/*.feature`) || []);
      conventions.featureFiles = featureFiles.map(file => path.basename(file, '.feature'));

      // Analyze step file naming
      const stepFiles = Array.from(await glob(`${basePath}/steps/**/*.js`) || []);
      conventions.stepFiles = stepFiles.map(file => path.basename(file, '.js'));

      // Analyze page file naming
      const pageFiles = Array.from(await glob(`${basePath}/pages/**/*.js`) || []);
      conventions.pageFiles = pageFiles.map(file => path.basename(file, '.js'));

      // Analyze class and method names from page files
      const pageFilesToAnalyze = pageFiles.slice(0, 10); // Sample first 10 files
      for (const file of pageFilesToAnalyze) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          
          // Extract class names
          const classMatches = content.match(/class\s+(\w+)/g);
          if (classMatches) {
            conventions.classNames.push(...classMatches.map(match => match.replace('class ', '')));
          }

          // Extract method names
          const methodMatches = content.match(/async\s+(\w+)\s*\(/g);
          if (methodMatches) {
            conventions.methodNames.push(...methodMatches.map(match => 
              match.replace('async ', '').replace('(', '').trim()));
          }
        } catch (error) {
          // Skip files that can't be read
          continue;
        }
      }

      return conventions;
    } catch (error) {
      console.error('❌ Error analyzing naming conventions:', error);
      return conventions;
    }
  }

  /**
   * Analyze SBS code patterns
   */
  async analyzeCodePatterns(basePath) {
    const patterns = {
      imports: new Set(),
      exports: new Set(),
      pageObjectStructure: {},
      stepDefinitionStructure: {},
      commonMethods: new Set()
    };

    try {
      // Analyze page object patterns
      const pageFiles = Array.from(await glob(`${basePath}/pages/**/*.js`) || []);
      const pageFilesToAnalyze = pageFiles.slice(0, 5); // Sample first 5 files
      for (const file of pageFilesToAnalyze) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          
          // Extract import patterns
          const importMatches = content.match(/import\s+.*from\s+['"][^'"]+['"]/g);
          if (importMatches) {
            importMatches.forEach(imp => patterns.imports.add(imp));
          }

          // Extract export patterns
          const exportMatches = content.match(/export\s+.*|module\.exports\s*=/g);
          if (exportMatches) {
            exportMatches.forEach(exp => patterns.exports.add(exp));
          }

          // Extract common method patterns
          const methodMatches = content.match(/async\s+\w+\s*\([^)]*\)\s*{/g);
          if (methodMatches) {
            methodMatches.forEach(method => patterns.commonMethods.add(method));
          }
        } catch (error) {
          continue;
        }
      }

      // Convert Sets to Arrays
      patterns.imports = Array.from(patterns.imports);
      patterns.exports = Array.from(patterns.exports);
      patterns.commonMethods = Array.from(patterns.commonMethods);

      return patterns;
    } catch (error) {
      console.error('❌ Error analyzing code patterns:', error);
      return patterns;
    }
  }

  /**
   * Analyze SBS step definition patterns
   */
  async analyzeStepPatterns(basePath) {
    const patterns = {
      givenSteps: [],
      whenSteps: [],
      thenSteps: [],
      stepStructures: [],
      commonStepWords: new Set()
    };

    try {
      const stepFiles = Array.from(await glob(`${basePath}/steps/**/*.js`) || []);
      
      for (const file of stepFiles.slice(0, 10)) { // Sample first 10 files
        try {
          const content = await fs.readFile(file, 'utf-8');
          
          // Extract Given steps
          const givenMatches = content.match(/Given\(['"`]([^'"`]+)['"`]/g);
          if (givenMatches) {
            patterns.givenSteps.push(...givenMatches.map(match => 
              match.replace(/Given\(['"`]/, '').replace(/['"`]$/, '')));
          }

          // Extract When steps
          const whenMatches = content.match(/When\(['"`]([^'"`]+)['"`]/g);
          if (whenMatches) {
            patterns.whenSteps.push(...whenMatches.map(match => 
              match.replace(/When\(['"`]/, '').replace(/['"`]$/, '')));
          }

          // Extract Then steps
          const thenMatches = content.match(/Then\(['"`]([^'"`]+)['"`]/g);
          if (thenMatches) {
            patterns.thenSteps.push(...thenMatches.map(match => 
              match.replace(/Then\(['"`]/, '').replace(/['"`]$/, '')));
          }

          // Extract common words from steps
          const allSteps = [...patterns.givenSteps, ...patterns.whenSteps, ...patterns.thenSteps];
          allSteps.forEach(step => {
            const words = step.toLowerCase().split(/\s+/);
            words.forEach(word => {
              if (word.length > 3 && !['given', 'when', 'then', 'and', 'but'].includes(word)) {
                patterns.commonStepWords.add(word);
              }
            });
          });
        } catch (error) {
          continue;
        }
      }

      patterns.commonStepWords = Array.from(patterns.commonStepWords);
      return patterns;
    } catch (error) {
      console.error('❌ Error analyzing step patterns:', error);
      return patterns;
    }
  }

  /**
   * Analyze SBS page object patterns
   */
  async analyzePageObjectPatterns(basePath) {
    const patterns = {
      constructorPatterns: [],
      locatorPatterns: [],
      methodPatterns: [],
      navigationMethods: [],
      interactionMethods: [],
      assertionMethods: []
    };

    try {
      const pageFiles = Array.from(await glob(`${basePath}/pages/**/*.js`) || []);
      
      for (const file of pageFiles.slice(0, 5)) { // Sample first 5 files
        try {
          const content = await fs.readFile(file, 'utf-8');
          
          // Extract constructor patterns
          const constructorMatch = content.match(/constructor\s*\([^)]*\)\s*{[^}]*}/);
          if (constructorMatch) {
            patterns.constructorPatterns.push(constructorMatch[0]);
          }

          // Extract locator patterns
          const locatorMatches = content.match(/this\.\w+\s*=\s*['"`][^'"`]+['"`]/g);
          if (locatorMatches) {
            patterns.locatorPatterns.push(...locatorMatches);
          }

          // Extract method patterns
          const methodMatches = content.match(/async\s+\w+\s*\([^)]*\)\s*{/g);
          if (methodMatches) {
            patterns.methodPatterns.push(...methodMatches);
          }

          // Categorize methods
          const navigationMatches = content.match(/async\s+navigate\w*\s*\([^)]*\)/g);
          if (navigationMatches) {
            patterns.navigationMethods.push(...navigationMatches);
          }

          const interactionMatches = content.match(/async\s+(click|fill|select|type)\w*\s*\([^)]*\)/g);
          if (interactionMatches) {
            patterns.interactionMethods.push(...interactionMatches);
          }

          const assertionMatches = content.match(/async\s+(verify|assert|check|validate)\w*\s*\([^)]*\)/g);
          if (assertionMatches) {
            patterns.assertionMethods.push(...assertionMatches);
          }
        } catch (error) {
          continue;
        }
      }

      return patterns;
    } catch (error) {
      console.error('❌ Error analyzing page object patterns:', error);
      return patterns;
    }
  }

  /**
   * Analyze SBS test data patterns
   */
  async analyzeDataPatterns(basePath) {
    const patterns = {
      environments: new Set(),
      dataStructures: [],
      commonFields: new Set(),
      fileNamingPatterns: []
    };

    try {
      const dataFiles = Array.from(await glob(`${basePath}/data/**/*.json`) || []);
      
      for (const file of dataFiles) {
        const relativePath = path.relative(`${basePath}/data`, file);
        const pathParts = relativePath.split(path.sep);
        
        // Extract environment
        if (pathParts.length > 0) {
          patterns.environments.add(pathParts[0]);
        }

        // Extract file naming pattern
        patterns.fileNamingPatterns.push(path.basename(file, '.json'));

        // Analyze data structure (sample first few files)
        if (patterns.dataStructures.length < 5) {
          try {
            const content = await fs.readFile(file, 'utf-8');
            const data = JSON.parse(content);
            patterns.dataStructures.push({
              file: path.basename(file),
              structure: this.extractObjectStructure(data)
            });

            // Extract common fields
            this.extractFieldNames(data).forEach(field => patterns.commonFields.add(field));
          } catch (error) {
            continue;
          }
        }
      }

      patterns.environments = Array.from(patterns.environments);
      patterns.commonFields = Array.from(patterns.commonFields);

      return patterns;
    } catch (error) {
      console.error('❌ Error analyzing data patterns:', error);
      return patterns;
    }
  }

  /**
   * Extract object structure recursively
   */
  extractObjectStructure(obj, depth = 0) {
    if (depth > 3) return 'deep_object'; // Limit recursion
    
    if (Array.isArray(obj)) {
      return obj.length > 0 ? [this.extractObjectStructure(obj[0], depth + 1)] : [];
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const structure = {};
      for (const [key, value] of Object.entries(obj)) {
        structure[key] = this.extractObjectStructure(value, depth + 1);
      }
      return structure;
    }
    
    return typeof obj;
  }

  /**
   * Extract field names recursively
   */
  extractFieldNames(obj, fields = new Set()) {
    if (Array.isArray(obj)) {
      obj.forEach(item => this.extractFieldNames(item, fields));
    } else if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        fields.add(key);
        this.extractFieldNames(obj[key], fields);
      });
    }
    
    return Array.from(fields);
  }

  /**
   * Get cached patterns or refresh if needed
   */
  async getPatterns(refresh = false) {
    if (refresh || Object.keys(this.patterns.directoryStructure).length === 0) {
      await this.analyzeSBSPatterns();
    }
    return this.patterns;
  }

  /**
   * Get specific pattern type
   */
  async getPatternType(type) {
    const patterns = await this.getPatterns();
    return patterns[type] || {};
  }

  /**
   * Check if a path follows SBS conventions
   */
  async validateSBSPath(testPath, type) {
    const patterns = await this.getPatterns();
    
    switch (type) {
      case 'feature':
        return this.validateFeaturePath(testPath, patterns.directoryStructure);
      case 'steps':
        return this.validateStepsPath(testPath, patterns.directoryStructure);
      case 'pages':
        return this.validatePagesPath(testPath, patterns.directoryStructure);
      default:
        return false;
    }
  }

  validateFeaturePath(testPath, structure) {
    // Check if path follows features/[module]/[submodule]/[feature].feature pattern
    const pathParts = testPath.split('/');
    return pathParts.length >= 3 && 
           pathParts[0] === 'features' &&
           structure.modules.includes(pathParts[1]);
  }

  validateStepsPath(testPath, structure) {
    // Check if path follows steps/[module]/[feature]-steps.js pattern
    const pathParts = testPath.split('/');
    return pathParts.length >= 3 && 
           pathParts[0] === 'steps' &&
           structure.modules.includes(pathParts[1]) &&
           pathParts[2].endsWith('-steps.js');
  }

  validatePagesPath(testPath, structure) {
    // Check if path follows pages/[module]/[feature]-page.js pattern
    const pathParts = testPath.split('/');
    return pathParts.length >= 3 && 
           pathParts[0] === 'pages' &&
           structure.modules.includes(pathParts[1]) &&
           pathParts[2].endsWith('-page.js');
  }
}

module.exports = SBSAnalyzer;
