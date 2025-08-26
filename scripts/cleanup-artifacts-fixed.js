#!/usr/bin/env node

/**
 * Auto-Coder Artifacts Cleanup Utility - FIXED VERSION
 * Safely removes generated test artifacts while preserving essential framework files
 */

const fs = require('fs');
const path = require('path');

class ArtifactsCleanup {
    constructor() {
        this.baseDir = path.resolve(__dirname, '..');
        this.sbsDir = path.join(this.baseDir, 'SBS_Automation');
        
        // Essential files that should NEVER be deleted
        this.preserveFiles = [
            'base-page.js',
            'common-steps.js',
            'world.js',
            'hooks.js',
            'index.js',
            'By.js'
        ];
        
        // Essential directories that should be preserved
        this.preserveDirs = [
            'support',
            'hooks',
            'config',
            'common'
        ];
        
        // Directories containing generated artifacts
        this.artifactDirs = [
            path.join(this.sbsDir, 'features'),
            path.join(this.sbsDir, 'steps'),
            path.join(this.sbsDir, 'pages')
        ];
    }

    /**
     * Get all generated artifact files - IMPROVED VERSION
     */
    getGeneratedArtifacts() {
        const artifacts = {
            features: [],
            steps: [],
            pages: [],
            total: 0
        };

        this.artifactDirs.forEach(dir => {
            if (!fs.existsSync(dir)) return;

            const files = fs.readdirSync(dir, { withFileTypes: true });
            const dirName = path.basename(dir);

            files.forEach(file => {
                if (file.isFile()) {
                    const fileName = file.name;
                    const filePath = path.join(dir, fileName);
                    
                    if (this.isGeneratedArtifact(fileName, dirName)) {
                        const stat = fs.statSync(filePath);
                        artifacts[dirName].push({
                            name: fileName,
                            path: filePath,
                            size: stat.size,
                            created: stat.birthtime
                        });
                        artifacts.total++;
                    }
                }
            });
        });

        // Also check common pages directory
        const commonPagesDir = path.join(this.sbsDir, 'pages', 'common');
        if (fs.existsSync(commonPagesDir)) {
            const files = fs.readdirSync(commonPagesDir, { withFileTypes: true });
            files.forEach(file => {
                if (file.isFile()) {
                    const fileName = file.name;
                    const filePath = path.join(commonPagesDir, fileName);
                    
                    if (this.isGeneratedArtifact(fileName, 'pages')) {
                        const stat = fs.statSync(filePath);
                        artifacts.pages.push({
                            name: `common/${fileName}`,
                            path: filePath,
                            size: stat.size,
                            created: stat.birthtime
                        });
                        artifacts.total++;
                    }
                }
            });
        }

        return artifacts;
    }

    /**
     * Check if file is a generated artifact - IMPROVED VERSION
     */
    isGeneratedArtifact(filename, dirName) {
        // Never delete essential files
        if (this.preserveFiles.includes(filename)) {
            return false;
        }

        // Skip essential directories
        if (this.preserveDirs.includes(filename)) {
            return false;
        }

        // For features directory - most .feature files are generated
        if (dirName === 'features') {
            // Preserve these specific template/example files
            const preserveFeatures = [
                'sample-hooks.feature',
                'example.feature',
                'template.feature',
                'framework-test.feature'
            ];
            
            if (preserveFeatures.includes(filename) || !filename.endsWith('.feature')) {
                return false;
            }
            
            // All other .feature files are considered generated
            return true;
        }

        // For steps directory - include all step files except essential ones
        if (dirName === 'steps') {
            if (this.preserveFiles.includes(filename)) {
                return false;
            }
            return filename.endsWith('-steps.js') || filename.endsWith('_steps.js');
        }

        // For pages directory - include all page files except essential ones
        if (dirName === 'pages') {
            if (this.preserveFiles.includes(filename)) {
                return false;
            }
            return filename.endsWith('-page.js') || filename.endsWith('_page.js');
        }

        return false;
    }

    /**
     * List all generated artifacts
     */
    listArtifacts() {
        const artifacts = this.getGeneratedArtifacts();
        
        console.log('\n🧹 GENERATED ARTIFACTS FOUND:');
        console.log('=====================================');
        
        if (artifacts.total === 0) {
            console.log('✅ No generated artifacts found to clean');
            return artifacts;
        }

        ['features', 'steps', 'pages'].forEach(type => {
            if (artifacts[type].length > 0) {
                console.log(`\n📁 ${type.toUpperCase()} (${artifacts[type].length} files):`);
                artifacts[type].forEach(file => {
                    const sizeKB = (file.size / 1024).toFixed(2);
                    console.log(`   ${file.name} (${sizeKB} KB)`);
                });
            }
        });

        console.log(`\n📊 Total: ${artifacts.total} generated artifact files`);
        return artifacts;
    }

    /**
     * Clean all generated artifacts
     */
    cleanAll() {
        const artifacts = this.getGeneratedArtifacts();
        
        if (artifacts.total === 0) {
            console.log('✅ No artifacts to clean');
            return;
        }

        console.log(`\n🧹 Cleaning ${artifacts.total} generated artifacts...`);
        
        let cleaned = 0;
        ['features', 'steps', 'pages'].forEach(type => {
            artifacts[type].forEach(file => {
                try {
                    fs.unlinkSync(file.path);
                    console.log(`✅ Deleted: ${file.name}`);
                    cleaned++;
                } catch (error) {
                    console.log(`❌ Failed to delete: ${file.name} - ${error.message}`);
                }
            });
        });

        console.log(`\n🎉 Cleanup completed: ${cleaned}/${artifacts.total} files removed`);
        this.showPreservedFiles();
    }

    /**
     * Clean specific artifact by name pattern
     */
    cleanSpecific(pattern) {
        const artifacts = this.getGeneratedArtifacts();
        const regex = new RegExp(pattern, 'i');
        
        let cleaned = 0;
        ['features', 'steps', 'pages'].forEach(type => {
            artifacts[type].forEach(file => {
                if (regex.test(file.name)) {
                    try {
                        fs.unlinkSync(file.path);
                        console.log(`✅ Deleted: ${file.name}`);
                        cleaned++;
                    } catch (error) {
                        console.log(`❌ Failed to delete: ${file.name} - ${error.message}`);
                    }
                }
            });
        });

        if (cleaned === 0) {
            console.log(`❌ No artifacts found matching pattern: ${pattern}`);
        } else {
            console.log(`\n🎉 Cleanup completed: ${cleaned} files removed`);
            this.showPreservedFiles();
        }
    }

    /**
     * Show preserved essential files
     */
    showPreservedFiles() {
        console.log('\n🛡️  PRESERVED ESSENTIAL FILES:');
        console.log('=====================================');
        
        this.artifactDirs.forEach(dir => {
            if (!fs.existsSync(dir)) return;

            const files = fs.readdirSync(dir);
            const dirName = path.basename(dir);
            const preserved = files.filter(file => 
                this.preserveFiles.includes(file) && 
                fs.statSync(path.join(dir, file)).isFile()
            );

            if (preserved.length > 0) {
                console.log(`\n📁 ${dirName}:`);
                preserved.forEach(file => {
                    console.log(`   ✅ ${file} (preserved)`);
                });
            }
        });
    }

    /**
     * Backup artifacts before cleaning
     */
    backupArtifacts() {
        const artifacts = this.getGeneratedArtifacts();
        
        if (artifacts.total === 0) {
            console.log('✅ No artifacts to backup');
            return;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const backupDir = path.join(this.baseDir, 'backup', `artifacts-${timestamp}`);
        
        // Create backup directory
        fs.mkdirSync(backupDir, { recursive: true });
        
        console.log(`\n💾 Backing up ${artifacts.total} artifacts to: ${backupDir}`);
        
        let backed = 0;
        ['features', 'steps', 'pages'].forEach(type => {
            if (artifacts[type].length > 0) {
                const typeDir = path.join(backupDir, type);
                fs.mkdirSync(typeDir, { recursive: true });
                
                artifacts[type].forEach(file => {
                    try {
                        const backupPath = path.join(typeDir, path.basename(file.name));
                        fs.copyFileSync(file.path, backupPath);
                        console.log(`✅ Backed up: ${file.name}`);
                        backed++;
                    } catch (error) {
                        console.log(`❌ Failed to backup: ${file.name} - ${error.message}`);
                    }
                });
            }
        });

        console.log(`\n🎉 Backup completed: ${backed}/${artifacts.total} files backed up`);
        return backupDir;
    }
}

// CLI Interface
function main() {
    const cleanup = new ArtifactsCleanup();
    const args = process.argv.slice(2);
    const command = args[0];

    console.log('🧹 Auto-Coder Artifacts Cleanup Utility');
    console.log('==========================================');

    switch (command) {
        case 'list':
            cleanup.listArtifacts();
            break;

        case 'all':
            cleanup.cleanAll();
            break;

        case 'specific':
            if (!args[1]) {
                console.log('❌ Please provide a pattern: node scripts/cleanup-artifacts.js specific <pattern>');
                process.exit(1);
            }
            cleanup.cleanSpecific(args[1]);
            break;

        case 'backup':
            cleanup.backupArtifacts();
            break;

        case 'backup-clean':
            cleanup.backupArtifacts();
            console.log('\n🧹 Proceeding with cleanup...');
            cleanup.cleanAll();
            break;

        case 'stats':
            const artifacts = cleanup.listArtifacts();
            console.log('\n📈 CLEANUP STATISTICS:');
            console.log('=====================================');
            console.log(`Total artifacts: ${artifacts.total}`);
            console.log(`Features: ${artifacts.features.length}`);
            console.log(`Steps: ${artifacts.steps.length}`);
            console.log(`Pages: ${artifacts.pages.length}`);
            break;

        default:
            console.log('\n📋 Available Commands:');
            console.log('   node scripts/cleanup-artifacts.js list');
            console.log('   node scripts/cleanup-artifacts.js all');
            console.log('   node scripts/cleanup-artifacts.js specific <pattern>');
            console.log('   node scripts/cleanup-artifacts.js backup');
            console.log('   node scripts/cleanup-artifacts.js backup-clean');
            console.log('   node scripts/cleanup-artifacts.js stats');
            console.log('\n💡 Examples:');
            console.log('   node scripts/cleanup-artifacts.js specific jira-story');
            console.log('   node scripts/cleanup-artifacts.js specific cfc-');
            break;
    }
}

if (require.main === module) {
    main();
}

module.exports = ArtifactsCleanup;
