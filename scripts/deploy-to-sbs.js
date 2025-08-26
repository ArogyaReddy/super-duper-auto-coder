#!/usr/bin/env node

/**
 * SBS_Automation Deployment Script
 * Moves generated test artifacts from auto-coder/SBS_Automation to actual SBS_Automation
 * ONE SCRIPT TO DEPLOY EVERYTHING!
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class SBSDeploymentManager {
    constructor() {
        this.autoCoderSBSPath = path.join(process.cwd(), 'SBS_Automation');
        this.targetSBSPath = path.resolve(process.cwd(), '..', 'SBS_Automation');
        this.deploymentReport = {
            featuresDeployed: 0,
            stepsDeployed: 0,
            pagesDeployed: 0,
            dataDeployed: 0,
            configsDeployed: 0,
            skipped: 0
        };
    }

    async deployToSBS(options = {}) {
        const { dryRun = false, backup = false, verbose = false } = options;  // Changed default backup to false
        
        console.log(chalk.blue.bold('🚀 SBS_Automation Deployment Tool'));
        console.log(chalk.gray('Moving generated artifacts to actual SBS_Automation framework\n'));

        if (dryRun) {
            console.log(chalk.yellow('🔍 DRY RUN MODE - No files will be moved\n'));
        }

        try {
            // Validate paths
            await this.validatePaths();
            
            // Create backup if explicitly requested
            if (backup && !dryRun) {
                console.log(chalk.yellow('⚠️  Creating backup as requested...'));
                await this.createBackup();
            }
            
            // Deploy artifacts
            await this.deployFeatures(dryRun, verbose);
            await this.deploySteps(dryRun, verbose);
            await this.deployPages(dryRun, verbose);
            await this.deployData(dryRun, verbose);
            await this.deployConfigs(dryRun, verbose);
            
            this.showDeploymentSummary(dryRun);

        } catch (error) {
            console.error(chalk.red('❌ Deployment failed:'), error.message);
            process.exit(1);
        }
    }

    async validatePaths() {
        if (!await fs.pathExists(this.autoCoderSBSPath)) {
            throw new Error(`Source path not found: ${this.autoCoderSBSPath}`);
        }
        
        if (!await fs.pathExists(this.targetSBSPath)) {
            throw new Error(`Target SBS_Automation not found: ${this.targetSBSPath}`);
        }
        
        console.log(chalk.green('✅ Paths validated'));
        console.log(chalk.gray(`   Source: ${this.autoCoderSBSPath}`));
        console.log(chalk.gray(`   Target: ${this.targetSBSPath}\n`));
    }

    async createBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(this.targetSBSPath, '..', `SBS_Automation_backup_${timestamp}`);
        
        console.log(chalk.cyan('💾 Creating backup...'));
        await fs.copy(this.targetSBSPath, backupDir);
        console.log(chalk.green(`✅ Backup created: ${backupDir}\n`));
    }

    async deployFeatures(dryRun, verbose) {
        const sourcePath = path.join(this.autoCoderSBSPath, 'features');
        const targetPath = path.join(this.targetSBSPath, 'auto-coder', 'features'); // Create auto-coder subfolder in target
        
        if (!await fs.pathExists(sourcePath)) {
            return;
        }

        console.log(chalk.cyan('📁 Deploying features...'));
        
        const files = await this.getFilesRecursively(sourcePath, '.feature');
        
        for (const file of files) {
            const relativePath = path.relative(sourcePath, file);
            const targetFile = path.join(targetPath, relativePath);
            
            if (await this.shouldDeploy(file, targetFile)) {
                if (verbose) {
                    console.log(chalk.gray(`  📄 ${dryRun ? '[DRY RUN] ' : ''}Deploying: ${relativePath}`));
                }
                
                if (!dryRun) {
                    await fs.ensureDir(path.dirname(targetFile));
                    await fs.copy(file, targetFile, { overwrite: true });
                }
                this.deploymentReport.featuresDeployed++;
            } else {
                if (verbose) {
                    console.log(chalk.yellow(`  ⏭️ Skipping unchanged: ${relativePath}`));
                }
                this.deploymentReport.skipped++;
            }
        }
    }

    async deploySteps(dryRun, verbose) {
        const sourcePath = path.join(this.autoCoderSBSPath, 'steps');
        const targetPath = path.join(this.targetSBSPath, 'auto-coder', 'steps'); // Create auto-coder subfolder in target
        
        if (!await fs.pathExists(sourcePath)) {
            return;
        }

        console.log(chalk.cyan('📁 Deploying step definitions...'));
        
        const files = await this.getFilesRecursively(sourcePath, '.js');
        
        for (const file of files) {
            const relativePath = path.relative(sourcePath, file);
            const targetFile = path.join(targetPath, relativePath);
            
            if (await this.shouldDeploy(file, targetFile)) {
                if (verbose) {
                    console.log(chalk.gray(`  📄 ${dryRun ? '[DRY RUN] ' : ''}Deploying: ${relativePath}`));
                }
                
                if (!dryRun) {
                    await fs.ensureDir(path.dirname(targetFile));
                    await fs.copy(file, targetFile, { overwrite: true });
                }
                this.deploymentReport.stepsDeployed++;
            } else {
                if (verbose) {
                    console.log(chalk.yellow(`  ⏭️ Skipping unchanged: ${relativePath}`));
                }
                this.deploymentReport.skipped++;
            }
        }
    }

    async deployPages(dryRun, verbose) {
        const sourcePath = path.join(this.autoCoderSBSPath, 'pages');
        const targetPath = path.join(this.targetSBSPath, 'auto-coder', 'pages'); // Create auto-coder subfolder in target
        
        if (!await fs.pathExists(sourcePath)) {
            return;
        }

        console.log(chalk.cyan('📁 Deploying page objects...'));
        
        const files = await this.getFilesRecursively(sourcePath, '.js');
        
        for (const file of files) {
            const relativePath = path.relative(sourcePath, file);
            const targetFile = path.join(targetPath, relativePath);
            
            // Skip framework files (common, modals, security)
            if (this.isFrameworkFile(relativePath)) {
                if (verbose) {
                    console.log(chalk.blue(`  🛡️ Preserving framework file: ${relativePath}`));
                }
                continue;
            }
            
            if (await this.shouldDeploy(file, targetFile)) {
                if (verbose) {
                    console.log(chalk.gray(`  📄 ${dryRun ? '[DRY RUN] ' : ''}Deploying: ${relativePath}`));
                }
                
                if (!dryRun) {
                    await fs.ensureDir(path.dirname(targetFile));
                    await fs.copy(file, targetFile, { overwrite: true });
                }
                this.deploymentReport.pagesDeployed++;
            } else {
                if (verbose) {
                    console.log(chalk.yellow(`  ⏭️ Skipping unchanged: ${relativePath}`));
                }
                this.deploymentReport.skipped++;
            }
        }
    }

    async deployData(dryRun, verbose) {
        const sourcePath = path.join(this.autoCoderSBSPath, 'data');
        const targetPath = path.join(this.targetSBSPath, 'auto-coder', 'data'); // Create auto-coder subfolder in target
        
        if (!await fs.pathExists(sourcePath)) {
            return;
        }

        console.log(chalk.cyan('📁 Deploying test data...'));
        
        const files = await this.getFilesRecursively(sourcePath, '.json');
        
        for (const file of files) {
            const relativePath = path.relative(sourcePath, file);
            const targetFile = path.join(targetPath, relativePath);
            
            if (await this.shouldDeploy(file, targetFile)) {
                if (verbose) {
                    console.log(chalk.gray(`  📄 ${dryRun ? '[DRY RUN] ' : ''}Deploying: ${relativePath}`));
                }
                
                if (!dryRun) {
                    await fs.ensureDir(path.dirname(targetFile));
                    await fs.copy(file, targetFile, { overwrite: true });
                }
                this.deploymentReport.dataDeployed++;
            } else {
                if (verbose) {
                    console.log(chalk.yellow(`  ⏭️ Skipping unchanged: ${relativePath}`));
                }
                this.deploymentReport.skipped++;
            }
        }
    }

    async deployConfigs(dryRun, verbose) {
        const configFiles = ['web.config.json', 'mobile.config.json'];
        
        console.log(chalk.cyan('📁 Deploying configurations...'));
        
        for (const configFile of configFiles) {
            const sourceFile = path.join(this.autoCoderSBSPath, configFile);
            const targetFile = path.join(this.targetSBSPath, configFile);
            
            if (await fs.pathExists(sourceFile)) {
                if (await this.shouldDeploy(sourceFile, targetFile)) {
                    if (verbose) {
                        console.log(chalk.gray(`  📄 ${dryRun ? '[DRY RUN] ' : ''}Deploying: ${configFile}`));
                    }
                    
                    if (!dryRun) {
                        await fs.copy(sourceFile, targetFile, { overwrite: true });
                    }
                    this.deploymentReport.configsDeployed++;
                } else {
                    if (verbose) {
                        console.log(chalk.yellow(`  ⏭️ Skipping unchanged: ${configFile}`));
                    }
                    this.deploymentReport.skipped++;
                }
            }
        }
    }

    async getFilesRecursively(dir, extension) {
        const files = [];
        
        async function scanDir(directory) {
            const items = await fs.readdir(directory);
            
            for (const item of items) {
                const fullPath = path.join(directory, item);
                const stats = await fs.stat(fullPath);
                
                if (stats.isDirectory()) {
                    await scanDir(fullPath);
                } else if (item.endsWith(extension)) {
                    files.push(fullPath);
                }
            }
        }
        
        await scanDir(dir);
        return files;
    }

    async shouldDeploy(sourceFile, targetFile) {
        if (!await fs.pathExists(targetFile)) {
            return true; // New file, deploy it
        }
        
        const sourceStats = await fs.stat(sourceFile);
        const targetStats = await fs.stat(targetFile);
        
        // Deploy if source is newer or different size
        return sourceStats.mtime > targetStats.mtime || sourceStats.size !== targetStats.size;
    }

    isFrameworkFile(relativePath) {
        // Protect specific framework directories entirely
        const protectedDirectories = [
            'security/',
            '../modal/',  // runMod/modal path
            'runMod/modal/'
        ];
        
        // Protect specific framework files in common/
        const protectedFrameworkFiles = [
            'common/add-employee-page.js',
            'common/associate-login.js',
            'common/base-page.js',
            'common/classic.js',
            'common/client-account-agreement.js',
            'common/command-centre-login.js',
            'common/company-settings-page.js',
            'common/contractor-type-page.js',
            'common/employe-contractor-page.js',
            'common/eso-page.js',
            'common/features-and-services-page.js',
            'common/footer-page.js',
            'common/header-page.js',
            'common/home-page.js',
            'common/installation-selector-page.js',
            'common/mca-companies-page.js',
            'common/ng-diagnostics.js',
            'common/notifications-page.js',
            'common/payroll-landing-page.js',
            'common/pbp-emulator-page.js',
            'common/people-landing-page.js',
            'common/plaid-modal.js',
            'common/plaid-oauth-window.js',
            'common/practitioner-login.js',
            'common/reports-landing-page.js',
            'common/retirement-service-plan-page.js',
            'common/run-left-nav-page.js',
            'common/run-navigation-page.js',
            'common/run-onboarding-page.js',
            'common/sdf.js',
            'common/view-pending-items-page.js'
        ];
        
        // Check if path is in a protected directory
        if (protectedDirectories.some(dir => relativePath.startsWith(dir))) {
            return true;
        }
        
        // Check if it's a specific protected framework file
        return protectedFrameworkFiles.includes(relativePath);
    }

    showDeploymentSummary(dryRun) {
        console.log(chalk.green.bold(`\n🎉 Deployment ${dryRun ? 'analysis' : 'completed'} successfully!`));
        console.log(chalk.cyan('📊 Summary:'));
        console.log(chalk.gray(`   Features deployed: ${this.deploymentReport.featuresDeployed}`));
        console.log(chalk.gray(`   Steps deployed: ${this.deploymentReport.stepsDeployed}`));
        console.log(chalk.gray(`   Pages deployed: ${this.deploymentReport.pagesDeployed}`));
        console.log(chalk.gray(`   Data files deployed: ${this.deploymentReport.dataDeployed}`));
        console.log(chalk.gray(`   Configs deployed: ${this.deploymentReport.configsDeployed}`));
        console.log(chalk.gray(`   Files skipped (unchanged): ${this.deploymentReport.skipped}`));
        
        console.log(chalk.blue('\n🚀 Next Steps:'));
        console.log(chalk.gray('   1. Navigate to SBS_Automation directory'));
        console.log(chalk.gray('   2. Run: node . -t "@Generated"'));
        console.log(chalk.gray('   3. Validate deployed artifacts in auto-coder subfolder'));
        console.log(chalk.gray('   4. Generated files will be in SBS_Automation/auto-coder/'));
        
        if (dryRun) {
            console.log(chalk.yellow('\n💡 Run without --dry-run to actually deploy files'));
        } else {
            console.log(chalk.green('\n✅ Ready to test in SBS_Automation!'));
        }
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const verbose = args.includes('--verbose') || args.includes('-v');
    const backup = args.includes('--backup'); // Only backup if explicitly requested
    const help = args.includes('--help') || args.includes('-h');
    
    if (help) {
        console.log(chalk.blue.bold('🚀 SBS_Automation Deployment Tool'));
        console.log('Moves generated artifacts from auto-coder to actual SBS_Automation/auto-coder/ subfolder\n');
        console.log(chalk.cyan('Deployment Structure:'));
        console.log('  SOURCE: auto-coder/SBS_Automation/features/ → TARGET: SBS_Automation/auto-coder/features/');
        console.log('  SOURCE: auto-coder/SBS_Automation/steps/   → TARGET: SBS_Automation/auto-coder/steps/');
        console.log('  SOURCE: auto-coder/SBS_Automation/pages/   → TARGET: SBS_Automation/auto-coder/pages/');
        console.log('  SOURCE: auto-coder/SBS_Automation/data/    → TARGET: SBS_Automation/auto-coder/data/\n');
        console.log(chalk.cyan('Usage:'));
        console.log('  node scripts/deploy-to-sbs.js [options]\n');
        console.log(chalk.cyan('Options:'));
        console.log('  --dry-run     Show what would be deployed without actually moving files');
        console.log('  --verbose     Show detailed file operations');
        console.log('  --backup      Create backup of target SBS_Automation (disabled by default)');
        console.log('  --help        Show this help message\n');
        console.log(chalk.cyan('Examples:'));
        console.log('  node scripts/deploy-to-sbs.js --dry-run');
        console.log('  node scripts/deploy-to-sbs.js --verbose');
        console.log('  npm run deploy:to:sbs');
        return;
    }
    
    const deployment = new SBSDeploymentManager();
    await deployment.deployToSBS({ 
        dryRun, 
        backup, // Use the explicit backup flag
        verbose 
    });
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
    console.error(chalk.red('❌ Unhandled error:'), error);
    process.exit(1);
});

// Run if called directly
if (require.main === module) {
    main().catch((error) => {
        console.error(chalk.red('❌ Error:'), error.message);
        process.exit(1);
    });
}

module.exports = SBSDeploymentManager;
