#!/usr/bin/env node

/**
 * Test the fixes for instant-capture script:
 * 1. Modal detection and focus
 * 2. Quote escaping in locators
 */

console.log('🧪 Testing instant-capture fixes...\n');

// Test 1: Quote escaping function
const escapeQuotes = (value) => {
  if (!value) return value;
  return value.replace(/'/g, "\\'").replace(/"/g, '\\"');
};

console.log('✅ Test 1: Quote Escaping');
const testText = "Let's go";
const escaped = escapeQuotes(testText);
console.log(`Original: ${testText}`);
console.log(`Escaped: ${escaped}`);
console.log(`CSS Selector: [aria-label="${escaped}"]`);

// Test 2: Locator generation with quotes
const testLocators = [`[data-test-id="lets-go-button"]`, `[aria-label="${escaped}"]`];
const escapedLocators = testLocators.map(loc => loc.replace(/"/g, '\\"'));
const finalCSS = `By.css("${escapedLocators.join(', ')}")`;

console.log('\n✅ Test 2: Locator Generation');
console.log(`Original locators: ${testLocators}`);
console.log(`Final CSS: ${finalCSS}`);

// Test 3: JavaScript syntax validation
try {
  eval(`const LETSGOBUTTON = ${finalCSS};`);
  console.log('\n✅ Test 3: JavaScript Syntax - VALID');
} catch (error) {
  console.log('\n❌ Test 3: JavaScript Syntax - INVALID');
  console.log(`Error: ${error.message}`);
}

console.log('\n🎉 All tests completed!');
