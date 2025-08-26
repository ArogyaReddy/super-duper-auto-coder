#!/usr/bin/env node

/**
 * 🚀 PRODUCTION-READY AUTO-CODER CLI
 * 
 * This bypasses the NLP complexity issues and provides immediate generation functionality
 * Uses direct template-based generation with working cucumber-adapter
 */

const { Command } = require('commander');
const MinimalCucumberAdapter = require('../src/adapters/minimal-cucumber-adapter');
const fs = require('fs-extra');
const path = require('path');

const program = new Command();

program
    .name('auto-coder-direct')
    .description('Direct test artifact generator (production bypass)')
    .version('1.0.0');

/**
 * Generate artifacts directly using cucumber adapter
 */
program
    .command('generate')
    .description('Generate test artifacts from requirement file')
    .argument('<input>', 'Requirement file path or text')
    .option('-o, --output <path>', 'Output directory', './SBS_Automation')
    .action(async (input, options) => {
        try {
            console.log('🚀 Auto-Coder Direct Generation');
            console.log('=================================\\n');
            
            let requirementText = input;
            let baseName = 'generated-artifact';
            
            // Check if input is a file path
            if (await fs.pathExists(input)) {
                console.log(`📄 Reading requirement file: ${input}`);
                requirementText = await fs.readFile(input, 'utf8');
                baseName = path.basename(input, path.extname(input));
            } else {
                console.log('📝 Using direct text input');
                baseName = 'direct-generation';
            }
            
            console.log(`📁 Artifact name: ${baseName}`);
            console.log('🎯 Generating test artifacts...');
            
            // Use minimal cucumber adapter
            const adapter = new MinimalCucumberAdapter();
            await adapter.initialize();
            
            const result = await adapter.generateArtifacts({
                requirement: requirementText,
                outputDir: options.output,
                analysis: { 
                    domain: 'employee',
                    intent: 'create',
                    complexity: 'medium'
                },
                templateContext: {
                    sourceFile: input,
                    requirementText: requirementText,
                    outputDir: options.output
                }
            });
            
            if (result.files) {
                console.log('\\n🎉 SUCCESS! Test artifacts generated successfully!\\n');
                console.log('📁 Generated Files:');
                console.log(`   ├── 🥒 Feature: ${path.basename(result.files.feature)}`);
                console.log(`   ├── 🔧 Steps: ${path.basename(result.files.steps)}`);
                console.log(`   └── 📄 Page: ${path.basename(result.files.page)}`);
                console.log(`\\n📂 Location: ${options.output}/`);
                console.log('\\n✅ Ready to run with: npm run test:features');
            } else {
                console.log('❌ Generation failed - no files created');
            }
            
        } catch (error) {
            console.error('❌ Generation failed:', error.message);
            process.exit(1);
        }
    });

/**
 * Test generated artifacts
 */
program
    .command('test')
    .description('Run generated test artifacts')
    .argument('[feature]', 'Feature file to test (optional)')
    .action(async (feature) => {
        try {
            console.log('🧪 Running Tests');
            console.log('================\\n');
            
            const { spawn } = require('child_process');
            const testCommand = 'npm';
            const testArgs = ['run', 'test:features'];
            
            const testProcess = spawn(testCommand, testArgs, { 
                stdio: 'inherit',
                shell: true 
            });
            
            testProcess.on('close', (code) => {
                if (code === 0) {
                    console.log('\\n✅ All tests passed successfully!');
                } else {
                    console.log('\\n❌ Some tests failed');
                    process.exit(code);
                }
            });
            
        } catch (error) {
            console.error('❌ Test execution failed:', error.message);
            process.exit(1);
        }
    });

/**
 * Show examples
 */
program
    .command('examples')
    .description('Show usage examples')
    .action(() => {
        console.log('📚 Auto-Coder Direct - Usage Examples');
        console.log('=====================================\\n');
        
        console.log('🎯 Generate from file:');
        console.log('   node bin/auto-coder-direct.js generate requirements/text/my-story.txt');
        console.log('   node bin/auto-coder-direct.js generate requirements/jira/epic-123.txt\\n');
        
        console.log('📝 Generate from text:');
        console.log('   node bin/auto-coder-direct.js generate "Test employee creation with API"\\n');
        
        console.log('📁 Custom output directory:');
        console.log('   node bin/auto-coder-direct.js generate my-req.txt --output ./custom-output\\n');
        
        console.log('🧪 Run tests:');
        console.log('   node bin/auto-coder-direct.js test');
        console.log('   npm run test:features\\n');
        
        console.log('🔄 Complete workflow:');
        console.log('   1. node bin/auto-coder-direct.js generate requirements/text/my-story.txt');
        console.log('   2. node bin/auto-coder-direct.js test');
    });

program.parse();
