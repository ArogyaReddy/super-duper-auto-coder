// Pure code-based feature to steps/page generator (NO AI)
// Usage: node generate-steps-and-page.js <featureFile> <baseName>

const fs = require('fs');
const path = require('path');

const featureFile = process.argv[2] || path.resolve(__dirname, '../SBS_Automation/features/jira-story-classic-footer.feature');
const baseName = process.argv[3] || 'jira-story-classic-footer';

const stepsFile = path.resolve(__dirname, `../SBS_Automation/steps/${baseName}-steps.js`);
const pageFile = path.resolve(__dirname, `../SBS_Automation/pages/${baseName}-page.js`);

// 1. Read feature file
const featureContent = fs.readFileSync(featureFile, 'utf8');
const stepRegex = /\s+(Given|When|Then|And) (.+)/g;
let match;
let steps = [];
while ((match = stepRegex.exec(featureContent)) !== null) {
  steps.push({ keyword: match[1], text: match[2] });
}
// Fallback: If no steps found, add a default step
if (steps.length === 0) {
  steps.push({ keyword: 'Given', text: 'Default step: Please update requirement format for BDD extraction' });
}

// 2. Generate steps file (CucumberJS pattern)
let stepsCode = `const { Given, When, Then, And } = require('@cucumber/cucumber');\nconst ${baseName.replace(/-/g, '')}Page = require('../pages/${baseName}-page');\n\nlet pageObject;\n\n`;
steps.forEach((step, idx) => {
  stepsCode += `${step.keyword}('${step.text}', async function () {\n  pageObject = new ${baseName.replace(/-/g, '')}Page(this.page);\n  await pageObject.${step.text.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}();\n});\n\n`;
});
fs.writeFileSync(stepsFile, stepsCode);
console.log(`✅ Steps file generated: ${stepsFile}`);

// 3. Generate page file (SBS_Automation pattern)
let pageCode = `class ${baseName.replace(/-/g, '')}Page {\n  constructor(page) {\n    this.page = page;\n  }\n\n`;
steps.forEach((step, idx) => {
  pageCode += `  async ${step.text.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}() {\n    // TODO: Implement logic for: ${step.text}\n    await this.waitForPageLoad();\n    console.log('Method: ${step.text}');\n    return true;\n  }\n\n`;
});
pageCode += `  async waitForPageLoad() {\n    // TODO: Implement page load logic\n    return true;\n  }\n}\n\nmodule.exports = ${baseName.replace(/-/g, '')}Page;\n`;
fs.writeFileSync(pageFile, pageCode);
console.log(`✅ Page file generated: ${pageFile}`);
