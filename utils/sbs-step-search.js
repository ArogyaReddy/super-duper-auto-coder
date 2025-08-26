#!/usr/bin/env node

/**
 * SBS_Automation Step and Method Search Utility
 * Searches main SBS_Automation framework for reusable steps and methods
 * to ensure auto-coder artifacts reuse existing patterns instead of duplicating code
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SBSStepSearch {
    constructor() {
        this.sbsPath = '/Users/gadea/auto/auto/qa_automation/SBS_Automation';
        this.searchResults = {
            steps: [],
            methods: [],
            patterns: []
        };
    }

    /**
     * Search for existing step definitions that match a pattern
     * @param {string} searchTerm - Pattern to search for
     * @param {string} category - Category: 'navigation', 'verification', 'interaction', 'login'
     * @returns {Array} Matching step definitions
     */
    async searchSteps(searchTerm, category = 'all') {
        console.log(`🔍 Searching SBS_Automation steps for: "${searchTerm}" (category: ${category})`);
        
        const stepFiles = this.getStepFiles();
        const results = [];

        for (const file of stepFiles) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const matches = this.extractStepDefinitions(content, searchTerm, category);
                
                if (matches.length > 0) {
                    results.push({
                        file: file.replace(this.sbsPath, ''),
                        matches: matches
                    });
                }
            } catch (error) {
                console.log(`⚠️  Error reading ${file}: ${error.message}`);
            }
        }

        this.searchResults.steps = results;
        return results;
    }

    /**
     * Search for page object methods that match navigation patterns
     * @param {string} searchTerm - Method pattern to search for
     * @param {string} category - Category: 'click', 'hover', 'navigate', 'verify'
     * @returns {Array} Matching page methods
     */
    async searchPageMethods(searchTerm, category = 'all') {
        console.log(`🔍 Searching SBS_Automation page methods for: "${searchTerm}" (category: ${category})`);
        
        const pageFiles = this.getPageFiles();
        const results = [];

        for (const file of pageFiles) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const matches = this.extractPageMethods(content, searchTerm, category);
                
                if (matches.length > 0) {
                    results.push({
                        file: file.replace(this.sbsPath, ''),
                        className: this.extractClassName(content),
                        matches: matches
                    });
                }
            } catch (error) {
                console.log(`⚠️  Error reading ${file}: ${error.message}`);
            }
        }

        this.searchResults.methods = results;
        return results;
    }

    /**
     * Find navigation patterns specifically for menu interactions
     * @param {string} menuType - Type: 'left-nav', 'hover-menu', 'kebab-menu', 'dropdown'
     * @returns {Object} Navigation patterns and examples
     */
    async findNavigationPatterns(menuType = 'all') {
        console.log(`🧭 Finding navigation patterns for: ${menuType}`);
        
        const patterns = {
            leftNavigation: [],
            hoverMenus: [],
            kebabMenus: [],
            dropdowns: [],
            menuClicks: []
        };

        // Search for specific navigation patterns
        const navFiles = [
            ...this.getStepFiles().filter(f => f.includes('navigation') || f.includes('menu')),
            ...this.getPageFiles().filter(f => f.includes('navigation') || f.includes('menu'))
        ];

        for (const file of navFiles) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                
                // Extract different navigation patterns
                if (content.includes('clickLeftMenuItem') || content.includes('isACLeftMenuDisplayed')) {
                    patterns.leftNavigation.push({
                        file: file.replace(this.sbsPath, ''),
                        methods: this.extractMethodSignatures(content, ['clickLeftMenuItem', 'isACLeftMenuDisplayed', 'clickLeftMenu'])
                    });
                }

                if (content.includes('hoverAndClickElement') || content.includes('hoverOverMenuAndSelectSubMenu')) {
                    patterns.hoverMenus.push({
                        file: file.replace(this.sbsPath, ''),
                        methods: this.extractMethodSignatures(content, ['hoverAndClickElement', 'hoverOverMenuAndSelectSubMenu', 'moveMouseTo'])
                    });
                }

                if (content.includes('kebab') || content.includes('clickKebab')) {
                    patterns.kebabMenus.push({
                        file: file.replace(this.sbsPath, ''),
                        methods: this.extractMethodSignatures(content, ['clickKebab', 'isKebabMenuDisplayed', 'clickKebabMenuItem'])
                    });
                }

                if (content.includes('selectDropdown') || content.includes('clickDropdown')) {
                    patterns.dropdowns.push({
                        file: file.replace(this.sbsPath, ''),
                        methods: this.extractMethodSignatures(content, ['selectDropdown', 'clickDropdown', 'selectDropdownByText'])
                    });
                }

            } catch (error) {
                console.log(`⚠️  Error reading ${file}: ${error.message}`);
            }
        }

        this.searchResults.patterns = patterns;
        return patterns;
    }

    /**
     * Generate reusable step definitions based on found patterns
     * @param {string} featureName - Target feature name
     * @param {Array} foundSteps - Steps found in search
     * @returns {Array} Reusable step suggestions
     */
    generateReusableSteps(featureName, foundSteps) {
        console.log(`📝 Generating reusable steps for: ${featureName}`);
        
        const suggestions = [];

        foundSteps.forEach(stepGroup => {
            stepGroup.matches.forEach(step => {
                // Convert found step to reusable pattern
                const reusableStep = this.convertToReusablePattern(step, featureName);
                if (reusableStep) {
                    suggestions.push({
                        originalFile: stepGroup.file,
                        originalStep: step,
                        reusableStep: reusableStep,
                        category: this.categorizeStep(step)
                    });
                }
            });
        });

        return suggestions;
    }

    /**
     * Get all step definition files
     */
    getStepFiles() {
        const stepsDir = path.join(this.sbsPath, 'steps');
        return this.findFilesRecursive(stepsDir, /.*-steps\.js$/);
    }

    /**
     * Get all page object files
     */
    getPageFiles() {
        const pagesDir = path.join(this.sbsPath, 'pages');
        return this.findFilesRecursive(pagesDir, /.*-page\.js$/);
    }

    /**
     * Find files recursively matching pattern
     */
    findFilesRecursive(dir, pattern) {
        let results = [];
        
        if (!fs.existsSync(dir)) {
            return results;
        }

        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                results = results.concat(this.findFilesRecursive(fullPath, pattern));
            } else if (pattern.test(file)) {
                results.push(fullPath);
            }
        }
        
        return results;
    }

    /**
     * Extract step definitions from file content
     */
    extractStepDefinitions(content, searchTerm, category) {
        const stepPattern = /(Given|When|Then|And)\s*\(\s*['"`]([^'"`]+)['"`]/g;
        const matches = [];
        let match;

        while ((match = stepPattern.exec(content)) !== null) {
            const stepText = match[2];
            
            if (this.matchesSearchCriteria(stepText, searchTerm, category)) {
                matches.push({
                    type: match[1],
                    text: stepText,
                    full: match[0]
                });
            }
        }

        return matches;
    }

    /**
     * Extract page methods from file content
     */
    extractPageMethods(content, searchTerm, category) {
        const methodPattern = /async\s+(\w+)\s*\([^)]*\)\s*{/g;
        const matches = [];
        let match;

        while ((match = methodPattern.exec(content)) !== null) {
            const methodName = match[1];
            
            if (this.matchesSearchCriteria(methodName, searchTerm, category)) {
                matches.push({
                    name: methodName,
                    signature: match[0]
                });
            }
        }

        return matches;
    }

    /**
     * Extract class name from file content
     */
    extractClassName(content) {
        const classPattern = /class\s+(\w+)/;
        const match = content.match(classPattern);
        return match ? match[1] : 'Unknown';
    }

    /**
     * Extract method signatures for specific method names
     */
    extractMethodSignatures(content, methodNames) {
        const signatures = [];
        
        methodNames.forEach(methodName => {
            const pattern = new RegExp(`async\\s+${methodName}\\s*\\([^)]*\\)\\s*{`, 'g');
            let match;
            
            while ((match = pattern.exec(content)) !== null) {
                signatures.push({
                    name: methodName,
                    signature: match[0]
                });
            }
        });

        return signatures;
    }

    /**
     * Check if content matches search criteria
     */
    matchesSearchCriteria(text, searchTerm, category) {
        const lowerText = text.toLowerCase();
        const lowerTerm = searchTerm.toLowerCase();
        
        // Basic text match
        const hasTextMatch = lowerText.includes(lowerTerm) || 
                           this.fuzzyMatch(lowerText, lowerTerm);
        
        if (!hasTextMatch) return false;
        
        // Category-specific matching
        switch (category) {
            case 'navigation':
                return /\b(click|select|navigate|menu|hover)\b/i.test(text);
            case 'verification':
                return /\b(verify|assert|check|displayed|visible)\b/i.test(text);
            case 'interaction':
                return /\b(click|fill|enter|select|choose)\b/i.test(text);
            case 'login':
                return /\b(login|log in|sign in|authenticate)\b/i.test(text);
            default:
                return true;
        }
    }

    /**
     * Simple fuzzy matching
     */
    fuzzyMatch(text, term) {
        // Remove common words and check for partial matches
        const cleanText = text.replace(/\b(the|and|or|in|on|at|to|for|with|by)\b/g, '');
        const cleanTerm = term.replace(/\b(the|and|or|in|on|at|to|for|with|by)\b/g, '');
        
        return cleanText.includes(cleanTerm) || 
               cleanTerm.split(' ').some(word => cleanText.includes(word));
    }

    /**
     * Convert found step to reusable pattern
     */
    convertToReusablePattern(step, featureName) {
        let reusableText = step.text;
        
        // Replace specific terms with parameters
        reusableText = reusableText.replace(/\b\w+\s+(page|menu|button|link)\b/gi, '{string} $1');
        reusableText = reusableText.replace(/\b(clicks?|selects?)\s+[\w\s]+\b/gi, '$1 {string}');
        reusableText = reusableText.replace(/\b(verifies?)\s+[\w\s]+\s+(is|are)\s+(displayed|visible)\b/gi, '$1 {string} $2 $3');
        
        return {
            type: step.type,
            text: reusableText,
            original: step.text
        };
    }

    /**
     * Categorize step by its content
     */
    categorizeStep(step) {
        const text = step.text.toLowerCase();
        
        if (/\b(click|select|navigate|hover)\b/.test(text)) return 'navigation';
        if (/\b(verify|assert|check|displayed|visible)\b/.test(text)) return 'verification';
        if (/\b(fill|enter|type|input)\b/.test(text)) return 'input';
        if (/\b(login|log in|sign in)\b/.test(text)) return 'authentication';
        
        return 'general';
    }

    /**
     * Display search results in formatted output
     */
    displayResults() {
        console.log('\n' + '='.repeat(80));
        console.log('🔍 SBS_AUTOMATION SEARCH RESULTS');
        console.log('='.repeat(80));

        if (this.searchResults.steps.length > 0) {
            console.log('\n📝 FOUND STEP DEFINITIONS:');
            this.searchResults.steps.forEach(result => {
                console.log(`\n📄 ${result.file}`);
                result.matches.forEach(match => {
                    console.log(`  ${match.type}('${match.text}')`);
                });
            });
        }

        if (this.searchResults.methods.length > 0) {
            console.log('\n🔧 FOUND PAGE METHODS:');
            this.searchResults.methods.forEach(result => {
                console.log(`\n📄 ${result.file} (${result.className})`);
                result.matches.forEach(match => {
                    console.log(`  ${match.name}()`);
                });
            });
        }

        if (this.searchResults.patterns && Object.keys(this.searchResults.patterns).length > 0) {
            console.log('\n🧭 FOUND NAVIGATION PATTERNS:');
            Object.entries(this.searchResults.patterns).forEach(([category, patterns]) => {
                if (patterns.length > 0) {
                    console.log(`\n📂 ${category.toUpperCase()}:`);
                    patterns.forEach(pattern => {
                        console.log(`  📄 ${pattern.file}`);
                        pattern.methods.forEach(method => {
                            console.log(`    ${method.name}()`);
                        });
                    });
                }
            });
        }

        console.log('\n' + '='.repeat(80));
    }

    /**
     * Save results to JSON file for later use
     */
    saveResults(filename = 'sbs-search-results.json') {
        const outputFile = path.join(__dirname, filename);
        
        try {
            fs.writeFileSync(outputFile, JSON.stringify(this.searchResults, null, 2));
            console.log(`💾 Results saved to: ${outputFile}`);
        } catch (error) {
            console.log(`❌ Error saving results: ${error.message}`);
        }
    }
}

// CLI Usage
if (require.main === module) {
    const search = new SBSStepSearch();
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(`
Usage: node sbs-step-search.js <command> [searchTerm] [category]

Commands:
  steps <searchTerm> [category]     - Search for step definitions
  methods <searchTerm> [category]   - Search for page object methods  
  patterns [menuType]               - Find navigation patterns
  all <searchTerm>                  - Search steps, methods, and patterns

Categories:
  navigation, verification, interaction, login, all

Examples:
  node sbs-step-search.js steps "menu" navigation
  node sbs-step-search.js methods "click" 
  node sbs-step-search.js patterns left-nav
  node sbs-step-search.js all "billing"
        `);
        process.exit(1);
    }

    const command = args[0];
    const searchTerm = args[1] || '';
    const category = args[2] || 'all';

    async function runSearch() {
        try {
            switch (command) {
                case 'steps':
                    await search.searchSteps(searchTerm, category);
                    break;
                case 'methods':
                    await search.searchPageMethods(searchTerm, category);
                    break;
                case 'patterns':
                    await search.findNavigationPatterns(searchTerm);
                    break;
                case 'all':
                    await search.searchSteps(searchTerm, category);
                    await search.searchPageMethods(searchTerm, category);
                    await search.findNavigationPatterns();
                    break;
                default:
                    console.log(`❌ Unknown command: ${command}`);
                    process.exit(1);
            }

            search.displayResults();
            search.saveResults();
            
        } catch (error) {
            console.log(`❌ Search error: ${error.message}`);
            process.exit(1);
        }
    }

    runSearch();
}

module.exports = SBSStepSearch;
