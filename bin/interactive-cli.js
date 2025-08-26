#!/usr/bin/env node

/**
 * Auto-Coder Interactive CLI Entry Point - RESTORED ORIGINAL
 * User-friendly menu-driven interface for test artifact generation and execution
 * INCLUDES: 9-option menu with BDD templates, Playwright, etc.
 */

const InteractiveCLI = require('../src/interactive-cli');

async function main() {
    try {
        const cli = new InteractiveCLI();
        await cli.start();
    } catch (error) {
        console.error('❌ Error starting Interactive CLI:', error.message);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Goodbye!.Thanks for using Auto-Coder');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 Goodbye!.Thanks for using Auto-Coder');
    process.exit(0);
});

main();
