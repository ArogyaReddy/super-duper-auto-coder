#!/usr/bin/env node
/**
 * Auto-Coder Artifact Deployment Script
 * Copies generated artifacts to main SBS_Automation with path corrections
 */

const fs = require('fs');
const path = require('path');

class ArtifactDeployer {
  constructor() {
    this.autoCoderPath = '/Users/gadea/auto/auto/qa_automation/auto-coder/SBS_Automation';
    this.mainSBSPath = '/Users/gadea/auto/auto/qa_automation/SBS_Automation';
    this.deployedCount = 0;
  }

  /**
   * Deploy all artifacts from auto-coder to main SBS_Automation
   */
  async deployAllArtifacts() {
    console.log('🚀 Starting artifact deployment...');
    
    // Create auto-coder directories in main SBS_Automation
    this.createAutoCoderDirectories();
    
    // Deploy features
    await this.deployFeatures();
    
    // Deploy steps
    await this.deploySteps();
    
    // Deploy pages
    await this.deployPages();
    
    console.log(`✅ Deployment complete! ${this.deployedCount} files deployed.`);
  }

  /**
   * Create auto-coder subdirectories in main SBS_Automation
   */
  createAutoCoderDirectories() {
    const dirs = [
      `${this.mainSBSPath}/features/auto-coder`,
      `${this.mainSBSPath}/steps/auto-coder`,
      `${this.mainSBSPath}/pages/auto-coder`
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    });
  }

  /**
   * Deploy feature files
   */
  async deployFeatures() {
    const featuresPath = `${this.autoCoderPath}/features`;
    if (!fs.existsSync(featuresPath)) return;

    const files = fs.readdirSync(featuresPath).filter(f => f.endsWith('.feature'));
    
    for (const file of files) {
      const sourcePath = `${featuresPath}/${file}`;
      const targetPath = `${this.mainSBSPath}/features/auto-coder/${file}`;
      
      // Feature files don't need path updates, just copy
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`📋 Deployed feature: ${file}`);
      this.deployedCount++;
    }
  }

  /**
   * Deploy step files with path corrections
   */
  async deploySteps() {
    const stepsPath = `${this.autoCoderPath}/steps`;
    if (!fs.existsSync(stepsPath)) return;

    const files = fs.readdirSync(stepsPath).filter(f => f.endsWith('-steps.js'));
    
    for (const file of files) {
      const sourcePath = `${stepsPath}/${file}`;
      const targetPath = `${this.mainSBSPath}/steps/auto-coder/${file}`;
      
      // Read, update paths, and write
      let content = fs.readFileSync(sourcePath, 'utf8');
      content = this.updateStepsPaths(content);
      
      fs.writeFileSync(targetPath, content);
      console.log(`⚙️ Deployed steps: ${file}`);
      this.deployedCount++;
    }
  }

  /**
   * Deploy page files with path corrections
   */
  async deployPages() {
    const pagesPath = `${this.autoCoderPath}/pages`;
    if (!fs.existsSync(pagesPath)) return;

    const files = fs.readdirSync(pagesPath).filter(f => f.endsWith('-page.js'));
    
    for (const file of files) {
      const sourcePath = `${pagesPath}/${file}`;
      const targetPath = `${this.mainSBSPath}/pages/auto-coder/${file}`;
      
      // Read, update paths, and write
      let content = fs.readFileSync(sourcePath, 'utf8');
      content = this.updatePagePaths(content);
      
      fs.writeFileSync(targetPath, content);
      console.log(`📄 Deployed page: ${file}`);
      this.deployedCount++;
    }
  }

  /**
   * Update import paths in steps files for main SBS_Automation execution
   */
  updateStepsPaths(content) {
    // Update page object imports - steps are in steps/auto-coder/, pages are in pages/auto-coder/
    content = content.replace(
      /require\('\.\.\/pages\/([^']+)'\)/g,
      "require('../../pages/auto-coder/$1')"
    );
    
    // Update main SBS framework imports
    content = content.replace(
      /require\('\.\.\/\.\.\/\.\.\/SBS_Automation\/pages\/common\/([^']+)'\)/g,
      "require('../../pages/common/$1')"
    );
    
    return content;
  }

  /**
   * Update import paths in page files for main SBS_Automation execution
   */
  updatePagePaths(content) {
    // Update BasePage import - pages/auto-coder/ to pages/common/ is ../common/
    content = content.replace(
      /require\('\.\.\/\.\.\/\.\.\/SBS_Automation\/pages\/common\/base-page'\)/g,
      "require('../common/base-page')"
    );
    
    // Update By.js import - pages/auto-coder/ to support/ is ../../support/
    // Also fix destructuring to match SBS_Automation pattern
    content = content.replace(
      /const \{ By \} = require\('\.\.\/\.\.\/\.\.\/SBS_Automation\/support\/By\.js'\);/g,
      "const By = require('../../support/By.js');"
    );
    
    return content;
  }

  /**
   * Deploy specific artifact by name
   */
  async deployArtifact(artifactName) {
    console.log(`🎯 Deploying specific artifact: ${artifactName}`);
    
    this.createAutoCoderDirectories();
    
    // Deploy feature
    const featurePath = `${this.autoCoderPath}/features/${artifactName}.feature`;
    if (fs.existsSync(featurePath)) {
      const targetPath = `${this.mainSBSPath}/features/auto-coder/${artifactName}.feature`;
      fs.copyFileSync(featurePath, targetPath);
      console.log(`📋 Deployed: ${artifactName}.feature`);
    }
    
    // Deploy steps
    const stepsPath = `${this.autoCoderPath}/steps/${artifactName}-steps.js`;
    if (fs.existsSync(stepsPath)) {
      const targetPath = `${this.mainSBSPath}/steps/auto-coder/${artifactName}-steps.js`;
      let content = fs.readFileSync(stepsPath, 'utf8');
      content = this.updateStepsPaths(content);
      fs.writeFileSync(targetPath, content);
      console.log(`⚙️ Deployed: ${artifactName}-steps.js`);
    }
    
    // Deploy page
    const pagePath = `${this.autoCoderPath}/pages/${artifactName}-page.js`;
    if (fs.existsSync(pagePath)) {
      const targetPath = `${this.mainSBSPath}/pages/auto-coder/${artifactName}-page.js`;
      let content = fs.readFileSync(pagePath, 'utf8');
      content = this.updatePagePaths(content);
      fs.writeFileSync(targetPath, content);
      console.log(`📄 Deployed: ${artifactName}-page.js`);
    }
    
    console.log(`✅ ${artifactName} deployment complete!`);
  }
}

// CLI interface
if (require.main === module) {
  const deployer = new ArtifactDeployer();
  const command = process.argv[2];
  const artifactName = process.argv[3];
  
  if (command === 'deploy-all') {
    deployer.deployAllArtifacts();
  } else if (command === 'deploy' && artifactName) {
    deployer.deployArtifact(artifactName);
  } else {
    console.log(`
🚀 Auto-Coder Artifact Deployer

Usage:
  node deploy-artifacts.js deploy-all                    # Deploy all artifacts
  node deploy-artifacts.js deploy <artifact-name>       # Deploy specific artifact

Examples:
  node deploy-artifacts.js deploy billing-invoices
  node deploy-artifacts.js deploy-all
    `);
  }
}

module.exports = ArtifactDeployer;
