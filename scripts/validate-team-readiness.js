#!/usr/bin/env node

/**
 * Team Readiness Validation Script
 * Ensures auto-coder framework is ready for team distribution
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class TeamReadinessValidator {
    constructor() {
        this.issues = [];
        this.warnings = [];
        this.success = [];
    }

    async validateTeamReadiness() {
        console.log(chalk.blue.bold('🚀 Auto-Coder Team Readiness Validation\n'));

        // Check all critical team requirements
        await this.validatePackageJson();
        await this.validatePaths();
        await this.validateDocumentation();
        await this.validateScripts();
        await this.validatePrompts();
        await this.validateCompliance();

        this.showResults();
    }

    async validatePackageJson() {
        try {
            const packagePath = path.join(process.cwd(), 'package.json');
            const packageJson = await fs.readJson(packagePath);
            
            // Check required fields
            if (packageJson.name && packageJson.version && packageJson.dependencies) {
                this.success.push('✅ package.json structure valid');
            } else {
                this.issues.push('❌ package.json missing required fields');
            }

            // Check Node version requirement
            if (packageJson.engines && packageJson.engines.node) {
                this.success.push('✅ Node.js version requirement specified');
            } else {
                this.warnings.push('⚠️ Node.js version requirement not specified');
            }

            // Check team scripts
            const teamScripts = ['team:setup', 'team:validate', 'deploy:dry-run'];
            const hasTeamScripts = teamScripts.every(script => packageJson.scripts[script]);
            if (hasTeamScripts) {
                this.success.push('✅ Team onboarding scripts available');
            } else {
                this.issues.push('❌ Missing team onboarding scripts');
            }

        } catch (error) {
            this.issues.push('❌ Cannot read package.json');
        }
    }

    async validatePaths() {
        const criticalPaths = [
            '.github/myPrompts',
            'docs',
            'scripts/deploy-to-sbs.js',
            'bin',
            'SBS_Automation',
            'requirements'
        ];

        for (const checkPath of criticalPaths) {
            if (await fs.pathExists(path.join(process.cwd(), checkPath))) {
                this.success.push(`✅ ${checkPath} exists`);
            } else {
                this.issues.push(`❌ Missing critical path: ${checkPath}`);
            }
        }
    }

    async validateDocumentation() {
        const docs = [
            'README.md',
            'TEAM-SETUP-GUIDE.md',
            'docs/USER-FEEDBACK-CONSISTENCY-MANDATE.md',
            'docs/ABSOLUTE-COMPLIANCE-RULES.md'
        ];

        for (const doc of docs) {
            if (await fs.pathExists(path.join(process.cwd(), doc))) {
                this.success.push(`✅ Documentation: ${doc}`);
            } else {
                this.warnings.push(`⚠️ Missing documentation: ${doc}`);
            }
        }
    }

    async validateScripts() {
        const scripts = [
            'scripts/deploy-to-sbs.js',
            'bin/interactive-cli.js',
            'bin/auto-coder-generate.js'
        ];

        for (const script of scripts) {
            const scriptPath = path.join(process.cwd(), script);
            if (await fs.pathExists(scriptPath)) {
                // Check if script has hardcoded paths
                const content = await fs.readFile(scriptPath, 'utf8');
                if (content.includes('/Users/') || content.includes('C:\\Users\\')) {
                    this.issues.push(`❌ Hardcoded user paths in: ${script}`);
                } else {
                    this.success.push(`✅ Script portable: ${script}`);
                }
            } else {
                this.issues.push(`❌ Missing script: ${script}`);
            }
        }
    }

    async validatePrompts() {
        const prompt = '.github/auto-coder-prompt.md';

        if (await fs.pathExists(path.join(process.cwd(), prompt))) {
            // Check if prompt includes user feedback
            const content = await fs.readFile(path.join(process.cwd(), prompt), 'utf8');
            if (content.includes('USER FEEDBACK') || content.includes('CONSISTENCY')) {
                this.success.push(`✅ Single prompt includes feedback: ${path.basename(prompt)}`);
            } else {
                this.warnings.push(`⚠️ Single prompt may need feedback integration: ${path.basename(prompt)}`);
            }
        } else {
            this.issues.push(`❌ Missing single prompt: ${prompt}`);
        }
    }

    async validateCompliance() {
        // Check for forbidden patterns in generated artifacts
        const sbsPath = path.join(process.cwd(), 'SBS_Automation');
        if (await fs.pathExists(sbsPath)) {
            try {
                // Check for auto-coder subfolder in source (should NOT exist)
                const autoCoderSubfolder = path.join(sbsPath, 'pages', 'auto-coder');
                if (await fs.pathExists(autoCoderSubfolder)) {
                    this.issues.push('❌ Forbidden auto-coder subfolder exists in source pages');
                } else {
                    this.success.push('✅ Source structure is flat (no auto-coder subfolder)');
                }
            } catch (error) {
                this.warnings.push('⚠️ Could not validate SBS_Automation structure');
            }
        }
    }

    showResults() {
        console.log(chalk.green.bold('🎯 SUCCESS ITEMS:'));
        this.success.forEach(item => console.log(chalk.green(`  ${item}`)));
        
        if (this.warnings.length > 0) {
            console.log(chalk.yellow.bold('\n⚠️ WARNINGS:'));
            this.warnings.forEach(item => console.log(chalk.yellow(`  ${item}`)));
        }
        
        if (this.issues.length > 0) {
            console.log(chalk.red.bold('\n❌ ISSUES THAT NEED FIXING:'));
            this.issues.forEach(item => console.log(chalk.red(`  ${item}`)));
        }
        
        console.log(chalk.blue.bold('\n📊 TEAM READINESS SUMMARY:'));
        console.log(chalk.gray(`  Success: ${this.success.length}`));
        console.log(chalk.gray(`  Warnings: ${this.warnings.length}`));
        console.log(chalk.gray(`  Issues: ${this.issues.length}`));
        
        if (this.issues.length === 0) {
            console.log(chalk.green.bold('\n🚀 FRAMEWORK IS 100% TEAM-READY!'));
            console.log(chalk.green('Your team can clone and use this framework immediately.'));
            console.log(chalk.gray('\nTeam onboarding steps:'));
            console.log(chalk.gray('1. git clone <repository>'));
            console.log(chalk.gray('2. npm install'));
            console.log(chalk.gray('3. npm run team:validate'));
            console.log(chalk.gray('4. npm start (begin using framework)'));
        } else {
            console.log(chalk.red.bold('\n⚠️ FRAMEWORK NEEDS FIXES BEFORE TEAM DISTRIBUTION'));
            console.log(chalk.red('Please fix the issues above before sharing with your team.'));
        }
    }
}

// Run validation
async function main() {
    const validator = new TeamReadinessValidator();
    await validator.validateTeamReadiness();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = TeamReadinessValidator;
