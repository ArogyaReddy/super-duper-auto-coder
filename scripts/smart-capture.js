#!/usr/bin/env node

/**
 * 🎯 SMART PAGE CAPTURE LAUNCHER
 * 
 * Asks you which mode you prefer!
 */

const { spawn } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log(`
🚀 SMART PAGE CAPTURE LAUNCHER
==============================

This tool helps you capture page elements perfectly!
`);

  // Get page name
  const pageName = await askQuestion('📄 What should we call this page? (e.g. "Billing Page"): ');
  
  if (!pageName.trim()) {
    console.log('❌ Page name is required!');
    rl.close();
    process.exit(1);
  }

  console.log(`
🎯 Choose your capture mode:

1. INTERACTIVE (Recommended)
   → Browser opens
   → Navigate at your own pace  
   → Press ENTER when ready to scan
   → Perfect for complex navigation

2. TIMEOUT 
   → Browser opens
   → Auto-scans after specified time
   → Good for quick captures

`);

  const mode = await askQuestion('Choose mode (1 for Interactive, 2 for Timeout): ');
  
  let command = ['node', 'scripts/instant-capture.js', pageName];
  
  if (mode === '2') {
    const timeout = await askQuestion('How many seconds to wait? (default: 20): ');
    const timeoutValue = parseInt(timeout) || 20;
    command.push('--timeout', timeoutValue.toString());
    
    console.log(`
🚀 LAUNCHING TIMEOUT MODE
========================
⏰ Auto-scanning after ${timeoutValue} seconds
🌐 Browser opening...
`);
  } else {
    console.log(`
🚀 LAUNCHING INTERACTIVE MODE  
=============================
⏳ Take your time to navigate!
🌐 Browser opening...
`);
  }

  rl.close();

  // Launch the capture tool
  const child = spawn(command[0], command.slice(1), {
    stdio: 'inherit',
    shell: true
  });

  child.on('close', (code) => {
    if (code === 0) {
      console.log(`
🎉 CAPTURE COMPLETED SUCCESSFULLY!
==================================
📄 Page file: ${pageName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.js
📁 Location: SBS_Automation/pages/
🚀 Ready to use in your tests!
`);
    } else {
      console.log(`❌ Capture failed with code ${code}`);
    }
  });
}

main().catch(console.error);
