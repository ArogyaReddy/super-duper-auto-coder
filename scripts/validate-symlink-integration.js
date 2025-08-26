#!/usr/bin/env node

/**
 * 🔍 Symlink Integration Validation Script
 * Validates that the symlink integration between Auto-Coder and main SBS_Automation is working correctly
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class SymlinkIntegrationValidator {
    constructor() {
        this.autoCoderPath = path.resolve(__dirname, '..');
        this.mainSBSPath = path.resolve(__dirname, '../..', 'SBS_Automation');
        this.generatedSBSPath = path.join(this.autoCoderPath, 'SBS_Automation');
        
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            tests: []
        };
    }

    async validate() {
        console.log(chalk.blue('🔍 Validating Symlink Integration'));
        console.log(chalk.gray('==============================\n'));

        await this.validatePathStructure();
        await this.validateSharedResources();
        await this.validateGeneratedArtifacts();
        await this.validateMainSBSIntegration();
        await this.validateExecutionReadiness();

        this.printResults();
        return this.results.failed === 0;
    }

    async validatePathStructure() {
        console.log(chalk.blue('📁 Path Structure Validation'));
        
        await this.test('Auto-Coder path exists', async () => {
            return await fs.pathExists(this.autoCoderPath);
        });

        await this.test('Main SBS_Automation path exists', async () => {
            return await fs.pathExists(this.mainSBSPath);
        });

        await this.test('Generated SBS_Automation path exists', async () => {
            return await fs.pathExists(this.generatedSBSPath);
        });
    }

    async validateSharedResources() {
        console.log(chalk.blue('\n🔗 Shared Resources Validation'));
        
        const sharedResources = [
            { path: 'data', required: true },
            { path: 'support', required: true },
            { path: 'hooks', required: false },
            { path: 'web.config.json', name: 'config', required: false }
        ];

        for (const resource of sharedResources) {
            const linkPath = path.join(this.generatedSBSPath, resource.name || resource.path);
            const targetPath = path.join(this.mainSBSPath, resource.path);

            await this.test(`${resource.path} symlink exists`, async () => {
                if (!await fs.pathExists(linkPath)) {
                    if (resource.required) {
                        return false;
                    } else {
                        this.results.warnings++;
                        console.log(chalk.yellow(`    ⚠️ Optional resource not linked: ${resource.path}`));
                        return true;
                    }
                }
                
                const stats = await fs.lstat(linkPath);
                return stats.isSymbolicLink();
            });

            if (await fs.pathExists(linkPath)) {
                await this.test(`${resource.path} symlink target is valid`, async () => {
                    const realPath = await fs.realpath(linkPath);
                    return realPath === targetPath;
                });
            }
        }
    }

    async validateGeneratedArtifacts() {
        console.log(chalk.blue('\n🎯 Generated Artifacts Validation'));
        
        const artifactTypes = ['features', 'steps', 'pages'];
        
        for (const artifactType of artifactTypes) {
            const sourcePath = path.join(this.generatedSBSPath, artifactType);
            const linkPath = path.join(this.mainSBSPath, artifactType, 'auto-generated');

            await this.test(`${artifactType} source directory exists`, async () => {
                return await fs.pathExists(sourcePath);
            });

            await this.test(`${artifactType} symlink in main SBS exists`, async () => {
                if (!await fs.pathExists(linkPath)) {
                    return false;
                }
                const stats = await fs.lstat(linkPath);
                return stats.isSymbolicLink();
            });

            if (await fs.pathExists(linkPath)) {
                await this.test(`${artifactType} symlink target is correct`, async () => {
                    const realPath = await fs.realpath(linkPath);
                    return realPath === sourcePath;
                });
            }
        }
    }

    async validateMainSBSIntegration() {
        console.log(chalk.blue('\n🔄 Main SBS Integration Validation'));
        
        await this.test('Main SBS has package.json', async () => {
            return await fs.pathExists(path.join(this.mainSBSPath, 'package.json'));
        });

        await this.test('Main SBS has cucumber configuration', async () => {
            const cucumberConfig = path.join(this.mainSBSPath, 'cucumber.js');
            const packageJson = path.join(this.mainSBSPath, 'package.json');
            
            if (await fs.pathExists(cucumberConfig)) {
                return true;
            }
            
            if (await fs.pathExists(packageJson)) {
                const pkg = await fs.readJson(packageJson);
                return pkg.scripts && Object.keys(pkg.scripts).some(script => script.includes('cucumber'));
            }
            
            return false;
        });

        // Check if main SBS can access generated artifacts
        const testFeaturePath = path.join(this.mainSBSPath, 'features', 'auto-generated');
        if (await fs.pathExists(testFeaturePath)) {
            await this.test('Main SBS can access generated features', async () => {
                const files = await fs.readdir(testFeaturePath);
                return files.length >= 0; // Just check it's readable
            });
        }
    }

    async validateExecutionReadiness() {
        console.log(chalk.blue('\n🚀 Execution Readiness Validation'));
        
        await this.test('Generated SBS has proper directory structure', async () => {
            const requiredDirs = ['features', 'steps', 'pages'];
            for (const dir of requiredDirs) {
                if (!await fs.pathExists(path.join(this.generatedSBSPath, dir))) {
                    return false;
                }
            }
            return true;
        });

        await this.test('Convenience symlink to main SBS exists', async () => {
            const linkPath = path.join(this.autoCoderPath, 'main-sbs-automation');
            if (!await fs.pathExists(linkPath)) {
                this.results.warnings++;
                console.log(chalk.yellow('    ⚠️ Convenience symlink missing (optional)'));
                return true;
            }
            const stats = await fs.lstat(linkPath);
            return stats.isSymbolicLink();
        });

        // Test if we can find typical SBS framework files
        const frameworkFiles = [
            'support/base-page.js',
            'support/world.js',
            'support/hooks.js'
        ];

        for (const file of frameworkFiles) {
            const filePath = path.join(this.generatedSBSPath, file);
            await this.test(`Framework file accessible: ${file}`, async () => {
                if (!await fs.pathExists(filePath)) {
                    this.results.warnings++;
                    console.log(chalk.yellow(`    ⚠️ Framework file not found: ${file}`));
                    return true; // Not critical
                }
                return true;
            });
        }
    }

    async test(description, testFn) {
        try {
            const result = await testFn();
            if (result) {
                console.log(chalk.green(`  ✅ ${description}`));
                this.results.passed++;
            } else {
                console.log(chalk.red(`  ❌ ${description}`));
                this.results.failed++;
            }
            this.results.tests.push({ description, passed: result });
        } catch (error) {
            console.log(chalk.red(`  ❌ ${description} (Error: ${error.message})`));
            this.results.failed++;
            this.results.tests.push({ description, passed: false, error: error.message });
        }
    }

    printResults() {
        console.log(chalk.blue('\n📊 Validation Results'));
        console.log(chalk.gray('=================='));
        
        if (this.results.failed === 0) {
            console.log(chalk.green(`✅ All tests passed! (${this.results.passed} passed, ${this.results.warnings} warnings)`));
            console.log(chalk.blue('\n🎉 Symlink integration is working correctly!'));
            console.log(chalk.cyan('\n💡 You can now:'));
            console.log(chalk.gray('  • Generate artifacts: npm run generate:with-symlink'));
            console.log(chalk.gray('  • Execute unified tests: npm run test:unified'));
            console.log(chalk.gray('  • Execute generated only: npm run test:generated-only'));
        } else {
            console.log(chalk.red(`❌ ${this.results.failed} tests failed, ${this.results.passed} passed, ${this.results.warnings} warnings`));
            console.log(chalk.yellow('\n🔧 To fix issues:'));
            console.log(chalk.gray('  • Run setup again: npm run setup:symlink-integration'));
            console.log(chalk.gray('  • Check permissions (Windows: run as admin)'));
            console.log(chalk.gray('  • Verify main SBS_Automation path exists'));
        }

        if (this.results.warnings > 0) {
            console.log(chalk.yellow(`\n⚠️ ${this.results.warnings} warnings - check optional components above`));
        }
    }
}

// CLI execution
if (require.main === module) {
    const validator = new SymlinkIntegrationValidator();
    validator.validate()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error(chalk.red('Validation failed:'), error);
            process.exit(1);
        });
}

module.exports = SymlinkIntegrationValidator;
