/**
 * SBS Pattern Extractor - Core tool for analyzing SBS_Automation framework
 * Extracts patterns, vocabulary, and templates from existing SBS artifacts
 * 
 * This tool follows the framework principle: Learn from existing wisdom
 * without hard-coding business-specific patterns
 */

const fs = require('fs-extra');
const path = require('path');
const { glob } = require('glob');

class SBSPatternExtractor {
  constructor(sbsPath) {
    this.sbsPath = sbsPath;
    this.patterns = {
      features: [],
      steps: [],
      pages: [],
      common: []
    };
    this.vocabulary = {
      roles: new Map(),
      actions: new Map(),
      entities: new Map(),
      domains: new Map()
    };
    this.statistics = {
      filesProcessed: 0,
      patternsExtracted: 0,
      vocabularyTerms: 0,
      processingTime: 0
    };
  }

  /**
   * Main extraction method - analyzes entire SBS_Automation framework
   */
  async extractAllPatterns() {
    console.log('🔍 Starting SBS_Automation Pattern Extraction...');
    const startTime = Date.now();

    try {
      // Extract patterns from different artifact types
      await this.extractFeaturePatterns();
      await this.extractStepPatterns();
      await this.extractPagePatterns();
      
      // Build vocabulary from extracted patterns
      await this.buildVocabulary();
      
      // Analyze relationships and generate mappings
      await this.analyzeRelationships();
      
      // Calculate statistics
      this.statistics.processingTime = Date.now() - startTime;
      this.statistics.patternsExtracted = 
        this.patterns.features.length + 
        this.patterns.steps.length + 
        this.patterns.pages.length;
      this.statistics.vocabularyTerms = 
        this.vocabulary.roles.size + 
        this.vocabulary.actions.size + 
        this.vocabulary.entities.size;

      console.log('✅ Pattern extraction completed successfully!');
      this.printStatistics();
      
      return {
        patterns: this.patterns,
        vocabulary: this.vocabulary,
        statistics: this.statistics
      };
    } catch (error) {
      console.error('❌ Pattern extraction failed:', error.message);
      throw error;
    }
  }

  /**
   * Extract patterns from feature files
   */
  async extractFeaturePatterns() {
    console.log('📄 Extracting feature file patterns...');
    
    const featureFiles = await this.findFiles('**/*.feature');
    console.log(`Found ${featureFiles.length} feature files`);

    for (const file of featureFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const pattern = await this.analyzeFeatureStructure(content, file);
        
        if (pattern) {
          this.patterns.features.push(pattern);
          this.statistics.filesProcessed++;
        }
      } catch (error) {
        console.warn(`⚠️ Could not process feature file ${file}: ${error.message}`);
      }
    }

    console.log(`✅ Extracted ${this.patterns.features.length} feature patterns`);
  }

  /**
   * Extract patterns from step definition files
   */
  async extractStepPatterns() {
    console.log('🔧 Extracting step definition patterns...');
    
    const stepFiles = await this.findFiles('**/*steps.js');
    console.log(`Found ${stepFiles.length} step definition files`);

    for (const file of stepFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const pattern = await this.analyzeStepStructure(content, file);
        
        if (pattern) {
          this.patterns.steps.push(pattern);
          this.statistics.filesProcessed++;
        }
      } catch (error) {
        console.warn(`⚠️ Could not process step file ${file}: ${error.message}`);
      }
    }

    console.log(`✅ Extracted ${this.patterns.steps.length} step patterns`);
  }

  /**
   * Extract patterns from page object files
   */
  async extractPagePatterns() {
    console.log('📱 Extracting page object patterns...');
    
    const pageFiles = await this.findFiles('**/*page.js');
    console.log(`Found ${pageFiles.length} page object files`);

    for (const file of pageFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const pattern = await this.analyzePageStructure(content, file);
        
        if (pattern) {
          this.patterns.pages.push(pattern);
          this.statistics.filesProcessed++;
        }
      } catch (error) {
        console.warn(`⚠️ Could not process page file ${file}: ${error.message}`);
      }
    }

    console.log(`✅ Extracted ${this.patterns.pages.length} page patterns`);
  }

  /**
   * Analyze feature file structure and extract patterns
   */
  async analyzeFeatureStructure(content, filePath) {
    const lines = content.split('\n');
    const pattern = {
      source: filePath,
      type: 'feature',
      extractedAt: new Date().toISOString(),
      structure: {},
      examples: [],
      metadata: {}
    };

    // Extract feature title pattern
    const featureMatch = content.match(/Feature:\s*(.+)/);
    if (featureMatch) {
      pattern.structure.titlePattern = this.generalizePattern(featureMatch[1]);
    }

    // Extract user story patterns
    const userStoryMatch = content.match(/As (?:a|an)\s+(.+?)\s+I want\s+(.+?)\s+So that\s+(.+)/i);
    if (userStoryMatch) {
      pattern.structure.userStory = {
        rolePattern: this.generalizePattern(userStoryMatch[1]),
        actionPattern: this.generalizePattern(userStoryMatch[2]),
        benefitPattern: this.generalizePattern(userStoryMatch[3])
      };
    }

    // Extract scenario patterns
    const scenarios = content.match(/Scenario:\s*(.+?)(?=\n|$)/g);
    if (scenarios) {
      pattern.structure.scenarioPatterns = scenarios.map(s => 
        this.generalizePattern(s.replace('Scenario:', '').trim())
      );
    }

    // Extract step patterns
    const steps = content.match(/(?:Given|When|Then|And)\s+(.+?)(?=\n|$)/g);
    if (steps) {
      pattern.structure.stepPatterns = steps.map(s => {
        const stepMatch = s.match(/(Given|When|Then|And)\s+(.+)/);
        return {
          type: stepMatch[1],
          pattern: this.generalizePattern(stepMatch[2])
        };
      });
    }

    // Extract tags
    const tags = content.match(/@[\w-]+/g);
    if (tags) {
      pattern.structure.tags = tags;
    }

    // Determine domain from file path and content
    pattern.metadata.domain = this.inferDomain(filePath, content);
    pattern.metadata.complexity = this.calculateComplexity(content);
    
    return pattern;
  }

  /**
   * Analyze step definition structure and extract patterns
   */
  async analyzeStepStructure(content, filePath) {
    const pattern = {
      source: filePath,
      type: 'step',
      extractedAt: new Date().toISOString(),
      structure: {},
      examples: [],
      metadata: {}
    };

    // Extract step definitions using regex
    const stepDefMatches = content.match(/(Given|When|Then)\s*\(\s*['"`]([^'"`]+)['"`]/g);
    if (stepDefMatches) {
      pattern.structure.stepDefinitions = stepDefMatches.map(match => {
        const parsed = match.match(/(Given|When|Then)\s*\(\s*['"`]([^'"`]+)['"`]/);
        return {
          type: parsed[1],
          pattern: this.generalizePattern(parsed[2]),
          originalText: parsed[2]
        };
      });
    }

    // Extract imported page objects
    const pageImports = content.match(/require\(['"`]([^'"`]*page[^'"`]*)['"`]\)/g);
    if (pageImports) {
      pattern.structure.pageObjectDependencies = pageImports.map(imp => 
        imp.match(/require\(['"`]([^'"`]+)['"`]\)/)[1]
      );
    }

    // Extract method calls to understand common patterns
    const methodCalls = content.match(/\.\w+\([^)]*\)/g);
    if (methodCalls) {
      pattern.structure.commonMethods = [...new Set(methodCalls)];
    }

    pattern.metadata.domain = this.inferDomain(filePath, content);
    pattern.metadata.complexity = this.calculateComplexity(content);

    return pattern;
  }

  /**
   * Analyze page object structure and extract patterns
   */
  async analyzePageStructure(content, filePath) {
    const pattern = {
      source: filePath,
      type: 'page',
      extractedAt: new Date().toISOString(),
      structure: {},
      examples: [],
      metadata: {}
    };

    // Extract class name
    const classMatch = content.match(/class\s+(\w+)/);
    if (classMatch) {
      pattern.structure.className = classMatch[1];
    }

    // Extract selector patterns
    const selectors = content.match(/(?:const|let|var)\s+\w+\s*=\s*By\.\w+\([^)]+\)/g);
    if (selectors) {
      pattern.structure.selectorPatterns = selectors.map(sel => {
        const selectorMatch = sel.match(/By\.(\w+)\(([^)]+)\)/);
        return {
          method: selectorMatch[1],
          value: selectorMatch[2]
        };
      });
    }

    // Extract method signatures
    const methods = content.match(/async\s+\w+\([^)]*\)\s*{/g);
    if (methods) {
      pattern.structure.methodPatterns = methods.map(method => 
        method.replace(/async\s+/, '').replace(/\s*{$/, '')
      );
    }

    pattern.metadata.domain = this.inferDomain(filePath, content);
    pattern.metadata.complexity = this.calculateComplexity(content);

    return pattern;
  }

  /**
   * Build vocabulary from extracted patterns
   */
  async buildVocabulary() {
    console.log('📚 Building vocabulary from patterns...');

    // Extract roles from feature patterns
    this.patterns.features.forEach(pattern => {
      if (pattern.structure.userStory) {
        const role = pattern.structure.userStory.rolePattern;
        this.incrementVocabulary('roles', role, pattern.metadata.domain);
      }
    });

    // Extract actions from step patterns
    this.patterns.steps.forEach(pattern => {
      if (pattern.structure.stepDefinitions) {
        pattern.structure.stepDefinitions.forEach(step => {
          const actions = this.extractActionsFromStep(step.pattern);
          actions.forEach(action => {
            this.incrementVocabulary('actions', action, pattern.metadata.domain);
          });
        });
      }
    });

    // Extract entities from all patterns
    [...this.patterns.features, ...this.patterns.steps, ...this.patterns.pages].forEach(pattern => {
      const entities = this.extractEntitiesFromPattern(pattern);
      entities.forEach(entity => {
        this.incrementVocabulary('entities', entity, pattern.metadata.domain);
      });
    });

    console.log(`✅ Built vocabulary: ${this.vocabulary.roles.size} roles, ${this.vocabulary.actions.size} actions, ${this.vocabulary.entities.size} entities`);
  }

  /**
   * Helper methods
   */
  async findFiles(pattern) {
    try {
      const files = await glob(pattern, { 
        cwd: this.sbsPath,
        absolute: true,
        ignore: ['**/node_modules/**', '**/coverage/**', '**/.git/**']
      });
      return files;
    } catch (error) {
      throw new Error(`Failed to find files with pattern ${pattern}: ${error.message}`);
    }
  }

  generalizePattern(text) {
    // Remove specific values and create generalized patterns
    return text
      .replace(/\d+/g, '{number}')
      .replace(/"[^"]+"/g, '{string}')
      .replace(/'[^']+'/g, '{string}')
      .replace(/\b[A-Z][a-z]+\b/g, '{properNoun}')
      .trim();
  }

  inferDomain(filePath, content) {
    const pathSegments = filePath.split('/');
    
    // Try to determine domain from path structure
    const domainIndicators = ['payroll', 'hr', 'accounting', 'purchase', 'admin', 'employee'];
    for (const indicator of domainIndicators) {
      if (pathSegments.some(segment => segment.toLowerCase().includes(indicator))) {
        return indicator;
      }
    }
    
    // Fallback to generic classification
    return 'general';
  }

  calculateComplexity(content) {
    const lines = content.split('\n').length;
    if (lines < 50) return 'simple';
    if (lines < 150) return 'medium';
    return 'complex';
  }

  incrementVocabulary(type, term, domain) {
    if (!this.vocabulary[type].has(term)) {
      this.vocabulary[type].set(term, { count: 0, domains: new Set() });
    }
    this.vocabulary[type].get(term).count++;
    this.vocabulary[type].get(term).domains.add(domain);
  }

  extractActionsFromStep(stepPattern) {
    // Extract action verbs from step patterns
    const actions = [];
    const actionWords = stepPattern.match(/\b(click|enter|navigate|verify|create|update|delete|login|logout|select|choose|confirm|cancel|save|load|process|generate|validate|check|review|submit|approve|reject)\w*\b/gi);
    if (actionWords) {
      actions.push(...actionWords.map(action => action.toLowerCase()));
    }
    return [...new Set(actions)];
  }

  extractEntitiesFromPattern(pattern) {
    // Extract business entities from patterns
    const entities = [];
    const content = JSON.stringify(pattern);
    const entityWords = content.match(/\b(employee|user|admin|client|order|report|payment|invoice|account|profile|record|data|system|page|form|button|field|menu|list|table|modal|dialog)\w*\b/gi);
    if (entityWords) {
      entities.push(...entityWords.map(entity => entity.toLowerCase()));
    }
    return [...new Set(entities)];
  }

  async analyzeRelationships() {
    console.log('🔗 Analyzing pattern relationships...');
    // TODO: Implement relationship analysis between patterns
    // This will help understand which patterns work together
  }

  printStatistics() {
    console.log('\n📊 Pattern Extraction Statistics:');
    console.log(`   Files Processed: ${this.statistics.filesProcessed}`);
    console.log(`   Patterns Extracted: ${this.statistics.patternsExtracted}`);
    console.log(`   Vocabulary Terms: ${this.statistics.vocabularyTerms}`);
    console.log(`   Processing Time: ${this.statistics.processingTime}ms`);
    console.log(`   Features: ${this.patterns.features.length}`);
    console.log(`   Steps: ${this.patterns.steps.length}`);
    console.log(`   Pages: ${this.patterns.pages.length}`);
  }

  /**
   * Save extracted patterns to knowledge base
   */
  async saveToKnowledgeBase(outputPath) {
    console.log('💾 Saving patterns to knowledge base...');
    
    try {
      // Save patterns
      await fs.ensureDir(path.join(outputPath, 'patterns'));
      await fs.writeJSON(
        path.join(outputPath, 'patterns', 'features.json'), 
        this.patterns.features, 
        { spaces: 2 }
      );
      await fs.writeJSON(
        path.join(outputPath, 'patterns', 'steps.json'), 
        this.patterns.steps, 
        { spaces: 2 }
      );
      await fs.writeJSON(
        path.join(outputPath, 'patterns', 'pages.json'), 
        this.patterns.pages, 
        { spaces: 2 }
      );

      // Save vocabulary
      await fs.ensureDir(path.join(outputPath, 'vocabulary'));
      
      // Convert Maps to objects for JSON serialization
      const vocabularyData = {
        roles: Object.fromEntries(
          Array.from(this.vocabulary.roles.entries()).map(([key, value]) => [
            key, 
            { ...value, domains: Array.from(value.domains) }
          ])
        ),
        actions: Object.fromEntries(
          Array.from(this.vocabulary.actions.entries()).map(([key, value]) => [
            key, 
            { ...value, domains: Array.from(value.domains) }
          ])
        ),
        entities: Object.fromEntries(
          Array.from(this.vocabulary.entities.entries()).map(([key, value]) => [
            key, 
            { ...value, domains: Array.from(value.domains) }
          ])
        )
      };

      await fs.writeJSON(
        path.join(outputPath, 'vocabulary', 'roles.json'), 
        vocabularyData.roles, 
        { spaces: 2 }
      );
      await fs.writeJSON(
        path.join(outputPath, 'vocabulary', 'actions.json'), 
        vocabularyData.actions, 
        { spaces: 2 }
      );
      await fs.writeJSON(
        path.join(outputPath, 'vocabulary', 'entities.json'), 
        vocabularyData.entities, 
        { spaces: 2 }
      );

      // Save extraction metadata
      await fs.writeJSON(
        path.join(outputPath, 'extraction-metadata.json'), 
        {
          extractedAt: new Date().toISOString(),
          sbsPath: this.sbsPath,
          statistics: this.statistics,
          version: '1.0.0'
        }, 
        { spaces: 2 }
      );

      console.log('✅ Knowledge base saved successfully!');
    } catch (error) {
      console.error('❌ Failed to save knowledge base:', error.message);
      throw error;
    }
  }
}

module.exports = SBSPatternExtractor;
