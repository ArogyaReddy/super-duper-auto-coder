/**
 * Page Method Replicator - Searches main SBS_Automation framework for similar page methods
 * and reuses them to generate realistic implementations
 */

const fs = require('fs');
const path = require('path');

class PageMethodReplicator {
    constructor() {
        this.mainSBSPath = path.join(process.cwd(), '..', '..', 'SBS_Automation', 'pages');
        this.supportPath = path.join(process.cwd(), '..', '..', 'SBS_Automation', 'support');
        this.methodCache = new Map();
        this.locatorCache = new Map();
        
        console.log('PageMethodReplicator initialized');
        console.log('Main SBS path:', this.mainSBSPath);
        
        this.initializeCache();
    }

    async initializeCache() {
        try {
            await this.scanPagesForMethods();
            await this.scanPagesForLocators();
            console.log(`Cached ${this.methodCache.size} methods and ${this.locatorCache.size} locators`);
        } catch (error) {
            console.log('Warning: Could not scan main SBS_Automation pages:', error.message);
        }
    }

    async scanPagesForMethods() {
        const pageFiles = await this.findPageFiles(this.mainSBSPath);
        
        for (const filePath of pageFiles) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const methods = this.extractMethodsFromFile(content, filePath);
                
                methods.forEach(method => {
                    const keywords = this.generateKeywords(method.name);
                    keywords.forEach(keyword => {
                        if (!this.methodCache.has(keyword)) {
                            this.methodCache.set(keyword, []);
                        }
                        this.methodCache.get(keyword).push({
                            ...method,
                            sourceFile: path.relative(this.mainSBSPath, filePath)
                        });
                    });
                });
            } catch (error) {
                // Skip files that can't be read
                continue;
            }
        }
    }

    async scanPagesForLocators() {
        const pageFiles = await this.findPageFiles(this.mainSBSPath);
        
        for (const filePath of pageFiles) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const locators = this.extractLocatorsFromFile(content, filePath);
                
                locators.forEach(locator => {
                    const keywords = this.generateKeywords(locator.name);
                    keywords.forEach(keyword => {
                        if (!this.locatorCache.has(keyword)) {
                            this.locatorCache.set(keyword, []);
                        }
                        this.locatorCache.get(keyword).push({
                            ...locator,
                            sourceFile: path.relative(this.mainSBSPath, filePath)
                        });
                    });
                });
            } catch (error) {
                continue;
            }
        }
    }

    async findPageFiles(dir) {
        const files = [];
        
        if (!fs.existsSync(dir)) {
            return files;
        }
        
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                files.push(...await this.findPageFiles(fullPath));
            } else if (item.endsWith('.js') && item.includes('page')) {
                files.push(fullPath);
            }
        }
        
        return files;
    }

    extractMethodsFromFile(content, filePath) {
        const methods = [];
        
        // Match async methods with implementation
        const methodPattern = /async\s+(\w+)\s*\([^)]*\)\s*\{([\s\S]*?)(?=\n\s*async\s+\w+|\n\s*\w+\s*\([^)]*\)\s*\{|\nmodule\.exports|\n\s*}\s*$)/g;
        
        let match;
        while ((match = methodPattern.exec(content)) !== null) {
            const methodName = match[1];
            const methodBody = match[2].trim();
            
            // Skip constructors and overly simple methods
            if (methodName === 'constructor' || methodBody.length < 20) {
                continue;
            }
            
            // Extract locators used in the method
            const locatorsUsed = this.extractLocatorsFromMethod(methodBody);
            
            methods.push({
                name: methodName,
                body: methodBody,
                locators: locatorsUsed,
                file: path.basename(filePath)
            });
        }
        
        return methods;
    }

    extractLocatorsFromFile(content, filePath) {
        const locators = [];
        
        // Match locator definitions
        const locatorPattern = /const\s+(\w+)\s*=\s*By\.(\w+)\s*\([^)]+\)/g;
        
        let match;
        while ((match = locatorPattern.exec(content)) !== null) {
            const locatorName = match[1];
            const locatorType = match[2];
            const fullDefinition = match[0];
            
            locators.push({
                name: locatorName,
                type: locatorType,
                definition: fullDefinition,
                file: path.basename(filePath)
            });
        }
        
        return locators;
    }

    extractLocatorsFromMethod(methodBody) {
        const locators = [];
        const locatorUsagePattern = /\b(\w+(?:_\w+)*)\b/g;
        
        let match;
        while ((match = locatorUsagePattern.exec(methodBody)) !== null) {
            const locatorName = match[1];
            if (locatorName.toUpperCase() === locatorName && locatorName.length > 2) {
                locators.push(locatorName);
            }
        }
        
        return [...new Set(locators)]; // Remove duplicates
    }

    generateKeywords(text) {
        // Generate search keywords from method/locator names
        const keywords = [];
        const words = text.toLowerCase()
            .replace(/([A-Z])/g, ' $1')
            .split(/[\s_-]+/)
            .filter(word => word.length > 2);
        
        // Add individual words
        keywords.push(...words);
        
        // Add combinations
        for (let i = 0; i < words.length - 1; i++) {
            keywords.push(words[i] + words[i + 1]);
        }
        
        return keywords;
    }

    searchSimilarMethods(context) {
        const results = [];
        const searchTerms = this.generateSearchTerms(context);
        
        for (const term of searchTerms) {
            if (this.methodCache.has(term)) {
                results.push(...this.methodCache.get(term));
            }
        }
        
        // Score and sort results by relevance
        const scored = results.map(method => ({
            ...method,
            score: this.calculateRelevanceScore(method, context)
        }));
        
        return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, 5); // Return top 5 matches
    }

    searchSimilarLocators(context) {
        const results = [];
        const searchTerms = this.generateSearchTerms(context);
        
        for (const term of searchTerms) {
            if (this.locatorCache.has(term)) {
                results.push(...this.locatorCache.get(term));
            }
        }
        
        return results.slice(0, 10); // Return top 10 locators
    }

    generateSearchTerms(context) {
        const terms = [];
        
        // Extract terms from different context sources
        if (context.methodName) {
            terms.push(...this.generateKeywords(context.methodName));
        }
        
        if (context.stepText) {
            terms.push(...this.generateKeywords(context.stepText));
        }
        
        if (context.pageTitle) {
            terms.push(...this.generateKeywords(context.pageTitle));
        }
        
        if (context.featureTitle) {
            terms.push(...this.generateKeywords(context.featureTitle));
        }
        
        return [...new Set(terms)];
    }

    calculateRelevanceScore(method, context) {
        let score = 0;
        
        // Score based on method name similarity
        if (context.methodName) {
            const similarity = this.stringSimilarity(method.name.toLowerCase(), context.methodName.toLowerCase());
            score += similarity * 3;
        }
        
        // Score based on step text similarity
        if (context.stepText) {
            const similarity = this.stringSimilarity(method.name.toLowerCase(), context.stepText.toLowerCase());
            score += similarity * 2;
        }
        
        // Bonus for common patterns
        if (method.body.includes('await this.clickElement')) score += 1;
        if (method.body.includes('await this.isVisible')) score += 1;
        if (method.body.includes('await this.fill')) score += 1;
        if (method.body.includes('await this.waitFor')) score += 1;
        
        return score;
    }

    stringSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
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

    generateRealisticMethod(context) {
        const similarMethods = this.searchSimilarMethods(context);
        const similarLocators = this.searchSimilarLocators(context);
        
        if (similarMethods.length === 0) {
            return this.generateGenericMethod(context);
        }
        
        const bestMatch = similarMethods[0];
        return this.adaptMethodToContext(bestMatch, context, similarLocators);
    }

    adaptMethodToContext(method, context, availableLocators) {
        let adaptedBody = method.body;
        
        // Replace generic locators with context-appropriate ones
        const locatorReplacements = this.findLocatorReplacements(method.locators, availableLocators, context);
        
        for (const [original, replacement] of Object.entries(locatorReplacements)) {
            adaptedBody = adaptedBody.replace(new RegExp(original, 'g'), replacement);
        }
        
        // Add context-specific comments
        const comment = `// TODO: Implement ${context.methodName || 'method'} - adapted from ${method.file}`;
        
        return {
            body: `${comment}\n    ${adaptedBody.replace(/\n/g, '\n    ')}`,
            locators: Object.values(locatorReplacements),
            sourceMethod: method.name,
            sourceFile: method.file
        };
    }

    findLocatorReplacements(originalLocators, availableLocators, context) {
        const replacements = {};
        
        for (const originalLocator of originalLocators) {
            // Try to find a similar locator from available ones
            const similar = availableLocators.find(loc => 
                this.stringSimilarity(loc.name.toLowerCase(), originalLocator.toLowerCase()) > 0.6
            );
            
            if (similar) {
                replacements[originalLocator] = similar.name;
            } else {
                // Generate a context-appropriate locator name
                replacements[originalLocator] = this.generateContextualLocatorName(originalLocator, context);
            }
        }
        
        return replacements;
    }

    generateContextualLocatorName(originalLocator, context) {
        const baseWords = context.methodName ? context.methodName.replace(/([A-Z])/g, ' $1').trim().split(' ') : ['ELEMENT'];
        const locatorName = baseWords.map(word => word.toUpperCase()).join('_');
        return locatorName + '_BUTTON'; // Default to button type
    }

    generateGenericMethod(context) {
        const methodName = context.methodName || 'performAction';
        const action = this.inferActionFromMethodName(methodName);
        
        return {
            body: `// TODO: Implement ${methodName}\n    await this.waitForPageLoad();\n    ${action}`,
            locators: [],
            sourceMethod: 'generated',
            sourceFile: 'auto-generated'
        };
    }

    inferActionFromMethodName(methodName) {
        const name = methodName.toLowerCase();
        
        if (name.includes('click')) {
            return 'await this.clickElement(ELEMENT_LOCATOR);';
        } else if (name.includes('verify') || name.includes('check')) {
            return 'return await this.isVisible(ELEMENT_LOCATOR);';
        } else if (name.includes('fill') || name.includes('enter') || name.includes('type')) {
            return 'await this.fill(INPUT_LOCATOR, value);';
        } else if (name.includes('wait')) {
            return 'await this.waitForSelector(ELEMENT_LOCATOR);';
        } else if (name.includes('navigate') || name.includes('goto')) {
            return 'await this.page.goto(url);';
        }
        
        return 'await this.performGenericAction();';
    }
}

module.exports = PageMethodReplicator;
