#!/usr/bin/env node

/**
 * 🗑️ Symlink Integration Teardown Script
 * Safely removes symlink integration while preserving generated artifacts
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class SymlinkIntegrationTeardown {
    constructor() {
        this.autoCoderPath = path.resolve(__dirname, '..');
        this.mainSBSPath = path.resolve(__dirname, '../..', 'SBS_Automation');
        this.generatedSBSPath = path.join(this.autoCoderPath, 'SBS_Automation');
        this.removedSymlinks = [];
        this.preservedFiles = [];
    }

    async teardown() {
        console.log(chalk.blue('🗑️ Symlink Integration Teardown'));
        console.log(chalk.gray('================================\n'));
        console.log(chalk.yellow('⚠️ This will remove symlinks but preserve all generated artifacts.'));
        
        try {
            await this.removeSharedResourceSymlinks();
            await this.removeGeneratedArtifactSymlinks();
            await this.removeConvenienceSymlinks();
            await this.createStandaloneStructure();
            
            this.printSummary();
            console.log(chalk.green('\n✅ Teardown completed successfully!'));
            console.log(chalk.blue('💡 Generated artifacts are preserved in auto-coder/SBS_Automation/'));
            
        } catch (error) {
            console.error(chalk.red('\n❌ Teardown failed:'), error.message);
            process.exit(1);
        }
    }

    async removeSharedResourceSymlinks() {
        console.log(chalk.blue('🔗 Removing shared resource symlinks...'));
        
        const sharedResources = [
            'data',
            'support', 
            'hooks',
            'config',
            'web.config.json',
            'playwright.config.js',
            'package.json'
        ];

        for (const resource of sharedResources) {
            const linkPath = path.join(this.generatedSBSPath, resource);
            await this.removeSymlinkSafely(linkPath, `📁 ${resource}`);
        }
    }

    async removeGeneratedArtifactSymlinks() {
        console.log(chalk.blue('\n🎯 Removing generated artifact symlinks from main SBS...'));
        
        const artifactTypes = ['features', 'steps', 'pages'];
        
        for (const artifactType of artifactTypes) {
            const linkPath = path.join(this.mainSBSPath, artifactType, 'auto-generated');
            await this.removeSymlinkSafely(linkPath, `🎯 ${artifactType}/auto-generated`);
        }
    }

    async removeConvenienceSymlinks() {
        console.log(chalk.blue('\n🔄 Removing convenience symlinks...'));
        
        const convenienceLinks = [
            'main-sbs-automation'
        ];

        for (const link of convenienceLinks) {
            const linkPath = path.join(this.autoCoderPath, link);
            await this.removeSymlinkSafely(linkPath, `🔄 ${link}`);
        }
    }

    async createStandaloneStructure() {
        console.log(chalk.blue('\n📁 Creating standalone structure...'));
        
        // Ensure essential directories exist for standalone operation
        const essentialDirs = [
            'support',
            'data'
        ];

        for (const dir of essentialDirs) {
            const dirPath = path.join(this.generatedSBSPath, dir);
            if (!await fs.pathExists(dirPath)) {
                await fs.ensureDir(dirPath);
                console.log(chalk.green(`  ✅ Created directory: ${dir}`));
            }
        }

        // Create minimal support files if they don't exist
        await this.createMinimalSupportFiles();
    }

    async createMinimalSupportFiles() {
        const supportDir = path.join(this.generatedSBSPath, 'support');
        
        // Create minimal base-page.js if it doesn't exist
        const basePagePath = path.join(supportDir, 'base-page.js');
        if (!await fs.pathExists(basePagePath)) {
            const basePageContent = `// Minimal BasePage for standalone operation
class BasePage {
    constructor(page) {
        this.page = page;
    }

    async navigateTo(url) {
        await this.page.goto(url);
    }

    async waitForSelector(selector, timeout = 30000) {
        return await this.page.waitForSelector(selector, { timeout });
    }

    async clickElement(selector) {
        return await this.page.click(selector);
    }

    async fill(selector, text) {
        return await this.page.fill(selector, text);
    }

    async isVisible(selector) {
        return await this.page.isVisible(selector);
    }
}

module.exports = BasePage;`;

            await fs.writeFile(basePagePath, basePageContent);
            console.log(chalk.green('  ✅ Created minimal base-page.js'));
            this.preservedFiles.push('support/base-page.js');
        }

        // Create minimal By.js if it doesn't exist
        const byPath = path.join(supportDir, 'By.js');
        if (!await fs.pathExists(byPath)) {
            const byContent = `// Minimal By module for standalone operation
class By {
    static css(selector) {
        return { type: 'css', selector };
    }

    static xpath(selector) {
        return { type: 'xpath', selector };
    }

    static id(selector) {
        return { type: 'css', selector: \`#\${selector}\` };
    }

    static className(selector) {
        return { type: 'css', selector: \`.\${selector}\` };
    }
}

module.exports = By;`;

            await fs.writeFile(byPath, byContent);
            console.log(chalk.green('  ✅ Created minimal By.js'));
            this.preservedFiles.push('support/By.js');
        }
    }

    async removeSymlinkSafely(linkPath, description = '') {
        try {
            if (await fs.pathExists(linkPath)) {
                const stats = await fs.lstat(linkPath);
                if (stats.isSymbolicLink()) {
                    await fs.unlink(linkPath);
                    console.log(chalk.green(`  ✅ Removed symlink: ${description || linkPath}`));
                    this.removedSymlinks.push(linkPath);
                } else {
                    console.log(chalk.yellow(`  ⚠️ Not a symlink (preserved): ${description || linkPath}`));
                    this.preservedFiles.push(linkPath);
                }
            } else {
                console.log(chalk.gray(`  ℹ️ Not found: ${description || linkPath}`));
            }
        } catch (error) {
            console.log(chalk.red(`  ❌ Failed to remove: ${description || linkPath} (${error.message})`));
        }
    }

    printSummary() {
        console.log(chalk.blue('\n📊 Teardown Summary'));
        console.log(chalk.gray('=================='));
        
        console.log(chalk.green(`✅ Symlinks removed: ${this.removedSymlinks.length}`));
        console.log(chalk.blue(`📁 Files preserved: ${this.preservedFiles.length}`));

        if (this.removedSymlinks.length > 0) {
            console.log(chalk.cyan('\n🗑️ Removed symlinks:'));
            this.removedSymlinks.forEach(link => {
                console.log(chalk.gray(`  • ${path.relative(this.autoCoderPath, link)}`));
            });
        }

        if (this.preservedFiles.length > 0) {
            console.log(chalk.cyan('\n📁 Preserved files:'));
            this.preservedFiles.forEach(file => {
                console.log(chalk.gray(`  • ${file}`));
            });
        }

        console.log(chalk.blue('\n💡 Post-teardown notes:'));
        console.log(chalk.gray('  • Generated artifacts remain in auto-coder/SBS_Automation/'));
        console.log(chalk.gray('  • Framework operates in standalone mode'));
        console.log(chalk.gray('  • To re-enable integration: npm run setup:symlink-integration'));
    }
}

// CLI execution
if (require.main === module) {
    const teardown = new SymlinkIntegrationTeardown();
    teardown.teardown().catch(console.error);
}

module.exports = SymlinkIntegrationTeardown;
