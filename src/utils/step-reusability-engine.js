/**
 * Step Reusability Engine - Searches main SBS_Automation framework for existing step definitions
 * and reuses them instead of generating new ones
 */

const fs = require('fs');
const path = require('path');

class StepReusabilityEngine {
    constructor() {
        this.mainSBSStepsPath = path.join(process.cwd(), '..', '..', 'SBS_Automation', 'steps');
        this.stepRegistry = new Map();
        this.stepPatterns = new Map();
        this.backgroundSteps = new Set();
        
        console.log('🔍 Step Reusability Engine initialized');
        console.log('📂 Scanning main SBS steps:', this.mainSBSStepsPath);
        
        this.initializeStepRegistry();
    }

    async initializeStepRegistry() {
        try {
            await this.scanAllStepFiles();
            console.log(`✅ Cached ${this.stepRegistry.size} existing steps from main framework`);
            console.log(`📋 Found ${this.backgroundSteps.size} background steps`);
            console.log(`🔄 Identified ${this.stepPatterns.size} reusable patterns`);
        } catch (error) {
            console.log('⚠️  Warning: Could not scan main SBS steps:', error.message);
        }
    }

    async scanAllStepFiles() {
        const stepFiles = await this.findStepFiles(this.mainSBSStepsPath);
        
        for (const filePath of stepFiles) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const steps = this.extractStepsFromFile(content, filePath);
                
                steps.forEach(step => {
                    // Create searchable keys
                    const keys = this.generateSearchKeys(step.text);
                    
                    keys.forEach(key => {
                        if (!this.stepRegistry.has(key)) {
                            this.stepRegistry.set(key, []);
                        }
                        this.stepRegistry.get(key).push({
                            ...step,
                            sourceFile: path.relative(this.mainSBSStepsPath, filePath),
                            relativeImportPath: this.calculateImportPath(filePath)
                        });
                    });

                    // Track background steps
                    if (this.isBackgroundStep(step.text)) {
                        this.backgroundSteps.add(step.text);
                    }

                    // Track common patterns
                    this.categorizeStep(step);
                });
            } catch (error) {
                console.log(`⚠️  Skipping file ${filePath}:`, error.message);
                continue;
            }
        }
    }

    async findStepFiles(dir) {
        const files = [];
        
        if (!fs.existsSync(dir)) {
            return files;
        }
        
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                files.push(...await this.findStepFiles(fullPath));
            } else if (item.endsWith('-steps.js') || item.endsWith('-step.js')) {
                files.push(fullPath);
            }
        }
        
        return files;
    }

    extractStepsFromFile(content, filePath) {
        const steps = [];
        
        // Match Given, When, Then step definitions
        const stepPattern = /(Given|When|Then)\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*async\s+function\s*\([^)]*\)\s*\{([\s\S]*?)^\}\);/gm;
        
        let match;
        while ((match = stepPattern.exec(content)) !== null) {
            const stepType = match[1];
            const stepText = match[2];
            const implementation = match[3].trim();
            
            steps.push({
                type: stepType,
                text: stepText,
                implementation: implementation,
                file: path.basename(filePath),
                fullPath: filePath
            });
        }
        
        return steps;
    }

    generateSearchKeys(stepText) {
        const keys = new Set();
        
        // Original text (exact match)
        keys.add(stepText.toLowerCase());
        
        // Normalized text (remove articles, prepositions)
        const normalized = stepText.toLowerCase()
            .replace(/\b(a|an|the|in|on|at|to|for|of|with|by)\b/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        keys.add(normalized);
        
        // Keywords extraction
        const words = stepText.toLowerCase()
            .replace(/[^a-zA-Z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2);
        
        // Add individual keywords
        words.forEach(word => keys.add(word));
        
        // Add word combinations
        for (let i = 0; i < words.length - 1; i++) {
            keys.add(words[i] + ' ' + words[i + 1]);
        }
        
        // Add action-based keys
        const actionWords = ['click', 'verify', 'login', 'navigate', 'upload', 'download', 'fill', 'submit', 'switch'];
        actionWords.forEach(action => {
            if (stepText.toLowerCase().includes(action)) {
                keys.add(action);
            }
        });
        
        return Array.from(keys);
    }

    isBackgroundStep(stepText) {
        const backgroundPatterns = [
            /logged into runmod/i,
            /verifies.*payroll.*section/i,
            /homepage.*test.*client/i,
            /authenticated.*system/i
        ];
        
        return backgroundPatterns.some(pattern => pattern.test(stepText));
    }

    categorizeStep(step) {
        const categories = {
            'login': /login|authenticate|sign\s*in/i,
            'navigation': /navigate|goto|visit|open/i,
            'verification': /verify|check|see|should.*be|displayed/i,
            'interaction': /click|press|tap|select/i,
            'data_entry': /fill|enter|type|input/i,
            'upload': /upload|attach|file/i,
            'employee_management': /employee|contractor|w2|switch/i,
            'payroll': /payroll|payment|salary/i
        };
        
        Object.entries(categories).forEach(([category, pattern]) => {
            if (pattern.test(step.text)) {
                if (!this.stepPatterns.has(category)) {
                    this.stepPatterns.set(category, []);
                }
                this.stepPatterns.get(category).push(step);
            }
        });
    }

    calculateImportPath(stepFilePath) {
        // Calculate relative import path from auto-coder/SBS_Automation/steps to main SBS_Automation/steps
        const relativePath = path.relative(
            path.join(process.cwd(), 'SBS_Automation', 'steps'),
            stepFilePath
        );
        return relativePath.replace(/\.js$/, '');
    }

    findExistingStep(stepText, stepType = null) {
        const searchKeys = this.generateSearchKeys(stepText);
        const matches = [];
        
        // Search for exact or similar matches
        for (const key of searchKeys) {
            if (this.stepRegistry.has(key)) {
                const steps = this.stepRegistry.get(key);
                steps.forEach(step => {
                    const similarity = this.calculateSimilarity(stepText, step.text);
                    if (similarity > 0.7) { // 70% similarity threshold
                        matches.push({
                            ...step,
                            similarity: similarity,
                            searchKey: key
                        });
                    }
                });
            }
        }
        
        // Sort by similarity and filter by step type if provided
        let sortedMatches = matches
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 5); // Top 5 matches
        
        if (stepType) {
            sortedMatches = sortedMatches.filter(match => match.type === stepType);
        }
        
        return sortedMatches;
    }

    findStepsByCategory(category) {
        return this.stepPatterns.get(category) || [];
    }

    getRecommendedBackgroundSteps() {
        // Return the standard background steps used in main SBS_Automation
        return [
            {
                text: "Alex is logged into RunMod with a homepage test client",
                type: "Given",
                isStandard: true
            },
            {
                text: "Alex verifies that the Payroll section on the Home Page is displayed", 
                type: "Then",
                isStandard: true
            }
        ];
    }

    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        return (longer.length - this.levenshteinDistance(longer, shorter)) / longer.length;
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    generateStepRecommendations(newStepText, stepType) {
        const existingSteps = this.findExistingStep(newStepText, stepType);
        
        if (existingSteps.length === 0) {
            return {
                recommendation: 'CREATE_NEW',
                reason: 'No similar existing steps found',
                existingSteps: [],
                suggestedImplementation: null
            };
        }
        
        const bestMatch = existingSteps[0];
        
        if (bestMatch.similarity > 0.95) {
            return {
                recommendation: 'USE_EXISTING_EXACT',
                reason: `Exact match found in ${bestMatch.sourceFile}`,
                existingSteps: [bestMatch],
                suggestedImplementation: bestMatch.implementation,
                importPath: bestMatch.relativeImportPath
            };
        } else if (bestMatch.similarity > 0.8) {
            return {
                recommendation: 'USE_EXISTING_SIMILAR',
                reason: `Similar step found (${Math.round(bestMatch.similarity * 100)}% match) in ${bestMatch.sourceFile}`,
                existingSteps: existingSteps.slice(0, 3),
                suggestedImplementation: bestMatch.implementation,
                adaptationNeeded: true,
                importPath: bestMatch.relativeImportPath
            };
        } else {
            return {
                recommendation: 'ADAPT_EXISTING',
                reason: `Related steps found, consider adapting`,
                existingSteps: existingSteps.slice(0, 3),
                suggestedImplementation: null,
                adaptationNeeded: true
            };
        }
    }

    generateStepsFileWithReusability(steps, fileName) {
        const imports = new Set();
        const stepDefinitions = [];
        
        // Add standard imports
        imports.add("const { Given, When, Then } = require('@cucumber/cucumber');");
        imports.add("const { assert } = require('chai');");
        
        // Process each step
        steps.forEach(step => {
            const recommendation = this.generateStepRecommendations(step.text, step.type);
            
            switch (recommendation.recommendation) {
                case 'USE_EXISTING_EXACT':
                case 'USE_EXISTING_SIMILAR':
                    // Import the existing step file
                    imports.add(`// Reusing step from main framework: ${recommendation.existingSteps[0].sourceFile}`);
                    imports.add(`require('../../../SBS_Automation/steps/${recommendation.importPath}');`);
                    
                    // Don't generate new step definition
                    console.log(`✅ Reusing existing step: "${step.text}" from ${recommendation.existingSteps[0].sourceFile}`);
                    break;
                    
                case 'ADAPT_EXISTING':
                    // Generate adapted version
                    const adapted = this.adaptStepImplementation(step, recommendation.existingSteps[0]);
                    stepDefinitions.push(adapted);
                    console.log(`🔄 Adapting existing step: "${step.text}"`);
                    break;
                    
                case 'CREATE_NEW':
                default:
                    // Generate new step
                    const newStep = this.generateNewStepDefinition(step, fileName);
                    stepDefinitions.push(newStep);
                    console.log(`🆕 Creating new step: "${step.text}"`);
                    break;
            }
        });
        
        // Build final steps file content
        const importsArray = Array.from(imports);
        const content = [
            ...importsArray,
            '',
            `let ${this.toCamelCase(fileName)}Page;`,
            '',
            ...stepDefinitions
        ].join('\n');
        
        return content;
    }

    adaptStepImplementation(newStep, existingStep) {
        // Adapt existing step implementation to new context
        let adaptedImplementation = existingStep.implementation;
        
        // Replace page object references
        const pageClassName = this.toPascalCase(newStep.fileName || 'generated') + 'Page';
        const pageInstanceName = this.toCamelCase(newStep.fileName || 'generated') + 'Page';
        
        // Simple adaptations
        adaptedImplementation = adaptedImplementation
            .replace(/\w+Page/g, pageInstanceName)
            .replace(/new\s+\w+Page/g, `new ${pageClassName}`);
        
        return `${newStep.type}('${newStep.text}', async function () {
  // Adapted from ${existingStep.sourceFile}
  ${pageInstanceName} = new ${pageClassName}(this.page);
  ${adaptedImplementation}
});`;
    }

    generateNewStepDefinition(step, fileName) {
        const pageClassName = this.toPascalCase(fileName) + 'Page';
        const pageInstanceName = this.toCamelCase(fileName) + 'Page';
        const methodName = this.generateMethodName(step.text);
        
        return `${step.type}('${step.text}', async function () {
  ${pageInstanceName} = new ${pageClassName}(this.page);
  await ${pageInstanceName}.${methodName}();
});`;
    }

    toPascalCase(str) {
        return str.replace(/(?:^|[\s-_])+(.)/g, (_, char) => char.toUpperCase());
    }

    toCamelCase(str) {
        const pascal = this.toPascalCase(str);
        return pascal.charAt(0).toLowerCase() + pascal.slice(1);
    }

    generateMethodName(stepText) {
        return stepText
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');
    }

    // Analytics and reporting
    generateReusabilityReport() {
        const report = {
            totalStepsScanned: this.stepRegistry.size,
            categoriesFound: Array.from(this.stepPatterns.keys()),
            backgroundSteps: Array.from(this.backgroundSteps),
            topCategories: Array.from(this.stepPatterns.entries())
                .map(([category, steps]) => ({ category, count: steps.length }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10)
        };
        
        return report;
    }
}

module.exports = StepReusabilityEngine;
