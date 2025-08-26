#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const { exec } = require('child_process');

class WorkingTemplateSystem {
    constructor() {
        this.templatesDir = path.join(__dirname, '../../requirements/templates');
        this.completedDir = path.join(__dirname, '../../requirements/templates/completed');
    }

    async startWizard() {
        console.log('\n🎯 SIMPLE TEMPLATE WIZARD');
        console.log('===========================\n');

        // Ensure completed directory exists
        await fs.ensureDir(this.completedDir);

        // Show template options
        console.log('📋 Available Templates:\n');
        console.log('1. 🎯 Simplest Template - Just title and description');
        console.log('2. 📝 Easy Template - Basic user story format');  
        console.log('3. 🥒 BDD Proper Template - Full BDD structure');
        console.log('4. 🚀 Feature Template - Feature-driven approach');
        
        // Check if template number provided as argument
        const args = process.argv.slice(2);
        let templateChoice = null;
        
        if (args.length > 1) {
            templateChoice = parseInt(args[1]);
        }

        if (!templateChoice || templateChoice < 1 || templateChoice > 4) {
            templateChoice = 1; // Default to simplest
            console.log('\n🎯 Using default: Simplest Template');
        } else {
            console.log(`\n🎯 Selected: Template ${templateChoice}`);
        }

        await this.createAndOpenTemplate(templateChoice);
    }

    async createAndOpenTemplate(choice) {
        try {
            // Map choice to template file
            const templateFiles = {
                1: 'template-simplest-reqs.md',
                2: 'template-easy-reqs.md', 
                3: 'template-bdd-proper-reqs.md',
                4: 'template-feature-based.md'
            };

            const templateFile = templateFiles[choice];
            const templatePath = path.join(this.templatesDir, templateFile);

            // Check if template exists
            if (!await fs.pathExists(templatePath)) {
                console.log(`❌ Template not found: ${templateFile}`);
                return;
            }

            // Create date-based filename
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
            
            const timestamp = `${year}${month}${day}${hoursFormatted}${minutes}${seconds}${ampm}`;
            const newFileName = `req_${timestamp}.md`;
            const newFilePath = path.join(this.completedDir, newFileName);

            // Read template content
            const templateContent = await fs.readFile(templatePath, 'utf8');
            
            // Add instructions header
            const instructions = `<!--
🎯 TEMPLATE INSTRUCTIONS - PLEASE READ!
=============================================

📝 HOW TO USE:
1. Fill out this template with your specific requirements
2. Replace all <placeholder> text with your actual requirements  
3. Save the file when done (Ctrl+S)
4. Go back to auto-coder CLI and select option 2: "Generate from Completed Template"

🔧 TEMPLATE INFO:
📅 Created: ${now.toLocaleString()}
📁 Artifact Name: req_${timestamp}
💡 Generated files will be: 
   - req_${timestamp}.feature
   - req_${timestamp}-steps.js  
   - req_${timestamp}-page.js

🚀 NEXT STEPS:
After filling out this template:
1. Save this file (Ctrl+S)
2. Return to auto-coder CLI
3. Select: Template-Driven Generation > Generate from Completed Template
4. Your test artifacts will be generated automatically!

⚠️ IMPORTANT: Make sure to replace ALL <placeholder> text!
-->

${templateContent}`;

            // Write the new template file
            await fs.writeFile(newFilePath, instructions);

            console.log(`\n✅ Template created successfully!`);
            console.log(`📁 File: ${newFileName}`);
            console.log(`📂 Location: requirements/templates/completed/`);
            
            // Try to open in VS Code
            console.log('\n🚀 Opening template in VS Code...');
            await this.openInVSCode(newFilePath);

            console.log('\n📋 NEXT STEPS:');
            console.log('1. Fill out the template with your requirements');
            console.log('2. Save the file (Ctrl+S)');
            console.log('3. Return to auto-coder CLI'); 
            console.log('4. Select: Template-Driven Generation > Generate from Completed Template');
            console.log('\n💡 Template is now open in VS Code for editing!');

        } catch (error) {
            console.error('❌ Error creating template:', error.message);
        }
    }

    async openInVSCode(filePath) {
        return new Promise((resolve) => {
            exec(`code "${filePath}"`, (error) => {
                if (error) {
                    console.log('⚠️ Could not auto-open VS Code');
                    console.log(`📁 Please manually open: ${filePath}`);
                } else {
                    console.log('✅ Template opened in VS Code');
                }
                resolve();
            });
        });
    }

    async generateFromTemplate() {
        console.log('\n🚀 GENERATE FROM COMPLETED TEMPLATE');
        console.log('=====================================\n');

        try {
            // Find completed templates
            const completedFiles = await fs.readdir(this.completedDir);
            const templateFiles = completedFiles.filter(file => 
                file.endsWith('.md') && file.startsWith('req_')
            );

            if (templateFiles.length === 0) {
                console.log('❌ No completed templates found!');
                console.log('💡 Please first create a template using the Template Wizard');
                return;
            }

            // Sort by modification time (most recent first)
            const templatesWithStats = await Promise.all(
                templateFiles.map(async (file) => {
                    const filePath = path.join(this.completedDir, file);
                    const stats = await fs.stat(filePath);
                    return { file, filePath, mtime: stats.mtime };
                })
            );

            templatesWithStats.sort((a, b) => b.mtime - a.mtime);
            const mostRecentTemplate = templatesWithStats[0];

            console.log(`🔄 Using most recent template: ${mostRecentTemplate.file}`);
            
            // Read template content
            const content = await fs.readFile(mostRecentTemplate.filePath, 'utf8');
            
            // Check if template is filled out
            if (content.includes('<') && content.includes('>')) {
                console.log('⚠️ Template still contains placeholder text!');
                console.log('💡 Please complete the template first, then try again');
                return;
            }

            console.log('✅ Template appears to be completed');
            console.log('🎯 Processing requirements...');

            // Extract artifact name from filename
            const artifactName = path.basename(mostRecentTemplate.file, '.md');
            
            // Create formatted requirements for auto-coder
            const formattedReqs = this.formatRequirements(content, artifactName);
            
            // Create temporary requirements file
            const tempReqFile = path.join(this.completedDir, `${artifactName}.txt`);
            await fs.writeFile(tempReqFile, formattedReqs);

            console.log('🔧 Generating test artifacts...');

            // Call auto-coder to generate artifacts
            const AutoCoder = require('../auto-coder');
            const autoCoder = new AutoCoder();
            const result = await autoCoder.generateFromFile(tempReqFile);

            if (result.success) {
                console.log('\n🎉 SUCCESS! Test artifacts generated!');
                console.log('\n📁 Generated Files:');
                console.log(`   ├── 🥒 ${artifactName}.feature`);
                console.log(`   ├── 🔧 ${artifactName}-steps.js`); 
                console.log(`   ├── 📄 ${artifactName}-page.js`);
                console.log(`   └── 📊 ${artifactName}-summary.json`);
                console.log('\n📂 Location: SBS_Automation/');
            } else {
                console.log('❌ Generation failed:', result.error);
            }

            // Clean up temp file
            await fs.remove(tempReqFile);

        } catch (error) {
            console.error('❌ Error generating from template:', error.message);
        }
    }

    formatRequirements(content, artifactName) {
        // Extract title and description for basic formatting
        const titleMatch = content.match(/\*\*Title:\*\*\s*([^\n]+)/i);
        const descMatch = content.match(/\*\*Description:\*\*\s*([^\n]+)/i);
        
        let formatted = '';
        
        if (titleMatch) {
            formatted += `Feature: ${titleMatch[1].trim()}\n\n`;
        }
        
        if (descMatch) {
            formatted += `${descMatch[1].trim()}\n\n`;
        }
        
        // Add the full content for more detailed parsing
        formatted += content;
        
        return formatted;
    }
}

// Handle command line execution
const args = process.argv.slice(2);
const command = args[0];

const templateSystem = new WorkingTemplateSystem();

if (command === 'wizard') {
    templateSystem.startWizard().catch(console.error);
} else if (command === 'generate') {
    templateSystem.generateFromTemplate().catch(console.error);
} else {
    console.log('\n🎯 WORKING TEMPLATE SYSTEM');
    console.log('Usage:');
    console.log('  node working-template-system.js wizard [1-4]  - Create template');
    console.log('  node working-template-system.js generate      - Generate artifacts');
    console.log('\nExamples:');
    console.log('  node working-template-system.js wizard 1     - Simplest template');
    console.log('  node working-template-system.js wizard 2     - Easy template');
    console.log('  node working-template-system.js wizard 3     - BDD template');
}

module.exports = WorkingTemplateSystem;
