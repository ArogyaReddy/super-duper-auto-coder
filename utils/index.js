#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { spawnSync } = require('child_process');
const CrossPlatformPathManager = require('./src/cross-platform-paths');

// Initialize cross-platform path manager
const pathManager = new CrossPlatformPathManager();

// Load configuration
const configFile = process.env.CUCUMBER_CONFIG?.toLowerCase() || 'web.config.json';
const configPath = path.resolve(process.cwd(), configFile);

let config = {
  environment: 'local',
  steps: './SBS_Automation/steps',
  pageObjects: './SBS_Automation/pages',
  data: './data',
  featureFiles: './SBS_Automation/features',
  reports: './test-results',
  browser: 'chrome',
  timeout: 180000,
  headless: false,
};

// Try to load cross-platform config first
try {
  const crossPlatformConfigPath = pathManager.resolvePath('cross-platform.config.json');
  if (fs.existsSync(crossPlatformConfigPath)) {
    const crossPlatformConfig = require(crossPlatformConfigPath);
    config = Object.assign(config, crossPlatformConfig);
    console.log('🌐 Using cross-platform configuration');
  }
} catch (error) {
  console.warn('Cross-platform config not found, using defaults');
}

// Load environment-specific config
if (fs.existsSync(configPath)) {
  config = Object.assign(config, require(configPath));
}

console.log('🎯 Auto-Coder Framework Test Runner');
console.log('📁 Configuration:', configFile);
console.log('🎭 Features:', config.featureFiles);
console.log('📝 Steps:', config.steps);
console.log('📄 Pages:', config.pageObjects);
console.log('');

// Parse command line arguments
const args = process.argv.slice(2);
const featurePath = args[0] || config.featureFiles;

// Build cucumber command
const cucumberCmd = [
  'npx', 'cucumber-js',
  featurePath,
  '--require', config.steps,
  '--require', './support/hooks.js',
  '--format', 'progress',
  '--format', 'json:test-results/cucumber-results.json',
  '--format', 'html:test-results/cucumber-report.html'
];

// Add tags if specified
if (process.env.TAGS) {
  cucumberCmd.push('--tags', process.env.TAGS);
}

// Add parallel workers if specified
if (process.env.PARALLEL) {
  cucumberCmd.push('--parallel', process.env.PARALLEL);
}

console.log('🚀 Running command:', cucumberCmd.join(' '));
console.log('');

// Ensure test results directory exists
fs.ensureDirSync('./test-results');

// Execute cucumber
const result = spawnSync('npx', cucumberCmd.slice(1), { 
  stdio: 'inherit',
  shell: true 
});

process.exit(result.status);
