#!/usr/bin/env node

/**
 * 🎯 PURE BDD TEMPLATE-TO-ARTIFACTS CLI
 * 
 * TOP PRIORITY: Non-AI Template Generation
 * Implements: BDD Template → Feature → Steps → Page (Pure Logic)
 * 
 * Usage:
 *   node bdd-cli.js wizard     - Create new BDD template
 *   node bdd-cli.js generate   - Generate from existing template  
 *   node bdd-cli.js list       - List available templates
 */

const BDDTemplateCLI = require('./bdd-template-cli');
const chalk = require('chalk');

class PureBDDCLI {
    constructor() {
        this.bddCLI = new BDDTemplateCLI();
    }

    async start() {
        const args = process.argv.slice(2);
        const command = args[0] || 'help';

        console.clear();
        this.showHeader();

        switch (command) {
            case 'wizard':
                await this.runWizard();
                break;
            case 'generate':
                await this.runGenerate(args[1]);
                break;
            case 'list':
                await this.listTemplates();
                break;
            case 'test':
                await this.testGeneration();
                break;
            default:
                this.showHelp();
        }
    }

    showHeader() {
        console.log(chalk.cyan.bold('╔═══════════════════════════════════════════════════════════════╗'));
        console.log(chalk.cyan.bold('║               🎯 BDD TEMPLATE-DRIVEN GENERATOR                ║'));
        console.log(chalk.cyan.bold('║                   PURE LOGIC - NO AI NEEDED                  ║'));
        console.log(chalk.cyan.bold('╚═══════════════════════════════════════════════════════════════╝'));
        console.log(chalk.yellow('✨ Direct BDD Template → Feature → Steps → Page Generation'));
        console.log(chalk.gray('   Framework logic mapping without AI dependency\n'));
    }

    async runWizard() {
        console.log(chalk.blue.bold('🧙 BDD TEMPLATE WIZARD\n'));
        
        const result = await this.bddCLI.createBDDTemplate();
        
        if (result.success) {
            console.log(chalk.green('✅ Template created and opened in VS Code!'));
            console.log(chalk.yellow(`📝 Template: ${result.templateName}`));
            console.log(chalk.gray('\n📋 Next Steps:'));
            console.log(chalk.gray('   1. Fill in your requirements using Given-When-Then format'));
            console.log(chalk.gray('   2. Save the file (Ctrl+S)'));
            console.log(chalk.gray('   3. Run: node bdd-cli.js generate'));
        } else {
            console.log(chalk.red(`❌ Failed: ${result.error}`));
        }
    }

    async runGenerate(templatePath) {
        console.log(chalk.blue.bold('🚀 GENERATE ARTIFACTS FROM BDD TEMPLATE\n'));
        
        let targetTemplate = templatePath;
        
        if (!targetTemplate) {
            // Find the most recent template
            const templates = this.bddCLI.listAvailableTemplates();
            
            if (templates.length === 0) {
                console.log(chalk.red('❌ No templates found. Run: node bdd-cli.js wizard'));
                return;
            }
            
            console.log(chalk.blue('📋 Available Templates:'));
            templates.forEach((template, index) => {
                const date = new Date(template.modified).toLocaleString();
                console.log(`${chalk.cyan((index + 1).toString())}. ${template.name} (${date})`);
            });
            
            // Use most recent by default
            targetTemplate = templates[0].path;
            console.log(chalk.yellow(`\n🎯 Using most recent: ${templates[0].name}`));
        }
        
        const result = await this.bddCLI.generateFromTemplate(targetTemplate);
        
        if (result.success) {
            console.log(chalk.green('\n🎉 GENERATION SUCCESSFUL!'));
            
            // Validate
            await this.bddCLI.validateGenerated(result);
            
            console.log(chalk.yellow('\n📁 Generated Files:'));
            console.log(chalk.gray(`   Feature:  ${result.generated.feature.fileName}`));
            console.log(chalk.gray(`   Steps:    ${result.generated.steps.fileName}`));
            console.log(chalk.gray(`   Page:     ${result.generated.page.fileName}`));
            
            console.log(chalk.cyan('\n🚀 Ready to run tests:'));
            console.log(chalk.gray(`   npm run test:generated`));
            
        } else {
            console.log(chalk.red(`❌ Generation failed: ${result.error}`));
        }
    }

    async listTemplates() {
        console.log(chalk.blue.bold('📋 AVAILABLE BDD TEMPLATES\n'));
        
        const templates = this.bddCLI.listAvailableTemplates();
        
        if (templates.length === 0) {
            console.log(chalk.gray('No templates found. Create your first template:'));
            console.log(chalk.cyan('   node bdd-cli.js wizard'));
        } else {
            templates.forEach((template, index) => {
                const date = new Date(template.modified).toLocaleString();
                const size = (template.size / 1024).toFixed(1);
                
                console.log(`${chalk.cyan((index + 1).toString())}. ${chalk.bold(template.name)}`);
                console.log(`   ${chalk.gray('Path:')} ${template.path}`);
                console.log(`   ${chalk.gray('Modified:')} ${date}`);
                console.log(`   ${chalk.gray('Size:')} ${size} KB\n`);
            });
            
            console.log(chalk.cyan('Generate from template:'));
            console.log(chalk.gray('   node bdd-cli.js generate [template-path]'));
        }
    }

    async testGeneration() {
        console.log(chalk.blue.bold('🧪 TESTING BDD GENERATION SYSTEM\n'));
        
        // Test with existing completed template
        const testTemplate = './requirements/templates/completed/req_250723102212pm.md';
        
        console.log(chalk.yellow(`🔍 Testing with: ${testTemplate}`));
        
        const result = await this.bddCLI.generateFromTemplate(testTemplate);
        
        if (result.success) {
            console.log(chalk.green('\n✅ TEST PASSED!'));
            console.log(chalk.gray('BDD Template-to-Artifacts generation is working correctly'));
            
            await this.bddCLI.validateGenerated(result);
            
        } else {
            console.log(chalk.red(`\n❌ TEST FAILED: ${result.error}`));
        }
    }

    showHelp() {
        console.log(chalk.blue.bold('📖 BDD TEMPLATE CLI USAGE\n'));
        console.log(chalk.cyan('Commands:'));
        console.log(chalk.gray('   wizard     - Create new BDD template and open in VS Code'));
        console.log(chalk.gray('   generate   - Generate artifacts from completed template'));
        console.log(chalk.gray('   list       - List all available templates'));
        console.log(chalk.gray('   test       - Test generation with sample template'));
        console.log(chalk.gray('   help       - Show this help message\n'));
        
        console.log(chalk.cyan('Examples:'));
        console.log(chalk.gray('   node bdd-cli.js wizard'));
        console.log(chalk.gray('   node bdd-cli.js generate'));
        console.log(chalk.gray('   node bdd-cli.js generate ./templates/my-template.md'));
        console.log(chalk.gray('   node bdd-cli.js list\n'));
        
        console.log(chalk.yellow('🎯 Workflow:'));
        console.log(chalk.gray('   1. Create template: node bdd-cli.js wizard'));
        console.log(chalk.gray('   2. Fill requirements in VS Code'));
        console.log(chalk.gray('   3. Generate artifacts: node bdd-cli.js generate'));
        console.log(chalk.gray('   4. Run tests: npm run test:generated\n'));
    }
}

// Run CLI if called directly
if (require.main === module) {
    const cli = new PureBDDCLI();
    cli.start().catch(error => {
        console.error(chalk.red('\n❌ CLI Error:'), error.message);
        process.exit(1);
    });
}

module.exports = PureBDDCLI;
