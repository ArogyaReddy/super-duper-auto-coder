const path = require('path');
const fs = require('fs-extra');
const os = require('os');

class CrossPlatformPathManager {
    constructor() {
        // Allow platform override via environment variable for easy switching
        this.platform = process.env.AUTO_CODER_PLATFORM || process.platform;
        this.configPath = path.resolve(__dirname, '..', 'cross-platform.config.json');
        this.config = this.loadConfig();
        this.platformConfig = this.config.platforms[this.platform];
        
        if (!this.platformConfig) {
            console.warn(`Platform ${this.platform} not configured, falling back to auto-detection`);
            this.platform = process.platform;
            this.platformConfig = this.config.platforms[this.platform];
        }
        
        if (!this.platformConfig) {
            throw new Error(`Unsupported platform: ${this.platform}`);
        }
    }

    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
            }
        } catch (error) {
            console.warn('Failed to load cross-platform config, using defaults:', error.message);
        }
        
        // Fallback configuration
        return {
            platforms: {
                darwin: {
                    frameworkRoot: path.resolve(os.homedir(), 'auto/auto/qa_automation/auto-coder'),
                    shell: '/bin/bash',
                    pathSeparator: '/'
                },
                win32: {
                    frameworkRoot: path.resolve(os.homedir(), 'auto\\auto\\qa_automation\\auto-coder'),
                    shell: 'pwsh.exe',
                    pathSeparator: '\\\\'
                },
                linux: {
                    frameworkRoot: path.resolve(os.homedir(), 'auto/auto/qa_automation/auto-coder'),
                    shell: '/bin/bash',
                    pathSeparator: '/'
                }
            }
        };
    }

    /**
     * Get the framework root directory for the current platform
     */
    getFrameworkRoot() {
        return this.platformConfig.frameworkRoot || path.resolve(__dirname, '..');
    }

    /**
     * Get prompt file paths for the current platform
     */
    getPromptFiles() {
        if (this.platformConfig.promptFiles) {
            return this.platformConfig.promptFiles;
        }
        
        // Auto-detect based on framework root
        const frameworkRoot = this.getFrameworkRoot();
        const githubDir = path.join(frameworkRoot, '.github');
        
        return {
            ultimate: path.join(githubDir, 'ULTIMATE-GPT-SYSTEM-PROMPT.md'),
            generateTest: path.join(githubDir, 'generate-test-artifacts.prompt.md'),
            runTest: path.join(githubDir, 'run-test-artifacts.prompt.md')
        };
    }

    /**
     * Get platform-specific shell command
     */
    getShell() {
        return this.platformConfig.shell;
    }

    /**
     * Get platform-specific commands
     */
    getCommands() {
        return this.platformConfig.commands || {};
    }

    /**
     * Get path separator for the current platform
     */
    getPathSeparator() {
        return this.platformConfig.pathSeparator || path.sep;
    }

    /**
     * Resolve a path relative to the framework root
     */
    resolvePath(...pathSegments) {
        return path.resolve(this.getFrameworkRoot(), ...pathSegments);
    }

    /**
     * Normalize path for the current platform
     */
    normalizePath(inputPath) {
        return path.normalize(inputPath);
    }

    /**
     * Convert Unix path to Windows path if on Windows
     */
    convertPath(inputPath) {
        if (this.platform === 'win32' && inputPath.includes('/')) {
            return inputPath.replace(/\\//g, '\\\\');
        }
        return inputPath;
    }

    /**
     * Get platform-specific script extension
     */
    getScriptExtension() {
        return this.platform === 'win32' ? '.ps1' : '.sh';
    }

    /**
     * Get platform-specific executable extension
     */
    getExecutableExtension() {
        return this.platform === 'win32' ? '.exe' : '';
    }

    /**
     * Check if a path exists and is accessible
     */
    async pathExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Ensure directory exists, create if needed
     */
    async ensureDir(dirPath) {
        try {
            await fs.ensureDir(dirPath);
            return true;
        } catch (error) {
            console.error(`Failed to create directory ${dirPath}:`, error.message);
            return false;
        }
    }

    /**
     * Get environment-specific configuration
     */
    getEnvironmentConfig() {
        return {
            platform: this.platform,
            actualPlatform: process.platform,
            platformOverride: process.env.AUTO_CODER_PLATFORM || 'auto-detect',
            frameworkRoot: this.getFrameworkRoot(),
            promptFiles: this.getPromptFiles(),
            shell: this.getShell(),
            pathSeparator: this.getPathSeparator(),
            commands: this.getCommands()
        };
    }

    /**
     * Validate all critical paths exist
     */
    async validatePaths() {
        const results = {
            frameworkRoot: await this.pathExists(this.getFrameworkRoot()),
            promptFiles: {}
        };

        const promptFiles = this.getPromptFiles();
        for (const [key, filePath] of Object.entries(promptFiles)) {
            results.promptFiles[key] = await this.pathExists(filePath);
        }

        return results;
    }

    /**
     * Get platform info for debugging
     */
    getPlatformInfo() {
        return {
            platform: this.platform,
            actualPlatform: process.platform,
            platformOverride: process.env.AUTO_CODER_PLATFORM || 'auto-detect',
            architecture: process.arch,
            nodeVersion: process.version,
            frameworkRoot: this.getFrameworkRoot(),
            shell: this.getShell(),
            pathSeparator: this.getPathSeparator()
        };
    }
}

module.exports = CrossPlatformPathManager;
