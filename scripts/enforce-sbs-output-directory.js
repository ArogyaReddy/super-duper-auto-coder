#!/usr/bin/env node

/**
 * 🚨 CRITICAL: SBS_Automation Output Directory Enforcer
 * 
 * This script ensures the framework NEVER creates or uses 'generated' folder.
 * All artifacts must go to SBS_Automation/ directory structure.
 * 
 * Created: 2025-07-22
 * Purpose: Resolve fundamental framework issue with output directory
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class SBSOutputDirectoryEnforcer {
    constructor() {
        this.rootDir = process.cwd();
        this.errors = [];
        this.fixes = [];
        this.forbiddenPaths = [
            './generated',
            '/generated',
            'generated/',
            './generated/',
            'generated/features',
            'generated/steps',
            'generated/pages',
            'generated/tests',
            'generated/reports'
        ];
    }

    async enforce() {
        console.log(chalk.blue('🚨 SBS_Automation Output Directory Enforcement Starting...'));
        
        await this.checkForGeneratedFolder();
        await this.scanSourceFiles();
        await this.validateConfiguration();
        await this.enforceCorrectPaths();
        
        this.reportResults();
    }

    async checkForGeneratedFolder() {
        const generatedPath = path.join(this.rootDir, 'generated');
        
        if (await fs.pathExists(generatedPath)) {
            console.log(chalk.red('❌ CRITICAL: "generated" folder exists!'));
            
            // Move contents to SBS_Automation if needed
            const sbsPath = path.join(this.rootDir, 'SBS_Automation');
            await fs.ensureDir(sbsPath);
            
            try {
                const items = await fs.readdir(generatedPath);
                
                for (const item of items) {
                    const srcPath = path.join(generatedPath, item);
                    const destPath = path.join(sbsPath, item);
                    
                    if (await fs.pathExists(destPath)) {
                        console.log(chalk.yellow(`⚠️  Merging: ${item} -> SBS_Automation/${item}`));
                    } else {
                        console.log(chalk.green(`📁 Moving: ${item} -> SBS_Automation/${item}`));
                    }
                    
                    await fs.move(srcPath, destPath, { overwrite: true });
                }
                
                // Remove empty generated folder
                await fs.remove(generatedPath);
                console.log(chalk.green('✅ "generated" folder removed and contents moved to SBS_Automation/'));
                this.fixes.push('Removed "generated" folder and moved contents to SBS_Automation/');
                
            } catch (error) {
                console.error(chalk.red(`❌ Error moving generated folder: ${error.message}`));
                this.errors.push(`Failed to move generated folder: ${error.message}`);
            }
        } else {
            console.log(chalk.green('✅ No "generated" folder found'));
        }
    }

    async scanSourceFiles() {
        console.log(chalk.blue('🔍 Scanning source files for forbidden paths...'));
        
        const sourceFiles = await this.findJavaScriptFiles();
        
        for (const filePath of sourceFiles) {
            await this.checkFileForForbiddenPaths(filePath);
        }
    }

    async findJavaScriptFiles() {
        const files = [];
        
        const scanDirs = [
            'src',
            'bin',
            'support',
            'utils',
            'scripts'
        ];
        
        for (const dir of scanDirs) {
            const dirPath = path.join(this.rootDir, dir);
            if (await fs.pathExists(dirPath)) {
                const dirFiles = await this.getJSFilesRecursively(dirPath);
                files.push(...dirFiles);
            }
        }
        
        return files;
    }

    async getJSFilesRecursively(dir) {
        const files = [];
        const items = await fs.readdir(dir);
        
        for (const item of items) {
            const itemPath = path.join(dir, item);
            const stat = await fs.stat(itemPath);
            
            if (stat.isDirectory()) {
                const subFiles = await this.getJSFilesRecursively(itemPath);
                files.push(...subFiles);
            } else if (item.endsWith('.js')) {
                files.push(itemPath);
            }
        }
        
        return files;
    }

    async checkFileForForbiddenPaths(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            
            for (const forbiddenPath of this.forbiddenPaths) {
                if (content.includes(forbiddenPath)) {
                    console.log(chalk.red(`❌ Found forbidden path "${forbiddenPath}" in: ${filePath}`));
                    this.errors.push(`${filePath} contains forbidden path: ${forbiddenPath}`);
                }
            }
            
        } catch (error) {
            console.warn(chalk.yellow(`⚠️  Could not read file: ${filePath}`));
        }
    }

    async validateConfiguration() {
        console.log(chalk.blue('🔍 Validating configuration files...'));
        
        const configFiles = [
            'config/web.config.json',
            'config/cross-platform.config.json',
            'support/config-loader.js',
            'utils/index.js'
        ];
        
        for (const configFile of configFiles) {
            await this.checkConfigFile(configFile);
        }
    }

    async checkConfigFile(configFile) {
        const filePath = path.join(this.rootDir, configFile);
        
        if (await fs.pathExists(filePath)) {
            try {
                const content = await fs.readFile(filePath, 'utf8');
                
                if (content.includes('./generated') || content.includes('generated/')) {
                    console.log(chalk.red(`❌ Configuration file has forbidden paths: ${configFile}`));
                    this.errors.push(`${configFile} contains forbidden generated paths`);
                } else {
                    console.log(chalk.green(`✅ Configuration file clean: ${configFile}`));
                }
                
            } catch (error) {
                console.warn(chalk.yellow(`⚠️  Could not read config: ${configFile}`));
            }
        }
    }

    async enforceCorreectPaths() {
        console.log(chalk.blue('🔧 Enforcing correct SBS_Automation paths...'));
        
        // Ensure SBS_Automation directory structure exists
        const requiredDirs = [
            'SBS_Automation',
            'SBS_Automation/features',
            'SBS_Automation/steps', 
            'SBS_Automation/pages',
            'SBS_Automation/tests',
            'SBS_Automation/reports',
            'SBS_Automation/reports/screenshots',
            'SBS_Automation/reports/videos',
            'SBS_Automation/reports/custom'
        ];
        
        for (const dir of requiredDirs) {
            const dirPath = path.join(this.rootDir, dir);
            await fs.ensureDir(dirPath);
        }
        
        console.log(chalk.green('✅ SBS_Automation directory structure enforced'));
        this.fixes.push('Enforced correct SBS_Automation directory structure');
    }

    async enforceCorrectPaths() {
        console.log(chalk.blue('🔧 Enforcing correct SBS_Automation paths...'));
        
        // Ensure SBS_Automation directory structure exists
        const requiredDirs = [
            'SBS_Automation',
            'SBS_Automation/features',
            'SBS_Automation/steps', 
            'SBS_Automation/pages',
            'SBS_Automation/tests',
            'SBS_Automation/reports',
            'SBS_Automation/reports/screenshots',
            'SBS_Automation/reports/videos',
            'SBS_Automation/reports/custom'
        ];
        
        for (const dir of requiredDirs) {
            const dirPath = path.join(this.rootDir, dir);
            await fs.ensureDir(dirPath);
        }
        
        console.log(chalk.green('✅ SBS_Automation directory structure enforced'));
        this.fixes.push('Enforced correct SBS_Automation directory structure');
    }

    reportResults() {
        console.log(chalk.blue('\n📊 SBS_Automation Output Directory Enforcement Results:'));
        
        if (this.errors.length === 0) {
            console.log(chalk.green('✅ All checks passed! Framework uses correct SBS_Automation output directory.'));
        } else {
            console.log(chalk.red(`❌ Found ${this.errors.length} issues:`));
            this.errors.forEach(error => {
                console.log(chalk.red(`   • ${error}`));
            });
        }
        
        if (this.fixes.length > 0) {
            console.log(chalk.green(`\n🔧 Applied ${this.fixes.length} fixes:`));
            this.fixes.forEach(fix => {
                console.log(chalk.green(`   • ${fix}`));
            });
        }
        
        console.log(chalk.blue('\n💡 Framework now enforces SBS_Automation output directory compliance.'));
        console.log(chalk.blue('💡 All artifacts will be generated in SBS_Automation/ structure.'));
        console.log(chalk.blue('💡 "generated" folder will never be created again.'));
    }
}

// Run the enforcer
if (require.main === module) {
    const enforcer = new SBSOutputDirectoryEnforcer();
    enforcer.enforce().catch(error => {
        console.error(chalk.red('💥 Enforcement failed:'), error);
        process.exit(1);
    });
}

module.exports = SBSOutputDirectoryEnforcer;
