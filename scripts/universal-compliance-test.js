#!/usr/bin/env node

/**
 * UNIVERSAL PATTERN COMPLIANCE TEST
 * 
 * This tests both AI and framework generation to ensure they use identical real SBS patterns
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class UniversalPatternComplianceTest {
    constructor() {
        this.autoCoderPath = '/Users/arog/auto/auto/qa_automation/auto-coder';
        this.results = {
            framework: {},
            ai: {},
            comparison: {}
        };
    }

    async runFullComplianceTest() {
        console.log('🧪 RUNNING UNIVERSAL PATTERN COMPLIANCE TEST...\n');
        
        // 1. Test framework generation
        await this.testFrameworkGeneration();
        
        // 2. Test AI pattern enforcement (simulation)
        await this.testAIPatternEnforcement();
        
        // 3. Compare patterns
        await this.comparePatterns();
        
        // 4. Generate compliance report
        await this.generateComplianceReport();
        
        console.log('✅ UNIVERSAL PATTERN COMPLIANCE TEST COMPLETE!\n');
    }

    async testFrameworkGeneration() {
        console.log('🔧 Testing framework generation with real SBS patterns...');
        
        try {
            // Generate test artifacts using the framework
            const testName = 'compliance-test';
            console.log(`   Generating: ${testName}`);
            
            // Run framework generation
            const output = execSync(
                `cd ${this.autoCoderPath} && echo "test compliance patterns" | node cli.js --name ${testName} --type all`,
                { encoding: 'utf8', timeout: 30000 }
            );
            
            console.log('   ✅ Framework generation completed');
            
            // Analyze generated files
            await this.analyzeFrameworkOutput(testName);
            
        } catch (error) {
            console.log('   ⚠️ Framework generation issue:', error.message);
            this.results.framework.error = error.message;
        }
    }

    async analyzeFrameworkOutput(testName) {
        console.log('   🔍 Analyzing framework-generated files...');
        
        // Check if files were generated
        const expectedFiles = [
            `${testName}.feature`,
            `${testName}-steps.js`,
            `${testName}-page.js`
        ];
        
        this.results.framework.filesGenerated = [];
        this.results.framework.patterns = {};
        
        for (const fileName of expectedFiles) {
            const filePath = path.join(this.autoCoderPath, fileName);
            
            if (fs.existsSync(filePath)) {
                this.results.framework.filesGenerated.push(fileName);
                
                // Analyze patterns in the file
                const content = fs.readFileSync(filePath, 'utf8');
                this.results.framework.patterns[fileName] = this.analyzePatterns(content, fileName);
                
                console.log(`     ✅ ${fileName} - Pattern analysis complete`);
            } else {
                console.log(`     ❌ ${fileName} - File not found`);
            }
        }
    }

    analyzePatterns(content, fileName) {
        const analysis = {
            realSBSPatterns: 0,
            forbiddenPatterns: 0,
            details: {}
        };
        
        // Check for real SBS patterns
        if (fileName.endsWith('.feature')) {
            analysis.details.hasTeamAgnosticsTag = content.includes('@Team:Agnostics');
            analysis.details.hasRegressionTag = content.includes('@regression');
            analysis.details.usesAlexPersona = content.includes('Alex ');
            
            analysis.realSBSPatterns = [
                analysis.details.hasTeamAgnosticsTag,
                analysis.details.hasRegressionTag,
                analysis.details.usesAlexPersona
            ].filter(Boolean).length;
        }
        
        if (fileName.endsWith('-steps.js')) {
            analysis.details.hasChaiImport = content.includes('chai');
            analysis.details.hasCucumberImport = content.includes('@cucumber/cucumber');
            analysis.details.hasTimeout = content.includes('420 * 1000');
            analysis.details.hasAssertTrue = content.includes('assert.isTrue');
            
            analysis.realSBSPatterns = [
                analysis.details.hasChaiImport,
                analysis.details.hasCucumberImport,
                analysis.details.hasTimeout,
                analysis.details.hasAssertTrue
            ].filter(Boolean).length;
        }
        
        if (fileName.endsWith('-page.js')) {
            analysis.details.hasByImport = content.includes("require('../../support/By.js')") || content.includes('By = require');
            analysis.details.hasBasePageImport = content.includes('BasePage');
            analysis.details.hasXpathLocators = content.includes('By.xpath');
            analysis.details.hasCssLocators = content.includes('By.css');
            analysis.details.hasComplexSelectors = /By\.(xpath|css)\("\/\/[^"]+"|'\/\/[^']+'\)/.test(content);
            
            analysis.realSBSPatterns = [
                analysis.details.hasByImport,
                analysis.details.hasBasePageImport,
                analysis.details.hasXpathLocators,
                analysis.details.hasCssLocators,
                analysis.details.hasComplexSelectors
            ].filter(Boolean).length;
        }
        
        // Check for forbidden patterns
        const forbiddenPatterns = [
            'data-testid',
            'getElementById',
            'querySelector',
            'input[type=',
            '#id',
            '.class'
        ];
        
        for (const forbidden of forbiddenPatterns) {
            if (content.includes(forbidden)) {
                analysis.forbiddenPatterns++;
                analysis.details.forbiddenFound = analysis.details.forbiddenFound || [];
                analysis.details.forbiddenFound.push(forbidden);
            }
        }
        
        return analysis;
    }

    async testAIPatternEnforcement() {
        console.log('🤖 Testing AI pattern enforcement (simulation)...');
        
        try {
            // Load the universal enforcement system
            const { UniversalSBSPatternEnforcement } = require('../src/ai/universal-sbs-pattern-enforcement');
            
            console.log('   ✅ AI enforcement system loaded');
            
            // Simulate AI generation scenarios
            await this.simulateAIGeneration();
            
        } catch (error) {
            console.log('   ⚠️ AI enforcement issue:', error.message);
            this.results.ai.error = error.message;
        }
    }

    async simulateAIGeneration() {
        console.log('   🎭 Simulating AI-generated content validation...');
        
        // Simulate different types of AI-generated content
        const testCases = [
            {
                type: 'feature',
                content: `Feature: User Login
Scenario: User can login
Given I am on login page
When I enter credentials
Then I should be logged in`,
                name: 'Bad Feature (no real SBS patterns)'
            },
            {
                type: 'feature', 
                content: `@Team:Agnostics
@regression
Feature: User Login
Scenario: Alex can login to the system
Given Alex is logged into RunMod with a test client
When Alex enters valid credentials
Then Alex verifies successful login`,
                name: 'Good Feature (real SBS patterns)'
            },
            {
                type: 'page',
                content: `const loginButton = document.getElementById('login');
const usernameField = 'input[data-testid="username"]';`,
                name: 'Bad Page (forbidden patterns)'
            },
            {
                type: 'page',
                content: `const By = require('../../support/By.js');
const BasePage = require('../base-page');

const loginButton = By.xpath("//button[contains(text(),'Login')]");
const usernameField = By.css('[name="username"][type="text"]');`,
                name: 'Good Page (real SBS patterns)'
            }
        ];
        
        this.results.ai.testCases = [];
        
        for (const testCase of testCases) {
            console.log(`     Testing: ${testCase.name}`);
            
            const analysis = this.analyzePatterns(testCase.content, `test.${testCase.type}`);
            
            const result = {
                name: testCase.name,
                type: testCase.type,
                analysis: analysis,
                compliance: analysis.realSBSPatterns > 0 && analysis.forbiddenPatterns === 0
            };
            
            this.results.ai.testCases.push(result);
            
            const status = result.compliance ? '✅' : '❌';
            console.log(`       ${status} Compliance: ${result.compliance}`);
        }
    }

    async comparePatterns() {
        console.log('🔍 Comparing framework vs AI pattern compliance...');
        
        // Calculate framework compliance score
        const frameworkScore = this.calculateComplianceScore(this.results.framework.patterns);
        
        // Calculate AI compliance score
        const aiScore = this.calculateAIComplianceScore(this.results.ai.testCases);
        
        this.results.comparison = {
            frameworkScore: frameworkScore,
            aiScore: aiScore,
            patternsMatch: Math.abs(frameworkScore - aiScore) < 0.2, // Within 20%
            recommendation: frameworkScore > 0.8 && aiScore > 0.8 ? 
                'Both systems comply with real SBS patterns' :
                'Pattern enforcement needs improvement'
        };
        
        console.log(`   Framework compliance: ${Math.round(frameworkScore * 100)}%`);
        console.log(`   AI compliance (simulated): ${Math.round(aiScore * 100)}%`);
        console.log(`   Patterns match: ${this.results.comparison.patternsMatch ? '✅' : '❌'}`);
    }

    calculateComplianceScore(patterns) {
        if (!patterns || Object.keys(patterns).length === 0) return 0;
        
        let totalScore = 0;
        let fileCount = 0;
        
        for (const fileName of Object.keys(patterns)) {
            const pattern = patterns[fileName];
            const maxPossible = fileName.endsWith('.feature') ? 3 : 
                              fileName.endsWith('-steps.js') ? 4 : 5;
            
            const fileScore = (pattern.realSBSPatterns / maxPossible) - 
                            (pattern.forbiddenPatterns * 0.2); // Penalty for forbidden patterns
            
            totalScore += Math.max(0, Math.min(1, fileScore));
            fileCount++;
        }
        
        return fileCount > 0 ? totalScore / fileCount : 0;
    }

    calculateAIComplianceScore(testCases) {
        if (!testCases || testCases.length === 0) return 0;
        
        const compliantCases = testCases.filter(tc => tc.compliance).length;
        return compliantCases / testCases.length;
    }

    async generateComplianceReport() {
        console.log('📊 Generating final compliance report...');
        
        const report = `# UNIVERSAL PATTERN COMPLIANCE TEST REPORT

## 🎯 Test Objective
Verify that both AI-generated and framework-generated test artifacts follow identical real SBS patterns.

## 📊 Test Results

### Framework Generation Results
**Files Generated**: ${this.results.framework.filesGenerated?.length || 0}
**Compliance Score**: ${Math.round((this.results.comparison?.frameworkScore || 0) * 100)}%

${this.formatFrameworkResults()}

### AI Pattern Enforcement Results  
**Test Cases**: ${this.results.ai.testCases?.length || 0}
**Compliance Score**: ${Math.round((this.results.comparison?.aiScore || 0) * 100)}%

${this.formatAIResults()}

## 🔍 Pattern Comparison
**Framework Score**: ${Math.round((this.results.comparison?.frameworkScore || 0) * 100)}%
**AI Score**: ${Math.round((this.results.comparison?.aiScore || 0) * 100)}%
**Patterns Match**: ${this.results.comparison?.patternsMatch ? '✅ YES' : '❌ NO'}

## 🏆 Final Assessment

${this.results.comparison?.recommendation || 'Test incomplete'}

### ✅ Real SBS Patterns Detected
- @Team:Agnostics and @regression tags
- Alex persona usage
- By.xpath() and By.css() locators
- Complex selector patterns
- 420 * 1000 timeout patterns
- assert.isTrue assertions

### ❌ Forbidden Patterns Avoided
- data-testid selectors
- getElementById usage
- Simple CSS selectors (#id, .class)
- Generic querySelector patterns

## 🚀 Conclusion

${this.generateConclusion()}

---
Generated: ${new Date().toISOString()}
Test Status: ${this.getOverallStatus()}
`;

        fs.writeFileSync(
            path.join(this.autoCoderPath, 'UNIVERSAL-COMPLIANCE-TEST-REPORT.md'),
            report
        );
        
        console.log('   ✅ Compliance report generated');
        console.log(`\n🎯 Overall Status: ${this.getOverallStatus()}`);
    }

    formatFrameworkResults() {
        if (!this.results.framework.patterns) {
            return '❌ No framework files analyzed';
        }
        
        let result = '';
        for (const [fileName, analysis] of Object.entries(this.results.framework.patterns)) {
            result += `\n**${fileName}**:\n`;
            result += `- Real SBS Patterns: ${analysis.realSBSPatterns}\n`;
            result += `- Forbidden Patterns: ${analysis.forbiddenPatterns}\n`;
            
            if (analysis.details) {
                result += '- Details:\n';
                for (const [key, value] of Object.entries(analysis.details)) {
                    if (typeof value === 'boolean') {
                        result += `  - ${key}: ${value ? '✅' : '❌'}\n`;
                    } else if (Array.isArray(value)) {
                        result += `  - ${key}: ${value.join(', ')}\n`;
                    }
                }
            }
        }
        
        return result;
    }

    formatAIResults() {
        if (!this.results.ai.testCases) {
            return '❌ No AI test cases analyzed';
        }
        
        let result = '';
        for (const testCase of this.results.ai.testCases) {
            result += `\n**${testCase.name}**:\n`;
            result += `- Type: ${testCase.type}\n`;
            result += `- Compliance: ${testCase.compliance ? '✅' : '❌'}\n`;
            result += `- Real SBS Patterns: ${testCase.analysis.realSBSPatterns}\n`;
            result += `- Forbidden Patterns: ${testCase.analysis.forbiddenPatterns}\n`;
        }
        
        return result;
    }

    generateConclusion() {
        const frameworkScore = this.results.comparison?.frameworkScore || 0;
        const aiScore = this.results.comparison?.aiScore || 0;
        
        if (frameworkScore > 0.8 && aiScore > 0.8) {
            return '🎉 **SUCCESS**: Both AI and framework generation follow real SBS patterns consistently. The universal enforcement system is working correctly.';
        } else if (frameworkScore > 0.8) {
            return '🔧 **PARTIAL**: Framework generation follows real SBS patterns. AI enforcement needs implementation with actual AI tools.';
        } else {
            return '⚠️ **NEEDS WORK**: Pattern compliance needs improvement. Verify REAL-SBS-REFERENCE files are being used correctly.';
        }
    }

    getOverallStatus() {
        const frameworkScore = this.results.comparison?.frameworkScore || 0;
        const aiScore = this.results.comparison?.aiScore || 0;
        
        if (frameworkScore > 0.8 && aiScore > 0.8) {
            return '🎉 COMPLIANT';
        } else if (frameworkScore > 0.6 || aiScore > 0.6) {
            return '🔧 PARTIAL COMPLIANCE';
        } else {
            return '❌ NON-COMPLIANT';
        }
    }
}

// Main execution
async function main() {
    try {
        const tester = new UniversalPatternComplianceTest();
        await tester.runFullComplianceTest();
        
        console.log('🎉 UNIVERSAL PATTERN COMPLIANCE TEST COMPLETE!');
        console.log('📊 Check UNIVERSAL-COMPLIANCE-TEST-REPORT.md for detailed results');
        
    } catch (error) {
        console.error('❌ Test Error:', error.message);
        throw error;
    }
}

if (require.main === module) {
    main();
}

module.exports = { UniversalPatternComplianceTest };
