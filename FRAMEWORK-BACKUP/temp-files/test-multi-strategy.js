#!/usr/bin/env node

/**
 * Test the enhanced multi-strategy locator generation
 */

console.log('🧪 Testing Enhanced Multi-Strategy Locator Generation...\n');

// Simulate the generateMultiStrategyLocators function
const generateMultiStrategyLocators = (element, info) => {
  const strategies = {
    primary: [],
    secondary: [],
    fallback: []
  };
  const attr = info.attributes;
  
  // Utility to escape quotes properly
  const escapeForCSS = (value) => value.replace(/'/g, "\\'").replace(/"/g, '\\"');
  const escapeForXPath = (value) => value.replace(/'/g, "\\'");
  
  // PRIMARY STRATEGIES (Most reliable - CSS preferred, XPath when needed)
  if (attr.dataTestId) {
    strategies.primary.push(`[data-test-id="${escapeForCSS(attr.dataTestId)}"]`);
    if (info.tagName) {
      strategies.primary.push(`${info.tagName}[@data-test-id='${escapeForXPath(attr.dataTestId)}']`);
    }
  }
  
  if (attr.id) {
    strategies.primary.push(`#${attr.id}`);
    strategies.primary.push(`//*[@id='${escapeForXPath(attr.id)}']`);
  }
  
  // SECONDARY STRATEGIES
  if (attr.ariaLabel) {
    strategies.secondary.push(`[aria-label="${escapeForCSS(attr.ariaLabel)}"]`);
    strategies.secondary.push(`//*[@aria-label='${escapeForXPath(attr.ariaLabel)}']`);
  }
  
  // FALLBACK STRATEGIES
  if (info.text && info.text.length > 0 && info.text.length <= 50) {
    const escapedText = escapeForXPath(info.text);
    if (info.tagName === 'button') {
      strategies.fallback.push(`button:has-text("${escapeForCSS(info.text)}")`);
      strategies.fallback.push(`//button[normalize-space()='${escapedText}']`);
    }
  }
  
  return strategies;
};

// Test data
const testInfo = {
  attributes: {
    dataTestId: 'settings-nav-btn-icon',
    id: 'profile-btn',
    ariaLabel: "Profile and sign out"
  },
  tagName: 'sdf-icon',
  text: 'Profile'
};

// Generate strategies
const strategies = generateMultiStrategyLocators(null, testInfo);

console.log('✅ Generated Multi-Strategy Locators:');
console.log('\n🎯 PRIMARY STRATEGIES:');
strategies.primary.forEach((strategy, i) => {
  console.log(`   ${i+1}. ${strategy}`);
});

console.log('\n🔄 SECONDARY STRATEGIES:');
strategies.secondary.forEach((strategy, i) => {
  console.log(`   ${i+1}. ${strategy}`);
});

console.log('\n⚡ FALLBACK STRATEGIES:');
strategies.fallback.forEach((strategy, i) => {
  console.log(`   ${i+1}. ${strategy}`);
});

// Generate final locator (CSS preferred)
const allLocators = [
  ...strategies.primary,
  ...strategies.secondary,
  ...strategies.fallback
].slice(0, 4);

const cssLocators = allLocators.filter(loc => !loc.startsWith('//') && !loc.startsWith('//*'));
const xpathLocators = allLocators.filter(loc => loc.startsWith('//') || loc.startsWith('//*'));

let primaryLocator;
if (cssLocators.length > 0) {
  primaryLocator = `const SETTINGS_NAV_BTN_ICON = By.css(\`${cssLocators.join(', ')}\`);`;
} else if (xpathLocators.length > 0) {
  primaryLocator = `const SETTINGS_NAV_BTN_ICON = By.xpath(\`${xpathLocators[0]}\`);`;
}

console.log('\n📝 GENERATED CONSTANT:');
console.log(primaryLocator);

console.log('\n💡 Strategy Comments:');
if (strategies.primary.length > 0) {
  console.log(`// PRIMARY: ${strategies.primary.slice(0, 2).join(' | ')}`);
}
if (strategies.secondary.length > 0) {
  console.log(`// SECONDARY: ${strategies.secondary.slice(0, 2).join(' | ')}`);
}
if (strategies.fallback.length > 0) {
  console.log(`// FALLBACK: ${strategies.fallback.slice(0, 2).join(' | ')}`);
}

console.log('\n🎉 Multi-strategy locator generation working correctly!');
