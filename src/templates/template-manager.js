#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const { exec } = require('child_process');

class TemplateManager {
    constructor() {
        this.templatesDir = path.join(__dirname, '../../requirements/templates');
        this.completedTemplatesDir = path.join(__dirname, '../../requirements/templates/completed');
    }

    async runWizard() {
        console.log('🎯 Template-Driven Generation (Claude Quality)');
        console.log('Interactive Template-Based Test Artifact Generator\n');

        console.log('🚨 CRITICAL PRODUCTION RULES - MANDATORY ENFORCEMENT:');
        console.log('1. LOCATOR STANDARDS: Prefer By.css() with single quotes; avoid By.xpath() unless necessary');
        console.log('2. PARAMETERIZATION: Use parameterized locators for dynamic elements referenced in feature files');
        console.log('3. CLEAN METHODS: No unused parameters in page methods');
        console.log('4. EXISTING METHODS ONLY: Only use methods that exist in main SBS_Automation BasePage (no waitForPageLoad())');
        console.log('5. PROPER CONSTRUCTORS: No locators in constructor, always call super(page)\n');

        try {
            // Ensure completed templates directory exists
            await fs.ensureDir(this.completedTemplatesDir);

            // Check if template number is provided as argument
            const args = process.argv.slice(3);
            const templateNumber = parseInt(args[0]);

            // Get available simple templates
            const templates = await this.getAvailableTemplates();
            
            if (templates.length === 0) {
                console.log('❌ No templates found in requirements/templates/');
                return;
            }

            // If template number provided, use it directly
            if (templateNumber && templateNumber >= 1 && templateNumber <= templates.length) {
                const selectedTemplate = templates[templateNumber - 1];
                console.log(`🎯 Auto-selected: ${selectedTemplate.displayName}`);
                await this.processSelectedTemplate(selectedTemplate);
                return;
            }

            // Otherwise show selection menu
            await this.showTemplateSelection(templates);

        } catch (error) {
            console.error('❌ Template wizard error:', error.message);
            process.exit(1);
        }
    }

    async showTemplateSelection(templates) {
        console.log('📋 STEP 1: Choose Your Template Type\n');
        
        console.log('Available Templates:');
        templates.forEach((template, index) => {
            console.log(`${index + 1}. ${template.displayName}`);
        });
        console.log(`${templates.length + 1}. 🔙 Back to Main Menu\n`);

        console.log('💡 Usage Options:');
        console.log('1. Run with template number: node src/templates/template-manager.js wizard 1');
        console.log('2. Interactive mode: Enter your selection below\n');

        try {
            const answer = await this.getInput(`Select template type (1-${templates.length + 1}): `);
            const selection = parseInt(answer.trim());
            
            if (selection === templates.length + 1) {
                console.log('Returning to main menu...');
                return;
            }
            
            if (selection < 1 || selection > templates.length) {
                console.log('❌ Invalid selection. Please try again.\n');
                return await this.showTemplateSelection(templates);
            }

            const selectedTemplate = templates[selection - 1];
            await this.processSelectedTemplate(selectedTemplate);
        } catch (error) {
            console.log('\n❌ Input error. Using template 1 by default...');
            await this.processSelectedTemplate(templates[0]);
        }
    }

    async processSelectedTemplate(template) {
        console.log(`\n✅ Selected: ${template.displayName}`);
        console.log('📝 Creating your requirements template...\n');

        // Create the template file
        const templateInfo = await this.createTemplateFile(template);
        
        console.log('🎯 STEP 2: Fill Out Your Requirements\n');
        console.log(`📁 Template file: ${templateInfo.fileName}`);
        console.log(`📁 Artifact name: ${templateInfo.artifactName}`);
        console.log('\n📝 Opening template in VS Code...');
        
        // Open in VS Code
        await this.openInVSCode(templateInfo.filePath);
        
        // Interactive menu for next steps
        await this.showTemplateCompletionMenu(templateInfo);
    }

    async showTemplateCompletionMenu(templateInfo) {
        console.log('\n🎯 STEP 3: What would you like to do next?\n');
        
        const choices = [
            '✅ I\'m done - Generate test artifacts now',
            '📝 Edit the template again',
            '👀 Preview my requirements',
            '🔄 Start over with a different template',
            '❌ Cancel and return to main menu'
        ];

        choices.forEach((choice, index) => {
            console.log(`${index + 1}. ${choice}`);
        });

        console.log('\n💡 Usage Options:');
        console.log('1. Run with choice number: node src/templates/template-manager.js generate');
        console.log('2. Interactive mode: Enter your selection below\n');

        try {
            const answer = await this.getInput('\nSelect your choice (1-5): ');
            const choice = parseInt(answer.trim());

            switch (choice) {
                case 1:
                    await this.generateFromTemplate(templateInfo);
                    break;
                case 2:
                    console.log('\n📝 Reopening template in VS Code...');
                    await this.openInVSCode(templateInfo.filePath);
                    await this.showTemplateCompletionMenu(templateInfo);
                    break;
                case 3:
                    await this.previewRequirements(templateInfo);
                    await this.showTemplateCompletionMenu(templateInfo);
                    break;
                case 4:
                    await this.showTemplateSelection();
                    break;
                case 5:
                    console.log('👋 Returning to main menu...');
                    return;
                default:
                    console.log('❌ Invalid choice. Generating artifacts by default...');
                    await this.generateFromTemplate(templateInfo);
            }
        } catch (error) {
            console.log('\n❌ Input error. Generating artifacts by default...');
            await this.generateFromTemplate(templateInfo);
        }
    }

    async createTemplateFile(template) {
        // Create a new copy of the template with YYMMDDHHMMSS naming to match BDD CLI
        const now = new Date();
        const timestamp = [
            now.getFullYear().toString().slice(-2), // YY
            (now.getMonth() + 1).toString().padStart(2, '0'), // MM
            now.getDate().toString().padStart(2, '0'), // DD
            now.getHours().toString().padStart(2, '0'), // HH
            now.getMinutes().toString().padStart(2, '0'), // MM
            now.getSeconds().toString().padStart(2, '0') // SS
        ].join('');
        
        const dateBasedName = `bdd-req-${timestamp}`;
        const newFileName = `${dateBasedName}.md`;
        const newFilePath = path.join(this.completedTemplatesDir, newFileName);

        // Copy template content
        const templateContent = await fs.readFile(template.filePath, 'utf8');
        
        // Add enhanced instructions at the top
        const instructionsHeader = `<!-- 
📝 TEMPLATE INSTRUCTIONS:
1. Fill out this template with your specific requirements
2. Replace all <placeholder> text with your actual requirements
3. Save the file when done (Ctrl+S)
4. Return to the auto-coder CLI
5. Select "I'm done - Generate test artifacts now"

🎯 Template Type: ${template.displayName}
📅 Created: ${now.toISOString()}
📁 Artifact Name: ${dateBasedName}
💡 Generated files will be named: ${dateBasedName}.feature, ${dateBasedName}-steps.js, ${dateBasedName}-page.js
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

    async previewRequirements(templateInfo) {
        console.log('\n👀 PREVIEW: Your Current Requirements\n');
        console.log('─'.repeat(60));
        
        try {
            const content = await fs.readFile(templateInfo.filePath, 'utf8');
            
            // Remove the comment header for preview
            const contentWithoutComments = content.replace(/<!--[\s\S]*?-->/g, '').trim();
            
            // Show first 500 characters
            const preview = contentWithoutComments.substring(0, 500);
            console.log(preview);
            
            if (contentWithoutComments.length > 500) {
                console.log('\n... (content truncated)');
            }
            
        } catch (error) {
            console.log('❌ Could not read template file');
        }
        
        console.log('\n─'.repeat(60));
        
        const continueAnswer = await this.getInput('\nPress Enter to continue...');
    }

    async generateFromTemplate(templateInfo) {
        console.log('\n🚀 STEP 4: Generating Test Artifacts\n');
        console.log('📖 Reading your requirements...');

        try {
            // Read the completed template
            const content = await fs.readFile(templateInfo.filePath, 'utf8');
            
            // Check if template is properly filled out
            if (content.includes('<') && content.includes('>')) {
                console.log('⚠️  Warning: Template still contains placeholder text (<...>)');
                const continueAnswer = await this.getInput('Continue anyway? (y/N): ');
                if (continueAnswer.toLowerCase() !== 'y') {
                    console.log('📝 Please complete the template first.');
                    await this.showTemplateCompletionMenu(templateInfo);
                    return;
                }
            }
            
            // Extract requirements from the template
            const requirements = this.extractRequirements(content);
            
            if (!requirements) {
                console.log('❌ Could not extract valid requirements from template');
                console.log('💡 Please ensure the template is properly filled out');
                await this.showTemplateCompletionMenu(templateInfo);
                return;
            }

            console.log('✅ Requirements extracted successfully');
            console.log('🎯 Generating test artifacts...');

            // Generate artifacts using the auto-coder framework
            await this.generateArtifactsWithProgress(requirements, templateInfo);
            
            // Show completion menu
            await this.showCompletionMenu(templateInfo);

        } catch (error) {
            console.error('❌ Error processing template:', error.message);
            await this.showTemplateCompletionMenu(templateInfo);
        }
    }

    async generateArtifactsWithProgress(requirements, templateInfo) {
        try {
            const artifactName = templateInfo.artifactName;
            
            // Create a temporary requirements file for the auto-coder to process
            const tempReqFile = path.join(this.completedTemplatesDir, `${artifactName}.txt`);
            
            // Format requirements for auto-coder processing
            const formattedRequirements = this.formatRequirementsForAutoCoder(requirements);
            await fs.writeFile(tempReqFile, formattedRequirements);

            console.log('📝 Processing requirements...');
            console.log(`📁 Artifact name: ${artifactName}`);

            // Use working MinimalCucumberAdapter instead of broken AutoCoder
            const MinimalCucumberAdapter = require('../adapters/minimal-cucumber-adapter');
            const adapter = new MinimalCucumberAdapter();
            await adapter.initialize();
            
            const result = await adapter.generateArtifacts({
                requirement: formattedRequirements,
                outputDir: './SBS_Automation',
                templateContext: {
                    sourceFile: tempReqFile,
                    requirementText: formattedRequirements,
                    outputDir: './SBS_Automation'
                }
            });
            
            if (result.files) {
                console.log('\n🎉 SUCCESS! Test artifacts generated successfully!\n');
                console.log('📁 Generated Files:');
                console.log(`   ├── 🥒 Feature: ${path.basename(result.files.feature)}`);
                console.log(`   ├── 🔧 Steps: ${path.basename(result.files.steps)}`);
                console.log(`   ├── 📄 Page: ${path.basename(result.files.page)}`);
                console.log(`\n📂 Location: SBS_Automation/`);
                console.log('\n✅ Ready to run with: npm run test:features');
            } else {
                console.log('\n❌ Artifact generation failed');
                console.log('Error: No files generated');
            }

            // Clean up temp file
            await fs.remove(tempReqFile);

        } catch (error) {
            console.error('\n❌ Error generating artifacts:', error.message);
        }
    }

    async showCompletionMenu(templateInfo) {
        console.log('\n🎯 What would you like to do next?\n');
        
        const choices = [
            '🚀 Run the generated tests',
            '📁 Open generated files in VS Code',
            '📝 Create another template',
            '🔙 Return to main menu',
            '❌ Exit'
        ];

        choices.forEach((choice, index) => {
            console.log(`${index + 1}. ${choice}`);
        });

        const answer = await this.getInput('\nSelect your choice (1-5): ');
        const choice = parseInt(answer.trim());

        switch (choice) {
            case 1:
                console.log('🚀 Opening test execution menu...');
                console.log('💡 Use the main CLI to run your generated tests!');
                await this.showCompletionMenu(templateInfo);
                break;
            case 2:
                await this.openGeneratedFiles(templateInfo);
                await this.showCompletionMenu(templateInfo);
                break;
            case 3:
                await this.showTemplateSelection();
                break;
            case 4:
                console.log('🔙 Returning to main menu...');
                return;
            case 5:
                console.log('👋 Thank you for using the Template-Driven Generator!');
                process.exit(0);
                break;
            default:
                console.log('❌ Invalid choice. Please try again.\n');
                await this.showCompletionMenu(templateInfo);
        }
    }

    async openGeneratedFiles(templateInfo) {
        console.log('\n📁 Opening generated files in VS Code...');
        
        const basePath = path.join(__dirname, '../../SBS_Automation');
        const files = [
            path.join(basePath, 'features', `${templateInfo.artifactName}.feature`),
            path.join(basePath, 'steps', `${templateInfo.artifactName}-steps.js`),
            path.join(basePath, 'pages', `${templateInfo.artifactName}-page.js`)
        ];

        for (const file of files) {
            if (await fs.pathExists(file)) {
                await this.openInVSCode(file);
            }
        }
        
        console.log('✅ Generated files opened in VS Code');
    }

    // Helper method for getting user input
    getInput(prompt) {
        return new Promise((resolve) => {
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            rl.question(prompt, (answer) => {
                rl.close();
                resolve(answer);
            });
        });
    }

    async getAvailableTemplates() {
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
                            displayName: this.getDisplayName(file)
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

    getDisplayName(fileName) {
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

    async openInVSCode(filePath) {
        return new Promise((resolve, reject) => {
            exec(`code "${filePath}"`, (error) => {
                if (error) {
                    console.log('\n⚠️ Could not open VS Code automatically');
                    console.log(`📁 Please manually open: ${filePath}`);
                } else {
                    console.log('✅ Opened in VS Code');
                }
                resolve();
            });
        });
    }

    // Legacy methods for backward compatibility
    async generateFromCompletedTemplate() {
        console.log('🚀 Generate Test Artifacts from Completed Template');
        console.log('This will process your completed template and generate high-quality test artifacts\n');

        try {
            const completedTemplates = await this.getCompletedTemplates();
            
            if (completedTemplates.length === 0) {
                console.log('❌ No completed templates found');
                console.log('💡 Please first create a template using the Template Wizard');
                return;
            }

            console.log('Available Completed Templates:');
            completedTemplates.forEach((template, index) => {
                const date = template.lastModified.toLocaleDateString();
                const time = template.lastModified.toLocaleTimeString();
                console.log(`${index + 1}. ${template.displayName} (${date} ${time})`);
            });

            const answer = await this.getInput(`\nSelect template (1-${completedTemplates.length}): `);
            const selection = parseInt(answer.trim());
            
            if (selection < 1 || selection > completedTemplates.length) {
                console.log('❌ Invalid selection');
                return;
            }

            await this.processTemplate(completedTemplates[selection - 1]);

        } catch (error) {
            console.error('❌ Error generating from template:', error.message);
        }
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

    async processTemplate(template) {
        console.log(`\n🔄 Processing: ${template.displayName}`);
        console.log('📖 Reading template content...');

        try {
            const content = await fs.readFile(template.filePath, 'utf8');
            const requirements = this.extractRequirements(content);
            
            if (!requirements) {
                console.log('❌ Could not extract valid requirements from template');
                return;
            }

            console.log('✅ Requirements extracted successfully');
            console.log('🎯 Generating test artifacts...');

            await this.generateArtifacts(requirements, template);

        } catch (error) {
            console.error('❌ Error processing template:', error.message);
        }
    }

    extractRequirements(content) {
        try {
            const requirements = {
                title: this.extractField(content, ['title', 'feature name', 'requirement']),
                description: this.extractField(content, ['description', 'what are you testing']),
                userStory: {
                    asA: this.extractField(content, ['as a']),
                    iWant: this.extractField(content, ['i want']),
                    soThat: this.extractField(content, ['so that'])
                },
                acceptanceCriteria: this.extractAcceptanceCriteria(content),
                scenarios: this.extractScenarios(content),
                featureFlags: this.extractField(content, ['feature flags']),
                priority: this.extractField(content, ['priority']) || 'Medium',
                originalContent: content
            };

            if (!requirements.title && !requirements.description) {
                return null;
            }

            return requirements;
        } catch (error) {
            console.error('Error extracting requirements:', error.message);
            return null;
        }
    }

    extractField(content, fieldNames) {
        for (const fieldName of fieldNames) {
            const patterns = [
                new RegExp(`\\*\\*${fieldName}\\*\\*:?\\s*([^\\n]+)`, 'i'),
                new RegExp(`${fieldName}:?\\s*([^\\n]+)`, 'i'),
                new RegExp(`###?\\s*${fieldName}[^\\n]*\\n([^#]+)`, 'i')
            ];

            for (const pattern of patterns) {
                const match = content.match(pattern);
                if (match && match[1]) {
                    return match[1].trim().replace(/^<|>$/g, '').trim();
                }
            }
        }
        return null;
    }

    extractAcceptanceCriteria(content) {
        const criteria = [];
        const patterns = [
            /\*\*Acceptance Criteria\*\*:?\s*\n([^#]*)/i,
            /## Acceptance Criteria[^#]*\n([^#]*)/i
        ];

        for (const pattern of patterns) {
            const match = content.match(pattern);
            if (match && match[1]) {
                const lines = match[1].split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0 && !line.startsWith('<!--'));
                
                criteria.push(...lines);
                break;
            }
        }

        return criteria;
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
            const tempReqFile = path.join(this.completedTemplatesDir, `${artifactName}.txt`);
            
            const formattedRequirements = this.formatRequirementsForAutoCoder(requirements);
            await fs.writeFile(tempReqFile, formattedRequirements);

            console.log(`📁 Using artifact name: ${artifactName}`);

            const AutoCoder = require('../auto-coder');
            const autoCoder = new AutoCoder();
            const result = await autoCoder.generateFromFile(tempReqFile);
            
            if (result.success) {
                console.log('✅ Test artifacts generated successfully!');
                console.log(`📁 Generated: ${artifactName}.feature, ${artifactName}-steps.js, ${artifactName}-page.js`);
            } else {
                console.log('❌ Artifact generation failed:', result.error);
            }

            await fs.remove(tempReqFile);

        } catch (error) {
            console.error('❌ Error generating artifacts:', error.message);
        }
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

        if (requirements.title) {
            formatted += `Feature: ${requirements.title}\n\n`;
        }

        if (requirements.description) {
            formatted += `${requirements.description}\n\n`;
        }

        if (requirements.userStory.asA || requirements.userStory.iWant || requirements.userStory.soThat) {
            formatted += 'User Story:\n';
            if (requirements.userStory.asA) {
                formatted += `As a ${requirements.userStory.asA}\n`;
            }
            if (requirements.userStory.iWant) {
                formatted += `I want ${requirements.userStory.iWant}\n`;
            }
            if (requirements.userStory.soThat) {
                formatted += `So that ${requirements.userStory.soThat}\n`;
            }
            formatted += '\n';
        }

        if (requirements.acceptanceCriteria && requirements.acceptanceCriteria.length > 0) {
            formatted += 'Acceptance Criteria:\n';
            requirements.acceptanceCriteria.forEach(criteria => {
                formatted += `• ${criteria}\n`;
            });
            formatted += '\n';
        }

        if (requirements.scenarios && requirements.scenarios.length > 0) {
            formatted += 'Test Scenarios:\n\n';
            requirements.scenarios.forEach((scenario, index) => {
                formatted += `Scenario: ${scenario.name}\n`;
                scenario.steps.forEach(step => {
                    const cleanStep = step.trim();
                    if (cleanStep.toLowerCase().startsWith('given') || 
                        cleanStep.toLowerCase().startsWith('when') || 
                        cleanStep.toLowerCase().startsWith('then') ||
                        cleanStep.toLowerCase().startsWith('and')) {
                        formatted += `  ${cleanStep}\n`;
                    } else {
                        formatted += `  Given ${cleanStep}\n`;
                    }
                });
                formatted += '\n';
            });
        }

        return formatted;
    }
}

// CLI handling
const args = process.argv.slice(2);
const command = args[0];

if (command === 'wizard') {
    const manager = new TemplateManager();
    manager.runWizard().catch(console.error);
} else if (command === 'generate') {
    const manager = new TemplateManager();
    manager.generateFromCompletedTemplate().catch(console.error);
} else {
    console.log('🎯 Template-Driven Generation');
    console.log('Usage:');
    console.log('  node template-manager.js wizard    - Start interactive template wizard');
    console.log('  node template-manager.js generate  - Generate from completed template');
}

module.exports = TemplateManager;
