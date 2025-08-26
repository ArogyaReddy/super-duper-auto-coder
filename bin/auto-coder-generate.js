#!/usr/bin/env node

/**
 * 🎯 AUTO-CODER DIRECT GENERATOR
 * Generate Feature + Steps + Page → Ready to Run
 */

const path = require('path');
const SimpleCucumberAdapter = require('../src/adapters/simple-cucumber-adapter');

async function generateArtifacts() {
    const requirementFile = process.argv[2];
    const outputDir = process.argv[4] || './SBS_Automation';
    
    if (!requirementFile) {
        console.error('❌ Usage: node bin/auto-coder-generate.js <requirement-file> --output <output-dir>');
        process.exit(1);
    }
    
    try {
        console.log('🚀 Auto-Coder Generation');
        console.log('=========================');
        console.log(`📄 Reading: ${requirementFile}`);
        console.log(`📁 Output: ${outputDir}`);
        console.log('🎯 Generating artifacts...');
        
        const adapter = new SimpleCucumberAdapter();
        await adapter.initialize();
        
        const result = await adapter.generateArtifacts({
            requirementFile,
            outputDir
        });
        
        console.log('\\n🎉 SUCCESS! Generated:');
        console.log(`   ├── 🥒 Feature: ${path.basename(result.files.feature)}`);
        console.log(`   ├── 🎯 Steps: ${path.basename(result.files.steps)}`);
        console.log(`   └── 📄 Page: ${path.basename(result.files.page)}`);
        console.log(`\\n📂 Location: ${outputDir}`);
        console.log('\\n✅ Ready to run: npm run test:features');
        
    } catch (error) {
        console.error('❌ Generation failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    generateArtifacts();
}
