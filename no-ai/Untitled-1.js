// Combined generator: requirement -> feature -> steps -> page (NO AI)
// Usage: node generate-feature-steps-page.js <requirementFile> <baseName>

const fs = require('fs');
const path = require('path');

const requirementFile = process.argv[2] || path.resolve(__dirname, '../requirements/text/jira-story-employee-contrator.txt');
const baseName = process.argv[3] || path.basename(requirementFile, path.extname(requirementFile));
const featureFile = path.resolve(__dirname, `../SBS_Automation/features/${baseName}.feature`);
const stepsFile = path.resolve(__dirname, `../SBS_Automation/steps/${baseName}-steps.js`);
const pageFile = path.resolve(__dirname, `../SBS_Automation/pages/${baseName}-page.js`);

// 1. Read requirement file
const content = fs.readFileSync(requirementFile, 'utf8');

// Extract tags from requirement (simple heuristic: lines starting with @)
let lines = content.split('\n');
let tags = lines.filter(line => line.trim().startsWith('@')).map(line => line.trim());
let criteriaStart = lines.findIndex(line => line.toLowerCase().includes('acceptance criteria'));
let acceptanceCriteria = [];
if (criteriaStart !== -1) {
  for (let i = criteriaStart + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue;
    if (/^\w+:/.test(line)) break;
    acceptanceCriteria.push(line);
  }
}

// Extract explicit BDD steps (Given, When, Then, And, So)
let bddSteps = [];
lines.forEach(line => {
  const trimmed = line.trim();
  if (/^(Given|When|Then|And|So)\b/i.test(trimmed)) {
    bddSteps.push(trimmed.replace(/^So\b/i, 'And'));
  }
});

let scenarios = [];
if (acceptanceCriteria.length > 0 && bddSteps.length === 0) {
  // 1. Only acceptance criteria/summary/paragraphs
  scenarios = [{ title: baseName.replace(/-/g, ' ').replace(/\d+$/, ''), steps: [] }];
  acceptanceCriteria.forEach((criteria, idx) => {
    if (idx === 0) scenarios[0].steps.push('Given ' + criteria);
    else if (idx === 1) scenarios[0].steps.push('When ' + criteria);
    else if (idx === 2) scenarios[0].steps.push('Then ' + criteria);
    else scenarios[0].steps.push('And ' + criteria);
  });
} else if (bddSteps.length > 0 && acceptanceCriteria.length === 0) {
  // 2. Only explicit BDD steps
  scenarios = [{ title: baseName.replace(/-/g, ' ').replace(/\d+$/, ''), steps: [] }];
  bddSteps.forEach(step => {
    scenarios[0].steps.push(step);
  });
} else if (acceptanceCriteria.length > 0 && bddSteps.length > 0) {
  // 3. Both present: create two scenarios
  scenarios = [
    { title: baseName.replace(/-/g, ' ').replace(/\d+$/, '') + ' (Acceptance Criteria)', steps: [] },
    { title: baseName.replace(/-/g, ' ').replace(/\d+$/, '') + ' (BDD Steps)', steps: [] }
  ];
  acceptanceCriteria.forEach((criteria, idx) => {
    if (idx === 0) scenarios[0].steps.push('Given ' + criteria);
    else if (idx === 1) scenarios[0].steps.push('When ' + criteria);
    else if (idx === 2) scenarios[0].steps.push('Then ' + criteria);
    else scenarios[0].steps.push('And ' + criteria);
  });
  bddSteps.forEach(step => {
    scenarios[1].steps.push(step);
  });
} else {
  // Fallback: no criteria or BDD steps
  scenarios = [{ title: 'Default scenario', steps: ['Given Default step: Please update requirement format for BDD extraction'] }];
}

// 3. Generate feature file
let feature = '';
if (tags.length > 0) feature += tags.join(' ') + '\n';
feature += `Feature: ${baseName.replace(/-/g, ' ')}\n\n`;
scenarios.forEach((sc, idx) => {
  feature += `  Scenario: ${sc.title}\n`;
  sc.steps.forEach(step => {
    feature += `    ${step}\n`;
  });
  feature += '\n';
});
fs.writeFileSync(featureFile, feature);
console.log(`✅ Feature file generated: ${featureFile}`);

// 4. Generate steps file
let stepsCode = `const { Given, When, Then } = require('@cucumber/cucumber');\nconst { assert } = require('chai');\nconst By = require('./../../support/By.js');\nconst helpers = require('./../../support/helpers.js');\nconst ${baseName.replace(/-/g, '')}Page = require('../pages/${baseName}-page');\n\nlet pageObject;\n\n`;
scenarios.forEach((sc, idx) => {
  let prevKeyword = 'Given';
  sc.steps.forEach(step => {
    let keyword = step.split(' ')[0];
    let text = step.substring(keyword.length + 1);
    if (keyword === 'And') keyword = prevKeyword;
    // Parameter extraction: <param> or {string}
    const paramMatch = text.match(/<([^>]+)>|\{([^}]+)\}/);
    let param = paramMatch ? paramMatch[1] || paramMatch[2] : null;
    const stepText = text.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    const methodName = stepText.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+(.)/g, (m, chr) => chr.toUpperCase()).replace(/\s/g, '').replace(/^(.)/, (m, chr) => chr.toLowerCase());
    if (param) {
      stepsCode += `${keyword}('${stepText}', { timeout: 60 * 1000 }, async function (${param}) {\n  pageObject = new ${baseName.replace(/-/g, '')}Page(this.page);\n  const result = await pageObject.${methodName}(${param});\n  assert.isTrue(result, 'Step executed');\n});\n\n`;
    } else {
      stepsCode += `${keyword}('${stepText}', { timeout: 60 * 1000 }, async function () {\n  pageObject = new ${baseName.replace(/-/g, '')}Page(this.page);\n  const result = await pageObject.${methodName}();\n  assert.isTrue(result, 'Step executed');\n});\n\n`;
    }
    prevKeyword = keyword;
  });
});
fs.writeFileSync(stepsFile, stepsCode);
console.log(`✅ Steps file generated: ${stepsFile}`);

// 5. Generate page file
let pageCode = `const BasePage = require('./common/base-page');\nconst By = require('./../../support/By.js');\nconst helpers = require('./../../support/helpers.js');\n\nclass ${baseName.replace(/-/g, '')}Page extends BasePage {\n  constructor(page) {\n    super(page);\n    this.page = page;\n    this.selectors = {\n      mainContent: '[data-test-id="main-content"]',\n      actionButton: '[data-test-id="action-button"]',\n      requirementElement: '[data-test-id="requirement-element"]',\n      displayConditions: '[data-test-id="display-conditions"]',\n    };\n  }\n\n`;
let methodNames = new Set();
scenarios.forEach((sc, idx) => {
  sc.steps.forEach(step => {
    const text = step.replace(/^(Given|When|Then|And) /, '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    const methodName = text.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+(.)/g, (m, chr) => chr.toUpperCase()).replace(/\s/g, '').replace(/^(.)/, (m, chr) => chr.toLowerCase());
    const paramMatch = text.match(/<([^>]+)>|\{([^}]+)\}/);
    let param = paramMatch ? paramMatch[1] || paramMatch[2] : null;
    if (!methodNames.has(methodName)) {
      let logic = '';
      if (/login|authenticate/i.test(methodName)) {
        logic = `    try {\n      await this.page.click(this.selectors.actionButton);\n      await this.page.waitForSelector(this.selectors.mainContent);\n      return true;\n    } catch (error) {\n      await helpers.retry(() => this.page.click(this.selectors.actionButton), 3);\n      return false;\n    }`;
      } else if (/requirement/i.test(methodName)) {
        logic = `    try {\n      return await this.page.isVisible(this.selectors.requirementElement);\n    } catch (error) {\n      return false;\n    }`;
      } else if (/displayconditions/i.test(methodName)) {
        logic = `    try {\n      return await this.page.isVisible(this.selectors.displayConditions);\n    } catch (error) {\n      return false;\n    }`;
      } else if (param) {
        logic = `    try {\n      // Use param: ${param}\n      await this.page.fill(this.selectors.mainContent, ${param});\n      return true;\n    } catch (error) {\n      return false;\n    }`;
      } else {
        logic = `    try {\n      await this.page.waitForSelector(this.selectors.mainContent);\n      return true;\n    } catch (error) {\n      return false;\n    }`;
      }
      pageCode += `  async ${methodName}(${param ? param : ''}) {\n${logic}\n  }\n\n`;
      methodNames.add(methodName);
    }
  });
});
pageCode += `  async waitForPageLoad() {\n    await this.page.waitForSelector(this.selectors.mainContent, { timeout: 5000 });\n    return true;\n  }\n}\n\nmodule.exports = ${baseName.replace(/-/g, '')}Page;\n`;
fs.writeFileSync(pageFile, pageCode);
console.log(`✅ Page file generated: ${pageFile}`);
