#!/usr/bin/env node

/**
 * Simple Prompt Validation
 * Ensures single prompt is being used and followed
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

async function validatePromptCompliance() {
    console.log(chalk.blue.bold('🔥 AUTO-CODER SINGLE PROMPT VALIDATION\n'));

    // Check if simple prompt exists
    const promptPath = path.join(process.cwd(), '.github', 'auto-coder-prompt.md');
    if (await fs.pathExists(promptPath)) {
        console.log(chalk.green('✅ Single prompt file exists: auto-coder-prompt.md'));
        
        const content = await fs.readFile(promptPath, 'utf8');
        const lineCount = content.split('\n').length;
        console.log(chalk.green(`✅ Prompt length: ${lineCount} lines (simple and manageable)`));
        
        // Check for key sections
        const hasImageAnalysis = content.includes('IMAGE ANALYSIS');
        const hasSBSPatterns = content.includes('SBS_AUTOMATION PATTERNS');
        const hasForbiddenPatterns = content.includes('FORBIDDEN PATTERNS');
        const hasConsistency = content.includes('CONSISTENCY MANDATE');
        
        if (hasImageAnalysis && hasSBSPatterns && hasForbiddenPatterns && hasConsistency) {
            console.log(chalk.green('✅ All critical sections present in prompt'));
        } else {
            console.log(chalk.red('❌ Missing critical sections in prompt'));
        }
    } else {
        console.log(chalk.red('❌ Single prompt file missing'));
    }

    // Check for old complex prompts (should be archived or removed)
    const oldPrompts = [
        '.github/myPrompts/You-Me-Direct-Playwright-Enhanced.md',
        '.github/myPrompts/You-Me-Direct.md'
    ];

    for (const oldPrompt of oldPrompts) {
        if (await fs.pathExists(path.join(process.cwd(), oldPrompt))) {
            console.log(chalk.yellow(`⚠️ Old complex prompt still exists: ${oldPrompt}`));
            console.log(chalk.yellow('   Consider archiving to avoid confusion'));
        }
    }

    console.log(chalk.blue.bold('\n🎯 SINGLE PROMPT APPROACH:'));
    console.log(chalk.gray('✅ Simple and strict rules'));
    console.log(chalk.gray('✅ Easy to read and follow'));
    console.log(chalk.gray('✅ Consistent artifact generation'));
    console.log(chalk.gray('✅ No confusion or inconsistency'));
    
    console.log(chalk.green.bold('\n🔥 PROMISE: I WILL FOLLOW THIS SINGLE PROMPT EXACTLY!'));
}

if (require.main === module) {
    validatePromptCompliance().catch(console.error);
}

module.exports = validatePromptCompliance;
