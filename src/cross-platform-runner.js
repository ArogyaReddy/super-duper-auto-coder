const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const CrossPlatformPathManager = require('./cross-platform-paths');

class CrossPlatformRunner {
    constructor() {
        this.pathManager = new CrossPlatformPathManager();
        this.platform = process.platform;
    }

    /**
     * Execute a shell command with cross-platform compatibility
     */
    async executeCommand(command, args = [], options = {}) {
        const shell = this.pathManager.getShell();
        const isWindows = this.platform === 'win32';
        
        let shellCommand, shellArgs;
        
        if (isWindows) {
            // Use PowerShell on Windows
            shellCommand = 'pwsh.exe';
            shellArgs = ['-Command', `${command} ${args.join(' ')}`];
        } else {
            // Use bash on Unix-like systems
            shellCommand = '/bin/bash';
            shellArgs = ['-c', `${command} ${args.join(' ')}`];
        }

        return new Promise((resolve, reject) => {
            const child = spawn(shellCommand, shellArgs, {
                cwd: options.cwd || this.pathManager.getFrameworkRoot(),
                stdio: options.stdio || 'pipe',
                ...options
            });

            let stdout = '';
            let stderr = '';

            if (child.stdout) {
                child.stdout.on('data', (data) => {
                    stdout += data.toString();
                });
            }

            if (child.stderr) {
                child.stderr.on('data', (data) => {
                    stderr += data.toString();
                });
            }

            child.on('close', (code) => {
                if (code === 0) {
                    resolve({ stdout, stderr, code });
                } else {
                    reject(new Error(`Command failed with code ${code}: ${stderr}`));
                }
            });

            child.on('error', (error) => {
                reject(error);
            });
        });
    }

    /**
     * Execute a synchronous command
     */
    executeCommandSync(command, args = [], options = {}) {
        const shell = this.pathManager.getShell();
        const isWindows = this.platform === 'win32';
        
        let shellCommand, shellArgs;
        
        if (isWindows) {
            shellCommand = 'pwsh.exe';
            shellArgs = ['-Command', `${command} ${args.join(' ')}`];
        } else {
            shellCommand = '/bin/bash';
            shellArgs = ['-c', `${command} ${args.join(' ')}`];
        }

        try {
            const result = spawnSync(shellCommand, shellArgs, {
                cwd: options.cwd || this.pathManager.getFrameworkRoot(),
                encoding: 'utf8',
                ...options
            });

            return {
                stdout: result.stdout || '',
                stderr: result.stderr || '',
                code: result.status,
                success: result.status === 0
            };
        } catch (error) {
            return {
                stdout: '',
                stderr: error.message,
                code: -1,
                success: false,
                error
            };
        }
    }

    /**
     * Open a file or URL with the default application
     */
    async openFile(filePath) {
        const commands = this.pathManager.getCommands();
        const openCommand = commands.open || (this.platform === 'win32' ? 'start' : 'open');
        
        try {
            await this.executeCommand(openCommand, [filePath]);
            return true;
        } catch (error) {
            console.error(`Failed to open file ${filePath}:`, error.message);
            return false;
        }
    }

    /**
     * Copy files with cross-platform compatibility
     */
    async copyFile(source, destination) {
        try {
            await fs.copy(source, destination);
            return true;
        } catch (error) {
            console.error(`Failed to copy ${source} to ${destination}:`, error.message);
            return false;
        }
    }

    /**
     * Remove files/directories with cross-platform compatibility
     */
    async removeFile(filePath) {
        try {
            await fs.remove(filePath);
            return true;
        } catch (error) {
            console.error(`Failed to remove ${filePath}:`, error.message);
            return false;
        }
    }

    /**
     * Create directory with cross-platform compatibility
     */
    async createDirectory(dirPath) {
        return await this.pathManager.ensureDir(dirPath);
    }

    /**
     * Run npm command with cross-platform compatibility
     */
    async runNpmCommand(command, args = [], options = {}) {
        const npmCommand = this.platform === 'win32' ? 'npm.cmd' : 'npm';
        return await this.executeCommand(npmCommand, [command, ...args], options);
    }

    /**
     * Run Playwright test with cross-platform compatibility
     */
    async runPlaywrightTest(testFile, options = {}) {
        const playwrightCommand = this.platform === 'win32' ? 'npx.cmd' : 'npx';
        const args = ['playwright', 'test'];
        
        if (testFile) {
            args.push(testFile);
        }
        
        if (options.headed) {
            args.push('--headed');
        }
        
        if (options.debug) {
            args.push('--debug');
        }
        
        return await this.executeCommand(playwrightCommand, args, options);
    }

    /**
     * Run Cucumber test with cross-platform compatibility
     */
    async runCucumberTest(featureFile, options = {}) {
        const cucumberCommand = this.platform === 'win32' ? 'npx.cmd' : 'npx';
        const args = ['cucumber-js'];
        
        if (featureFile) {
            args.push(featureFile);
        }
        
        if (options.tags) {
            args.push('--tags', options.tags);
        }
        
        if (options.format) {
            args.push('--format', options.format);
        }
        
        return await this.executeCommand(cucumberCommand, args, options);
    }

    /**
     * Get platform-specific script path
     */
    getScriptPath(scriptName) {
        const extension = this.pathManager.getScriptExtension();
        const frameworkRoot = this.pathManager.getFrameworkRoot();
        
        // Check for platform-specific script first
        const platformScript = path.join(frameworkRoot, `${scriptName}${extension}`);
        if (fs.existsSync(platformScript)) {
            return platformScript;
        }
        
        // Fall back to generic script
        const genericScript = path.join(frameworkRoot, `${scriptName}.sh`);
        if (fs.existsSync(genericScript)) {
            return genericScript;
        }
        
        return null;
    }

    /**
     * Execute a framework script (auto-coder.sh or auto-coder.ps1)
     */
    async executeFrameworkScript(command, args = [], options = {}) {
        const scriptPath = this.getScriptPath('auto-coder');
        
        if (!scriptPath) {
            throw new Error('Framework script not found');
        }
        
        const fullArgs = [command, ...args];
        
        if (this.platform === 'win32' && scriptPath.endsWith('.ps1')) {
            return await this.executeCommand('pwsh.exe', ['-File', scriptPath, ...fullArgs], options);
        } else {
            return await this.executeCommand('/bin/bash', [scriptPath, ...fullArgs], options);
        }
    }
}

module.exports = CrossPlatformRunner;
