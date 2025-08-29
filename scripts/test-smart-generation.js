#!/usr/bin/env node

/**
 * 🚨 SMART LOCATOR & METHOD GENERATION TEST
 * Tests intelligent locator generation and context-aware method implementations
 */

const fs = require('fs');
const path = require('path');
const BDDTemplateGeneratorCriticalFix = require('../src/generators/bdd-template-generator-critical-fix');

async function testSmartGeneration() {
    console.log('🧪 TESTING SMART LOCATOR & METHOD GENERATION');
    console.log('============================================\n');
    
    try {
        // Initialize generator
        console.log('1. Loading generator with smart generation capabilities...');
        const generator = new BDDTemplateGeneratorCriticalFix();
        
        // Create a comprehensive test template with many specific UI interactions
        const testTemplate = `
**Feature Title**: RS Page Tax Journey WS Integration
**Description**: Testing comprehensive tax journey with WS and RS interactions, login, search, navigation, ads verification

**As a** tax professional
**I want** to navigate through tax journey pages and verify content
**So that** I can complete tax processes efficiently

### Scenario 1: User Authentication and Homepage Search
**Given** An Associate user logs into Runmod
**Then** Alex searches for a homepage test IID
**When** Alex clicks on the "Home" Left Menu icon

### Scenario 2: Tax Journey Navigation
**Given** Alex is on the tax journey
**When** Alex clicks on WS additional components section
**Then** RS page should be displayed
**And** RS ads should be displayed

### Scenario 3: Cross-Page Navigation
**Given** Alex is on the WS page
**When** Alex clicks on the RS page link
**Then** RS and WC pages should be displayed
**And** RS and WC ads should be displayed

### Scenario 4: Content Verification
**Given** Alex is on the RS page
**When** Alex views the page content
**Then** Relevant information should be displayed
**And** Page elements should be properly formatted
        `;
        
        // Write test template
        const templatePath = path.join(__dirname, '../temp/smart-generation-test.md');
        const tempDir = path.dirname(templatePath);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        fs.writeFileSync(templatePath, testTemplate);
        console.log('✅ Comprehensive test template created');
        
        // Generate artifacts using smart generation
        console.log('\n2. Generating artifacts with smart locator and method generation...');
        const result = await generator.generateFromBDDTemplate(templatePath, 'smart-generation-test');
        
        if (result.success) {
            console.log('✅ Generation successful!');
            
            // Read generated page file for analysis
            const pageFile = path.join(__dirname, '../SBS_Automation/pages/smart-generation-test-page.js');
            const pageContent = fs.readFileSync(pageFile, 'utf8');
            
            console.log('\n3. Analyzing smart locator generation...');
            
            // Count locators
            const locatorPattern = /this\.\w+ = .+;/g;
            const locators = pageContent.match(locatorPattern) || [];
            
            // Count methods
            const methodPattern = /async (\w+)\(/g;
            const methods = [];
            let match;
            while ((match = methodPattern.exec(pageContent)) !== null) {
                if (match[1] !== 'constructor') {
                    methods.push(match[1]);
                }
            }
            
            console.log('\n📊 SMART GENERATION ANALYSIS:');
            console.log(`  Total locators generated: ${locators.length}`);
            console.log(`  Total methods generated: ${methods.length}`);
            
            console.log('\n🔍 LOCATOR INTELLIGENCE CHECK:');
            
            // Check for intelligent locators
            const intelligentLocators = [
                'loginForm', 'usernameField', 'passwordField', 'loginButton',
                'globalSearchBox', 'searchButton', 'searchResults',
                'homeMenuIcon', 'leftNavigation', 'navigationMenu',
                'taxJourneyPage', 'wsSection', 'wsPage', 'rsPage', 'rsPageHeader', 'rsPageLink',
                'adsContainer', 'rsAds', 'wcAds', 'pageContent', 'relevantInformation', 'formattedElements'
            ];
            
            let foundIntelligentLocators = 0;
            intelligentLocators.forEach(locator => {
                if (pageContent.includes(`this.${locator}`)) {
                    console.log(`  ✅ Found intelligent locator: ${locator}`);
                    foundIntelligentLocators++;
                } else {
                    console.log(`  ❌ Missing locator: ${locator}`);
                }
            });
            
            console.log('\n🔧 METHOD IMPLEMENTATION INTELLIGENCE CHECK:');
            
            // Check for method implementation diversity
            const uniqueImplementations = new Set();
            const implementationPattern = /async \w+\(\) \{\s*\n([\s\S]*?)\n  \}/g;
            let implMatch;
            while ((implMatch = implementationPattern.exec(pageContent)) !== null) {
                const implementation = implMatch[1].trim();
                uniqueImplementations.add(implementation);
            }
            
            console.log(`  Total unique implementations: ${uniqueImplementations.size}`);
            console.log(`  Implementation diversity: ${Math.round((uniqueImplementations.size / methods.length) * 100)}%`);
            
            // Check for specific smart implementations
            const smartImplementationChecks = [
                { name: 'Login with form fields', pattern: /usernameField.*passwordField.*loginButton/s },
                { name: 'Search with input and button', pattern: /globalSearchBox.*searchButton/s },
                { name: 'Menu navigation', pattern: /homeMenuIcon.*clickElement/s },
                { name: 'RS page verification', pattern: /rsPageHeader.*isVisible/s },
                { name: 'Ads verification', pattern: /rsAds.*isVisible/s },
                { name: 'Multiple element verification', pattern: /rsVisible.*wcVisible/s }
            ];
            
            let smartImplementationsFound = 0;
            smartImplementationChecks.forEach(check => {
                if (check.pattern.test(pageContent)) {
                    console.log(`  ✅ Found smart implementation: ${check.name}`);
                    smartImplementationsFound++;
                } else {
                    console.log(`  ❌ Missing implementation: ${check.name}`);
                }
            });
            
            console.log('\n🎯 ISSUE RESOLUTION VERIFICATION:');
            
            // Issue 1: Method implementation diversity
            if (uniqueImplementations.size >= methods.length * 0.7) {
                console.log('  ✅ ISSUE #1 FIXED: Method implementations are now diverse and context-specific');
            } else {
                console.log('  ❌ ISSUE #1 STILL EXISTS: Methods still have too similar implementations');
            }
            
            // Issue 2: Sufficient locators
            if (locators.length >= 10) {
                console.log('  ✅ ISSUE #2 FIXED: Generated sufficient locators for complex interactions');
            } else {
                console.log('  ❌ ISSUE #2 STILL EXISTS: Still insufficient locators for feature complexity');
            }
            
            console.log('\n📝 SAMPLE GENERATED CONTENT:');
            console.log('First 20 locators:');
            locators.slice(0, 20).forEach(locator => console.log(`    ${locator}`));
            
            console.log('\nFirst 5 methods:');
            methods.slice(0, 5).forEach(method => console.log(`    async ${method}()`));
            
            console.log('\n🎯 SUMMARY:');
            if (foundIntelligentLocators >= 15 && smartImplementationsFound >= 4) {
                console.log('✅ SMART GENERATION WORKING - Intelligent locators and context-aware methods generated');
                console.log('✅ Critical issues resolved - No more generic implementations');
                console.log('✅ Feature complexity properly reflected in generated code');
            } else {
                console.log('❌ SMART GENERATION NEEDS IMPROVEMENT');
                console.log(`   - Intelligent locators: ${foundIntelligentLocators}/15+`);
                console.log(`   - Smart implementations: ${smartImplementationsFound}/4+`);
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
testSmartGeneration();
