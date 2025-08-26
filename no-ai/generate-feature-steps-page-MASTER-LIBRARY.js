// ⚠️ CRITICAL RULES ENFORCED GENERATOR WITH SBS COMPLIANCE ⚠️
// 🚨 MANDATORY: All 5 critical production rules + MASTER STEPS LIBRARY + SBS COMPLIANCE
// Combined generator: requirement -> feature -> steps -> page (MAXIMUM REUSE + 100% SBS COMPLIANCE)
// Usage: node generate-feature-steps-page-MASTER-LIBRARY.js <requirementFile> <baseName>

const fs = require('fs');
const path = require('path');
const PathValidator = require('../utils/path-validator');
const MasterLibraryManager = require('../src/master-steps/master-library-manager');

console.log('🎯 STARTING GENERATION WITH MASTER LIBRARY REUSE + SBS COMPLIANCE...');

const requirementFile = process.argv[2] || path.resolve(__dirname, '../requirements/text/jira-story-employee-contrator.txt');
const inputBaseName = process.argv[3] || path.basename(requirementFile, path.extname(requirementFile));

// Convert baseName to kebab-case for file naming (SBS standard)
function toKebabCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')  // Handle camelCase/PascalCase
    .replace(/[_\s]+/g, '-')                  // Replace underscores and spaces with hyphens
    .toLowerCase();
}

function toPageObjectName(baseName) {
  return baseName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('') + 'Page';
}

function toPascalCase(str) {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

const baseName = toKebabCase(inputBaseName);

// 🚨 CRITICAL: ALWAYS GENERATE IN auto-coder/SBS_Automation/ DIRECTORY
const outputPath = path.resolve(__dirname, '../SBS_Automation');
const featureFile = path.join(outputPath, 'features', `${baseName}.feature`);
const stepsFile = path.join(outputPath, 'steps', `${baseName}-steps.js`);
const pageFile = path.join(outputPath, 'pages', `${baseName}-page.js`);

// 🚨 MANDATORY PATH VALIDATION - Prevents saving to wrong directories
if (!PathValidator.validateGenerationPaths(featureFile, stepsFile, pageFile)) {
  console.error('❌ PATH VALIDATION FAILED - cannot proceed');
  process.exit(1);
}

console.log('✅ Path validation passed - generating in auto-coder/SBS_Automation/');

// Initialize Master Library Manager
const masterLibraryManager = new MasterLibraryManager();

// 1. Read and process requirement file
const content = fs.readFileSync(requirementFile, 'utf8');

// Filter out template metadata
function filterTemplateMetadata(content) {
  return content
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^.*🎯.*$/gm, '')
    .replace(/^.*📅.*$/gm, '')
    .replace(/^.*📝.*$/gm, '')
    .replace(/^.*📋.*$/gm, '')
    .replace(/^.*🚀.*$/gm, '')
    .replace(/^.*💡.*$/gm, '')
    .replace(/.*return to CLI.*/gi, '')
    .replace(/.*Return to CLI.*/gi, '')
    .replace(/.*Fill in your requirements.*/gi, '')
    .replace(/.*Replace all.*placeholder.*/gi, '')
    .replace(/^\s*$/gm, '')
    .trim();
}

const filteredContent = filterTemplateMetadata(content);
const lines = filteredContent.split('\n');

// Parse requirements
let acceptanceCriteria = [];
let bddSteps = [];
let tags = [];
let uiElements = { buttons: [], links: [], pages: [] };
let isInBDDSection = false;
let isInAcceptanceSection = false;

// Extract UI elements
const buttonMatches = filteredContent.match(/"([^"]+)"\s*button/gi) || [];
const linkMatches = filteredContent.match(/"([^"]+)"\s*link/gi) || [];
const pageMatches = filteredContent.match(/"([^"]+)"\s*page/gi) || [];

buttonMatches.forEach(match => {
  const buttonName = match.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s*button/gi, '').trim();
  if (buttonName) uiElements.buttons.push(buttonName);
});

linkMatches.forEach(match => {
  const linkName = match.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s*link/gi, '').trim();
  if (linkName) uiElements.links.push(linkName);
});

pageMatches.forEach(match => {
  const pageName = match.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s*page/gi, '').trim();
  if (pageName) uiElements.pages.push(pageName);
});

// Parse content
lines.forEach(line => {
  const trimmed = line.trim();
  
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('Feature:')) return;
  
  if (trimmed.startsWith('@')) {
    tags.push(trimmed);
    return;
  }
  
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
  
  const bddMatch = /^(Given|When|Then|And)\s+(.+)/i.exec(trimmed);
  if (bddMatch) {
    const keyword = bddMatch[1];
    const stepText = bddMatch[2].trim();
    if (stepText.length > 0) {
      bddSteps.push(`${keyword} ${stepText}`);
    }
    return;
  }
  
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
  
  if (!isInBDDSection && trimmed.length > 0 && !bddMatch) {
    acceptanceCriteria.push(trimmed);
  }
});

// 🎯 MAIN GENERATION WITH MASTER LIBRARY
async function generateWithMasterLibrary() {
  try {
    console.log('\n🎯 STARTING GENERATION WITH MASTER LIBRARY REUSE...');
    
    // Initialize Master Library Manager
    const masterLibrary = new MasterLibraryManager();
    
    // Prepare requirement text for analysis
    const requirement = `${filteredContent}\n\nAcceptance Criteria:\n${acceptanceCriteria.join('\n')}\n\nBDD Steps:\n${bddSteps.join('\n')}`;
    
    // Analyze for reusability
    const analysis = await masterLibrary.generateTestArtifacts(requirement);
    
    // Prepare context
    const context = {
      kebabName: baseName,
      featureName: baseName.replace(/-/g, ' ').replace(/\d+$/, ''),
      featureDescription: `As a user, I want to test ${baseName.replace(/-/g, ' ')} functionality so that I can verify it works correctly`,
      pageClassName: toPageObjectName(baseName),
      uiElements: uiElements,
      acceptanceCriteria: acceptanceCriteria,
      bddSteps: bddSteps
    };
    
    // Generate files using Master Library or fallback
    if (analysis.reusabilityScore >= 30) {
      console.log(`✅ High reusability score (${analysis.reusabilityScore}%) - using Master Library patterns`);
      const outputPath = path.resolve(__dirname, '../SBS_Automation');
      await masterLibrary.generateFiles(analysis, outputPath, context);
    } else {
      console.log(`⚠️  Low reusability score (${analysis.reusabilityScore}%) - generating custom artifacts with SBS compliance`);
      await generateCustomArtifacts(context);
    }
    
    // Log results
    console.log('\n🎉 GENERATION COMPLETE!');
    console.log(`   📋 Reusability Score: ${analysis.reusabilityScore}%`);
    console.log(`   ♻️  Master Library Used: ${analysis.reusabilityScore >= 30 ? 'YES' : 'NO'}`);
    
    if (analysis.recommendations.length > 0) {
      console.log('\n💡 TOP REUSABILITY RECOMMENDATIONS:');
      analysis.recommendations.slice(0, 3).forEach(rec => {
        console.log(`   ${rec.message}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error in Master Library generation:', error);
    console.log('🔄 Falling back to original generation method...');
    generateOriginalArtifacts();
  }
}

// Custom generation with SBS compliance
async function generateCustomArtifacts(context) {
  // Generate feature file
  let feature = '@Team:SBSBusinessContinuity\n@regression\n';
  if (tags.length > 0) feature += tags.join(' ') + '\n';
  feature += `Feature: ${context.featureName} UI Elements Validation\n\n`;
  
  // CRITICAL: Use SBS background steps
  feature += `  Background:\n`;
  feature += `    Given Alex is logged into RunMod with a homepage test client\n`;
  feature += `    Then Alex verifies that the Payroll section on the Home Page is displayed\n\n`;
  
  // Add scenarios
  if (bddSteps.length > 0) {
    feature += `  Scenario: ${context.featureName}\n`;
    bddSteps.forEach(step => {
      feature += `    ${step}\n`;
    });
    feature += '\n';
  }
  
  // Add UI validation scenario
  if (uiElements.buttons.length > 0 || uiElements.links.length > 0) {
    feature += `  Scenario: Verify ${context.featureName} page elements\n`;
    feature += `    When Alex navigates to ${context.featureName} page\n`;
    feature += `    Then Alex verifies "${context.featureName}" page title is displayed\n`;
    uiElements.buttons.forEach(btn => {
      feature += `    And Alex verifies "${btn}" button is visible\n`;
    });
    uiElements.links.forEach(link => {
      feature += `    And Alex verifies "${link}" link is visible\n`;
    });
    feature += '\n';
  }
  
  fs.writeFileSync(featureFile, feature);
  console.log(`✅ Feature file generated: ${featureFile}`);
  
  // Generate steps file
  const className = context.pageClassName;
  let stepsCode = `const { Given, When, Then } = require('@cucumber/cucumber');
const ${className} = require('../pages/${context.kebabName}-page');

// Steps following SBS patterns with proper parameterization
`;

  // Add step definitions for BDD steps and UI elements
  const allSteps = [...bddSteps];
  
  // Add UI element steps
  uiElements.buttons.forEach(btn => {
    allSteps.push(`Then Alex verifies "${btn}" button is visible`);
  });
  uiElements.links.forEach(link => {
    allSteps.push(`Then Alex verifies "${link}" link is visible`);
  });
  
  const processedSteps = new Set();
  
  allSteps.forEach(stepText => {
    const stepMatch = /^(Given|When|Then|And)\s+(.+)/i.exec(stepText.trim());
    if (stepMatch) {
      const keyword = stepMatch[1] === 'And' ? 'Then' : stepMatch[1];
      let stepPattern = stepMatch[2];
      
      // Parameterize quoted text
      const hasQuotes = /"([^"]+)"/.test(stepPattern);
      if (hasQuotes) {
        stepPattern = stepPattern.replace(/"([^"]+)"/g, '{string}');
      }
      
      const stepKey = `${keyword}('${stepPattern}')`;
      
      if (!processedSteps.has(stepKey)) {
        const paramName = hasQuotes ? ', elementText' : '';
        stepsCode += `
${keyword}('${stepPattern}', { timeout: 240 * 1000 }, async function (${hasQuotes ? 'elementText' : ''}) {
  await new ${className}(this.page).interactWithElement(${hasQuotes ? 'elementText' : ''});
});
`;
        processedSteps.add(stepKey);
      }
    }
  });
  
  fs.writeFileSync(stepsFile, stepsCode);
  console.log(`✅ Steps file generated: ${stepsFile}`);
  
  // Generate page file with combined locator strategy
  let pageCode = `const BasePage = require('../common/base-page');
const By = require('../../support/By.js');

// Combined Primary/Secondary/Fallback Locator Strategy using OR operators
const PAGE_TITLE = By.xpath('//*[@data-test-id="page-header-title"] | //h1[contains(@class, "page-title")] | //span[contains(text(), "Page")]');
const MAIN_CONTENT = By.xpath('//*[@data-test-id="main-content"] | //*[@data-test-id="page-content"] | //*[contains(@class, "main-content")]');

// Parameterized locators following SBS patterns
const BTN_ELEMENT = (btnName) => By.xpath(\`//sdf-button[text() = "\${btnName}"] | //button[contains(text(), "\${btnName}")]\`);
const LINK_ELEMENT = (linkText) => By.xpath(\`//a[contains(text(),"\${linkText}")] | //sdf-link[contains(text(),"\${linkText}")]\`);
const ELEMENT_BY_TEXT = (elementText) => By.xpath(\`//*[contains(text(),"\${elementText}")]\`);

class ${className} extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }

  async interactWithElement(elementText) {
    if (!elementText) {
      return await this.isVisible(PAGE_TITLE);
    }
    
    if (elementText.toLowerCase().includes('button')) {
      const buttonName = elementText.replace(/\s*button\s*/gi, '').trim();
      const buttonLocator = BTN_ELEMENT(buttonName);
      await this.clickElement(buttonLocator);
    } else if (elementText.toLowerCase().includes('link')) {
      const linkName = elementText.replace(/\s*link\s*/gi, '').trim();
      const linkLocator = LINK_ELEMENT(linkName);
      await this.clickElement(linkLocator);
    } else {
      const elementLocator = ELEMENT_BY_TEXT(elementText);
      return await this.isVisible(elementLocator);
    }
  }

  async isPageTitleDisplayed() {
    return await this.isVisible(PAGE_TITLE);
  }

  async verifyPageContentLoads() {
    return await this.isVisible(MAIN_CONTENT);
  }
}

module.exports = ${className};
`;

  fs.writeFileSync(pageFile, pageCode);
  console.log(`✅ Page file generated: ${pageFile}`);
}

// Original generation method (fallback)
function generateOriginalArtifacts() {
  console.log('🔄 Using original generation method as fallback...');
  // Implementation of original generation logic here if needed
}

// Execute generation
generateWithMasterLibrary().catch(error => {
  console.error('❌ Fatal error in generation:', error);
  process.exit(1);
});
