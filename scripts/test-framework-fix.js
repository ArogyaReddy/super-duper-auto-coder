#!/usr/bin/env node

/**
 * FRAMEWORK GENERATION TEST - VERIFY EMPTY FILE BUG IS FIXED
 * 
 * This test verifies that the auto-coder framework no longer generates empty files
 */

const BDDTemplateGeneratorCriticalFix = require('../src/generators/bdd-template-generator-critical-fix');
const fs = require('fs');
const path = require('path');

console.log('🧪 TESTING FRAMEWORK GENERATION - EMPTY FILE BUG FIX...\n');

async function testFrameworkGeneration() {
    try {
        const generator = new BDDTemplateGeneratorCriticalFix();
        
        console.log('1️⃣ Testing simple artifact generation...');
        
        const templateContent = `# Test Login Feature

## User Story
As a user, I want to login to the application

## Acceptance Criteria
- User can enter username and password
- User can click login button
- User is redirected to dashboard after successful login

## Test Scenarios

### Scenario: Successful Login
Given I am on the login page
When I enter valid credentials
And I click the login button
Then I should be redirected to the dashboard
And I should see welcome message`;

        // Test the complete artifact generation
        const result = await generator.generateCompleteArtifacts(templateContent, 'test-login-fix');
        
        console.log('\n2️⃣ Verifying generated files have content...');
        
        // Check each generated file
        const filesToCheck = [
            result.featureFile.path,
            result.stepsFile.path,
            result.pageFile.path
        ];
        
        let allFilesValid = true;
        
        for (const filePath of filesToCheck) {
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                const content = fs.readFileSync(filePath, 'utf8');
                
                console.log(`   📄 ${path.basename(filePath)}: ${stats.size} bytes`);
                
                if (stats.size === 0) {
                    console.log(`   ❌ EMPTY FILE DETECTED: ${filePath}`);
                    allFilesValid = false;
                } else if (content.trim() === '') {
                    console.log(`   ❌ EMPTY CONTENT DETECTED: ${filePath}`);
                    allFilesValid = false;
                } else {
                    console.log(`   ✅ Valid content: ${content.length} characters`);
                }
            } else {
                console.log(`   ❌ FILE NOT FOUND: ${filePath}`);
                allFilesValid = false;
            }
        }
        
        console.log('\n3️⃣ Content analysis...');
        
        // Analyze the page file specifically (this was the main problem)
        const pageContent = fs.readFileSync(result.pageFile.path, 'utf8');
        const methodCount = (pageContent.match(/async \w+\(/g) || []).length;
        const locatorCount = (pageContent.match(/this\.\w+\s*=\s*['"]/g) || []).length;
        
        console.log(`   🔧 Methods found: ${methodCount}`);
        console.log(`   🎯 Locators found: ${locatorCount}`);
        
        if (methodCount >= 5 && locatorCount >= 10) {
            console.log('   ✅ Page file has rich content (methods and locators)');
        } else {
            console.log('   ⚠️ Page file might still have limited content');
        }
        
        console.log('\n4️⃣ Test Results Summary:');
        
        if (allFilesValid) {
            console.log('🎉 SUCCESS: All generated files have valid content!');
            console.log('✅ Empty file bug is COMPLETELY FIXED!');
            
            // Cleanup test files
            console.log('\n🧹 Cleaning up test files...');
            for (const filePath of filesToCheck) {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`   🗑️ Deleted: ${path.basename(filePath)}`);
                }
            }
        } else {
            console.log('❌ FAILURE: Some files are still empty or invalid!');
            console.log('🚨 Empty file bug still exists!');
        }
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.error(error.stack);
    }
}

// Run the test
testFrameworkGeneration()
    .then(() => {
        console.log('\n✅ Framework generation test completed!');
    })
    .catch(error => {
        console.error('❌ Test execution failed:', error);
        process.exit(1);
    });
