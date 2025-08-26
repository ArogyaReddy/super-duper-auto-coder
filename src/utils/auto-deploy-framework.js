/**
 * 🚀 AUTO-DEPLOY FRAMEWORK
 * 
 * SOLVES: Seamless testing without manual deployment
 * APPROACH: Automatic staging → production deployment with testing
 * 
 * BENEFITS:
 * ✅ Test immediately after generation
 * ✅ Automatic rollback on failures
 * ✅ Zero manual deployment steps
 * ✅ Full validation pipeline
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AutoDeployFramework {
    constructor() {
        this.config = {
            stagingPath: 'auto-coder/SBS_Automation',
            productionPath: '../SBS_Automation', 
            backupPath: 'auto-coder/temp/backup',
            deploymentLog: 'auto-coder/temp/deployment.log'
        };
        
        this.deploymentSession = {
            id: Date.now(),
            deployedFiles: [],
            backupFiles: [],
            status: 'READY'
        };
    }

    /**
     * INTELLIGENT DEPLOYMENT PIPELINE
     * 1. Generate artifacts in staging
     * 2. Validate staging artifacts
     * 3. Backup existing production files
     * 4. Deploy to production
     * 5. Run tests in production
     * 6. Rollback if tests fail
     */
    async deployAndTest(generatedArtifacts) {
        console.log(`🚀 Starting Auto-Deploy Pipeline - Session: ${this.deploymentSession.id}`);
        
        try {
            // Step 1: Validate staging artifacts
            this.validateStagingArtifacts(generatedArtifacts);
            
            // Step 2: Create backup of production
            await this.backupProductionFiles(generatedArtifacts);
            
            // Step 3: Deploy to production
            await this.deployToProduction(generatedArtifacts);
            
            // Step 4: Run validation tests
            const testResults = await this.runValidationTests(generatedArtifacts);
            
            if (testResults.success) {
                this.finalizeDeployment();
                console.log(`✅ Deployment successful! Files deployed and tested.`);
                return { success: true, session: this.deploymentSession.id };
            } else {
                await this.rollbackDeployment();
                console.log(`❌ Tests failed. Deployment rolled back.`);
                return { success: false, errors: testResults.errors };
            }
            
        } catch (error) {
            console.error(`🚨 Deployment failed: ${error.message}`);
            await this.rollbackDeployment();
            return { success: false, error: error.message };
        }
    }

    /**
     * STAGING VALIDATION
     * Ensure artifacts are ready for deployment
     */
    validateStagingArtifacts(artifacts) {
        console.log(`🔍 Validating staging artifacts...`);
        
        for (const artifact of artifacts) {
            const stagingPath = path.join(this.config.stagingPath, artifact.relativePath);
            
            if (!fs.existsSync(stagingPath)) {
                throw new Error(`Missing staging artifact: ${stagingPath}`);
            }
            
            // Validate file is not empty
            const content = fs.readFileSync(stagingPath, 'utf8');
            if (content.trim().length === 0) {
                throw new Error(`Empty staging artifact: ${stagingPath}`);
            }
            
            // Validate SBS compliance
            this.validateSBSCompliance(content, artifact.type);
        }
        
        console.log(`✅ Staging validation complete`);
    }

    /**
     * PRODUCTION BACKUP
     * Create recovery point before deployment
     */
    async backupProductionFiles(artifacts) {
        console.log(`💾 Creating production backup...`);
        
        const backupDir = path.join(this.config.backupPath, this.deploymentSession.id.toString());
        fs.mkdirSync(backupDir, { recursive: true });
        
        for (const artifact of artifacts) {
            const productionPath = path.join(this.config.productionPath, artifact.relativePath);
            
            if (fs.existsSync(productionPath)) {
                const backupPath = path.join(backupDir, artifact.relativePath);
                fs.mkdirSync(path.dirname(backupPath), { recursive: true });
                fs.copyFileSync(productionPath, backupPath);
                
                this.deploymentSession.backupFiles.push({
                    original: productionPath,
                    backup: backupPath
                });
            }
        }
        
        console.log(`✅ Backup created: ${this.deploymentSession.backupFiles.length} files`);
    }

    /**
     * DEPLOYMENT EXECUTION
     * Move staging artifacts to production
     */
    async deployToProduction(artifacts) {
        console.log(`📦 Deploying to production...`);
        
        for (const artifact of artifacts) {
            const stagingPath = path.join(this.config.stagingPath, artifact.relativePath);
            const productionPath = path.join(this.config.productionPath, artifact.relativePath);
            
            // Ensure production directory exists
            fs.mkdirSync(path.dirname(productionPath), { recursive: true });
            
            // Copy file to production
            fs.copyFileSync(stagingPath, productionPath);
            
            this.deploymentSession.deployedFiles.push({
                staging: stagingPath,
                production: productionPath,
                type: artifact.type
            });
        }
        
        console.log(`✅ Deployment complete: ${this.deploymentSession.deployedFiles.length} files`);
    }

    /**
     * VALIDATION TESTING
     * Run tests in production environment
     */
    async runValidationTests(artifacts) {
        console.log(`🧪 Running validation tests...`);
        
        const results = {
            success: true,
            errors: [],
            testResults: []
        };
        
        try {
            // Test 1: Syntax validation
            for (const deployedFile of this.deploymentSession.deployedFiles) {
                if (deployedFile.type === 'steps' || deployedFile.type === 'pages') {
                    try {
                        require(path.resolve(deployedFile.production));
                        results.testResults.push({
                            test: 'syntax',
                            file: deployedFile.production,
                            status: 'PASS'
                        });
                    } catch (error) {
                        results.success = false;
                        results.errors.push(`Syntax error in ${deployedFile.production}: ${error.message}`);
                    }
                }
            }
            
            // Test 2: Feature file validation
            const featureFiles = this.deploymentSession.deployedFiles.filter(f => f.type === 'feature');
            for (const featureFile of featureFiles) {
                const validation = this.validateFeatureFile(featureFile.production);
                if (!validation.valid) {
                    results.success = false;
                    results.errors.push(...validation.errors);
                }
            }
            
            // Test 3: Integration test (optional)
            if (artifacts.some(a => a.runIntegrationTest)) {
                const integrationResult = await this.runIntegrationTest(artifacts);
                if (!integrationResult.success) {
                    results.success = false;
                    results.errors.push(...integrationResult.errors);
                }
            }
            
        } catch (error) {
            results.success = false;
            results.errors.push(`Test execution failed: ${error.message}`);
        }
        
        console.log(`🧪 Validation complete: ${results.success ? 'PASS' : 'FAIL'}`);
        return results;
    }

    /**
     * ROLLBACK MECHANISM
     * Restore previous state on failure
     */
    async rollbackDeployment() {
        console.log(`⏪ Rolling back deployment...`);
        
        // Restore backed up files
        for (const backup of this.deploymentSession.backupFiles) {
            if (fs.existsSync(backup.backup)) {
                fs.copyFileSync(backup.backup, backup.original);
            }
        }
        
        // Remove newly deployed files that didn't have backups
        for (const deployed of this.deploymentSession.deployedFiles) {
            const hasBackup = this.deploymentSession.backupFiles.some(b => b.original === deployed.production);
            if (!hasBackup && fs.existsSync(deployed.production)) {
                fs.unlinkSync(deployed.production);
            }
        }
        
        this.deploymentSession.status = 'ROLLED_BACK';
        console.log(`✅ Rollback complete`);
    }

    /**
     * DEPLOYMENT FINALIZATION
     * Clean up temporary files and log success
     */
    finalizeDeployment() {
        this.deploymentSession.status = 'COMPLETED';
        
        // Log deployment details
        const logEntry = {
            timestamp: new Date().toISOString(),
            sessionId: this.deploymentSession.id,
            deployedFiles: this.deploymentSession.deployedFiles.length,
            status: 'SUCCESS'
        };
        
        this.appendToDeploymentLog(logEntry);
        console.log(`📝 Deployment logged: Session ${this.deploymentSession.id}`);
    }

    /**
     * SBS COMPLIANCE VALIDATION
     */
    validateSBSCompliance(content, type) {
        switch (type) {
            case 'pages':
                if (!content.includes('extends BasePage')) {
                    throw new Error('Page object must extend BasePage');
                }
                if (!content.includes('constructor(page)')) {
                    throw new Error('Page object must have proper constructor');
                }
                break;
                
            case 'steps':
                if (!content.includes('@cucumber/cucumber')) {
                    throw new Error('Step definitions must import cucumber');
                }
                break;
                
            case 'feature':
                if (!content.includes('Feature:')) {
                    throw new Error('Feature file must contain Feature declaration');
                }
                break;
        }
    }

    /**
     * FEATURE FILE VALIDATION
     */
    validateFeatureFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const errors = [];
        
        if (!content.includes('Scenario:')) {
            errors.push('Feature file must contain at least one scenario');
        }
        
        if (!content.includes('@Team:AutoCoder')) {
            errors.push('Feature file must include @Team:AutoCoder tag');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * DEPLOYMENT LOG MANAGEMENT
     */
    appendToDeploymentLog(entry) {
        const logPath = this.config.deploymentLog;
        fs.mkdirSync(path.dirname(logPath), { recursive: true });
        
        const logLine = JSON.stringify(entry) + '\n';
        fs.appendFileSync(logPath, logLine);
    }

    /**
     * DEPLOYMENT HISTORY
     */
    getDeploymentHistory(limit = 10) {
        const logPath = this.config.deploymentLog;
        
        if (!fs.existsSync(logPath)) {
            return [];
        }
        
        const content = fs.readFileSync(logPath, 'utf8');
        const lines = content.trim().split('\n').filter(line => line.trim());
        
        return lines
            .slice(-limit)
            .map(line => JSON.parse(line))
            .reverse();
    }
}

module.exports = AutoDeployFramework;
