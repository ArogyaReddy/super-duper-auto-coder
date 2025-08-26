#!/usr/bin/env node

/**
 * Deployment Script - Copy Generated Files to Main SBS_Automation
 * 
 * This script copies generated artifacts from auto-coder to main SBS_Automation
 * ensuring proper path references and avoiding file duplication issues.
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class SBSDeploymentManager {
    constructor() {
        this.autoCoderRoot = process.cwd();
        this.mainSBSRoot = path.resolve(this.autoCoderRoot, '../SBS_Automation');
        this.generatedDir = path.join(this.autoCoderRoot, 'SBS_Automation');
        
        this.pathConfig = require('../config/sbs-paths.json');
    }

    async deployGeneratedFiles(options = {}) {
        const { dryRun = false, verbose = false } = options;
        
        console.log(chalk.cyan('🚀 Deploying Generated Files to Main SBS_Automation'));
        console.log(`📂 Source: ${this.generatedDir}`);
        console.log(`📂 Target: ${this.mainSBSRoot}`);
        
        if (dryRun) {
            console.log(chalk.yellow('🔍 DRY RUN MODE - No files will be copied'));
        }
        
        // Validate paths
        await this.validatePaths();
        
        // Deploy each artifact type
        await this.deployFeatures(dryRun, verbose);
        await this.deploySteps(dryRun, verbose);
        await this.deployPages(dryRun, verbose);
        
        console.log(chalk.green('✅ Deployment completed successfully!'));
    }

    async validatePaths() {
        if (!await fs.pathExists(this.mainSBSRoot)) {
            throw new Error(`Main SBS_Automation not found at: ${this.mainSBSRoot}`);
        }
        
        if (!await fs.pathExists(this.generatedDir)) {
            throw new Error(`Generated directory not found at: ${this.generatedDir}`);
        }
        
        console.log(chalk.green('✅ Paths validated'));
    }

    async deployFeatures(dryRun, verbose) {
        const sourceDir = path.join(this.generatedDir, 'features');
        const targetDir = path.join(this.mainSBSRoot, 'features');
        
        if (!await fs.pathExists(sourceDir)) return;
        
        console.log(chalk.cyan('📄 Deploying feature files...'));
        
        const files = await fs.readdir(sourceDir);
        const featureFiles = files.filter(file => file.endsWith('.feature'));
        
        for (const file of featureFiles) {
            const sourceFile = path.join(sourceDir, file);
            const targetFile = path.join(targetDir, file);
            
            if (verbose) {
                console.log(`  📄 ${file} -> ${path.relative(this.autoCoderRoot, targetFile)}`);
            }
            
            if (!dryRun) {
                await fs.copy(sourceFile, targetFile);
            }
        }
        
        console.log(chalk.green(`✅ Deployed ${featureFiles.length} feature files`));
    }

    async deploySteps(dryRun, verbose) {
        const sourceDir = path.join(this.generatedDir, 'steps');
        const targetDir = path.join(this.mainSBSRoot, 'steps');
        
        if (!await fs.pathExists(sourceDir)) return;
        
        console.log(chalk.cyan('🪜 Deploying step definitions...'));
        
        const files = await fs.readdir(sourceDir);
        const stepFiles = files.filter(file => file.endsWith('-steps.js'));
        
        for (const file of stepFiles) {
            const sourceFile = path.join(sourceDir, file);
            const targetFile = path.join(targetDir, file);
            
            if (verbose) {
                console.log(`  🪜 ${file} -> ${path.relative(this.autoCoderRoot, targetFile)}`);
            }
            
            if (!dryRun) {
                await fs.copy(sourceFile, targetFile);
            }
        }
        
        console.log(chalk.green(`✅ Deployed ${stepFiles.length} step definition files`));
    }

    async deployPages(dryRun, verbose) {
        const sourceDir = path.join(this.generatedDir, 'pages');
        const targetDir = path.join(this.mainSBSRoot, 'pages');
        
        if (!await fs.pathExists(sourceDir)) return;
        
        console.log(chalk.cyan('📱 Deploying page objects...'));
        
        const files = await fs.readdir(sourceDir);
        const pageFiles = files.filter(file => file.endsWith('-page.js') && !file.includes('common'));
        
        for (const file of pageFiles) {
            const sourceFile = path.join(sourceDir, file);
            const targetFile = path.join(targetDir, file);
            
            if (verbose) {
                console.log(`  📱 ${file} -> ${path.relative(this.autoCoderRoot, targetFile)}`);
            }
            
            if (!dryRun) {
                await fs.copy(sourceFile, targetFile);
            }
        }
        
        console.log(chalk.green(`✅ Deployed ${pageFiles.length} page object files`));
    }
}

// CLI execution
async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const verbose = args.includes('--verbose');
    
    try {
        const deployer = new SBSDeploymentManager();
        await deployer.deployGeneratedFiles({ dryRun, verbose });
    } catch (error) {
        console.error(chalk.red('❌ Deployment failed:'), error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = SBSDeploymentManager;
