#!/usr/bin/env node

/**
 * 🚨 CRITICAL BUG FIX VERIFICATION TEST
 * Tests that steps methods are now properly implemented in page files
 */

const fs = require('fs');
const path = require('path');
const BDDTemplateGeneratorCriticalFix = require('../src/generators/bdd-template-generator-critical-fix');

async function testCriticalBugFix() {
    console.log('🧪 TESTING CRITICAL BUG FIX - Method Matching');
    console.log('=============================================\n');
    
    try {
        // Initialize generator with reference patterns
        console.log('1. Loading generator with fixed method extraction...');
        const generator = new BDDTemplateGeneratorCriticalFix();
        
        // Create a test template with multiple specific scenarios
        const testTemplate = `
**Feature Title**: Tax Journey WS RS Integration
**Description**: Testing WS and RS page interactions

**As a** user
**I want** to navigate through tax journey pages
**So that** I can complete tax processes

### Scenario 1: Tax Journey Navigation
**Given** Alex is on the tax journey
**When** Alex clicks on WS additional components section
**Then** RS page should be displayed
**And** RS ads should be displayed

### Scenario 2: WS to RS Navigation
**Given** Alex is on the WS page
**When** Alex clicks on the RS page link
**Then** RS and WC pages should be displayed
**And** RS and WC ads should be displayed

### Scenario 3: RS Page Content Verification
**Given** Alex is on the RS page
**When** Alex views the page content
**Then** Relevant information should be displayed
**And** Page elements should be properly formatted
        `;
        
        // Write test template
        const templatePath = path.join(__dirname, '../temp/critical-bug-test-template.md');
        const tempDir = path.dirname(templatePath);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        fs.writeFileSync(templatePath, testTemplate);
        console.log('✅ Complex test template created');
        
        // Generate artifacts using fixed generator
        console.log('\n2. Generating artifacts with fixed method extraction...');
        const result = await generator.generateFromBDDTemplate(templatePath, 'critical-bug-test');
        
        if (result.success) {
            console.log('✅ Generation successful!');
            
            // Read generated files for detailed analysis
            const stepsFile = path.join(__dirname, '../SBS_Automation/steps/critical-bug-test-steps.js');
            const pageFile = path.join(__dirname, '../SBS_Automation/pages/critical-bug-test-page.js');
            
            const stepsContent = fs.readFileSync(stepsFile, 'utf8');
            const pageContent = fs.readFileSync(pageFile, 'utf8');
            
            console.log('\n3. Analyzing method matching...');
            
            // Extract methods from steps file
            const stepsMethodPattern = /await new \w+\(this\.page\)\.(\w+)\(/g;
            const stepsMethods = [];
            let match;
            while ((match = stepsMethodPattern.exec(stepsContent)) !== null) {
                if (!stepsMethods.includes(match[1])) {
                    stepsMethods.push(match[1]);
                }
            }
            
            // Extract methods from page file
            const pageMethodPattern = /async (\w+)\(/g;
            const pageMethods = [];
            while ((match = pageMethodPattern.exec(pageContent)) !== null) {
                if (match[1] !== 'constructor' && !pageMethods.includes(match[1])) {
                    pageMethods.push(match[1]);
                }
            }
            
            console.log('\n📋 METHOD ANALYSIS:');
            console.log('  Steps calls these methods:', stepsMethods);
            console.log('  Page implements these methods:', pageMethods);
            
            // Check for missing methods
            const missingMethods = stepsMethods.filter(method => !pageMethods.includes(method));
            
            console.log('\n🔍 CRITICAL BUG VERIFICATION:');
            if (missingMethods.length === 0) {
                console.log('  ✅ ALL METHODS MATCH - Critical bug is FIXED!');
                console.log('  ✅ Every step method call has corresponding page implementation');
            } else {
                console.log('  ❌ CRITICAL BUG STILL EXISTS!');
                console.log('  ❌ Missing methods:', missingMethods);
            }
            
            // Validate using built-in validation
            console.log('\n4. Built-in validation results...');
            const validation = result.validation || { isCompliant: false, issues: ['No validation performed'] };
            
            console.log(`  Compliance: ${validation.isCompliant ? '✅ PASSED' : '❌ FAILED'}`);
            if (!validation.isCompliant) {
                validation.issues.forEach(issue => console.log(`    - ${issue}`));
            }
            
            if (validation.methodsValidation) {
                console.log(`  Methods validation - Missing: [${validation.methodsValidation.missingMethods.join(', ')}]`);
            }
            
            console.log('\n🎯 SUMMARY:');
            if (missingMethods.length === 0) {
                console.log('✅ CRITICAL BUG FIXED - Steps and Page methods are now synchronized');
                console.log('✅ Generated artifacts are now functional and ready to use');
                console.log('✅ Method extraction pattern correctly matches SBS_Automation pattern');
            } else {
                console.log('❌ CRITICAL BUG STILL EXISTS - Further fixes needed');
                console.log('❌ Method synchronization between steps and pages failed');
            }
            
        } else {
            console.error('❌ Generation failed:', result.error);
        }
        
        // Cleanup
        if (fs.existsSync(templatePath)) {
            fs.unlinkSync(templatePath);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

// Run the test
testCriticalBugFix();
