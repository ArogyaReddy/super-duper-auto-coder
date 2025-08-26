/**
 * 🧹 AUTO-CODER CLEANUP UTILITY
 * Safely removes generated test artifacts while preserving framework files
 * 100% SBS_Automation Compatible
 */

const fs = require('fs-extra');
const path = require('path');

class ArtifactCleaner {
    constructor(outputDir = './SBS_Automation') {
        this.outputDir = outputDir;
        this.autoCoderDir = './auto-coder/SBS_Automation';
        
        // Essential framework files that should NEVER be deleted
        this.protectedFiles = [
            'support/base-page.js',
            'support/hooks.js',
            'support/world.js',
            'support/By.js',
            'support/helpers.js'
        ];
        
        // Directories to clean - include both main and auto-coder generated
        this.cleanupDirs = {
            features: path.join(outputDir, 'features'),
            steps: path.join(outputDir, 'steps'),
            pages: path.join(outputDir, 'pages'),
            // Auto-coder generated artifacts
            autoCoderFeatures: path.join(this.autoCoderDir, 'features'),
            autoCoderSteps: path.join(this.autoCoderDir, 'steps'),
            autoCoderPages: path.join(this.autoCoderDir, 'pages')
        };
    }

    /**
     * Clean all generated artifacts
     */
    async cleanAll() {
        console.log('🧹 Starting cleanup of generated test artifacts...');
        
        let totalCleaned = 0;
        
        // Clean main SBS_Automation directory
        console.log('📁 Cleaning main SBS_Automation directory...');
        const featuresCount = await this.cleanFeatures();
        totalCleaned += featuresCount;
        
        const stepsCount = await this.cleanSteps();
        totalCleaned += stepsCount;
        
        const pagesCount = await this.cleanPages();
        totalCleaned += pagesCount;
        
        // Clean auto-coder generated artifacts
        console.log('📁 Cleaning auto-coder generated artifacts...');
        const autoCoderFeaturesCount = await this.cleanDirectory(this.cleanupDirs.autoCoderFeatures, 'feature');
        totalCleaned += autoCoderFeaturesCount;
        
        const autoCoderStepsCount = await this.cleanDirectory(this.cleanupDirs.autoCoderSteps, 'steps');
        totalCleaned += autoCoderStepsCount;
        
        const autoCoderPagesCount = await this.cleanDirectory(this.cleanupDirs.autoCoderPages, 'pages');
        totalCleaned += autoCoderPagesCount;
        
        console.log(`✅ Cleanup completed! Removed ${totalCleaned} generated files`);
        console.log('🛡️ Protected framework files preserved');
        
        return {
            totalCleaned,
            features: featuresCount,
            steps: stepsCount,
            pages: pagesCount
        };
    }

    /**
     * Clean generated feature files
     */
    async cleanFeatures() {
        const featuresDir = this.cleanupDirs.features;
        
        if (!await fs.pathExists(featuresDir)) {
            console.log('📁 Features directory not found, skipping...');
            return 0;
        }
        
        const files = await fs.readdir(featuresDir);
        const featureFiles = files.filter(file => file.endsWith('.feature'));
        
        let cleaned = 0;
        for (const file of featureFiles) {
            const filePath = path.join(featuresDir, file);
            await fs.remove(filePath);
            console.log(`🗑️ Removed feature: ${file}`);
            cleaned++;
        }
        
        console.log(`📋 Cleaned ${cleaned} feature files`);
        return cleaned;
    }

    /**
     * Clean generated step files (preserve protected ones)
     */
    async cleanSteps() {
        const stepsDir = this.cleanupDirs.steps;
        
        if (!await fs.pathExists(stepsDir)) {
            console.log('📁 Steps directory not found, skipping...');
            return 0;
        }
        
        const files = await fs.readdir(stepsDir);
        const stepFiles = files.filter(file => file.endsWith('.js'));
        
        let cleaned = 0;
        for (const file of stepFiles) {
            // Skip common-steps.js and other protected files
            if (this.isProtectedStepFile(file)) {
                console.log(`🛡️ Preserving protected step file: ${file}`);
                continue;
            }
            
            const filePath = path.join(stepsDir, file);
            await fs.remove(filePath);
            console.log(`🗑️ Removed step file: ${file}`);
            cleaned++;
        }
        
        console.log(`🎯 Cleaned ${cleaned} step files`);
        return cleaned;
    }

    /**
     * Clean generated page files (preserve protected ones)
     */
    async cleanPages() {
        const pagesDir = this.cleanupDirs.pages;
        
        if (!await fs.pathExists(pagesDir)) {
            console.log('📁 Pages directory not found, skipping...');
            return 0;
        }
        
        const files = await fs.readdir(pagesDir);
        const pageFiles = files.filter(file => file.endsWith('.js'));
        
        let cleaned = 0;
        for (const file of pageFiles) {
            // Skip base-page.js and other protected files
            if (this.isProtectedPageFile(file)) {
                console.log(`🛡️ Preserving protected page file: ${file}`);
                continue;
            }
            
            const filePath = path.join(pagesDir, file);
            await fs.remove(filePath);
            console.log(`🗑️ Removed page file: ${file}`);
            cleaned++;
        }
        
        console.log(`📄 Cleaned ${cleaned} page files`);
        return cleaned;
    }

    /**
     * Check if step file is protected
     */
    isProtectedStepFile(filename) {
        const protectedStepFiles = [
            'common-steps.js',
            'hooks.js',
            'world.js'
        ];
        return protectedStepFiles.includes(filename);
    }

    /**
     * Check if page file is protected
     */
    isProtectedPageFile(filename) {
        const protectedPageFiles = [
            'base-page.js',
            'common-page.js'
        ];
        return protectedPageFiles.includes(filename);
    }

    /**
     * Clean artifacts for specific requirement
     */
    async cleanSpecific(baseName) {
        console.log(`🎯 Cleaning artifacts for: ${baseName}`);
        
        let cleaned = 0;
        
        // Remove specific feature
        const featureFile = path.join(this.cleanupDirs.features, `${baseName}.feature`);
        if (await fs.pathExists(featureFile)) {
            await fs.remove(featureFile);
            console.log(`🗑️ Removed feature: ${baseName}.feature`);
            cleaned++;
        }
        
        // Remove specific step file
        const stepFile = path.join(this.cleanupDirs.steps, `${baseName}-steps.js`);
        if (await fs.pathExists(stepFile)) {
            await fs.remove(stepFile);
            console.log(`🗑️ Removed steps: ${baseName}-steps.js`);
            cleaned++;
        }
        
        // Remove specific page file
        const pageFile = path.join(this.cleanupDirs.pages, `${baseName}-page.js`);
        if (await fs.pathExists(pageFile)) {
            await fs.remove(pageFile);
            console.log(`🗑️ Removed page: ${baseName}-page.js`);
            cleaned++;
        }
        
        console.log(`✅ Cleaned ${cleaned} files for ${baseName}`);
        return cleaned;
    }

    /**
     * List all generated artifacts
     */
    async listArtifacts() {
        console.log('📋 Generated Test Artifacts:');
        console.log('=' .repeat(40));
        
        const artifacts = {
            features: [],
            steps: [],
            pages: []
        };
        
        // List features
        if (await fs.pathExists(this.cleanupDirs.features)) {
            const files = await fs.readdir(this.cleanupDirs.features);
            artifacts.features = files.filter(f => f.endsWith('.feature'));
        }
        
        // List steps (exclude protected)
        if (await fs.pathExists(this.cleanupDirs.steps)) {
            const files = await fs.readdir(this.cleanupDirs.steps);
            artifacts.steps = files.filter(f => 
                f.endsWith('.js') && !this.isProtectedStepFile(f)
            );
        }
        
        // List pages (exclude protected)
        if (await fs.pathExists(this.cleanupDirs.pages)) {
            const files = await fs.readdir(this.cleanupDirs.pages);
            artifacts.pages = files.filter(f => 
                f.endsWith('.js') && !this.isProtectedPageFile(f)
            );
        }
        
        console.log(`🥒 Features (${artifacts.features.length}):`);
        artifacts.features.forEach(f => console.log(`   ├── ${f}`));
        
        console.log(`🎯 Steps (${artifacts.steps.length}):`);
        artifacts.steps.forEach(f => console.log(`   ├── ${f}`));
        
        console.log(`📄 Pages (${artifacts.pages.length}):`);
        artifacts.pages.forEach(f => console.log(`   └── ${f}`));
        
        return artifacts;
    }

    /**
     * Backup artifacts before cleaning
     */
    async backupArtifacts() {
        const backupDir = path.join(this.outputDir, '..', 'backup', `artifacts-${Date.now()}`);
        await fs.ensureDir(backupDir);
        
        console.log(`💾 Backing up artifacts to: ${backupDir}`);
        
        // Backup features
        if (await fs.pathExists(this.cleanupDirs.features)) {
            const featuresBackup = path.join(backupDir, 'features');
            await fs.copy(this.cleanupDirs.features, featuresBackup);
        }
        
        // Backup steps (only generated ones)
        if (await fs.pathExists(this.cleanupDirs.steps)) {
            const stepsBackup = path.join(backupDir, 'steps');
            await fs.ensureDir(stepsBackup);
            
            const files = await fs.readdir(this.cleanupDirs.steps);
            for (const file of files) {
                if (file.endsWith('.js') && !this.isProtectedStepFile(file)) {
                    await fs.copy(
                        path.join(this.cleanupDirs.steps, file),
                        path.join(stepsBackup, file)
                    );
                }
            }
        }
        
        // Backup pages (only generated ones)
        if (await fs.pathExists(this.cleanupDirs.pages)) {
            const pagesBackup = path.join(backupDir, 'pages');
            await fs.ensureDir(pagesBackup);
            
            const files = await fs.readdir(this.cleanupDirs.pages);
            for (const file of files) {
                if (file.endsWith('.js') && !this.isProtectedPageFile(file)) {
                    await fs.copy(
                        path.join(this.cleanupDirs.pages, file),
                        path.join(pagesBackup, file)
                    );
                }
            }
        }
        
        console.log('✅ Backup completed successfully');
        return backupDir;
    }

    /**
     * Generic method to clean a directory of generated artifacts
     */
    async cleanDirectory(dirPath, type) {
        if (!await fs.pathExists(dirPath)) {
            console.log(`📁 ${type} directory not found: ${dirPath}`);
            return 0;
        }

        const files = await fs.readdir(dirPath);
        let cleaned = 0;

        for (const file of files) {
            // Skip protected files based on type
            if (type === 'pages' && this.isProtectedPageFile(file)) {
                console.log(`🛡️ Preserving protected ${type} file: ${file}`);
                continue;
            }
            if (type === 'steps' && this.isProtectedStepFile(file)) {
                console.log(`🛡️ Preserving protected ${type} file: ${file}`);
                continue;
            }

            const filePath = path.join(dirPath, file);
            const stat = await fs.stat(filePath);
            
            if (stat.isFile() && file.endsWith('.js') || file.endsWith('.feature')) {
                await fs.remove(filePath);
                console.log(`🗑️ Removed ${type} file: ${file}`);
                cleaned++;
            }
        }

        console.log(`🎯 Cleaned ${cleaned} ${type} files from ${path.basename(dirPath)}`);
        return cleaned;
    }
}

module.exports = ArtifactCleaner;
