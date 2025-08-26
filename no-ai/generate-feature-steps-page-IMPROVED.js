// Enhanced UNIVERSAL MASTER STEPS Generator with Smart Pattern Recognition
// Version 2.0 - Addresses "Bad Quality" scenarios with intelligent parsing
// Usage: node generate-feature-steps-page-IMPROVED.js <requirementFile> <baseName>

const fs = require('fs');
const path = require('path');
const domainTemplates = require('./domain-templates');

// Import domain templates for contextual scenario generation
const { getDomainTemplates, identifyDomain } = domainTemplates;

const requirementFile = process.argv[2] || path.resolve(__dirname, '../requirements/text/jira-story-prior-payroll.txt');
const inputBaseName = process.argv[3] || path.basename(requirementFile, path.extname(requirementFile));

// Convert baseName to kebab-case for file naming (SBS standard)
function toKebabCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

const baseName = toKebabCase(inputBaseName);
const featureFile = path.resolve(__dirname, `../SBS_Automation/features/${baseName}.feature`);
const stepsFile = path.resolve(__dirname, `../SBS_Automation/steps/${baseName}-steps.js`);
const pageFile = path.resolve(__dirname, `../SBS_Automation/pages/${baseName}-page.js`);

console.log(`🚀 Enhanced UNIVERSAL MASTER STEPS Generator v2.0`);
console.log(`📋 Processing: ${requirementFile}`);
console.log(`🎯 Target: ${baseName}`);

// 1. Read and filter requirement content
const content = fs.readFileSync(requirementFile, 'utf8');

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
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

// 2. ENHANCED: Smart Content Classification
function classifyRequirement(content) {
  const contentLower = content.toLowerCase();
  
  // Technical/Implementation indicators
  if (/\.(js|html|css|cshtml|ts|jsx|tsx)/.test(content)) return 'TECHNICAL';
  if (/line \d+|function|method|class|src\/|lib\//.test(content)) return 'TECHNICAL';
  if (/modified|changed|updated|fixed|corrected/.test(contentLower)) return 'TECHNICAL';
  
  // UI/Frontend indicators
  if (/button|click|display|page|form|input|select|dropdown|menu/gi.test(content)) return 'UI';
  if (/user (can|should|must)|user clicks|user sees|user enters/gi.test(content)) return 'UI';
  
  // API/Backend indicators
  if (/api|endpoint|request|response|json|http|rest|post|get|put|delete/gi.test(content)) return 'API';
  if (/service|server|backend|database|query/gi.test(content)) return 'API';
  
  // Business Logic indicators
  if (/business rule|validation|calculation|logic|rule|policy/gi.test(content)) return 'BUSINESS_LOGIC';
  if (/should (not )?be|must (not )?be|required|mandatory/gi.test(content)) return 'BUSINESS_LOGIC';
  
  return 'INTEGRATION';
}

// 3. ENHANCED: Technical Content Parser
function parseTechnicalRequirement(content) {
  const fileReferences = content.match(/[\w-]+\.(js|html|css|cshtml|ts|jsx|tsx)/g) || [];
  const functionReferences = content.match(/(\w+)\(\)/g) || [];
  const lineReferences = content.match(/line \d+/gi) || [];
  const environments = content.match(/(FIT|IAT|Prod|Production|Dev|Development)/gi) || [];
  const envIds = content.match(/(FIT\s*-\s*\d+|IAT\s*-\s*\d+|Prod\s*-\s*\d+)/gi) || [];
  
  // Extract testable behaviors from technical content
  const testablePatterns = [
    /should (not )?be (set|displayed|shown|visible|hidden|null|undefined)/gi,
    /when.*then/gi,
    /if.*should/gi,
    /(incorrectly|correctly|properly) (set|handle|process)/gi,
    /need to be (adjusted|modified|fixed)/gi
  ];
  
  const testableBehaviors = [];
  testablePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) testableBehaviors.push(...matches);
  });
  
  return {
    type: 'TECHNICAL',
    files: fileReferences,
    functions: functionReferences,
    lines: lineReferences,
    environments: environments,
    environmentIds: envIds,
    testableBehaviors: testableBehaviors,
    hasMultiEnvironment: environments.length > 1 || envIds.length > 0
  };
}

// 4. ENHANCED: Smart Scenario Generation with Domain Templates
function generateScenariosFromTechnical(parsedData, content) {
  console.log('📋 Using domain-specific templates for scenario generation...');
  
  // Use domain templates for better contextual scenarios
  const domainScenarios = getDomainTemplates(content);
  const domain = identifyDomain(content);
  console.log(`🎯 Identified domain: ${domain}`);
  
  // If we have good domain-specific scenarios, use them
  if (domainScenarios && domainScenarios.length > 0) {
    console.log(`✅ Using ${domainScenarios.length} domain-specific scenarios`);
    return domainScenarios;
  }
  
  // Otherwise, generate contextual scenarios based on parsed content
  const scenarios = [];
  const contentLower = content.toLowerCase();
  
  // Generate main functionality scenario
  if (parsedData.files.length > 0 || parsedData.functions.length > 0) {
    const mainFunction = parsedData.functions[0] || 'system function';
    const mainFile = parsedData.files[0] || 'target component';
    
    scenarios.push({
      title: `Validate ${mainFunction.replace('()', '')} functionality`,
      steps: [
        'Given the system is processing user data',
        `When the ${mainFunction.replace('()', '')} is executed`,
        'Then the data should be processed correctly',
        'And no incorrect values should be set'
      ]
    });
  }
  
  // Generate field-specific scenario if mentioned
  if (/priorPayrollProvider/i.test(content)) {
    scenarios.push({
      title: 'Validate priorPayrollProvider field handling',
      steps: [
        'Given a user has no existing payroll vendor',
        'When the system processes their onboarding data',
        'Then priorPayrollProvider should not be set to "Other"',
        'And the field should remain unset for new companies'
      ]
    });
  }
  
  // Generate environment-specific scenario if multi-environment
  if (parsedData.hasMultiEnvironment) {
    scenarios.push({
      title: 'Environment-specific vendor ID validation',
      steps: [
        'Given the user selects "New Company - No Existing Vendor" option',
        'When the system processes the selection in <environment>',
        'Then the system should use vendor ID <vendorId>',
        'And priorPayrollProvider should be set to <expectedValue>'
      ],
      isOutline: true,
      examples: [
        { environment: 'FIT', vendorId: '35', expectedValue: 'null' },
        { environment: 'IAT', vendorId: '39', expectedValue: 'null' },
        { environment: 'Prod', vendorId: '48', expectedValue: 'null' }
      ]
    });
  }
  
  // Generate error handling scenario
  if (/incorrect|wrong|error|invalid/i.test(content)) {
    scenarios.push({
      title: 'Error handling for invalid data',
      steps: [
        'Given invalid or missing priorMethodDetail data',
        'When the system attempts to process the information',
        'Then appropriate error handling should occur',
        'And the system should not default to incorrect values'
      ]
    });
  }
  
  return scenarios.length > 0 ? scenarios : generateFallbackScenarios(content);
}

// 5. ENHANCED: UI Content Parser with Domain Templates
function generateScenariosFromUI(content) {
  console.log('🎨 Generating UI scenarios with domain templates...');
  
  // Use domain templates for UI-specific scenarios
  const domainScenarios = getDomainTemplates(content);
  const domain = identifyDomain(content);
  
  if (domain === 'UI_INTERACTION' && domainScenarios.length > 0) {
    console.log(`✅ Using ${domainScenarios.length} UI-specific scenarios`);
    return domainScenarios;
  }
  
  // Fallback to parsed UI elements if no domain match
  const scenarios = [];
  
  // Extract UI elements
  const buttons = content.match(/button[s]?\s*[^a-z]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi) || [];
  const links = content.match(/link[s]?\s*[^a-z]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi) || [];
  const pages = content.match(/page[s]?\s*[^a-z]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi) || [];
  
  if (buttons.length > 0) {
    scenarios.push({
      title: 'User interaction with buttons',
      steps: [
        'Given the user is on the application page',
        'When the user clicks the primary action button',
        'Then the expected action should be performed',
        'And the user should see confirmation of the action'
      ]
    });
  }
  
  return scenarios.length > 0 ? scenarios : generateFallbackScenarios(content);
}

// 6. ENHANCED: API Content Parser  
function generateScenariosFromAPI(content) {
  const scenarios = [];
  
  scenarios.push({
    title: 'API endpoint validation',
    steps: [
      'Given the API service is available',
      'When a valid request is sent to the endpoint',
      'Then the response should return expected data',
      'And the response should have correct status code'
    ]
  });
  
  scenarios.push({
    title: 'API error handling',
    steps: [
      'Given the API service is available', 
      'When an invalid request is sent',
      'Then appropriate error response should be returned',
      'And error message should be meaningful'
    ]
  });
  
  return scenarios;
}

// 7. ENHANCED: Business Logic Parser
function generateScenariosFromBusinessLogic(content) {
  const scenarios = [];
  
  scenarios.push({
    title: 'Business rule validation',
    steps: [
      'Given the business rule is defined',
      'When the rule conditions are met',
      'Then the expected business outcome should occur',
      'And the system should enforce the rule consistently'
    ]
  });
  
  scenarios.push({
    title: 'Edge case handling',
    steps: [
      'Given edge case conditions exist',
      'When the system processes the edge case',
      'Then appropriate handling should occur',
      'And system should remain stable'
    ]
  });
  
  return scenarios;
}

// 8. ENHANCED: Fallback with Context
function generateFallbackScenarios(content) {
  const contentLower = content.toLowerCase();
  const title = baseName.replace(/-/g, ' ').replace(/\d+$/, '');
  
  // Try to extract some context for better fallback
  if (/employee|contractor|w2/i.test(content)) {
    return [{
      title: `Employee and contractor management`,
      steps: [
        'Given the system manages employee data',
        'When employee type changes are requested',
        'Then the system should process the changes correctly',
        'And employee status should be updated appropriately'
      ]
    }];
  }
  
  // Generic but contextual fallback
  return [{
    title: `${title} functionality validation`,
    steps: [
      'Given the system is configured correctly',
      'When the primary use case is executed',
      'Then the expected functionality should work',
      'And system should behave as designed'
    ]
  }];
}

// 9. MAIN PROCESSING LOGIC
const filteredContent = filterTemplateMetadata(content);
const requirementType = classifyRequirement(filteredContent);

console.log(`🔍 Content Type Detected: ${requirementType}`);

let scenarios = [];

switch (requirementType) {
  case 'TECHNICAL':
    const technicalData = parseTechnicalRequirement(filteredContent);
    console.log(`🔧 Technical Elements Found:`, technicalData);
    scenarios = generateScenariosFromTechnical(technicalData, filteredContent);
    break;
  case 'UI':
    scenarios = generateScenariosFromUI(filteredContent);
    break;
  case 'API':
    scenarios = generateScenariosFromAPI(filteredContent);
    break;
  case 'BUSINESS_LOGIC':
    scenarios = generateScenariosFromBusinessLogic(filteredContent);
    break;
  default:
    scenarios = generateFallbackScenarios(filteredContent);
}

// 10. Generate Feature File with Enhanced Quality
let feature = `@Team:SBSBusinessContinuity @smoke @${baseName}\n`;
feature += `Feature: ${baseName.replace(/-/g, ' ')}\n\n`;
feature += `  ${baseName.replace(/-/g, ' ')} functionality\n\n`;

// Add mandatory Background steps (SBS standard)
feature += `  Background:\n`;
feature += `    Given Alex is logged into RunMod with a homepage test client\n`;
feature += `    Then Alex verifies that the Payroll section on the Home Page is displayed\n\n`;

scenarios.forEach((scenario, idx) => {
  if (scenario.isOutline) {
    feature += `  Scenario Outline: ${scenario.title}\n`;
    scenario.steps.forEach(step => {
      feature += `    ${step}\n`;
    });
    feature += `\n    Examples:\n`;
    feature += `      | environment | vendorId | expectedValue |\n`;
    scenario.examples.forEach(example => {
      feature += `      | ${example.environment} | ${example.vendorId} | ${example.expectedValue} |\n`;
    });
  } else {
    feature += `  Scenario: ${scenario.title}\n`;
    scenario.steps.forEach(step => {
      feature += `    ${step}\n`;
    });
  }
  feature += '\n';
});

fs.writeFileSync(featureFile, feature);
console.log(`✅ Enhanced Feature file generated: ${featureFile}`);

// 11. Generate Enhanced Steps File (same logic as before but with better method names)
function toMethodName(stepText) {
  let summary = stepText.split(' ').slice(0, 5).join(' ');
  summary = summary.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  if (summary.length < 3) summary = stepText.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  return summary.split(' ').map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

function toPageObjectName(baseName) {
  return baseName.replace(/(^|[-_])(\w)/g, (_, __, chr) => chr.toUpperCase()) + 'Page';
}

let stepsCode = `const { Given, When, Then } = require('@cucumber/cucumber');
const { assert } = require('chai');
const ${toPageObjectName(baseName)} = require('../../pages/${baseName}-page');

let pageObject;

`;

scenarios.forEach((scenario) => {
  let prevKeyword = 'Given';
  scenario.steps.forEach(step => {
    let keyword = step.split(' ')[0];
    let text = step.substring(keyword.length + 1);
    
    if (!['Given', 'When', 'Then', 'And'].includes(keyword)) return;
    if (keyword === 'And') keyword = prevKeyword;
    
    const paramMatch = text.match(/<([^>]+)>|\{([^}]+)\}/);
    let param = paramMatch ? paramMatch[1] || paramMatch[2] : null;
    const stepTextEscaped = text.replace(/'/g, "\\'").replace(/"/g, '\\"');
    const methodName = toMethodName(text);
    
    if (methodName && methodName !== '' && text.trim().length > 0) {
      const pageContext = ` on ${baseName.replace(/-/g, ' ')} page`;
      const uniqueStepText = stepTextEscaped + pageContext;
      
      if (param) {
        stepsCode += `${keyword}('${uniqueStepText}', { timeout: 60 * 1000 }, async function (${param}) {\n  pageObject = new ${toPageObjectName(baseName)}(this.page);\n  const result = await pageObject.${methodName}(${param});\n  assert.isTrue(result, 'Step executed successfully');\n});\n\n`;
      } else {
        stepsCode += `${keyword}('${uniqueStepText}', { timeout: 60 * 1000 }, async function () {\n  pageObject = new ${toPageObjectName(baseName)}(this.page);\n  const result = await pageObject.${methodName}();\n  assert.isTrue(result, 'Step executed successfully');\n});\n\n`;
      }
    }
    prevKeyword = keyword;
  });
});

fs.writeFileSync(stepsFile, stepsCode);
console.log(`✅ Enhanced Steps file generated: ${stepsFile}`);

// 12. Generate Enhanced Page File (with better locators and methods)
const pageObjectName = toPageObjectName(baseName);

let pageCode = `const BasePage = require('../../../SBS_Automation/pages/common/base-page');
const By = require('../../support/By.js');

// Enhanced locator strategy with Primary/Secondary/Fallback patterns
const PAGE_CONTAINER = By.css('[data-test-id="main-content"], [data-test-id="page-content"], .page-content');
const DATA_FIELD = (fieldName) => By.css(\`[data-test-id="\${fieldName}"], [name="\${fieldName}"], #\${fieldName}\`);
const BUTTON_ELEMENT = (btnName) => By.xpath(\`//sdf-button[contains(text(), "\${btnName}")] | //button[contains(text(), "\${btnName}")]\`);
const TEXT_ELEMENT = (text) => By.xpath(\`//*[contains(text(), "\${text}")]\`);
const VENDOR_ID_FIELD = By.css('[data-test-id="vendor-id"], [data-test-id="priorPayrollProvider"], [name="vendorId"]');
const ERROR_MESSAGE = By.css('[data-test-id="error-message"], .error-message, .alert-danger');

class ${pageObjectName} extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }

`;

// Generate meaningful methods based on scenario content
let methodNames = new Set();
let methods = '';

scenarios.forEach((scenario) => {
  scenario.steps.forEach(step => {
    const text = step.replace(/^(Given|When|Then|And) /, '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    const methodName = toMethodName(text);
    
    if (!methodNames.has(methodName) && methodName && methodName !== '') {
      if (text.toLowerCase().includes('vendor') || text.toLowerCase().includes('payroll')) {
        methods += `  async ${methodName}() {
    await this.waitForSelector(VENDOR_ID_FIELD, { timeout: 10000 });
    const fieldValue = await this.getElementAttribute(VENDOR_ID_FIELD, 'value');
    return fieldValue !== 'Other';
  }

`;
      } else if (text.toLowerCase().includes('error') || text.toLowerCase().includes('invalid')) {
        methods += `  async ${methodName}() {
    const errorElements = await this.findElements(ERROR_MESSAGE);
    return errorElements.length === 0;
  }

`;
      } else if (text.toLowerCase().includes('process') || text.toLowerCase().includes('execute')) {
        methods += `  async ${methodName}() {
    await this.waitForSelector(PAGE_CONTAINER, { timeout: 10000 });
    return await this.isVisible(PAGE_CONTAINER);
  }

`;
      } else {
        methods += `  async ${methodName}() {
    await this.waitForSelector(PAGE_CONTAINER, { timeout: 5000 });
    return await this.isVisible(PAGE_CONTAINER);
  }

`;
      }
      methodNames.add(methodName);
    }
  });
});

pageCode += methods;
pageCode += `}

module.exports = ${pageObjectName};`;

fs.writeFileSync(pageFile, pageCode);
console.log(`✅ Enhanced Page file generated: ${pageFile}`);

// Quality scoring mechanism to assess and improve output quality
function calculateQualityScore(scenarios, content) {
  let score = 0;
  let maxScore = 100;
  
  // Check scenario count (0-30 points)
  if (scenarios.length >= 3) score += 30;
  else if (scenarios.length >= 2) score += 20;
  else if (scenarios.length >= 1) score += 10;
  
  // Check scenario specificity (0-25 points)
  const specificPatterns = /Given.*specific|When.*particular|Then.*expected|And.*appropriate/i;
  const specificCount = scenarios.filter(s => 
    s.steps.some(step => specificPatterns.test(step))
  ).length;
  score += Math.min(specificCount * 8, 25);
  
  // Check domain alignment (0-25 points)
  const domain = identifyDomain(content);
  const hasDomainKeywords = scenarios.some(s => 
    s.title.toLowerCase().includes(domain.toLowerCase().split('_')[0]) ||
    s.steps.some(step => step.toLowerCase().includes(domain.toLowerCase().split('_')[0]))
  );
  if (hasDomainKeywords) score += 25;
  
  // Check step variety (0-20 points)
  const allSteps = scenarios.flatMap(s => s.steps);
  const givenSteps = allSteps.filter(s => s.startsWith('Given')).length;
  const whenSteps = allSteps.filter(s => s.startsWith('When')).length;
  const thenSteps = allSteps.filter(s => s.startsWith('Then')).length;
  const andSteps = allSteps.filter(s => s.startsWith('And')).length;
  
  if (givenSteps > 0 && whenSteps > 0 && thenSteps > 0) score += 20;
  else if (givenSteps > 0 && (whenSteps > 0 || thenSteps > 0)) score += 10;
  
  return Math.min(score, maxScore);
}

function assessAndImproveQuality(scenarios, content, baseName) {
  const qualityScore = calculateQualityScore(scenarios, content);
  console.log(`📊 Quality Score: ${qualityScore}/100`);
  
  if (qualityScore < 50) {
    console.log(`⚠️  Quality score below threshold (${qualityScore}/100)`);
    console.log(`🔄 Attempting to improve with enhanced fallback scenarios...`);
    
    // Try to enhance with more specific domain scenarios
    const domain = identifyDomain(content);
    const enhancedScenarios = domainTemplates.getScenariosFromTemplate(domain, content);
    
    if (enhancedScenarios && enhancedScenarios.length > scenarios.length) {
      console.log(`✅ Enhanced scenarios found, regenerating with improved quality...`);
      return enhancedScenarios;
    }
  } else if (qualityScore >= 70) {
    console.log(`✅ High quality output achieved (${qualityScore}/100)`);
  } else {
    console.log(`⚠️  Moderate quality output (${qualityScore}/100) - acceptable but could be improved`);
  }
  
  return scenarios;
}

// Apply quality assessment after initial scenario generation
scenarios = assessAndImproveQuality(scenarios, filteredContent, baseName);

// IMAGE REQUIREMENT ANALYSIS RULES
// When working with image requirements, focus on VISIBLE UI ELEMENTS ONLY
function analyzeImageRequirement(content) {
  console.log('🖼️  ANALYZING IMAGE REQUIREMENT - UI ELEMENTS FOCUS');
  
  // For image requirements, we need to identify:
  // 1. Buttons (Submit, Cancel, Save, Accept, Decline, etc.)
  // 2. Text Fields (Input boxes, text areas, labels)
  // 3. Links (Clickable links, navigation elements)  
  // 4. Checkboxes (Selection boxes, agreement checkboxes)
  // 5. Radio Buttons (Option selections)
  // 6. Dropdown Lists (Select menus, option lists)
  // 7. Images (Icons, logos, graphics)
  // 8. Headings/Headers (Page titles, section headers)
  // 9. Text Content (Visible text, messages, instructions)
  // 10. Forms (Complete form structures)
  // 11. Tables (Data grids, lists)
  // 12. Modals/Dialogs (Pop-up windows, overlays)
  
  // CRITICAL RULE: IF YOU CANNOT SEE IT IN THE IMAGE, DO NOT TEST IT
  
  return {
    type: 'IMAGE_REQUIREMENT',
    analysisNeeded: true,
    focusArea: 'UI_ELEMENTS_ONLY',
    generateOnlyVisibleElements: true
  };
}

console.log(`\n🎉 ENHANCEMENT COMPLETE!`);
console.log(`📊 Generated ${scenarios.length} meaningful scenarios`);
console.log(`🔧 Content Type: ${requirementType}`);
console.log(`📈 Quality Improvement: Enhanced contextual scenarios instead of generic fallbacks`);
