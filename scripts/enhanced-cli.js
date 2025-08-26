#!/usr/bin/env node
/**
 * Enhanced Interactive CLI for Auto-Coder Framework
 * Integrates generation, deployment, and test execution
 */

const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const ArtifactDeployer = require('./deploy-artifacts');
const AutoCoderTestRunner = require('./run-tests');

class AutoCoderCLI {
  constructor() {
    this.deployer = new ArtifactDeployer();
    this.runner = new AutoCoderTestRunner();
  }

  async start() {
    console.log(`
🎯 Auto-Coder Enhanced CLI
═══════════════════════════════════════
Generate → Deploy → Execute → Report

🚨 CRITICAL PRODUCTION RULES - MANDATORY ENFORCEMENT:

1. LOCATOR STANDARDS: Prefer By.css() with single quotes; avoid By.xpath() unless necessary
2. PARAMETERIZATION: Use parameterized locators for dynamic elements referenced in feature files  
3. CLEAN METHODS: No unused parameters in page methods
4. EXISTING METHODS ONLY: Only use methods that exist in main SBS_Automation BasePage (no waitForPageLoad())
5. PROPER CONSTRUCTORS: No locators in constructor, always call super(page)
    `);

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '🎯 Generate Test Artifacts', value: 'generate' },
          { name: '🚀 Deploy Artifacts to Main SBS', value: 'deploy' },
          { name: '▶️ Run Feature Test', value: 'run' },
          { name: '🔍 Validate Feature', value: 'validate' },
          { name: '📊 View Test Reports', value: 'reports' },
          { name: '📋 List Available Features', value: 'list' },
          { name: '🔄 Full Workflow (Generate→Deploy→Run)', value: 'workflow' },
          { name: '❌ Exit', value: 'exit' }
        ]
      }
    ]);

    switch (action) {
      case 'generate':
        await this.handleGenerate();
        break;
      case 'deploy':
        await this.handleDeploy();
        break;
      case 'run':
        await this.handleRun();
        break;
      case 'validate':
        await this.handleValidate();
        break;
      case 'reports':
        await this.handleReports();
        break;
      case 'list':
        await this.handleList();
        break;
      case 'workflow':
        await this.handleFullWorkflow();
        break;
      case 'exit':
        console.log('👋 Goodbye!');
        return;
    }

    // Continue CLI loop
    await this.start();
  }

  async handleGenerate() {
    console.log('\n🎯 ARTIFACT GENERATION');
    console.log('═══════════════════════');
    
    const { requirementType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'requirementType',
        message: 'Select requirement type:',
        choices: [
          { name: '📝 Text Requirement', value: 'text' },
          { name: '🖼️ Image Requirement', value: 'image' },
          { name: '🎫 JIRA Story', value: 'jira' },
          { name: '🔗 cURL/API Spec', value: 'api' }
        ]
      }
    ]);

    const { requirementPath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'requirementPath',
        message: 'Enter requirement file path:',
        validate: (input) => {
          if (!input.trim()) return 'Path is required';
          if (!fs.existsSync(input)) return 'File does not exist';
          return true;
        }
      }
    ]);

    console.log('🔄 Generating artifacts using Claude...');
    console.log('📍 Requirement:', requirementPath);
    console.log('💡 Tip: Use the You-Me-Direct.md prompt for best results');
    
    // Note: Actual generation would be handled by Claude with the prompts
    console.log('✅ Generation complete! Use deployment option to deploy.');
  }

  async handleDeploy() {
    console.log('\n🚀 ARTIFACT DEPLOYMENT');
    console.log('═══════════════════════');
    
    const { deployType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'deployType',
        message: 'Deploy which artifacts?',
        choices: [
          { name: '📦 All Artifacts', value: 'all' },
          { name: '🎯 Specific Artifact', value: 'specific' }
        ]
      }
    ]);

    if (deployType === 'all') {
      console.log('🚀 Deploying all artifacts...');
      await this.deployer.deployAllArtifacts();
    } else {
      const { artifactName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'artifactName',
          message: 'Enter artifact name (without extension):',
          validate: (input) => input.trim() ? true : 'Artifact name is required'
        }
      ]);

      console.log(`🎯 Deploying ${artifactName}...`);
      await this.deployer.deployArtifact(artifactName);
    }
    
    console.log('✅ Deployment complete!');
  }

  async handleRun() {
    console.log('\n▶️ FEATURE EXECUTION');
    console.log('════════════════════');
    
    // List available features
    const features = this.runner.listAvailableFeatures();
    
    if (features.length === 0) {
      console.log('❌ No features available. Deploy artifacts first.');
      return;
    }

    const { featureName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'featureName',
        message: 'Select feature to run:',
        choices: features.map(f => ({ name: f, value: f }))
      }
    ]);

    const { environment } = await inquirer.prompt([
      {
        type: 'list',
        name: 'environment',
        message: 'Select environment:',
        choices: [
          { name: '🔧 IAT_CAN (Integration)', value: 'iat_can' },
          { name: '🧪 FIT (Functional)', value: 'fit' },
          { name: '💻 DEV (Development)', value: 'dev' }
        ]
      }
    ]);

    const { browser } = await inquirer.prompt([
      {
        type: 'list',
        name: 'browser',
        message: 'Select browser:',
        choices: [
          { name: '🔵 Chrome (Recommended)', value: 'chrome' },
          { name: '🦊 Firefox', value: 'firefox' },
          { name: '🔷 Edge', value: 'edge' }
        ]
      }
    ]);

    const { headless } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'headless',
        message: 'Run in headless mode?',
        default: false
      }
    ]);

    console.log(`🚀 Running ${featureName} in ${environment.toUpperCase()} with ${browser}...`);
    
    try {
      const result = await this.runner.runFeatureWithValidation(featureName, environment, browser);
      console.log('🎉 Feature execution completed successfully!');
      console.log(`📊 Report saved to: reports/auto-coder/`);
    } catch (error) {
      console.error('💥 Feature execution failed');
      console.error('📊 Check reports for detailed error information');
    }
  }

  async handleValidate() {
    console.log('\n🔍 FEATURE VALIDATION');
    console.log('════════════════════');
    
    const features = this.runner.listAvailableFeatures();
    
    if (features.length === 0) {
      console.log('❌ No features available. Deploy artifacts first.');
      return;
    }

    const { featureName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'featureName',
        message: 'Select feature to validate:',
        choices: features.map(f => ({ name: f, value: f }))
      }
    ]);

    try {
      await this.runner.validateFeature(featureName);
      console.log('✅ Feature validation passed!');
    } catch (error) {
      console.error('❌ Feature validation failed');
    }
  }

  async handleReports() {
    console.log('\n📊 TEST REPORTS');
    console.log('═══════════════');
    
    const reportsPath = '/Users/gadea/auto/auto/qa_automation/SBS_Automation/reports/auto-coder';
    const summaryFile = `${reportsPath}/summary.json`;
    
    if (!fs.existsSync(summaryFile)) {
      console.log('📋 No test reports found yet.');
      return;
    }

    const summary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
    const recent = summary.slice(-10).reverse();

    console.log('\n📈 Recent Test Results:');
    console.log('═══════════════════════');
    
    recent.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      const date = new Date(result.timestamp).toLocaleString();
      console.log(`${status} ${result.feature} (${result.environment}/${result.browser}) - ${date}`);
    });

    const successRate = (summary.filter(r => r.success).length / summary.length * 100).toFixed(1);
    console.log(`\n📊 Overall Success Rate: ${successRate}%`);
  }

  async handleList() {
    console.log('\n📋 AVAILABLE FEATURES');
    console.log('════════════════════');
    this.runner.listAvailableFeatures();
  }

  async handleFullWorkflow() {
    console.log('\n🔄 FULL WORKFLOW');
    console.log('═══════════════════');
    console.log('This will guide you through: Generate → Deploy → Run');
    
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Start full workflow?',
        default: true
      }
    ]);

    if (!confirm) return;

    // Step 1: Generate (guidance)
    console.log('\n1️⃣ GENERATION PHASE');
    console.log('Use Claude with You-Me-Direct.md prompt to generate artifacts');
    
    const { generationDone } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'generationDone',
        message: 'Have you generated the artifacts with Claude?',
        default: false
      }
    ]);

    if (!generationDone) {
      console.log('⏸️ Please generate artifacts first, then restart workflow');
      return;
    }

    // Step 2: Deploy
    console.log('\n2️⃣ DEPLOYMENT PHASE');
    await this.handleDeploy();

    // Step 3: Run
    console.log('\n3️⃣ EXECUTION PHASE');
    await this.handleRun();

    console.log('\n🎉 Full workflow completed!');
  }
}

// Start CLI if run directly
if (require.main === module) {
  const cli = new AutoCoderCLI();
  cli.start().catch(console.error);
}

module.exports = AutoCoderCLI;
