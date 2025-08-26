#!/usr/bin/env node

/**
 * Smart SBS_Automation Cleanup Script
 * Safely removes ONLY generated test artifacts while preserving framework files
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class SBSCleanupManager {
    constructor() {
        this.sbsPath = path.join(process.cwd(), 'SBS_Automation');
        this.preservedFiles = new Set([
            'README.md',
            'pages/common/base-page.js',
            'pages/common/home-page.js',
            'pages/modals',
            'pages/security'
        ]);
        this.preservedPatterns = [
            /pages\/common\//,
            /pages\/modals\//,
            /pages\/security\//
        ];
        this.stats = {
            filesDeleted: 0,
            filesPreserved: 0,
            foldersDeleted: 0,
            foldersPreserved: 0
        };
    }

    async cleanupGeneratedArtifacts(options = {}) {
        const { dryRun = false, verbose = false } = options;
        
        console.log(chalk.blue.bold('🧹 SBS_Automation Cleanup Tool'));
        console.log(chalk.gray('Removing ONLY generated artifacts, preserving framework files\n'));

        if (dryRun) {
            console.log(chalk.yellow('🔍 DRY RUN MODE - No files will be deleted\n'));
        }

        if (!await fs.pathExists(this.sbsPath)) {
            console.log(chalk.yellow('⚠️ SBS_Automation directory not found'));
            return;
        }

        try {
            // Clean features directory
            await this.cleanFeaturesDirectory(dryRun, verbose);
            
            // Clean steps directory
            await this.cleanStepsDirectory(dryRun, verbose);
            
            // Clean pages directory (carefully)
            await this.cleanPagesDirectory(dryRun, verbose);
            
            // Clean summary directory
            await this.cleanSummaryDirectory(dryRun, verbose);
            
            // Clean tests directory
            await this.cleanTestsDirectory(dryRun, verbose);

            this.showCleanupSummary(dryRun);

        } catch (error) {
            console.error(chalk.red('❌ Cleanup failed:'), error.message);
            process.exit(1);
        }
    }

    async cleanFeaturesDirectory(dryRun, verbose) {
        const featuresPath = path.join(this.sbsPath, 'features');
        
        if (!await fs.pathExists(featuresPath)) {
            return;
        }

        console.log(chalk.cyan('📁 Cleaning features directory...'));
        
        const files = await fs.readdir(featuresPath);
        
        for (const file of files) {
            const filePath = path.join(featuresPath, file);
            const stats = await fs.stat(filePath);
            
            if (stats.isFile() && file.endsWith('.feature')) {
                // Delete all feature files (they are all generated)
                if (verbose) {
                    console.log(chalk.gray(`  🗑️ ${dryRun ? '[DRY RUN] ' : ''}Deleting feature: ${file}`));
                }
                
                if (!dryRun) {
                    await fs.remove(filePath);
                }
                this.stats.filesDeleted++;
            }
        }
    }

    async cleanStepsDirectory(dryRun, verbose) {
        const stepsPath = path.join(this.sbsPath, 'steps');
        
        if (!await fs.pathExists(stepsPath)) {
            return;
        }

        console.log(chalk.cyan('📁 Cleaning steps directory...'));
        
        const files = await fs.readdir(stepsPath);
        
        for (const file of files) {
            const filePath = path.join(stepsPath, file);
            const stats = await fs.stat(filePath);
            
            if (stats.isFile() && file.endsWith('-steps.js')) {
                // Delete generated step files (identified by -steps.js pattern)
                if (verbose) {
                    console.log(chalk.gray(`  🗑️ ${dryRun ? '[DRY RUN] ' : ''}Deleting steps: ${file}`));
                }
                
                if (!dryRun) {
                    await fs.remove(filePath);
                }
                this.stats.filesDeleted++;
            }
        }
    }

    async cleanPagesDirectory(dryRun, verbose) {
        const pagesPath = path.join(this.sbsPath, 'pages');
        
        if (!await fs.pathExists(pagesPath)) {
            return;
        }

        console.log(chalk.cyan('📁 Cleaning pages directory (preserving framework files)...'));
        
        await this.cleanPagesRecursively(pagesPath, '', dryRun, verbose);
    }

    async cleanPagesRecursively(dirPath, relativePath, dryRun, verbose) {
        const items = await fs.readdir(dirPath);
        
        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const itemRelativePath = path.join(relativePath, item).replace(/\\/g, '/');
            const stats = await fs.stat(itemPath);
            
            if (stats.isDirectory()) {
                // Check if this directory should be preserved
                const shouldPreserve = this.preservedFiles.has(`pages/${itemRelativePath}`) ||
                                     this.preservedPatterns.some(pattern => pattern.test(`pages/${itemRelativePath}`));
                
                if (shouldPreserve) {
                    if (verbose) {
                        console.log(chalk.green(`  ✅ Preserving framework directory: pages/${itemRelativePath}`));
                    }
                    this.stats.foldersPreserved++;
                    
                    // Still clean inside framework directories
                    await this.cleanPagesRecursively(itemPath, itemRelativePath, dryRun, verbose);
                } else {
                    // Delete generated directories
                    if (verbose) {
                        console.log(chalk.gray(`  🗑️ ${dryRun ? '[DRY RUN] ' : ''}Deleting generated directory: pages/${itemRelativePath}`));
                    }
                    
                    if (!dryRun) {
                        await fs.remove(itemPath);
                    }
                    this.stats.foldersDeleted++;
                }
            } else {
                // Handle files
                const shouldPreserve = this.preservedFiles.has(`pages/${itemRelativePath}`) ||
                                     this.preservedPatterns.some(pattern => pattern.test(`pages/${itemRelativePath}`));
                
                if (shouldPreserve) {
                    if (verbose) {
                        console.log(chalk.green(`  ✅ Preserving framework file: pages/${itemRelativePath}`));
                    }
                    this.stats.filesPreserved++;
                } else {
                    // Delete generated files
                    if (verbose) {
                        console.log(chalk.gray(`  🗑️ ${dryRun ? '[DRY RUN] ' : ''}Deleting generated file: pages/${itemRelativePath}`));
                    }
                    
                    if (!dryRun) {
                        await fs.remove(itemPath);
                    }
                    this.stats.filesDeleted++;
                }
            }
        }
    }

    async cleanSummaryDirectory(dryRun, verbose) {
        const summaryPath = path.join(this.sbsPath, 'summary');
        
        if (!await fs.pathExists(summaryPath)) {
            return;
        }

        console.log(chalk.cyan('📁 Cleaning summary directory...'));
        
        // Delete entire summary directory (all generated)
        if (verbose) {
            const files = await fs.readdir(summaryPath);
            files.forEach(file => {
                console.log(chalk.gray(`  🗑️ ${dryRun ? '[DRY RUN] ' : ''}Deleting summary: ${file}`));
            });
            this.stats.filesDeleted += files.length;
        }
        
        if (!dryRun) {
            await fs.remove(summaryPath);
        }
        this.stats.foldersDeleted++;
    }

    async cleanTestsDirectory(dryRun, verbose) {
        const testsPath = path.join(this.sbsPath, 'tests');
        
        if (!await fs.pathExists(testsPath)) {
            return;
        }

        console.log(chalk.cyan('📁 Cleaning tests directory...'));
        
        // Delete entire tests directory (all generated)
        if (!dryRun) {
            await fs.remove(testsPath);
        }
        this.stats.foldersDeleted++;
        
        if (verbose) {
            console.log(chalk.gray(`  🗑️ ${dryRun ? '[DRY RUN] ' : ''}Deleting tests directory`));
        }
    }

    showCleanupSummary(dryRun) {
        console.log(chalk.green.bold(`\n✅ Cleanup ${dryRun ? 'analysis' : 'completed'} successfully!`));
        console.log(chalk.cyan('📊 Summary:'));
        console.log(chalk.gray(`   Files deleted: ${this.stats.filesDeleted}`));
        console.log(chalk.gray(`   Files preserved: ${this.stats.filesPreserved}`));
        console.log(chalk.gray(`   Folders deleted: ${this.stats.foldersDeleted}`));
        console.log(chalk.gray(`   Folders preserved: ${this.stats.foldersPreserved}`));
        
        console.log(chalk.green('\n🛡️ Framework files preserved:'));
        console.log(chalk.green('   ✅ pages/common/base-page.js'));
        console.log(chalk.green('   ✅ pages/common/home-page.js')); 
        console.log(chalk.green('   ✅ pages/modals/ (directory)'));
        console.log(chalk.green('   ✅ pages/security/ (directory)'));
        console.log(chalk.green('   ✅ README.md'));
        
        if (dryRun) {
            console.log(chalk.yellow('\n💡 Run without --dry-run to actually delete files'));
        } else {
            console.log(chalk.blue('\n🚀 Ready for fresh test artifact generation!'));
        }
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const verbose = args.includes('--verbose') || args.includes('-v');
    const help = args.includes('--help') || args.includes('-h');
    
    if (help) {
        console.log(chalk.blue.bold('🧹 SBS_Automation Cleanup Tool'));
        console.log('Safely removes ONLY generated test artifacts while preserving framework files\n');
        console.log(chalk.cyan('Usage:'));
        console.log('  node scripts/cleanup-generated-artifacts.js [options]\n');
        console.log(chalk.cyan('Options:'));
        console.log('  --dry-run    Show what would be deleted without actually deleting');
        console.log('  --verbose    Show detailed file operations');
        console.log('  --help       Show this help message\n');
        console.log(chalk.cyan('Examples:'));
        console.log('  node scripts/cleanup-generated-artifacts.js --dry-run');
        console.log('  node scripts/cleanup-generated-artifacts.js --verbose');
        console.log('  npm run delete:generated:test-artifacts');
        return;
    }
    
    const cleanup = new SBSCleanupManager();
    await cleanup.cleanupGeneratedArtifacts({ dryRun, verbose });
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

module.exports = SBSCleanupManager;
