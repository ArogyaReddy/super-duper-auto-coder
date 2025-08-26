#!/usr/bin/env node

/**
 * Framework Organization Cleanup Script
 * Moves misplaced files to their proper directories according to RULE #4
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class FrameworkOrganizer {
    constructor() {
        this.rootPath = process.cwd();
        this.misplacedFiles = [];
        this.moveOperations = [];
    }

    async organizeFramework() {
        console.log(chalk.blue.bold('🗂️ Framework Organization Cleanup'));
        console.log(chalk.gray('Moving misplaced files to proper directories\n'));

        try {
            // Scan for misplaced files
            await this.scanForMisplacedFiles();
            
            // Show what will be moved
            this.showPlannedMoves();
            
            // Execute moves
            await this.executeMoves();
            
            // Show summary
            this.showSummary();

        } catch (error) {
            console.error(chalk.red('❌ Organization failed:'), error.message);
            process.exit(1);
        }
    }

    async scanForMisplacedFiles() {
        console.log(chalk.cyan('🔍 Scanning for misplaced files...'));
        
        const items = await fs.readdir(this.rootPath);
        
        for (const item of items) {
            const itemPath = path.join(this.rootPath, item);
            const stats = await fs.stat(itemPath);
            
            if (stats.isFile()) {
                const moveInfo = this.getMoveInfo(item);
                if (moveInfo) {
                    this.misplacedFiles.push(item);
                    this.moveOperations.push({
                        from: item,
                        to: moveInfo.destination,
                        reason: moveInfo.reason
                    });
                }
            }
        }
    }

    getMoveInfo(filename) {
        const allowedInRoot = [
            'package.json',
            'package-lock.json', 
            'README.md',
            '.gitignore',
            '.env',
            'index.js',
            'auto-coder.ps1',
            'set-platform.ps1',
            'set-platform.sh'
        ];

        // Skip allowed files
        if (allowedInRoot.includes(filename)) {
            return null;
        }

        // Skip directories and hidden files
        if (filename.startsWith('.') || filename === 'node_modules') {
            return null;
        }

        // Config files are allowed
        if (filename.endsWith('.config.json') || filename.endsWith('.config.js')) {
            return null;
        }

        // Status files go to config/
        if (filename.includes('status') && filename.endsWith('.json')) {
            return {
                destination: `config/${filename}`,
                reason: 'Status files belong in config/'
            };
        }

        // Markdown files go to guides/
        if (filename.endsWith('.md')) {
            return {
                destination: `guides/${filename}`,
                reason: 'Documentation files belong in guides/'
            };
        }

        // Script files go to scripts/
        if (filename.endsWith('.js') && 
            (filename.includes('test-') || 
             filename.includes('validate-') ||
             filename.includes('cli.js'))) {
            return {
                destination: `scripts/${filename}`,
                reason: 'Script files belong in scripts/'
            };
        }

        // Test/validation files go to framework-tests/
        if (filename.includes('test') || filename.includes('validate')) {
            return {
                destination: `framework-tests/${filename}`,
                reason: 'Test/validation files belong in framework-tests/'
            };
        }

        return null;
    }

    showPlannedMoves() {
        if (this.moveOperations.length === 0) {
            console.log(chalk.green('✅ All files are properly organized!'));
            return;
        }

        console.log(chalk.yellow(`\n📋 Found ${this.moveOperations.length} misplaced files:`));
        
        for (const op of this.moveOperations) {
            console.log(chalk.gray(`  📁 ${op.from} → ${op.to}`));
            console.log(chalk.gray(`     Reason: ${op.reason}`));
        }
        console.log();
    }

    async executeMoves() {
        if (this.moveOperations.length === 0) {
            return;
        }

        console.log(chalk.cyan('🚀 Executing file moves...\n'));

        for (const op of this.moveOperations) {
            const sourcePath = path.join(this.rootPath, op.from);
            const destPath = path.join(this.rootPath, op.to);
            const destDir = path.dirname(destPath);

            try {
                // Ensure destination directory exists
                await fs.ensureDir(destDir);
                
                // Move the file
                await fs.move(sourcePath, destPath, { overwrite: true });
                
                console.log(chalk.green(`  ✅ Moved: ${op.from} → ${op.to}`));
                
            } catch (error) {
                console.log(chalk.red(`  ❌ Failed to move ${op.from}: ${error.message}`));
            }
        }
    }

    showSummary() {
        console.log(chalk.green.bold('\n🎉 Framework organization complete!'));
        console.log(chalk.cyan('\n📁 Proper structure maintained:'));
        console.log(chalk.gray('   ✅ guides/ - Documentation and guides'));
        console.log(chalk.gray('   ✅ scripts/ - Script files'));
        console.log(chalk.gray('   ✅ framework-tests/ - Test and validation files'));
        console.log(chalk.gray('   ✅ SBS_Automation/ - Generated artifacts'));
        console.log(chalk.gray('   ✅ src/, bin/, templates/, support/ - Framework code'));
        console.log(chalk.gray('   ✅ Root - Only essential files (package.json, README.md, etc.)'));
        
        console.log(chalk.blue('\n🛡️ RULE #4 enforced: Proper Framework Organization!'));
    }
}

// CLI execution
async function main() {
    const organizer = new FrameworkOrganizer();
    await organizer.organizeFramework();
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

module.exports = FrameworkOrganizer;
