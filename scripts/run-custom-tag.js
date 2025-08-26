#!/usr/bin/env node

/**
 * 🎯 CUSTOM TAG RUNNER
 * 
 * Handles execution of tests with custom tags
 * Usage: node scripts/run-custom-tag.js TagName
 */

const { spawn } = require('child_process');
const chalk = require('chalk');

function runCustomTag() {
    // Get tag from command line arguments
    const tagName = process.argv[2];
    
    if (!tagName) {
        console.log(chalk.red('❌ Error: Tag name is required'));
        console.log(chalk.yellow('Usage: node scripts/run-custom-tag.js TagName'));
        console.log(chalk.gray('Example: node scripts/run-custom-tag.js TestNow'));
        process.exit(1);
    }
    
    // Ensure tag starts with @
    const formattedTag = tagName.startsWith('@') ? tagName : `@${tagName}`;
    
    console.log(chalk.blue(`🚀 Running tests with tag: ${formattedTag}`));
    
    // Build cucumber command
    const command = 'npx';
    const args = [
        'cucumber-js',
        'SBS_Automation/features/',
        '--require', 'SBS_Automation/steps/',
        '--require', 'support/',
        '--tags', formattedTag
    ];
    
    console.log(chalk.gray(`Command: ${command} ${args.join(' ')}\n`));
    
    // Execute cucumber with the custom tag
    const cucumberProcess = spawn(command, args, {
        stdio: 'inherit',
        shell: true,
        cwd: process.cwd()
    });
    
    cucumberProcess.on('close', (code) => {
        if (code === 0) {
            console.log(chalk.green(`\n✅ Tests with tag ${formattedTag} completed successfully!`));
        } else {
            console.log(chalk.red(`\n❌ Tests with tag ${formattedTag} failed with code ${code}`));
        }
        process.exit(code);
    });
    
    cucumberProcess.on('error', (error) => {
        console.error(chalk.red('❌ Error running tests:'), error.message);
        process.exit(1);
    });
}

runCustomTag();
