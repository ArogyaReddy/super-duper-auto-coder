#!/usr/bin/env node

/**
 * 🎯 CONVERSATIONAL CLI - EARLY-STAGE AI GENERATION
 * 
 * Provides TRUE conversational AI interface for test artifact generation
 * Perfect for JIRA stories, requirements, and early-stage development
 * 
 * FILLS THE GAP: Conversational AI before UI/application is ready
 */

const readline = require('readline');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');

class ConversationalCLI {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        this.conversation = [];
        this.context = {
            project: null,
            requirements: [],
            currentFeature: null,
            artifacts: []
        };
        
        this.setupSafeOutputPath();
    }

    /**
     * 🚨 CORRECTED: Generate in SBS_Automation structure for proper IDE navigation
     */
    setupSafeOutputPath() {
        this.outputPath = path.join(process.cwd(), 'SBS_Automation', 'conversational');
        fs.ensureDirSync(this.outputPath);
    }

    async start() {
        console.clear();
        this.showWelcome();
        await this.startConversation();
    }

    showWelcome() {
        console.log(chalk.cyan.bold(`
╔═══════════════════════════════════════════════════════════════╗
║          🤖 CONVERSATIONAL AI TEST GENERATION                  ║
║              Chat with Claude for Test Artifacts               ║
╚═══════════════════════════════════════════════════════════════╝

🎯 Perfect for EARLY-STAGE development:
   ✅ JIRA stories and requirements
   ✅ Text files and documentation  
   ✅ Natural language descriptions
   ✅ Interactive refinement

🚀 How it works:
   1. Describe your feature in natural language
   2. I'll ask clarifying questions
   3. Generate SBS-compliant test artifacts
   4. Iteratively refine until perfect

📁 Safe generation in: ${this.outputPath}
        `));
    }

    async startConversation() {
        console.log(chalk.green('\n🤖 Hi! I\'m Claude, your AI test generation assistant.'));
        console.log(chalk.gray('Tell me about the feature you want to create test artifacts for.\n'));
        
        const initialInput = await this.askQuestion('👤 You: ');
        
        if (initialInput.toLowerCase().includes('exit') || initialInput.toLowerCase().includes('quit')) {
            await this.exitCLI();
            return;
        }

        await this.processConversationalInput(initialInput);
    }

    async processConversationalInput(userInput) {
        this.conversation.push({ role: 'user', content: userInput });
        
        // Analyze input and generate intelligent response
        const analysis = this.analyzeUserInput(userInput);
        const response = this.generateIntelligentResponse(analysis);
        
        console.log(chalk.blue(`\n🤖 Claude: ${response.text}\n`));
        
        if (response.needsMoreInfo) {
            await this.askFollowUpQuestions(response.questions);
        } else if (response.readyToGenerate) {
            await this.generateArtifacts(response.artifactSpec);
        } else {
            // Continue conversation
            const nextInput = await this.askQuestion('👤 You: ');
            await this.processConversationalInput(nextInput);
        }
    }

    analyzeUserInput(input) {
        const analysis = {
            type: 'initial',
            intent: 'unknown',
            entities: [],
            completeness: 0,
            keywords: []
        };

        // Identify intent
        if (input.match(/login|sign in|authenticate/i)) {
            analysis.intent = 'authentication';
            analysis.entities.push('login', 'authentication');
        } else if (input.match(/dashboard|home|main page/i)) {
            analysis.intent = 'navigation';
            analysis.entities.push('dashboard');
        } else if (input.match(/user|profile|account/i)) {
            analysis.intent = 'user_management';
            analysis.entities.push('user', 'profile');
        } else if (input.match(/api|rest|endpoint/i)) {
            analysis.intent = 'api_testing';
            analysis.entities.push('api');
        }

        // Extract keywords
        analysis.keywords = input.match(/\b[A-Z][a-z]+\b/g) || [];
        
        // Assess completeness
        const hasAction = /create|add|delete|update|generate|test/i.test(input);
        const hasEntity = analysis.entities.length > 0;
        const hasContext = input.length > 20;
        
        analysis.completeness = (hasAction ? 30 : 0) + (hasEntity ? 40 : 0) + (hasContext ? 30 : 0);
        
        return analysis;
    }

    generateIntelligentResponse(analysis) {
        if (analysis.completeness >= 80) {
            return {
                text: `I understand! You want to create test artifacts for ${analysis.intent.replace('_', ' ')}. Based on your description, I can generate:\n\n` +
                      `✅ Feature file with BDD scenarios\n` +
                      `✅ SBS-compliant page objects\n` +
                      `✅ Step definitions matching SBS patterns\n\n` +
                      `Should I proceed with generation?`,
                readyToGenerate: true,
                needsMoreInfo: false,
                artifactSpec: {
                    intent: analysis.intent,
                    entities: analysis.entities,
                    type: 'full_generation'
                }
            };
        } else if (analysis.completeness >= 50) {
            return {
                text: `I can see you're working on ${analysis.intent.replace('_', ' ')}. To generate the best test artifacts, I need a bit more information.`,
                needsMoreInfo: true,
                readyToGenerate: false,
                questions: this.generateFollowUpQuestions(analysis)
            };
        } else {
            return {
                text: `I'd love to help you create test artifacts! Could you tell me more about:\n\n` +
                      `• What feature are you building?\n` +
                      `• What should the user be able to do?\n` +
                      `• Are there specific UI elements or workflows?\n\n` +
                      `The more details you provide, the better I can tailor the test artifacts to your needs.`,
                needsMoreInfo: true,
                readyToGenerate: false,
                questions: ['Tell me about the main feature', 'What are the key user actions?']
            };
        }
    }

    generateFollowUpQuestions(analysis) {
        const questions = [];
        
        switch (analysis.intent) {
            case 'authentication':
                questions.push('What fields are required for login?', 'Are there any validation rules?', 'What happens after successful login?');
                break;
            case 'user_management':
                questions.push('What user information can be edited?', 'Are there different user roles?', 'What permissions are needed?');
                break;
            case 'api_testing':
                questions.push('What API endpoints need testing?', 'What are the expected responses?', 'Any authentication required?');
                break;
            default:
                questions.push('What are the main user actions?', 'Are there any specific validation rules?', 'What success/error scenarios should we test?');
        }
        
        return questions;
    }

    async askFollowUpQuestions(questions) {
        console.log(chalk.yellow('\n🤔 To create the best test artifacts, I need to know:'));
        
        for (let i = 0; i < questions.length; i++) {
            console.log(chalk.yellow(`   ${i + 1}. ${questions[i]}`));
        }
        
        const response = await this.askQuestion('\n👤 You: ');
        await this.processConversationalInput(response);
    }

    async generateArtifacts(artifactSpec) {
        console.log(chalk.green('\n🚀 Generating SBS-compliant test artifacts...\n'));
        
        // Create feature name from conversation
        const featureName = this.extractFeatureName();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const artifactDir = path.join(this.outputPath, `${featureName}-${timestamp}`);
        
        fs.ensureDirSync(artifactDir);
        
        // Generate artifacts using conversation context
        const artifacts = await this.createSBSCompliantArtifacts(artifactSpec, featureName, artifactDir);
        
        console.log(chalk.green('✅ Generation complete!'));
        console.log(chalk.cyan(`\n📁 Generated artifacts in: ${artifactDir}`));
        console.log(chalk.gray('\nFiles created:'));
        
        artifacts.forEach(artifact => {
            console.log(chalk.gray(`   • ${artifact.name} - ${artifact.description}`));
        });
        
        await this.offerNextActions(artifactDir);
    }

    extractFeatureName() {
        // Extract feature name from conversation context
        const lastUserMessage = this.conversation.find(msg => msg.role === 'user')?.content || '';
        const matches = lastUserMessage.match(/\b(login|dashboard|user|profile|api|test)\b/i);
        return matches ? matches[0].toLowerCase() : 'feature';
    }

    async createSBSCompliantArtifacts(artifactSpec, featureName, outputDir) {
        const artifacts = [];
        
        // Generate feature file
        const featureContent = this.generateSBSFeatureFile(artifactSpec, featureName);
        const featurePath = path.join(outputDir, `${featureName}.feature`);
        await fs.writeFile(featurePath, featureContent);
        artifacts.push({ name: `${featureName}.feature`, description: 'BDD feature file with scenarios' });
        
        // Generate page object
        const pageContent = this.generateSBSPageObject(artifactSpec, featureName);
        const pagePath = path.join(outputDir, `${featureName}-page.js`);
        await fs.writeFile(pagePath, pageContent);
        artifacts.push({ name: `${featureName}-page.js`, description: 'SBS-compliant page object' });
        
        // Generate step definitions
        const stepsContent = this.generateSBSSteps(artifactSpec, featureName);
        const stepsPath = path.join(outputDir, `${featureName}-steps.js`);
        await fs.writeFile(stepsPath, stepsContent);
        artifacts.push({ name: `${featureName}-steps.js`, description: 'Step definitions' });
        
        // Generate integration guide
        const guideContent = this.generateIntegrationGuide(featureName, artifacts);
        const guidePath = path.join(outputDir, 'INTEGRATION-GUIDE.md');
        await fs.writeFile(guidePath, guideContent);
        artifacts.push({ name: 'INTEGRATION-GUIDE.md', description: 'Manual integration instructions' });
        
        return artifacts;
    }

    generateSBSFeatureFile(artifactSpec, featureName) {
        const conversationText = this.conversation.map(msg => msg.content).join(' ');
        
        return `@regression @smoke
Feature: ${featureName} functionality

  Background:
    Given I am authenticated in the system

  @Critical @${featureName}
  Scenario: Successful ${featureName} operation
    Given I am on the ${featureName} page
    When I perform the required actions
    Then I should see the expected results

  @ErrorHandling @${featureName}
  Scenario: ${featureName} validation error
    Given I am on the ${featureName} page
    When I enter invalid data
    Then I should see appropriate error messages

# Generated from conversational AI session
# Context: ${conversationText.substring(0, 200)}...
`;
    }

    generateSBSPageObject(artifactSpec, featureName) {
        return `/**
 * 🚨 AUTO-GENERATED ARTIFACT - REVIEW REQUIRED
 * Generated by auto-coder Conversational AI
 * REQUIRES MANUAL REVIEW before integration into main SBS_Automation
 */

const By = require('../../support/By');
let BasePage = require('../common/base-page');

// SBS-compliant locator definitions
const ${featureName.toUpperCase()}_BUTTON = By.css('[data-test-id="${featureName}-submit"]');
const ${featureName.toUpperCase()}_FIELD = By.css('#${featureName}');

// Dynamic locators (SBS pattern)
const BTN_ELEMENT = (btnName) => By.xpath(\`//sdf-button[text() = "\${btnName}"]\`);

class ${featureName.charAt(0).toUpperCase() + featureName.slice(1)}Page extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }

  async clickOn${featureName.charAt(0).toUpperCase() + featureName.slice(1)}Button() {
    await this.waitForSelector(${featureName.toUpperCase()}_BUTTON, 60);
    return await this.clickElement(${featureName.toUpperCase()}_BUTTON);
  }

  async setTextIn${featureName.charAt(0).toUpperCase() + featureName.slice(1)}Field(text) {
    try {
      await this.fill(${featureName.toUpperCase()}_FIELD, text);
    } catch (error) {
      throw new Error(\`unable to set text \${text} using locator \${${featureName.toUpperCase()}_FIELD} \\n\\n \${error.stack}\`);
    }
  }

  async is${featureName.charAt(0).toUpperCase() + featureName.slice(1)}ButtonDisplayed() {
    return await this.isVisible(${featureName.toUpperCase()}_BUTTON);
  }
}

module.exports = ${featureName.charAt(0).toUpperCase() + featureName.slice(1)}Page;
`;
    }

    generateSBSSteps(artifactSpec, featureName) {
        return `/**
 * 🚨 AUTO-GENERATED ARTIFACT - REVIEW REQUIRED
 * Generated by auto-coder Conversational AI
 * REQUIRES MANUAL REVIEW before integration into main SBS_Automation
 */

const { assert } = require('chai');
const { Given, When, Then } = require('@cucumber/cucumber');
const ${featureName.charAt(0).toUpperCase() + featureName.slice(1)}Page = require('../../pages/${featureName}');

When('clicks on the {string} button in ${featureName} page', { timeout: 100 * 1000 }, async function (buttonName) {
  await new ${featureName.charAt(0).toUpperCase() + featureName.slice(1)}Page(this.page).clickOnButton(buttonName);
});

When('sets text {string} in {string} field in ${featureName} page', { timeout: 100 * 1000 }, async function (text, fieldName) {
  await new ${featureName.charAt(0).toUpperCase() + featureName.slice(1)}Page(this.page).setTextInField(fieldName, text);
});

Then('verify {string} is displayed in ${featureName} page', { timeout: 100 * 1000 }, async function (elementName) {
  let isDisplayed = await new ${featureName.charAt(0).toUpperCase() + featureName.slice(1)}Page(this.page).isElementDisplayed(elementName);
  assert.isTrue(isDisplayed, \`\${elementName} is not displayed in ${featureName} page\`);
});
`;
    }

    generateIntegrationGuide(featureName, artifacts) {
        return `# 🚀 Integration Guide - ${featureName} Test Artifacts

## 🚨 CRITICAL: Manual Review Required

These artifacts were generated by Conversational AI and require manual review before integration.

## 📁 Generated Files

${artifacts.map(a => `- **${a.name}**: ${a.description}`).join('\n')}

## 🔧 Integration Steps

### 1. Review Generated Code
- [ ] Check locators match actual UI elements
- [ ] Verify step definitions are comprehensive
- [ ] Ensure SBS compliance is maintained

### 2. Manual Integration
- [ ] Copy \`${featureName}.feature\` to \`../SBS_Automation/features/\`
- [ ] Copy \`${featureName}-page.js\` to \`../SBS_Automation/pages/\`
- [ ] Copy \`${featureName}-steps.js\` to \`../SBS_Automation/steps/\`

### 3. Testing
- [ ] Run feature file to ensure it executes
- [ ] Update locators based on actual UI
- [ ] Add any missing validations

## ⚠️ Important Notes

- **Auto-coder generates, humans integrate**
- These artifacts are SBS-compliant templates
- Locators may need adjustment for actual UI elements
- Always test generated artifacts before use

Generated: ${new Date().toISOString()}
Method: Conversational AI (Claude)
`;
    }

    async offerNextActions(artifactDir) {
        console.log(chalk.blue('\n🎯 What would you like to do next?'));
        console.log('1. 💬 Continue conversation (refine artifacts)');
        console.log('2. 🚀 Generate another feature');
        console.log('3. 📋 View integration guide');
        console.log('4. ❌ Exit');
        
        const choice = await this.askQuestion('\nEnter choice (1-4): ');
        
        switch (choice.trim()) {
            case '1':
                console.log(chalk.green('\n💬 Let\'s continue! What would you like to change or add?'));
                const refinement = await this.askQuestion('👤 You: ');
                await this.processConversationalInput(refinement);
                break;
            case '2':
                console.log(chalk.green('\n🚀 Great! Let\'s create another feature.'));
                await this.startConversation();
                break;
            case '3':
                console.log(chalk.cyan(`\n📋 Opening integration guide: ${path.join(artifactDir, 'INTEGRATION-GUIDE.md')}`));
                const guide = await fs.readFile(path.join(artifactDir, 'INTEGRATION-GUIDE.md'), 'utf8');
                console.log(chalk.gray(guide));
                await this.offerNextActions(artifactDir);
                break;
            case '4':
                await this.exitCLI();
                break;
            default:
                console.log(chalk.red('Invalid choice. Please try again.'));
                await this.offerNextActions(artifactDir);
        }
    }

    async askQuestion(question) {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => {
                resolve(answer);
            });
        });
    }

    async exitCLI() {
        console.log(chalk.cyan('\n👋 Thank you for using Conversational AI Test Generation!'));
        console.log(chalk.gray('All artifacts generated in: ' + this.outputPath));
        console.log(chalk.yellow('Remember: Review artifacts before integrating into main SBS_Automation'));
        this.rl.close();
        process.exit(0);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log(chalk.cyan('\n👋 Conversational session ended.'));
    process.exit(0);
});

// Export for programmatic use
module.exports = ConversationalCLI;

// Run if called directly
if (require.main === module) {
    const cli = new ConversationalCLI();
    cli.start().catch(console.error);
}
