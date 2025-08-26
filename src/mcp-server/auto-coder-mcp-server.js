#!/usr/bin/env node

/**
 * Auto-Coder MCP Server
 * Model Context Protocol server for intelligent test artifact generation
 * Integrates with VS Code and other MCP clients for enhanced Auto-Coder functionality
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

// Import our MCP tools
const { SBSAnalyzer } = require('../mcp-tools/sbs-analyzer.js');
const { PatternMatcher } = require('../mcp-tools/pattern-matcher.js');
const PlaywrightMCP = require('../mcp-tools/playwright-mcp.js');
const EmailMCP = require('../mcp-tools/email-mcp.js');
const { StepReuseEngine } = require('../mcp-tools/step-reuse-engine.js');
const { PageObjectEnhancer } = require('../mcp-tools/page-object-enhancer.js');
const { SBSComplianceValidator } = require('../mcp-tools/sbs-compliance-validator.js');
const { TestExecutor } = require('../mcp-tools/test-executor.js');

class AutoCoderMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'auto-coder-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    // Initialize MCP tools
    this.sbsAnalyzer = new SBSAnalyzer();
    this.patternMatcher = new PatternMatcher();
    this.playwrightMCP = new PlaywrightMCP();
    this.emailMCP = new EmailMCP();
    this.stepReuse = new StepReuseEngine();
    this.pageObjectEnhancer = new PageObjectEnhancer();
    this.complianceValidator = new SBSComplianceValidator();
    this.testExecutor = new TestExecutor();

    this.setupToolHandlers();
    this.setupResourceHandlers();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'analyze_sbs_patterns',
            description: 'Analyze SBS_Automation framework patterns for compliance',
            inputSchema: {
              type: 'object',
              properties: {
                targetPath: { type: 'string', description: 'Path to SBS_Automation directory' }
              },
              required: ['targetPath']
            }
          },
          {
            name: 'find_matching_steps',
            description: 'Find existing step definitions that match new scenario requirements',
            inputSchema: {
              type: 'object',
              properties: {
                scenario: { type: 'string', description: 'New scenario description' },
                stepsPath: { type: 'string', description: 'Path to steps directory' }
              },
              required: ['scenario', 'stepsPath']
            }
          },
          {
            name: 'generate_test_artifacts',
            description: 'Generate complete test artifacts (feature, steps, page objects) with SBS compliance',
            inputSchema: {
              type: 'object',
              properties: {
                requirement: { type: 'string', description: 'Test requirement or user story' },
                module: { type: 'string', description: 'SBS module name (e.g., runMod, employeeManagement)' },
                useMCP: { type: 'boolean', description: 'Use MCP-enhanced generation', default: true }
              },
              required: ['requirement', 'module']
            }
          },
          {
            name: 'validate_sbs_compliance',
            description: 'Validate generated artifacts against SBS_Automation standards',
            inputSchema: {
              type: 'object',
              properties: {
                artifactsPath: { type: 'string', description: 'Path to generated artifacts' }
              },
              required: ['artifactsPath']
            }
          },
          {
            name: 'execute_test',
            description: 'Execute generated test and provide feedback',
            inputSchema: {
              type: 'object',
              properties: {
                testTag: { type: 'string', description: 'Test tag to execute' },
                environment: { type: 'string', description: 'Test environment (iat, fit, prod)', default: 'iat' }
              },
              required: ['testTag']
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'analyze_sbs_patterns':
            return await this.handleAnalyzeSBSPatterns(args);
          
          case 'find_matching_steps':
            return await this.handleFindMatchingSteps(args);
          
          case 'generate_test_artifacts':
            return await this.handleGenerateTestArtifacts(args);
          
          case 'validate_sbs_compliance':
            return await this.handleValidateSBSCompliance(args);
          
          case 'execute_test':
            return await this.handleExecuteTest(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing tool ${name}: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  setupResourceHandlers() {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'auto-coder://sbs-patterns',
            name: 'SBS Automation Patterns',
            description: 'Current SBS_Automation framework patterns and standards',
            mimeType: 'application/json'
          },
          {
            uri: 'auto-coder://steps',
            name: 'Available Steps',
            description: 'All available step definitions in SBS_Automation steps/ directory',
            mimeType: 'application/json'
          },
          {
            uri: 'auto-coder://pages',
            name: 'Available Pages',
            description: 'All available page objects in SBS_Automation pages/ directory',
            mimeType: 'application/json'
          }
        ]
      };
    });

    // Handle resource reads
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case 'auto-coder://sbs-patterns':
          const patterns = await this.sbsAnalyzer.analyzeSBSPatterns();
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(patterns, null, 2)
              }
            ]
          };

        case 'auto-coder://steps':
          const steps = await this.stepReuse.analyzeExistingSteps();
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(steps, null, 2)
              }
            ]
          };

        case 'auto-coder://pages':
          const pageObjects = await this.pageObjectEnhancer.analyzeExistingPageObjects();
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(pageObjects, null, 2)
              }
            ]
          };

        default:
          throw new Error(`Unknown resource: ${uri}`);
      }
    });
  }

  // Tool handler implementations
  async handleAnalyzeSBSPatterns(args) {
    const patterns = await this.sbsAnalyzer.analyzeSBSPatterns(args.targetPath);
    return {
      content: [
        {
          type: 'text',
          text: `📊 SBS Patterns Analysis Complete\n\n${JSON.stringify(patterns, null, 2)}`
        }
      ]
    };
  }

  async handleFindMatchingSteps(args) {
    const matches = await this.stepReuse.findOptimalStepMatch(args.scenario, args.stepsPath);
    return {
      content: [
        {
          type: 'text',
          text: `🔍 Found ${matches.length} matching steps:\n\n${JSON.stringify(matches, null, 2)}`
        }
      ]
    };
  }

  async handleGenerateTestArtifacts(args) {
    const artifacts = await this.generateEnhancedArtifacts(args);
    return {
      content: [
        {
          type: 'text',
          text: `✅ Generated test artifacts:\n\n${JSON.stringify(artifacts, null, 2)}`
        }
      ]
    };
  }

  async handleValidateSBSCompliance(args) {
    const validation = await this.complianceValidator.validateGeneratedArtifacts(args.artifactsPath);
    return {
      content: [
        {
          type: 'text',
          text: `🎯 SBS Compliance Validation:\n\n${JSON.stringify(validation, null, 2)}`
        }
      ]
    };
  }

  async handleExecuteTest(args) {
    const results = await this.testExecutor.executeGeneratedTest(args);
    return {
      content: [
        {
          type: 'text',
          text: `🚀 Test Execution Results:\n\n${JSON.stringify(results, null, 2)}`
        }
      ]
    };
  }

  async generateEnhancedArtifacts(args) {
    // MCP-enhanced generation process
    const sbsPatterns = await this.sbsAnalyzer.analyzeSBSPatterns();
    const existingSteps = await this.stepReuse.analyzeExistingSteps();
    const pageObjects = await this.pageObjectEnhancer.analyzeExistingPageObjects();

    // Generate artifacts with AI assistance
    const artifacts = {
      feature: await this.generateFeatureFile(args.requirement, args.module, sbsPatterns),
      steps: await this.generateStepDefinitions(args.requirement, existingSteps, sbsPatterns),
      pageObject: await this.generatePageObject(args.requirement, pageObjects, sbsPatterns),
      testData: await this.generateTestData(args.requirement, args.module, sbsPatterns)
    };

    // Validate and auto-fix compliance issues
    const validated = await this.complianceValidator.validateGeneratedArtifacts(artifacts);
    if (!validated.allPassed) {
      artifacts = await this.complianceValidator.autoFixComplianceIssues(artifacts, validated);
    }

    return artifacts;
  }

  async generateFeatureFile(requirement, module, patterns) {
    // Enhanced feature file generation with SBS compliance
    return {
      path: `features/${module}/${this.extractFeatureName(requirement)}.feature`,
      content: `# Generated with Auto-Coder MCP\n# Requirement: ${requirement}\n\n@testUseMcp\nFeature: ${this.extractFeatureName(requirement)}\n\n  Scenario: ${this.extractScenarioName(requirement)}\n    # Generated steps will be added here`
    };
  }

  async generateStepDefinitions(requirement, existingSteps, patterns) {
    // Reuse existing steps where possible, create new ones only when necessary
    return {
      path: `steps/${this.extractModulePath(requirement)}-steps.js`,
      content: '// Generated step definitions with maximum reuse'
    };
  }

  async generatePageObject(requirement, pageObjects, patterns) {
    // Enhanced page object with SBS patterns
    return {
      path: `pages/${this.extractModulePath(requirement)}-page.js`,
      content: '// Generated page object following SBS patterns'
    };
  }

  async generateTestData(requirement, module, patterns) {
    // Generate test data following SBS data patterns
    return {
      path: `data/iat/${module}/${this.extractFeatureName(requirement)}_data.json`,
      content: '// Generated test data'
    };
  }

  // Utility methods
  extractFeatureName(requirement) {
    // Extract feature name from requirement
    return requirement.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  extractScenarioName(requirement) {
    // Extract scenario name from requirement
    return requirement;
  }

  extractModulePath(requirement) {
    // Extract module path from requirement
    return requirement.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🚀 Auto-Coder MCP Server started successfully');
  }
}

// Start the server
if (require.main === module) {
  const server = new AutoCoderMCPServer();
  server.start().catch((error) => {
    console.error('❌ Failed to start Auto-Coder MCP Server:', error);
    process.exit(1);
  });
}

module.exports = { AutoCoderMCPServer };
