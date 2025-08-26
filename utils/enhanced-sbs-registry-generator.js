#!/usr/bin/env node

/**
 * Enhanced SBS Registry Generator with Deep Scanning
 * 
 * Scans SBS_Automation framework comprehensively and generates registries
 * with detailed conflict analysis and pattern detection.
 */

const fs = require('fs');
const path = require('path');

class EnhancedSBSRegistryGenerator {
    constructor() {
        this.sbsPath = path.join(__dirname, '../../SBS_Automation');
        this.outputPath = path.join(__dirname, '../knowledge-base');
        
        this.stats = {
            filesScanned: 0,
            stepsFound: 0,
            pagesFound: 0,
            featuresFound: 0,
            conflictsDetected: 0
        };
        
        this.registries = {
            steps: new Map(),
            pages: new Map(),
            features: new Map(),
            actions: new Map(),
            locators: new Map()
        };
        
        this.conflicts = [];
        this.recommendations = [];
    }

    async generate() {
        console.log('🔍 Enhanced SBS_Automation Registry Generation Starting...\n');
        
        try {
            this.ensureOutputDirectory();
            
            console.log('📂 Scanning SBS_Automation directory structure...');
            await this.scanDirectory(this.sbsPath);
            
            console.log('\n🔍 Analyzing for conflicts and patterns...');
            this.analyzeConflicts();
            
            console.log('\n📝 Generating registry files...');
            this.generateAllRegistries();
            
            console.log('\n📊 Generating analysis report...');
            this.generateAnalysisReport();
            
            this.printSummary();
            
        } catch (error) {
            console.error('❌ Error during registry generation:', error);
            throw error;
        }
    }

    ensureOutputDirectory() {
        if (!fs.existsSync(this.outputPath)) {
            fs.mkdirSync(this.outputPath, { recursive: true });
        }
    }

    async scanDirectory(dirPath, depth = 0) {
        if (depth > 10) return; // Prevent infinite recursion
        
        try {
            const items = fs.readdirSync(dirPath);
            
            for (const item of items) {
                if (item.startsWith('.') || item === 'node_modules') continue;
                
                const fullPath = path.join(dirPath, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    await this.scanDirectory(fullPath, depth + 1);
                } else if (stat.isFile()) {
                    await this.scanFile(fullPath);
                }
            }
        } catch (error) {
            console.warn(`⚠️  Could not scan directory ${dirPath}: ${error.message}`);
        }
    }

    async scanFile(filePath) {
        try {
            const relativePath = path.relative(this.sbsPath, filePath);
            const extension = path.extname(filePath);
            
            this.stats.filesScanned++;
            
            if (extension === '.js' && relativePath.includes('steps')) {
                await this.scanStepFile(filePath);
            } else if (extension === '.js' && relativePath.includes('pages')) {
                await this.scanPageFile(filePath);
            } else if (extension === '.feature') {
                await this.scanFeatureFile(filePath);
            }
            
            if (this.stats.filesScanned % 50 === 0) {
                console.log(`  📄 Scanned ${this.stats.filesScanned} files...`);
            }
            
        } catch (error) {
            console.warn(`⚠️  Error scanning file ${filePath}: ${error.message}`);
        }
    }

    async scanStepFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const relativePath = path.relative(this.sbsPath, filePath);
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // More comprehensive step definition patterns
            const stepPatterns = [
                /^(Given|When|Then)\s*\(\s*['"`]([^'"`]+)['"`]/,
                /^(Given|When|Then)\s*\(\s*\/([^\/]+)\//,
                /^(Given|When|Then)\s*\(\s*`([^`]+)`/
            ];
            
            for (const pattern of stepPatterns) {
                const match = line.match(pattern);
                if (match) {
                    const stepDef = {
                        keyword: match[1],
                        pattern: match[2],
                        file: relativePath,
                        line: i + 1,
                        fullLine: line,
                        context: this.extractStepContext(lines, i)
                    };
                    
                    const key = `${stepDef.keyword}:${stepDef.pattern}`;
                    
                    if (this.registries.steps.has(key)) {
                        // Potential conflict detected
                        const existing = this.registries.steps.get(key);
                        this.conflicts.push({
                            type: 'step_conflict',
                            pattern: stepDef.pattern,
                            keyword: stepDef.keyword,
                            files: [existing.file, stepDef.file],
                            severity: this.calculateConflictSeverity(existing, stepDef)
                        });
                        this.stats.conflictsDetected++;
                    } else {
                        this.registries.steps.set(key, stepDef);
                        this.stats.stepsFound++;
                    }
                    
                    break; // Only match first pattern per line
                }
            }
        }
    }

    extractStepContext(lines, index) {
        const contextBefore = [];
        const contextAfter = [];
        
        // Get 3 lines before
        for (let i = Math.max(0, index - 3); i < index; i++) {
            contextBefore.push(lines[i].trim());
        }
        
        // Get 3 lines after
        for (let i = index + 1; i < Math.min(lines.length, index + 4); i++) {
            contextAfter.push(lines[i].trim());
        }
        
        return {
            before: contextBefore,
            after: contextAfter
        };
    }

    calculateConflictSeverity(existing, current) {
        // High if different modules
        const existingModule = existing.file.split('/')[0];
        const currentModule = current.file.split('/')[0];
        
        if (existingModule !== currentModule) {
            return 'HIGH';
        }
        
        // Medium if same module but different files
        if (existing.file !== current.file) {
            return 'MEDIUM';
        }
        
        return 'LOW';
    }

    async scanPageFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const relativePath = path.relative(this.sbsPath, filePath);
        
        let currentClass = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Match class definitions
            const classMatch = line.match(/class\s+(\w+)/);
            if (classMatch) {
                currentClass = {
                    name: classMatch[1],
                    file: relativePath,
                    line: i + 1,
                    methods: [],
                    locators: []
                };
                
                this.registries.pages.set(currentClass.name, currentClass);
                this.stats.pagesFound++;
            }
            
            // Match methods (if we're in a class)
            if (currentClass) {
                const methodMatch = line.match(/^\s*(async\s+)?(\w+)\s*\([^)]*\)/);
                if (methodMatch && !line.includes('constructor') && !line.includes('class')) {
                    const method = {
                        name: methodMatch[2],
                        async: !!methodMatch[1],
                        line: i + 1,
                        isAction: this.isActionMethod(methodMatch[2])
                    };
                    
                    currentClass.methods.push(method);
                    
                    if (method.isAction) {
                        this.registries.actions.set(`${currentClass.name}.${method.name}`, {
                            page: currentClass.name,
                            method: method.name,
                            file: relativePath,
                            line: i + 1,
                            async: method.async
                        });
                    }
                }
                
                // Match locators
                const locatorMatch = line.match(/this\.(\w+)\s*=\s*['"`]([^'"`]+)['"`]/);
                if (locatorMatch) {
                    const locator = {
                        name: locatorMatch[1],
                        selector: locatorMatch[2],
                        line: i + 1,
                        type: this.getLocatorType(locatorMatch[2])
                    };
                    
                    currentClass.locators.push(locator);
                    
                    this.registries.locators.set(`${currentClass.name}.${locator.name}`, {
                        page: currentClass.name,
                        name: locator.name,
                        selector: locator.selector,
                        file: relativePath,
                        line: i + 1,
                        type: locator.type
                    });
                }
            }
        }
    }

    isActionMethod(methodName) {
        const actionKeywords = [
            'click', 'type', 'select', 'enter', 'fill', 'submit',
            'verify', 'check', 'validate', 'wait', 'navigate',
            'scroll', 'hover', 'drag', 'drop', 'upload', 'download'
        ];
        
        return actionKeywords.some(keyword => 
            methodName.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    getLocatorType(selector) {
        if (selector.startsWith('#')) return 'id';
        if (selector.startsWith('.')) return 'class';
        if (selector.startsWith('[')) return 'attribute';
        if (selector.includes('//')) return 'xpath';
        if (selector.includes('>>')) return 'playwright';
        if (selector.includes('text=')) return 'text';
        return 'css';
    }

    async scanFeatureFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const relativePath = path.relative(this.sbsPath, filePath);
        
        let currentFeature = null;
        let currentScenario = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('Feature:')) {
                currentFeature = {
                    name: line.replace('Feature:', '').trim(),
                    file: relativePath,
                    line: i + 1,
                    scenarios: [],
                    tags: this.extractTags(lines, i)
                };
                
                this.registries.features.set(currentFeature.name, currentFeature);
                this.stats.featuresFound++;
            }
            
            if (line.match(/^Scenario( Outline)?:/)) {
                currentScenario = {
                    name: line.replace(/^Scenario( Outline)?:/, '').trim(),
                    line: i + 1,
                    steps: [],
                    tags: this.extractTags(lines, i)
                };
                
                if (currentFeature) {
                    currentFeature.scenarios.push(currentScenario);
                }
            }
            
            // Capture steps
            const stepMatch = line.match(/^\s*(Given|When|Then|And|But)\s+(.+)$/);
            if (stepMatch && currentScenario) {
                currentScenario.steps.push({
                    keyword: stepMatch[1],
                    text: stepMatch[2],
                    line: i + 1
                });
            }
        }
    }

    extractTags(lines, currentIndex) {
        const tags = [];
        
        // Look backward for tags
        for (let i = currentIndex - 1; i >= 0; i--) {
            const line = lines[i].trim();
            if (line.startsWith('@')) {
                tags.unshift(line);
            } else if (line !== '') {
                break;
            }
        }
        
        return tags;
    }

    analyzeConflicts() {
        console.log(`  🔍 Analyzing ${this.stats.stepsFound} step definitions for conflicts...`);
        
        // Group steps by normalized pattern
        const normalizedPatterns = new Map();
        
        for (const [key, step] of this.registries.steps) {
            const normalized = this.normalizePattern(step.pattern);
            
            if (!normalizedPatterns.has(normalized)) {
                normalizedPatterns.set(normalized, []);
            }
            
            normalizedPatterns.get(normalized).push(step);
        }
        
        // Find potential conflicts
        for (const [pattern, steps] of normalizedPatterns) {
            if (steps.length > 1) {
                const conflict = {
                    type: 'ambiguous_pattern',
                    normalizedPattern: pattern,
                    originalPatterns: steps.map(s => s.pattern),
                    steps: steps,
                    severity: this.calculateGroupConflictSeverity(steps),
                    suggestion: this.generateConflictSuggestion(steps)
                };
                
                this.conflicts.push(conflict);
            }
        }
        
        console.log(`  ⚠️  Found ${this.conflicts.length} potential conflicts`);
    }

    normalizePattern(pattern) {
        return pattern
            .replace(/\{string\}/g, 'STRING')
            .replace(/\{int\}/g, 'NUMBER')
            .replace(/\{float\}/g, 'NUMBER')
            .replace(/\{word\}/g, 'WORD')
            .replace(/['"]/g, '')
            .replace(/\s+/g, ' ')
            .toLowerCase()
            .trim();
    }

    calculateGroupConflictSeverity(steps) {
        const modules = new Set(steps.map(s => s.file.split('/')[0]));
        const files = new Set(steps.map(s => s.file));
        
        if (modules.size > 1) return 'HIGH';
        if (files.size > 1) return 'MEDIUM';
        return 'LOW';
    }

    generateConflictSuggestion(steps) {
        const files = steps.map(s => s.file);
        const uniqueFiles = [...new Set(files)];
        
        if (uniqueFiles.length > 1) {
            return `Consider adding domain-specific prefixes to distinguish these step definitions: ${steps.map(s => `"${s.pattern}"`).join(', ')}`;
        }
        
        return `Merge these duplicate step definitions: ${steps.map(s => `"${s.pattern}"`).join(', ')}`;
    }

    generateAllRegistries() {
        // Enhanced Steps Registry
        this.writeRegistry('sbs-steps-enhanced-registry.json', {
            metadata: {
                generatedAt: new Date().toISOString(),
                generator: 'Enhanced SBS Registry Generator',
                version: '2.0',
                statistics: this.stats
            },
            steps: Array.from(this.registries.steps.values()),
            conflicts: this.conflicts,
            patterns: {
                safe: this.getSafePatterns(),
                risky: this.getRiskyPatterns()
            }
        });
        
        // Enhanced Pages Registry
        this.writeRegistry('sbs-pages-enhanced-registry.json', {
            metadata: {
                generatedAt: new Date().toISOString(),
                generator: 'Enhanced SBS Registry Generator',
                version: '2.0'
            },
            pages: Array.from(this.registries.pages.values()),
            actions: Array.from(this.registries.actions.values()),
            locators: Array.from(this.registries.locators.values())
        });
        
        // Enhanced Features Registry
        this.writeRegistry('sbs-features-enhanced-registry.json', {
            metadata: {
                generatedAt: new Date().toISOString(),
                generator: 'Enhanced SBS Registry Generator',
                version: '2.0'
            },
            features: Array.from(this.registries.features.values())
        });
        
        // Master Enhanced Registry
        this.writeRegistry('sbs-master-enhanced-registry.json', {
            metadata: {
                generatedAt: new Date().toISOString(),
                generator: 'Enhanced SBS Registry Generator',
                version: '2.0',
                statistics: this.stats
            },
            summary: {
                steps: this.stats.stepsFound,
                pages: this.stats.pagesFound,
                features: this.stats.featuresFound,
                conflicts: this.stats.conflictsDetected,
                filesScanned: this.stats.filesScanned
            },
            conflicts: this.conflicts.slice(0, 20), // Top 20 conflicts
            recommendations: this.generateRecommendations()
        });
        
        console.log('  ✅ All enhanced registries generated');
    }

    getSafePatterns() {
        const safe = [];
        for (const [key, step] of this.registries.steps) {
            if (!this.conflicts.some(c => c.steps && c.steps.some(s => s.pattern === step.pattern))) {
                safe.push(step.pattern);
            }
        }
        return safe.slice(0, 50); // Top 50 safe patterns
    }

    getRiskyPatterns() {
        const risky = [];
        for (const conflict of this.conflicts) {
            if (conflict.steps) {
                risky.push(...conflict.steps.map(s => s.pattern));
            }
        }
        return [...new Set(risky)];
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.conflicts.length > 0) {
            recommendations.push(`URGENT: Address ${this.conflicts.length} step definition conflicts to prevent ambiguous matches`);
        }
        
        if (this.stats.stepsFound > 500) {
            recommendations.push('Consider organizing step definitions into domain-specific modules');
        }
        
        const highSeverityConflicts = this.conflicts.filter(c => c.severity === 'HIGH');
        if (highSeverityConflicts.length > 0) {
            recommendations.push(`HIGH PRIORITY: ${highSeverityConflicts.length} high-severity conflicts detected across different modules`);
        }
        
        recommendations.push('Use these registries with enhanced auto-coder generator for conflict-free artifact generation');
        recommendations.push('Implement domain-specific prefixes for new step definitions');
        recommendations.push('Regularly update registries as SBS_Automation framework evolves');
        
        return recommendations;
    }

    generateAnalysisReport() {
        const report = {
            title: 'Enhanced SBS_Automation Registry Analysis Report',
            generatedAt: new Date().toISOString(),
            executiveSummary: {
                filesScanned: this.stats.filesScanned,
                stepsFound: this.stats.stepsFound,
                pagesFound: this.stats.pagesFound,
                featuresFound: this.stats.featuresFound,
                conflictsDetected: this.stats.conflictsDetected,
                riskLevel: this.calculateOverallRiskLevel()
            },
            conflictAnalysis: {
                total: this.conflicts.length,
                bySeverity: this.groupConflictsBySeverity(),
                topConflicts: this.conflicts.slice(0, 10)
            },
            recommendations: this.generateRecommendations(),
            nextSteps: [
                'Review and resolve high-severity conflicts',
                'Implement enhanced auto-coder generator',
                'Establish step definition naming conventions',
                'Set up automated conflict detection in CI/CD'
            ]
        };
        
        this.writeRegistry('sbs-enhanced-analysis-report.json', report);
        
        // Generate markdown report
        this.generateMarkdownReport(report);
    }

    calculateOverallRiskLevel() {
        const highSeverity = this.conflicts.filter(c => c.severity === 'HIGH').length;
        const totalConflicts = this.conflicts.length;
        
        if (highSeverity > 10 || totalConflicts > 50) return 'HIGH';
        if (highSeverity > 5 || totalConflicts > 20) return 'MEDIUM';
        if (totalConflicts > 0) return 'LOW';
        return 'MINIMAL';
    }

    groupConflictsBySeverity() {
        const groups = { HIGH: 0, MEDIUM: 0, LOW: 0 };
        for (const conflict of this.conflicts) {
            if (groups.hasOwnProperty(conflict.severity)) {
                groups[conflict.severity]++;
            }
        }
        return groups;
    }

    generateMarkdownReport(report) {
        const markdown = `# Enhanced SBS_Automation Registry Analysis Report

**Generated:** ${report.generatedAt}  
**Risk Level:** ${report.executiveSummary.riskLevel}

## Executive Summary

| Metric | Count |
|--------|-------|
| Files Scanned | ${report.executiveSummary.filesScanned} |
| Step Definitions | ${report.executiveSummary.stepsFound} |
| Page Objects | ${report.executiveSummary.pagesFound} |
| Features | ${report.executiveSummary.featuresFound} |
| **Conflicts Detected** | **${report.executiveSummary.conflictsDetected}** |

## Conflict Analysis

**Total Conflicts:** ${report.conflictAnalysis.total}

**By Severity:**
- 🔴 HIGH: ${report.conflictAnalysis.bySeverity.HIGH}
- 🟡 MEDIUM: ${report.conflictAnalysis.bySeverity.MEDIUM}
- 🟢 LOW: ${report.conflictAnalysis.bySeverity.LOW}

### Top Conflicts

${report.conflictAnalysis.topConflicts.map((conflict, i) => `
${i + 1}. **${conflict.normalizedPattern || conflict.pattern}** (${conflict.severity})
   - Type: ${conflict.type}
   - ${conflict.suggestion}
`).join('')}

## Recommendations

${report.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

## Next Steps

${report.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## Registry Files Generated

- \`sbs-steps-enhanced-registry.json\` - Complete step definitions with conflict analysis
- \`sbs-pages-enhanced-registry.json\` - Page objects, actions, and locators
- \`sbs-features-enhanced-registry.json\` - All feature files and scenarios
- \`sbs-master-enhanced-registry.json\` - Summary and top-level analysis

---
*Generated by Enhanced SBS Registry Generator v2.0*
`;

        this.writeRegistry('SBS-ENHANCED-REGISTRY-ANALYSIS-REPORT.md', markdown);
        console.log('  ✅ Enhanced markdown report generated');
    }

    writeRegistry(filename, data) {
        const filePath = path.join(this.outputPath, filename);
        const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, content);
        console.log(`    📄 ${filename}`);
    }

    printSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 ENHANCED SBS REGISTRY GENERATION COMPLETE');
        console.log('='.repeat(60));
        console.log(`📁 Files Scanned: ${this.stats.filesScanned}`);
        console.log(`🔧 Step Definitions: ${this.stats.stepsFound}`);
        console.log(`📱 Page Objects: ${this.stats.pagesFound}`);
        console.log(`📄 Features: ${this.stats.featuresFound}`);
        console.log(`⚠️  Conflicts Detected: ${this.stats.conflictsDetected}`);
        console.log(`📊 Risk Level: ${this.calculateOverallRiskLevel()}`);
        
        if (this.conflicts.length > 0) {
            console.log('\n🚨 ATTENTION REQUIRED:');
            console.log(`   ${this.conflicts.length} potential conflicts detected!`);
            console.log('   Review sbs-enhanced-analysis-report.json for details');
        }
        
        console.log('\n✅ Enhanced registries ready for conflict-free artifact generation!');
        console.log('='.repeat(60));
    }
}

// Run if called directly
if (require.main === module) {
    const generator = new EnhancedSBSRegistryGenerator();
    generator.generate().catch(console.error);
}

module.exports = EnhancedSBSRegistryGenerator;
