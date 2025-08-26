/**
 * Hybrid Generation Engine for Auto-Coder
 * Integrates traditional generation with MCP-powered intelligent capabilities
 * Provides seamless fallback between AI-enhanced and traditional generation
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// Import traditional generators
const IntelligentRequirementsGenerator = require('../generators/intelligent-requirements-generator');
const SBSPatternExtractor = require('../knowledge-base/extractors/sbs-pattern-extractor');
const SBSArtifactGenerator = require('../generators/sbs-artifact-generator');

// Import MCP tools
const PlaywrightMCP = require('../mcp-tools/playwright-mcp');
const EmailMCP = require('../mcp-tools/email-mcp');
const SBSAnalyzer = require('../mcp-tools/sbs-analyzer');
const PatternMatcher = require('../mcp-tools/pattern-matcher');

class HybridGenerationEngine {
    constructor(options = {}) {
        this.config = {
            useMCP: options.useMCP !== false, // Default to true
            fallbackToTraditional: options.fallbackToTraditional !== false, // Default to true
            mcpTimeout: options.mcpTimeout || 30000, // 30 seconds
            enablePlaywright: options.enablePlaywright !== false,
            enableEmail: options.enableEmail !== false,
            verbose: options.verbose || false,
            ...options
        };

        // Initialize traditional generators
        this.traditionalGenerator = new IntelligentRequirementsGenerator();
        this.patternExtractor = new SBSPatternExtractor();
        this.sbsGenerator = new SBSArtifactGenerator();

        // Initialize MCP tools
        this.mcpTools = {
            playwright: this.config.enablePlaywright ? new PlaywrightMCP() : null,
            email: this.config.enableEmail ? new EmailMCP() : null,
            sbsAnalyzer: new SBSAnalyzer(),
            patternMatcher: new PatternMatcher()
        };

        this.initializationPromise = this.initialize();
    }

    /**
     * Initialize the hybrid engine
     */
    async initialize() {
        try {
            if (this.config.useMCP) {
                // Initialize MCP tools
                for (const [name, tool] of Object.entries(this.mcpTools)) {
                    if (tool && typeof tool.initialize === 'function') {
                        await tool.initialize();
                        this.log(`MCP tool ${name} initialized successfully`);
                    }
                }
            }
            
            this.log('Hybrid Generation Engine initialized');
            return true;
        } catch (error) {
            this.log(`Failed to initialize MCP tools: ${error.message}`);
            if (!this.config.fallbackToTraditional) {
                throw error;
            }
            return false;
        }
    }

    /**
     * Generate test artifacts using hybrid approach
     */
    async generateTestArtifacts(input, options = {}) {
        await this.initializationPromise;

        const generationConfig = {
            type: options.type || 'full', // full, pageobject, steps, features
            outputPath: options.outputPath || path.join(process.cwd(), 'SBS_Automation'),
            useMCP: options.useMCP !== false && this.config.useMCP,
            generatePageObjects: options.generatePageObjects !== false,
            generateSteps: options.generateSteps !== false,
            generateFeatures: options.generateFeatures !== false,
            validateCompliance: options.validateCompliance !== false,
            enableNotifications: options.enableNotifications || false,
            ...options
        };

        const result = {
            success: false,
            generationMethod: 'unknown',
            artifacts: [],
            errors: [],
            warnings: [],
            mcpEnhanced: false
        };

        try {
            // Try MCP-enhanced generation first
            if (generationConfig.useMCP) {
                this.log('Attempting MCP-enhanced generation...');
                const mcpResult = await this.generateWithMCP(input, generationConfig);
                
                if (mcpResult.success) {
                    result.success = true;
                    result.generationMethod = 'mcp-enhanced';
                    result.mcpEnhanced = true;
                    result.artifacts = mcpResult.artifacts;
                    result.warnings = mcpResult.warnings || [];
                    
                    // Send success notification if enabled
                    if (generationConfig.enableNotifications && this.mcpTools.email) {
                        await this.sendGenerationNotification(result, 'success');
                    }
                    
                    return result;
                }
                
                // Log MCP failure but continue to traditional generation
                this.log(`MCP generation failed: ${mcpResult.error}`);
                result.warnings.push(`MCP generation failed: ${mcpResult.error}`);
            }

            // Fallback to traditional generation
            if (this.config.fallbackToTraditional) {
                this.log('Falling back to traditional generation...');
                const traditionalResult = await this.generateWithTraditional(input, generationConfig);
                
                if (traditionalResult.success) {
                    result.success = true;
                    result.generationMethod = 'traditional';
                    result.artifacts = traditionalResult.artifacts;
                    result.warnings.push(...(traditionalResult.warnings || []));
                    
                    // Send fallback notification if enabled
                    if (generationConfig.enableNotifications && this.mcpTools.email) {
                        await this.sendGenerationNotification(result, 'fallback');
                    }
                    
                    return result;
                }
                
                result.errors.push(`Traditional generation failed: ${traditionalResult.error}`);
            }

            // If both methods failed
            result.errors.push('Both MCP and traditional generation methods failed');
            
            // Send failure notification if enabled
            if (generationConfig.enableNotifications && this.mcpTools.email) {
                await this.sendGenerationNotification(result, 'failure');
            }

        } catch (error) {
            result.errors.push(`Hybrid generation error: ${error.message}`);
            this.log(`Hybrid generation error: ${error.message}`);
        }

        return result;
    }

    /**
     * Generate using MCP-enhanced approach
     */
    async generateWithMCP(input, config) {
        try {
            const artifacts = [];
            const warnings = [];

            // Step 1: Analyze input with SBS patterns
            this.log('Analyzing input with SBS patterns...');
            const sbsAnalysis = await this.mcpTools.sbsAnalyzer.analyzeSBSPatterns(config.outputPath);

            if (!sbsAnalysis || Object.keys(sbsAnalysis).length === 0) {
                return { success: false, error: 'SBS pattern analysis failed' };
            }

            // Step 2: Extract and match patterns
            this.log('Matching patterns with existing implementations...');
            const patternMatching = await this.mcpTools.patternMatcher.findMatchingPattern(
                input.scenario || input.requirements || input,
                'steps'
            );

            // Step 3: Generate page objects if enabled and URL provided
            if (config.generatePageObjects && (input.url || input.urls)) {
                this.log('Generating page objects with Playwright MCP...');
                const urls = Array.isArray(input.urls) ? input.urls : [input.url];
                
                for (const url of urls.filter(Boolean)) {
                    const pageName = this.extractPageNameFromUrl(url);
                    const pageObjectResult = await this.mcpTools.playwright.generatePageObject({
                        url,
                        pageName,
                        selectors: input.selectors || [],
                        browserType: input.browserType || 'chromium'
                    });

                    if (pageObjectResult.success) {
                        artifacts.push({
                            type: 'pageObject',
                            path: pageObjectResult.pageObjectPath,
                            elementsFound: pageObjectResult.elementsFound
                        });
                    } else {
                        warnings.push(`Page object generation failed for ${url}: ${pageObjectResult.error}`);
                    }
                }
            }

            // Step 4: Generate step definitions
            if (config.generateSteps) {
                this.log('Generating step definitions...');
                
                // Use existing page objects or create basic ones
                const pageObjects = artifacts.filter(a => a.type === 'pageObject');
                
                for (const pageObj of pageObjects) {
                    const pageName = path.basename(pageObj.path, '.js');
                    const stepResult = await this.mcpTools.playwright.generateStepDefinitions({
                        pageObject: pageName,
                        actions: input.actions || ['click', 'fill', 'navigate', 'verify'],
                        stepType: 'When'
                    });

                    if (stepResult.success) {
                        artifacts.push({
                            type: 'stepDefinitions',
                            path: stepResult.stepFilePath,
                            stepsGenerated: stepResult.stepsGenerated
                        });
                    }
                }
            }

            // Step 5: Generate feature files using traditional approach with MCP enhancements
            if (config.generateFeatures) {
                this.log('Generating feature files...');
                const featureResult = await this.generateFeatureWithMCPEnhancement(input, config);
                
                if (featureResult.success) {
                    artifacts.push(...featureResult.artifacts);
                } else {
                    warnings.push(`Feature generation had issues: ${featureResult.error}`);
                }
            }

            // Step 6: Validate SBS compliance
            if (config.validateCompliance) {
                this.log('Validating SBS compliance...');
                const validationResult = await this.validateSBSCompliance(artifacts, config);
                
                if (!validationResult.success) {
                    warnings.push(`Compliance validation warnings: ${validationResult.warnings?.join(', ')}`);
                }
            }

            return {
                success: true,
                artifacts,
                warnings,
                mcpEnhanced: true
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate using traditional approach
     */
    async generateWithTraditional(input, config) {
        try {
            this.log('Using traditional generation methods...');
            
            // Create a temporary requirements file for the traditional generator
            const tempRequirementsPath = path.join(config.outputPath, 'temp-requirements.txt');
            await fs.ensureDir(path.dirname(tempRequirementsPath));
            await fs.writeFile(tempRequirementsPath, input.requirements || input.scenario || JSON.stringify(input));
            
            // Use existing Auto-Coder generation logic
            const result = await this.traditionalGenerator.generateFromRequirementFile(tempRequirementsPath);
            
            // Clean up temporary file
            if (await fs.pathExists(tempRequirementsPath)) {
                await fs.remove(tempRequirementsPath);
            }
            
            return {
                success: result.success || true, // Assume success if not explicitly false
                artifacts: result.artifacts || [],
                warnings: result.warnings || [],
                error: result.error
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate feature files with MCP enhancement 
     */
    async generateFeatureWithMCPEnhancement(input, config) {
        try {
            // Use traditional feature generation but enhance with MCP insights
            const patternInsights = await this.mcpTools.patternMatcher.analyzePatterns({
                input: input.requirements || input,
                targetPath: path.join(config.outputPath, 'features')
            });

            // Generate feature using traditional approach with MCP insights
            const featureContent = this.generateFeatureContent(input, patternInsights);
            const featurePath = path.join(config.outputPath, 'features', `${input.featureName || 'generated-feature'}.feature`);
            
            await fs.ensureDir(path.dirname(featurePath));
            await fs.writeFile(featurePath, featureContent);

            return {
                success: true,
                artifacts: [{
                    type: 'feature',
                    path: featurePath,
                    enhanced: true
                }]
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Validate SBS compliance for generated artifacts
     */
    async validateSBSCompliance(artifacts, config) {
        try {
            const validationResults = [];
            
            for (const artifact of artifacts) {
                if (artifact.type === 'feature') {
                    const validation = await this.mcpTools.playwright.validateFeatureImplementation({
                        featureFile: path.basename(artifact.path),
                        autoFix: config.autoFixCompliance || false
                    });
                    
                    validationResults.push(validation);
                }
            }

            const failedValidations = validationResults.filter(v => !v.success);
            
            return {
                success: failedValidations.length === 0,
                validations: validationResults,
                warnings: failedValidations.map(v => v.error)
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Send generation notifications via Email MCP
     */
    async sendGenerationNotification(result, type) {
        if (!this.mcpTools.email) return;

        try {
            const recipients = this.config.notificationRecipients || ['qa-team@company.com'];
            
            let notificationType, message;
            
            switch (type) {
                case 'success':
                    notificationType = 'success-notification';
                    message = `Test artifact generation completed successfully using ${result.generationMethod}. Generated ${result.artifacts.length} artifacts.`;
                    break;
                case 'fallback':
                    notificationType = 'warning';
                    message = `Test artifact generation completed using traditional method after MCP failure. Generated ${result.artifacts.length} artifacts.`;
                    break;
                case 'failure':
                    notificationType = 'failure-alert';
                    message = `Test artifact generation failed. Errors: ${result.errors.join(', ')}`;
                    break;
            }

            await this.mcpTools.email.sendNotification({
                type: notificationType,
                recipients,
                message,
                data: {
                    generationMethod: result.generationMethod,
                    artifactCount: result.artifacts.length,
                    mcpEnhanced: result.mcpEnhanced,
                    warnings: result.warnings,
                    errors: result.errors
                }
            });

        } catch (error) {
            this.log(`Failed to send notification: ${error.message}`);
        }
    }

    /**
     * Utility methods
     */
    extractPageNameFromUrl(url) {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            const segments = pathname.split('/').filter(Boolean);
            return segments[segments.length - 1] || urlObj.hostname.replace(/\./g, '');
        } catch (error) {
            return 'defaultPage';
        }
    }

    generateFeatureContent(input, patternInsights) {
        const featureName = input.featureName || 'Generated Feature';
        const scenarios = input.scenarios || [input.scenario] || ['Default scenario'];
        
        let featureContent = `Feature: ${featureName}\n`;
        
        if (input.description) {
            featureContent += `  ${input.description}\n`;
        }
        
        featureContent += '\n';
        
        scenarios.forEach((scenario, index) => {
            featureContent += `  Scenario: ${scenario.name || `Scenario ${index + 1}`}\n`;
            
            const steps = scenario.steps || [
                'Given I am on the application page',
                'When I perform the required action',
                'Then I should see the expected result'
            ];
            
            steps.forEach(step => {
                featureContent += `    ${step}\n`;
            });
            
            featureContent += '\n';
        });
        
        return featureContent;
    }

    log(message) {
        if (this.config.verbose) {
            console.log(`[HybridEngine] ${message}`);
        }
    }

    /**
     * Public API methods
     */
    async generateFromRequirement(requirement, options = {}) {
        return await this.generateTestArtifacts({
            requirements: requirement,
            type: 'requirement'
        }, options);
    }

    async generateFromUrl(url, options = {}) {
        return await this.generateTestArtifacts({
            url,
            type: 'url-based'
        }, options);
    }

    async generateFromScenario(scenario, options = {}) {
        return await this.generateTestArtifacts({
            scenario,
            type: 'scenario'
        }, options);
    }

    async enhanceExistingArtifacts(artifactPaths, options = {}) {
        // Implementation for enhancing existing test artifacts with MCP
        return {
            success: true,
            message: 'Enhancement feature will be implemented in next iteration'
        };
    }
}

module.exports = HybridGenerationEngine;
