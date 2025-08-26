/**
 * 🎯 BDD TEMPLATE CLI INTEGRATION
 * 
 * Handles Template-Driven Generation workflow:
 * 1. Create BDD Template
 * 2. Open in VS Code for user editing
 * 3. Generate artifacts from completed template
 * 4. Validate generated artifacts
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const BDDTemplateGeneratorCriticalFix = require('../generators/bdd-template-generator-critical-fix');

class BDDTemplateCLI {
    constructor() {
        this.generator = new BDDTemplateGeneratorCriticalFix();
        this.templatesPath = 'requirements/templates';
        this.completedPath = 'requirements/templates/completed';
    }

    /**
     * Create simple BDD template and open in VS Code
     */
    async createBDDTemplate(customName = null) {
        try {
            console.log(`\n🧙 Starting BDD Template Wizard...`);
            console.log(`📋 Creating clean BDD template for requirements entry`);
            
            // Generate compact timestamp: YYMMDDHHMMSS
            const now = new Date();
            const timestamp = [
                now.getFullYear().toString().slice(-2), // YY
                (now.getMonth() + 1).toString().padStart(2, '0'), // MM
                now.getDate().toString().padStart(2, '0'), // DD
                now.getHours().toString().padStart(2, '0'), // HH
                now.getMinutes().toString().padStart(2, '0'), // MM
                now.getSeconds().toString().padStart(2, '0') // SS
            ].join('');
            
            // Use custom name if provided, otherwise use default with timestamp
            let templateName;
            if (customName && customName.trim()) {
                // Clean the custom name (remove spaces, special chars)
                const cleanName = customName.trim()
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
                templateName = `${cleanName}.md`;
            } else {
                templateName = `bdd-req-${timestamp}.md`;
            }
            
            const templatePath = path.join(this.templatesPath, templateName);
            
            // Create simple, clean BDD template
            const templateContent = this.createCleanBDDTemplate(timestamp, customName);
            
            // Ensure directory exists
            if (!fs.existsSync(this.templatesPath)) {
                fs.mkdirSync(this.templatesPath, { recursive: true });
            }
            
            fs.writeFileSync(templatePath, templateContent);
            
            console.log(`✅ BDD Template created: ${templatePath}`);
            if (customName) {
                console.log(`📝 Using custom name: ${customName}`);
            }
            console.log(`\n📝 NEXT STEPS:`);
            console.log(`1. Template will open in VS Code automatically`);
            console.log(`2. Fill in your requirements using Given-When-Then format`);
            console.log(`3. Save the file (Ctrl+S)`);
            console.log(`4. Return to CLI and select 'Generate Artifacts from Template'`);
            
            // Open in VS Code
            await this.openInVSCode(templatePath);
            
            return {
                success: true,
                templatePath,
                templateName,
                customName: customName || null,
                message: 'Template created and opened in VS Code'
            };
            
        } catch (error) {
            console.error(`❌ Template creation failed:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate artifacts from completed BDD template
     */
    async generateFromTemplate(templatePath, customName = null) {
        try {
            console.log(`\n🚀 Generating artifacts from BDD template...`);
            
            if (!fs.existsSync(templatePath)) {
                throw new Error(`Template not found: ${templatePath}`);
            }
            
            // Extract base name for artifacts generation
            let baseName;
            if (customName && customName.trim()) {
                // Use custom name for artifacts
                baseName = customName.trim()
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
            } else {
                // Extract from template filename
                const templateFileName = path.basename(templatePath, '.md');
                baseName = templateFileName.replace(/^bdd-req-/, '');
            }
            
            console.log(`📝 Using artifact base name: ${baseName}`);
            
            // Generate artifacts using BDD Template Generator with custom name
            const result = await this.generator.generateFromBDDTemplate(templatePath, baseName);
            
            if (result.success) {
                // ✅ PRESERVE TEMPLATE - Do not move to completed folder
                // This allows reuse of templates for future requirements
                console.log(`📁 Template preserved for future use: ${templatePath}`);
                
                console.log(`\n🎉 GENERATION SUCCESSFUL!`);
                console.log(`📁 Generated Files:`);
                console.log(`   Feature: ${result.generated.feature.fileName}`);
                console.log(`   Steps: ${result.generated.steps.fileName}`);
                console.log(`   Page: ${result.generated.page.fileName}`);
                
                console.log(`\n📋 Artifact Details:`);
                console.log(`   Base Name: ${baseName}`);
                console.log(`   Template Source: ${path.basename(templatePath)}`);
                console.log(`   Template Preserved: ✅ Yes (reusable)`);
                
                return {
                    ...result,
                    baseName,
                    templatePreserved: true,
                    templatePath
                };
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            console.error(`❌ Generation failed:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * List available templates for generation
     */
    listAvailableTemplates() {
        try {
            const templates = [];
            
            // Check templates directory
            if (fs.existsSync(this.templatesPath)) {
                const files = fs.readdirSync(this.templatesPath);
                files.forEach(file => {
                    if (file.endsWith('.md') && !file.startsWith('template-')) {
                        const filePath = path.join(this.templatesPath, file);
                        const stats = fs.statSync(filePath);
                        templates.push({
                            name: file,
                            path: filePath,
                            modified: stats.mtime.toISOString(),
                            size: stats.size
                        });
                    }
                });
            }
            
            // Check completed directory
            if (fs.existsSync(this.completedPath)) {
                const files = fs.readdirSync(this.completedPath);
                files.forEach(file => {
                    if (file.endsWith('.md')) {
                        const filePath = path.join(this.completedPath, file);
                        const stats = fs.statSync(filePath);
                        templates.push({
                            name: file + ' (completed)',
                            path: filePath,
                            modified: stats.mtime.toISOString(),
                            size: stats.size
                        });
                    }
                });
            }
            
            return templates.sort((a, b) => new Date(b.modified) - new Date(a.modified));
            
        } catch (error) {
            console.error(`❌ Error listing templates:`, error);
            return [];
        }
    }

    /**
     * Validate generated artifacts
     */
    async validateGenerated(result) {
        try {
            console.log(`\n🔍 Validating generated artifacts...`);
            
            const validations = [];
            
            // Check if files exist
            if (fs.existsSync(result.generated.feature.path)) {
                validations.push({ file: 'Feature', status: '✅ Exists' });
            } else {
                validations.push({ file: 'Feature', status: '❌ Missing' });
            }
            
            if (fs.existsSync(result.generated.steps.path)) {
                validations.push({ file: 'Steps', status: '✅ Exists' });
            } else {
                validations.push({ file: 'Steps', status: '❌ Missing' });
            }
            
            if (fs.existsSync(result.generated.page.path)) {
                validations.push({ file: 'Page', status: '✅ Exists' });
            } else {
                validations.push({ file: 'Page', status: '❌ Missing' });
            }
            
            // Check for syntax errors using content-based validation (not require)
            try {
                const stepsPath = path.resolve(result.generated.steps.path);
                const stepsContent = fs.readFileSync(stepsPath, 'utf8');
                
                // Basic syntax validation without requiring the file
                if (stepsContent.includes('const') && 
                    stepsContent.includes('require') &&
                    stepsContent.includes('Given(') && 
                    stepsContent.includes('When(') && 
                    stepsContent.includes('Then(')) {
                    validations.push({ file: 'Steps Syntax', status: '✅ Valid' });
                } else {
                    validations.push({ file: 'Steps Syntax', status: '❌ Missing BDD steps' });
                }
            } catch (error) {
                validations.push({ file: 'Steps Syntax', status: '❌ Error: ' + error.message });
            }
            
            try {
                const pagePath = path.resolve(result.generated.page.path);
                const pageContent = fs.readFileSync(pagePath, 'utf8');
                
                // Basic syntax validation without requiring the file
                if (pageContent.includes('class') && 
                    pageContent.includes('module.exports') &&
                    pageContent.includes('constructor')) {
                    validations.push({ file: 'Page Syntax', status: '✅ Valid' });
                } else {
                    validations.push({ file: 'Page Syntax', status: '❌ Invalid class structure' });
                }
            } catch (error) {
                validations.push({ file: 'Page Syntax', status: '❌ Error: ' + error.message });
            }
            
            console.log(`\n📋 Validation Results:`);
            validations.forEach(v => {
                console.log(`   ${v.file}: ${v.status}`);
            });
            
            return validations;
            
        } catch (error) {
            console.error(`❌ Validation failed:`, error);
            return [];
        }
    }

    // ========== HELPER METHODS ==========

    createCleanBDDTemplate(timestamp, customName = null) {
        const displayName = customName || `bdd-req-${timestamp}`;
        
        return `<!-- 
🎯 BDD TEMPLATE - Requirements Entry
📅 Created: ${new Date().toISOString()}
📝 Template Name: ${displayName}
📋 Instructions:
   1. Fill in your requirements below
   2. Replace all <placeholder> text with actual requirements
   3. Use clear Given-When-Then-And format
   4. Save file when done (Ctrl+S)
   5. Return to CLI to generate artifacts

🚀 This template will generate:
   - Feature file (${displayName}.feature)
   - Steps file (${displayName}-steps.js) 
   - Page file (${displayName}-page.js)

💡 Template will be preserved for future reuse
-->

# Requirement Entry

## 📝 Basic Information

**Feature Title**: <Enter your feature name>

**Description**: <Brief description of what this feature does>

## 👤 User Story

**As a** <type of user>
**I want** <some goal or functionality>
**So that** <some reason or benefit>

## 🥒 BDD Scenarios

### Scenario 1: <Scenario Name>
**Given** <starting condition or context>
**When** <action performed or trigger>
**Then** <expected outcome or result>
**And** <additional verification if needed>

### Scenario 2: <Scenario Name>
**Given** <starting condition or context>
**When** <action performed or trigger>
**Then** <expected outcome or result>
**And** <additional verification if needed>

### Scenario 3: <Additional scenario if needed>
**Given** <starting condition or context>
**When** <action performed or trigger>
**Then** <expected outcome or result>
**And** <additional verification if needed>

## 🚩 Feature Flags (Optional)
**Feature Flags**: <None or specify flags needed>

---
📋 **Template Status**: Ready for completion
🎯 **Next Step**: Fill in requirements above and return to CLI
`;
    }

    async openInVSCode(filePath) {
        return new Promise((resolve, reject) => {
            const command = `code "${filePath}"`;
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.log(`⚠️  Could not open VS Code automatically`);
                    console.log(`📂 Template location: ${filePath}`);
                    resolve(false);
                } else {
                    console.log(`📝 Template opened in VS Code`);
                    resolve(true);
                }
            });
        });
    }

    async moveToCompleted(templatePath) {
        try {
            const fileName = path.basename(templatePath);
            const completedPath = path.join(this.completedPath, fileName);
            
            // Ensure completed directory exists
            if (!fs.existsSync(this.completedPath)) {
                fs.mkdirSync(this.completedPath, { recursive: true });
            }
            
            // Move file
            fs.renameSync(templatePath, completedPath);
            console.log(`📁 Template moved to completed: ${completedPath}`);
            
        } catch (error) {
            console.log(`⚠️  Could not move template: ${error.message}`);
        }
    }
}

module.exports = BDDTemplateCLI;
