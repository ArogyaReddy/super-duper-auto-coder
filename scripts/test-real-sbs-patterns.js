#!/usr/bin/env node

const BDDTemplateGeneratorCriticalFix = require('../src/generators/bdd-template-generator-critical-fix');
const fs = require('fs');

console.log('🧪 TESTING REAL SBS PATTERN IMPLEMENTATION...\n');

async function testRealSBSPatterns() {
    try {
        const generator = new BDDTemplateGeneratorCriticalFix();
        
        console.log('1️⃣ Creating test template...');
        const testContent = `# Test Real SBS Patterns

## Scenarios
Given Alex is logged into RunMod
When Alex clicks on payroll  
Then Alex sees payroll page`;

        fs.writeFileSync('./temp/test-real-sbs.md', testContent);
        
        console.log('2️⃣ Generating artifacts with real SBS patterns...');
        await generator.generateFromBDDTemplate('./temp/test-real-sbs.md', 'test-real-sbs');
        
        console.log('3️⃣ Analyzing generated page file for real SBS patterns...');
        const pageFile = './SBS_Automation/pages/test-real-sbs-page.js';
        
        if (fs.existsSync(pageFile)) {
            const content = fs.readFileSync(pageFile, 'utf8');
            
            console.log('\n📊 REAL SBS PATTERN ANALYSIS:');
            console.log(`   ✅ By.xpath patterns: ${content.includes('By.xpath') ? '✓ FOUND' : '✗ MISSING'}`);
            console.log(`   ✅ By.css patterns: ${content.includes('By.css') ? '✓ FOUND' : '✗ MISSING'}`);
            console.log(`   ✅ support/By.js import: ${content.includes('support/By.js') ? '✓ FOUND' : '✗ MISSING'}`);
            console.log(`   ✅ BasePage import: ${content.includes('base-page') ? '✓ FOUND' : '✗ MISSING'}`);
            console.log(`   ✅ Extends BasePage: ${content.includes('extends BasePage') ? '✓ FOUND' : '✗ MISSING'}`);
            console.log(`   ✅ clickElement method: ${content.includes('clickElement') ? '✓ FOUND' : '✗ MISSING'}`);
            console.log(`   ✅ waitForSelector method: ${content.includes('waitForSelector') ? '✓ FOUND' : '✗ MISSING'}`);
            
            const realSBSCount = [
                content.includes('By.xpath'),
                content.includes('By.css'),  
                content.includes('support/By.js'),
                content.includes('base-page'),
                content.includes('extends BasePage'),
                content.includes('clickElement'),
                content.includes('waitForSelector')
            ].filter(Boolean).length;
            
            console.log(`\n🎯 REAL SBS COMPLIANCE: ${realSBSCount}/7 patterns (${Math.round(realSBSCount/7*100)}%)`);
            
            if (realSBSCount >= 5) {
                console.log('🎉 SUCCESS: Framework is now using real SBS patterns!');
            } else {
                console.log('⚠️ WARNING: Some real SBS patterns still missing');
            }
            
            // Show a sample of the generated content
            console.log('\n📄 SAMPLE GENERATED CONTENT:');
            console.log(content.substring(0, 300) + '...');
            
        } else {
            console.log('❌ ERROR: Page file not generated');
        }
        
        console.log('\n4️⃣ Cleaning up test files...');
        // Clean up test files
        const filesToClean = [
            './temp/test-real-sbs.md',
            './SBS_Automation/features/test-real-sbs.feature',
            './SBS_Automation/steps/test-real-sbs-steps.js',
            './SBS_Automation/pages/test-real-sbs-page.js'
        ];
        
        for (const file of filesToClean) {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
                console.log(`   🗑️ Cleaned: ${file}`);
            }
        }
        
        console.log('\n✅ REAL SBS PATTERN TEST COMPLETE!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testRealSBSPatterns();
