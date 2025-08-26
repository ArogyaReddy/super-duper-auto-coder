#!/usr/bin/env node

/**
 * 🚀 TEMPLATE GENERATOR FOR PAGE CAPTURE
 * 
 * Creates custom config files for any page quickly
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

class TemplateGenerator {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async generateTemplate() {
    console.log(`
🚀 PAGE CAPTURE TEMPLATE GENERATOR
==================================
Answer a few questions to generate your config file.
`);

    try {
      const answers = await this.askQuestions();
      const config = this.buildConfig(answers);
      const fileName = `${answers.pageName}-config.json`;
      
      await fs.writeFile(fileName, JSON.stringify(config, null, 2));
      
      console.log(`
✅ Generated: ${fileName}

🚀 NEXT STEPS:
1. Review and edit the config file if needed
2. Run: node scripts/one-command-advanced.js ${fileName}

📝 CONFIG SUMMARY:
- Page: ${answers.pageName}
- Menu Type: ${answers.menuType}
- Elements to capture: ${answers.elements.length}
`);

      this.rl.close();
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      this.rl.close();
    }
  }

  async askQuestions() {
    const answers = {};
    
    // Basic info
    answers.appUrl = await this.ask('🌐 App URL (e.g., https://runmod.com): ');
    answers.username = await this.ask('👤 Username: ');
    answers.password = await this.ask('🔑 Password: ');
    answers.pageName = await this.ask('📄 Page name (e.g., billing-invoice): ');
    
    // Menu navigation
    console.log(`
🧭 MENU NAVIGATION:
1. Shadow DOM Level 1 (most common)
2. Shadow DOM Level 2 (nested menus)
3. Direct/Regular element
4. iFrame element
`);
    
    const menuChoice = await this.ask('Select menu type (1-4): ');
    answers.menuType = this.getMenuType(menuChoice);
    
    answers.menuSelector = await this.ask('🎯 Menu selector (e.g., [data-id="billing"]): ');
    
    // Elements to capture
    console.log(`
📋 ELEMENTS TO CAPTURE:
Enter element descriptions (one per line, empty line to finish):
`);
    
    answers.elements = await this.collectElements();
    
    return answers;
  }

  async collectElements() {
    const elements = [];
    
    while (true) {
      const element = await this.ask(`Element ${elements.length + 1} (or press Enter to finish): `);
      if (!element.trim()) break;
      elements.push({ description: element.trim() });
    }
    
    if (elements.length === 0) {
      // Default elements
      elements.push(
        { description: "Page Header" },
        { description: "Main Action Button" },
        { description: "Menu Item" }
      );
    }
    
    return elements;
  }

  getMenuType(choice) {
    switch (choice) {
      case '1': return 'shadow-level-1';
      case '2': return 'shadow-level-2';
      case '3': return 'direct';
      case '4': return 'iframe';
      default: return 'shadow-level-1';
    }
  }

  buildConfig(answers) {
    const config = {
      baseUrl: answers.appUrl,
      credentials: {
        username: answers.username,
        password: answers.password
      },
      pageFileName: `${answers.pageName}.js`,
      navigationSteps: [
        {
          type: "wait",
          description: "Wait for app to load",
          duration: 3000
        }
      ],
      elementsToCapture: answers.elements,
      navigationInfo: {
        targetPage: this.pascalCase(answers.pageName),
        steps: []
      }
    };

    // Add navigation step based on menu type
    const navStep = this.buildNavigationStep(answers);
    config.navigationSteps.push(navStep);
    config.navigationInfo.steps.push({
      ...navStep,
      variableName: "menuElement"
    });

    // Add wait step
    config.navigationSteps.push({
      type: "wait",
      description: "Wait for page to load",
      duration: 2000
    });

    return config;
  }

  buildNavigationStep(answers) {
    const baseStep = {
      type: "click",
      description: `Click ${answers.pageName} menu`,
      selector: answers.menuSelector
    };

    switch (answers.menuType) {
      case 'shadow-level-1':
        baseStep.context = {
          shadow: true,
          shadowHost: "sfc-shell-left-nav",
          shadowDepth: 1
        };
        break;
        
      case 'shadow-level-2':
        baseStep.context = {
          shadow: true,
          shadowHost: "sfc-shell-left-nav",
          shadowRoot: "li:nth-child(2) > sfc-shell-left-nav-section",
          shadowDepth: 2
        };
        break;
        
      case 'iframe':
        baseStep.context = {
          iframe: "#shell"
        };
        break;
        
      default:
        baseStep.context = {
          shadow: false
        };
    }

    return baseStep;
  }

  pascalCase(str) {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  ask(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }
}

/**
 * 🚀 CLI EXECUTION
 */
async function main() {
  const generator = new TemplateGenerator();
  await generator.generateTemplate();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = TemplateGenerator;
