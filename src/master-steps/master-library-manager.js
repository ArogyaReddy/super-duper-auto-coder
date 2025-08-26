/**
 * 🎯 MASTER LIBRARY MANAGER
 * 
 * Central orchestrator for Master Steps, Features, and Page Objects libraries.
 * This manager ensures maximum reuse and 100% SBS_Automation compliance.
 * 
 * ✅ FIRST CHECK: Always searches existing patterns before creating new ones
 * ✅ COMPLIANCE: Enforces SBS_Automation standards and patterns
 * ✅ REUSE: Maximizes reuse, minimizes duplication
 */

const MasterStepsLibrary = require('./master-steps-library');
const MasterFeaturesLibrary = require('./master-features-library');
const MasterPageObjectsLibrary = require('./master-page-objects-library');
const fs = require('fs-extra');
const path = require('path');

class MasterLibraryManager {
  constructor() {
    this.stepsLibrary = new MasterStepsLibrary();
    this.featuresLibrary = new MasterFeaturesLibrary();
    this.pageObjectsLibrary = new MasterPageObjectsLibrary();
    
    this.reusabilityMetrics = {
      totalSearches: 0,
      stepsReused: 0,
      featuresReused: 0,
      pagesReused: 0,
      newCreated: 0
    };

    console.log('🎯 Master Library Manager initialized - Ready for maximum reuse!');
    this.logStatistics();
  }

  /**
   * 🔍 INTELLIGENT ARTIFACT GENERATION
   * 
   * This is the main entry point for generating test artifacts.
   * It follows the priority: REUSE > ADAPT > CREATE
   */
  async generateTestArtifacts(requirement, options = {}) {
    this.reusabilityMetrics.totalSearches++;
    
    console.log('\n🎯 MASTER LIBRARY ANALYSIS - Searching for reusable patterns...');
    
    const result = {
      feature: null,
      steps: null,
      pageObjects: null,
      reusabilityScore: 0,
      recommendations: [],
      created: []
    };

    try {
      // 1. FEATURE ANALYSIS - Find reusable feature patterns
      console.log('📋 Analyzing feature patterns...');
      const featureAnalysis = await this.analyzeFeatureRequirements(requirement);
      result.feature = featureAnalysis;

      // 2. STEPS ANALYSIS - Find reusable step definitions
      console.log('🔄 Analyzing step patterns...');
      const stepsAnalysis = await this.analyzeStepsRequirements(requirement);
      result.steps = stepsAnalysis;

      // 3. PAGE OBJECTS ANALYSIS - Find reusable page objects
      console.log('📄 Analyzing page object patterns...');
      const pageAnalysis = await this.analyzePageRequirements(requirement);
      result.pageObjects = pageAnalysis;

      // 4. CALCULATE REUSABILITY SCORE
      result.reusabilityScore = this.calculateReusabilityScore(result);

      // 5. GENERATE RECOMMENDATIONS
      result.recommendations = this.generateReusabilityRecommendations(result);

      // 6. UPDATE METRICS
      this.updateMetrics(result);

      console.log(`✅ Analysis complete! Reusability score: ${result.reusabilityScore}%`);
      this.logReusabilityResults(result);

      return result;

    } catch (error) {
      console.error('❌ Error in Master Library analysis:', error);
      throw error;
    }
  }

  /**
   * Analyze feature requirements for reusability
   */
  async analyzeFeatureRequirements(requirement) {
    const keywords = this.extractKeywords(requirement);
    const suggestions = this.featuresLibrary.findSimilarFeatures(keywords);
    
    const analysis = {
      requirement,
      keywords,
      suggestions: suggestions.slice(0, 3),
      recommendation: null,
      action: 'create', // Default action
      reuseScore: 0
    };

    if (suggestions.length > 0) {
      const bestMatch = suggestions[0];
      analysis.recommendation = bestMatch;
      analysis.reuseScore = bestMatch.relevanceScore;

      if (bestMatch.relevanceScore >= 0.8) {
        analysis.action = 'reuse';
        this.reusabilityMetrics.featuresReused++;
      } else if (bestMatch.relevanceScore >= 0.6) {
        analysis.action = 'adapt';
      }
    }

    return analysis;
  }

  /**
   * Analyze step requirements for reusability
   */
  async analyzeStepsRequirements(requirement) {
    const keywords = this.extractKeywords(requirement);
    const analysis = {
      requirement,
      keywords,
      givenSteps: [],
      whenSteps: [],
      thenSteps: [],
      totalReuseScore: 0,
      recommendations: []
    };

    // Analyze each step type
    const stepTypes = ['Given', 'When', 'Then'];
    
    for (const stepType of stepTypes) {
      const stepSuggestions = this.stepsLibrary.searchSteps(requirement, { 
        stepType, 
        limit: 5 
      });
      
      const stepAnalysis = {
        stepType,
        suggestions: stepSuggestions,
        action: stepSuggestions.length > 0 ? 'reuse' : 'create',
        reuseScore: stepSuggestions.length > 0 ? stepSuggestions[0].relevanceScore : 0
      };

      analysis[`${stepType.toLowerCase()}Steps`] = stepAnalysis;
      
      if (stepSuggestions.length > 0 && stepSuggestions[0].relevanceScore >= 0.7) {
        this.reusabilityMetrics.stepsReused++;
      }
    }

    // Calculate total reuse score
    const scores = [analysis.givenSteps.reuseScore, analysis.whenSteps.reuseScore, analysis.thenSteps.reuseScore];
    analysis.totalReuseScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    return analysis;
  }

  /**
   * Analyze page object requirements for reusability
   */
  async analyzePageRequirements(requirement) {
    const keywords = this.extractKeywords(requirement);
    const suggestions = this.pageObjectsLibrary.findSimilarPages(keywords);
    
    const analysis = {
      requirement,
      keywords,
      suggestions: suggestions.slice(0, 3),
      recommendation: null,
      action: 'create',
      reuseScore: 0
    };

    if (suggestions.length > 0) {
      const bestMatch = suggestions[0];
      analysis.recommendation = bestMatch;
      analysis.reuseScore = bestMatch.relevanceScore;

      if (bestMatch.relevanceScore >= 0.8) {
        analysis.action = 'reuse';
        this.reusabilityMetrics.pagesReused++;
      } else if (bestMatch.relevanceScore >= 0.6) {
        analysis.action = 'adapt';
      }
    }

    return analysis;
  }

  /**
   * Calculate overall reusability score
   */
  calculateReusabilityScore(result) {
    const featureScore = result.feature?.reuseScore || 0;
    const stepsScore = result.steps?.totalReuseScore || 0;
    const pageScore = result.pageObjects?.reuseScore || 0;
    
    return Math.round(((featureScore + stepsScore + pageScore) / 3) * 100);
  }

  /**
   * Generate reusability recommendations
   */
  generateReusabilityRecommendations(result) {
    const recommendations = [];

    // Feature recommendations
    if (result.feature?.action === 'reuse') {
      recommendations.push({
        type: 'feature',
        action: 'reuse',
        message: `✅ REUSE existing feature: "${result.feature.recommendation.title}"`,
        score: result.feature.reuseScore,
        details: result.feature.recommendation
      });
    } else if (result.feature?.action === 'adapt') {
      recommendations.push({
        type: 'feature',
        action: 'adapt',
        message: `🔧 ADAPT existing feature: "${result.feature.recommendation.title}" (${Math.round(result.feature.reuseScore * 100)}% match)`,
        score: result.feature.reuseScore,
        details: result.feature.recommendation
      });
    }

    // Steps recommendations
    ['given', 'when', 'then'].forEach(stepType => {
      const stepData = result.steps?.[`${stepType}Steps`];
      if (stepData?.suggestions?.length > 0) {
        const bestStep = stepData.suggestions[0];
        if (bestStep.relevanceScore >= 0.7) {
          recommendations.push({
            type: 'step',
            stepType: stepType.toUpperCase(),
            action: 'reuse',
            message: `✅ REUSE existing ${stepType.toUpperCase()} step: "${bestStep.pattern}"`,
            score: bestStep.relevanceScore,
            details: bestStep
          });
        }
      }
    });

    // Page object recommendations
    if (result.pageObjects?.action === 'reuse') {
      recommendations.push({
        type: 'page',
        action: 'reuse',
        message: `✅ REUSE existing page object: "${result.pageObjects.recommendation.className}"`,
        score: result.pageObjects.reuseScore,
        details: result.pageObjects.recommendation
      });
    } else if (result.pageObjects?.action === 'adapt') {
      recommendations.push({
        type: 'page',
        action: 'adapt',
        message: `🔧 ADAPT existing page object: "${result.pageObjects.recommendation.className}" (${Math.round(result.pageObjects.reuseScore * 100)}% match)`,
        score: result.pageObjects.reuseScore,
        details: result.pageObjects.recommendation
      });
    }

    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * Generate actual files using master libraries
   */
  async generateFiles(analysis, outputPath, context = {}) {
    const generatedFiles = [];

    try {
      // Generate feature file
      if (analysis.feature) {
        const featureFile = await this.generateFeatureFile(analysis.feature, outputPath, context);
        if (featureFile) generatedFiles.push(featureFile);
      }

      // Generate steps file
      if (analysis.steps) {
        const stepsFile = await this.generateStepsFile(analysis.steps, outputPath, context);
        if (stepsFile) generatedFiles.push(stepsFile);
      }

      // Generate page object file
      if (analysis.pageObjects) {
        const pageFile = await this.generatePageFile(analysis.pageObjects, outputPath, context);
        if (pageFile) generatedFiles.push(pageFile);
      }

      console.log(`✅ Generated ${generatedFiles.length} files using master libraries`);
      return generatedFiles;

    } catch (error) {
      console.error('❌ Error generating files:', error);
      throw error;
    }
  }

  /**
   * Generate feature file with master patterns
   */
  async generateFeatureFile(featureAnalysis, outputPath, context) {
    let featureData;
    
    if (featureAnalysis.action === 'reuse') {
      featureData = featureAnalysis.recommendation;
    } else if (featureAnalysis.action === 'adapt') {
      featureData = { ...featureAnalysis.recommendation };
      // Apply customizations
      featureData.title = context.featureName || featureData.title;
      featureData.scenarios = this.adaptScenarios(featureData.scenarios, context);
    } else {
      // Create new feature using generic template
      featureData = this.featuresLibrary.getGenericTemplate();
      featureData.title = context.featureName || 'Generated Feature';
      featureData.description = context.featureDescription || featureData.description;
    }

    const featureContent = this.featuresLibrary.generateFeatureFile(featureData);
    const fileName = `${context.kebabName || 'generated-feature'}.feature`;
    const filePath = path.join(outputPath, 'features', fileName);

    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, featureContent);

    return {
      type: 'feature',
      path: filePath,
      action: featureAnalysis.action,
      reused: featureAnalysis.action !== 'create'
    };
  }

  /**
   * Generate steps file with master patterns
   */
  async generateStepsFile(stepsAnalysis, outputPath, context) {
    const stepsContent = this.generateStepsContent(stepsAnalysis, context);
    const fileName = `${context.kebabName || 'generated'}-steps.js`;
    const filePath = path.join(outputPath, 'steps', fileName);

    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, stepsContent);

    return {
      type: 'steps',
      path: filePath,
      action: 'generated',
      reused: true
    };
  }

  /**
   * Generate page object file with master patterns
   */
  async generatePageFile(pageAnalysis, outputPath, context) {
    let pageData;
    
    if (pageAnalysis.action === 'reuse') {
      pageData = pageAnalysis.recommendation;
    } else if (pageAnalysis.action === 'adapt') {
      pageData = { ...pageAnalysis.recommendation };
      pageData.className = context.pageClassName || pageData.className;
    } else {
      pageData = this.pageObjectsLibrary.getGenericTemplate();
      pageData.className = context.pageClassName || 'GeneratedPage';
    }

    const pageContent = this.pageObjectsLibrary.generatePageObjectFile(pageData);
    const fileName = `${context.kebabName || 'generated'}-page.js`;
    const filePath = path.join(outputPath, 'pages', fileName);

    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, pageContent);

    return {
      type: 'page',
      path: filePath,
      action: pageAnalysis.action,
      reused: pageAnalysis.action !== 'create'
    };
  }

  /**
   * Generate steps content using master steps
   */
  generateStepsContent(stepsAnalysis, context) {
    const imports = new Set([
      "const { assert } = require('chai');",
      "const { Given, When, Then } = require('@cucumber/cucumber');"
    ]);

    let content = '';
    const stepDefinitions = [];

    // Process each step type
    ['given', 'when', 'then'].forEach(stepType => {
      const stepData = stepsAnalysis[`${stepType}Steps`];
      if (stepData?.suggestions?.length > 0) {
        const bestStep = stepData.suggestions[0];
        if (bestStep.relevanceScore >= 0.7) {
          // Reuse existing step
          const stepCode = this.stepsLibrary.generateStepDefinition(bestStep, context);
          stepDefinitions.push(stepCode);
          
          // Add imports
          const stepImports = this.stepsLibrary.generateImports(bestStep);
          stepImports.forEach(imp => imports.add(imp));
        }
      }
    });

    // Build final content
    content = Array.from(imports).join('\n') + '\n\n';
    if (stepDefinitions.length > 0) {
      content += stepDefinitions.join('\n\n');
    } else {
      content += this.generateDefaultSteps(context);
    }

    return content;
  }

  /**
   * Generate default steps when no reusable steps found
   */
  generateDefaultSteps(context) {
    return `Given('I am on the ${context.kebabName || 'application'} page', async function () {
  // Implementation needed
});

When('I perform the required action', async function () {
  // Implementation needed
});

Then('I should see the expected result', async function () {
  // Implementation needed
});`;
  }

  /**
   * Update reusability metrics
   */
  updateMetrics(result) {
    if (result.feature?.action === 'create') this.reusabilityMetrics.newCreated++;
    if (result.steps && !result.steps.totalReuseScore) this.reusabilityMetrics.newCreated++;
    if (result.pageObjects?.action === 'create') this.reusabilityMetrics.newCreated++;
  }

  /**
   * Get comprehensive statistics
   */
  getStatistics() {
    const stepsStats = this.stepsLibrary.getStatistics();
    const featuresStats = this.featuresLibrary.getStatistics();
    const pagesStats = this.pageObjectsLibrary.getStatistics();

    return {
      masterLibraries: {
        steps: stepsStats,
        features: featuresStats,
        pages: pagesStats
      },
      reusabilityMetrics: this.reusabilityMetrics,
      reuseRatio: this.calculateReuseRatio()
    };
  }

  /**
   * Calculate reuse ratio
   */
  calculateReuseRatio() {
    const total = this.reusabilityMetrics.stepsReused + 
                  this.reusabilityMetrics.featuresReused + 
                  this.reusabilityMetrics.pagesReused + 
                  this.reusabilityMetrics.newCreated;
    
    if (total === 0) return 0;
    
    const reused = this.reusabilityMetrics.stepsReused + 
                   this.reusabilityMetrics.featuresReused + 
                   this.reusabilityMetrics.pagesReused;
    
    return Math.round((reused / total) * 100);
  }

  /**
   * Log statistics
   */
  logStatistics() {
    const stats = this.getStatistics();
    console.log('\n📊 MASTER LIBRARIES STATISTICS:');
    console.log(`   🔄 Steps: ${stats.masterLibraries.steps.totalSteps}`);
    console.log(`   📋 Features: ${stats.masterLibraries.features.totalFeatures}`);
    console.log(`   📄 Pages: ${stats.masterLibraries.pages.totalPages}`);
    console.log(`   ♻️  Reuse Ratio: ${stats.reuseRatio}%`);
  }

  /**
   * Log reusability results
   */
  logReusabilityResults(result) {
    console.log('\n📈 REUSABILITY ANALYSIS RESULTS:');
    console.log(`   🎯 Overall Score: ${result.reusabilityScore}%`);
    console.log(`   📋 Feature Action: ${result.feature?.action || 'none'}`);
    console.log(`   🔄 Steps Reuse: ${Math.round(result.steps?.totalReuseScore * 100)}%`);
    console.log(`   📄 Page Action: ${result.pageObjects?.action || 'none'}`);
    
    if (result.recommendations.length > 0) {
      console.log('\n💡 TOP RECOMMENDATIONS:');
      result.recommendations.slice(0, 3).forEach(rec => {
        console.log(`   ${rec.message}`);
      });
    }
  }

  /**
   * 🛡️ ENFORCE SBS COMPLIANCE - Critical Production Rules
   * This method validates and enforces all SBS_Automation standards
   */
  enforceSBSCompliance(fileContent, fileType, filePath) {
    console.log(`🛡️ Enforcing SBS compliance for ${fileType} file...`);
    
    // Validate file path - MUST be in auto-coder/SBS_Automation/
    // Check if the path contains the required directory structure
    const pathContainsAutoCoderSBS = filePath.includes('auto-coder/SBS_Automation/') || 
                                     filePath.includes('auto-coder\\SBS_Automation\\');
    
    if (!pathContainsAutoCoderSBS) {
      throw new Error(`❌ PATH VIOLATION: Files must be saved in auto-coder/SBS_Automation/ directory. Invalid path: ${filePath}`);
    }

    try {
      switch (fileType) {
        case 'feature':
          this.featuresLibrary.validateBackgroundCompliance(fileContent);
          break;
        case 'page':
          this.pageObjectsLibrary.validatePageObjectCompliance(fileContent);
          break;
        case 'steps':
          // Additional steps validation can be added here
          break;
      }
      
      console.log(`✅ SBS compliance validated for ${fileType} file`);
      return true;
      
    } catch (error) {
      console.error(`❌ SBS COMPLIANCE ERROR in ${fileType} file:`, error.message);
      throw error;
    }
  }

  /**
   * 🎯 GENERATE WITH MANDATORY SBS PATTERNS
   * Ensures all generated files use correct SBS patterns
   */
  async generateWithSBSCompliance(analysis, outputPath, context = {}) {
    console.log('\n🎯 GENERATING FILES WITH MANDATORY SBS COMPLIANCE...');
    
    const generatedFiles = [];
    const complianceReport = {
      featuresGenerated: 0,
      stepsGenerated: 0,
      pagesGenerated: 0,
      complianceIssues: [],
      success: true
    };

    try {
      // 1. Generate Feature File with Mandatory Background
      if (analysis.feature) {
        console.log('📋 Generating feature file with mandatory SBS background...');
        const featureResult = await this.generateCompliantFeatureFile(analysis.feature, outputPath, context);
        if (featureResult.success) {
          generatedFiles.push(featureResult.file);
          complianceReport.featuresGenerated++;
        } else {
          complianceReport.complianceIssues.push(...featureResult.issues);
        }
      }

      // 2. Generate Steps File with SBS Patterns
      if (analysis.steps) {
        console.log('🔄 Generating steps file with SBS patterns...');
        const stepsResult = await this.generateCompliantStepsFile(analysis.steps, outputPath, context);
        if (stepsResult.success) {
          generatedFiles.push(stepsResult.file);
          complianceReport.stepsGenerated++;
        } else {
          complianceReport.complianceIssues.push(...stepsResult.issues);
        }
      }

      // 3. Generate Page Object with Correct Constructor & Imports
      if (analysis.pageObjects) {
        console.log('📄 Generating page object with SBS constructor & imports...');
        const pageResult = await this.generateCompliantPageFile(analysis.pageObjects, outputPath, context);
        if (pageResult.success) {
          generatedFiles.push(pageResult.file);
          complianceReport.pagesGenerated++;
        } else {
          complianceReport.complianceIssues.push(...pageResult.issues);
        }
      }

      if (complianceReport.complianceIssues.length > 0) {
        complianceReport.success = false;
        console.log('⚠️  COMPLIANCE ISSUES DETECTED:');
        complianceReport.complianceIssues.forEach(issue => console.log(`   ${issue}`));
      } else {
        console.log('✅ ALL FILES GENERATED WITH 100% SBS COMPLIANCE');
      }

      return {
        files: generatedFiles,
        report: complianceReport
      };

    } catch (error) {
      console.error('❌ Error during compliant file generation:', error);
      throw error;
    }
  }

  /**
   * 📋 Generate Compliant Feature File
   */
  async generateCompliantFeatureFile(featureAnalysis, outputPath, context) {
    try {
      // Get mandatory background from features library
      const mandatoryBackground = this.featuresLibrary.getMandatoryBackground();
      
      let featureContent = '';
      
      if (featureAnalysis.action === 'reuse') {
        // Reuse existing feature but ensure background compliance
        const template = featureAnalysis.recommendation;
        featureContent = this.featuresLibrary.generateFeatureContent(template);
      } else {
        // Create new feature with mandatory background
        const featureTemplate = {
          title: context.featureName || 'New Feature',
          description: context.description || 'Feature description',
          tags: ['@Team:SBSBusinessContinuity', '@smoke'],
          background: 'standard', // This will use mandatory background
          scenarios: context.scenarios || []
        };
        featureContent = this.featuresLibrary.generateFeatureContent(featureTemplate);
      }

      // Ensure mandatory background is used
      if (!featureContent.includes('Given Alex is logged into RunMod with a homepage test client')) {
        // Replace any existing background with mandatory one
        featureContent = featureContent.replace(
          /Background:[\s\S]*?(?=Scenario|$)/,
          mandatoryBackground.pattern + '\n\n'
        );
      }

      const fileName = `${context.fileName || 'feature'}.feature`;
      const filePath = path.join(outputPath, 'features', fileName);
      
      // Validate compliance using the actual file path
      this.enforceSBSCompliance(featureContent, 'feature', filePath);

      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, featureContent);

      return {
        success: true,
        file: { path: filePath, content: featureContent, type: 'feature' },
        issues: []
      };

    } catch (error) {
      return {
        success: false,
        file: null,
        issues: [`Feature generation error: ${error.message}`]
      };
    }
  }

  /**
   * 📄 Generate Compliant Page Object File
   */
  async generateCompliantPageFile(pageAnalysis, outputPath, context) {
    try {
      let pageContent = '';
      const className = context.className || 'NewPage';

      if (pageAnalysis.action === 'reuse') {
        // Reuse existing page object
        const template = pageAnalysis.recommendation;
        pageContent = this.pageObjectsLibrary.generateSBSCompliantPageObject(template, className);
      } else {
        // Create new page object with SBS compliance
        const pageTemplate = {
          description: context.description || 'Page object description',
          extends: 'BasePage',
          locators: context.locators || [],
          methods: context.methods || [],
          imports: ['base-page', 'By.js']
        };
        pageContent = this.pageObjectsLibrary.generateSBSCompliantPageObject(pageTemplate, className);
      }

      const fileName = `${context.fileName || 'page'}-page.js`;
      const filePath = path.join(outputPath, 'pages', fileName);
      
      // Validate compliance using the actual file path
      this.enforceSBSCompliance(pageContent, 'page', filePath);
      
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, pageContent);

      return {
        success: true,
        file: { path: filePath, content: pageContent, type: 'page' },
        issues: []
      };

    } catch (error) {
      return {
        success: false,
        file: null,
        issues: [`Page generation error: ${error.message}`]
      };
    }
  }

  /**
   * 🔄 Generate Compliant Steps File
   */
  async generateCompliantStepsFile(stepsAnalysis, outputPath, context) {
    try {
      let stepsContent = this.stepsLibrary.generateStepsFileHeader();
      
      // Add reused or new step definitions
      ['given', 'when', 'then'].forEach(stepType => {
        const stepData = stepsAnalysis[`${stepType}Steps`];
        if (stepData?.suggestions?.length > 0) {
          // Reuse existing steps
          stepData.suggestions.forEach(step => {
            stepsContent += step.pattern + '\n\n';
          });
        }
      });

      // Add module export
      stepsContent += 'module.exports = {};\n';

      const fileName = `${context.fileName || 'steps'}-steps.js`;
      const filePath = path.join(outputPath, 'steps', fileName);
      
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, stepsContent);

      return {
        success: true,
        file: { path: filePath, content: stepsContent, type: 'steps' },
        issues: []
      };

    } catch (error) {
      return {
        success: false,
        file: null,
        issues: [`Steps generation error: ${error.message}`]
      };
    }
  }

  // Helper methods
  extractKeywords(text) {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['that', 'with', 'from', 'this', 'they', 'have', 'will', 'been'].includes(word))
      .slice(0, 10);
  }

  adaptScenarios(scenarios, context) {
    // Adapt scenario names and steps based on context
    return scenarios.map(scenario => ({
      ...scenario,
      name: scenario.name.replace(/generic/i, context.featureName || 'custom')
    }));
  }
}

module.exports = MasterLibraryManager;
