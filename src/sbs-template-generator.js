const sbsPatterns = require('../utils/sbs-automation-patterns');
const fs = require('fs');
const path = require('path');

class SbsTemplateGenerator {
  constructor() {
    this.outputPath = path.join(__dirname, '..', 'SBS_Automation');
    this.ensureOutputDirectories();
  }

  ensureOutputDirectories() {
    const dirs = ['features', 'steps', 'pages'];
    dirs.forEach(dir => {
      const dirPath = path.join(this.outputPath, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  // Generate artifacts using abstraction layer
  generateTestArtifacts(businessName, businessRequirements) {
    console.log(`🎯 Generating test artifacts for: ${businessName}`);
    console.log(`📋 Using SBS_Automation patterns abstraction layer`);

    const className = sbsPatterns.toPascalCase(businessName);
    const kebabName = sbsPatterns.toKebabCase(businessName);

    // Generate Feature File
    const featureContent = this.generateFeatureFile(businessName, businessRequirements);
    const featurePath = path.join(this.outputPath, 'features', `${kebabName}.feature`);
    fs.writeFileSync(featurePath, featureContent);
    console.log(`✅ Generated: ${featurePath}`);

    // Generate Step Definitions
    const stepsContent = this.generateStepDefinitions(kebabName, businessRequirements);
    const stepsPath = path.join(this.outputPath, 'steps', `${kebabName}-steps.js`);
    fs.writeFileSync(stepsPath, stepsContent);
    console.log(`✅ Generated: ${stepsPath}`);

    // Generate Page Object
    const pageContent = this.generatePageObject(className, businessRequirements);
    const pagePath = path.join(this.outputPath, 'pages', `${kebabName}-page.js`);
    fs.writeFileSync(pagePath, pageContent);
    console.log(`✅ Generated: ${pagePath}`);

    return {
      feature: featurePath,
      steps: stepsPath,
      page: pagePath
    };
  }

  generateFeatureFile(businessName, requirements) {
    const tags = sbsPatterns.getFeatureTags().join(' ');
    const backgroundSteps = sbsPatterns.getBackgroundSteps();
    
    // Use actual business requirements to build scenarios
    let scenarios = '';
    if (requirements.scenarios && requirements.scenarios.length > 0) {
      scenarios = requirements.scenarios.map(scenario => {
        return `  Scenario: ${scenario.title}
    ${scenario.steps.map(step => `    ${step}`).join('\n')}`;
      }).join('\n\n');
    } else {
      scenarios = `  Scenario: Basic ${businessName} functionality
    Given I am on the ${businessName} page
    When I perform the required action
    Then I should see the expected result`;
    }

    return `${tags}
Feature: ${businessName}
  ${requirements.description || `Test automation for ${businessName} business functionality`}

  Background:
    ${backgroundSteps.join('\n    ')}

${scenarios}`;
  }

  generateStepDefinitions(kebabName, requirements) {
    const imports = sbsPatterns.getStepImports();
    const className = sbsPatterns.toPascalCase(kebabName.replace(/-/g, ''));
    const pageVariable = `${kebabName.replace(/-/g, '')}Page`;

    // Generate step implementations using abstraction patterns
    let stepImplementations = '';
    
    if (requirements.stepDefinitions && requirements.stepDefinitions.length > 0) {
      stepImplementations = requirements.stepDefinitions.map(step => {
        const assertionPattern = step.assertion ? 
          sbsPatterns.getAssertionPattern(step.assertion.type) || '' : '';
        
        return `${step.type}('${step.text}', async function () {
  if (!${pageVariable}) {
    ${pageVariable} = new ${className}Page(this.driver);
  }
  ${step.implementation || '// Implementation needed'}
  ${assertionPattern ? assertionPattern.replace('actual', step.assertion?.actual || 'result').replace('expected', step.assertion?.expected || 'expectedValue') : ''}
});`;
      }).join('\n\n');
    } else {
      // Default step definitions using common patterns
      stepImplementations = `Given('I am on the ${kebabName} page', async function () {
  if (!${pageVariable}) {
    ${pageVariable} = new ${className}Page(this.driver);
  }
  await ${pageVariable}.navigateToPage();
});

When('I perform the required action', async function () {
  // Implementation using page object methods
  await ${pageVariable}.performAction();
});

Then('I should see the expected result', async function () {
  const result = await ${pageVariable}.getResult();
  // Add assertion pattern here
});`;
    }

    return `${imports}
const ${className}Page = require('../pages/${kebabName}-page');

// Page object instance
let ${pageVariable};

${stepImplementations}`;
  }

  generatePageObject(className, requirements) {
    const imports = sbsPatterns.getBasePageImports();
    const constructor = sbsPatterns.getBasePageConstructor();
    const baseMethods = sbsPatterns.getAllBasePageMethods();

    // Generate locator constants
    let locatorConstants = '';
    if (requirements.elements && Object.keys(requirements.elements).length > 0) {
      Object.entries(requirements.elements).forEach(([name, selector]) => {
        locatorConstants += sbsPatterns.generateConstantLocator(name, selector) + '\n';
      });
    } else {
      // Default common elements
      const commonElements = sbsPatterns.getCommonElement('forms', 'submitButton');
      if (commonElements) {
        locatorConstants += sbsPatterns.generateConstantLocator('submitButton', commonElements) + '\n';
      }
    }

    // Generate business methods
    let businessMethods = '';
    if (requirements.methods && requirements.methods.length > 0) {
      businessMethods = requirements.methods.map(method => {
        return `  async ${method.name}(${method.parameters || ''}) {
    ${method.implementation || '// Method implementation needed'}
  }`;
      }).join('\n\n');
    } else {
      // Default business methods using base patterns
      businessMethods = `  async navigateToPage() {
    await this.navigateTo('/${className.toLowerCase()}');
    await this.waitForPageLoad();
  }

  async performAction() {
    // Business-specific action implementation
    await this.waitForElement(SUBMIT_BUTTON);
    await this.clickElement(SUBMIT_BUTTON);
  }

  async getResult() {
    // Return business-specific result
    return await this.getElementText(RESULT_ELEMENT);
  }`;
    }

    // Combine base methods with business methods
    let allMethods = '';
    Object.entries(baseMethods).forEach(([name, implementation]) => {
      allMethods += `  ${implementation}\n\n`;
    });
    allMethods += businessMethods;

    return `${imports}

// ${className} Page Locators
${locatorConstants}

class ${className}Page extends BasePage {
  ${constructor}

${allMethods}
}

module.exports = ${className}Page;`;
  }

  // Browser setup using abstraction patterns
  generateBrowserSetup() {
    const browserConfig = sbsPatterns.getBrowserConfig();
    const envConfig = sbsPatterns.getEnvironmentConfig();
    
    return `// Browser setup using SBS_Automation patterns
const { Builder } = require('selenium-webdriver');

class BrowserManager {
  constructor() {
    this.driver = null;
    this.config = ${JSON.stringify(browserConfig, null, 2)};
    this.baseUrl = '${envConfig.baseUrls.staging}';
  }

  async initializeBrowser() {
    this.driver = await new Builder()
      .forBrowser(this.config.defaultBrowser)
      .setFirefoxOptions(this.config.firefoxOptions)
      .setChromeOptions(this.config.chromeOptions)
      .build();
    
    await this.driver.manage().window().maximize();
    await this.driver.manage().setTimeouts({
      implicit: this.config.timeouts.implicit,
      pageLoad: this.config.timeouts.pageLoad
    });
    
    return this.driver;
  }

  async closeBrowser() {
    if (this.driver) {
      await this.driver.quit();
    }
  }
}

module.exports = BrowserManager;`;
  }

  // Login utilities using abstraction patterns
  generateLoginUtilities() {
    const loginElements = sbsPatterns.getLoginElements();
    const testData = sbsPatterns.getTestData();
    
    return `// Login utilities using SBS_Automation patterns
const { By } = require('selenium-webdriver');

class LoginUtilities {
  constructor(driver) {
    this.driver = driver;
    this.elements = ${JSON.stringify(loginElements, null, 2)};
    this.testData = ${JSON.stringify(testData, null, 2)};
  }

  async performLogin(userType = 'standard') {
    const credentials = this.testData.users[userType];
    
    await this.driver.findElement(By.css(this.elements.usernameField)).sendKeys(credentials.username);
    await this.driver.findElement(By.css(this.elements.passwordField)).sendKeys(credentials.password);
    await this.driver.findElement(By.css(this.elements.loginButton)).click();
    
    // Wait for login completion
    await this.driver.wait(
      until.elementLocated(By.css(this.elements.logoutButton)),
      10000
    );
  }

  async logout() {
    const logoutElement = await this.driver.findElement(By.css(this.elements.logoutButton));
    await logoutElement.click();
  }
}

module.exports = LoginUtilities;`;
  }
}

module.exports = SbsTemplateGenerator;
