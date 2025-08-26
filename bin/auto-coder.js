#!/usr/bin/env node

/**
 * Auto Coder CLI - Command line interface for the intelligent test generation framework
 */

const { Command } = require('commander');
const AutoCoder = require('../src/auto-coder');
const InputTypeManager = require('../src/adapters/input-type-manager');
const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

const program = new Command();

program
    .name('auto-coder')
    .description('Intelligent test artifact generator using SBS automation patterns')
    .version('1.0.0');

/**
 * Generate command - single requirement
 */
program
    .command('generate')
    .description('Generate test artifacts from a requirement file or text')
    .argument('<input>', 'The requirement file path or requirement text')
    .option('-o, --output <path>', 'Output directory', './SBS_Automation')
    .option('-t, --type <type>', 'Input type (text, curl, record, jira, images)', 'auto')
    .option('-f, --framework <framework>', 'Testing framework (sbs, cucumber, playwright, jest, multi)', 'sbs')
    .option('-c, --confidence <threshold>', 'Minimum confidence threshold (0-1)', '0.3')
    .option('--no-metadata', 'Skip metadata generation')
    .option('--no-comments', 'Skip comment generation')
    .option('--project <name>', 'Project name for generated files')
    .option('--browsers <browsers>', 'Target browsers for Playwright (comma-separated)', 'chromium,firefox')
    .option('--test-type <type>', 'Jest test type (unit, integration, component)', 'unit')
    .action(async (input, options) => {
        try {
            console.log('🚀 Auto Coder - Intelligent Test Generation');
            console.log('==========================================\n');

            // Check if input is a file path or direct text
            const isFilePath = await fs.pathExists(input);
            
            if (isFilePath) {
                // Input is a file - use InputTypeManager for proper routing
                console.log(`📄 Processing input file: ${input}`);
                
                const inputManager = new InputTypeManager();
                await inputManager.initialize();
                
                // Detect or use specified input type
                const inputType = options.type === 'auto' ? null : options.type;
                
                // Process the input file
                const processResult = await inputManager.processInput(input, inputType, {
                    framework: options.framework,
                    outputPath: options.output,
                    projectName: options.project,
                    confidence: parseFloat(options.confidence),
                    includeMetadata: options.metadata,
                    generateComments: options.comments
                });
                
                if (!processResult.success) {
                    console.error(`❌ Failed to process input: ${processResult.error}`);
                    process.exit(1);
                }
                
                // Write artifacts to output directory
                const writeResult = await inputManager.writeArtifacts(processResult.artifacts, options.output);
                
                if (!writeResult.success) {
                    console.error(`❌ Failed to write artifacts: ${writeResult.error}`);
                    process.exit(1);
                }
                
                console.log('\n🎉 Generation Summary:');
                console.log('=====================');
                console.log(`✅ Input Type: ${processResult.inputType}`);
                console.log(`✅ Files generated: ${writeResult.count}`);
                console.log(`✅ Output directory: ${options.output}`);
                
                if (processResult.curlCommands) {
                    console.log(`✅ cURL commands processed: ${processResult.count}`);
                }
                
                if (processResult.analysis) {
                    console.log(`✅ Actions recorded: ${processResult.analysis.actions.length}`);
                }
                
                console.log('\n📁 Generated Files:');
                writeResult.files.forEach(filePath => {
                    console.log(`   ${path.relative(process.cwd(), filePath)}`);
                });
                
            } else {
                // Input is direct text - use traditional AutoCoder
                const autoCoder = new AutoCoder({
                    outputPath: options.output,
                    confidenceThreshold: parseFloat(options.confidence),
                    includeMetadata: options.metadata,
                    generateComments: options.comments,
                    projectName: options.project
                });

                // Parse framework options
                let framework = options.framework;
                let frameworkOptions = {};

                if (framework === 'playwright') {
                    frameworkOptions.browsers = options.browsers ? options.browsers.split(',') : ['chromium', 'firefox'];
                } else if (framework === 'jest') {
                    frameworkOptions.testType = options.testType;
                } else if (framework === 'multi') {
                    framework = ['playwright', 'jest'];
                }

                const result = await autoCoder.generateFromRequirement(input, {
                    framework,
                    ...frameworkOptions
                });

                if (result.success) {
                    console.log('\n🎉 Generation Summary:');
                    console.log('=====================');
                    console.log(`✅ Domain: ${result.analysis.domain}`);
                    console.log(`✅ Intent: ${result.analysis.intent}`);
                    console.log(`✅ Complexity: ${result.analysis.complexity}`);
                    console.log(`✅ Confidence: ${Math.round(result.confidence * 100)}%`);
                    console.log(`✅ Duration: ${result.duration}ms`);
                    console.log(`✅ Files generated: ${Object.keys(result.output.files).length}`);
                    
                    console.log('\n📁 Generated Files:');
                    Object.entries(result.output.files).forEach(([type, filePath]) => {
                        console.log(`   ${type}: ${path.relative(process.cwd(), filePath)}`);
                    });

                    if (result.matches.reasoning && result.matches.reasoning.length > 0) {
                        console.log('\n🧠 AI Reasoning:');
                        result.matches.reasoning.forEach(reason => {
                            console.log(`   • ${reason}`);
                        });
                    }
                } else {
                    console.error('\n❌ Generation failed:', result.error);
                    process.exit(1);
                }
            }

        } catch (error) {
            console.error('❌ Error:', error.message);
            process.exit(1);
        }
    });

/**
 * Suggest framework command - recommend best framework for requirement
 */
program
    .command('suggest')
    .description('Suggest the best testing framework for a requirement')
    .argument('<requirement>', 'The requirement text to analyze')
    .option('--project-path <path>', 'Path to existing project for context analysis', process.cwd())
    .action(async (requirement, options) => {
        try {
            console.log('🧠 Auto Coder - Framework Suggestion');
            console.log('====================================\n');

            const autoCoder = new AutoCoder();
            const suggestion = await autoCoder.suggestFramework(requirement, {
                projectPath: options.projectPath
            });

            console.log('🏆 Recommended Framework:');
            console.log('=========================');
            console.log(`✅ Framework: ${suggestion.recommended.framework}`);
            console.log(`✅ Score: ${Math.round(suggestion.recommended.score)}/100`);
            console.log(`✅ Capabilities: ${suggestion.recommended.capabilities.features?.slice(0, 3).join(', ') || 'Standard testing'}`);

            if (suggestion.recommended.reasoning.length > 0) {
                console.log('\n💡 Why this framework:');
                suggestion.recommended.reasoning.forEach(reason => {
                    console.log(`   • ${reason}`);
                });
            }

            if (suggestion.alternatives.length > 0) {
                console.log('\n🔄 Alternative Options:');
                suggestion.alternatives.forEach((alt, index) => {
                    console.log(`   ${index + 1}. ${alt.framework} (${Math.round(alt.score)}/100)`);
                });
            }

            console.log('\n📊 Requirement Analysis:');
            console.log(`   Test Type: ${suggestion.characteristics.testType}`);
            console.log(`   Complexity: ${suggestion.characteristics.complexity}`);
            console.log(`   UI Testing: ${suggestion.characteristics.needsUI ? 'Yes' : 'No'}`);
            console.log(`   API Testing: ${suggestion.characteristics.needsAPI ? 'Yes' : 'No'}`);

        } catch (error) {
            console.error('❌ Error:', error.message);
            process.exit(1);
        }
    });

/**
 * Batch command - multiple requirements
 */
program
    .command('batch')
    .description('Generate test artifacts from multiple requirements')
    .argument('<file>', 'File containing requirements (one per line)')
    .option('-o, --output <path>', 'Output directory', './SBS_Automation')
    .option('-f, --format <format>', 'Template format (cucumber, playwright, jest)', 'cucumber')
    .option('-c, --confidence <threshold>', 'Minimum confidence threshold (0-1)', '0.3')
    .option('--no-report', 'Skip batch report generation')
    .action(async (file, options) => {
        try {
            console.log('🚀 Auto Coder - Batch Processing');
            console.log('=================================\n');

            // Read requirements from file
            const requirementsText = await fs.readFile(file, 'utf8');
            const requirements = requirementsText
                .split('\n')
                .map(line => line.trim())
                .filter(line => line && !line.startsWith('#'));

            if (requirements.length === 0) {
                console.error('❌ No requirements found in file');
                process.exit(1);
            }

            console.log(`📋 Found ${requirements.length} requirements to process\n`);

            const autoCoder = new AutoCoder({
                outputPath: options.output,
                templateFormat: options.format,
                confidenceThreshold: parseFloat(options.confidence)
            });

            const batchResult = await autoCoder.generateBatch(requirements, {
                generateReport: options.report
            });

            console.log('\n📊 Batch Summary:');
            console.log('=================');
            console.log(`✅ Total: ${batchResult.summary.total}`);
            console.log(`✅ Successful: ${batchResult.summary.successful}`);
            console.log(`❌ Failed: ${batchResult.summary.failed}`);
            console.log(`📈 Success Rate: ${Math.round((batchResult.summary.successful / batchResult.summary.total) * 100)}%`);
            console.log(`⏱️  Average Duration: ${Math.round(batchResult.summary.averageDuration)}ms`);
            console.log(`🎯 Average Confidence: ${Math.round(batchResult.summary.averageConfidence * 100)}%`);

            if (Object.keys(batchResult.summary.domains).length > 0) {
                console.log('\n🏢 Domain Distribution:');
                Object.entries(batchResult.summary.domains).forEach(([domain, count]) => {
                    console.log(`   ${domain}: ${count}`);
                });
            }

            if (batchResult.summary.errors.length > 0) {
                console.log('\n❌ Errors:');
                batchResult.summary.errors.forEach(error => {
                    console.log(`   "${error.requirement}": ${error.error}`);
                });
            }

        } catch (error) {
            console.error('❌ Error:', error.message);
            process.exit(1);
        }
    });

/**
 * Analyze command - analyze without generating
 */
program
    .command('analyze')
    .description('Analyze a requirement without generating artifacts')
    .argument('<requirement>', 'The requirement text to analyze')
    .action(async (requirement) => {
        try {
            console.log('🔍 Auto Coder - Requirement Analysis');
            console.log('====================================\n');

            const autoCoder = new AutoCoder();
            const analysis = await autoCoder.analyzeOnly(requirement);

            console.log('📊 Analysis Results:');
            console.log('===================');
            console.log(`Domain: ${analysis.analysis.domain} (${Math.round(analysis.analysis.confidence * 100)}% confidence)`);
            console.log(`Intent: ${analysis.analysis.intent}`);
            console.log(`Complexity: ${analysis.analysis.complexity}`);
            
            if (analysis.analysis.entities.length > 0) {
                console.log(`Entities: ${analysis.analysis.entities.map(e => e.entity).join(', ')}`);
            }
            
            if (analysis.analysis.actions.length > 0) {
                console.log(`Actions: ${analysis.analysis.actions.map(a => a.action).join(', ')}`);
            }
            
            if (analysis.analysis.roles.length > 0) {
                console.log(`Roles: ${analysis.analysis.roles.map(r => r.role).join(', ')}`);
            }

            console.log(`\n🎯 Pattern Matches: ${analysis.matches.recommendations.length}`);
            console.log(`Overall Confidence: ${Math.round(analysis.matches.confidence * 100)}%`);

            if (analysis.recommendations.length > 0) {
                console.log('\n🔗 Top Recommendations:');
                analysis.recommendations.forEach((rec, index) => {
                    console.log(`   ${index + 1}. ${rec.type} (${rec.score}%): ${rec.pattern}`);
                });
            }

            if (analysis.matches.reasoning.length > 0) {
                console.log('\n🧠 AI Reasoning:');
                analysis.matches.reasoning.forEach(reason => {
                    console.log(`   • ${reason}`);
                });
            }

        } catch (error) {
            console.error('❌ Error:', error.message);
            process.exit(1);
        }
    });

/**
 * Interactive command - interactive mode
 */
program
    .command('interactive')
    .alias('i')
    .description('Interactive mode for continuous requirement processing')
    .option('-o, --output <path>', 'Output directory', './SBS_Automation')
    .action(async (options) => {
        try {
            console.log('🎮 Auto Coder - Interactive Mode');
            console.log('=================================');
            console.log('Enter requirements and get instant analysis and generation.');
            console.log('Commands: /analyze <text>, /generate <text>, /stats, /quit\n');

            const autoCoder = new AutoCoder({
                outputPath: options.output
            });

            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
                prompt: 'auto-coder> '
            });

            rl.prompt();

            rl.on('line', async (input) => {
                const trimmed = input.trim();
                
                if (!trimmed) {
                    rl.prompt();
                    return;
                }

                if (trimmed === '/quit' || trimmed === '/exit') {
                    console.log('👋 Goodbye!');
                    rl.close();
                    return;
                }

                if (trimmed === '/stats') {
                    const stats = autoCoder.getStats();
                    console.log('\n📊 Session Statistics:');
                    console.log(`   Total requirements: ${stats.totalRequirements}`);
                    console.log(`   Successful generations: ${stats.successfulGenerations}`);
                    console.log(`   Success rate: ${Math.round(stats.successRate)}%`);
                    console.log(`   Average confidence: ${Math.round(stats.averageConfidence * 100)}%`);
                    rl.prompt();
                    return;
                }

                if (trimmed.startsWith('/analyze ')) {
                    const requirement = trimmed.substring(9);
                    console.log('\n🔍 Analyzing...');
                    
                    const analysis = await autoCoder.analyzeOnly(requirement);
                    console.log(`✅ Domain: ${analysis.analysis.domain}, Intent: ${analysis.analysis.intent}, Confidence: ${Math.round(analysis.matches.confidence * 100)}%`);
                    
                    rl.prompt();
                    return;
                }

                if (trimmed.startsWith('/generate ')) {
                    const requirement = trimmed.substring(10);
                    console.log('\n🎨 Generating...');
                    
                    const result = await autoCoder.generateFromRequirement(requirement);
                    if (result.success) {
                        console.log(`✅ Generated ${Object.keys(result.output.files).length} files with ${Math.round(result.confidence * 100)}% confidence`);
                    } else {
                        console.log(`❌ Generation failed: ${result.error}`);
                    }
                    
                    rl.prompt();
                    return;
                }

                // Default: analyze the input
                console.log('\n🔍 Quick analysis...');
                const analysis = await autoCoder.analyzeOnly(trimmed);
                console.log(`Domain: ${analysis.analysis.domain} | Intent: ${analysis.analysis.intent} | Confidence: ${Math.round(analysis.matches.confidence * 100)}%`);
                console.log('Use /generate <text> to create artifacts or /analyze <text> for detailed analysis');
                
                rl.prompt();
            });

            rl.on('close', () => {
                console.log('\n👋 Session ended');
                process.exit(0);
            });

        } catch (error) {
            console.error('❌ Error:', error.message);
            process.exit(1);
        }
    });

/**
 * Stats command - show framework statistics
 */
program
    .command('stats')
    .description('Show framework performance statistics')
    .action(async () => {
        try {
            const autoCoder = new AutoCoder();
            await autoCoder.initialize();
            
            const stats = autoCoder.getStats();
            
            console.log('📊 Auto Coder Framework Statistics');
            console.log('==================================');
            console.log(`Total requirements processed: ${stats.totalRequirements}`);
            console.log(`Successful generations: ${stats.successfulGenerations}`);
            console.log(`Success rate: ${Math.round(stats.successRate)}%`);
            console.log(`Average confidence: ${Math.round(stats.averageConfidence * 100)}%`);
            
            if (Object.keys(stats.domainDistribution).length > 0) {
                console.log('\nDomain Distribution:');
                Object.entries(stats.domainDistribution).forEach(([domain, count]) => {
                    console.log(`   ${domain}: ${count}`);
                });
            }
            
            if (Object.keys(stats.intentDistribution).length > 0) {
                console.log('\nIntent Distribution:');
                Object.entries(stats.intentDistribution).forEach(([intent, count]) => {
                    console.log(`   ${intent}: ${count}`);
                });
            }

        } catch (error) {
            console.error('❌ Error:', error.message);
            process.exit(1);
        }
    });

/**
 * Example commands for help
 */
program
    .command('examples')
    .description('Show example usage commands')
    .action(() => {
        console.log('📚 Auto Coder - Example Commands');
        console.log('=================================\n');
        
        console.log('🎯 Single requirement generation:');
        console.log('   auto-coder generate "As a user, I want to create a new employee record"');
        console.log('   auto-coder generate "Test login functionality" --framework playwright --browsers chromium,firefox');
        console.log('   auto-coder generate "Unit test user service" --framework jest --test-type unit\n');
        
        console.log('🧠 Framework suggestion:');
        console.log('   auto-coder suggest "Test user interface interactions"');
        console.log('   auto-coder suggest "Validate API responses" --project-path ./my-project\n');
        
        console.log('📋 Batch processing:');
        console.log('   auto-coder batch requirements.txt --output ./test-artifacts');
        console.log('   auto-coder batch user-stories.txt --confidence 0.5\n');
        
        console.log('🔍 Analysis only:');
        console.log('   auto-coder analyze "Verify payroll calculation for overtime hours"');
        console.log('   auto-coder analyze "Update client information in the system"\n');
        
        console.log('🎮 Interactive mode:');
        console.log('   auto-coder interactive');
        console.log('   auto-coder i --output ./SBS_Automation\n');
        
        console.log('📊 Statistics:');
        console.log('   auto-coder stats\n');
        
        console.log('💡 Tips:');
        console.log('   • Use descriptive requirements for better pattern matching');
        console.log('   • Include business domain terms (payroll, employee, client, etc.)');
        console.log('   • Specify actions clearly (create, update, delete, verify)');
        console.log('   • Use framework suggestion to find the best testing approach');
        console.log('   • Higher confidence thresholds produce more accurate but fewer results');
    });

// Handle unknown commands
program.on('command:*', () => {
    console.error('❌ Invalid command. Use --help to see available commands.');
    process.exit(1);
});

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
