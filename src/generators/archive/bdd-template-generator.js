/**
 * 🎯 BDD TEMPLATE-DRIVEN GENERATION SYSTEM
 * 
 * TOP PRIORITY: Non-AI Template-to-Artifacts Generation
 * Requirement: BDD Template → Feature → Steps → Page (Pure Logic)
 * 
 * Process: BDD template → Feature file → Steps file → Page file
 * NO AI DEPENDENCY - Pure framework logic and mapping
 */

const fs = require('fs');
const path = require('path');

class BDDTemplateGenerator {
    constructor() {
        this.config = {
            templatesPath: 'requirements/templates',
            completedPath: 'requirements/templates/completed',
            outputPath: 'SBS_Automation',
            featuresPath: 'SBS_Automation/features',
            stepsPath: 'SBS_Automation/steps', 
            pagesPath: 'SBS_Automation/pages'
        };
    }

    /**
     * STEP 1: Parse BDD Template 
     * Extract structured data from completed BDD template
     */
    parseBDDTemplate(templateFilePath) {
        console.log(`🔍 Parsing BDD Template: ${templateFilePath}`);
        
        const content = fs.readFileSync(templateFilePath, 'utf8');
        
        // Extract core information using regex patterns
        const parsed = {
            title: this.extractTitle(content),
            description: this.extractDescription(content),
            userStory: this.extractUserStory(content),
            scenarios: this.extractScenarios(content),
            featureFlags: this.extractFeatureFlags(content),
            fileName: path.basename(templateFilePath, '.md')
        };

        console.log(`✅ Template parsed successfully: ${parsed.title}`);
        return parsed;
    }

    /**
     * STEP 2: Generate Feature File from BDD Template
     * Direct mapping from BDD structure to Gherkin feature
     */
    generateFeatureFile(parsedTemplate) {
        console.log(`🎯 Generating Feature File: ${parsedTemplate.title}`);
        
        const featureContent = this.buildFeatureContent(parsedTemplate);
        const featureFileName = `${this.sanitizeFileName(parsedTemplate.fileName)}.feature`;
        const featurePath = path.join(this.config.featuresPath, featureFileName);
        
        // Ensure directory exists
        this.ensureDirectoryExists(this.config.featuresPath);
        
        fs.writeFileSync(featurePath, featureContent);
        console.log(`✅ Feature file generated: ${featurePath}`);
        
        return { path: featurePath, content: featureContent, fileName: featureFileName };
    }

    /**
     * STEP 3: Generate Steps File from Feature File
     * Extract step definitions from feature scenarios
     */
    generateStepsFile(featureData, parsedTemplate) {
        console.log(`🔧 Generating Steps File: ${parsedTemplate.title}`);
        
        const stepsContent = this.buildStepsContent(featureData, parsedTemplate);
        const stepsFileName = `${this.sanitizeFileName(parsedTemplate.fileName)}-steps.js`;
        const stepsPath = path.join(this.config.stepsPath, stepsFileName);
        
        // Ensure directory exists
        this.ensureDirectoryExists(this.config.stepsPath);
        
        fs.writeFileSync(stepsPath, stepsContent);
        console.log(`✅ Steps file generated: ${stepsPath}`);
        
        return { path: stepsPath, content: stepsContent, fileName: stepsFileName };
    }

    /**
     * STEP 4: Generate Page File from Steps File
     * Extract page elements and actions from step definitions
     */
    generatePageFile(stepsData, parsedTemplate) {
        console.log(`📄 Generating Page File: ${parsedTemplate.title}`);
        
        const pageContent = this.buildPageContent(stepsData, parsedTemplate);
        const pageFileName = `${this.sanitizeFileName(parsedTemplate.fileName)}-page.js`;
        const pagePath = path.join(this.config.pagesPath, pageFileName);
        
        // Ensure directory exists
        this.ensureDirectoryExists(this.config.pagesPath);
        
        fs.writeFileSync(pagePath, pageContent);
        console.log(`✅ Page file generated: ${pagePath}`);
        
        return { path: pagePath, content: pageContent, fileName: pageFileName };
    }

    /**
     * MAIN PIPELINE: BDD Template → Feature → Steps → Page
     */
    async generateFromBDDTemplate(templateFilePath) {
        try {
            console.log(`\n🚀 STARTING BDD TEMPLATE-DRIVEN GENERATION`);
            console.log(`📋 Template: ${templateFilePath}`);
            
            // Step 1: Parse BDD Template
            const parsedTemplate = this.parseBDDTemplate(templateFilePath);
            
            // Step 2: Generate Feature File
            const featureData = this.generateFeatureFile(parsedTemplate);
            
            // Step 3: Generate Steps File  
            const stepsData = this.generateStepsFile(featureData, parsedTemplate);
            
            // Step 4: Generate Page File
            const pageData = this.generatePageFile(stepsData, parsedTemplate);
            
            const result = {
                success: true,
                generated: {
                    feature: featureData,
                    steps: stepsData,
                    page: pageData
                },
                template: parsedTemplate
            };
            
            console.log(`\n🎉 BDD TEMPLATE GENERATION COMPLETED SUCCESSFULLY!`);
            console.log(`✅ Feature: ${featureData.fileName}`);
            console.log(`✅ Steps: ${stepsData.fileName}`);
            console.log(`✅ Page: ${pageData.fileName}`);
            
            return result;
            
        } catch (error) {
            console.error(`❌ BDD Template Generation Failed:`, error);
            return {
                success: false,
                error: error.message,
                template: templateFilePath
            };
        }
    }

    // ========== PARSING METHODS ==========

    extractTitle(content) {
        // Try multiple patterns for title extraction
        const patterns = [
            /\*\*Feature Title\*\*:\s*(.+)/i,
            /\*\*Requirement\*\*\s*or\s*\*\*Feature\*\*:\s*(.+)/i,
            /\*\*Title:\*\*\s*(.+)/i,
            /##\s*(.+)/,
            /Feature:\s*(.+)/i
        ];
        
        for (const pattern of patterns) {
            const match = content.match(pattern);
            if (match) return match[1].trim();
        }
        
        return 'Generated Feature';
    }

    extractDescription(content) {
        const patterns = [
            /\*\*Description\*\*:\s*(.+?)(?=\n\n|\*\*|##)/s,
            /What are you testing\?\s*\*\*Description:\*\*\s*(.+?)(?=\n\n|\*\*|##)/s
        ];
        
        for (const pattern of patterns) {
            const match = content.match(pattern);
            if (match) return match[1].trim();
        }
        
        return 'Auto-generated feature description';
    }

    extractUserStory(content) {
        const asMatch = content.match(/\*\*As a\*\*\s*(.+)/i);
        const wantMatch = content.match(/\*\*I want\*\*\s*(.+)/i);
        const soMatch = content.match(/\*\*So that\*\*\s*(.+)/i);
        
        return {
            as: asMatch ? asMatch[1].trim() : 'user',
            want: wantMatch ? wantMatch[1].trim() : 'to perform actions',
            so: soMatch ? soMatch[1].trim() : 'to achieve goals'
        };
    }

    extractScenarios(content) {
        const scenarios = [];
        
        // First try template format (### Scenario:)
        const templatePattern = /###\s*Scenario\s*\d*:\s*(.+?)\n([\s\S]*?)(?=###\s*Scenario|$)/g;
        let match;
        while ((match = templatePattern.exec(content)) !== null) {
            const scenarioName = match[1].trim();
            const scenarioContent = match[2];
            
            // Extract steps with improved parsing
            const scenario = {
                name: scenarioName,
                given: this.extractMultipleSteps(scenarioContent, 'Given'),
                when: this.extractMultipleSteps(scenarioContent, 'When'),
                then: this.extractMultipleSteps(scenarioContent, 'Then'),
                and: this.extractMultipleSteps(scenarioContent, 'And')
            };
            
            scenarios.push(scenario);
        }
        
        // If no template scenarios found, try actual Gherkin format
        if (scenarios.length === 0) {
            console.log('📋 No template scenarios found, parsing as Gherkin...');
            const gherkinPattern = /Scenario:\s*(.+?)\n([\s\S]*?)(?=\n\s*(?:Scenario|Rule|Feature|@|$))/g;
            while ((match = gherkinPattern.exec(content)) !== null) {
                const scenarioName = match[1].trim();
                const scenarioContent = match[2].trim();
                
                const scenario = {
                    name: scenarioName,
                    given: this.extractGherkinSteps(scenarioContent, 'Given'),
                    when: this.extractGherkinSteps(scenarioContent, 'When'),
                    then: this.extractGherkinSteps(scenarioContent, 'Then'),
                    and: this.extractGherkinSteps(scenarioContent, 'And')
                };
                
                scenarios.push(scenario);
            }
        }
        
        return scenarios;
    }

    extractGherkinSteps(content, stepType) {
        const steps = [];
        const pattern = new RegExp(`^\\s*(${stepType})\\s+(.+)$`, 'gim');
        let match;
        
        while ((match = pattern.exec(content)) !== null) {
            const stepText = match[2].trim();
            
            // Skip data tables and other non-step lines
            if (!stepText.includes('|') && !stepText.includes('"""') && stepText.length > 0) {
                steps.push(stepText);
            }
        }
        
        return steps;
    }

    extractMultipleSteps(content, stepType) {
        const steps = [];
        const pattern = new RegExp(`\\*\\*${stepType}\\*\\*\\s*(.+?)(?=\\n\\*\\*|\\n\\n|$)`, 'gi');
        
        let match;
        while ((match = pattern.exec(content)) !== null) {
            steps.push(match[1].trim());
        }
        
        return steps;
    }

    extractStep(content, stepType) {
        const steps = this.extractMultipleSteps(content, stepType);
        return steps.length > 0 ? steps[0] : '';
    }

    extractFeatureFlags(content) {
        const flagPattern = /\*\*Feature Flags\*\*:\s*(.+?)(?=\n\n|$)/s;
        const match = content.match(flagPattern);
        return match ? match[1].trim() : 'None';
    }

    // ========== CONTENT BUILDERS ==========

    buildFeatureContent(parsedTemplate) {
        const { title, description, userStory, scenarios } = parsedTemplate;
        
        // Extract feature tag from title (e.g., "CashFlow Central (CFC)" -> @CFC)
        const featureTags = this.extractFeatureTags(title);
        let featureContent = `${featureTags}\n`;
        featureContent += `Feature: ${title}\n\n`;
        
        // Add user story if properly extracted
        if (userStory.as && userStory.as !== 'user') {
            featureContent += `  As a ${userStory.as}\n`;
            featureContent += `  I want ${userStory.want}\n`;
            featureContent += `  So that ${userStory.so}\n\n`;
        }
        
        // Add background if we have meaningful content
        if (description && description !== 'Auto-generated feature description') {
            featureContent += `  Background:\n`;
            featureContent += `    Given the application is accessible\n\n`;
        }
        
        // Process each scenario with proper step mapping AND Examples table
        scenarios.forEach((scenario, index) => {
            featureContent += `  Scenario Outline: ${scenario.name}\n`;
            
            // Add Given steps
            if (scenario.given && scenario.given.length > 0) {
                scenario.given.forEach((givenStep, stepIndex) => {
                    if (givenStep) {
                        featureContent += `    Given ${givenStep}\n`;
                    }
                });
            }
            
            // Add When steps (PRESERVE PARAMETERS like <bundle>)
            if (scenario.when && scenario.when.length > 0) {
                scenario.when.forEach((whenStep, stepIndex) => {
                    if (whenStep) {
                        featureContent += `    When ${whenStep}\n`;
                    }
                });
            }
            
            // Add Then steps
            if (scenario.then && scenario.then.length > 0) {
                scenario.then.forEach((thenStep, stepIndex) => {
                    if (thenStep) {
                        featureContent += `    Then ${thenStep}\n`;
                    }
                });
            }
            
            // Add And steps
            if (scenario.and && scenario.and.length > 0) {
                scenario.and.forEach((andStep, stepIndex) => {
                    if (andStep) {
                        featureContent += `    And ${andStep}\n`;
                    }
                });
            }
            
            // CRITICAL FIX: Add Examples table if found in template
            const examplesTable = this.extractExamplesTable(parsedTemplate.content);
            if (examplesTable) {
                featureContent += `\n    Examples:\n`;
                featureContent += examplesTable;
            }
            
            // Add spacing between scenarios
            if (index < scenarios.length - 1) featureContent += `\n`;
        });
        
        return featureContent;
    }

    buildStepsContent(featureData, parsedTemplate) {
        const className = this.toCamelCase(parsedTemplate.fileName) + 'Page';
        const pageFileName = `${this.sanitizeFileName(parsedTemplate.fileName)}-page`;
        const instanceVarName = this.toCamelCase(parsedTemplate.fileName).toLowerCase() + 'Page';
        
        let stepsContent = `// ${parsedTemplate.title} - Step Definitions\n`;
        stepsContent += `// Generated by BDD Template-Driven Generation System\n`;
        stepsContent += `// Framework: SBS_Automation Compliant\n\n`;
        
        stepsContent += `const { Given, When, Then, And } = require('@cucumber/cucumber');\n`;
        stepsContent += `const { expect } = require('@playwright/test');\n`;
        stepsContent += `const ${className} = require('../pages/${pageFileName}');\n\n`;
        
        stepsContent += `let ${instanceVarName};\n\n`;
        
        // Extract unique steps from feature content
        const steps = this.extractUniqueSteps(featureData.content);
        
        steps.forEach(step => {
            const stepType = step.t
