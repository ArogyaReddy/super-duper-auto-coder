#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const { exec } = require('child_process');
const BDDTemplateGeneratorCriticalFix = require('../generators/bdd-template-generator-critical-fix');

class SimpleTemplateManager {
    constructor() {
        this.templatesDir = path.join(__dirname, '../../requirements/templates');
        this.completedTemplatesDir = path.join(__dirname, '../../requirements/templates/completed');
    }

    async runSimpleWizard() {
        console.log('🎯 Template-Driven Generation (Claude Quality)');
        console.log('Simple Template-Based Test Artifact Generator\n');

        try {
            await fs.ensureDir(this.completedTemplatesDir);

            // Get available templates
            const templates = await this.getSimpleTemplates();
            
            if (templates.length === 0) {
                console.log('❌ No templates found in requirements/templates/');
                return;
            }

            // Check command line arguments
            const args = process.argv.slice(3);
            const templateNumber = parseInt(args[0]);

            console.log('📋 Available Templates:\n');
            templates.forEach((template, index) => {
                console.log(`${index + 1}. ${template.displayName}`);
            });

            let selectedTemplate;
            if (templateNumber && templateNumber >= 1 && templateNumber <= templates.length) {
                selectedTemplate = templates[templateNumber - 1];
                console.log(`\n🎯 Auto-selected: ${selectedTemplate.displayName}`);
            } else {
                // Default to template 1 if no valid selection
                selectedTemplate = templates[0];
                console.log(`\n🎯 Using default: ${selectedTemplate.displayName}`);
            }

            // Create and open template
            const templateInfo = await this.createSimpleTemplate(selectedTemplate);
            console.log(`\n✅ Template created: ${templateInfo.fileName}`);
            console.log(`📁 Artifact name: ${templateInfo.artifactName}`);
            
            // Open in VS Code
            await this.openInVSCode(templateInfo.filePath);
            
            console.log('\n📋 NEXT STEPS:');
            console.log('1. Fill out the template with your requirements');
            console.log('2. Save the file (Ctrl+S)');
            console.log('3. Run: node src/templates/simple-template-manager.js generate');
            console.log('\n💡 Template opened in VS Code for editing!');

        } catch (error) {
            console.error('❌ Template wizard error:', error.message);
        }
    }

    async generateFromTemplate() {
        console.log('🚀 Generate Test Artifacts from Completed Template\n');

        try {
            const completedTemplates = await this.getCompletedTemplates();
            
            if (completedTemplates.length === 0) {
                console.log('❌ No completed templates found');
                console.log('💡 Please first create a template using: node src/templates/simple-template-manager.js wizard');
                return;
            }

            // Use the most recent template
            const template = completedTemplates[0];
            console.log(`🔄 Processing: ${template.displayName}`);

            // Read and process template
            const content = await fs.readFile(template.filePath, 'utf8');
            const requirements = this.extractRequirements(content);
            
            console.log('🔍 DEBUG: Extracted requirements:');
            console.log('Title:', requirements?.title);
            console.log('Description:', requirements?.description);
            console.log('User Story:', requirements?.userStory);
            console.log('Acceptance Criteria:', requirements?.acceptanceCriteria);
            console.log('Feature Flags:', requirements?.featureFlags);
            
            if (!requirements || (!requirements.title && !requirements.description)) {
                console.log('❌ Could not extract valid requirements from template');
                console.log('💡 Please ensure the template is properly filled out');
                return;
            }

            console.log('✅ Requirements extracted successfully');
            console.log('🎯 Generating test artifacts...');

            // Generate artifacts
            await this.generateArtifacts(requirements, template);

        } catch (error) {
            console.error('❌ Error generating from template:', error.message);
        }
    }

    async getSimpleTemplates() {
        try {
            const files = await fs.readdir(this.templatesDir);
            const templates = [];

            for (const file of files) {
                if (file.endsWith('.md') && !file.startsWith('bdd-requirement-template') && !file.startsWith('completed')) {
                    const filePath = path.join(this.templatesDir, file);
                    const stats = await fs.stat(filePath);
                    
                    if (stats.isFile()) {
                        templates.push({
                            fileName: file,
                            filePath: filePath,
                            displayName: this.getSimpleDisplayName(file)
                        });
                    }
                }
            }

            return templates.sort((a, b) => a.displayName.localeCompare(b.displayName));
        } catch (error) {
            console.error('Error reading templates:', error.message);
            return [];
        }
    }

    getSimpleDisplayName(fileName) {
        const displayNames = {
            'template-easy-reqs.md': '📝 Easy Requirements Template',
            'template-simplest-reqs.md': '🎯 Simplest Requirements Template', 
            'template-bdd-proper-reqs.md': '🥒 BDD Proper Requirements Template',
            'template-feature-based.md': '🚀 Feature-Based Template',
            'req-template.md': '📋 General Requirements Template',
            'completed-shopping-cart-test.md': '🛒 Example: Shopping Cart (Completed)'
        };

        return displayNames[fileName] || fileName.replace('.md', '').replace(/-/g, ' ');
    }

    async createSimpleTemplate(template) {
        // Create date-based name
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        const hours12 = hours % 12 || 12;
        const hoursFormatted = String(hours12).padStart(2, '0');
        
        const dateBasedName = `req_${year}${month}${day}${hoursFormatted}${minutes}${seconds}${ampm}`;
        const newFileName = `${dateBasedName}.md`;
        const newFilePath = path.join(this.completedTemplatesDir, newFileName);

        // Read template content
        const templateContent = await fs.readFile(template.filePath, 'utf8');
        
        // Add clear instructions
        const instructionsHeader = `<!-- 
📝 TEMPLATE INSTRUCTIONS:
1. Fill out this template with your specific requirements
2. Replace all <placeholder> text with your actual requirements
3. Save the file when done (Ctrl+S)
4. Run: node src/templates/simple-template-manager.js generate
5. Test artifacts will be generated automatically

🎯 Template Type: ${template.displayName}
📅 Created: ${now.toISOString()}
📁 Artifact Name: ${dateBasedName}
💡 Generated files: ${dateBasedName}.feature, ${dateBasedName}-steps.js, ${dateBasedName}-page.js
-->\n\n`;

        const finalContent = instructionsHeader + templateContent;
        await fs.writeFile(newFilePath, finalContent);

        return {
            filePath: newFilePath,
            fileName: newFileName,
            artifactName: dateBasedName,
            templateType: template.displayName
        };
    }

    async openInVSCode(filePath) {
        return new Promise((resolve) => {
            exec(`code "${filePath}"`, (error) => {
                if (error) {
                    console.log('\n⚠️ Could not open VS Code automatically');
                    console.log(`📁 Please manually open: ${filePath}`);
                } else {
                    console.log('✅ Template opened in VS Code');
                }
                resolve();
            });
        });
    }

    async getCompletedTemplates() {
        try {
            const files = await fs.readdir(this.completedTemplatesDir);
            const templates = [];

            for (const file of files) {
                if (file.endsWith('.md')) {
                    const filePath = path.join(this.completedTemplatesDir, file);
                    const stats = await fs.stat(filePath);
                    
                    if (stats.isFile()) {
                        templates.push({
                            fileName: file,
                            filePath: filePath,
                            displayName: file.replace('.md', '').replace(/-/g, ' '),
                            lastModified: stats.mtime
                        });
                    }
                }
            }

            return templates.sort((a, b) => b.lastModified - a.lastModified);
        } catch (error) {
            console.error('Error reading completed templates:', error.message);
            return [];
        }
    }

    extractRequirements(content) {
        try {
            const requirements = {
                title: this.extractBDDField(content, ['title', 'requirement', 'feature']),
                description: this.extractBDDField(content, ['description']),
                userStory: {
                    asA: this.extractBDDField(content, ['as a']),
                    iWant: this.extractBDDField(content, ['i want']),
                    soThat: this.extractBDDField(content, ['so that'])
                },
                acceptanceCriteria: this.extractBDDAcceptanceCriteria(content),
                scenarios: this.extractBDDScenarios(content),
                priority: this.extractBDDField(content, ['priority']) || 'Medium',
                featureFlags: this.extractBDDFeatureFlags(content),
                originalContent: content
            };

            return requirements;
        } catch (error) {
            console.error('Error extracting BDD requirements:', error.message);
            return null;
        }
    }

    extractBDDField(content, fieldNames) {
        for (const fieldName of fieldNames) {
            const patterns = [
                new RegExp(`\\*\\*${fieldName}\\*\\*:?\\s*([^\\n]+)`, 'i'),
                new RegExp(`${fieldName}:?\\s*([^\\n]+)`, 'i'),
                new RegExp(`###?\\s*${fieldName}[^\\n]*\\n([^#\\*]+)`, 'i')
            ];

            for (const pattern of patterns) {
                const match = content.match(pattern);
                if (match && match[1]) {
                    let value = match[1].trim().replace(/^<|>$/g, '').trim();
                    // Clean up pattern artifacts from template
                    value = value.replace(/^\*\*[^*]+\*\*:?\s*or\s*\*\*[^*]+\*\*:?\s*/, '');
                    value = value.replace(/^or\s*\*\*[^*]+\*\*:?\s*/, '');
                    // Remove markdown formatting from extracted values
                    value = value.replace(/^\*\*(.+?)\*\*:?\s*/, '$1');
                    value = value.replace(/^\*(.+?)\*:?\s*/, '$1');
                    return value;
                }
            }
        }
        return null;
    }

    extractBDDAcceptanceCriteria(content) {
        const criteria = [];
        const patterns = [
            /\*\*Acceptance Criteria\*\*:?\s*\n([^#]*?)(?=\n\*\*|$)/i,
            /## .*Acceptance Criteria[^#]*\n([^#]*?)(?=\n##|$)/i
        ];

        for (const pattern of patterns) {
            const match = content.match(pattern);
            if (match && match[1]) {
                const lines = match[1].split('\n')
                    .map(line => line.trim())
                    .filter(line => {
                        return line.length > 0 && 
                               !line.startsWith('<!--') && 
                               !line.startsWith('<') &&
                               line !== '<Acceptance criteria should be written in simple words, not technical jargon>';
                    })
                    .map(line => line.replace(/^[-•]\s*/, '').trim());
                
                criteria.push(...lines);
                break;
            }
        }

        return criteria;
    }

    extractBDDFeatureFlags(content) {
        const flagPattern = /\*\*Feature Flags\*\*:?\s*\n([^#]*?)(?=\n\*\*|$)/i;
        const match = content.match(flagPattern);
        
        if (match && match[1]) {
            const flagLines = match[1].split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0 && 
                        !line.startsWith('<!--') && 
                        !line.startsWith('<'))
                .map(line => line.replace(/^[-•]\s*/, '').trim());
            
            return flagLines;
        }
        
        return [];
    }

    extractBDDScenarios(content) {
        const scenarios = [];
        
        // Match scenarios with structured Given-When-Then-And format
        const scenarioPattern = /### Scenario \d+:\s*(.+?)\n([\s\S]*?)(?=###|$)/gi;
        let match;
        
        while ((match = scenarioPattern.exec(content)) !== null) {
            const scenarioName = match[1].trim();
            const scenarioContent = match[2].trim();
            
            // Skip placeholder scenarios
            if (scenarioName.includes('<') || scenarioName.includes('placeholder')) {
                continue;
            }
            
            // Extract Given, When, Then, And steps
            const givenMatch = scenarioContent.match(/\*\*Given\*\*\s*(.+?)(?=\n\*\*|$)/i);
            const whenMatch = scenarioContent.match(/\*\*When\*\*\s*(.+?)(?=\n\*\*|$)/i);
            const thenMatch = scenarioContent.match(/\*\*Then\*\*\s*(.+?)(?=\n\*\*|$)/i);
            const andMatch = scenarioContent.match(/\*\*And\*\*\s*(.+?)(?=\n\*\*|$)/i);
            
            if (givenMatch && whenMatch && thenMatch) {
                // Skip scenarios with placeholder content
                const given = givenMatch[1].trim();
                const when = whenMatch[1].trim();
                const then = thenMatch[1].trim();
                
                if (given.includes('<') || when.includes('<') || then.includes('<')) {
                    continue;
                }
                
                const scenario = {
                    name: scenarioName,
                    given: given,
                    when: when,
                    then: then,
                    and: andMatch ? andMatch[1].trim() : null
                };
                
                scenarios.push(scenario);
            }
        }

        return scenarios;
    }

    extractScenarios(content) {
        const scenarios = [];
        const scenarioPattern = /### Scenario \d+:([^#]*?)(?=###|$)/gi;
        let match;
        
        while ((match = scenarioPattern.exec(content)) !== null) {
            const scenarioText = match[1].trim();
            const lines = scenarioText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            
            if (lines.length > 0) {
                scenarios.push({
                    name: lines[0].replace(/[:\-\(\)]/g, '').trim(),
                    steps: lines.slice(1).filter(line => !line.startsWith('<!--'))
                });
            }
        }

        return scenarios;
    }

    async generateArtifacts(requirements, template) {
        try {
            const artifactName = this.extractArtifactName(template.fileName);
            
            console.log(`📁 Using artifact name: ${artifactName}`);
            
            // Generate artifacts directly using our BDD format
            await this.generateDirectBDDArtifacts(requirements, artifactName);

        } catch (error) {
            console.error('❌ Error generating artifacts:', error.message);
        }
    }

    async generateDirectBDDArtifacts(requirements, artifactName) {
        try {
            console.log('🚨 Using CRITICAL FIX Generator - Includes And steps and Real methods');
            
            // Use the critical fix generator instead of the old one
            const generator = new BDDTemplateGeneratorCriticalFix();
            
            // Find the template file that was just completed
            const templateFiles = await fs.readdir(this.completedTemplatesDir);
            const latestTemplate = templateFiles
                .filter(file => file.includes(artifactName) && file.endsWith('.md'))
                .sort()
                .pop();
            
            if (!latestTemplate) {
                throw new Error(`Template file not found for ${artifactName}`);
            }
            
            const templatePath = path.join(this.completedTemplatesDir, latestTemplate);
            console.log(`📋 Using template: ${latestTemplate}`);
            
            // Generate using the critical fix generator
            const result = await generator.generateFromBDDTemplate(templatePath);
            
            if (result.success) {
                console.log('\n🎉 SUCCESS! BDD Test artifacts with CRITICAL FIXES generated successfully!\n');
                console.log('📁 Generated Files:');
                console.log(`   ├── 🥒 Feature: ${result.generated.feature.fileName} (WITH And steps)`);
                console.log(`   ├── 🔧 Steps: ${result.generated.steps.fileName} (WITH parameters)`);
                console.log(`   ├── 📄 Page: ${result.generated.page.fileName} (WITH real methods)`);
                console.log(`\n📂 Location: SBS_Automation/`);
                console.log('\n✅ CRITICAL FIXES APPLIED:');
                console.log('   ✅ Missing And steps - FIXED');
                console.log('   ✅ Stub page methods - FIXED with real implementations');
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('❌ Error generating artifacts with critical fix:', error.message);
            console.log('   Falling back to original method...');
            
            // Fallback to original generation method
            await this.generateDirectBDDArtifactsOriginal(requirements, artifactName);
        }
    }

    async generateDirectBDDArtifactsOriginal(requirements, artifactName) {
        try {
            const featureContent = this.generateFeatureFile(requirements);
            const stepsContent = this.generateStepsFile(requirements, artifactName);
            const pageContent = this.generatePageFile(requirements, artifactName);

            // Ensure SBS_Automation directories exist
            const featureDir = path.join(process.cwd(), 'SBS_Automation', 'features');
            const stepsDir = path.join(process.cwd(), 'SBS_Automation', 'steps');
            const pagesDir = path.join(process.cwd(), 'SBS_Automation', 'pages');
            
            await fs.ensureDir(featureDir);
            await fs.ensureDir(stepsDir);
            await fs.ensureDir(pagesDir);

            // Write the files
            await fs.writeFile(path.join(featureDir, `${artifactName}.feature`), featureContent);
            await fs.writeFile(path.join(stepsDir, `${artifactName}-steps.js`), stepsContent);
            await fs.writeFile(path.join(pagesDir, `${artifactName}-page.js`), pageContent);

            console.log('\n🎉 SUCCESS! BDD Test artifacts generated successfully!\n');
            console.log('📁 Generated Files:');
            console.log(`   ├── 🥒 Feature: ${artifactName}.feature`);
            console.log(`   ├── 🔧 Steps: ${artifactName}-steps.js`);
            console.log(`   ├── 📄 Page: ${artifactName}-page.js`);
            console.log(`\n📂 Location: SBS_Automation/`);

        } catch (error) {
            console.error('❌ Error generating direct BDD artifacts:', error.message);
        }
    }

    generateFeatureFile(requirements) {
        let content = '';
        
        // Feature header
        const title = requirements.title || 'Generated Feature';
        content += `Feature: ${title}\n\n`;
        
        // Description
        if (requirements.description) {
            content += `  ${requirements.description}\n\n`;
        }
        
        // User story as feature description
        if (requirements.userStory.asA && requirements.userStory.iWant && requirements.userStory.soThat) {
            content += `  As a ${requirements.userStory.asA}\n`;
            content += `  I want ${requirements.userStory.iWant}\n`;
            content += `  So that ${requirements.userStory.soThat}\n\n`;
        }
        
        // Background
        content += `  Background:\n`;
        content += `    Given I am authenticated as a user\n`;
        content += `    And I am on the application page\n\n`;
        
        // Use structured BDD scenarios if available
        if (requirements.scenarios && requirements.scenarios.length > 0) {
            requirements.scenarios.forEach((scenario) => {
                content += `  Scenario: ${scenario.name}\n`;
                content += `    Given ${scenario.given}\n`;
                content += `    When ${scenario.when}\n`;
                content += `    Then ${scenario.then}\n`;
                
                if (scenario.and) {
                    content += `    And ${scenario.and}\n`;
                }
                content += '\n';
            });
        } else {
            // Fallback to acceptance criteria if no structured scenarios
            if (requirements.acceptanceCriteria && requirements.acceptanceCriteria.length > 0) {
                requirements.acceptanceCriteria.forEach((criteria, index) => {
                    const scenarioName = criteria.replace(/^(User|System)\s+(can|should|must|will)\s+/i, '').trim();
                    content += `  Scenario: ${scenarioName}\n`;
                    
                    if (criteria.toLowerCase().includes('user can')) {
                        content += `    Given I am on the CFC Bundle management page\n`;
                        content += `    When I ${criteria.toLowerCase().replace('user can', '').trim()}\n`;
                        content += `    Then the system should complete the action successfully\n`;
                    } else if (criteria.toLowerCase().includes('system')) {
                        content += `    Given the prerequisite conditions are met\n`;
                        content += `    When the system ${criteria.toLowerCase().replace('system', '').trim()}\n`;
                        content += `    Then the expected result should be achieved\n`;
                    } else {
                        content += `    Given I am on the relevant page\n`;
                        content += `    When ${criteria}\n`;
                        content += `    Then the action should be completed successfully\n`;
                    }
                    content += '\n';
                });
            }
        }
        
        return content;
    }

    generateStepsFile(requirements, artifactName) {
        const className = artifactName.replace(/[-_]/g, '').replace(/\b\w/g, l => l.toUpperCase()) + 'Steps';
        
        let stepsContent = `const { Given, When, Then } = require('@cucumber/cucumber');
const ${className.replace('Steps', 'Page')} = require('../pages/${artifactName}-page');

let page;

// Background steps
Given('I am authenticated as a user', async function () {
    page = new ${className.replace('Steps', 'Page')}(this.driver);
    await page.navigateToLoginPage();
    await page.login();
});

Given('I am on the application page', async function () {
    await page.navigateToApplicationPage();
});

`;

        // Generate steps from structured BDD scenarios
        if (requirements.scenarios && requirements.scenarios.length > 0) {
            const generatedSteps = new Set(); // Avoid duplicate steps
            
            requirements.scenarios.forEach((scenario) => {
                // Generate Given step
                if (!generatedSteps.has(scenario.given)) {
                    stepsContent += `Given('${scenario.given}', async function () {\n`;
                    stepsContent += `    await page.setup_${this.camelCase(scenario.given)}();\n`;
                    stepsContent += `});\n\n`;
                    generatedSteps.add(scenario.given);
                }
                
                // Generate When step
                if (!generatedSteps.has(scenario.when)) {
                    stepsContent += `When('${scenario.when}', async function () {\n`;
                    stepsContent += `    await page.perform_${this.camelCase(scenario.when)}();\n`;
                    stepsContent += `});\n\n`;
                    generatedSteps.add(scenario.when);
                }
                
                // Generate Then step
                if (!generatedSteps.has(scenario.then)) {
                    stepsContent += `Then('${scenario.then}', async function () {\n`;
                    stepsContent += `    await page.verify_${this.camelCase(scenario.then)}();\n`;
                    stepsContent += `});\n\n`;
                    generatedSteps.add(scenario.then);
                }
                
                // Generate And step if present
                if (scenario.and && !generatedSteps.has(scenario.and)) {
                    stepsContent += `Then('${scenario.and}', async function () {\n`;
                    stepsContent += `    await page.verify_${this.camelCase(scenario.and)}();\n`;
                    stepsContent += `});\n\n`;
                    generatedSteps.add(scenario.and);
                }
            });
        } else {
            // Fallback to generic steps if no structured scenarios
            stepsContent += `// Generic fallback steps for acceptance criteria
Given('I am on the relevant page', async function () {
    await page.navigateToRelevantPage();
});

When(/^(.*)$/, async function (action) {
    await page.performAction(action);
});

Then('the action should be completed successfully', async function () {
    await page.verifyActionSuccess();
});
`;
        }

        return stepsContent;
    }
    
    camelCase(str) {
        return str.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ').split(' ')
            .map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');
    }

    generatePageFile(requirements, artifactName) {
        const className = artifactName.replace(/[-_]/g, '').replace(/\b\w/g, l => l.toUpperCase()) + 'Page';
        
        let pageContent = `class ${className} {
    constructor(driver) {
        this.driver = driver;
        
        // Page locators
        this.locators = {
            loginButton: '[data-testid="login-button"]',
            usernameField: '[data-testid="username"]',
            passwordField: '[data-testid="password"]',
            applicationTab: '[data-testid="application-tab"]',
            successMessage: '[data-testid="success-message"]',
            errorMessage: '[data-testid="error-message"]'
        };
    }

    // Navigation methods
    async navigateToLoginPage() {
        await this.driver.get('/login');
    }

    async login() {
        await this.driver.findElement(this.locators.usernameField).sendKeys('testuser');
        await this.driver.findElement(this.locators.passwordField).sendKeys('testpass');
        await this.driver.findElement(this.locators.loginButton).click();
    }

    async navigateToApplicationPage() {
        await this.driver.get('/dashboard');
    }

`;

        // Generate methods from structured BDD scenarios
        if (requirements.scenarios && requirements.scenarios.length > 0) {
            const generatedMethods = new Set(); // Avoid duplicate methods
            
            requirements.scenarios.forEach((scenario) => {
                // Generate setup methods (Given)
                const setupMethod = `setup_${this.camelCase(scenario.given)}`;
                if (!generatedMethods.has(setupMethod)) {
                    pageContent += `    async ${setupMethod}() {\n`;
                    pageContent += `        // Setup: ${scenario.given}\n`;
                    pageContent += `        await this.driver.wait(this.driver.findElement('[data-testid="setup-element"]'), 5000);\n`;
                    pageContent += `    }\n\n`;
                    generatedMethods.add(setupMethod);
                }
                
                // Generate action methods (When)
                const actionMethod = `perform_${this.camelCase(scenario.when)}`;
                if (!generatedMethods.has(actionMethod)) {
                    pageContent += `    async ${actionMethod}() {\n`;
                    pageContent += `        // Action: ${scenario.when}\n`;
                    pageContent += `        await this.driver.findElement('[data-testid="action-button"]').click();\n`;
                    pageContent += `    }\n\n`;
                    generatedMethods.add(actionMethod);
                }
                
                // Generate verification methods (Then)
                const verifyMethod = `verify_${this.camelCase(scenario.then)}`;
                if (!generatedMethods.has(verifyMethod)) {
                    pageContent += `    async ${verifyMethod}() {\n`;
                    pageContent += `        // Verify: ${scenario.then}\n`;
                    pageContent += `        const element = await this.driver.findElement(this.locators.successMessage);\n`;
                    pageContent += `        return element.isDisplayed();\n`;
                    pageContent += `    }\n\n`;
                    generatedMethods.add(verifyMethod);
                }
                
                // Generate And verification methods if present
                if (scenario.and) {
                    const andMethod = `verify_${this.camelCase(scenario.and)}`;
                    if (!generatedMethods.has(andMethod)) {
                        pageContent += `    async ${andMethod}() {\n`;
                        pageContent += `        // Additional verification: ${scenario.and}\n`;
                        pageContent += `        const element = await this.driver.findElement('[data-testid="additional-verification"]');\n`;
                        pageContent += `        return element.isDisplayed();\n`;
                        pageContent += `    }\n\n`;
                        generatedMethods.add(andMethod);
                    }
                }
            });
        } else {
            // Fallback methods
            pageContent += `    async navigateToRelevantPage() {
        await this.driver.get('/relevant-page');
    }

    async performAction(action) {
        // Generic action performer
        await this.driver.findElement('[data-testid="generic-action"]').click();
    }

    async verifyActionSuccess() {
        const success = await this.driver.findElement(this.locators.successMessage);
        return success.isDisplayed();
    }
`;
        }

        pageContent += `}

module.exports = ${className};
`;

        return pageContent;
    }

    extractArtifactName(fileName) {
        const match = fileName.match(/^(req_\d{12}[ap]m)/);
        if (match) {
            return match[1];
        }
        return fileName.replace('.md', '').replace(/[^a-zA-Z0-9_-]/g, '_');
    }

    formatRequirementsForAutoCoder(requirements) {
        let formatted = '';

        // Feature title
        if (requirements.title) {
            formatted += `Feature: ${requirements.title}\n\n`;
        }

        // Description
        if (requirements.description) {
            formatted += `${requirements.description}\n\n`;
        }

        // User Story - proper BDD format
        if (requirements.userStory.asA && requirements.userStory.iWant && requirements.userStory.soThat) {
            formatted += `As a ${requirements.userStory.asA}\n`;
            formatted += `I want ${requirements.userStory.iWant}\n`;
            formatted += `So that ${requirements.userStory.soThat}\n\n`;
        }

        // Feature Flags
        if (requirements.featureFlags && requirements.featureFlags.length > 0) {
            formatted += 'Feature Flags:\n';
            requirements.featureFlags.forEach(flag => {
                formatted += `${flag}\n`;
            });
            formatted += '\n';
        }

        // Acceptance Criteria converted to scenarios
        if (requirements.acceptanceCriteria && requirements.acceptanceCriteria.length > 0) {
            formatted += 'Scenarios:\n\n';
            requirements.acceptanceCriteria.forEach((criteria, index) => {
                const scenarioName = criteria.replace(/^(User|System)\s+(can|should|must|will)\s+/i, '').trim();
                formatted += `Scenario: ${scenarioName}\n`;
                
                if (criteria.toLowerCase().includes('user can')) {
                    formatted += `  Given I am on the CFC Bundle management page\n`;
                    formatted += `  When I ${criteria.toLowerCase().replace('user can', '').trim()}\n`;
                    formatted += `  Then the system should complete the action successfully\n`;
                } else if (criteria.toLowerCase().includes('system')) {
                    formatted += `  Given the prerequisite conditions are met\n`;
                    formatted += `  When the system ${criteria.toLowerCase().replace('system', '').trim()}\n`;
                    formatted += `  Then the expected result should be achieved\n`;
                } else {
                    formatted += `  Given the user is authenticated\n`;
                    formatted += `  When ${criteria}\n`;
                    formatted += `  Then the action should be completed successfully\n`;
                }
                formatted += '\n';
            });
        }

        // Add default scenarios if none exist
        if (!requirements.acceptanceCriteria || requirements.acceptanceCriteria.length === 0) {
            formatted += 'Scenarios:\n\n';
            formatted += `Scenario: ${requirements.title || 'Main functionality'}\n`;
            formatted += `  Given I am authenticated as a user\n`;
            formatted += `  When I access the feature\n`;
            formatted += `  Then the feature should work as expected\n\n`;
        }

        return formatted;
    }
}

// CLI handling
const args = process.argv.slice(2);
const command = args[0];

if (command === 'wizard') {
    const manager = new SimpleTemplateManager();
    manager.runSimpleWizard().catch(console.error);
} else if (command === 'generate') {
    const manager = new SimpleTemplateManager();
    manager.generateFromTemplate().catch(console.error);
} else {
    console.log('🎯 Simple Template-Driven Generation');
    console.log('Usage:');
    console.log('  node simple-template-manager.js wizard [1-5]  - Create template (1=Simplest, 2=Easy, etc.)');
    console.log('  node simple-template-manager.js generate      - Generate from most recent template');
    console.log('\nExample:');
    console.log('  node simple-template-manager.js wizard 1     - Use Simplest Requirements Template');
}

module.exports = SimpleTemplateManager;
