/**
 * Input Type Manager - Routes different input types to appropriate adapters
 * Handles text, API cURL, Playwright recording, JIRA, images, and other input sources
 */

const fs = require('fs-extra');
const path = require('path');
const AutoCoder = require('../auto-coder');
const ApiCurlAdapter = require('./api-curl-adapter');
const PlaywrightCodeGenAdapter = require('./playwright-codegen-adapter');

class InputTypeManager {
    constructor() {
        this.initialized = false;
        this.adapters = new Map();
        this.autoCoder = new AutoCoder();
    }

    async initialize() {
        if (this.initialized) return;

        // Initialize AutoCoder
        await this.autoCoder.initialize();

        // Initialize adapters
        this.adapters.set('text', this.autoCoder);
        this.adapters.set('markdown', this.autoCoder);
        this.adapters.set('curl', new ApiCurlAdapter());
        this.adapters.set('api', new ApiCurlAdapter());
        this.adapters.set('record', new PlaywrightCodeGenAdapter());
        this.adapters.set('codegen', new PlaywrightCodeGenAdapter());

        // Initialize all adapters
        for (const [type, adapter] of this.adapters) {
            if (adapter.initialize && typeof adapter.initialize === 'function') {
                await adapter.initialize();
            }
        }

        this.initialized = true;
    }

    /**
     * Detect input type from file path or content
     */
    detectInputType(filePath) {
        const extension = path.extname(filePath).toLowerCase();
        const basename = path.basename(filePath).toLowerCase();
        
        // Priority 1: Detect by file location or name patterns (more specific)
        if (filePath.includes('/curl/') || filePath.includes('\\curl\\') || basename.includes('curl')) {
            return 'curl';
        }
        
        if (filePath.includes('/api/') || filePath.includes('\\api\\') || basename.includes('api')) {
            return 'curl';
        }
        
        if (filePath.includes('/record/') || filePath.includes('\\record\\') || basename.includes('record')) {
            return 'record';
        }
        
        if (filePath.includes('/images/') || filePath.includes('\\images\\')) {
            return 'images';
        }
        
        if (filePath.includes('/jira/') || filePath.includes('\\jira\\')) {
            return 'jira';
        }
        
        // Priority 2: Detect by file extension (less specific)
        if (extension === '.txt' || extension === '.md') {
            return 'text';
        }
        
        // Default to text
        return 'text';
    }

    /**
     * Process input file based on detected or specified type
     */
    async processInput(filePath, inputType = null, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // Detect input type if not specified
            const detectedType = inputType || this.detectInputType(filePath);
            
            console.log(`📋 Processing ${detectedType} input: ${filePath}`);

            // Route to appropriate adapter
            switch (detectedType) {
                case 'text':
                case 'markdown':
                    return await this.processTextInput(filePath, options);
                
                case 'curl':
                case 'api':
                    return await this.processCurlInput(filePath, options);
                
                case 'record':
                case 'codegen':
                    return await this.processRecordedInput(filePath, options);
                
                case 'jira':
                    return await this.processJiraInput(filePath, options);
                
                case 'images':
                    return await this.processImageInput(filePath, options);
                
                default:
                    // Fallback to text processing
                    console.log(`⚠️ Unknown input type '${detectedType}', falling back to text processing`);
                    return await this.processTextInput(filePath, options);
            }

        } catch (error) {
            console.error(`❌ Failed to process input: ${error.message}`);
            return {
                success: false,
                error: error.message,
                inputType: detectedType,
                filePath: filePath
            };
        }
    }

    /**
     * Process text/markdown files
     */
    async processTextInput(filePath, options = {}) {
        try {
            console.log('📄 Processing text/markdown input...');
            
            const result = await this.autoCoder.generateFromFile(filePath, options);
            
            if (!result.success) {
                return {
                    success: false,
                    inputType: 'text',
                    error: result.error
                };
            }

            // Extract artifacts from AutoCoder result structure
            const artifacts = {
                features: [],
                steps: [],
                pages: [],
                tests: []
            };

            // AutoCoder saves files and returns them in result.output.files
            if (result.output && result.output.files) {
                // Convert file paths to artifact structure expected by writeArtifacts
                for (const [type, filePath] of Object.entries(result.output.files)) {
                    const content = await fs.readFile(filePath, 'utf8');
                    const filename = path.basename(filePath);
                    
                    if (type === 'feature') {
                        artifacts.features.push({ filename, content });
                    } else if (type === 'steps') {
                        artifacts.steps.push({ filename, content });
                    } else if (type === 'page') {
                        artifacts.pages.push({ filename, content });
                    } else if (type === 'test') {
                        artifacts.tests.push({ filename, content });
                    }
                }
            }

            // ✅ CRITICAL FIX: Validate artifacts are properly extracted
            if (!artifacts.features.length && !artifacts.steps.length && !artifacts.pages.length) {
                throw new Error('Artifact extraction failed - no valid artifacts generated');
            }

            console.log(`✅ Artifacts extracted: ${artifacts.features.length} features, ${artifacts.steps.length} steps, ${artifacts.pages.length} pages`);
            
            return {
                success: true,
                inputType: 'text',
                artifacts: artifacts,
                confidence: result.confidence || 0,
                files: result.output?.files || {}
            };

        } catch (error) {
            return {
                success: false,
                inputType: 'text',
                error: error.message
            };
        }
    }

    /**
     * Process cURL/API files
     */
    async processCurlInput(filePath, options = {}) {
        try {
            console.log('🌐 Processing API cURL input...');
            
            const curlAdapter = this.adapters.get('curl');
            
            // Parse cURL commands from file
            const parseResult = await curlAdapter.parseCurlFile(filePath);
            
            if (!parseResult.success) {
                throw new Error(parseResult.error);
            }
            
            console.log(`📡 Found ${parseResult.count} cURL commands`);
            
            // Generate test artifacts
            const artifacts = await curlAdapter.generateTestArtifacts(parseResult.commands, options);
            
            return {
                success: true,
                inputType: 'curl',
                artifacts: artifacts,
                curlCommands: parseResult.commands,
                count: parseResult.count
            };

        } catch (error) {
            return {
                success: false,
                inputType: 'curl', 
                error: error.message
            };
        }
    }

    /**
     * Process recorded Playwright files
     */
    async processRecordedInput(filePath, options = {}) {
        try {
            console.log('🎬 Processing Playwright recording...');
            
            const recordAdapter = this.adapters.get('record');
            
            // Process the recorded file
            const result = await recordAdapter.processRecording(filePath, options);
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            console.log(`🎯 Analyzed ${result.analysis.actions.length} recorded actions`);
            
            return {
                success: true,
                inputType: 'record',
                artifacts: result.artifacts,
                analysis: result.analysis
            };

        } catch (error) {
            return {
                success: false,
                inputType: 'record',
                error: error.message
            };
        }
    }

    /**
     * Process JIRA files (placeholder - route to text for now)
     */
    async processJiraInput(filePath, options = {}) {
        console.log('🎫 Processing JIRA input (using text adapter)...');
        
        // For now, route JIRA processing to text adapter
        // TODO: Implement dedicated JIRA adapter
        const result = await this.processTextInput(filePath, options);
        result.inputType = 'jira';
        
        return result;
    }

    /**
     * Process image files (placeholder - route to text for now)
     */
    async processImageInput(filePath, options = {}) {
        console.log('🖼️ Processing image input (using text adapter)...');
        
        // For now, route image processing to text adapter
        // TODO: Implement dedicated image/OCR adapter
        const result = await this.processTextInput(filePath, options);
        result.inputType = 'images';
        
        return result;
    }

    /**
     * Write generated artifacts to files
     */
    async writeArtifacts(artifacts, outputDir) {
        try {
            await fs.ensureDir(outputDir);
            
            const writtenFiles = [];
            
            // Write features
            if (artifacts.features && artifacts.features.length > 0) {
                const featuresDir = path.join(outputDir, 'features');
                await fs.ensureDir(featuresDir);
                
                for (const feature of artifacts.features) {
                    const filePath = path.join(featuresDir, feature.filename);
                    await fs.writeFile(filePath, feature.content);
                    writtenFiles.push(filePath);
                }
            }
            
            // Write step definitions
            if (artifacts.steps && artifacts.steps.length > 0) {
                const stepsDir = path.join(outputDir, 'steps');
                await fs.ensureDir(stepsDir);
                
                for (const step of artifacts.steps) {
                    const filePath = path.join(stepsDir, step.filename);
                    await fs.writeFile(filePath, step.content);
                    writtenFiles.push(filePath);
                }
            }
            
            // Write page objects
            if (artifacts.pages && artifacts.pages.length > 0) {
                const pagesDir = path.join(outputDir, 'pages');
                await fs.ensureDir(pagesDir);
                
                for (const page of artifacts.pages) {
                    const filePath = path.join(pagesDir, page.filename);
                    await fs.writeFile(filePath, page.content);
                    writtenFiles.push(filePath);
                }
            }
            
            // Write tests
            if (artifacts.tests && artifacts.tests.length > 0) {
                const testsDir = path.join(outputDir, 'tests');
                await fs.ensureDir(testsDir);
                
                for (const test of artifacts.tests) {
                    const filePath = path.join(testsDir, test.filename);
                    await fs.writeFile(filePath, test.content);
                    writtenFiles.push(filePath);
                }
            }
            
            return {
                success: true,
                files: writtenFiles,
                count: writtenFiles.length
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get supported input types
     */
    getSupportedTypes() {
        return [
            {
                type: 'text',
                description: 'Text files (.txt, .md)',
                adapter: 'AutoCoder',
                supported: true
            },
            {
                type: 'curl',
                description: 'API cURL commands',
                adapter: 'ApiCurlAdapter',
                supported: true
            },
            {
                type: 'record',
                description: 'Playwright recordings',
                adapter: 'PlaywrightCodeGenAdapter',
                supported: true
            },
            {
                type: 'jira',
                description: 'JIRA stories & requirements',
                adapter: 'TextAdapter (fallback)',
                supported: false
            },
            {
                type: 'images',
                description: 'Images & screenshots',
                adapter: 'TextAdapter (fallback)',
                supported: false
            },
            {
                type: 'confluence',
                description: 'Confluence pages',
                adapter: 'Not implemented',
                supported: false
            }
        ];
    }

    /**
     * Start Playwright recording session
     */
    async startPlaywrightRecording(options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        const recordAdapter = this.adapters.get('record');
        return await recordAdapter.startRecording(options);
    }

    /**
     * Stop Playwright recording session
     */
    async stopPlaywrightRecording() {
        const recordAdapter = this.adapters.get('record');
        return await recordAdapter.stopRecording();
    }

    /**
     * Get recording status
     */
    getRecordingStatus() {
        const recordAdapter = this.adapters.get('record');
        return recordAdapter.getRecordingStatus();
    }
}

module.exports = InputTypeManager;
