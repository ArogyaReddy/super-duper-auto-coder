/**
 * Visual Workflow Automation
 * 
 * Provides visual workflow builder for automating template generation processes.
 * Follows SBS_Automation patterns for workflow composition and execution.
 * 
 * Phase 3.3.5: Visual Workflow Automation
 */

const fs = require('fs-extra');
const path = require('path');
const EventEmitter = require('events');

class VisualWorkflowAutomation extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.config = {
            // Workflow settings
            workflows: {
                enableVisualBuilder: options.enableVisualBuilder !== false,
                maxWorkflowNodes: options.maxWorkflowNodes || 100,
                executionTimeout: options.executionTimeout || 300000, // 5 minutes
                allowParallelExecution: options.allowParallelExecution !== false
            },
            
            // Node types and capabilities
            nodeTypes: {
                built_in: this.getBuiltInNodeTypes(),
                custom: options.customNodeTypes || new Map(),
                external: options.externalNodeTypes || new Map()
            },
            
            // Execution settings
            execution: {
                enableDebugMode: options.enableDebugMode || false,
                logLevel: options.logLevel || 'info',
                retryAttempts: options.retryAttempts || 3,
                retryDelay: options.retryDelay || 1000
            },
            
            // Storage settings
            storage: {
                workflowDirectory: options.workflowDirectory || path.join(process.cwd(), 'workflows'),
                autoSave: options.autoSave !== false,
                versionControl: options.versionControl !== false
            }
        };
        
        // Internal state
        this.workflows = new Map();
        this.activeExecutions = new Map();
        this.nodeRegistry = new Map();
        this.executionHistory = new Map();
        this.workflowTemplates = new Map();
        
        // Initialize built-in nodes
        this.initializeBuiltInNodes();
        
        console.log('⚡ Visual Workflow Automation initialized');
    }

    /**
     * Initialize workflow automation
     */
    async initialize() {
        console.log('⚡ Initializing visual workflow automation...');
        
        try {
            // Setup storage directory
            await this.setupWorkflowStorage();
            
            // Load existing workflows
            await this.loadExistingWorkflows();
            
            // Register default workflow templates
            this.registerDefaultWorkflowTemplates();
            
            console.log(`✅ Workflow automation ready (${this.workflows.size} workflows loaded)`);
            this.emit('workflow-automation-ready');
            
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize workflow automation:', error.message);
            throw error;
        }
    }

    /**
     * Create a new workflow
     */
    async createWorkflow(workflowConfig = {}) {
        const workflowId = this.generateWorkflowId();
        
        const workflow = {
            id: workflowId,
            name: workflowConfig.name || 'New Workflow',
            description: workflowConfig.description || '',
            version: '1.0.0',
            
            // Workflow structure
            nodes: new Map(),
            connections: new Map(),
            
            // Execution metadata
            metadata: {
                created: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                author: workflowConfig.author || 'Auto-Coder Framework',
                tags: workflowConfig.tags || []
            },
            
            // Execution settings
            settings: {
                enableParallel: workflowConfig.enableParallel !== false,
                timeout: workflowConfig.timeout || this.config.workflows.executionTimeout,
                retryPolicy: workflowConfig.retryPolicy || 'linear',
                errorHandling: workflowConfig.errorHandling || 'stop'
            },
            
            // State
            state: {
                isValid: false,
                hasErrors: false,
                executionCount: 0,
                lastExecuted: null
            }
        };
        
        this.workflows.set(workflowId, workflow);
        
        console.log(`⚡ Created workflow: ${workflowId}`);
        this.emit('workflow-created', { workflowId, workflow });
        
        return workflow;
    }

    /**
     * Add node to workflow
     */
    async addNode(workflowId, nodeConfig) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow not found: ${workflowId}`);
        }
        
        const nodeId = this.generateNodeId();
        const nodeType = this.nodeRegistry.get(nodeConfig.type);
        
        if (!nodeType) {
            throw new Error(`Unknown node type: ${nodeConfig.type}`);
        }
        
        const node = {
            id: nodeId,
            type: nodeConfig.type,
            name: nodeConfig.name || nodeType.defaultName,
            description: nodeConfig.description || '',
            
            // Node configuration
            config: {
                ...nodeType.defaultConfig,
                ...nodeConfig.config
            },
            
            // Visual properties
            visual: {
                x: nodeConfig.x || 0,
                y: nodeConfig.y || 0,
                width: nodeConfig.width || nodeType.defaultWidth || 150,
                height: nodeConfig.height || nodeType.defaultHeight || 100
            },
            
            // Execution state
            state: {
                status: 'idle', // idle, running, completed, error
                lastExecution: null,
                executionTime: 0,
                error: null
            },
            
            // Ports for connections
            inputs: nodeType.inputs || [],
            outputs: nodeType.outputs || []
        };
        
        workflow.nodes.set(nodeId, node);
        workflow.metadata.lastModified = new Date().toISOString();
        
        // Validate workflow after adding node
        await this.validateWorkflow(workflowId);
        
        console.log(`🔵 Added node to workflow ${workflowId}: ${nodeId} (${nodeConfig.type})`);
        this.emit('node-added', { workflowId, nodeId, node });
        
        return node;
    }

    /**
     * Connect nodes in workflow
     */
    async connectNodes(workflowId, fromNodeId, fromPort, toNodeId, toPort) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow not found: ${workflowId}`);
        }
        
        const fromNode = workflow.nodes.get(fromNodeId);
        const toNode = workflow.nodes.get(toNodeId);
        
        if (!fromNode || !toNode) {
            throw new Error('Source or target node not found');
        }
        
        // Validate connection
        await this.validateConnection(fromNode, fromPort, toNode, toPort);
        
        const connectionId = this.generateConnectionId();
        const connection = {
            id: connectionId,
            from: { nodeId: fromNodeId, port: fromPort },
            to: { nodeId: toNodeId, port: toPort },
            type: 'data', // data, control, event
            created: new Date().toISOString()
        };
        
        workflow.connections.set(connectionId, connection);
        workflow.metadata.lastModified = new Date().toISOString();
        
        // Validate workflow after connection
        await this.validateWorkflow(workflowId);
        
        console.log(`🔗 Connected nodes in workflow ${workflowId}: ${fromNodeId}:${fromPort} -> ${toNodeId}:${toPort}`);
        this.emit('nodes-connected', { workflowId, connectionId, connection });
        
        return connection;
    }

    /**
     * Execute workflow
     */
    async executeWorkflow(workflowId, inputData = {}, options = {}) {
        console.log(`▶️  Executing workflow: ${workflowId}`);
        
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow not found: ${workflowId}`);
        }
        
        // Validate workflow before execution
        const validation = await this.validateWorkflow(workflowId);
        if (!validation.isValid && !options.allowInvalid) {
            throw new Error(`Cannot execute invalid workflow: ${validation.errors.join(', ')}`);
        }
        
        const executionId = this.generateExecutionId();
        const execution = {
            id: executionId,
            workflowId,
            startTime: Date.now(),
            endTime: null,
            status: 'running', // running, completed, error, cancelled
            input: inputData,
            output: null,
            error: null,
            nodeResults: new Map(),
            executionOrder: []
        };
        
        this.activeExecutions.set(executionId, execution);
        
        try {
            // Create execution context
            const context = this.createExecutionContext(workflow, inputData, options);
            
            // Execute workflow
            const result = await this.executeWorkflowNodes(workflow, context, execution);
            
            // Complete execution
            execution.status = 'completed';
            execution.output = result;
            execution.endTime = Date.now();
            
            // Update workflow state
            workflow.state.executionCount++;
            workflow.state.lastExecuted = new Date().toISOString();
            
            // Store execution history
            this.storeExecutionHistory(executionId, execution);
            
            console.log(`✅ Workflow execution completed: ${workflowId} (${execution.endTime - execution.startTime}ms)`);
            this.emit('workflow-executed', { workflowId, executionId, execution, result });
            
            return result;
            
        } catch (error) {
            execution.status = 'error';
            execution.error = error.message;
            execution.endTime = Date.now();
            
            console.error(`❌ Workflow execution failed: ${workflowId}`, error.message);
            this.emit('workflow-execution-error', { workflowId, executionId, execution, error });
            
            throw error;
            
        } finally {
            this.activeExecutions.delete(executionId);
        }
    }

    /**
     * Execute workflow nodes
     */
    async executeWorkflowNodes(workflow, context, execution) {
        // Determine execution order
        const executionOrder = this.calculateExecutionOrder(workflow);
        execution.executionOrder = executionOrder;
        
        const nodeResults = new Map();
        
        for (const nodeId of executionOrder) {
            const node = workflow.nodes.get(nodeId);
            const nodeType = this.nodeRegistry.get(node.type);
            
            try {
                console.log(`🔵 Executing node: ${nodeId} (${node.type})`);
                
                node.state.status = 'running';
                const startTime = Date.now();
                
                // Prepare node input from previous nodes
                const nodeInput = this.prepareNodeInput(node, nodeResults, context);
                
                // Execute node
                const nodeResult = await this.executeNode(node, nodeType, nodeInput, context);
                
                // Store result
                nodeResults.set(nodeId, nodeResult);
                execution.nodeResults.set(nodeId, nodeResult);
                
                node.state.status = 'completed';
                node.state.lastExecution = new Date().toISOString();
                node.state.executionTime = Date.now() - startTime;
                node.state.error = null;
                
                console.log(`✅ Node completed: ${nodeId} (${node.state.executionTime}ms)`);
                this.emit('node-executed', { workflowId: workflow.id, nodeId, result: nodeResult });
                
            } catch (error) {
                node.state.status = 'error';
                node.state.error = error.message;
                
                console.error(`❌ Node execution failed: ${nodeId}`, error.message);
                this.emit('node-execution-error', { workflowId: workflow.id, nodeId, error });
                
                // Handle error based on workflow settings
                if (workflow.settings.errorHandling === 'stop') {
                    throw error;
                } else if (workflow.settings.errorHandling === 'continue') {
                    nodeResults.set(nodeId, { error: error.message });
                }
            }
        }
        
        // Determine final output
        return this.determineFinalOutput(workflow, nodeResults);
    }

    /**
     * Execute individual node
     */
    async executeNode(node, nodeType, input, context) {
        if (!nodeType.execute) {
            throw new Error(`Node type ${node.type} does not have execute function`);
        }
        
        // Create node execution context
        const nodeContext = {
            ...context,
            node,
            input,
            config: node.config
        };
        
        // Execute with timeout
        return await Promise.race([
            nodeType.execute(nodeContext),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Node execution timeout')), 
                context.timeout || 60000)
            )
        ]);
    }

    /**
     * Validate workflow
     */
    async validateWorkflow(workflowId) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow not found: ${workflowId}`);
        }
        
        const validation = {
            isValid: true,
            errors: [],
            warnings: []
        };
        
        // Check for nodes
        if (workflow.nodes.size === 0) {
            validation.errors.push('Workflow must contain at least one node');
        }
        
        // Check for cycles
        if (this.hasCycles(workflow)) {
            validation.errors.push('Workflow contains cycles');
        }
        
        // Check node configurations
        for (const [nodeId, node] of workflow.nodes) {
            const nodeType = this.nodeRegistry.get(node.type);
            if (!nodeType) {
                validation.errors.push(`Unknown node type: ${node.type} (node: ${nodeId})`);
                continue;
            }
            
            // Validate node configuration
            if (nodeType.validate) {
                try {
                    const nodeValidation = await nodeType.validate(node.config);
                    if (!nodeValidation.isValid) {
                        validation.errors.push(...nodeValidation.errors.map(e => `Node ${nodeId}: ${e}`));
                    }
                } catch (error) {
                    validation.errors.push(`Node validation failed for ${nodeId}: ${error.message}`);
                }
            }
        }
        
        // Check connections
        for (const [connectionId, connection] of workflow.connections) {
            const fromNode = workflow.nodes.get(connection.from.nodeId);
            const toNode = workflow.nodes.get(connection.to.nodeId);
            
            if (!fromNode || !toNode) {
                validation.errors.push(`Invalid connection: ${connectionId}`);
                continue;
            }
            
            // Validate port compatibility
            try {
                await this.validateConnection(fromNode, connection.from.port, toNode, connection.to.port);
            } catch (error) {
                validation.errors.push(`Connection validation failed: ${connectionId} - ${error.message}`);
            }
        }
        
        validation.isValid = validation.errors.length === 0;
        workflow.state.isValid = validation.isValid;
        workflow.state.hasErrors = validation.errors.length > 0;
        
        this.emit('workflow-validated', { workflowId, validation });
        return validation;
    }

    /**
     * Save workflow
     */
    async saveWorkflow(workflowId, filePath = null) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow not found: ${workflowId}`);
        }
        
        const savePath = filePath || path.join(
            this.config.storage.workflowDirectory,
            `${workflow.name.replace(/[^a-zA-Z0-9]/g, '_')}.workflow.json`
        );
        
        // Convert workflow to serializable format
        const serializableWorkflow = this.serializeWorkflow(workflow);
        
        // Ensure directory exists
        await fs.ensureDir(path.dirname(savePath));
        
        // Save workflow
        await fs.writeJson(savePath, serializableWorkflow, { spaces: 2 });
        
        console.log(`💾 Workflow saved: ${savePath}`);
        this.emit('workflow-saved', { workflowId, filePath: savePath });
        
        return savePath;
    }

    /**
     * Load workflow
     */
    async loadWorkflow(filePath) {
        if (!await fs.pathExists(filePath)) {
            throw new Error(`Workflow file not found: ${filePath}`);
        }
        
        const workflowData = await fs.readJson(filePath);
        const workflow = this.deserializeWorkflow(workflowData);
        
        this.workflows.set(workflow.id, workflow);
        
        console.log(`📂 Workflow loaded: ${workflow.id}`);
        this.emit('workflow-loaded', { workflowId: workflow.id, filePath });
        
        return workflow;
    }

    /**
     * Initialize built-in nodes
     */
    initializeBuiltInNodes() {
        const builtInNodes = this.getBuiltInNodeTypes();
        
        for (const [type, nodeDefinition] of builtInNodes) {
            this.nodeRegistry.set(type, nodeDefinition);
        }
        
        console.log(`🔧 Registered ${builtInNodes.size} built-in node types`);
    }

    /**
     * Get built-in node types
     */
    getBuiltInNodeTypes() {
        const nodeTypes = new Map();
        
        // Input node
        nodeTypes.set('input', {
            name: 'Input',
            category: 'io',
            description: 'Workflow input data',
            defaultName: 'Input',
            defaultConfig: {
                schema: {}
            },
            inputs: [],
            outputs: ['data'],
            execute: async (context) => {
                return context.input || {};
            }
        });
        
        // Template Generator node
        nodeTypes.set('template-generator', {
            name: 'Template Generator',
            category: 'template',
            description: 'Generate code from template',
            defaultName: 'Generate Template',
            defaultConfig: {
                templateId: '',
                framework: 'playwright',
                outputPath: ''
            },
            inputs: ['context'],
            outputs: ['generatedCode', 'metadata'],
            execute: async (context) => {
                const templateManager = context.templateManager;
                if (!templateManager) {
                    throw new Error('Template manager not available in context');
                }
                
                const { templateId, framework } = context.config;
                const inputContext = context.input.context || {};
                
                const result = await templateManager.generateTemplate(templateId, {
                    ...inputContext,
                    framework
                });
                
                return {
                    generatedCode: result.content,
                    metadata: result.metadata
                };
            },
            validate: async (config) => {
                const errors = [];
                if (!config.templateId) {
                    errors.push('Template ID is required');
                }
                return { isValid: errors.length === 0, errors };
            }
        });
        
        // File Writer node
        nodeTypes.set('file-writer', {
            name: 'File Writer',
            category: 'io',
            description: 'Write content to file',
            defaultName: 'Write File',
            defaultConfig: {
                filePath: '',
                createDirectories: true,
                overwrite: true
            },
            inputs: ['content', 'filePath'],
            outputs: ['success', 'filePath'],
            execute: async (context) => {
                const content = context.input.content || '';
                const filePath = context.input.filePath || context.config.filePath;
                
                if (!filePath) {
                    throw new Error('File path is required');
                }
                
                if (context.config.createDirectories) {
                    await fs.ensureDir(path.dirname(filePath));
                }
                
                await fs.writeFile(filePath, content, 'utf8');
                
                return {
                    success: true,
                    filePath: filePath
                };
            }
        });
        
        // Data Transformer node
        nodeTypes.set('data-transformer', {
            name: 'Data Transformer',
            category: 'data',
            description: 'Transform data using JavaScript',
            defaultName: 'Transform Data',
            defaultConfig: {
                transformFunction: 'return data;'
            },
            inputs: ['data'],
            outputs: ['transformedData'],
            execute: async (context) => {
                const data = context.input.data;
                const transformFunction = context.config.transformFunction;
                
                // Create safe execution environment
                const func = new Function('data', 'context', transformFunction);
                const result = func(data, context);
                
                return {
                    transformedData: result
                };
            }
        });
        
        // Conditional node
        nodeTypes.set('conditional', {
            name: 'Conditional',
            category: 'logic',
            description: 'Route data based on condition',
            defaultName: 'If/Else',
            defaultConfig: {
                condition: 'return data.value > 0;'
            },
            inputs: ['data'],
            outputs: ['true', 'false'],
            execute: async (context) => {
                const data = context.input.data;
                const condition = context.config.condition;
                
                const func = new Function('data', 'context', condition);
                const result = func(data, context);
                
                if (result) {
                    return { true: data };
                } else {
                    return { false: data };
                }
            }
        });
        
        // Output node
        nodeTypes.set('output', {
            name: 'Output',
            category: 'io',
            description: 'Workflow output',
            defaultName: 'Output',
            defaultConfig: {},
            inputs: ['data'],
            outputs: [],
            execute: async (context) => {
                return context.input.data || {};
            }
        });
        
        return nodeTypes;
    }

    /**
     * Utility methods
     */
    generateWorkflowId() {
        return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateNodeId() {
        return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateConnectionId() {
        return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateExecutionId() {
        return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    calculateExecutionOrder(workflow) {
        // Topological sort to determine execution order
        const visited = new Set();
        const visiting = new Set();
        const order = [];
        
        const visit = (nodeId) => {
            if (visiting.has(nodeId)) {
                throw new Error('Circular dependency detected');
            }
            if (visited.has(nodeId)) {
                return;
            }
            
            visiting.add(nodeId);
            
            // Find dependencies (incoming connections)
            for (const connection of workflow.connections.values()) {
                if (connection.to.nodeId === nodeId) {
                    visit(connection.from.nodeId);
                }
            }
            
            visiting.delete(nodeId);
            visited.add(nodeId);
            order.push(nodeId);
        };
        
        // Visit all nodes
        for (const nodeId of workflow.nodes.keys()) {
            visit(nodeId);
        }
        
        return order;
    }

    hasCycles(workflow) {
        try {
            this.calculateExecutionOrder(workflow);
            return false;
        } catch (error) {
            return true;
        }
    }

    async validateConnection(fromNode, fromPort, toNode, toPort) {
        // Check if ports exist
        if (!fromNode.outputs.includes(fromPort)) {
            throw new Error(`Output port ${fromPort} not found on node ${fromNode.id}`);
        }
        
        if (!toNode.inputs.includes(toPort)) {
            throw new Error(`Input port ${toPort} not found on node ${toNode.id}`);
        }
        
        // Additional validation could include type checking
        return true;
    }

    createExecutionContext(workflow, inputData, options) {
        return {
            workflow,
            input: inputData,
            options,
            timeout: workflow.settings.timeout,
            timestamp: new Date().toISOString(),
            // Add external services
            templateManager: options.templateManager,
            fileSystem: fs
        };
    }

    prepareNodeInput(node, nodeResults, context) {
        const input = {};
        
        // Collect input from connected nodes
        for (const connection of context.workflow.connections.values()) {
            if (connection.to.nodeId === node.id) {
                const sourceResult = nodeResults.get(connection.from.nodeId);
                if (sourceResult) {
                    input[connection.to.port] = sourceResult[connection.from.port];
                }
            }
        }
        
        // Add workflow input for input nodes
        if (node.type === 'input') {
            return context.input;
        }
        
        return input;
    }

    determineFinalOutput(workflow, nodeResults) {
        // Find output nodes
        const outputNodes = [];
        for (const [nodeId, node] of workflow.nodes) {
            if (node.type === 'output' || node.outputs.length === 0) {
                outputNodes.push(nodeId);
            }
        }
        
        if (outputNodes.length === 1) {
            return nodeResults.get(outputNodes[0]);
        } else if (outputNodes.length > 1) {
            const output = {};
            for (const nodeId of outputNodes) {
                output[nodeId] = nodeResults.get(nodeId);
            }
            return output;
        } else {
            // Return result of last executed node
            const lastNodeId = Array.from(nodeResults.keys()).pop();
            return nodeResults.get(lastNodeId);
        }
    }

    serializeWorkflow(workflow) {
        return {
            id: workflow.id,
            name: workflow.name,
            description: workflow.description,
            version: workflow.version,
            metadata: workflow.metadata,
            settings: workflow.settings,
            nodes: Array.from(workflow.nodes.entries()),
            connections: Array.from(workflow.connections.entries())
        };
    }

    deserializeWorkflow(data) {
        const workflow = {
            id: data.id,
            name: data.name,
            description: data.description,
            version: data.version,
            metadata: data.metadata,
            settings: data.settings,
            nodes: new Map(data.nodes),
            connections: new Map(data.connections),
            state: {
                isValid: false,
                hasErrors: false,
                executionCount: 0,
                lastExecuted: null
            }
        };
        
        return workflow;
    }

    async setupWorkflowStorage() {
        await fs.ensureDir(this.config.storage.workflowDirectory);
        console.log(`📁 Workflow storage ready: ${this.config.storage.workflowDirectory}`);
    }

    async loadExistingWorkflows() {
        try {
            const files = await fs.readdir(this.config.storage.workflowDirectory);
            
            for (const file of files) {
                if (file.endsWith('.workflow.json')) {
                    try {
                        const filePath = path.join(this.config.storage.workflowDirectory, file);
                        await this.loadWorkflow(filePath);
                    } catch (error) {
                        console.warn(`Failed to load workflow ${file}:`, error.message);
                    }
                }
            }
            
        } catch (error) {
            console.warn('Failed to load existing workflows:', error.message);
        }
    }

    registerDefaultWorkflowTemplates() {
        // Simple template generation workflow
        this.workflowTemplates.set('simple-generation', {
            name: 'Simple Template Generation',
            description: 'Generate a single template file',
            template: {
                nodes: [
                    { type: 'input', name: 'Input Data' },
                    { type: 'template-generator', name: 'Generate Template' },
                    { type: 'file-writer', name: 'Write File' },
                    { type: 'output', name: 'Result' }
                ],
                connections: [
                    { from: 'input', to: 'template-generator' },
                    { from: 'template-generator', to: 'file-writer' },
                    { from: 'file-writer', to: 'output' }
                ]
            }
        });
        
        console.log(`📋 Registered ${this.workflowTemplates.size} workflow templates`);
    }

    storeExecutionHistory(executionId, execution) {
        this.executionHistory.set(executionId, {
            ...execution,
            // Store only essential data for history
            nodeResults: Array.from(execution.nodeResults.entries())
        });
        
        // Limit history size
        if (this.executionHistory.size > 100) {
            const oldestKey = this.executionHistory.keys().next().value;
            this.executionHistory.delete(oldestKey);
        }
    }

    /**
     * Get workflow
     */
    getWorkflow(workflowId) {
        return this.workflows.get(workflowId);
    }

    /**
     * Get all workflows
     */
    getAllWorkflows() {
        return Array.from(this.workflows.values());
    }

    /**
     * Delete workflow
     */
    async deleteWorkflow(workflowId) {
        this.workflows.delete(workflowId);
        
        console.log(`🗑️  Deleted workflow: ${workflowId}`);
        this.emit('workflow-deleted', { workflowId });
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        // Stop any active executions
        for (const execution of this.activeExecutions.values()) {
            execution.status = 'cancelled';
        }
        this.activeExecutions.clear();
        
        // Clear caches
        this.workflows.clear();
        this.executionHistory.clear();
        
        console.log('🧹 Visual workflow automation cleanup complete');
    }
}

module.exports = VisualWorkflowAutomation;
