#!/usr/bin/env node

/**
 * FRAMEWORK COMPLIANCE VALIDATOR
 * 
 * This script validates that all generators and templates follow the strict SBS_Automation framework standards:
 * 1. Correct Background steps: "Given Alex is logged into RunMod with a homepage test client"
 * 2. Correct relative import paths in generated files
 * 3. NO 'And' import from cucumber (should only import Given, When, Then)
 * 4. No console.log statements in generated page objects
 * 5. Locators defined at top of file, not in constructor
 * 6. Specific method names, no generic methods
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class FrameworkComplianceValidator {
    constructor() {
        this.violations = [];
        this.checkedFiles = 0;
        this.patterns = {
            correctBackground: /Given Alex is logged into RunMod with a homepage test client/,
            wrongBackground: /Given (I am|the system|the user)/,
            correctAbsoluteImport: /\.\.\/\.\.\/\.\.\/SBS_Automation\//,
            wrongRelativeImport: /\.\.\/(support|pages)\/(?!.*\.\.\/\.\.\/\.\.\/SBS_Automation)/,
            wrongAndImport: /const\s*{\s*[^}]*And[^}]*}\s*=\s*require\(['"]@cucumber\/cucumber['"]\)/,
            wrongAndStep: /And\(/,
            consoleLog: /console\.log/,
            genericMethods: /(performAction|doSomething|handleGeneric|genericMethod)/,
            locatorInConstructor: /this\.selectors\s*=/
        };
    }

    async validateAllFiles() {
        console.log(chalk.blue('🔍 FRAMEWORK COMPLIANCE VALIDATION'));
        console.log(chalk.blue('=====================================\n'));

        // Check generators
        await this.validateDirectory('./src/generators', 'Generators');
        
        // Check templates
        await this.validateDirectory('./templates', 'Templates');
        
        // Check utils/patterns
        await this.validateDirectory('./utils', 'Utilities');
        await this.validateDirectory('./config', 'Configuration');

        this.displayResults();
    }

    async validateDirectory(dirPath, category) {
        if (!fs.existsSync(dirPath)) {
            console.log(chalk.yellow(`⚠️  Directory not found: ${dirPath}`));
            return;
        }

        console.log(chalk.cyan(`📁 Validating ${category}: ${dirPath}`));
        
        const files = this.getAllFiles(dirPath);
        
        for (const file of files) {
            // Skip archive directories and files
            if (file.includes('/archive/') || file.includes('\\archive\\')) {
                continue;
            }
            
            if (file.endsWith('.js') || file.endsWith('.feature') || file.endsWith('.json')) {
                await this.validateFile(file, category);
            }
        }
        
        console.log('');
    }

    getAllFiles(dirPath) {
        const files = [];
        
        function scan(currentPath) {
            const items = fs.readdirSync(currentPath);
            
            for (const item of items) {
                const fullPath = path.join(currentPath, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    scan(fullPath);
                } else {
                    files.push(fullPath);
                }
            }
        }
        
        scan(dirPath);
        return files;
    }

    async validateFile(filePath, category) {
        try {
            this.checkedFiles++;
            const content = fs.readFileSync(filePath, 'utf8');
            const relativePath = path.relative('.', filePath);
            
            // Check for wrong background steps
            if (this.patterns.wrongBackground.test(content) && !this.patterns.correctBackground.test(content)) {
                this.addViolation('CRITICAL', 'Wrong Background Steps', relativePath, 
                    'Uses incorrect background steps instead of "Given Alex is logged into RunMod..."');
            }
            
            // Check for wrong import paths (should use absolute imports for auto-coder location)
            if (!filePath.includes('config/') && !filePath.includes('utils/') && 
                this.patterns.wrongRelativeImport.test(content)) {
                this.addViolation('CRITICAL', 'Wrong Import Paths', relativePath,
                    'Uses relative imports instead of absolute imports like ../../../SBS_Automation/support/By.js');
            }
            
            // Check for wrong And import in steps files
            if (filePath.includes('steps') && this.patterns.wrongAndImport.test(content)) {
                this.addViolation('CRITICAL', 'Wrong And Import', relativePath,
                    'Imports And from cucumber - should only import Given, When, Then');
            }
            
            // Check for And step definitions (should be Then)
            if (filePath.includes('steps') && this.patterns.wrongAndStep.test(content)) {
                this.addViolation('CRITICAL', 'Wrong And Step Definition', relativePath,
                    'Uses And() step definition - should implement And steps as Then()');
            }
            
            // Check for console.log in page objects
            if (filePath.includes('page') && this.patterns.consoleLog.test(content)) {
                this.addViolation('HIGH', 'Console.log in Page Object', relativePath,
                    'Contains console.log statements which are not allowed in page objects');
            }
            
            // Check for locators in constructor
            if (this.patterns.locatorInConstructor.test(content)) {
                this.addViolation('HIGH', 'Locators in Constructor', relativePath,
                    'Defines locators in constructor instead of at top of file');
            }
            
            // Check for generic method names
            if (this.patterns.genericMethods.test(content)) {
                this.addViolation('MEDIUM', 'Generic Method Names', relativePath,
                    'Uses generic method names instead of specific business logic methods');
            }
            
            console.log(chalk.green(`✓ ${relativePath}`));
            
        } catch (error) {
            console.log(chalk.red(`✗ Error reading ${filePath}: ${error.message}`));
        }
    }

    addViolation(severity, type, file, description) {
        this.violations.push({
            severity,
            type,
            file,
            description
        });
    }

    displayResults() {
        console.log(chalk.blue('\n📊 VALIDATION RESULTS'));
        console.log(chalk.blue('====================\n'));
        
        console.log(`Files checked: ${this.checkedFiles}`);
        console.log(`Violations found: ${this.violations.length}\n`);
        
        if (this.violations.length === 0) {
            console.log(chalk.green('🎉 ALL CHECKS PASSED! Framework compliance is excellent.\n'));
            return;
        }
        
        // Group violations by severity
        const critical = this.violations.filter(v => v.severity === 'CRITICAL');
        const high = this.violations.filter(v => v.severity === 'HIGH');
        const medium = this.violations.filter(v => v.severity === 'MEDIUM');
        
        if (critical.length > 0) {
            console.log(chalk.red(`🚨 CRITICAL VIOLATIONS (${critical.length}):`));
            critical.forEach(v => {
                console.log(chalk.red(`  ❌ ${v.type}: ${v.file}`));
                console.log(chalk.red(`     ${v.description}\n`));
            });
        }
        
        if (high.length > 0) {
            console.log(chalk.yellow(`⚠️  HIGH PRIORITY VIOLATIONS (${high.length}):`));
            high.forEach(v => {
                console.log(chalk.yellow(`  ⚠️  ${v.type}: ${v.file}`));
                console.log(chalk.yellow(`     ${v.description}\n`));
            });
        }
        
        if (medium.length > 0) {
            console.log(chalk.blue(`ℹ️  MEDIUM PRIORITY VIOLATIONS (${medium.length}):`));
            medium.forEach(v => {
                console.log(chalk.blue(`  ℹ️  ${v.type}: ${v.file}`));
                console.log(chalk.blue(`     ${v.description}\n`));
            });
        }
        
        console.log(chalk.red('❌ FRAMEWORK COMPLIANCE FAILED. Please fix violations above.\n'));
    }
}

// Run validation
const validator = new FrameworkComplianceValidator();
validator.validateAllFiles().catch(console.error);
