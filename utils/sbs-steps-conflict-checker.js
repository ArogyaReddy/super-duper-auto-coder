#!/usr/bin/env node

/**
 * SBS Steps Conflict Checker
 * Prevents ambiguous step generation by validating against existing SBS_Automation steps
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SBSStepsConflictChecker {
  constructor() {
    this.sbsStepsRegistry = this.loadStepsRegistry();
    this.sbsAutomationPath = path.join(__dirname, '../../../SBS_Automation');
  }

  loadStepsRegistry() {
    try {
      const registryPath = path.join(__dirname, '../knowledge-base/sbs-steps-registry.json');
      return JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    } catch (error) {
      console.warn('⚠️ SBS steps registry not found, using basic validation');
      return { ambiguous_patterns_to_avoid: [] };
    }
  }

  /**
   * Check if step definition conflicts with existing SBS steps
   */
  checkStepConflict(stepDefinition) {
    try {
      // Search for similar patterns in SBS_Automation
      const searchCommand = `grep -r "${stepDefinition}" ${this.sbsAutomationPath}/steps/ || true`;
      const result = execSync(searchCommand, { encoding: 'utf8' });
      
      if (result.trim()) {
        return {
          hasConflict: true,
          conflicts: result.trim().split('\n'),
          severity: 'HIGH'
        };
      }

      // Check against known ambiguous patterns
      const ambiguousPattern = this.sbsStepsRegistry.ambiguous_patterns_to_avoid?.find(
        pattern => stepDefinition.includes(pattern.pattern.replace('{string}', ''))
      );

      if (ambiguousPattern) {
        return {
          hasConflict: true,
          reason: ambiguousPattern.reason,
          alternative: ambiguousPattern.alternative,
          severity: 'MEDIUM'
        };
      }

      return { hasConflict: false };
    } catch (error) {
      console.warn(`⚠️ Error checking step conflict: ${error.message}`);
      return { hasConflict: false };
    }
  }

  /**
   * Validate feature file for ambiguous steps
   */
  validateFeatureFile(featureFilePath) {
    const content = fs.readFileSync(featureFilePath, 'utf8');
    const lines = content.split('\n');
    const conflicts = [];

    lines.forEach((line, index) => {
      const stepMatch = line.trim().match(/^(Given|When|Then|And)\s+(.+)$/);
      if (stepMatch) {
        const stepText = stepMatch[2];
        const conflict = this.checkStepConflict(stepText);
        
        if (conflict.hasConflict) {
          conflicts.push({
            line: index + 1,
            step: stepText,
            ...conflict
          });
        }
      }
    });

    return conflicts;
  }

  /**
   * Suggest alternatives for conflicting steps
   */
  suggestAlternatives(stepText, domain = 'auto-coder') {
    const suggestions = [];

    // Extract action and object from step
    const actionMatch = stepText.match(/Alex (navigates to|clicks|verifies) (.+)/);
    if (actionMatch) {
      const action = actionMatch[1];
      const object = actionMatch[2];

      switch (action) {
        case 'navigates to':
          if (object.includes('page')) {
            suggestions.push(`Alex navigates to ${domain} ${object}`);
            suggestions.push(`Alex navigates to the ${domain} ${object}`);
          }
          break;
        case 'clicks':
          if (object.includes('button') || object.includes('link')) {
            suggestions.push(`Alex clicks the ${domain} ${object}`);
          }
          break;
        case 'verifies':
          suggestions.push(`Alex verifies the ${domain} ${object}`);
          suggestions.push(`Alex verifies all ${domain} ${object}`);
          break;
      }
    }

    return suggestions;
  }

  /**
   * Generate conflict report
   */
  generateConflictReport(featureFilePath) {
    const conflicts = this.validateFeatureFile(featureFilePath);
    
    if (conflicts.length === 0) {
      console.log('✅ No step conflicts detected');
      return { hasConflicts: false };
    }

    console.log('🚨 STEP CONFLICTS DETECTED:');
    console.log('=' .repeat(50));

    conflicts.forEach(conflict => {
      console.log(`Line ${conflict.line}: "${conflict.step}"`);
      console.log(`  Severity: ${conflict.severity}`);
      
      if (conflict.conflicts) {
        console.log(`  Conflicts with ${conflict.conflicts.length} existing steps`);
      }
      
      if (conflict.reason) {
        console.log(`  Reason: ${conflict.reason}`);
      }
      
      if (conflict.alternative) {
        console.log(`  Alternative: ${conflict.alternative}`);
      }

      const suggestions = this.suggestAlternatives(conflict.step);
      if (suggestions.length > 0) {
        console.log(`  Suggestions:`);
        suggestions.forEach(suggestion => {
          console.log(`    - "${suggestion}"`);
        });
      }
      
      console.log('');
    });

    return { hasConflicts: true, conflicts };
  }
}

// CLI usage
if (require.main === module) {
  const checker = new SBSStepsConflictChecker();
  const featureFile = process.argv[2];

  if (!featureFile) {
    console.log('Usage: node sbs-steps-conflict-checker.js <feature-file-path>');
    process.exit(1);
  }

  if (!fs.existsSync(featureFile)) {
    console.error(`❌ Feature file not found: ${featureFile}`);
    process.exit(1);
  }

  const result = checker.generateConflictReport(featureFile);
  process.exit(result.hasConflicts ? 1 : 0);
}

module.exports = SBSStepsConflictChecker;
