#!/usr/bin/env node

/**
 * Simple launcher for Auto-Coder Interactive CLI
 */

console.log('Starting Auto-Coder Interactive CLI...\n');

try {
    const InteractiveCLI = require('./src/interactive-cli.js');
    const cli = new InteractiveCLI();
    cli.start();
} catch (error) {
    console.error('❌ Error starting CLI:', error.message);
    process.exit(1);
}
