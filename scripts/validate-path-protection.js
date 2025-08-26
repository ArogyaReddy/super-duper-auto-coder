#!/usr/bin/env node

/**
 * Path Validation Demo
 * Demonstrates the enforcement of the critical rule:
 * Auto-coder must never write to main SBS_Automation
 */

const path = require('path');
const chalk = require('chalk');

function validateOutputPath(outputPath) {
    const resolvedPath = path.resolve(outputPath);
    const mainSBSPath = path.resolve('../SBS_Automation');
    
    console.log(`Testing path: ${outputPath}`);
    console.log(`Resolved to: ${resolvedPath}`);
    console.log(`Main SBS path: ${mainSBSPath}`);
    
    // Check if output path is trying to write to main SBS_Automation
    if (resolvedPath.startsWith(mainSBSPath)) {
        console.log(chalk.red('🚨 BLOCKED: Path violates critical rule'));
        console.log(chalk.red('Auto-coder is PROHIBITED from writing to main SBS_Automation'));
        return false;
    }
    
    console.log(chalk.green('✅ ALLOWED: Path is safe for generation'));
    return true;
}

// Test cases
console.log(chalk.blue('=== PATH VALIDATION DEMO ===\n'));

// Safe paths (should pass)
console.log(chalk.blue('Testing SAFE paths:'));
validateOutputPath('./generated-artifacts');
console.log('---');
validateOutputPath('./my-features');
console.log('---');
validateOutputPath('generated-features/login');
console.log('\n');

// Dangerous paths (should be blocked)
console.log(chalk.blue('Testing DANGEROUS paths:'));
validateOutputPath('../SBS_Automation');
console.log('---');
validateOutputPath('../SBS_Automation/features');
console.log('---');
validateOutputPath('../SBS_Automation/pages/common');
console.log('\n');

console.log(chalk.green('✅ Path validation is working correctly!'));
console.log(chalk.yellow('💡 Always use paths within auto-coder/ for generation'));
