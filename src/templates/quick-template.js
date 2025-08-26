#!/usr/bin/env node

// Import the simple template manager
const SimpleTemplateManager = require('./simple-template-manager');

// Show available templates and usage
console.log('🎯 Simple Template-Driven Generation System');
console.log('============================================\n');

const manager = new SimpleTemplateManager();

// Show available templates
async function showTemplates() {
    const templates = await manager.getSimpleTemplates();
    
    console.log('📋 Available Templates:\n');
    templates.forEach((template, index) => {
        console.log(`${index + 1}. ${template.displayName}`);
    });

    console.log('\n💡 Usage:');
    console.log('node src/templates/quick-template.js wizard 1    - Create template (1=Simplest)');
    console.log('node src/templates/quick-template.js generate    - Generate artifacts');
    console.log('\nExample Quick Start:');
    console.log('1. node src/templates/quick-template.js wizard 1');
    console.log('2. Fill out the template in VS Code');
    console.log('3. node src/templates/quick-template.js generate');
}

// Handle commands
const args = process.argv.slice(2);
const command = args[0];

if (command === 'wizard') {
    manager.runSimpleWizard().catch(console.error);
} else if (command === 'generate') {
    manager.generateFromTemplate().catch(console.error);
} else {
    showTemplates().catch(console.error);
}
