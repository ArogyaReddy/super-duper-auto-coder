#!/usr/bin/env node

/**
 * Auto-Coder Artifacts Cleanup Utility
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
            'config'
        ];
        
        // Directories containing generated artifacts - include auto-coder SBS_Automation
        this.artifactDirs = [
            path.join(this.sbsDir, 'features'),
            path.join(this.sbsDir, 'steps'),
            path.join(this.sbsDir, 'pages'),
            // Also clean auto-coder generated artifacts
            path.join(this.baseDir, 'auto-coder', 'SBS_Automation', 'features'),
            path.join(this.baseDir, 'auto-coder', 'SBS_Automation', 'steps'), 
            path.join(this.baseDir, 'auto-coder', 'SBS_Automation', 'pages')
        ];
    }

    /**
     * Get all generated artifact files
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

            const dirName = path.basename(dir);
            this.scanDirectoryRecursively(dir, dirName, artifacts);
        });

        return artifacts;
    }

    /**
     * Recursively scan directories for artifacts
     */
    scanDirectoryRecursively(dirPath, dirType, artifacts) {
        const items = fs.readdirSync(dirPath);

        items.forEach(item => {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory()) {
                // Skip if it's a preserved directory
                if (this.preserveDirs.includes(item)) {
                    return;
                }
                // Recursively scan subdirectories
                this.scanDirectoryRecursively(itemPath, dirType, artifacts);
            } else if (stat.isFile()) {
                // Check if file is a generated artifact
                if (this.isGeneratedArtifact(item, dirType, itemPath)) {
                    artifacts[dirType].push({
                        name: item,
                        path: itemPath,
                        size: stat.size,
                        created: stat.birthtime,
                        relativePath: path.relative(path.join(this.sbsDir, dirType), itemPath)
                    });
                    artifacts.total++;
                }
            }
        });
    }

    /**
     * Check if file is a generated artifact (not essential framework file)
     */
    isGeneratedArtifact(filename, dirName, fullPath = null) {
        // Never delete essential files
        if (this.preserveFiles.includes(filename)) {
            return false;
        }

        // Skip directories like 'common'
        if (filename === 'common') {
            return false;
        }

        // For features directory - include most .feature files except templates
        if (dirName === 'features') {
            // Preserve these specific template/example files
            const preserveFeatures = [
                'sample-hooks.feature',
                'example.feature',
                'template.feature'
            ];
            
            if (preserveFeatures.includes(filename)) {
                return false;
            }
            
            // All other .feature files are considered generated
            return filename.endsWith('.feature');
        }

        // For steps directory - include all step files except essential ones
        if (dirName === 'steps') {
            return filename.endsWith('-steps.js') || filename.endsWith('_steps.js');
        }

        // For pages directory - include all page files except essential ones
        if (dirName === 'pages') {
            // Enhanced page file detection - check for page files in any subdirectory
            if (filename.endsWith('-page.js') || filename.endsWith('_page.js')) {
                // Additional check: ensure it's not a base or essential page file
                const essentialPageFiles = [
                    'base-page.js',
                    'common-page.js',
                    'index-page.js'
                ];
                
                if (essentialPageFiles.includes(filename)) {
                    return false;
                }
                
                return true;
            }
            
            // Also check for files with .page.js extension
            if (filename.includes('.page.js')) {
                return true;
            }
            
            return false;
        }

        // Expanded patterns for generated files - more inclusive
        const generatedPatterns = [
            // Existing patterns
            /^bdd-req-\d+/,                    // BDD template files
            /^bddreq/,                         // All bddreq variations
            /^jira-story/,                     // JIRA story files
            /^story-/,                         // Story files
            /^service-/,                       // Service files
            /^payroll-/,                       // Payroll files
            /^employee-/,                      // Employee files
            /^cfc-/,                           // CFC related files
            /^codegen/,                        // All codegen files
            /^test-/,                          // Test files
            /^workers-comp/,                   // Workers comp files
            /^plain-requirements/,             // Plain requirements files
            /^template-/,                      // Template files
            /^curl-/,                          // cURL files
            /^final-/,                         // Final test files
            /^\d{12,14}/,                      // Timestamp-based files
            /-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}/, // Date-time patterns
            
            // New patterns to catch more generated files
            /^bdd-template/,                   // BDD template variations
            /^template-bdd/,                   // Template BDD files
            /^template-easy/,                  // Template easy files
            /^template-simplest/,              // Template simplest files
            /^testnew/,                        // Test new format files
            /^test-no-ai/,                     // Test no AI files
            /^test-fix/,                       // Test fix files
            /fixed\.feature$/,                 // Files ending with "fixed.feature"
            /test\.feature$/,                  // Files ending with "test.feature"
        ];

        return generatedPatterns.some(pattern => pattern.test(filename));
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
                    const displayPath = file.relativePath || file.name;
                    console.log(`   ${file.name} (${sizeKB} KB) ${displayPath !== file.name ? `[${displayPath}]` : ''}`);
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
        }
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
                        const backupPath = path.join(typeDir, file.name);
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
                console.log('❌ Please provide a pattern: npm run cleanup specific <pattern>');
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

        default:
            console.log('\n📋 Available Commands:');
            console.log('   npm run cleanup list             # List all generated artifacts');
            console.log('   npm run cleanup all              # Clean all generated artifacts');
            console.log('   npm run cleanup specific <name>  # Clean specific artifact');
            console.log('   npm run cleanup backup           # Backup artifacts');
            console.log('   npm run cleanup backup-clean     # Backup then clean all');
            console.log('\n💡 Examples:');
            console.log('   npm run cleanup specific bdd-req');
            console.log('   npm run cleanup specific jira-story');
            break;
    }
}

if (require.main === module) {
    main();
}

module.exports = ArtifactsCleanup;
