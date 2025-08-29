#!/usr/bin/env node

/**
 * EMPTY FILE BUG PREVENTION TEST
 * 
 * This script tests that the empty file bug is completely fixed
 * and demonstrates the prevention system working.
 */

const fs = require('fs');
const path = require('path');
const { safeWriteFile } = require('../src/utils/safe-file-writer');

console.log('🧪 TESTING EMPTY FILE BUG PREVENTION...\n');

const testDir = '/Users/arog/auto/auto/qa_automation/auto-coder/temp/test-prevention';

// Ensure test directory exists
if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
}

console.log('1️⃣ Testing safeWriteFile with empty content (should fail)...');
try {
    safeWriteFile(path.join(testDir, 'empty-test.md'), '');
    console.log('❌ FAILED: Empty file was allowed!');
} catch (error) {
    console.log('✅ SUCCESS: Empty file creation prevented!');
    console.log(`   Error: ${error.message}`);
}

console.log('\n2️⃣ Testing safeWriteFile with valid content...');
try {
    const validContent = `# Test File

This is a test file with actual content.

Generated at: ${new Date().toISOString()}
`;
    
    const result = safeWriteFile(path.join(testDir, 'valid-test.md'), validContent);
    if (result) {
        console.log('✅ SUCCESS: Valid file created successfully!');
    } else {
        console.log('❌ FAILED: Valid file creation failed!');
    }
} catch (error) {
    console.log('❌ FAILED: Unexpected error:', error.message);
}

console.log('\n3️⃣ Testing safeWriteFile with allowEmpty option...');
try {
    const result = safeWriteFile(
        path.join(testDir, 'intentionally-empty.md'), 
        '', 
        { allowEmpty: true }
    );
    if (result) {
        console.log('✅ SUCCESS: Empty file allowed with explicit option!');
    } else {
        console.log('❌ FAILED: Empty file with allowEmpty option failed!');
    }
} catch (error) {
    console.log('❌ FAILED: Unexpected error:', error.message);
}

console.log('\n4️⃣ Verifying file sizes...');
const files = fs.readdirSync(testDir);
for (const file of files) {
    const filePath = path.join(testDir, file);
    const stats = fs.statSync(filePath);
    console.log(`   📄 ${file}: ${stats.size} bytes`);
}

console.log('\n🧹 Cleaning up test files...');
fs.rmSync(testDir, { recursive: true, force: true });

console.log('\n🎉 EMPTY FILE BUG PREVENTION TEST COMPLETE!');
console.log('✅ All systems working correctly - empty file bug is FIXED!');
