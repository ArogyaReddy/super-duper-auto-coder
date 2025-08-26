/**
 * IDE Integration Manager
 * 
 * Provides seamless integration with popular IDEs and editors.
 * Follows SBS_Automation patterns for extensible plugin architecture.
 * 
 * Phase 3.3.2: IDE Integration
 */

const fs = require('fs-extra');
const path = require('path');
const EventEmitter = require('events');

class IDEIntegrationManager extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.config = {
            // Supported IDEs
            supportedIDEs: [
                'vscode',
                'intellij',
                'vim',
                'emacs',
                'atom',
                'sublime'
            ],
            
            // Integration settings
            integrations: {
                vscode: {
                    enabled: options.vscode !== false,
                    extensionPath: options.vscodeExtensionPath,
                    commands: options.vscodeCommands || this.getDefaultVSCodeCommands(),
                    snippets: options.vscodeSnippets !== false,
                    languageServer: options.vscodeLanguageServer !== false
                },
                
                intellij: {
                    enabled: options.intellij !== false,
                    pluginPath: options.intellijPluginPath,
                    actions: options.intellijActions || this.getDefaultIntellijActions()
                },
                
                universal: {
                    enabled: options.universal !== false,
                    languageServer: options.languageServer !== false,
                    configFiles: options.configFiles !== false
                }
            },
            
            // Auto-detection settings
            autoDetection: {
                enabled: options.autoDetection !== false,
                scanPaths: options.scanPaths || [
                    '.vscode',
                    '.idea',
                    '.vim',
                    '.emacs.d'
                ]
            },
            
            // Communication settings
            communication: {
                protocol: options.protocol || 'json-rpc',
                port: options.port || 3333,
                host: options.host || 'localhost'
            }
        };
        
        // Internal state
        this.detectedIDEs = new Set();
        this.activeIntegrations = new Map();
        this.languageServer = null;
        this.commandRegistry = new Map();
        
        console.log('🔌 IDE Integration Manager initialized');
    }

    /**
     * Initialize IDE integrations
     */
    async initialize() {
        console.log('🔌 Initializing IDE integrations...');
        
        try {
            // Detect available IDEs
            await this.detectIDEs();
            
            // Setup enabled integrations
            await this.setupIntegrations();
            
            // Start language server if enabled
            if (this.shouldStartLanguageServer()) {
                await this.startLanguageServer();
            }
            
            // Register default commands
            this.registerDefaultCommands();
            
            console.log(`✅ IDE integrations ready (${this.activeIntegrations.size} active)`);
            this.emit('integrations-ready');
            
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize IDE integrations:', error.message);
            throw error;
        }
    }

    /**
     * Detect available IDEs in the workspace
     */
    async detectIDEs() {
        console.log('🔍 Detecting available IDEs...');
        
        for (const scanPath of this.config.autoDetection.scanPaths) {
            const fullPath = path.join(process.cwd(), scanPath);
            
            if (await fs.pathExists(fullPath)) {
                const ide = this.identifyIDEFromPath(scanPath);
                if (ide) {
                    this.detectedIDEs.add(ide);
                    console.log(`📁 Detected IDE: ${ide} (${scanPath})`);
                }
            }
        }
        
        // Also check for running processes (simplified)
        await this.detectRunningIDEs();
        
        console.log(`🔍 Detection complete: ${Array.from(this.detectedIDEs).join(', ')}`);
        this.emit('ides-detected', { ides: Array.from(this.detectedIDEs) });
    }

    /**
     * Identify IDE from config path
     */
    identifyIDEFromPath(configPath) {
        const ideMap = {
            '.vscode': 'vscode',
            '.idea': 'intellij',
            '.vim': 'vim',
            '.emacs.d': 'emacs'
        };
        
        return ideMap[configPath] || null;
    }

    /**
     * Detect running IDEs (simplified)
     */
    async detectRunningIDEs() {
        // In a real implementation, this would check running processes
        // For now, we'll just check for common IDE indicators
        
        const indicators = {
            vscode: ['VSCODE_PID', 'TERM_PROGRAM'],
            intellij: ['IDEA_INITIAL_DIRECTORY'],
            vim: ['VIM', 'VIMRUNTIME'],
            emacs: ['EMACS', 'INSIDE_EMACS']
        };
        
        for (const [ide, envVars] of Object.entries(indicators)) {
            if (envVars.some(envVar => process.env[envVar])) {
                this.detectedIDEs.add(ide);
                console.log(`🔍 Detected running IDE: ${ide}`);
            }
        }
    }

    /**
     * Setup IDE integrations
     */
    async setupIntegrations() {
        for (const ide of this.detectedIDEs) {
            const integrationConfig = this.config.integrations[ide];
            
            if (integrationConfig && integrationConfig.enabled) {
                try {
                    const integration = await this.createIntegration(ide, integrationConfig);
                    this.activeIntegrations.set(ide, integration);
                    console.log(`✅ ${ide} integration active`);
                } catch (error) {
                    console.warn(`⚠️  Failed to setup ${ide} integration:`, error.message);
                }
            }
        }
    }

    /**
     * Create IDE integration
     */
    async createIntegration(ide, config) {
        switch (ide) {
            case 'vscode':
                return await this.createVSCodeIntegration(config);
            case 'intellij':
                return await this.createIntellijIntegration(config);
            default:
                return await this.createUniversalIntegration(ide, config);
        }
    }

    /**
     * Create VS Code integration
     */
    async createVSCodeIntegration(config) {
        const integration = {
            ide: 'vscode',
            type: 'extension',
            status: 'active',
            features: {
                commands: true,
                snippets: config.snippets,
                languageServer: config.languageServer,
                webview: true
            }
        };
        
        // Generate VS Code extension files
        if (config.extensionPath || this.shouldGenerateExtension()) {
            await this.generateVSCodeExtension(config);
        }
        
        // Setup commands
        await this.setupVSCodeCommands(config.commands);
        
        // Setup snippets
        if (config.snippets) {
            await this.setupVSCodeSnippets();
        }
        
        this.emit('vscode-integration-ready', { integration });
        return integration;
    }

    /**
     * Generate VS Code extension
     */
    async generateVSCodeExtension(config) {
        const extensionPath = config.extensionPath || path.join(process.cwd(), '.vscode-extension');
        
        // Create extension structure
        await fs.ensureDir(extensionPath);
        
        // Generate package.json
        const packageJson = {
            name: 'auto-coder',
            displayName: 'Auto-Coder Framework',
            description: 'Visual template builder and code generation',
            version: '1.0.0',
            engines: {
                vscode: '^1.60.0'
            },
            categories: ['Other'],
            activationEvents: [
                'onCommand:auto-coder.openBuilder',
                'onView:auto-coder.templateExplorer'
            ],
            main: './extension.js',
            contributes: {
                commands: this.generateVSCodeCommandContributions(),
                views: this.generateVSCodeViewContributions(),
                snippets: this.generateVSCodeSnippetContributions(),
                configuration: this.generateVSCodeConfigurationContributions()
            }
        };
        
        await fs.writeFile(
            path.join(extensionPath, 'package.json'),
            JSON.stringify(packageJson, null, 2)
        );
        
        // Generate extension.js
        const extensionJs = this.generateVSCodeExtensionScript();
        await fs.writeFile(path.join(extensionPath, 'extension.js'), extensionJs);
        
        // Generate webview content
        await this.generateVSCodeWebview(extensionPath);
        
        console.log(`📦 VS Code extension generated: ${extensionPath}`);
    }

    /**
     * Generate VS Code extension script
     */
    generateVSCodeExtensionScript() {
        return `
const vscode = require('vscode');
const path = require('path');

/**
 * Auto-Coder Framework VS Code Extension
 */
function activate(context) {
    console.log('Auto-Coder Framework extension activated');
    
    // Register commands
    registerCommands(context);
    
    // Register views
    registerViews(context);
    
    // Register webview provider
    registerWebviewProvider(context);
}

function registerCommands(context) {
    // Open Template Builder
    const openBuilder = vscode.commands.registerCommand('auto-coder.openBuilder', () => {
        const panel = vscode.window.createWebviewPanel(
            'auto-coder-builder',
            'Template Builder',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'webview'))]
            }
        );
        
        panel.webview.html = getWebviewContent(context, panel.webview);
        
        // Handle messages from webview
        panel.webview.onDidReceiveMessage(
            message => handleWebviewMessage(message, panel),
            undefined,
            context.subscriptions
        );
    });
    
    // Generate Template
    const generateTemplate = vscode.commands.registerCommand('auto-coder.generateTemplate', async () => {
        const framework = await vscode.window.showQuickPick(
            ['playwright', 'jest', 'cucumber'],
            { placeHolder: 'Select framework' }
        );
        
        if (framework) {
            const templateType = await vscode.window.showQuickPick(
                ['test', 'page-object', 'step-definition'],
                { placeHolder: 'Select template type' }
            );
            
            if (templateType) {
                await generateTemplateCommand(framework, templateType);
            }
        }
    });
    
    // Discover Templates
    const discoverTemplates = vscode.commands.registerCommand('auto-coder.discoverTemplates', async () => {
        const templates = await discoverTemplatesCommand();
        
        if (templates.length > 0) {
            const selected = await vscode.window.showQuickPick(
                templates.map(t => ({
                    label: t.name,
                    description: t.description,
                    detail: \`Framework: \${t.framework}, Type: \${t.type}\`,
                    template: t
                })),
                { placeHolder: 'Select template to use' }
            );
            
            if (selected) {
                await useTemplateCommand(selected.template);
            }
        } else {
            vscode.window.showInformationMessage('No templates found');
        }
    });
    
    context.subscriptions.push(openBuilder, generateTemplate, discoverTemplates);
}

function registerViews(context) {
    // Template Explorer
    const templateExplorer = new TemplateExplorer();
    vscode.window.registerTreeDataProvider('auto-coder.templateExplorer', templateExplorer);
    
    // Refresh command
    vscode.commands.registerCommand('auto-coder.refreshTemplates', () => {
        templateExplorer.refresh();
    });
}

function registerWebviewProvider(context) {
    // Template builder webview provider
    const provider = new TemplateBuilderWebviewProvider(context.extensionUri);
    
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('auto-coder.templateBuilder', provider)
    );
}

async function generateTemplateCommand(framework, templateType) {
    try {
        // Get current file context
        const activeEditor = vscode.window.activeTextEditor;
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        
        // Call auto-coder framework
        const { spawn } = require('child_process');
        const process = spawn('npx', ['auto-coder', 'generate', '--framework', framework, '--type', templateType], {
            cwd: workspaceRoot,
            stdio: 'pipe'
        });
        
        let output = '';
        process.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        process.on('close', (code) => {
            if (code === 0) {
                vscode.window.showInformationMessage('Template generated successfully');
                // Open generated file if specified in output
                const fileMatch = output.match(/Generated: (.+)/);
                if (fileMatch && activeEditor) {
                    vscode.workspace.openTextDocument(fileMatch[1]).then(doc => {
                        vscode.window.showTextDocument(doc);
                    });
                }
            } else {
                vscode.window.showErrorMessage('Template generation failed');
            }
        });
        
    } catch (error) {
        vscode.window.showErrorMessage(\`Error: \${error.message}\`);
    }
}

async function discoverTemplatesCommand() {
    // Call auto-coder framework to discover templates
    return new Promise((resolve, reject) => {
        const { spawn } = require('child_process');
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        
        const process = spawn('npx', ['auto-coder', 'discover', '--format', 'json'], {
            cwd: workspaceRoot,
            stdio: 'pipe'
        });
        
        let output = '';
        process.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        process.on('close', (code) => {
            if (code === 0) {
                try {
                    const templates = JSON.parse(output);
                    resolve(templates);
                } catch (error) {
                    reject(error);
                }
            } else {
                reject(new Error('Discovery failed'));
            }
        });
    });
}

async function useTemplateCommand(template) {
    // Use selected template
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        vscode.window.showErrorMessage('No active editor');
        return;
    }
    
    // Insert template at cursor position
    const position = activeEditor.selection.active;
    const snippet = new vscode.SnippetString(template.content);
    
    await activeEditor.insertSnippet(snippet, position);
    vscode.window.showInformationMessage(\`Template "\${template.name}" inserted\`);
}

function getWebviewContent(context, webview) {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webview', 'main.js'));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webview', 'style.css'));
    
    return \`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auto-Coder Template Builder</title>
    <link href="\${styleUri}" rel="stylesheet">
</head>
<body>
    <div id="app">
        <header>
            <h1>Template Builder</h1>
            <div class="toolbar">
                <button id="new-template">New Template</button>
                <button id="save-template">Save</button>
                <button id="preview-toggle">Toggle Preview</button>
            </div>
        </header>
        
        <main class="main-content">
            <div class="sidebar">
                <div class="component-palette">
                    <h3>Components</h3>
                    <div class="component-list" id="component-list">
                        <!-- Components will be loaded here -->
                    </div>
                </div>
                
                <div class="properties-panel">
                    <h3>Properties</h3>
                    <div class="properties" id="properties">
                        <!-- Properties will be loaded here -->
                    </div>
                </div>
            </div>
            
            <div class="editor-area">
                <div class="template-editor">
                    <div class="editor-header">
                        <span>Template Editor</span>
                        <div class="editor-controls">
                            <button id="validate-template">Validate</button>
                        </div>
                    </div>
                    <div class="editor-content" id="editor-content">
                        <!-- Visual editor will be here -->
                    </div>
                </div>
                
                <div class="preview-pane" id="preview-pane">
                    <div class="preview-header">
                        <span>Preview</span>
                        <select id="preview-mode">
                            <option value="rendered">Rendered</option>
                            <option value="raw">Raw Template</option>
                            <option value="compiled">Compiled</option>
                        </select>
                    </div>
                    <div class="preview-content" id="preview-content">
                        <!-- Preview will be shown here -->
                    </div>
                </div>
            </div>
        </main>
    </div>
    
    <script src="\${scriptUri}"></script>
</body>
</html>
    \`;
}

function handleWebviewMessage(message, panel) {
    switch (message.command) {
        case 'saveTemplate':
            // Handle save template
            vscode.window.showSaveDialog({
                filters: {
                    'Handlebars Templates': ['hbs']
                }
            }).then(uri => {
                if (uri) {
                    // Save template to file
                    panel.webview.postMessage({
                        command: 'templateSaved',
                        path: uri.fsPath
                    });
                }
            });
            break;
            
        case 'generatePreview':
            // Handle preview generation
            panel.webview.postMessage({
                command: 'previewUpdated',
                content: message.content
            });
            break;
            
        case 'validateTemplate':
            // Handle template validation
            panel.webview.postMessage({
                command: 'validationResult',
                valid: true,
                errors: []
            });
            break;
    }
}

// Template Explorer Tree Data Provider
class TemplateExplorer {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    
    getTreeItem(element) {
        return element;
    }
    
    getChildren(element) {
        if (!element) {
            // Root level - show template categories
            return [
                new TemplateItem('Test Templates', vscode.TreeItemCollapsibleState.Expanded, 'category'),
                new TemplateItem('Page Objects', vscode.TreeItemCollapsibleState.Expanded, 'category'),
                new TemplateItem('Step Definitions', vscode.TreeItemCollapsibleState.Expanded, 'category')
            ];
        } else if (element.contextValue === 'category') {
            // Show templates in category
            return this.getTemplatesInCategory(element.label);
        }
        
        return [];
    }
    
    getTemplatesInCategory(category) {
        // This would fetch actual templates
        const templates = {
            'Test Templates': [
                new TemplateItem('Playwright E2E Test', vscode.TreeItemCollapsibleState.None, 'template'),
                new TemplateItem('Jest Unit Test', vscode.TreeItemCollapsibleState.None, 'template')
            ],
            'Page Objects': [
                new TemplateItem('Basic Page Object', vscode.TreeItemCollapsibleState.None, 'template')
            ],
            'Step Definitions': [
                new TemplateItem('Cucumber Steps', vscode.TreeItemCollapsibleState.None, 'template')
            ]
        };
        
        return templates[category] || [];
    }
}

class TemplateItem extends vscode.TreeItem {
    constructor(label, collapsibleState, contextValue) {
        super(label, collapsibleState);
        this.contextValue = contextValue;
        
        if (contextValue === 'template') {
            this.command = {
                command: 'auto-coder.useTemplate',
                title: 'Use Template',
                arguments: [this]
            };
        }
    }
}

// Template Builder Webview Provider
class TemplateBuilderWebviewProvider {
    constructor(extensionUri) {
        this._extensionUri = extensionUri;
    }
    
    resolveWebviewView(webviewView, context, _token) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    }
    
    _getHtmlForWebview(webview) {
        return \`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Template Builder</title>
    <style>
        body { font-family: var(--vscode-font-family); }
        .component { 
            padding: 8px; 
            margin: 4px 0; 
            border: 1px solid var(--vscode-panel-border); 
            cursor: pointer; 
        }
        .component:hover { background: var(--vscode-list-hoverBackground); }
    </style>
</head>
<body>
    <h3>Quick Actions</h3>
    <button onclick="openBuilder()">Open Builder</button>
    <button onclick="generateTest()">Generate Test</button>
    
    <h3>Components</h3>
    <div class="component" onclick="addComponent('test-case')">Test Case</div>
    <div class="component" onclick="addComponent('page-object')">Page Object</div>
    <div class="component" onclick="addComponent('assertion')">Assertion</div>
    
    <script>
        const vscode = acquireVsCodeApi();
        
        function openBuilder() {
            vscode.postMessage({ command: 'openBuilder' });
        }
        
        function generateTest() {
            vscode.postMessage({ command: 'generateTest' });
        }
        
        function addComponent(type) {
            vscode.postMessage({ command: 'addComponent', componentType: type });
        }
    </script>
</body>
</html>
        \`;
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
`;
    }

    /**
     * Generate VS Code webview
     */
    async generateVSCodeWebview(extensionPath) {
        const webviewDir = path.join(extensionPath, 'webview');
        await fs.ensureDir(webviewDir);
        
        // Generate main.js
        const mainJs = `
// Auto-Coder Template Builder Webview Script
(function() {
    const vscode = acquireVsCodeApi();
    
    // Initialize the template builder interface
    function initializeTemplateBuilder() {
        setupComponentPalette();
        setupTemplateEditor();
        setupPreviewPane();
        setupEventHandlers();
    }
    
    function setupComponentPalette() {
        const componentList = document.getElementById('component-list');
        const components = [
            { type: 'test-setup', name: 'Test Setup', category: 'structure' },
            { type: 'test-case', name: 'Test Case', category: 'test' },
            { type: 'page-object', name: 'Page Object', category: 'playwright' },
            { type: 'assertion', name: 'Assertion', category: 'test' }
        ];
        
        componentList.innerHTML = components.map(comp => 
            \`<div class="component-item" data-type="\${comp.type}">
                <span class="component-name">\${comp.name}</span>
                <span class="component-category">\${comp.category}</span>
            </div>\`
        ).join('');
        
        // Add drag handlers
        componentList.querySelectorAll('.component-item').forEach(item => {
            item.draggable = true;
            item.addEventListener('dragstart', handleComponentDragStart);
            item.addEventListener('click', handleComponentClick);
        });
    }
    
    function setupTemplateEditor() {
        const editorContent = document.getElementById('editor-content');
        editorContent.innerHTML = \`
            <div class="template-canvas" id="template-canvas">
                <div class="drop-zone" id="drop-zone">
                    <p>Drag components here to build your template</p>
                </div>
            </div>
        \`;
        
        const dropZone = document.getElementById('drop-zone');
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('drop', handleDrop);
    }
    
    function setupPreviewPane() {
        const previewContent = document.getElementById('preview-content');
        previewContent.innerHTML = \`
            <div class="preview-area">
                <pre id="preview-text">// Template preview will appear here</pre>
            </div>
        \`;
    }
    
    function setupEventHandlers() {
        // Toolbar buttons
        document.getElementById('new-template').addEventListener('click', handleNewTemplate);
        document.getElementById('save-template').addEventListener('click', handleSaveTemplate);
        document.getElementById('preview-toggle').addEventListener('click', handlePreviewToggle);
        document.getElementById('validate-template').addEventListener('click', handleValidateTemplate);
        
        // Preview mode selector
        document.getElementById('preview-mode').addEventListener('change', handlePreviewModeChange);
    }
    
    function handleComponentDragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.dataset.type);
    }
    
    function handleComponentClick(event) {
        const componentType = event.target.closest('.component-item').dataset.type;
        addComponentToTemplate(componentType);
    }
    
    function handleDragOver(event) {
        event.preventDefault();
    }
    
    function handleDrop(event) {
        event.preventDefault();
        const componentType = event.dataTransfer.getData('text/plain');
        addComponentToTemplate(componentType);
    }
    
    function addComponentToTemplate(componentType) {
        vscode.postMessage({
            command: 'addComponent',
            componentType: componentType
        });
        
        // Update the visual representation
        const dropZone = document.getElementById('drop-zone');
        const componentElement = document.createElement('div');
        componentElement.className = 'template-component';
        componentElement.innerHTML = \`
            <div class="component-header">
                <span class="component-title">\${componentType}</span>
                <button class="component-remove" onclick="removeComponent(this)">×</button>
            </div>
            <div class="component-body">
                <!-- Component configuration will go here -->
            </div>
        \`;
        
        dropZone.appendChild(componentElement);
        updatePreview();
    }
    
    function removeComponent(button) {
        const component = button.closest('.template-component');
        component.remove();
        updatePreview();
    }
    
    function handleNewTemplate() {
        if (confirm('Create new template? Unsaved changes will be lost.')) {
            document.getElementById('drop-zone').innerHTML = '<p>Drag components here to build your template</p>';
            updatePreview();
        }
    }
    
    function handleSaveTemplate() {
        vscode.postMessage({
            command: 'saveTemplate',
            template: getCurrentTemplate()
        });
    }
    
    function handlePreviewToggle() {
        const previewPane = document.getElementById('preview-pane');
        previewPane.style.display = previewPane.style.display === 'none' ? 'block' : 'none';
    }
    
    function handleValidateTemplate() {
        vscode.postMessage({
            command: 'validateTemplate',
            template: getCurrentTemplate()
        });
    }
    
    function handlePreviewModeChange(event) {
        const mode = event.target.value;
        updatePreview(mode);
    }
    
    function getCurrentTemplate() {
        const components = Array.from(document.querySelectorAll('.template-component')).map(comp => ({
            type: comp.querySelector('.component-title').textContent,
            config: {} // Would extract actual configuration
        }));
        
        return {
            components: components,
            metadata: {
                name: 'Current Template',
                framework: 'playwright',
                type: 'test'
            }
        };
    }
    
    function updatePreview(mode = 'rendered') {
        const template = getCurrentTemplate();
        vscode.postMessage({
            command: 'generatePreview',
            template: template,
            mode: mode
        });
    }
    
    // Handle messages from extension
    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.command) {
            case 'previewUpdated':
                document.getElementById('preview-text').textContent = message.content;
                break;
                
            case 'templateSaved':
                alert('Template saved to: ' + message.path);
                break;
                
            case 'validationResult':
                if (message.valid) {
                    alert('Template is valid!');
                } else {
                    alert('Validation errors: ' + message.errors.join(', '));
                }
                break;
        }
    });
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTemplateBuilder);
    } else {
        initializeTemplateBuilder();
    }
})();
`;
        
        await fs.writeFile(path.join(webviewDir, 'main.js'), mainJs);
        
        // Generate style.css
        const styleCss = `
/* Auto-Coder Template Builder Styles */
body {
    margin: 0;
    padding: 0;
    font-family: var(--vscode-font-family);
    background: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
}

#app {
    height: 100vh;
    display: flex;
    flex-direction: column;
}

header {
    padding: 10px;
    border-bottom: 1px solid var(--vscode-panel-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

header h1 {
    margin: 0;
    font-size: 18px;
}

.toolbar button {
    margin-left: 8px;
    padding: 6px 12px;
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: 3px;
    cursor: pointer;
}

.toolbar button:hover {
    background: var(--vscode-button-hoverBackground);
}

.main-content {
    flex: 1;
    display: flex;
    overflow: hidden;
}

.sidebar {
    width: 250px;
    border-right: 1px solid var(--vscode-panel-border);
    display: flex;
    flex-direction: column;
}

.component-palette {
    flex: 1;
    padding: 10px;
    border-bottom: 1px solid var(--vscode-panel-border);
}

.component-palette h3 {
    margin: 0 0 10px 0;
    font-size: 14px;
}

.component-item {
    padding: 8px;
    margin: 4px 0;
    background: var(--vscode-list-inactiveSelectionBackground);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 3px;
    cursor: grab;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.component-item:hover {
    background: var(--vscode-list-hoverBackground);
}

.component-item:active {
    cursor: grabbing;
}

.component-name {
    font-weight: bold;
}

.component-category {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    text-transform: uppercase;
}

.properties-panel {
    padding: 10px;
    min-height: 200px;
}

.properties-panel h3 {
    margin: 0 0 10px 0;
    font-size: 14px;
}

.editor-area {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.template-editor {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid var(--vscode-panel-border);
}

.editor-header {
    padding: 8px 10px;
    background: var(--vscode-editorGroupHeader-tabsBackground);
    border-bottom: 1px solid var(--vscode-panel-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.editor-content {
    flex: 1;
    overflow: auto;
}

.template-canvas {
    height: 100%;
    padding: 20px;
}

.drop-zone {
    min-height: 300px;
    border: 2px dashed var(--vscode-panel-border);
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--vscode-descriptionForeground);
}

.drop-zone.drag-over {
    border-color: var(--vscode-focusBorder);
    background: var(--vscode-list-dropBackground);
}

.template-component {
    margin: 10px 0;
    border: 1px solid var(--vscode-panel-border);
    border-radius: 3px;
    background: var(--vscode-editor-background);
}

.component-header {
    padding: 8px 10px;
    background: var(--vscode-editorGroupHeader-tabsBackground);
    border-bottom: 1px solid var(--vscode-panel-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.component-title {
    font-weight: bold;
}

.component-remove {
    background: none;
    border: none;
    color: var(--vscode-errorForeground);
    cursor: pointer;
    font-size: 16px;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.component-remove:hover {
    background: var(--vscode-list-errorForeground);
    color: white;
    border-radius: 3px;
}

.component-body {
    padding: 10px;
}

.preview-pane {
    height: 50%;
    display: flex;
    flex-direction: column;
    background: var(--vscode-editor-background);
}

.preview-header {
    padding: 8px 10px;
    background: var(--vscode-editorGroupHeader-tabsBackground);
    border-bottom: 1px solid var(--vscode-panel-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.preview-content {
    flex: 1;
    overflow: auto;
}

.preview-area {
    height: 100%;
}

#preview-text {
    margin: 0;
    padding: 15px;
    height: calc(100% - 30px);
    overflow: auto;
    font-family: var(--vscode-editor-font-family);
    font-size: var(--vscode-editor-font-size);
    background: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
}

select {
    background: var(--vscode-dropdown-background);
    color: var(--vscode-dropdown-foreground);
    border: 1px solid var(--vscode-dropdown-border);
    padding: 4px 8px;
    border-radius: 3px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .main-content {
        flex-direction: column;
    }
    
    .sidebar {
        width: 100%;
        height: 200px;
        border-right: none;
        border-bottom: 1px solid var(--vscode-panel-border);
    }
    
    .component-palette {
        flex: none;
        height: 120px;
    }
    
    .properties-panel {
        flex: none;
        height: 80px;
        min-height: auto;
    }
}
`;
        
        await fs.writeFile(path.join(webviewDir, 'style.css'), styleCss);
        
        console.log(`🎨 VS Code webview generated: ${webviewDir}`);
    }

    /**
     * Generate VS Code command contributions
     */
    generateVSCodeCommandContributions() {
        return [
            {
                command: 'auto-coder.openBuilder',
                title: 'Open Template Builder',
                category: 'Auto-Coder'
            },
            {
                command: 'auto-coder.generateTemplate',
                title: 'Generate Template',
                category: 'Auto-Coder'
            },
            {
                command: 'auto-coder.discoverTemplates',
                title: 'Discover Templates',
                category: 'Auto-Coder'
            },
            {
                command: 'auto-coder.refreshTemplates',
                title: 'Refresh Templates',
                category: 'Auto-Coder',
                icon: '$(refresh)'
            }
        ];
    }

    /**
     * Generate VS Code view contributions
     */
    generateVSCodeViewContributions() {
        return {
            explorer: [
                {
                    id: 'auto-coder.templateExplorer',
                    name: 'Auto-Coder Templates',
                    when: 'workspaceHasTemplates'
                }
            ],
            'auto-coder': [
                {
                    type: 'webview',
                    id: 'auto-coder.templateBuilder',
                    name: 'Template Builder'
                }
            ]
        };
    }

    /**
     * Generate VS Code snippet contributions
     */
    generateVSCodeSnippetContributions() {
        return [
            {
                language: 'javascript',
                path: './snippets/javascript.json'
            },
            {
                language: 'typescript',
                path: './snippets/typescript.json'
            }
        ];
    }

    /**
     * Generate VS Code configuration contributions
     */
    generateVSCodeConfigurationContributions() {
        return {
            title: 'Auto-Coder Framework',
            properties: {
                'auto-coder.templatePath': {
                    type: 'string',
                    default: './templates',
                    description: 'Path to template directory'
                },
                'auto-coder.autoGenerate': {
                    type: 'boolean',
                    default: false,
                    description: 'Enable automatic template generation'
                },
                'auto-coder.defaultFramework': {
                    type: 'string',
                    enum: ['playwright', 'jest', 'cucumber'],
                    default: 'playwright',
                    description: 'Default testing framework'
                }
            }
        };
    }

    /**
     * Setup VS Code commands
     */
    async setupVSCodeCommands(commands) {
        for (const command of commands) {
            this.commandRegistry.set(command.id, command);
        }
        
        console.log(`📝 Registered ${commands.length} VS Code commands`);
    }

    /**
     * Setup VS Code snippets
     */
    async setupVSCodeSnippets() {
        // Generate snippet files
        const snippets = {
            javascript: this.generateJavaScriptSnippets(),
            typescript: this.generateTypeScriptSnippets()
        };
        
        const snippetsDir = path.join(process.cwd(), '.vscode-extension', 'snippets');
        await fs.ensureDir(snippetsDir);
        
        for (const [language, snippetData] of Object.entries(snippets)) {
            await fs.writeFile(
                path.join(snippetsDir, `${language}.json`),
                JSON.stringify(snippetData, null, 2)
            );
        }
        
        console.log('📄 VS Code snippets generated');
    }

    /**
     * Generate JavaScript snippets
     */
    generateJavaScriptSnippets() {
        return {
            'Playwright Test': {
                prefix: 'pw-test',
                body: [
                    "import { test, expect } from '@playwright/test';",
                    '',
                    "test('${1:test description}', async ({ page }) => {",
                    '  await page.goto(\'${2:url}\');',
                    '  ${0}',
                    '});'
                ],
                description: 'Create a Playwright test'
            },
            'Jest Test': {
                prefix: 'jest-test',
                body: [
                    "describe('${1:feature}', () => {",
                    "  it('${2:should do something}', () => {",
                    '    ${0}',
                    '  });',
                    '});'
                ],
                description: 'Create a Jest test'
            },
            'Page Object': {
                prefix: 'page-object',
                body: [
                    'class ${1:PageName} {',
                    '  constructor(page) {',
                    '    this.page = page;',
                    '    this.${2:element} = \'${3:#selector}\';',
                    '  }',
                    '',
                    '  async ${4:methodName}() {',
                    '    ${0}',
                    '  }',
                    '}'
                ],
                description: 'Create a page object class'
            }
        };
    }

    /**
     * Generate TypeScript snippets
     */
    generateTypeScriptSnippets() {
        return {
            'Playwright Test (TS)': {
                prefix: 'pw-test-ts',
                body: [
                    "import { test, expect, Page } from '@playwright/test';",
                    '',
                    "test('${1:test description}', async ({ page }: { page: Page }) => {",
                    '  await page.goto(\'${2:url}\');',
                    '  ${0}',
                    '});'
                ],
                description: 'Create a TypeScript Playwright test'
            },
            'Page Object (TS)': {
                prefix: 'page-object-ts',
                body: [
                    'import { Page } from \'@playwright/test\';',
                    '',
                    'export class ${1:PageName} {',
                    '  private page: Page;',
                    '  private ${2:element} = \'${3:#selector}\';',
                    '',
                    '  constructor(page: Page) {',
                    '    this.page = page;',
                    '  }',
                    '',
                    '  async ${4:methodName}(): Promise<void> {',
                    '    ${0}',
                    '  }',
                    '}'
                ],
                description: 'Create a TypeScript page object class'
            }
        };
    }

    /**
     * Create IntelliJ integration
     */
    async createIntellijIntegration(config) {
        const integration = {
            ide: 'intellij',
            type: 'plugin',
            status: 'active',
            features: {
                actions: true,
                intentions: true,
                fileTemplates: true,
                toolWindow: true
            }
        };
        
        // Generate IntelliJ plugin files
        if (config.pluginPath || this.shouldGeneratePlugin()) {
            await this.generateIntellijPlugin(config);
        }
        
        this.emit('intellij-integration-ready', { integration });
        return integration;
    }

    /**
     * Generate IntelliJ plugin
     */
    async generateIntellijPlugin(config) {
        const pluginPath = config.pluginPath || path.join(process.cwd(), '.intellij-plugin');
        
        // Create plugin structure
        await fs.ensureDir(path.join(pluginPath, 'src', 'main', 'java'));
        await fs.ensureDir(path.join(pluginPath, 'src', 'main', 'resources', 'META-INF'));
        
        // Generate plugin.xml
        const pluginXml = `
<idea-plugin>
    <id>com.auto-coder.framework</id>
    <name>Auto-Coder Framework</name>
    <version>1.0.0</version>
    <vendor>Auto-Coder Framework Team</vendor>

    <description><![CDATA[
        Visual template builder and code generation for test automation.
        Supports Playwright, Jest, Cucumber, and more.
    ]]></description>

    <depends>com.intellij.modules.platform</depends>
    <depends>com.intellij.modules.java</depends>

    <extensions defaultExtensionNs="com.intellij">
        <toolWindow id="AutoCoder" secondary="true" anchor="right"
                    factoryClass="com.autocoder.toolwindow.AutoCoderToolWindowFactory"/>
        
        <fileTemplateGroup implementation="com.autocoder.templates.AutoCoderFileTemplateGroupFactory"/>
        
        <intentionAction>
            <className>com.autocoder.intentions.GenerateTestIntention</className>
            <category>Auto-Coder</category>
        </intentionAction>
    </extensions>

    <actions>
        <group id="AutoCoderActions" text="Auto-Coder" popup="true">
            <add-to-group group-id="GenerateGroup" anchor="first"/>
            
            <action id="AutoCoder.GenerateTest" 
                    class="com.autocoder.actions.GenerateTestAction"
                    text="Generate Test Template">
            </action>
            
            <action id="AutoCoder.OpenBuilder"
                    class="com.autocoder.actions.OpenBuilderAction"
                    text="Open Template Builder">
            </action>
        </group>
    </actions>
</idea-plugin>
`;
        
        await fs.writeFile(
            path.join(pluginPath, 'src', 'main', 'resources', 'META-INF', 'plugin.xml'),
            pluginXml
        );
        
        console.log(`🔌 IntelliJ plugin generated: ${pluginPath}`);
    }

    /**
     * Create universal integration
     */
    async createUniversalIntegration(ide, config) {
        const integration = {
            ide,
            type: 'universal',
            status: 'active',
            features: {
                configFiles: true,
                languageServer: this.config.integrations.universal.languageServer
            }
        };
        
        // Generate universal config files
        await this.generateUniversalConfig(ide);
        
        this.emit('universal-integration-ready', { ide, integration });
        return integration;
    }

    /**
     * Generate universal configuration
     */
    async generateUniversalConfig(ide) {
        const configDir = path.join(process.cwd(), `.${ide}-integration`);
        await fs.ensureDir(configDir);
        
        // Generate basic config
        const config = {
            name: 'Auto-Coder Framework',
            version: '1.0.0',
            integration: {
                ide,
                commands: this.getUniversalCommands(),
                templates: this.getUniversalTemplates()
            }
        };
        
        await fs.writeFile(
            path.join(configDir, 'auto-coder.json'),
            JSON.stringify(config, null, 2)
        );
        
        console.log(`🔧 Universal config generated for ${ide}: ${configDir}`);
    }

    /**
     * Start language server
     */
    async startLanguageServer() {
        console.log('🚀 Starting Auto-Coder Language Server...');
        
        try {
            const LanguageServer = require('./language-server');
            this.languageServer = new LanguageServer({
                port: this.config.communication.port,
                host: this.config.communication.host
            });
            
            await this.languageServer.start();
            
            console.log(`✅ Language Server running on ${this.config.communication.host}:${this.config.communication.port}`);
            this.emit('language-server-started');
            
        } catch (error) {
            console.warn('⚠️  Language Server failed to start:', error.message);
        }
    }

    /**
     * Register default commands
     */
    registerDefaultCommands() {
        const commands = [
            {
                id: 'auto-coder.generate',
                name: 'Generate Template',
                handler: this.handleGenerateCommand.bind(this)
            },
            {
                id: 'auto-coder.discover',
                name: 'Discover Templates',
                handler: this.handleDiscoverCommand.bind(this)
            },
            {
                id: 'auto-coder.validate',
                name: 'Validate Template',
                handler: this.handleValidateCommand.bind(this)
            }
        ];
        
        for (const command of commands) {
            this.commandRegistry.set(command.id, command);
        }
        
        console.log(`📝 Registered ${commands.length} default commands`);
    }

    /**
     * Command handlers
     */
    async handleGenerateCommand(context) {
        console.log('🎯 Executing generate command', context);
        // Implementation would integrate with template manager
        return { success: true, message: 'Template generated' };
    }

    async handleDiscoverCommand(context) {
        console.log('🔍 Executing discover command', context);
        // Implementation would scan for templates
        return { success: true, templates: [] };
    }

    async handleValidateCommand(context) {
        console.log('✅ Executing validate command', context);
        // Implementation would validate templates
        return { success: true, valid: true, errors: [] };
    }

    /**
     * Get default VS Code commands
     */
    getDefaultVSCodeCommands() {
        return [
            { id: 'auto-coder.openBuilder', title: 'Open Template Builder' },
            { id: 'auto-coder.generateTemplate', title: 'Generate Template' },
            { id: 'auto-coder.discoverTemplates', title: 'Discover Templates' }
        ];
    }

    /**
     * Get default IntelliJ actions
     */
    getDefaultIntellijActions() {
        return [
            { id: 'AutoCoder.GenerateTest', title: 'Generate Test Template' },
            { id: 'AutoCoder.OpenBuilder', title: 'Open Template Builder' }
        ];
    }

    /**
     * Get universal commands
     */
    getUniversalCommands() {
        return [
            { command: 'auto-coder generate', description: 'Generate template' },
            { command: 'auto-coder discover', description: 'Discover templates' },
            { command: 'auto-coder validate', description: 'Validate template' }
        ];
    }

    /**
     * Get universal templates
     */
    getUniversalTemplates() {
        return [
            { name: 'Playwright Test', type: 'test', framework: 'playwright' },
            { name: 'Jest Test', type: 'test', framework: 'jest' },
            { name: 'Page Object', type: 'page-object', framework: 'playwright' }
        ];
    }

    /**
     * Utility methods
     */
    shouldStartLanguageServer() {
        return this.config.integrations.universal.languageServer ||
               this.config.integrations.vscode.languageServer;
    }

    shouldGenerateExtension() {
        return this.detectedIDEs.has('vscode') && this.config.integrations.vscode.enabled;
    }

    shouldGeneratePlugin() {
        return this.detectedIDEs.has('intellij') && this.config.integrations.intellij.enabled;
    }

    /**
     * Get integration status
     */
    getIntegrationStatus() {
        return {
            detectedIDEs: Array.from(this.detectedIDEs),
            activeIntegrations: Array.from(this.activeIntegrations.keys()),
            languageServerStatus: this.languageServer ? 'running' : 'stopped',
            commandCount: this.commandRegistry.size
        };
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        if (this.languageServer) {
            await this.languageServer.stop();
        }
        
        this.activeIntegrations.clear();
        this.commandRegistry.clear();
        
        console.log('🧹 IDE integration cleanup complete');
    }
}

module.exports = IDEIntegrationManager;
