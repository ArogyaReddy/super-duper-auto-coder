/**
 * 🎯 INTELLIGENT CLI - FIXES ALL CRITICAL ISSUES
 * 
 * INTEGRATES WITH INTELLIGENT REQUIREMENTS GENERATOR
 * Provides proper file naming, intelligent analysis, and real execution
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const IntelligentRequirementsGenerator = require('../generators/intelligent-requirements-generator');

class IntelligentCLI {
    constructor() {
        this.generator = new IntelligentRequirementsGenerator();
        this.sbsAutomationPath = path.join(process.cwd(), 'SBS_Automation');
    }

    async start() {
/**
 * 🎯 INTELLIGENT CLI - FIXES ALL CRITICAL ISSUES
 * 
 * INTEGRATES WITH INTELLIGENT REQUIREMENTS GENERATOR
 * Provides proper file naming, intelligent analysis, and real execution
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const IntelligentRequirementsGenerator = require('../generators/intelligent-requirements-generator');

class IntelligentCLI {
    constructor() {
        this.generator = new IntelligentRequirementsGenerator();
        this.sbsAutomationPath = path.join(process.cwd(), 'SBS_Automation');
    }

    async start() {
        console.log(`
🎯 ===================================================
   INTELLIGENT AUTO-CODER CLI - CRITICAL FIXES
🎯 ===================================================

🚨 CRITICAL PRODUCTION RULES - MANDATORY ENFORCEMENT:

1. LOCATOR STANDARDS: Prefer By.css() with single quotes; avoid By.xpath() unless necessary
2. PARAMETERIZATION: Use parameterized locators for dynamic elements referenced in feature files  
3. CLEAN METHODS: No unused parameters in page methods
4. EXISTING METHODS ONLY: Only use methods that exist in main SBS_Automation BasePage (no waitForPageLoad())
5. PROPER CONSTRUCTORS: No locators in constructor, always call super(page)

✅ Fixed Issues:
   1. Proper file naming from requirements
   2. Intelligent content analysis
   3. Real page methods generation
   4. Dynamic steps with meaningful names
   5. Working execution infrastructure

📍 Working Directory: ${process.cwd()}
📍 SBS_Automation Path: ${this.sbsAutomationPath}
        `);

        await this.showMainMenu();
    }

    async showMainMenu() {
        console.log(`
🚀 MAIN MENU - Select Option:

1. 📋 Generate from Text Requirements (FIXED)
2. 🧪 Run Generated Tests (FIXED)
3. 🧹 Cleanup Generated Artifacts
4. 📊 Show Generated Artifacts Status
5. ❌ Exit

Select execution type (1-5): `);

        const choice = await this.getUserInput();
        await this.handleMainMenuChoice(choice);
    }

    async handleMainMenuChoice(choice) {
        switch (choice) {
            case '1':
                await this.generateFromRequirements();
                break;
            case '2':
                await this.runGeneratedTests();
                break;
            case '3':
                await this.cleanupArtifacts();
                break;
            case '4':
                await this.showArtifactsStatus();
                break;
            case '5':
                console.log('👋 Goodbye!');
                process.exit(0);
                break;
            default:
                console.log('❌ Invalid option. Please try again.');
                await this.showMainMenu();
        }
    }

    /**
     * CRITICAL FIX: Generate from requirements with intelligent analysis
     */
    async generateFromRequirements() {
        console.log(`
📋 SELECT REQUIREMENT FILE TO PROCESS

Available requirement files (newest first):
        `);

        const requirementFiles = this.findRequirementFiles();
        
        if (requirementFiles.length === 0) {
            console.log('❌ No requirement files found in requirements/text/');
            await this.backToMainMenu();
            return;
        }

        requirementFiles.forEach((file, index) => {
            console.log(`${index + 1}. 📄 ${file.name} (${file.size} bytes)`);
        });
        
        console.log(`${requirementFiles.length + 1}. 🔙 Back to Main Menu`);
        console.log(`\nSelect requirement to process (1-${requirementFiles.length + 1}): `);

        const choice = await this.getUserInput();
        const choiceNum = parseInt(choice);

        if (choiceNum === requirementFiles.length + 1) {
            await this.showMainMenu();
            return;
        }

        if (choiceNum >= 1 && choiceNum <= requirementFiles.length) {
            const selectedFile = requirementFiles[choiceNum - 1];
            await this.processRequirementFile(selectedFile.path);
        } else {
            console.log('❌ Invalid selection. Please try again.');
            await this.generateFromRequirements();
        }
    }

    async processRequirementFile(requirementFilePath) {
        console.log(`\n🚀 PROCESSING REQUIREMENT FILE: ${requirementFilePath}`);
        
        try {
            const result = await this.generator.generateFromRequirementFile(requirementFilePath);
            
            if (result.success) {
                console.log(`
✅ INTELLIGENT GENERATION COMPLETED!

📁 Generated Files:
   • Feature: ${result.generated.feature.fileName}
   • Steps:   ${result.generated.steps.fileName}
   • Page:    ${result.generated.page.fileName}

🧠 Analysis Summary:
   • Title: ${result.analysis.title}
   • Domain: ${result.analysis.domain}
   • Scenarios: ${result.analysis.scenarios.length}
   • Entities: ${result.analysis.entities.length}
   • Actions: ${result.analysis.actions.length}

🎯 Files are ready to run with proper naming and real implementations!
                `);
                
                await this.offerTestExecution(result.baseName);
            } else {
                console.log(`❌ Generation failed: ${result.error}`);
            }
        } catch (error) {
            console.log(`❌ Error processing requirement: ${error.message}`);
        }

        await this.backToMainMenu();
    }

    async offerTestExecution(baseName) {
        console.log(`\n🧪 Would you like to run the generated tests now?`);
        console.log(`1. ✅ Yes, run tests for ${baseName}`);
        console.log(`2. ❌ No, back to main menu`);
        console.log(`\nSelect option (1-2): `);

        const choice = await this.getUserInput();
        if (choice === '1') {
            await this.runSpecificTest(baseName);
        }
    }

    /**
     * CRITICAL FIX: Proper test execution with correct paths
     */
    async runGeneratedTests() {
        console.log(`
🧪 SELECT FEATURE FILE TO RUN

Available feature files (newest first):
        `);

        const featureFiles = this.findGeneratedFeatures();
        
        if (featureFiles.length === 0) {
            console.log('❌ No generated feature files found');
            await this.backToMainMenu();
            return;
        }

        featureFiles.forEach((file, index) => {
            console.log(`${index + 1}. 📄 ${file.name}`);
        });
        
        console.log(`${featureFiles.length + 1}. 🔙 Back to Execute Menu`);
        console.log(`\nSelect feature to run (1-${featureFiles.length + 1}): `);

        const choice = await this.getUserInput();
        const choiceNum = parseInt(choice);

        if (choiceNum === featureFiles.length + 1) {
            await this.showMainMenu();
            return;
        }

        if (choiceNum >= 1 && choiceNum <= featureFiles.length) {
            const selectedFile = featureFiles[choiceNum - 1];
            const baseName = path.basename(selectedFile.name, '.feature');
            await this.runSpecificTest(baseName);
        } else {
            console.log('❌ Invalid selection. Please try again.');
            await this.runGeneratedTests();
        }
    }

    async runSpecificTest(baseName) {
        console.log(`\n🚀 Running feature: ${baseName}.feature`);
        
        // CRITICAL FIX: Use correct path and execution
        const featurePath = path.join(this.sbsAutomationPath, 'features', `${baseName}.feature`);
        
        if (!fs.existsSync(featurePath)) {
            console.log(`❌ Feature file not found: ${featurePath}`);
            await this.backToMainMenu();
            return;
        }

        try {
            // Execute from SBS_Automation directory with proper paths
            const result = await this.executeFeatureTest(featurePath);
            
            if (result.success) {
                console.log(`✅ 🧪 Tests executed successfully`);
                console.log(`\n📋 Test Results:`);
                console.log(result.output);
            } else {
                console.log(`❌ Test execution failed`);
                console.log(`Error: ${result.error}`);
                console.log(`Output: ${result.output}`);
            }
        } catch (error) {
            console.log(`❌ Execution error: ${error.message}`);
        }

        await this.offerNextAction();
    }

    async executeFeatureTest(featurePath) {
        return new Promise((resolve) => {
            const cmd = 'npx';
            const args = [
                'cucumber-js',
                featurePath,
                '--require', path.join(this.sbsAutomationPath, 'steps'),
                '--require', path.join(this.sbsAutomationPath, 'support'),
                '--format', 'progress-bar'
            ];

            console.log(`🔧 Executing: ${cmd} ${args.join(' ')}`);
            console.log(`📍 Working Directory: ${this.sbsAutomationPath}`);

            const cucumberProcess = spawn(cmd, args, {
                cwd: this.sbsAutomationPath,
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true
            });

            let output = '';
            let errorOutput = '';

            cucumberProcess.stdout.on('data', (data) => {
                const text = data.toString();
                output += text;
                process.stdout.write(text);
            });

            cucumberProcess.stderr.on('data', (data) => {
                const text = data.toString();
                errorOutput += text;
                process.stderr.write(text);
            });

            cucumberProcess.on('close', (code) => {
                resolve({
                    success: code === 0,
                    output: output,
                    error: errorOutput,
                    exitCode: code
                });
            });

            cucumberProcess.on('error', (error) => {
                resolve({
                    success: false,
                    output: output,
                    error: error.message,
                    exitCode: -1
                });
            });
        });
    }

    async offerNextAction() {
        console.log(`\nWhat would you like to do next?`);
        console.log(`1. 🔙 Back to Main Menu`);
        console.log(`2. ❌ Exit`);
        console.log(`\nEnter your choice (1-2): `);

        const choice = await this.getUserInput();
        if (choice === '2') {
            console.log('👋 Goodbye!');
            process.exit(0);
        } else {
            await this.showMainMenu();
        }
    }

    async cleanupArtifacts() {
        console.log(`\n🧹 CLEANUP GENERATED ARTIFACTS`);
        
        const artifacts = this.findAllGeneratedArtifacts();
        
        if (artifacts.length === 0) {
            console.log('✅ No artifacts to clean up');
            await this.backToMainMenu();
            return;
        }

        console.log(`\n📋 Found ${artifacts.length} generated artifacts:`);
        artifacts.forEach((artifact, index) => {
            console.log(`${index + 1}. ${artifact.type}: ${artifact.name}`);
        });

        console.log(`\n⚠️  Are you sure you want to delete all these artifacts?`);
        console.log(`1. ✅ Yes, delete all`);
        console.log(`2. ❌ No, cancel`);
        console.log(`\nSelect option (1-2): `);

        const choice = await this.getUserInput();
        
        if (choice === '1') {
            let deletedCount = 0;
            artifacts.forEach(artifact => {
                try {
                    fs.unlinkSync(artifact.path);
                    console.log(`🗑️  Deleted: ${artifact.name}`);
                    deletedCount++;
                } catch (error) {
                    console.log(`❌ Failed to delete ${artifact.name}: ${error.message}`);
                }
            });
            
            console.log(`\n✅ Cleanup complete: ${deletedCount} artifacts deleted`);
        } else {
            console.log('❌ Cleanup cancelled');
        }

        await this.backToMainMenu();
    }

    async showArtifactsStatus() {
        console.log(`\n📊 GENERATED ARTIFACTS STATUS`);
        
        const features = this.findGeneratedFeatures();
        const steps = this.findGeneratedSteps();
        const pages = this.findGeneratedPages();

        console.log(`\n📋 Summary:`);
        console.log(`   Features: ${features.length}`);
        console.log(`   Steps:    ${steps.length}`);
        console.log(`   Pages:    ${pages.length}`);

        if (features.length > 0) {
            console.log(`\n📄 Feature Files:`);
            features.forEach((file, index) => {
                console.log(`   ${index + 1}. ${file.name} (${file.size} bytes)`);
            });
        }

        if (steps.length > 0) {
            console.log(`\n🔧 Step Files:`);
            steps.forEach((file, index) => {
                console.log(`   ${index + 1}. ${file.name} (${file.size} bytes)`);
            });
        }

        if (pages.length > 0) {
            console.log(`\n📄 Page Files:`);
            pages.forEach((file, index) => {
                console.log(`   ${index + 1}. ${file.name} (${file.size} bytes)`);
            });
        }

        await this.backToMainMenu();
    }

    // Utility methods
    findRequirementFiles() {
        const requirementsDir = path.join(process.cwd(), 'requirements', 'text');
        
        if (!fs.existsSync(requirementsDir)) {
            return [];
        }

        return fs.readdirSync(requirementsDir)
            .filter(file => file.endsWith('.txt'))
            .map(file => {
                const filePath = path.join(requirementsDir, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    path: filePath,
                    size: stats.size,
                    modified: stats.mtime
                };
            })
            .sort((a, b) => b.modified - a.modified);
    }

    findGeneratedFeatures() {
        const featuresDir = path.join(this.sbsAutomationPath, 'features');
        
        if (!fs.existsSync(featuresDir)) {
            return [];
        }

        return fs.readdirSync(featuresDir)
            .filter(file => file.endsWith('.feature'))
            .map(file => {
                const filePath = path.join(featuresDir, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    path: filePath,
                    size: stats.size,
                    modified: stats.mtime
                };
            })
            .sort((a, b) => b.modified - a.modified);
    }

    findGeneratedSteps() {
        const stepsDir = path.join(this.sbsAutomationPath, 'steps');
        
        if (!fs.existsSync(stepsDir)) {
            return [];
        }

        return fs.readdirSync(stepsDir)
            .filter(file => file.endsWith('-steps.js'))
            .map(file => {
                const filePath = path.join(stepsDir, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    path: filePath,
                    size: stats.size,
                    modified: stats.mtime
                };
            })
            .sort((a, b) => b.modified - a.modified);
    }

    findGeneratedPages() {
        const pagesDir = path.join(this.sbsAutomationPath, 'pages');
        
        if (!fs.existsSync(pagesDir)) {
            return [];
        }

        return fs.readdirSync(pagesDir)
            .filter(file => file.endsWith('-page.js') && file !== 'base-page.js')
            .map(file => {
                const filePath = path.join(pagesDir, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    path: filePath,
                    size: stats.size,
                    modified: stats.mtime
                };
            })
            .sort((a, b) => b.modified - a.modified);
    }

    findAllGeneratedArtifacts() {
        const artifacts = [];
        
        this.findGeneratedFeatures().forEach(file => {
            artifacts.push({ ...file, type: 'Feature' });
        });
        
        this.findGeneratedSteps().forEach(file => {
            artifacts.push({ ...file, type: 'Steps' });
        });
        
        this.findGeneratedPages().forEach(file => {
            artifacts.push({ ...file, type: 'Page' });
        });
        
        return artifacts.sort((a, b) => b.modified - a.modified);
    }

    async getUserInput() {
        return new Promise((resolve) => {
            process.stdin.once('data', (data) => {
                resolve(data.toString().trim());
            });
        });
    }

    async backToMainMenu() {
        console.log(`\nPress Enter to continue...`);
        await this.getUserInput();
        await this.showMainMenu();
    }
}

// Export and auto-start if run directly
module.exports = IntelligentCLI;

if (require.main === module) {
    const cli = new IntelligentCLI();
    cli.start().catch(error => {
        console.error('❌ CLI Error:', error.message);
        process.exit(1);
    });
}
