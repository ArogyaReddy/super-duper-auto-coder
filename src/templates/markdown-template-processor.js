const fs = require('fs-extra');
const path = require('path');

class MarkdownTemplateProcessor {
    constructor() {
        this.templateSections = {};
    }

    async processTemplate(templatePath) {
        console.log(`📖 Processing template: ${templatePath}`);
        
        const templateContent = await fs.readFile(templatePath, 'utf8');
        this.parseTemplate(templateContent);
        
        const requirement = this.convertToRequirement();
        
        // Save the processed requirement to a text file
        const requirementPath = this.generateRequirementFile(templatePath, requirement);
        
        return requirementPath;
    }

    parseTemplate(content) {
        const sections = content.split('---');
        
        for (const section of sections) {
            this.extractSectionData(section);
        }
    }

    extractSectionData(section) {
        // Extract Feature Name
        const featureNameMatch = section.match(/### Feature Name[\s\S]*?```([\s\S]*?)```/);
        if (featureNameMatch) {
            this.templateSections.featureName = this.cleanText(featureNameMatch[1]);
        }

        // Extract Description
        const descriptionMatch = section.match(/### Description[\s\S]*?```([\s\S]*?)```/);
        if (descriptionMatch) {
            this.templateSections.description = this.cleanText(descriptionMatch[1]);
        }

        // Extract Priority
        const priorityMatch = section.match(/### Priority[\s\S]*?```([\s\S]*?)```/);
        if (priorityMatch) {
            this.templateSections.priority = this.cleanText(priorityMatch[1]);
        }

        // Extract Scenarios
        this.extractScenarios(section);

        // Extract Test Data
        this.extractTestData(section);

        // Extract UI Elements
        this.extractUIElements(section);

        // Extract API Requirements
        this.extractAPIRequirements(section);

        // Extract Tags
        const tagsMatch = section.match(/### Test Tags[\s\S]*?```([\s\S]*?)```/);
        if (tagsMatch) {
            this.templateSections.tags = this.cleanText(tagsMatch[1]);
        }

        // Extract Category
        const categoryMatch = section.match(/### Test Category[\s\S]*?```([\s\S]*?)```/);
        if (categoryMatch) {
            this.templateSections.category = this.cleanText(categoryMatch[1]);
        }
    }

    extractScenarios(section) {
        if (!this.templateSections.scenarios) {
            this.templateSections.scenarios = [];
        }

        // Extract Scenario 1: Happy Path
        const scenario1Match = section.match(/### Scenario 1: Happy Path[\s\S]*?```([\s\S]*?)```/);
        if (scenario1Match) {
            this.templateSections.scenarios.push({
                type: 'happy_path',
                content: this.cleanText(scenario1Match[1])
            });
        }

        // Extract Scenario 2: Alternative Flow
        const scenario2Match = section.match(/### Scenario 2: Alternative Flow[\s\S]*?```([\s\S]*?)```/);
        if (scenario2Match) {
            this.templateSections.scenarios.push({
                type: 'alternative',
                content: this.cleanText(scenario2Match[1])
            });
        }

        // Extract Scenario 3: Error/Edge Case
        const scenario3Match = section.match(/### Scenario 3: Error\/Edge Case[\s\S]*?```([\s\S]*?)```/);
        if (scenario3Match) {
            this.templateSections.scenarios.push({
                type: 'error_case',
                content: this.cleanText(scenario3Match[1])
            });
        }
    }

    extractTestData(section) {
        const validDataMatch = section.match(/### Valid Test Data[\s\S]*?```([\s\S]*?)```/);
        if (validDataMatch) {
            this.templateSections.validTestData = this.cleanText(validDataMatch[1]);
        }

        const invalidDataMatch = section.match(/### Invalid Test Data[\s\S]*?```([\s\S]*?)```/);
        if (invalidDataMatch) {
            this.templateSections.invalidTestData = this.cleanText(invalidDataMatch[1]);
        }
    }

    extractUIElements(section) {
        const uiElementsMatch = section.match(/### Page Elements[\s\S]*?```([\s\S]*?)```/);
        if (uiElementsMatch) {
            this.templateSections.uiElements = this.cleanText(uiElementsMatch[1]);
        }

        const navigationMatch = section.match(/### Navigation[\s\S]*?```([\s\S]*?)```/);
        if (navigationMatch) {
            this.templateSections.navigation = this.cleanText(navigationMatch[1]);
        }
    }

    extractAPIRequirements(section) {
        const apiEndpointsMatch = section.match(/### API Endpoints[\s\S]*?```([\s\S]*?)```/);
        if (apiEndpointsMatch) {
            this.templateSections.apiEndpoints = this.cleanText(apiEndpointsMatch[1]);
        }

        const requestResponseMatch = section.match(/### Request\/Response[\s\S]*?```([\s\S]*?)```/);
        if (requestResponseMatch) {
            this.templateSections.requestResponse = this.cleanText(requestResponseMatch[1]);
        }
    }

    cleanText(text) {
        return text
            .replace(/\[Replace with.*?\]/g, '')
            .replace(/Example: /g, '')
            .replace(/^\s*\n/gm, '')
            .trim();
    }

    convertToRequirement() {
        const featureName = this.templateSections.featureName || 'Generated Feature';
        const description = this.templateSections.description || 'Generated from BDD template';
        const priority = this.templateSections.priority || 'Medium';

        let requirement = `# ${featureName}\n\n`;
        requirement += `**Description:** ${description}\n\n`;
        requirement += `**Priority:** ${priority}\n\n`;

        // Add scenarios
        if (this.templateSections.scenarios && this.templateSections.scenarios.length > 0) {
            requirement += `## Test Scenarios\n\n`;
            
            this.templateSections.scenarios.forEach((scenario, index) => {
                requirement += `### Scenario ${index + 1}: ${this.getScenarioTitle(scenario.type)}\n`;
                requirement += `${scenario.content}\n\n`;
            });
        }

        // Add test data
        if (this.templateSections.validTestData) {
            requirement += `## Test Data\n\n`;
            requirement += `**Valid Data:**\n${this.templateSections.validTestData}\n\n`;
        }

        if (this.templateSections.invalidTestData) {
            requirement += `**Invalid Data:**\n${this.templateSections.invalidTestData}\n\n`;
        }

        // Add UI elements if present
        if (this.templateSections.uiElements) {
            requirement += `## UI Elements\n\n`;
            requirement += `${this.templateSections.uiElements}\n\n`;
        }

        // Add navigation if present
        if (this.templateSections.navigation) {
            requirement += `## Navigation Flow\n\n`;
            requirement += `${this.templateSections.navigation}\n\n`;
        }

        // Add API details if present
        if (this.templateSections.apiEndpoints) {
            requirement += `## API Requirements\n\n`;
            requirement += `**Endpoints:**\n${this.templateSections.apiEndpoints}\n\n`;
        }

        if (this.templateSections.requestResponse) {
            requirement += `**Request/Response:**\n${this.templateSections.requestResponse}\n\n`;
        }

        // Add tags and category
        if (this.templateSections.tags) {
            requirement += `## Test Configuration\n\n`;
            requirement += `**Tags:** ${this.templateSections.tags}\n`;
        }

        if (this.templateSections.category) {
            requirement += `**Category:** ${this.templateSections.category}\n\n`;
        }

        return requirement;
    }

    getScenarioTitle(type) {
        switch (type) {
            case 'happy_path':
                return 'Happy Path (Main Success Flow)';
            case 'alternative':
                return 'Alternative Flow';
            case 'error_case':
                return 'Error/Edge Case';
            default:
                return 'Test Scenario';
        }
    }

    generateRequirementFile(templatePath, requirement) {
        const templateName = path.basename(templatePath, '.md');
        const requirementFileName = templateName.replace('bdd-requirement-template-', 'processed-requirement-') + '.txt';
        const requirementPath = path.join(path.dirname(templatePath), '..', 'text', requirementFileName);
        
        // Ensure the text directory exists
        fs.ensureDirSync(path.dirname(requirementPath));
        
        // Write the processed requirement
        fs.writeFileSync(requirementPath, requirement);
        
        console.log(`✅ Processed requirement saved: ${requirementPath}`);
        return requirementPath;
    }
}

module.exports = MarkdownTemplateProcessor;
