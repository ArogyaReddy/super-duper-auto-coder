/**
 * 🔗 SYMLINK-BASED REFERENCE SYSTEM
 * 
 * SOLVES: Staging execution with true reference architecture
 * APPROACH: Create symbolic links to main SBS_Automation dependencies
 * 
 * BENEFITS:
 * ✅ True reference architecture (no file duplication)
 * ✅ Staging execution works immediately
 * ✅ Automatic updates when main SBS_Automation changes
 * ✅ Zero maintenance overhead
 * 
 * REQUIREMENTS:
 * - Windows: Developer mode or admin privileges
 * - Unix/Linux: Standard symlink support
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

class SymlinkReferenceSystem {
    constructor() {
        this.config = {
            stagingRoot: 'auto-coder/SBS_Automation',
            productionRoot: '../SBS_Automation',
            symlinkTargets: [
                {
                    source: '../../../SBS_Automation/pages/common',
                    target: 'auto-coder/SBS_Automation/pages/common',
                    type: 'directory'
                },
                {
                    source: '../../../SBS_Automation/support',
                    target: 'auto-coder/SBS_Automation/support',
                    type: 'directory'
                },
                {
                    source: '../../../SBS_Automation/hooks',
                    target: 'auto-coder/SBS_Automation/hooks',
                    type: 'directory'
                }
            ]
        };
        
        this.platform = os.platform();
        this.isWindows = this.platform === 'win32';
    }

    /**
     * SETUP SYMLINK REFERENCE SYSTEM
     * Create all necessary symbolic links
     */
    async setupReferenceSystem() {
        console.log(`🔗 Setting up Symlink Reference System on ${this.platform}...`);
        
        try {
            // Check prerequisites
            await this.checkPrerequisites();
            
            // Create staging directory structure
            this.createStagingStructure();
            
            // Create symbolic links
            await this.createSymbolicLinks();
            
            // Verify symlinks
            this.verifySymlinks();
            
            console.log(`✅ Symlink Reference System setup complete!`);
            return { success: true, message: 'Reference system ready' };
            
        } catch (error) {
            console.error(`❌ Setup failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * CHECK PREREQUISITES
     * Ensure system can create symlinks
     */
    async checkPrerequisites() {
        console.log(`🔍 Checking prerequisites...`);
        
        if (this.isWindows) {
            // Check if running as admin or in developer mode
            try {
                const testDir = path.join(process.cwd(), 'temp-symlink-test');
                const testTarget = path.join(process.cwd(), 'temp-target-test');
                
                // Create test target
                fs.mkdirSync(testTarget, { recursive: true });
                
                // Try to create symlink
                execSync(`mklink /D "${testDir}" "${testTarget}"`, { 
                    stdio: 'ignore',
                    shell: true 
                });
                
                // Cleanup
                fs.rmSync(testDir, { force: true });
                fs.rmSync(testTarget, { recursive: true, force: true });
                
                console.log(`✅ Windows symlink support confirmed`);
                
            } catch (error) {
                throw new Error(`Windows symlink creation failed. Please run as Administrator or enable Developer Mode.`);
            }
        }
        
        // Check if source directories exist
        for (const target of this.config.symlinkTargets) {
            const sourcePath = path.resolve(target.source);
            if (!fs.existsSync(sourcePath)) {
                throw new Error(`Source directory not found: ${sourcePath}`);
            }
        }
    }

    /**
     * CREATE STAGING STRUCTURE
     * Prepare staging directory without conflicting with symlinks
     */
    createStagingStructure() {
        console.log(`📁 Creating staging structure...`);
        
        // Create main staging directories
        const stagingDirs = [
            'auto-coder/SBS_Automation/features',
            'auto-coder/SBS_Automation/steps',
            'auto-coder/SBS_Automation/pages',  // Will contain symlinked common/
            'auto-coder/SBS_Automation/data',
            'auto-coder/SBS_Automation/config'
        ];
        
        for (const dir of stagingDirs) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        console.log(`✅ Staging structure created`);
    }

    /**
     * CREATE SYMBOLIC LINKS
     * Link staging to production dependencies
     */
    async createSymbolicLinks() {
        console.log(`🔗 Creating symbolic links...`);
        
        for (const linkConfig of this.config.symlinkTargets) {
            await this.createSymlink(linkConfig);
        }
        
        console.log(`✅ All symbolic links created`);
    }

    /**
     * CREATE INDIVIDUAL SYMLINK
     * Platform-specific symlink creation
     */
    async createSymlink(linkConfig) {
        const sourcePath = path.resolve(linkConfig.source);
        const targetPath = path.resolve(linkConfig.target);
        
        console.log(`  🔗 Linking: ${targetPath} → ${sourcePath}`);
        
        // Remove existing target if it exists
        if (fs.existsSync(targetPath)) {
            if (fs.lstatSync(targetPath).isSymbolicLink()) {
                fs.unlinkSync(targetPath);
            } else {
                throw new Error(`Target exists and is not a symlink: ${targetPath}`);
            }
        }
        
        // Create parent directory
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        
        try {
            if (this.isWindows) {
                // Windows symlink creation
                const linkType = linkConfig.type === 'directory' ? '/D' : '';
                execSync(`mklink ${linkType} "${targetPath}" "${sourcePath}"`, {
                    stdio: 'inherit',
                    shell: true
                });
            } else {
                // Unix/Linux symlink creation
                fs.symlinkSync(sourcePath, targetPath);
            }
            
            console.log(`    ✅ Created: ${path.basename(targetPath)}`);
            
        } catch (error) {
            throw new Error(`Failed to create symlink ${targetPath}: ${error.message}`);
        }
    }

    /**
     * VERIFY SYMLINKS
     * Ensure all symlinks are working correctly
     */
    verifySymlinks() {
        console.log(`🔍 Verifying symbolic links...`);
        
        const results = {
            total: this.config.symlinkTargets.length,
            successful: 0,
            failed: []
        };
        
        for (const linkConfig of this.config.symlinkTargets) {
            const targetPath = path.resolve(linkConfig.target);
            
            try {
                // Check if symlink exists
                const stats = fs.lstatSync(targetPath);
                if (!stats.isSymbolicLink()) {
                    throw new Error('Not a symbolic link');
                }
                
                // Check if target is accessible
                fs.accessSync(targetPath, fs.constants.R_OK);
                
                // For directories, check if we can list contents
                if (linkConfig.type === 'directory') {
                    fs.readdirSync(targetPath);
                }
                
                results.successful++;
                console.log(`    ✅ ${path.basename(targetPath)}: Working`);
                
            } catch (error) {
                results.failed.push({
                    target: targetPath,
                    error: error.message
                });
                console.log(`    ❌ ${path.basename(targetPath)}: ${error.message}`);
            }
        }
        
        if (results.failed.length > 0) {
            throw new Error(`${results.failed.length} symlinks failed verification`);
        }
        
        console.log(`✅ All ${results.total} symlinks verified successfully`);
    }

    /**
     * CLEANUP SYMLINKS
     * Remove all created symbolic links
     */
    async cleanupSymlinks() {
        console.log(`🧹 Cleaning up symbolic links...`);
        
        for (const linkConfig of this.config.symlinkTargets) {
            const targetPath = path.resolve(linkConfig.target);
            
            try {
                if (fs.existsSync(targetPath) && fs.lstatSync(targetPath).isSymbolicLink()) {
                    fs.unlinkSync(targetPath);
                    console.log(`    🗑️ Removed: ${path.basename(targetPath)}`);
                }
            } catch (error) {
                console.log(`    ⚠️ Failed to remove ${targetPath}: ${error.message}`);
            }
        }
        
        console.log(`✅ Symlink cleanup complete`);
    }

    /**
     * HEALTH CHECK
     * Verify reference system is working
     */
    healthCheck() {
        console.log(`🏥 Running reference system health check...`);
        
        const health = {
            status: 'HEALTHY',
            checks: [],
            issues: []
        };
        
        // Check 1: Symlinks exist and are accessible
        for (const linkConfig of this.config.symlinkTargets) {
            const targetPath = path.resolve(linkConfig.target);
            const check = {
                name: `Symlink: ${path.basename(targetPath)}`,
                status: 'PASS',
                details: null
            };
            
            try {
                if (!fs.existsSync(targetPath)) {
                    throw new Error('Symlink does not exist');
                }
                
                if (!fs.lstatSync(targetPath).isSymbolicLink()) {
                    throw new Error('Path exists but is not a symlink');
                }
                
                // Test accessibility
                fs.accessSync(targetPath, fs.constants.R_OK);
                
                check.details = `→ ${fs.readlinkSync(targetPath)}`;
                
            } catch (error) {
                check.status = 'FAIL';
                check.details = error.message;
                health.status = 'UNHEALTHY';
                health.issues.push(`${check.name}: ${error.message}`);
            }
            
            health.checks.push(check);
        }
        
        // Check 2: Can require dependencies through symlinks
        try {
            const basePage = require(path.resolve('auto-coder/SBS_Automation/pages/common/base-page.js'));
            const By = require(path.resolve('auto-coder/SBS_Automation/support/By.js'));
            
            health.checks.push({
                name: 'Dependency Loading',
                status: 'PASS',
                details: 'BasePage and By.js loaded successfully'
            });
            
        } catch (error) {
            health.checks.push({
                name: 'Dependency Loading',
                status: 'FAIL',
                details: error.message
            });
            health.status = 'UNHEALTHY';
            health.issues.push(`Dependency loading failed: ${error.message}`);
        }
        
        console.log(`🏥 Health check complete: ${health.status}`);
        return health;
    }

    /**
     * AUTO-REPAIR
     * Fix common symlink issues
     */
    async autoRepair() {
        console.log(`🔧 Running auto-repair...`);
        
        try {
            // Remove broken symlinks
            await this.cleanupSymlinks();
            
            // Recreate all symlinks
            await this.createSymbolicLinks();
            
            // Verify repair
            this.verifySymlinks();
            
            console.log(`✅ Auto-repair completed successfully`);
            return { success: true };
            
        } catch (error) {
            console.error(`❌ Auto-repair failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
}

module.exports = SymlinkReferenceSystem;
