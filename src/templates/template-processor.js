const fs = require('fs-extra');
const path = require('path');

class TemplateProcessor {
    constructor() {
        this.templatesDir = path.join(__dirname, '../requirements/templates');
        this.outputDir = path.join(__dirname, '../SBS_Automation');
    }

    /**
     * Get available templates from the templates directory
     */
    async getAvailableTemplates() {
        const templates = [];
        const files = await fs.readdir(this.templatesDir);
        
        for (const file of files) {
            if (file.endsWith('.md') && !file.includes('bdd-requirement-template')) {
                const templatePath = path.join(this.templatesDir, file);
                const content = await fs.readFile(templatePath, 'utf8');
                
                // Determine template complexity
                let complexity = 'moderate';
                if (file.includes('simplest')) complexity = 'simplest';
                else if (file.includes('easy')) complexity = 'easy';
                else if (file.includes('bdd-proper')) complexity = 'detailed';
                else if (file.includes('completed')) complexity = 'example';
                
                templates.push({
                    name: file.replace('.md', ''),
                    file: file,
                    path: templatePath,
                    complexity: complexity,
                    description: this.extractTemplateDescription(content)
                });
            }
        }
        
        return templates.sort((a, b) => {
            const order = { 'simplest': 1, 'easy': 2, 'moderate': 3, 'detailed': 4, 'example': 5 };
            return order[a.complexity] - order[b.complexity];
        });
    }

    /**
     * Extract description from template content
     */
    extractTemplateDescription(content) {
        // Try to find description in various formats
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.includes('Description') || line.includes('What are you testing')) {
                return line.replace(/[#*:]/g, '').trim() || 'Template for requirement entry';
            }
        }
        return 'Template for requirement entry';
    }

    /**
     * Process a completed template and extract requirement information
     */
    async processCompletedTemplate(templatePath) {
        const content = await fs.readFile(templatePath, 'utf8');
        
        // Extract key information from the template
        const requirement = {
            title: this.extractValue(content, ['Feature Name', 'Title', 'Requirement']),
            description: this.extractValue(content, ['Description', 'What are you testing']),
            asA: this.extractValue(content, ['As a']),
            iWant: this.extractValue(content, ['I want']),
            soThat: this.extractValue(content, ['So that']),
            given: this.extractValue(content, ['Given']),
            when: this.extractValue(content, ['When']),
            then: this.extractValue(content, ['Then']),
            acceptanceCriteria: this.extractValue(content, ['Acceptance Criteria', 'Acceptance criteria']),
            featureFlags: this.extractValue(content, ['Feature Flags']),
            priority: this.extractValue(content, ['Priority']) || 'Medium',
            scenarios: this.extractScenarios(content)
        };

        // Clean up extracted values
        Object.keys(requirement).forEach(key => {
            if (typeof requirement[key] === 'string') {
                requirement[key] = this.cleanExtractedValue(requirement[key]);
            }
        });

        return requirement;
    }

    /**
     * Extract value from content using multiple possible keys
     */
    extractValue(content, keys) {
        for (const key of keys) {
            const regex = new RegExp(`\\*\\*${key}\\*\\*[:\\s]*([^\\n\\*]+)`, 'i');
            const match = content.match(regex);
            if (match && match[1]) {
                return match[1].trim();
            }

            // Try markdown code block format
            const codeBlockRegex = new RegExp(`${key}[\\s]*\\n\`\`\`[\\s]*\\n([^\\`]+)\\n\`\`\``, 'i');
            const codeMatch = content.match(codeBlockRegex);
            if (codeMatch && codeMatch[1]) {
                return codeMatch[1].trim();
            }

            // Try simple colon format
            const colonRegex = new RegExp(`${key}[:\\s]+([^\\n]+)`, 'i');
            const colonMatch = content.match(colonRegex);
            if (colonMatch && colonMatch[1]) {
                return colonMatch[1].trim();
            }
        }
        return '';
    }

    /**
     * Extract scenarios from content
     */
    extractScenarios(content) {
        const scenarios = [];
        const scenarioRegex = /### Scenario \d+[:\s]*([^`]+)```([^`]+)```/gi;
        let match;

        while ((match = scenarioRegex.exec(content)) !== null) {
            scenarios.push({
                name: match[1].trim(),
                steps: match[2].trim()
            });
        }

        return scenarios;
    }

    /**
     * Clean extracted values
     */
    cleanExtractedValue(value) {
        return value
            .replace(/^[<>]/g, '')
            .replace(/[<>]$/g, '')
            .replace(/^\[.*\]$/, '')
            .replace(/^"(.*)"$/, '$1')
            .trim();
    }

    /**
     * Generate test artifacts from processed requirement
     */
    async generateArtifacts(requirement) {
        const baseName = this.generateBaseName(requirement.title);
        const className = this.toPascalCase(baseName);

        // Generate feature file
        const featureContent = this.generateFeature(requirement, baseName);
        const featurePath = path.join(this.outputDir, 'features', `${baseName}.feature`);
        
        // Generate step definitions
        const stepsContent = this.generateSteps(requirement, baseName, className);
        const stepsPath = path.join(this.outputDir, 'steps', `${baseName}-steps.js`);
        
        // Generate page object
        const pageContent = this.generatePage(requirement, baseName, className);
        const pagePath = path.join(this.outputDir, 'pages', `${baseName}-page.js`);

        // Ensure directories exist
        await fs.ensureDir(path.dirname(featurePath));
        await fs.ensureDir(path.dirname(stepsPath));
        await fs.ensureDir(path.dirname(pagePath));

        // Write files
        await fs.writeFile(featurePath, featureContent);
        await fs.writeFile(stepsPath, stepsContent);
        await fs.writeFile(pagePath, pageContent);

        return {
            feature: featurePath,
            steps: stepsPath,
            page: pagePath,
            baseName: baseName
        };
    }

    /**
     * Generate feature file content
     */
    generateFeature(requirement, baseName) {
        const tags = ['@Generated', '@Template', '@Team:AutoCoder'];
        if (requirement.priority === 'High') tags.push('@priority:high');
        else if (requirement.priority === 'Low') tags.push('@priority:low');
        else tags.push('@priority:medium');

        let content = `${tags.join(' ')}\n`;
        content += `Feature: ${requirement.title}\n`;
        
        if (requirement.asA && requirement.iWant && requirement.soThat) {
            content += `  As a ${requirement.asA}\n`;
            content += `  I want ${requirement.iWant}\n`;
            content += `  So that ${requirement.soThat}\n\n`;
        } else if (requirement.description) {
            content += `  ${requirement.description}\n\n`;
        }

        // Background if needed
        content += `  Background:\n`;
        content += `    Given the system is configured\n`;
        content += `    And I have access to the application\n\n`;

        // Main scenario
        content += `  @smoke\n`;
        content += `  Scenario: ${requirement.title} - Main Flow\n`;
        
        if (requirement.given && requirement.when && requirement.then) {
            content += `    Given ${requirement.given}\n`;
            content += `    When ${requirement.when}\n`;
            content += `    Then ${requirement.then}\n`;
        } else {
            content += `    Given I am on the ${baseName} page\n`;
            content += `    When I perform the required action\n`;
            content += `    Then I should see the expected result\n`;
        }

        // Add scenarios from template if available
        if (requirement.scenarios && requirement.scenarios.length > 0) {
            requirement.scenarios.forEach((scenario, index) => {
                content += `\n  @regression\n`;
                content += `  Scenario: ${scenario.name}\n`;
                const steps = scenario.steps.split('\n').filter(s => s.trim());
                steps.forEach(step => {
                    content += `    ${step.trim()}\n`;
                });
            });
        }

        return content;
    }

    /**
     * Generate step definitions
     */
    generateSteps(requirement, baseName, className) {
        return `const { Given, When, Then } = require('@cucumber/cucumber');
const { assert } = require('chai');
const ${className}Page = require('../pages/${baseName}-page');

// Background steps
Given('the system is configured', async function () {
  const ${baseName.replace(/-/g, '')}Page = new ${className}Page(this.page);
  await ${baseName.replace(/-/g, '')}Page.ensureSystemConfiguration();
});

Given('I have access to the application', async function () {
  // Verify application access
  await this.page.goto(process.env.BASE_URL || 'https://online-fit.nj.adp.com');
});

// Navigation steps
Given('I am on the {word} page', async function (pageType) {
  const ${baseName.replace(/-/g, '')}Page = new ${className}Page(this.page);
  await ${baseName.replace(/-/g, '')}Page.navigateToPage(pageType);
});

// Action steps
When('I perform the required action', async function () {
  const ${baseName.replace(/-/g, '')}Page = new ${className}Page(this.page);
  await ${baseName.replace(/-/g, '')}Page.performRequiredAction();
});

// Verification steps
Then('I should see the expected result', async function () {
  const ${baseName.replace(/-/g, '')}Page = new ${className}Page(this.page);
  const isVisible = await ${baseName.replace(/-/g, '')}Page.verifyExpectedResult();
  assert.isTrue(isVisible, 'Expected result should be visible');
});
`;
    }

    /**
     * Generate page object
     */
    generatePage(requirement, baseName, className) {
        return `const By = require('../../support/By.js');
let BasePage = require('../../support/base-page.js');

// Locator constants following SBS pattern
const ${baseName.toUpperCase().replace(/-/g, '_')}_CONTAINER = By.css('[data-test-id="${baseName}-container"]');
const ${baseName.toUpperCase().replace(/-/g, '_')}_PRIMARY_ELEMENT = By.css('[data-test-id="${baseName}-primary"]');

class ${className}Page extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }

  // Navigation methods following SBS patterns
  async navigateToPage(pageType) {
    const url = this.getPageUrl(pageType);
    await this.page.goto(url);
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
  }

  getPageUrl(pageType) {
    // Use SBS_Automation configuration for URLs
    const environment = global.testData?.environment || process.env.ENVIRONMENT || 'fit';
    const config = global.testData || require(\`./../../data/\${environment}/config.json\`);
    
    const baseUrl = config.url || config.non_protected_portal;
    const urlMappings = {
      main: baseUrl,
      ${baseName}: baseUrl + '/${baseName}',
      application: baseUrl
    };
    
    return urlMappings[pageType] || baseUrl;
  }

  // Configuration methods
  async ensureSystemConfiguration() {
    await this.waitForPageLoad();
  }

  // Action methods
  async performRequiredAction() {
    // Implement the main action based on requirement
    await this.isVisible(${baseName.toUpperCase().replace(/-/g, '_')}_PRIMARY_ELEMENT);
    await this.click(${baseName.toUpperCase().replace(/-/g, '_')}_PRIMARY_ELEMENT);
  }

  // Verification methods following SBS patterns
  async verifyExpectedResult() {
    try {
      await this.waitFor(${baseName.toUpperCase().replace(/-/g, '_')}_CONTAINER, { state: 'visible', timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = ${className}Page;
`;
    }

    /**
     * Generate base name from title
     */
    generateBaseName(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    /**
     * Convert to PascalCase
     */
    toPascalCase(str) {
        return str
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
    }
}

module.exports = TemplateProcessor;
