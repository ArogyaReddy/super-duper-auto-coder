#!/usr/bin/env node

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

console.log(chalk.cyan.bold('🔍 CLEANUP FUNCTIONALITY VERIFICATION\n'));

// Check if cleanup script exists
const cleanupScript = path.join(__dirname, 'scripts', 'cleanup-artifacts.js');
const cliScript = path.join(__dirname, 'src', 'interactive-cli.js');

console.log(chalk.blue('1. Checking cleanup script...'));
if (fs.existsSync(cleanupScript)) {
    console.log(chalk.green('   ✅ cleanup-artifacts.js exists'));
} else {
    console.log(chalk.red('   ❌ cleanup-artifacts.js missing'));
}

console.log(chalk.blue('\n2. Checking Interactive CLI...'));
if (fs.existsSync(cliScript)) {
    console.log(chalk.green('   ✅ interactive-cli.js exists'));
    
    // Check if cleanup menu is implemented
    const cliContent = fs.readFileSync(cliScript, 'utf8');
    if (cliContent.includes('showCleanupMenu')) {
        console.log(chalk.green('   ✅ showCleanupMenu function found'));
    } else {
        console.log(chalk.red('   ❌ showCleanupMenu function missing'));
    }
    
    if (cliContent.includes('Clean Generated Artifacts')) {
        console.log(chalk.green('   ✅ Cleanup option in Framework Management'));
    } else {
        console.log(chalk.red('   ❌ Cleanup option missing from Framework Management'));
    }
} else {
    console.log(chalk.red('   ❌ interactive-cli.js missing'));
}

console.log(chalk.blue('\n3. Checking package.json scripts...'));
const packageFile = path.join(__dirname, 'package.json');
if (fs.existsSync(packageFile)) {
    const packageData = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    const scripts = packageData.scripts || {};
    
    const cleanupScripts = [
        'cleanup:list',
        'cleanup:all',
        'cleanup:specific',
        'cleanup:backup'
    ];
    
    cleanupScripts.forEach(script => {
        if (scripts[script]) {
            console.log(chalk.green(`   ✅ ${script} script configured`));
        } else {
            console.log(chalk.red(`   ❌ ${script} script missing`));
        }
    });
} else {
    console.log(chalk.red('   ❌ package.json missing'));
}

console.log(chalk.green.bold('\n✅ VERIFICATION COMPLETE!'));
console.log(chalk.yellow('\nTo access cleanup functionality:'));
console.log(chalk.cyan('Main Menu → 4 (Framework Management) → 5 (Clean Generated Artifacts)'));
