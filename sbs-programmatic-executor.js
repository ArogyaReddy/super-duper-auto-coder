/**
 * Programmatic SBS_Automation Executor
 * Runs SBS authentication scenarios without full Cucumber setup
 */

const { execSync } = require('child_process');
const path = require('path');

class SBSProgrammaticExecutor {
  constructor() {
    this.sbsPath = path.resolve(__dirname, '../SBS_Automation');
    this.autoCoderPath = path.resolve(__dirname, '../auto-coder');
  }

  /**
   * Execute SBS login scenario programmatically
   * @param {string} scenarioType - 'client' or 'service'
   * @param {Object} options - Execution options
   */
  async executeSBSLogin(scenarioType = 'client', options = {}) {
    try {
      console.log(`🚀 Executing SBS_Automation login scenario: ${scenarioType}`);
      
      const command = this.buildSBSCommand(scenarioType, options);
      console.log(`📝 Command: ${command}`);
      
      // Execute SBS_Automation scenario
      const result = execSync(command, {
        cwd: this.sbsPath,
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 120000 // 2 minutes timeout
      });
      
      console.log('✅ SBS_Automation execution completed successfully');
      
      return {
        success: true,
        output: result,
        method: 'SBS_Programmatic',
        scenarioType: scenarioType
      };
      
    } catch (error) {
      console.error(`❌ SBS_Automation execution failed: ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        stderr: error.stderr?.toString(),
        method: 'SBS_Programmatic',
        scenarioType: scenarioType
      };
    }
  }

  /**
   * Build SBS_Automation command based on scenario type
   */
  buildSBSCommand(scenarioType, options) {
    const baseCommand = 'node index.js';
    const featureFile = this.getFeatureFile(scenarioType);
    const tagExpression = this.getTagExpression(scenarioType);
    
    let command = `${baseCommand} --featureFiles ${featureFile}`;
    
    if (tagExpression) {
      command += ` --tagExpression "${tagExpression}"`;
    }
    
    // Add common options
    command += ' --headless true';
    command += ' --browser chrome';
    command += ' --environment fit';
    
    // Add custom options
    if (options.parallel) {
      command += ` --parallel ${options.parallel}`;
    }
    
    if (options.timeout) {
      command += ` --timeOut ${options.timeout}`;
    }
    
    return command;
  }

  /**
   * Get feature file path based on scenario type
   */
  getFeatureFile(scenarioType) {
    switch (scenarioType) {
      case 'client':
        return './features/auto-coder/client-login.feature';
      case 'service':
        return './features/auto-coder/service-login.feature';
      default:
        return './features/auto-coder/basic-login.feature';
    }
  }

  /**
   * Get tag expression for scenario filtering
   */
  getTagExpression(scenarioType) {
    switch (scenarioType) {
      case 'client':
        return '@auto-coder-client and not @ignore';
      case 'service':
        return '@auto-coder-service and not @ignore';
      default:
        return '@auto-coder and not @ignore';
    }
  }

  /**
   * Create minimal feature files for auto-coder in SBS_Automation
   */
  async createSBSFeatureFiles() {
    const fs = require('fs').promises;
    
    // Create auto-coder directory in SBS_Automation features
    const autoCoderFeaturesDir = path.join(this.sbsPath, 'features', 'auto-coder');
    
    try {
      await fs.mkdir(autoCoderFeaturesDir, { recursive: true });
      
      // Client login feature
      const clientFeature = `Feature: Auto-Coder Client Authentication

@auto-coder-client
Scenario: Client login for auto-coder integration
  Given Alex is logged into RunMod with a homepage test client
  Then Alex should see the homepage carousel`;
      
      await fs.writeFile(path.join(autoCoderFeaturesDir, 'client-login.feature'), clientFeature);
      
      // Service login feature  
      const serviceFeature = `Feature: Auto-Coder Service Authentication

@auto-coder-service  
Scenario: Service user login for auto-coder integration
  Given Alex is logged into RunMod as a owner user
  Then Alex should see the homepage carousel`;
      
      await fs.writeFile(path.join(autoCoderFeaturesDir, 'service-login.feature'), serviceFeature);
      
      console.log('✅ Created SBS_Automation feature files for auto-coder');
      
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to create SBS feature files: ${error.message}`);
      return false;
    }
  }

  /**
   * Execute and capture session for auto-coder use
   */
  async executeAndCaptureSession(scenarioType = 'client') {
    try {
      // Ensure feature files exist
      await this.createSBSFeatureFiles();
      
      // Execute SBS scenario
      const result = await this.executeSBSLogin(scenarioType);
      
      if (result.success) {
        // Parse and extract session information
        const sessionInfo = this.parseSessionFromOutput(result.output);
        
        // Save session for auto-coder use
        await this.saveSessionForAutoCoder(sessionInfo, scenarioType);
        
        return {
          success: true,
          sessionInfo: sessionInfo,
          sbsResult: result
        };
      } else {
        return result;
      }
      
    } catch (error) {
      console.error(`❌ Execute and capture session failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Parse session information from SBS output
   */
  parseSessionFromOutput(output) {
    // Extract relevant session info from SBS execution output
    // This would parse the SBS logs to extract login success, user info, etc.
    
    return {
      timestamp: new Date().toISOString(),
      status: 'authenticated',
      method: 'SBS_Programmatic',
      // Add more session details as needed
    };
  }

  /**
   * Save session information for auto-coder use
   */
  async saveSessionForAutoCoder(sessionInfo, scenarioType) {
    const fs = require('fs').promises;
    const sessionFile = path.join(this.autoCoderPath, 'temp', `sbs-session-${scenarioType}.json`);
    
    try {
      await fs.mkdir(path.dirname(sessionFile), { recursive: true });
      await fs.writeFile(sessionFile, JSON.stringify(sessionInfo, null, 2));
      console.log(`💾 Saved session info to: ${sessionFile}`);
    } catch (error) {
      console.error(`❌ Failed to save session info: ${error.message}`);
    }
  }
}

module.exports = SBSProgrammaticExecutor;
