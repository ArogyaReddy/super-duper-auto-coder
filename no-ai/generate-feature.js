// Pure code-based requirement to feature generator (NO AI)
// Usage: npm run generate

const fs = require('fs');
const path = require('path');

const inputFile = process.argv[2] || path.resolve(__dirname, '../requirements/text/jira-story-classic-footer.txt');
const outputFile = process.argv[3] || path.resolve(__dirname, '../SBS_Automation/features/jira-story-classic-footer.feature');

// 1. Read requirement file
const content = fs.readFileSync(inputFile, 'utf8');

// 2. Extract title and acceptance criteria
const lines = content.split('\n');
const title = lines[0].trim();

// Find Acceptance Criteria section
let criteriaStart = lines.findIndex(line => line.toLowerCase().includes('acceptance criteria'));
let acceptanceCriteria = [];
if (criteriaStart !== -1) {
  for (let i = criteriaStart + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue;
    // Stop if next section or end
    if (/^\w+:/.test(line)) break;
    acceptanceCriteria.push(line);
  }
}

// 3. Generate feature file content
let feature = `Feature: ${title}\n\n`;
feature += '  Scenario: Classic Footer Display Logic\n';
acceptanceCriteria.forEach((criteria, idx) => {
  if (idx === 0) feature += `    Given ${criteria}\n`;
  else if (idx === 1) feature += `    When ${criteria}\n`;
  else if (idx === 2) feature += `    Then ${criteria}\n`;
  else feature += `    And ${criteria}\n`;
});

// 4. Write feature file
fs.writeFileSync(outputFile, feature);
console.log(`✅ Feature file generated: ${outputFile}`);
