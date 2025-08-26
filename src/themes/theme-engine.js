/**
 * Theme Engine - Phase 3.2.2
 * Visual and structural theme support for framework-specific styling
 * Based on SBS_Automation theming patterns and enterprise requirements
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

class ThemeEngine {
    constructor(options = {}) {
        this.themeDirectories = options.themeDirectories || [
            path.join(__dirname, '../../themes'),
            path.join(process.cwd(), 'themes'),
            path.join(process.cwd(), '.auto-coder/themes')
        ];
        
        this.themes = new Map();
        this.activeTheme = options.defaultTheme || 'standard';
        this.themeStack = []; // For theme inheritance
        
        // Theme types
        this.themeTypes = {
            VISUAL: 'visual',       // Code formatting, styling preferences
            STRUCTURAL: 'structural', // Organization patterns, file structure
            FRAMEWORK: 'framework'   // Framework-specific patterns
        };
        
        // Built-in themes
        this.builtInThemes = {
            minimal: this.createMinimalTheme(),
            standard: this.createStandardTheme(),
            detailed: this.createDetailedTheme(),
            enterprise: this.createEnterpriseTheme()
        };
        
        // Framework-specific themes
        this.frameworkThemes = {
            playwright: this.createPlaywrightTheme(),
            jest: this.createJestTheme(),
            cypress: this.createCypressTheme(),
            cucumber: this.createCucumberTheme()
        };
        
        // Code style themes (following popular style guides)
        this.codeStyleThemes = {
            google: this.createGoogleStyleTheme(),
            airbnb: this.createAirbnbStyleTheme(),
            standard: this.createStandardStyleTheme(),
            prettier: this.createPrettierStyleTheme()
        };
        
        console.log('🎨 Theme Engine initialized');
    }

    /**
     * Initialize theme engine
     */
    async initialize() {
        console.log('🔍 Loading themes...');
        
        // Ensure theme directories exist
        await this.ensureThemeDirectories();
        
        // Load built-in themes
        this.loadBuiltInThemes();
        
        // Load custom themes from directories
        await this.loadCustomThemes();
        
        // Set active theme
        await this.setActiveTheme(this.activeTheme);
        
        console.log(`✅ Loaded ${this.themes.size} themes, active: ${this.activeTheme}`);
        this.logThemeSummary();
        
        return this;
    }

    /**
     * Ensure theme directories exist
     */
    async ensureThemeDirectories() {
        for (const dir of this.themeDirectories) {
            await fs.ensureDir(dir);
            console.log(`📁 Theme directory: ${dir}`);
        }
    }

    /**
     * Load built-in themes
     */
    loadBuiltInThemes() {
        // Load base themes
        for (const [id, theme] of Object.entries(this.builtInThemes)) {
            this.themes.set(id, { ...theme, builtIn: true });
        }
        
        // Load framework themes
        for (const [id, theme] of Object.entries(this.frameworkThemes)) {
            this.themes.set(`${id}-theme`, { ...theme, builtIn: true });
        }
        
        // Load code style themes
        for (const [id, theme] of Object.entries(this.codeStyleThemes)) {
            this.themes.set(`${id}-style`, { ...theme, builtIn: true });
        }
    }

    /**
     * Load custom themes from directories
     */
    async loadCustomThemes() {
        for (const directory of this.themeDirectories) {
            if (await fs.pathExists(directory)) {
                await this.loadThemesFromDirectory(directory);
            }
        }
    }

    /**
     * Load themes from directory
     */
    async loadThemesFromDirectory(directory) {
        console.log(`📂 Loading themes from: ${directory}`);
        
        const themeFiles = await this.findThemeFiles(directory);
        
        for (const themeFile of themeFiles) {
            try {
                await this.loadTheme(themeFile);
            } catch (error) {
                console.warn(`⚠️  Failed to load theme: ${themeFile}`, error.message);
            }
        }
    }

    /**
     * Find theme files in directory
     */
    async findThemeFiles(directory) {
        const glob = require('glob');
        
        return new Promise((resolve, reject) => {
            glob('**/*.theme.{json,yaml,yml}', { 
                cwd: directory, 
                absolute: true 
            }, (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }
            });
        });
    }

    /**
     * Load individual theme file
     */
    async loadTheme(themeFile) {
        console.log(`🎨 Loading theme: ${themeFile}`);
        
        const content = await fs.readFile(themeFile, 'utf8');
        let themeData;
        
        if (themeFile.endsWith('.json')) {
            themeData = JSON.parse(content);
        } else {
            themeData = yaml.load(content);
        }
        
        // Validate theme
        this.validateTheme(themeData);
        
        // Process theme inheritance
        const processedTheme = await this.processThemeInheritance(themeData);
        
        // Store theme
        this.themes.set(themeData.id, {
            ...processedTheme,
            filePath: themeFile,
            loadedAt: new Date().toISOString()
        });
        
        return processedTheme;
    }

    /**
     * Validate theme structure
     */
    validateTheme(theme) {
        const required = ['id', 'name', 'type'];
        
        for (const field of required) {
            if (!theme[field]) {
                throw new Error(`Theme missing required field: ${field}`);
            }
        }
        
        if (!Object.values(this.themeTypes).includes(theme.type)) {
            throw new Error(`Invalid theme type: ${theme.type}`);
        }
    }

    /**
     * Process theme inheritance
     */
    async processThemeInheritance(theme) {
        if (!theme.extends) {
            return theme;
        }
        
        const baseTheme = this.themes.get(theme.extends);
        if (!baseTheme) {
            throw new Error(`Base theme not found: ${theme.extends}`);
        }
        
        // Deep merge with base theme
        return this.mergeThemes(baseTheme, theme);
    }

    /**
     * Merge themes (child overrides parent)
     */
    mergeThemes(baseTheme, childTheme) {
        const merged = JSON.parse(JSON.stringify(baseTheme));
        
        // Merge properties
        Object.keys(childTheme).forEach(key => {
            if (key === 'extends') return; // Skip extends property
            
            if (typeof childTheme[key] === 'object' && childTheme[key] !== null && !Array.isArray(childTheme[key])) {
                merged[key] = { ...merged[key], ...childTheme[key] };
            } else {
                merged[key] = childTheme[key];
            }
        });
        
        return merged;
    }

    /**
     * Set active theme
     */
    async setActiveTheme(themeId) {
        const theme = this.themes.get(themeId);
        if (!theme) {
            throw new Error(`Theme not found: ${themeId}`);
        }
        
        this.activeTheme = themeId;
        
        // Build theme stack for inheritance
        this.themeStack = this.buildThemeStack(theme);
        
        console.log(`🎯 Active theme set to: ${themeId}`);
        return theme;
    }

    /**
     * Build theme inheritance stack
     */
    buildThemeStack(theme) {
        const stack = [theme];
        let current = theme;
        
        while (current.extends) {
            const parent = this.themes.get(current.extends);
            if (!parent) break;
            
            stack.unshift(parent);
            current = parent;
        }
        
        return stack;
    }

    /**
     * Apply theme to template context
     */
    applyTheme(templateContext, options = {}) {
        const theme = options.theme ? this.themes.get(options.theme) : this.themes.get(this.activeTheme);
        if (!theme) {
            return templateContext;
        }
        
        console.log(`🎨 Applying theme: ${theme.id}`);
        
        // Create themed context
        const themedContext = {
            ...templateContext,
            theme: theme,
            styles: this.getThemeStyles(theme, options),
            patterns: this.getThemePatterns(theme, options),
            conventions: this.getThemeConventions(theme, options),
            formatting: this.getThemeFormatting(theme, options)
        };
        
        // Apply theme-specific transformations
        this.applyThemeTransformations(themedContext, theme);
        
        return themedContext;
    }

    /**
     * Get theme styles
     */
    getThemeStyles(theme, options) {
        const styles = { ...theme.styles };
        
        // Apply framework-specific styling
        if (options.framework && theme.frameworks && theme.frameworks[options.framework]) {
            Object.assign(styles, theme.frameworks[options.framework].styles);
        }
        
        return styles;
    }

    /**
     * Get theme patterns
     */
    getThemePatterns(theme, options) {
        const patterns = { ...theme.patterns };
        
        // Apply framework-specific patterns
        if (options.framework && theme.frameworks && theme.frameworks[options.framework]) {
            Object.assign(patterns, theme.frameworks[options.framework].patterns);
        }
        
        return patterns;
    }

    /**
     * Get theme conventions
     */
    getThemeConventions(theme, options) {
        const conventions = { ...theme.conventions };
        
        // Apply framework-specific conventions
        if (options.framework && theme.frameworks && theme.frameworks[options.framework]) {
            Object.assign(conventions, theme.frameworks[options.framework].conventions);
        }
        
        return conventions;
    }

    /**
     * Get theme formatting
     */
    getThemeFormatting(theme, options) {
        return {
            ...theme.formatting,
            indentation: theme.formatting?.indentation || 2,
            lineLength: theme.formatting?.lineLength || 100,
            quotes: theme.formatting?.quotes || 'single',
            semicolons: theme.formatting?.semicolons || true,
            trailingCommas: theme.formatting?.trailingCommas || 'es5'
        };
    }

    /**
     * Apply theme transformations to context
     */
    applyThemeTransformations(context, theme) {
        // Apply naming conventions
        if (theme.conventions && theme.conventions.naming) {
            this.applyNamingConventions(context, theme.conventions.naming);
        }
        
        // Apply code style
        if (theme.styles && theme.styles.code) {
            this.applyCodeStyle(context, theme.styles.code);
        }
        
        // Apply structural patterns
        if (theme.patterns && theme.patterns.structure) {
            this.applyStructuralPatterns(context, theme.patterns.structure);
        }
    }

    /**
     * Apply naming conventions
     */
    applyNamingConventions(context, naming) {
        const conventions = {
            variables: naming.variables || 'camelCase',
            functions: naming.functions || 'camelCase',
            classes: naming.classes || 'PascalCase',
            files: naming.files || 'kebab-case',
            constants: naming.constants || 'UPPER_CASE'
        };
        
        context.naming = conventions;
        
        // Apply conventions to existing context data
        if (context.featureName) {
            context.featureFileName = this.applyCase(context.featureName, conventions.files);
            context.featureClassName = this.applyCase(context.featureName, conventions.classes);
        }
    }

    /**
     * Apply code style preferences
     */
    applyCodeStyle(context, codeStyle) {
        context.codeStyle = {
            indentation: codeStyle.indentation || '  ',
            braceStyle: codeStyle.braceStyle || '1tbs',
            spacingRules: codeStyle.spacingRules || {},
            commentStyle: codeStyle.commentStyle || 'line'
        };
    }

    /**
     * Apply structural patterns
     */
    applyStructuralPatterns(context, structure) {
        context.structure = {
            fileOrganization: structure.fileOrganization || 'domain-based',
            importStyle: structure.importStyle || 'grouped',
            exportStyle: structure.exportStyle || 'named',
            testStructure: structure.testStructure || 'describe-it'
        };
    }

    /**
     * Apply case transformation
     */
    applyCase(str, caseType) {
        switch (caseType) {
            case 'camelCase':
                return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
                    return index === 0 ? word.toLowerCase() : word.toUpperCase();
                }).replace(/\s+/g, '');
            
            case 'PascalCase':
                return str.replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase()).replace(/\s+/g, '');
            
            case 'kebab-case':
                return str.replace(/\s+/g, '-').toLowerCase();
            
            case 'snake_case':
                return str.replace(/\s+/g, '_').toLowerCase();
            
            case 'UPPER_CASE':
                return str.replace(/\s+/g, '_').toUpperCase();
            
            default:
                return str;
        }
    }

    /**
     * Create minimal theme
     */
    createMinimalTheme() {
        return {
            id: 'minimal',
            name: 'Minimal',
            type: this.themeTypes.VISUAL,
            description: 'Clean, minimal code generation with essential elements only',
            styles: {
                comments: false,
                verboseLogging: false,
                exampleData: false,
                documentation: 'minimal'
            },
            patterns: {
                testStructure: 'flat',
                assertions: 'simple',
                setup: 'inline'
            },
            conventions: {
                naming: {
                    variables: 'camelCase',
                    functions: 'camelCase',
                    files: 'kebab-case'
                }
            },
            formatting: {
                indentation: 2,
                lineLength: 80,
                quotes: 'single',
                semicolons: false
            }
        };
    }

    /**
     * Create standard theme
     */
    createStandardTheme() {
        return {
            id: 'standard',
            name: 'Standard',
            type: this.themeTypes.VISUAL,
            description: 'Balanced code generation with good practices',
            styles: {
                comments: true,
                verboseLogging: false,
                exampleData: true,
                documentation: 'standard'
            },
            patterns: {
                testStructure: 'nested',
                assertions: 'descriptive',
                setup: 'beforeEach'
            },
            conventions: {
                naming: {
                    variables: 'camelCase',
                    functions: 'camelCase',
                    classes: 'PascalCase',
                    files: 'kebab-case',
                    constants: 'UPPER_CASE'
                }
            },
            formatting: {
                indentation: 2,
                lineLength: 100,
                quotes: 'single',
                semicolons: true
            }
        };
    }

    /**
     * Create detailed theme
     */
    createDetailedTheme() {
        return {
            id: 'detailed',
            name: 'Detailed',
            type: this.themeTypes.VISUAL,
            description: 'Comprehensive code generation with extensive documentation',
            styles: {
                comments: true,
                verboseLogging: true,
                exampleData: true,
                documentation: 'comprehensive',
                typeAnnotations: true
            },
            patterns: {
                testStructure: 'nested',
                assertions: 'verbose',
                setup: 'beforeAll',
                errorHandling: 'comprehensive'
            },
            conventions: {
                naming: {
                    variables: 'camelCase',
                    functions: 'camelCase',
                    classes: 'PascalCase',
                    files: 'kebab-case',
                    constants: 'UPPER_CASE'
                }
            },
            formatting: {
                indentation: 4,
                lineLength: 120,
                quotes: 'double',
                semicolons: true,
                trailingCommas: 'all'
            }
        };
    }

    /**
     * Create enterprise theme
     */
    createEnterpriseTheme() {
        return {
            id: 'enterprise',
            name: 'Enterprise',
            type: this.themeTypes.STRUCTURAL,
            description: 'Enterprise-grade patterns following SBS_Automation standards',
            extends: 'detailed',
            styles: {
                comments: true,
                verboseLogging: true,
                exampleData: true,
                documentation: 'comprehensive',
                typeAnnotations: true,
                strictMode: true
            },
            patterns: {
                testStructure: 'enterprise',
                assertions: 'business-focused',
                setup: 'factory',
                errorHandling: 'enterprise',
                logging: 'structured',
                reporting: 'detailed'
            },
            conventions: {
                naming: {
                    variables: 'camelCase',
                    functions: 'camelCase',
                    classes: 'PascalCase',
                    files: 'PascalCase',
                    constants: 'UPPER_CASE',
                    businessEntities: 'PascalCase'
                },
                structure: {
                    fileOrganization: 'domain-driven',
                    layering: 'strict',
                    separation: 'concerns'
                }
            },
            frameworks: {
                playwright: { patterns: { pageObjects: 'enterprise' } },
                jest: { patterns: { testSuites: 'enterprise' } }
            }
        };
    }

    /**
     * Create Playwright-specific theme
     */
    createPlaywrightTheme() {
        return {
            id: 'playwright',
            name: 'Playwright Framework',
            type: this.themeTypes.FRAMEWORK,
            description: 'Playwright-specific patterns and best practices',
            styles: {
                async: true,
                pageObjects: true,
                fixtures: true
            },
            patterns: {
                selectors: 'role-based',
                waiting: 'auto-wait',
                assertions: 'expect',
                parallelization: 'worker'
            },
            conventions: {
                naming: {
                    tests: 'spec.ts',
                    pages: 'page.ts',
                    fixtures: 'fixtures.ts'
                }
            },
            frameworks: {
                playwright: {
                    config: {
                        testDir: './tests',
                        timeout: 30000,
                        expect: { timeout: 5000 },
                        fullyParallel: true,
                        retries: 2
                    }
                }
            }
        };
    }

    /**
     * Create Jest-specific theme
     */
    createJestTheme() {
        return {
            id: 'jest',
            name: 'Jest Framework',
            type: this.themeTypes.FRAMEWORK,
            description: 'Jest-specific patterns and best practices',
            styles: {
                mocking: true,
                snapshots: true,
                coverage: true
            },
            patterns: {
                testStructure: 'describe-it',
                mocking: 'jest-mock',
                assertions: 'jest-expect',
                setup: 'beforeEach'
            },
            conventions: {
                naming: {
                    tests: 'test.js',
                    mocks: '__mocks__',
                    snapshots: '__snapshots__'
                }
            },
            frameworks: {
                jest: {
                    config: {
                        testEnvironment: 'node',
                        coverageThreshold: {
                            global: {
                                branches: 80,
                                functions: 80,
                                lines: 80,
                                statements: 80
                            }
                        }
                    }
                }
            }
        };
    }

    /**
     * Create Cypress-specific theme
     */
    createCypressTheme() {
        return {
            id: 'cypress',
            name: 'Cypress Framework',
            type: this.themeTypes.FRAMEWORK,
            description: 'Cypress-specific patterns and best practices',
            styles: {
                chainable: true,
                commands: true,
                fixtures: true
            },
            patterns: {
                selectors: 'data-attributes',
                waiting: 'implicit',
                assertions: 'should',
                commands: 'custom'
            }
        };
    }

    /**
     * Create Cucumber-specific theme
     */
    createCucumberTheme() {
        return {
            id: 'cucumber',
            name: 'Cucumber Framework',
            type: this.themeTypes.FRAMEWORK,
            description: 'Cucumber BDD patterns following SBS_Automation standards',
            styles: {
                gherkin: true,
                stepDefinitions: true,
                world: true
            },
            patterns: {
                features: 'domain-organized',
                steps: 'reusable',
                data: 'table-driven',
                hooks: 'lifecycle'
            },
            conventions: {
                naming: {
                    features: 'kebab-case.feature',
                    steps: 'camelCase-steps.js',
                    pages: 'PascalCase-page.js'
                }
            }
        };
    }

    /**
     * Create Google style theme
     */
    createGoogleStyleTheme() {
        return {
            id: 'google-style',
            name: 'Google JavaScript Style',
            type: this.themeTypes.VISUAL,
            description: 'Google JavaScript Style Guide compliance',
            formatting: {
                indentation: 2,
                lineLength: 80,
                quotes: 'single',
                semicolons: true,
                trailingCommas: 'es5'
            },
            conventions: {
                naming: {
                    variables: 'camelCase',
                    functions: 'camelCase',
                    classes: 'PascalCase',
                    constants: 'UPPER_CASE',
                    files: 'kebab-case'
                }
            }
        };
    }

    /**
     * Create Airbnb style theme
     */
    createAirbnbStyleTheme() {
        return {
            id: 'airbnb-style',
            name: 'Airbnb JavaScript Style',
            type: this.themeTypes.VISUAL,
            description: 'Airbnb JavaScript Style Guide compliance',
            formatting: {
                indentation: 2,
                lineLength: 100,
                quotes: 'single',
                semicolons: true,
                trailingCommas: 'all'
            },
            conventions: {
                naming: {
                    variables: 'camelCase',
                    functions: 'camelCase',
                    classes: 'PascalCase',
                    constants: 'UPPER_CASE',
                    files: 'kebab-case'
                }
            }
        };
    }

    /**
     * Create Standard style theme
     */
    createStandardStyleTheme() {
        return {
            id: 'standard-style',
            name: 'JavaScript Standard Style',
            type: this.themeTypes.VISUAL,
            description: 'JavaScript Standard Style compliance',
            formatting: {
                indentation: 2,
                lineLength: 100,
                quotes: 'single',
                semicolons: false,
                trailingCommas: 'never'
            }
        };
    }

    /**
     * Create Prettier style theme
     */
    createPrettierStyleTheme() {
        return {
            id: 'prettier-style',
            name: 'Prettier Default Style',
            type: this.themeTypes.VISUAL,
            description: 'Prettier default formatting rules',
            formatting: {
                indentation: 2,
                lineLength: 80,
                quotes: 'double',
                semicolons: true,
                trailingCommas: 'es5'
            }
        };
    }

    /**
     * Get available themes
     */
    getAvailableThemes() {
        return Array.from(this.themes.values());
    }

    /**
     * Get theme by ID
     */
    getTheme(themeId) {
        return this.themes.get(themeId);
    }

    /**
     * Get active theme
     */
    getActiveTheme() {
        return this.themes.get(this.activeTheme);
    }

    /**
     * Log theme summary
     */
    logThemeSummary() {
        const summary = {
            total: this.themes.size,
            byType: {},
            builtIn: 0,
            custom: 0
        };
        
        for (const theme of this.themes.values()) {
            summary.byType[theme.type] = (summary.byType[theme.type] || 0) + 1;
            
            if (theme.builtIn) {
                summary.builtIn++;
            } else {
                summary.custom++;
            }
        }
        
        console.log('🎨 Theme Summary:');
        console.log(`   Total: ${summary.total}`);
        console.log(`   Built-in: ${summary.builtIn}`);
        console.log(`   Custom: ${summary.custom}`);
        console.log(`   By Type: ${JSON.stringify(summary.byType, null, 2)}`);
    }
}

module.exports = ThemeEngine;
