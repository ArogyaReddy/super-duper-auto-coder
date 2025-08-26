#!/usr/bin/env node

/**
 * 🔗 Symlink Integration Setup Script
 * Creates intelligent symlink integration between Auto-Coder and main SBS_Automation
 * 
 * Strategy:
 * - Generated artifacts stay in auto-coder/SBS_Automation/
 * - Shared resources (data, support, config) symlinked FROM main SBS
 * - Main SBS links TO generated artifacts for unified execution
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class SymlinkIntegrator {
    constructor() {
        this.autoCoderPath = path.resolve(__dirname, '..');
        this.mainSBSPath = path.resolve(__dirname, '../..', 'SBS_Automation');
        this.generatedSBSPath = path.join(this.autoCoderPath, 'SBS_Automation');
        
        console.log(chalk.blue('🔗 Symlink Integration Setup'));
        console.log(chalk.gray(`Auto-Coder: ${this.autoCoderPath}`));
        console.log(chalk.gray(`Main SBS: ${this.mainSBSPath}`));
        console.log(chalk.gray(`Generated: ${this.generatedSBSPath}\n`));
    }

    async setup() {
        try {
            await this.validatePaths();
            await this.createSharedResourceSymlinks();
            await this.createGeneratedArtifactSymlinks();
            await this.createExecutionSymlinks();
            await this.validateIntegration();
            
            console.log(chalk.green('\n✅ Symlink integration setup complete!'));
            console.log(chalk.blue('🎯 You can now execute tests from main SBS_Automation with generated artifacts included.'));
            
        } catch (error) {
            console.error(chalk.red('\n❌ Integration setup failed:'), error.message);
            process.exit(1);
        }
    }

    async validatePaths() {
        console.log(chalk.blue('📋 Validating paths...'));
        
        if (!await fs.pathExists(this.mainSBSPath)) {
            throw new Error(`Main SBS_Automation not found at: ${this.mainSBSPath}`);
        }
        
        if (!await fs.pathExists(this.generatedSBSPath)) {
            await fs.ensureDir(this.generatedSBSPath);
            console.log(chalk.yellow(`Created generated SBS directory: ${this.generatedSBSPath}`));
        }
        
        console.log(chalk.green('✅ Paths validated'));
    }

    async createSharedResourceSymlinks() {
        console.log(chalk.blue('\n🔗 Creating shared resource symlinks...'));
        
        const sharedResources = [
            { name: 'data', required: true },
            { name: 'support', required: true },
            { name: 'hooks', required: false },
            { name: 'config', source: 'web.config.json', required: false },
            { name: 'playwright.config.js', required: false },
            { name: 'package.json', required: false }
        ];

        for (const resource of sharedResources) {
            const sourcePath = path.join(this.mainSBSPath, resource.source || resource.name);
            const targetPath = path.join(this.generatedSBSPath, resource.name);
            
            if (await fs.pathExists(sourcePath)) {
                await this.createSymlink(sourcePath, targetPath, `📁 ${resource.name}`);
            } else if (resource.required) {
                console.log(chalk.yellow(`⚠️ Required resource missing: ${resource.name}`));
            }
        }
    }

    async createGeneratedArtifactSymlinks() {
        console.log(chalk.blue('\n🔗 Creating generated artifact symlinks in main SBS...'));
        
        const artifactTypes = ['features', 'steps', 'pages'];
        
        for (const artifactType of artifactTypes) {
            const sourcePath = path.join(this.generatedSBSPath, artifactType);
            const targetPath = path.join(this.mainSBSPath, artifactType, 'auto-generated');
            
            // Ensure source directory exists
            await fs.ensureDir(sourcePath);
            
            // Create symlink in main SBS
            await this.createSymlink(sourcePath, targetPath, `🎯 ${artifactType}/auto-generated`);
        }
    }

    async createExecutionSymlinks() {
        console.log(chalk.blue('\n🔗 Creating execution convenience symlinks...'));
        
        // Create reverse symlink for easy access to main SBS from auto-coder
        const mainSBSSymlink = path.join(this.autoCoderPath, 'main-sbs-automation');
        await this.createSymlink(this.mainSBSPath, mainSBSSymlink, '🔄 main-sbs-automation');
    }

    async createSymlink(sourcePath, targetPath, description = '') {
        try {
            // Remove existing symlink or file
            if (await fs.pathExists(targetPath)) {
                const stats = await fs.lstat(targetPath);
                if (stats.isSymbolicLink()) {
                    await fs.unlink(targetPath);
                    console.log(chalk.yellow(`🗑️ Removed existing symlink: ${targetPath}`));
                } else {
                    console.log(chalk.yellow(`⚠️ File exists (not a symlink): ${targetPath}`));
                    return;
                }
            }
            
            // Ensure parent directory exists
            await fs.ensureDir(path.dirname(targetPath));
            
            // Create the symlink
            await fs.symlink(sourcePath, targetPath);
            console.log(chalk.green(`✅ ${description || 'Symlink created'}: ${targetPath} -> ${sourcePath}`));
            
        } catch (error) {
            if (error.code === 'EPERM') {
                console.log(chalk.red(`❌ Permission denied creating symlink: ${targetPath}`));
                console.log(chalk.yellow('💡 Try running as administrator on Windows or check file permissions'));
            } else {
                console.log(chalk.red(`❌ Failed to create symlink: ${error.message}`));
            }
        }
    }

    async validateIntegration() {
        console.log(chalk.blue('\n🔍 Validating integration...'));
        
        const validations = [
            {
                path: path.join(this.generatedSBSPath, 'data'),
                description: 'Shared data access'
            },
            {
                path: path.join(this.generatedSBSPath, 'support'),
                description: 'Shared support infrastructure'
            },
            {
                path: path.join(this.mainSBSPath, 'features', 'auto-generated'),
                description: 'Generated features in main SBS'
            },
            {
                path: path.join(this.mainSBSPath, 'steps', 'auto-generated'),
                description: 'Generated steps in main SBS'
            }
        ];

        let validationsPassed = 0;
        for (const validation of validations) {
            if (await fs.pathExists(validation.path)) {
                const stats = await fs.lstat(validation.path);
                if (stats.isSymbolicLink()) {
                    console.log(chalk.green(`✅ ${validation.description}`));
                    validationsPassed++;
                } else {
                    console.log(chalk.yellow(`⚠️ ${validation.description} (not a symlink)`));
                }
            } else {
                console.log(chalk.red(`❌ ${validation.description} (missing)`));
            }
        }

        if (validationsPassed >= 2) {
            console.log(chalk.green(`\n🎉 Integration validated! ${validationsPassed}/${validations.length} checks passed.`));
        } else {
            console.log(chalk.yellow(`\n⚠️ Partial integration: ${validationsPassed}/${validations.length} checks passed.`));
        }
    }

    async showUsageInstructions() {
        console.log(chalk.blue('\n📚 Usage Instructions:'));
        console.log(chalk.cyan('🔧 Generate artifacts in auto-coder:'));
        console.log(chalk.gray('   npm run generate:mcp -- --url https://example.com --name dashboard'));
        console.log(chalk.cyan('\n🚀 Execute tests from main SBS_Automation:'));
        console.log(chalk.gray('   cd ../../../SBS_Automation'));
        console.log(chalk.gray('   npx cucumber-js features/ --require steps/ --require support/'));
        console.log(chalk.cyan('\n🎯 Run only generated artifacts:'));
        console.log(chalk.gray('   npx cucumber-js features/auto-generated/ --require steps/auto-generated/ --require support/'));
    }
}

// CLI execution
if (require.main === module) {
    const integrator = new SymlinkIntegrator();
    integrator.setup()
        .then(() => integrator.showUsageInstructions())
        .catch(console.error);
}

module.exports = SymlinkIntegrator;
