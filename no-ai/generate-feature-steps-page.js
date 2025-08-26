// Unified extraction logic for requirement formats
// Supports: 1) Acceptance Criteria/Summary/Paragraphs, 2) Explicit BDD Steps, 3) Mixed Mode
// See comments for details on each mode

// Combined generator: requirement -> feature -> steps -> page (NO AI)
// Usage: node generate-feature-steps-page.js <requirementFile> <baseName>

const fs = require('fs');
const path = require('path');

const requirementFile = process.argv[2] || path.resolve(__dirname, '../requirements/text/jira-story-employee-contrator.txt');
const inputBaseName = process.argv[3] || path.basename(requirementFile, path.extname(requirementFile));

// Convert baseName to kebab-case for file naming (SBS standard)
function toKebabCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')  // Handle camelCase/PascalCase
    .replace(/[_\s]+/g, '-')                  // Replace underscores and spaces with hyphens
    .toLowerCase();
}

const baseName = toKebabCase(inputBaseName);
const featureFile = path.resolve(__dirname, `../SBS_Automation/features/${baseName}.feature`);
const stepsFile = path.resolve(__dirname, `../SBS_Automation/steps/${baseName}-steps.js`);
const pageFile = path.resolve(__dirname, `../SBS_Automation/pages/${baseName}-page.js`);

// 1. Read requirement file
const content = fs.readFileSync(requirementFile, 'utf8');

// Filter out template metadata and comments
function filterTemplateMetadata(content) {
  return content
    // Remove HTML comments (template metadata)
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove template instruction lines
    .replace(/^.*🎯.*$/gm, '')
    .replace(/^.*📅.*$/gm, '')
    .replace(/^.*📝.*$/gm, '')
    .replace(/^.*📋.*$/gm, '')
    .replace(/^.*🚀.*$/gm, '')
    .replace(/^.*💡.*$/gm, '')
    // Remove "return to CLI" type instructions
    .replace(/.*return to CLI.*/gi, '')
    .replace(/.*Return to CLI.*/gi, '')
    // Remove template placeholder instructions
    .replace(/.*Fill in your requirements.*/gi, '')
    .replace(/.*Replace all.*placeholder.*/gi, '')
    // Clean up extra whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

const filteredContent = filterTemplateMetadata(content);

// 2. Parse file content for BDD steps and acceptance criteria (IMPROVED)
const lines = filteredContent.split('\n');
let acceptanceCriteria = [];
let bddSteps = [];
let tags = [];
let isInBDDSection = false;
let isInAcceptanceSection = false;

lines.forEach(line => {
  const trimmed = line.trim();
  
  // Skip empty lines and feature headers
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('Feature:')) {
    return;
  }
  
  // Extract tags
  if (trimmed.startsWith('@')) {
    tags.push(trimmed);
    return;
  }
  
  // Detect sections
  if (/^BDD Steps?:/i.test(trimmed)) {
    isInBDDSection = true;
    isInAcceptanceSection = false;
    return;
  }
  
  if (/^Acceptance Criteria:/i.test(trimmed)) {
    isInAcceptanceSection = true;
    isInBDDSection = false;
    return;
  }
  
  // Parse BDD steps (must be properly formatted)
  const bddMatch = /^(Given|When|Then|And)\s+(.+)/i.exec(trimmed);
  if (bddMatch) {
    const keyword = bddMatch[1];
    const stepText = bddMatch[2].trim();
    if (stepText.length > 0) {
      bddSteps.push(`${keyword} ${stepText}`);
    }
    return;
  }
  
  // Parse acceptance criteria (bullet points or plain text)
  if (isInAcceptanceSection || /^[-*•]\s*/.test(trimmed) || /^\d+[\.)]\s*/.test(trimmed)) {
    let criteriaText = trimmed
      .replace(/^[-*•]\s*/, '')
      .replace(/^\d+[\.)]\s*/, '')
      .trim();
    
    if (criteriaText.length > 0 && !bddMatch) {
      acceptanceCriteria.push(criteriaText);
    }
    return;
  }
  
  // Handle other text that might be acceptance criteria
  if (!isInBDDSection && trimmed.length > 0 && !bddMatch) {
    acceptanceCriteria.push(trimmed);
  }
});

// 3. Generate scenarios (SIMPLIFIED)
let scenarios = [];

if (bddSteps.length > 0) {
  // Use explicit BDD steps
  scenarios.push({
    title: baseName.replace(/-/g, ' ').replace(/\d+$/, ''),
    steps: bddSteps
  });
} else if (acceptanceCriteria.length > 0) {
  // Convert acceptance criteria to BDD
  const convertedSteps = [];
  acceptanceCriteria.forEach((criteria, idx) => {
    // Clean up user story format
    let cleanCriteria = criteria
      .replace(/^As a (user|admin|customer|tester),?\s*/i, '')
      .replace(/^I want to\s*/i, '')
      .replace(/^I should be able to\s*/i, '')
      .replace(/^I need to\s*/i, '')
      .replace(/^When I\s*/i, '')
      .replace(/^Then I\s*/i, '')
      .trim();
      
    if (cleanCriteria.length > 0) {
      // Distribute across BDD keywords
      if (idx === 0) {
        convertedSteps.push(`Given ${cleanCriteria}`);
      } else if (idx === 1) {
        convertedSteps.push(`When ${cleanCriteria}`);
      } else if (idx === 2) {
        convertedSteps.push(`Then ${cleanCriteria}`);
      } else {
        convertedSteps.push(`And ${cleanCriteria}`);
      }
    }
  });
  
  scenarios.push({
    title: baseName.replace(/-/g, ' ').replace(/\d+$/, ''),
    steps: convertedSteps.length > 0 ? convertedSteps : ['Given I am on the application', 'When I perform an action', 'Then I should see the expected result']
  });
} else {
  // Fallback scenario
  scenarios.push({
    title: baseName.replace(/-/g, ' ').replace(/\d+$/, ''),
    steps: ['Given I am on the application', 'When I perform an action', 'Then I should see the expected result']
  });
}

// 4. Generate feature file (CLEAN FORMAT)
let feature = '@Team:SBSBusinessContinuity\n@jira=AUTO-' + Date.now() + '\n@parentSuite:AutoGenerated\n@regression @critical\n';
if (tags.length > 0) feature += tags.join(' ') + '\n';
feature += `Feature: ${baseName.replace(/-/g, ' ')}\n\n`;

// Add mandatory Background steps (SBS standard)
feature += `  Background:\n`;
feature += `    Given Alex is logged into RunMod with a homepage test client\n`;
feature += `    Then Alex verifies that the Payroll section on the Home Page is displayed\n\n`;

scenarios.forEach((scenario, idx) => {
  feature += `  Scenario: ${scenario.title}\n`;
  scenario.steps.forEach(step => {
    const cleanStep = step.trim();
    if (cleanStep && cleanStep.length > 0) {
      // Ensure step starts with proper BDD keyword
      if (!/^(Given|When|Then|And)\s+/i.test(cleanStep)) {
        feature += `    Given ${cleanStep}\n`;
      } else {
        feature += `    ${cleanStep}\n`;
      }
    }
  });
  feature += '\n';
});

fs.writeFileSync(featureFile, feature);
console.log(`✅ Feature file generated: ${featureFile}`);

// 4. Generate steps file
function toMethodName(stepText) {
  // Use a short, meaningful summary for method names
  let summary = stepText.split(' ').slice(0, 5).join(' '); // first 5 words
  summary = summary.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  if (summary.length < 3) summary = stepText.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  // Remove all hard-coded keyword mappings
  return summary.split(' ').map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)).join('');
}
function toPageObjectName(baseName) {
  // PascalCase for PageObject
  return baseName.replace(/(^|[-_])(\w)/g, (_, __, chr) => chr.toUpperCase()) + 'Page';
}
let stepsCode = `const { Given, When, Then } = require('@cucumber/cucumber');
const { assert } = require('chai');
const ${toPageObjectName(baseName)} = require('../../pages/${baseName}-page');

let pageObject;

`;
scenarios.forEach((sc, idx) => {
  let prevKeyword = 'Given';
  sc.steps.forEach(step => {
    let keyword = step.split(' ')[0];
    let text = step.substring(keyword.length + 1);
    
    // Only process valid BDD keywords
    if (!['Given', 'When', 'Then', 'And'].includes(keyword)) {
      return; // Skip invalid keywords
    }
    
    if (keyword === 'And') keyword = prevKeyword;
    // Parameter extraction: <param> or {string}
    const paramMatch = text.match(/<([^>]+)>|\{([^}]+)\}/);
    let param = paramMatch ? paramMatch[1] || paramMatch[2] : null;
    // Escape quotes/special chars in step text
    const stepTextEscaped = text.replace(/'/g, "\\'").replace(/"/g, '\\"');
    const methodName = toMethodName(text);
    // Only generate valid steps with unique context to avoid ambiguous steps
    if (methodName && methodName !== '' && text.trim().length > 0) {
      // Add page context to avoid ambiguous steps
      const pageContext = ` on ${baseName.replace(/-/g, ' ')} page`;
      const uniqueStepText = stepTextEscaped + pageContext;
      
      if (param) {
        stepsCode += `${keyword}('${uniqueStepText}', { timeout: 60 * 1000 }, async function (${param}) {\n  pageObject = new ${toPageObjectName(baseName)}(this.page);\n  const result = await pageObject.${methodName}(${param});\n  assert.isTrue(result, 'Step executed');\n});\n\n`;
      } else {
        stepsCode += `${keyword}('${uniqueStepText}', { timeout: 60 * 1000 }, async function () {\n  pageObject = new ${toPageObjectName(baseName)}(this.page);\n  const result = await pageObject.${methodName}();\n  assert.isTrue(result, 'Step executed');\n});\n\n`;
      }
    }
    prevKeyword = keyword;
  });
});
fs.writeFileSync(stepsFile, stepsCode);
console.log(`✅ Steps file generated: ${stepsFile}`);

// 6. Generate page file (CRITICAL RULES ENFORCED + FALLBACK LOCATORS)
let pageCode = `const BasePage = require('../common/base-page');
const By = require('../../support/By.js');

// Primary/Secondary/Fallback Locator Strategy
const PAGE_TITLE_PRIMARY = By.css('[data-test-id="page-header-title"]');
const PAGE_TITLE_SECONDARY = By.xpath('//h1[contains(@class, "page-title")]');
const PAGE_TITLE_FALLBACK = By.xpath('//span[contains(text(), "Title")]');

const MAIN_CONTENT_PRIMARY = By.css('[data-test-id="main-content"]');
const MAIN_CONTENT_SECONDARY = By.css('[data-test-id="page-content"]');
const MAIN_CONTENT_FALLBACK = By.css('.page-content, .main-content');

const BTN_ELEMENT = (btnName) => By.xpath(\`//sdf-button[contains(text(), "\${btnName}")]\`);
const LINK_ELEMENT = (linkText) => By.xpath(\`//a[contains(text(), "\${linkText}")]\`);
const ELEMENT_BY_TEXT = (elementText) => By.xpath(\`//*[contains(text(), "\${elementText}")]\`);

`;

let methodNames = new Set();
let methods = '';

scenarios.forEach((sc, idx) => {
  sc.steps.forEach(step => {
    const text = step.replace(/^(Given|When|Then|And) /, '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    const methodName = toMethodName(text);
    
    // CRITICAL RULE: Check for quoted parameters
    const paramMatch = text.match(/"([^"]+)"/);
    const hasParameter = paramMatch !== null;
    
    if (!methodNames.has(methodName) && methodName && methodName !== '') {
      if (hasParameter) {
        if (text.toLowerCase().includes('button')) {
          methods += `  async ${methodName}(buttonName) {
    const buttonLocator = BTN_ELEMENT(buttonName);
    await this.click(buttonLocator);
  }

`;
        } else if (text.toLowerCase().includes('link')) {
          methods += `  async ${methodName}(linkText) {
    const linkLocator = LINK_ELEMENT(linkText);
    await this.click(linkLocator);
  }

`;
        } else {
          methods += `  async ${methodName}(elementText) {
    const elementLocator = ELEMENT_BY_TEXT(elementText);
    return await this.isVisible(elementLocator);
  }

`;
        }
      } else {
        methods += `  async ${methodName}() {
    const titleLocator = await this.findElementWithFallback(
      PAGE_TITLE_PRIMARY,
      PAGE_TITLE_SECONDARY,
      PAGE_TITLE_FALLBACK
    );
    return await this.isVisible(titleLocator);
  }

`;
      }
      methodNames.add(methodName);
    }
  });
});

pageCode += `
class ${toPageObjectName(baseName)} extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }

  // Helper method for Primary/Secondary/Fallback locator strategy
  async findElementWithFallback(primaryLocator, secondaryLocator, fallbackLocator) {
    if (await this.isVisible(primaryLocator)) {
      return primaryLocator;
    }
    if (await this.isVisible(secondaryLocator)) {
      return secondaryLocator;
    }
    if (await this.isVisible(fallbackLocator)) {
      return fallbackLocator;
    }
    throw new Error(\`Element not found with Primary: \${primaryLocator}, Secondary: \${secondaryLocator}, Fallback: \${fallbackLocator}\`);
  }

${methods}  async isPageDisplayed() {
    const titleLocator = await this.findElementWithFallback(
      PAGE_TITLE_PRIMARY,
      PAGE_TITLE_SECONDARY,
      PAGE_TITLE_FALLBACK
    );
    return await this.isVisible(titleLocator);
  }
}

module.exports = ${toPageObjectName(baseName)};
`;

fs.writeFileSync(pageFile, pageCode);
console.log(`✅ Page file generated: ${pageFile}`);

// Helper function to segment steps
function segmentSteps(text) {
  // For BDD steps that already have keywords, don't split them
  if (/^(Given|When|Then|And)\s+/i.test(text)) {
    return [text]; // Return as-is if it's already a properly formatted BDD step
  }
  
  // Only split non-BDD text at full stops, avoiding conjunctions that break BDD flow
  let segments = text.split(/\.(?!\d)/).map(s => s.trim()).filter(Boolean);
  let finalSegments = [];
  segments.forEach(seg => {
    // For non-BDD text, split only at sentence boundaries, not BDD keywords
    if (seg.length > 120) { // Only split very long sentences
      let parts = seg.split(/\b(And|Therefore|Such that)\b/i).map(p => p.trim()).filter(Boolean);
      finalSegments.push(...parts);
    } else {
      finalSegments.push(seg);
    }
  });
  return finalSegments.filter(Boolean);
}
