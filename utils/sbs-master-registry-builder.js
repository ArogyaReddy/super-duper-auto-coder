#!/usr/bin/env node

/**
 * SBS Master Registry Builder
 * Builds comprehensive registries for SBS_Automation framework to prevent AMBIGUOUS steps
 * 
 * Root Cause Solution:
 * - 447 conflicts detected across 12,874 step definitions
 * - Creates reusable registries for features, steps, pages, actions, locators
 * - Prevents auto-coder from generating conflicting artifacts
 * 
 * @author Auto-Coder Enhanced Registry System
 * @date 2025-08-06
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SBSMasterRegistryBuilder {
    constructor() {
        this.sbsPath = path.join(process.cwd(), 'SBS_Automation');
        this.outputDir = path.join(process.cwd(), 'auto-coder', 'knowledge-base', 'sbs-master-registries');
        this.registries = {
            features: { items: [], conflicts: [] },
            steps: { items: [], conflicts: [] },
            pages: { items: [], conflicts: [] },
            actions: { items: [], conflicts: [] },
            locators: { items: [], conflicts: [] }
        };
        
        // Ensure output directory exists
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    /**
     * Main execution method
     */
    async build() {
        console.log('🚀 Building SBS Master Registries to Eliminate AMBIGUOUS Steps...\n');
        
        try {
            await this.scanFeatures();
            await this.scanStepDefinitions();
            await this.scanPageObjects();
            await this.scanActions();
            await this.scanLocators();
            
            await this.generateRegistries();
            await this.generateConflictReport();
            await this.generateAutoCoderConfig();
            
            console.log('✅ SBS Master Registries Built Successfully!');
            console.log(`📁 Output Directory: ${this.outputDir}`);
            
        } catch (error) {
            console.error('❌ Error building registries:', error.message);
            process.exit(1);
        }
    }

    /**
     * Scan all feature files
     */
    async scanFeatures() {
        console.log('📋 Scanning Feature Files...');
        
        const featureFiles = this.findFiles('**/*.feature', this.sbsPath);
        
        for (const file of featureFiles) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const relativePath = path.relative(this.sbsPath, file);
                
                // Extract feature metadata
                const featureMatch = content.match(/Feature:\s*(.+)/);
                const scenarios = content.match(/Scenario[^:]*:\s*(.+)/g) || [];
                
                if (featureMatch) {
                    this.registries.features.items.push({
                        name: featureMatch[1].trim(),
                        file: relativePath,
                        scenarioCount: scenarios.length,
                        scenarios: scenarios.map(s => s.replace(/Scenario[^:]*:\s*/, '').trim()),
                        path: file,
                        domain: this.extractDomain(relativePath),
                        tags: this.extractTags(content)
                    });
                }
            } catch (error) {
                console.warn(`⚠️  Error reading feature file ${file}:`, error.message);
            }
        }
        
        console.log(`   Found ${this.registries.features.items.length} features`);
    }

    /**
     * Scan all step definition files
     */
    async scanStepDefinitions() {
        console.log('🔧 Scanning Step Definitions...');
        
        const stepFiles = this.findFiles('**/steps/**/*.js', this.sbsPath);
        const stepPatterns = new Map();
        
        for (const file of stepFiles) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const relativePath = path.relative(this.sbsPath, file);
                
                // Extract step definitions
                const stepMatches = content.match(/(Given|When|Then)\s*\(\s*['"`]([^'"`]+)['"`]/g) || [];
                
                for (const match of stepMatches) {
                    const stepMatch = match.match(/(Given|When|Then)\s*\(\s*['"`]([^'"`]+)['"`]/);
                    if (stepMatch) {
                        const keyword = stepMatch[1];
                        const pattern = stepMatch[2];
                        const normalizedPattern = this.normalizeStepPattern(pattern);
                        
                        const stepInfo = {
                            keyword,
                            pattern,
                            normalizedPattern,
                            file: relativePath,
                            domain: this.extractDomain(relativePath),
                            isParameterized: pattern.includes('{'),
                            complexity: this.calculateStepComplexity(pattern)
                        };
                        
                        // Track conflicts
                        if (stepPatterns.has(normalizedPattern)) {
                            stepPatterns.get(normalizedPattern).push(stepInfo);
                        } else {
                            stepPatterns.set(normalizedPattern, [stepInfo]);
                        }
                        
                        this.registries.steps.items.push(stepInfo);
                    }
                }
            } catch (error) {
                console.warn(`⚠️  Error reading step file ${file}:`, error.message);
            }
        }
        
        // Identify conflicts
        for (const [pattern, steps] of stepPatterns) {
            if (steps.length > 1) {
                this.registries.steps.conflicts.push({
                    pattern,
                    conflictCount: steps.length,
                    steps: steps,
                    severity: this.calculateConflictSeverity(steps.length),
                    recommendation: this.generateConflictRecommendation(pattern, steps)
                });
            }
        }
        
        console.log(`   Found ${this.registries.steps.items.length} step definitions`);
        console.log(`   Detected ${this.registries.steps.conflicts.length} conflicts`);
    }

    /**
     * Scan all page object files
     */
    async scanPageObjects() {
        console.log('📄 Scanning Page Objects...');
        
        const pageFiles = this.findFiles('**/pages/**/*.js', this.sbsPath);
        
        for (const file of pageFiles) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const relativePath = path.relative(this.sbsPath, file);
                
                // Extract class name and methods
                const classMatch = content.match(/class\s+(\w+)/);
                const methods = content.match(/^\s*(async\s+)?(\w+)\s*\(/gm) || [];
                
                if (classMatch) {
                    this.registries.pages.items.push({
                        className: classMatch[1],
                        file: relativePath,
                        methods: methods.map(m => m.replace(/^\s*(async\s+)?(\w+)\s*\(.*/, '$2').trim()),
                        domain: this.extractDomain(relativePath),
                        locatorCount: (content.match(/this\.\w+\s*=/g) || []).length
                    });
                }
            } catch (error) {
                console.warn(`⚠️  Error reading page file ${file}:`, error.message);
            }
        }
        
        console.log(`   Found ${this.registries.pages.items.length} page objects`);
    }

    /**
     * Scan actions/methods in page objects
     */
    async scanActions() {
        console.log('⚡ Scanning Actions...');
        
        const pageFiles = this.findFiles('**/pages/**/*.js', this.sbsPath);
        
        for (const file of pageFiles) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const relativePath = path.relative(this.sbsPath, file);
                
                // Extract method definitions with more detail
                const methodMatches = content.match(/^\s*(async\s+)?(\w+)\s*\([^)]*\)\s*{/gm) || [];
                
                for (const match of methodMatches) {
                    const methodMatch = match.match(/^\s*(async\s+)?(\w+)\s*\(([^)]*)\)/);
                    if (methodMatch && !methodMatch[2].startsWith('constructor')) {
                        this.registries.actions.items.push({
                            name: methodMatch[2],
                            isAsync: !!methodMatch[1],
                            parameters: methodMatch[3] ? methodMatch[3].split(',').map(p => p.trim()) : [],
                            file: relativePath,
                            domain: this.extractDomain(relativePath),
                            actionType: this.classifyActionType(methodMatch[2])
                        });
                    }
                }
            } catch (error) {
                console.warn(`⚠️  Error reading action file ${file}:`, error.message);
            }
        }
        
        console.log(`   Found ${this.registries.actions.items.length} actions`);
    }

    /**
     * Scan locators/selectors in page objects
     */
    async scanLocators() {
        console.log('🎯 Scanning Locators...');
        
        const pageFiles = this.findFiles('**/pages/**/*.js', this.sbsPath);
        
        for (const file of pageFiles) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const relativePath = path.relative(this.sbsPath, file);
                
                // Extract locator assignments
                const locatorMatches = content.match(/this\.(\w+)\s*=\s*['"`]([^'"`]+)['"`]/g) || [];
                
                for (const match of locatorMatches) {
                    const locatorMatch = match.match(/this\.(\w+)\s*=\s*['"`]([^'"`]+)['"`]/);
                    if (locatorMatch) {
                        this.registries.locators.items.push({
                            name: locatorMatch[1],
                            selector: locatorMatch[2],
                            file: relativePath,
                            domain: this.extractDomain(relativePath),
                            selectorType: this.classifySelector(locatorMatch[2]),
                            complexity: this.calculateSelectorComplexity(locatorMatch[2])
                        });
                    }
                }
            } catch (error) {
                console.warn(`⚠️  Error reading locator file ${file}:`, error.message);
            }
        }
        
        console.log(`   Found ${this.registries.locators.items.length} locators`);
    }

    /**
     * Generate all registry files
     */
    async generateRegistries() {
        console.log('\n📝 Generating Registry Files...');
        
        // Individual registries
        await this.writeRegistryFile('sbs-features-master-registry.json', {
            metadata: this.getMetadata('Features Master Registry'),
            features: this.registries.features.items,
            statistics: {
                totalFeatures: this.registries.features.items.length,
                domainBreakdown: this.getDomainBreakdown(this.registries.features.items)
            }
        });

        await this.writeRegistryFile('sbs-steps-master-registry.json', {
            metadata: this.getMetadata('Steps Master Registry'),
            steps: this.registries.steps.items,
            conflicts: this.registries.steps.conflicts,
            statistics: {
                totalSteps: this.registries.steps.items.length,
                totalConflicts: this.registries.steps.conflicts.length,
                conflictRate: ((this.registries.steps.conflicts.length / this.registries.steps.items.length) * 100).toFixed(2) + '%'
            }
        });

        await this.writeRegistryFile('sbs-pages-master-registry.json', {
            metadata: this.getMetadata('Pages Master Registry'),
            pages: this.registries.pages.items,
            statistics: {
                totalPages: this.registries.pages.items.length,
                domainBreakdown: this.getDomainBreakdown(this.registries.pages.items)
            }
        });

        await this.writeRegistryFile('sbs-actions-master-registry.json', {
            metadata: this.getMetadata('Actions Master Registry'),
            actions: this.registries.actions.items,
            statistics: {
                totalActions: this.registries.actions.items.length,
                actionTypeBreakdown: this.getActionTypeBreakdown()
            }
        });

        await this.writeRegistryFile('sbs-locators-master-registry.json', {
            metadata: this.getMetadata('Locators Master Registry'),
            locators: this.registries.locators.items,
            statistics: {
                totalLocators: this.registries.locators.items.length,
                selectorTypeBreakdown: this.getSelectorTypeBreakdown()
            }
        });

        // Master combined registry
        await this.writeRegistryFile('sbs-complete-master-registry.json', {
            metadata: this.getMetadata('Complete Master Registry'),
            summary: {
                features: this.registries.features.items.length,
                steps: this.registries.steps.items.length,
                pages: this.registries.pages.items.length,
                actions: this.registries.actions.items.length,
                locators: this.registries.locators.items.length,
                conflicts: this.registries.steps.conflicts.length
            },
            registries: this.registries
        });
    }

    /**
     * Generate conflict analysis report
     */
    async generateConflictReport() {
        console.log('⚠️  Generating Conflict Analysis Report...');
        
        const report = `# SBS_Automation Conflict Analysis Report

**Generated:** ${new Date().toISOString()}  
**Purpose:** Root Cause Analysis for AMBIGUOUS Steps

## Executive Summary

| Metric | Count |
|--------|-------|
| Total Step Definitions | ${this.registries.steps.items.length} |
| **Conflicts Detected** | **${this.registries.steps.conflicts.length}** |
| Conflict Rate | ${((this.registries.steps.conflicts.length / this.registries.steps.items.length) * 100).toFixed(2)}% |

## Root Cause Analysis

The AMBIGUOUS steps issue stems from:

1. **Duplicate Step Patterns**: ${this.registries.steps.conflicts.length} conflicting patterns
2. **Generic Parameterized Steps**: Over-broad step definitions
3. **Cross-Domain Conflicts**: Similar steps across different domains
4. **Legacy Step Accumulation**: Old steps not cleaned up

## Top 10 Most Critical Conflicts

${this.registries.steps.conflicts
    .sort((a, b) => b.conflictCount - a.conflictCount)
    .slice(0, 10)
    .map((conflict, index) => `
### ${index + 1}. "${conflict.pattern}"
- **Conflicts**: ${conflict.conflictCount}
- **Severity**: ${conflict.severity}
- **Files**: ${conflict.steps.map(s => s.file).join(', ')}
- **Recommendation**: ${conflict.recommendation}
`).join('')}

## Solution Implementation

### Registry-Based Prevention
1. **Pre-Generation Validation**: Check against step registry before creating new steps
2. **Domain-Specific Patterns**: Use domain prefixes to avoid conflicts
3. **Reuse Existing Steps**: Prioritize existing steps over new creation
4. **Automated Conflict Detection**: Real-time validation during auto-coder generation

### Immediate Actions Required
1. Integrate step registry into auto-coder workflow
2. Implement conflict checking before artifact generation
3. Create domain-specific step patterns
4. Establish step reuse guidelines

## Prevention Guidelines

### Safe Step Patterns
- Use domain-specific prefixes: "billing_", "payroll_", "company_"
- Include context in step names: "Alex clicks the billing Get Started button"
- Avoid generic parameterized steps: "{string}" without context
- Use business-language specific terminology

### Auto-Coder Integration
- Check registry before generating new steps
- Suggest existing steps for reuse
- Validate no conflicts exist
- Generate domain-scoped steps when needed

---
*Report generated by SBS Master Registry Builder*
`;

        fs.writeFileSync(path.join(this.outputDir, 'SBS-CONFLICT-ANALYSIS-REPORT.md'), report);
    }

    /**
     * Generate auto-coder configuration
     */
    async generateAutoCoderConfig() {
        console.log('⚙️  Generating Auto-Coder Configuration...');
        
        const config = {
            "registryIntegration": {
                "enabled": true,
                "registryPath": "./knowledge-base/sbs-master-registries",
                "validationMode": "strict",
                "conflictResolution": "suggest_existing"
            },
            "stepGeneration": {
                "requireDomainPrefix": true,
                "maxGenericParameters": 1,
                "reuseThreshold": 0.8,
                "conflictTolerance": "zero"
            },
            "domainPrefixes": {
                "billing": "billing_",
                "payroll": "payroll_",
                "company": "company_",
                "people": "people_",
                "reports": "reports_",
                "wholesale": "wholesale_"
            },
            "validationRules": [
                "no_duplicate_patterns",
                "domain_specific_naming",
                "business_language_compliance",
                "existing_step_reuse"
            ],
            "outputFormat": {
                "includeMetadata": true,
                "generateDocumentation": true,
                "createRegistryUpdates": true
            }
        };

        fs.writeFileSync(
            path.join(this.outputDir, 'auto-coder-registry-config.json'),
            JSON.stringify(config, null, 2)
        );
    }

    // Helper Methods
    findFiles(pattern, dir) {
        try {
            const command = `find "${dir}" -name "${pattern.replace('**/', '')}" -type f 2>/dev/null || true`;
            const output = execSync(command, { encoding: 'utf8' });
            return output.trim().split('\n').filter(Boolean);
        } catch (error) {
            console.warn(`Warning: Could not search for files with pattern ${pattern}:`, error.message);
            return [];
        }
    }

    extractDomain(filePath) {
        const pathParts = filePath.split('/');
        if (pathParts.includes('billing')) return 'billing';
        if (pathParts.includes('payroll')) return 'payroll';
        if (pathParts.includes('company')) return 'company';
        if (pathParts.includes('people')) return 'people';
        if (pathParts.includes('wholesale')) return 'wholesale';
        if (pathParts.includes('reports')) return 'reports';
        return 'general';
    }

    normalizeStepPattern(pattern) {
        return pattern
            .replace(/\{[^}]+\}/g, '{param}')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    calculateStepComplexity(pattern) {
        const paramCount = (pattern.match(/\{[^}]+\}/g) || []).length;
        const wordCount = pattern.split(/\s+/).length;
        
        if (paramCount > 2) return 'high';
        if (paramCount > 0 && wordCount > 8) return 'medium';
        return 'low';
    }

    calculateConflictSeverity(conflictCount) {
        if (conflictCount >= 5) return 'HIGH';
        if (conflictCount >= 3) return 'MEDIUM';
        return 'LOW';
    }

    generateConflictRecommendation(pattern, steps) {
        const domains = [...new Set(steps.map(s => s.domain))];
        
        if (domains.length > 1) {
            return `Add domain prefixes: ${domains.map(d => `"${d}_${pattern}"`).join(', ')}`;
        } else {
            return `Make pattern more specific or consolidate into single step definition`;
        }
    }

    extractTags(content) {
        const tagMatches = content.match(/@\w+/g) || [];
        return tagMatches.map(tag => tag.substring(1));
    }

    classifyActionType(methodName) {
        const name = methodName.toLowerCase();
        if (name.includes('click') || name.includes('tap')) return 'interaction';
        if (name.includes('verify') || name.includes('check') || name.includes('assert')) return 'verification';
        if (name.includes('navigate') || name.includes('goto')) return 'navigation';
        if (name.includes('enter') || name.includes('input') || name.includes('type')) return 'input';
        if (name.includes('wait') || name.includes('sleep')) return 'synchronization';
        return 'utility';
    }

    classifySelector(selector) {
        if (selector.startsWith('#')) return 'id';
        if (selector.startsWith('.')) return 'class';
        if (selector.includes('[data-')) return 'data-attribute';
        if (selector.includes('xpath')) return 'xpath';
        if (selector.includes('css=')) return 'css';
        return 'other';
    }

    calculateSelectorComplexity(selector) {
        const parts = selector.split(/[\s>+~]/).length;
        if (parts > 3) return 'high';
        if (parts > 1) return 'medium';
        return 'low';
    }

    getDomainBreakdown(items) {
        const breakdown = {};
        items.forEach(item => {
            breakdown[item.domain] = (breakdown[item.domain] || 0) + 1;
        });
        return breakdown;
    }

    getActionTypeBreakdown() {
        const breakdown = {};
        this.registries.actions.items.forEach(action => {
            breakdown[action.actionType] = (breakdown[action.actionType] || 0) + 1;
        });
        return breakdown;
    }

    getSelectorTypeBreakdown() {
        const breakdown = {};
        this.registries.locators.items.forEach(locator => {
            breakdown[locator.selectorType] = (breakdown[locator.selectorType] || 0) + 1;
        });
        return breakdown;
    }

    getMetadata(type) {
        return {
            generatedAt: new Date().toISOString(),
            generator: 'SBS Master Registry Builder',
            version: '1.0',
            type: type,
            purpose: 'Eliminate AMBIGUOUS steps in auto-coder artifact generation'
        };
    }

    async writeRegistryFile(filename, data) {
        const filePath = path.join(this.outputDir, filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`   ✅ ${filename}`);
    }
}

// Execute if called directly
if (require.main === module) {
    const builder = new SBSMasterRegistryBuilder();
    builder.build().catch(console.error);
}

module.exports = SBSMasterRegistryBuilder;
