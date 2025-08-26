#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const TemplateProcessor = require('./template-processor');

class TemplateManager {
    constructor() {
        this.templatesDir = path.join(__dirname, '../templates');
        this.outputDir = path.join(__dirname, '../generated');
        this.processor = new TemplateProcessor();
    }

    /**
     * Interactive template wizard
     */
    async runWizard() {
        console.log('🔧 Auto-Coder Template Wizard');
        console.log('==============================\n');

        try {
            // Parse command line arguments
            const args = process.argv.slice(2);
            let action = 'select';
            let templateFile = null;
            
            // Check for actions
            if (args.includes('--list')) action = 'list';
            if (args.includes('--generate')) action = 'generate';
            if (args.includes('--template')) {
                const templateIndex = args.indexOf('--template');
                if (templateIndex + 1 < args.length) {
                    templateFile = args[templateIndex + 1];
                }
            }

            switch (action) {
                case 'list':
                    await this.listAvailableTemplates();
                    break;
                case 'generate':
                    await this.generateFromTemplate(templateFile);
                    break;
                default:
                    await this.showTemplateSelection();
                    break;
            }

        } catch (error) {
            console.error('❌ Error in template wizard:', error.message);
            process.exit(1);
        }
    }

    /**
     * List available templates
     */
    async listAvailableTemplates() {
        console.log('📋 Available Simple Templates:\n');
        
        const templates = await this.processor.getAvailableTemplates();
        
        templates.forEach((template, index) => {
            console.log(`${index + 1}. ${template.name}`);
            console.log(`   Complexity: ${template.complexity}`);
            console.log(`   File: ${template.file}`);
            console.log(`   Description: ${template.description}\n`);
        });

        console.log('📖 Usage:');
        console.log('1. Copy a template file and fill it with your requirements');
        console.log('2. Generate test artifacts: npm run template:wizard -- --generate --template your-filled-template.md');
        console.log('3. Deploy to SBS_Automation for testing\n');
    }

    /**
     * Show template selection guide
     */
    async showTemplateSelection() {
        console.log('🎯 Simple Template-Based Test Generation\n');
        
        const templates = await this.processor.getAvailableTemplates();
        
        console.log('📋 Choose your template complexity:');
        console.log('┌─────────────┬──────────────────────────────────────────┐');
        console.log('│ Complexity  │ Best For                                 │');
        console.log('├─────────────┼──────────────────────────────────────────┤');
        console.log('│ Simplest    │ Quick tests, basic functionality        │');
        console.log('│ Easy        │ Standard features, most common use       │');
        console.log('│ Detailed    │ Complex workflows, proper BDD format     │');
        console.log('│ Example     │ See completed template for reference     │');
        console.log('└─────────────┴──────────────────────────────────────────┘\n');

        console.log('🚀 Quick Start:');
        console.log('1. List templates:     npm run template:wizard -- --list');
        console.log('2. Copy template:      cp requirements/templates/template-easy-reqs.md my-requirement.md');
        console.log('3. Fill your details:  Edit my-requirement.md with your requirement');
        console.log('4. Generate artifacts: npm run template:wizard -- --generate --template my-requirement.md');
        console.log('');
        
        // Show first few templates as examples
        console.log('📄 Available Templates:');
        templates.slice(0, 4).forEach((template, index) => {
            console.log(`   ${template.file} (${template.complexity})`);
        });
        
        if (templates.length > 4) {
            console.log(`   ... and ${templates.length - 4} more (use --list to see all)`);
        }
    }

    /**
     * Generate test artifacts from a completed template
     */
    async generateFromTemplate(templateFile) {
        if (!templateFile) {
            console.error('❌ No template file specified. Use --template <filename>');
            console.log('💡 Example: npm run template:wizard -- --generate --template my-requirement.md');
            return;
        }

        console.log(`🔨 Generating test artifacts from: ${templateFile}\n`);

        try {
            // Find the template file
            const templatePath = await this.findTemplateFile(templateFile);
            
            if (!templatePath) {
                console.error(`❌ Template file not found: ${templateFile}`);
                console.log('💡 Make sure the file exists in one of these locations:');
                console.log('   - requirements/templates/');
                console.log('   - Current directory');
                console.log('   - Absolute path');
                return;
            }

            console.log(`📝 Processing template: ${templatePath}`);
            
            // Process the template
            const requirement = await this.processor.processCompletedTemplate(templatePath);
            
            console.log(`📋 Extracted requirement: ${requirement.title}`);
            
            // Generate artifacts
            const artifacts = await this.processor.generateArtifacts(requirement);
            
            console.log('\n✅ Test artifacts generated successfully!');
            console.log(`📁 Generated files:`);
            console.log(`   Feature: ${artifacts.feature}`);
            console.log(`   Steps:   ${artifacts.steps}`);
            console.log(`   Page:    ${artifacts.page}`);
            console.log('');
            console.log('🚀 Next steps:');
            console.log('1. Review generated files');
            console.log('2. Customize as needed');
            console.log('3. Run tests in SBS_Automation');
            console.log(`   cd SBS_Automation && npm test -- --grep "${artifacts.baseName}"`);

        } catch (error) {
            console.error('❌ Error generating artifacts:', error.message);
            throw error;
        }
    }

    /**
     * Find template file in various locations
     */
    async findTemplateFile(filename) {
        // Possible locations to check
        const locations = [
            filename, // absolute path or current directory
            path.join(process.cwd(), filename),
            path.join(__dirname, '../requirements/templates', filename),
            path.join(__dirname, '../templates', filename)
        ];

        for (const location of locations) {
            if (await fs.pathExists(location)) {
                return location;
            }
        }

        return null;
    }

    // Legacy method compatibility
    async generateTemplateContent(templateType) {
        console.log(`⚠️  Legacy template generation for: ${templateType}`);
        console.log('💡 Use the new simple template system instead:');
        console.log('   npm run template:wizard -- --list');
        console.log('   npm run template:wizard -- --generate --template your-file.md');
    }
}

    createBDDRequirementTemplate() {
        return `# BDD Requirement Template

> **Instructions:** Fill out this template with your specific requirements. Each section provides guidance and examples. Delete the instruction text and replace with your actual requirements.

---

## 📋 **Requirement Overview**

### Feature Name
\`\`\`
[Replace with your feature name - keep it concise and descriptive]
Example: User Login Authentication
\`\`\`

### Description
\`\`\`
[Describe what this feature does and why it's needed]
Example: As a user, I want to securely log into the application so that I can access my personal dashboard and account features.
\`\`\`

### Priority
\`\`\`
[Select one: High | Medium | Low]
Example: High
\`\`\`

---

## 🎯 **Test Scenarios**

### Scenario 1: Happy Path (Main Success Flow)
\`\`\`
Given: [Initial state/condition]
Example: Given I am on the login page

When: [Action taken]
Example: When I enter valid username and password and click login

Then: [Expected result]
Example: Then I should be redirected to my dashboard
\`\`\`

### Scenario 2: Alternative Flow
\`\`\`
Given: [Different initial state]
Example: Given I am a first-time user on the login page

When: [Different action]
Example: When I click "Create Account" link

Then: [Different expected result]
Example: Then I should be taken to the registration page
\`\`\`

### Scenario 3: Error/Edge Case
\`\`\`
Given: [Error condition setup]
Example: Given I am on the login page

When: [Action that causes error]
Example: When I enter invalid credentials and click login

Then: [Error handling expectation]
Example: Then I should see an error message "Invalid username or password"
\`\`\`

---

## 📊 **Test Data Requirements**

### Valid Test Data
\`\`\`
[List valid inputs needed for testing]
Example:
- Valid Username: testuser@example.com
- Valid Password: SecurePass123!
- User Role: Standard User
\`\`\`

### Invalid Test Data
\`\`\`
[List invalid inputs for negative testing]
Example:
- Invalid Email: notanemail
- Wrong Password: incorrectpass
- Empty Fields: (blank username/password)
\`\`\`

---

## 🖥️ **UI Elements (if applicable)**

### Page Elements
\`\`\`
[List key UI elements that tests need to interact with]
Example:
- Username field: [data-test-id="username-input"]
- Password field: [data-test-id="password-input"]
- Login button: [data-test-id="login-button"]
- Error message area: [data-test-id="error-message"]
\`\`\`

### Navigation
\`\`\`
[Describe page flow and navigation]
Example:
- Start Page: /login
- Success Redirect: /dashboard
- Error Stays On: /login (with error message)
\`\`\`

---

## 🔗 **API Requirements (if applicable)**

### API Endpoints
\`\`\`
[List relevant API endpoints]
Example:
- POST /api/auth/login
- GET /api/user/profile
- POST /api/auth/logout
\`\`\`

### Request/Response
\`\`\`
[Describe expected API behavior]
Example:
Request: { "username": "user@example.com", "password": "password123" }
Success Response: { "token": "jwt_token", "user": {...} }
Error Response: { "error": "Invalid credentials" }
\`\`\`

---

## ⚙️ **Environment & Configuration**

### Test Environment
\`\`\`
[Specify which environment to test against]
Example: FIT (Test Environment)
\`\`\`

### Prerequisites
\`\`\`
[List any setup requirements]
Example:
- Test user account must exist
- Database must be seeded with test data
- Application must be running and accessible
\`\`\`

---

## 🏷️ **Tags & Categories**

### Test Tags
\`\`\`
[Choose appropriate tags for test execution]
Example: @smoke @login @authentication @priority:high
\`\`\`

### Test Category
\`\`\`
[Select category: UI | API | Integration | E2E]
Example: UI
\`\`\`

---

## 📝 **Additional Notes**

### Special Considerations
\`\`\`
[Any special requirements or constraints]
Example:
- Test must work in both Chrome and Firefox
- Must verify security headers in response
- Should test with screen reader compatibility
\`\`\`

### Acceptance Criteria
\`\`\`
[Specific criteria for test completion]
Example:
- All positive scenarios pass
- Error messages are user-friendly
- Page loads within 3 seconds
- No console errors during login flow
\`\`\`

---

## ✅ **Completion Checklist**

- [ ] Feature name and description completed
- [ ] All scenarios defined (happy path, alternative, error cases)
- [ ] Test data specified (valid and invalid)
- [ ] UI elements identified (if applicable)
- [ ] API requirements defined (if applicable)
- [ ] Environment and prerequisites specified
- [ ] Tags and categories selected
- [ ] Acceptance criteria documented

---

> **Ready to Generate Tests?**
> 
> Once you've completed this template:
> 1. Save this file (Ctrl+S)
> 2. Return to the auto-coder interactive menu
> 3. Select "Generate from Completed Template"
> 4. Choose this file when prompted
> 5. Watch as comprehensive test artifacts are generated!

---

*Template created by Auto-Coder Framework - BDD Template Wizard*
`;
    }

    async generateCucumberTemplate() {
        console.log('🥒 Generating Cucumber BDD template...');
        
        await fs.ensureDir(this.templatesDir);
        
        const templateContent = `@Generated @Template @Team:AutoCoder
Feature: BDD Template Feature
  As a test automation engineer
  I want to use this BDD template
  So that I can quickly create comprehensive test scenarios

  Background:
    Given the system is configured
    And the user has proper permissions

  @smoke @priority:high
  Scenario: Template smoke test scenario
    Given I am on the application page
    When I perform the primary action
    Then I should see the expected result
    And the system should behave correctly

  @regression @priority:medium  
  Scenario Outline: Template data-driven scenario
    Given I am on the <pageType> page
    When I enter "<inputData>" in the form
    Then I should see "<expectedOutput>" displayed
    
    Examples:
      | pageType | inputData | expectedOutput |
      | main     | test123   | Success        |
      | admin    | admin456  | Admin Success  |

  @negative @priority:low
  Scenario: Template negative test scenario
    Given I am on the application page
    When I enter invalid data
    Then I should see an appropriate error message
    And the system should remain stable
`;

        const outputPath = path.join(this.templatesDir, 'cucumber-bdd-template.feature');
        await fs.writeFile(outputPath, templateContent);
        
        console.log(`✅ Cucumber BDD template created: ${outputPath}`);
        
        // Also create corresponding step definitions template
        const stepsContent = `const { Given, When, Then } = require('@cucumber/cucumber');
const { assert } = require('chai');

// Background steps
Given('the system is configured', async function () {
  // System configuration logic
  await this.page.goto('/');
});

Given('the user has proper permissions', async function () {
  // User permission setup
  console.log('User permissions verified');
});

// Main scenario steps
Given('I am on the application page', async function () {
  await this.page.goto('/application');
});

Given('I am on the {word} page', async function (pageType) {
  await this.page.goto(\`/\${pageType}\`);
});

When('I perform the primary action', async function () {
  await this.page.click('[data-test-id="primary-action"]');
});

When('I enter {string} in the form', async function (inputData) {
  await this.page.fill('[data-test-id="input-field"]', inputData);
});

When('I enter invalid data', async function () {
  await this.page.fill('[data-test-id="input-field"]', 'INVALID_DATA_123!@#');
});

Then('I should see the expected result', async function () {
  const result = await this.page.locator('[data-test-id="result"]');
  await result.waitFor({ state: 'visible' });
  assert.isTrue(await result.isVisible(), 'Expected result should be visible');
});

Then('I should see {string} displayed', async function (expectedOutput) {
  const output = await this.page.locator(\`text=\${expectedOutput}\`);
  await output.waitFor({ state: 'visible' });
  assert.isTrue(await output.isVisible(), \`Should see \${expectedOutput}\`);
});

Then('the system should behave correctly', async function () {
  const statusElement = await this.page.locator('[data-test-id="status"]');
  const status = await statusElement.textContent();
  assert.include(['success', 'completed'], status.toLowerCase());
});

Then('I should see an appropriate error message', async function () {
  const errorMsg = await this.page.locator('[data-test-id="error-message"]');
  await errorMsg.waitFor({ state: 'visible' });
  assert.isTrue(await errorMsg.isVisible(), 'Error message should be displayed');
});

Then('the system should remain stable', async function () {
  // Verify no crashes or unexpected behavior
  const pageUrl = this.page.url();
  assert.isTrue(pageUrl.includes('/'), 'Page should remain accessible');
});
`;

        const stepsOutputPath = path.join(this.templatesDir, 'cucumber-bdd-steps-template.js');
        await fs.writeFile(stepsOutputPath, stepsContent);
        console.log(`✅ Cucumber steps template created: ${stepsOutputPath}`);
    }

    async generateAPITemplate() {
        console.log('🔄 Generating API template...');
        
        await fs.ensureDir(this.templatesDir);
        
        const templateContent = `@Generated @Template @Team:AutoCoder @Category:API
Feature: API Integration Template
  As a developer
  I want to test API endpoints
  So that I can ensure proper API functionality and reliability

  Background:
    Given the API service is available
    And I have valid authentication credentials

  @smoke @api @auth
  Scenario: API authentication validation
    Given I have valid API credentials
    When I send an authentication request
    Then I should receive a valid access token
    And the token should have proper expiration

  @regression @api @crud
  Scenario: API CRUD operations template
    Given I have authenticated with the API
    When I create a new resource via POST
    Then the resource should be created successfully
    And I should be able to retrieve it via GET
    And I should be able to update it via PUT
    And I should be able to delete it via DELETE

  @negative @api @validation
  Scenario Outline: API input validation template
    Given I have authenticated with the API
    When I send a request with "<invalidInput>" data
    Then I should receive a "<statusCode>" status code
    And the error message should be "<errorType>"
    
    Examples:
      | invalidInput | statusCode | errorType          |
      | null         | 400        | Bad Request        |
      | empty        | 400        | Validation Error   |
      | malformed    | 422        | Unprocessable      |

  @performance @api @load
  Scenario: API performance baseline template
    Given I have authenticated with the API
    When I send 10 concurrent requests
    Then all requests should complete within 5 seconds
    And the success rate should be above 95%
`;

        const outputPath = path.join(this.templatesDir, 'api-integration-template.feature');
        await fs.writeFile(outputPath, templateContent);
        
        console.log(`✅ API template created: ${outputPath}`);
        
        // Create API steps template
        const apiStepsContent = `const { Given, When, Then } = require('@cucumber/cucumber');
const { assert } = require('chai');
const axios = require('axios');

let apiResponse;
let authToken;
let createdResourceId;

// Background steps
Given('the API service is available', async function () {
  const healthCheck = await axios.get(process.env.API_BASE_URL + '/health');
  assert.equal(healthCheck.status, 200, 'API service should be healthy');
});

Given('I have valid authentication credentials', async function () {
  this.credentials = {
    username: process.env.API_USERNAME || 'testuser',
    password: process.env.API_PASSWORD || 'testpass'
  };
});

// Authentication steps
Given('I have valid API credentials', async function () {
  this.apiCredentials = {
    username: process.env.API_USERNAME,
    password: process.env.API_PASSWORD
  };
});

When('I send an authentication request', async function () {
  apiResponse = await axios.post(process.env.API_BASE_URL + '/auth/login', {
    username: this.apiCredentials.username,
    password: this.apiCredentials.password
  });
});

Then('I should receive a valid access token', async function () {
  assert.equal(apiResponse.status, 200, 'Should receive 200 status');
  assert.exists(apiResponse.data.token, 'Response should contain token');
  authToken = apiResponse.data.token;
});

Then('the token should have proper expiration', async function () {
  assert.exists(apiResponse.data.expiresIn, 'Token should have expiration');
  assert.isAbove(apiResponse.data.expiresIn, 0, 'Expiration should be positive');
});

// CRUD operations steps
Given('I have authenticated with the API', async function () {
  if (!authToken) {
    const authResponse = await axios.post(process.env.API_BASE_URL + '/auth/login', {
      username: process.env.API_USERNAME,
      password: process.env.API_PASSWORD
    });
    authToken = authResponse.data.token;
  }
});

When('I create a new resource via POST', async function () {
  apiResponse = await axios.post(
    process.env.API_BASE_URL + '/resources',
    { name: 'Test Resource', description: 'Created by automation' },
    { headers: { Authorization: \`Bearer \${authToken}\` } }
  );
  createdResourceId = apiResponse.data.id;
});

Then('the resource should be created successfully', async function () {
  assert.equal(apiResponse.status, 201, 'Should receive 201 Created status');
  assert.exists(apiResponse.data.id, 'Response should contain resource ID');
});

Then('I should be able to retrieve it via GET', async function () {
  const getResponse = await axios.get(
    \`\${process.env.API_BASE_URL}/resources/\${createdResourceId}\`,
    { headers: { Authorization: \`Bearer \${authToken}\` } }
  );
  assert.equal(getResponse.status, 200, 'Should retrieve resource successfully');
  assert.equal(getResponse.data.id, createdResourceId, 'Should return correct resource');
});

Then('I should be able to update it via PUT', async function () {
  const updateResponse = await axios.put(
    \`\${process.env.API_BASE_URL}/resources/\${createdResourceId}\`,
    { name: 'Updated Resource', description: 'Updated by automation' },
    { headers: { Authorization: \`Bearer \${authToken}\` } }
  );
  assert.equal(updateResponse.status, 200, 'Should update resource successfully');
});

Then('I should be able to delete it via DELETE', async function () {
  const deleteResponse = await axios.delete(
    \`\${process.env.API_BASE_URL}/resources/\${createdResourceId}\`,
    { headers: { Authorization: \`Bearer \${authToken}\` } }
  );
  assert.equal(deleteResponse.status, 204, 'Should delete resource successfully');
});

// Validation steps
When('I send a request with {string} data', async function (invalidInput) {
  let requestData;
  
  switch(invalidInput) {
    case 'null':
      requestData = null;
      break;
    case 'empty':
      requestData = {};
      break;
    case 'malformed':
      requestData = { invalidField: 'invalidValue' };
      break;
    default:
      requestData = invalidInput;
  }

  try {
    apiResponse = await axios.post(
      process.env.API_BASE_URL + '/resources',
      requestData,
      { 
        headers: { Authorization: \`Bearer \${authToken}\` },
        validateStatus: () => true // Accept all status codes
      }
    );
  } catch (error) {
    apiResponse = error.response;
  }
});

Then('I should receive a {string} status code', async function (statusCode) {
  assert.equal(apiResponse.status, parseInt(statusCode), \`Should receive \${statusCode} status\`);
});

Then('the error message should be {string}', async function (errorType) {
  assert.exists(apiResponse.data.error, 'Response should contain error message');
  assert.include(apiResponse.data.error.toLowerCase(), errorType.toLowerCase());
});

// Performance steps
When('I send {int} concurrent requests', async function (requestCount) {
  const startTime = Date.now();
  
  const requests = Array(requestCount).fill().map(() =>
    axios.get(
      process.env.API_BASE_URL + '/resources',
      { headers: { Authorization: \`Bearer \${authToken}\` } }
    )
  );
  
  this.performanceResults = await Promise.allSettled(requests);
  this.performanceDuration = Date.now() - startTime;
});

Then('all requests should complete within {int} seconds', async function (maxSeconds) {
  const maxMilliseconds = maxSeconds * 1000;
  assert.isBelow(this.performanceDuration, maxMilliseconds, 
    \`Requests should complete within \${maxSeconds} seconds\`);
});

Then('the success rate should be above {int}%', async function (minSuccessRate) {
  const successfulRequests = this.performanceResults.filter(r => r.status === 'fulfilled').length;
  const actualSuccessRate = (successfulRequests / this.performanceResults.length) * 100;
  
  assert.isAbove(actualSuccessRate, minSuccessRate, 
    \`Success rate should be above \${minSuccessRate}%\`);
});
`;

        const apiStepsOutputPath = path.join(this.templatesDir, 'api-integration-steps-template.js');
        await fs.writeFile(apiStepsOutputPath, apiStepsContent);
        console.log(`✅ API steps template created: ${apiStepsOutputPath}`);
    }

    async generateUITemplate() {
        console.log('🖱️ Generating UI automation template...');
        
        await fs.ensureDir(this.templatesDir);
        
        const templateContent = `@Generated @Template @Team:AutoCoder @Category:UI
Feature: UI Automation Template
  As a QA engineer
  I want to test user interface interactions
  So that I can ensure proper UI functionality and user experience

  Background:
    Given I am on the application homepage
    And the page has loaded completely

  @smoke @ui @navigation
  Scenario: UI navigation template
    Given I am logged into the application
    When I navigate to the main dashboard
    Then I should see the navigation menu
    And all navigation links should be functional

  @regression @ui @forms
  Scenario: UI form interaction template
    Given I am on the contact form page
    When I fill in all required fields
    And I submit the form
    Then the form should be submitted successfully
    And I should see a confirmation message

  @accessibility @ui @a11y
  Scenario: UI accessibility validation template
    Given I am on any page of the application
    When I run accessibility checks
    Then there should be no critical accessibility violations
    And all interactive elements should have proper labels

  @responsive @ui @mobile
  Scenario Outline: UI responsive design template
    Given I set the browser viewport to "<device>" size
    When I navigate through the main pages
    Then the layout should adapt properly
    And all elements should remain functional
    
    Examples:
      | device   |
      | mobile   |
      | tablet   |
      | desktop  |

  @visual @ui @regression
  Scenario: UI visual regression template
    Given I am on the product catalog page
    When I take a screenshot of the page
    Then the visual appearance should match the baseline
    And there should be no unexpected layout changes
`;

        const outputPath = path.join(this.templatesDir, 'ui-automation-template.feature');
        await fs.writeFile(outputPath, templateContent);
        
        console.log(`✅ UI template created: ${outputPath}`);
        
        // Create UI steps template
        const uiStepsContent = `const { Given, When, Then } = require('@cucumber/cucumber');
const { assert } = require('chai');

// Background steps
Given('I am on the application homepage', async function () {
  await this.page.goto(process.env.BASE_URL || 'http://localhost:3000');
});

Given('the page has loaded completely', async function () {
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForLoadState('domcontentloaded');
});

// Navigation steps
Given('I am logged into the application', async function () {
  // Implement login logic
  await this.page.fill('[data-test-id="username"]', process.env.TEST_USERNAME);
  await this.page.fill('[data-test-id="password"]', process.env.TEST_PASSWORD);
  await this.page.click('[data-test-id="login-button"]');
  await this.page.waitForSelector('[data-test-id="dashboard"]');
});

When('I navigate to the main dashboard', async function () {
  await this.page.click('[data-test-id="dashboard-link"]');
  await this.page.waitForSelector('[data-test-id="dashboard-content"]');
});

Then('I should see the navigation menu', async function () {
  const navMenu = this.page.locator('[data-test-id="navigation-menu"]');
  await navMenu.waitFor({ state: 'visible' });
  assert.isTrue(await navMenu.isVisible(), 'Navigation menu should be visible');
});

Then('all navigation links should be functional', async function () {
  const navLinks = await this.page.locator('[data-test-id^="nav-link-"]').all();
  
  for (const link of navLinks) {
    const href = await link.getAttribute('href');
    assert.isNotNull(href, 'Navigation link should have href attribute');
    assert.isTrue(href.length > 0, 'Navigation link href should not be empty');
  }
});

// Form interaction steps
Given('I am on the contact form page', async function () {
  await this.page.goto('/contact');
  await this.page.waitForSelector('[data-test-id="contact-form"]');
});

When('I fill in all required fields', async function () {
  await this.page.fill('[data-test-id="name-field"]', 'Test User');
  await this.page.fill('[data-test-id="email-field"]', 'test@example.com');
  await this.page.fill('[data-test-id="message-field"]', 'This is a test message from automation.');
});

When('I submit the form', async function () {
  await this.page.click('[data-test-id="submit-button"]');
});

Then('the form should be submitted successfully', async function () {
  // Wait for form submission to complete
  await this.page.waitForSelector('[data-test-id="success-message"]', { timeout: 10000 });
});

Then('I should see a confirmation message', async function () {
  const confirmationMsg = this.page.locator('[data-test-id="success-message"]');
  await confirmationMsg.waitFor({ state: 'visible' });
  assert.isTrue(await confirmationMsg.isVisible(), 'Confirmation message should be visible');
});

// Accessibility steps
Given('I am on any page of the application', async function () {
  // Navigate to a representative page
  await this.page.goto('/');
});

When('I run accessibility checks', async function () {
  // Note: This would require @axe-core/playwright or similar
  // const { injectAxe, checkA11y } = require('axe-playwright');
  // await injectAxe(this.page);
  // this.a11yResults = await checkA11y(this.page);
  console.log('Accessibility check placeholder - implement with axe-core');
});

Then('there should be no critical accessibility violations', async function () {
  // Check for basic accessibility requirements
  const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').all();
  assert.isAbove(headings.length, 0, 'Page should have proper heading structure');
  
  const images = await this.page.locator('img').all();
  for (const img of images) {
    const alt = await img.getAttribute('alt');
    if (alt === null) {
      console.warn('Image without alt attribute found');
    }
  }
});

Then('all interactive elements should have proper labels', async function () {
  const buttons = await this.page.locator('button, input[type="submit"]').all();
  
  for (const button of buttons) {
    const text = await button.textContent();
    const ariaLabel = await button.getAttribute('aria-label');
    const title = await button.getAttribute('title');
    
    assert.isTrue(
      (text && text.trim().length > 0) || 
      (ariaLabel && ariaLabel.length > 0) || 
      (title && title.length > 0),
      'Interactive elements should have accessible labels'
    );
  }
});

// Responsive design steps
Given('I set the browser viewport to {string} size', async function (device) {
  const viewports = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 }
  };
  
  const viewport = viewports[device] || viewports.desktop;
  await this.page.setViewportSize(viewport);
});

When('I navigate through the main pages', async function () {
  const pages = ['/', '/about', '/products', '/contact'];
  
  for (const pagePath of pages) {
    await this.page.goto(pagePath);
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000); // Allow layout to settle
  }
});

Then('the layout should adapt properly', async function () {
  // Check that content is not overflowing
  const body = this.page.locator('body');
  const bodyWidth = await body.evaluate(el => el.scrollWidth);
  const viewportWidth = await this.page.viewportSize().width;
  
  assert.isAtMost(bodyWidth, viewportWidth + 20, 'Content should not overflow viewport significantly');
});

Then('all elements should remain functional', async function () {
  // Check that main navigation is accessible
  const navElements = await this.page.locator('[data-test-id^="nav-"], button, a').all();
  
  for (const element of navElements.slice(0, 5)) { // Test first 5 elements
    const isVisible = await element.isVisible();
    if (isVisible) {
      const boundingBox = await element.boundingBox();
      assert.isNotNull(boundingBox, 'Functional elements should have proper dimensions');
      assert.isAbove(boundingBox.width, 0, 'Element should have positive width');
      assert.isAbove(boundingBox.height, 0, 'Element should have positive height');
    }
  }
});

// Visual regression steps
Given('I am on the product catalog page', async function () {
  await this.page.goto('/products');
  await this.page.waitForLoadState('networkidle');
});

When('I take a screenshot of the page', async function () {
  // Take full page screenshot
  this.currentScreenshot = await this.page.screenshot({ 
    fullPage: true,
    path: 'temp-screenshot.png'
  });
});

Then('the visual appearance should match the baseline', async function () {
  // This would typically use a visual regression testing tool
  // like Percy, Applitools, or Playwright's visual comparisons
  console.log('Visual comparison placeholder - implement with visual testing tool');
  
  // Basic check: ensure page has rendered content
  const contentElements = await this.page.locator('main, article, .content').all();
  assert.isAbove(contentElements.length, 0, 'Page should have main content elements');
});

Then('there should be no unexpected layout changes', async function () {
  // Check for basic layout stability indicators
  const viewport = this.page.viewportSize();
  const bodyHeight = await this.page.locator('body').evaluate(el => el.scrollHeight);
  
  assert.isAbove(bodyHeight, viewport.height * 0.5, 'Page should have substantial content');
  assert.isBelow(bodyHeight, viewport.height * 10, 'Page should not be excessively long');
});
`;

        const uiStepsOutputPath = path.join(this.templatesDir, 'ui-automation-steps-template.js');
        await fs.writeFile(uiStepsOutputPath, uiStepsContent);
        console.log(`✅ UI steps template created: ${uiStepsOutputPath}`);
    }

    async generateCustomTemplate() {
        console.log('🚀 Generating custom template framework...');
        
        await fs.ensureDir(this.templatesDir);
        
        const customContent = `@Generated @Template @Team:AutoCoder @Custom
Feature: Custom Template Framework
  As a test automation engineer
  I want to create custom test templates
  So that I can adapt to specific project requirements

  # Instructions for customization:
  # 1. Replace this feature description with your specific requirements
  # 2. Add appropriate tags based on your project's tagging strategy
  # 3. Customize scenarios to match your business logic
  # 4. Update step definitions in the corresponding steps file

  Background:
    Given I have identified the custom requirements
    And I have access to the system under test

  @custom @template @setup
  Scenario: Custom template setup verification
    Given I am using the custom template framework
    When I customize it for my specific needs
    Then it should provide the flexibility I require
    And it should maintain best practices

  @custom @example @placeholder
  Scenario Template: Customizable scenario template
    Given I have a <precondition>
    When I perform a <action>
    Then I should observe <expected_result>
    
    # Add your Examples table here:
    # Examples:
    #   | precondition | action | expected_result |
    #   | ...          | ...    | ...             |

  @custom @negative @validation
  Scenario: Custom error handling template
    Given I have an invalid <input_type>
    When I attempt to <operation>
    Then the system should <error_response>
    And it should <recovery_action>

# Template Customization Guide:
# 
# 1. FEATURE LEVEL CUSTOMIZATION:
#    - Update the feature name and description
#    - Modify tags to match your project conventions
#    - Add project-specific background steps
#
# 2. SCENARIO CUSTOMIZATION:
#    - Replace template scenarios with real business scenarios
#    - Use your domain-specific language and terminology
#    - Include edge cases and error conditions
#
# 3. STEP DEFINITIONS:
#    - Implement the step definitions in the corresponding .js file
#    - Use your project's page objects and utilities
#    - Follow your team's coding standards
#
# 4. TAGS STRATEGY:
#    - @priority:high|medium|low - Test priority
#    - @smoke|regression|integration - Test types
#    - @Category:UI|API|Database - Test categories
#    - @Team:YourTeam - Ownership identification
#
# 5. DATA MANAGEMENT:
#    - Use Examples tables for data-driven tests
#    - Consider external data files for complex scenarios
#    - Implement proper test data cleanup
`;

        const customOutputPath = path.join(this.templatesDir, 'custom-template-framework.feature');
        await fs.writeFile(customOutputPath, customContent);
        
        console.log(`✅ Custom template created: ${customOutputPath}`);
        
        // Create custom steps template with guidance
        const customStepsContent = `const { Given, When, Then } = require('@cucumber/cucumber');
const { assert } = require('chai');

/*
 * CUSTOM TEMPLATE STEP DEFINITIONS
 * 
 * This file provides a starting point for creating custom step definitions.
 * Replace the template steps below with your actual implementation.
 * 
 * BEST PRACTICES:
 * 1. Use descriptive step names that match your business language
 * 2. Keep steps focused and single-purpose
 * 3. Use page objects for UI interactions
 * 4. Implement proper error handling
 * 5. Add meaningful assertions
 */

// ===== TEMPLATE SETUP STEPS =====
Given('I have identified the custom requirements', async function () {
  // TODO: Replace with your requirement validation logic
  console.log('✓ Custom requirements identified');
  this.customRequirements = {
    identified: true,
    timestamp: new Date().toISOString()
  };
});

Given('I have access to the system under test', async function () {
  // TODO: Replace with your system access verification
  console.log('✓ System access verified');
  
  // Example: Verify system is reachable
  // const response = await axios.get(process.env.SYSTEM_URL + '/health');
  // assert.equal(response.status, 200, 'System should be accessible');
});

// ===== CUSTOM FRAMEWORK STEPS =====
Given('I am using the custom template framework', async function () {
  // TODO: Initialize your custom framework components
  console.log('✓ Custom template framework initialized');
  
  this.customFramework = {
    initialized: true,
    version: '1.0.0',
    features: ['flexibility', 'maintainability', 'scalability']
  };
});

When('I customize it for my specific needs', async function () {
  // TODO: Implement your customization logic
  console.log('✓ Framework customized for specific needs');
  
  // Example customization tracking
  this.customizations = [
    'Updated step definitions',
    'Added project-specific page objects',
    'Configured environment-specific settings'
  ];
});

Then('it should provide the flexibility I require', async function () {
  // TODO: Verify flexibility requirements are met
  assert.exists(this.customFramework, 'Custom framework should be initialized');
  assert.isTrue(this.customFramework.initialized, 'Framework should be properly initialized');
  
  console.log('✓ Framework flexibility verified');
});

Then('it should maintain best practices', async function () {
  // TODO: Verify best practices are followed
  const bestPractices = [
    'Clear step definitions',
    'Proper error handling',
    'Maintainable code structure',
    'Comprehensive assertions'
  ];
  
  assert.isArray(bestPractices, 'Best practices should be documented');
  console.log('✓ Best practices maintained');
});

// ===== CUSTOMIZABLE SCENARIO TEMPLATE STEPS =====
Given('I have a {word}', async function (precondition) {
  // TODO: Implement your precondition setup
  console.log(\`✓ Precondition setup: \${precondition}\`);
  
  this.testContext = this.testContext || {};
  this.testContext.precondition = precondition;
  
  // Example: Set up test data based on precondition
  // switch(precondition) {
  //   case 'valid_user':
  //     this.testUser = await createTestUser();
  //     break;
  //   case 'admin_access':
  //     this.testUser = await createAdminUser();
  //     break;
  //   default:
  //     throw new Error(\`Unknown precondition: \${precondition}\`);
  // }
});

When('I perform a {word}', async function (action) {
  // TODO: Implement your action logic
  console.log(\`✓ Performing action: \${action}\`);
  
  this.testContext = this.testContext || {};
  this.testContext.action = action;
  this.testContext.actionTimestamp = new Date().toISOString();
  
  // Example: Perform actions based on action type
  // switch(action) {
  //   case 'login':
  //     await this.page.fill('[data-test-id="username"]', this.testUser.username);
  //     await this.page.fill('[data-test-id="password"]', this.testUser.password);
  //     await this.page.click('[data-test-id="login-button"]');
  //     break;
  //   case 'logout':
  //     await this.page.click('[data-test-id="logout-button"]');
  //     break;
  //   default:
  //     throw new Error(\`Unknown action: \${action}\`);
  // }
});

Then('I should observe {word}', async function (expectedResult) {
  // TODO: Implement your result verification
  console.log(\`✓ Verifying expected result: \${expectedResult}\`);
  
  assert.exists(this.testContext, 'Test context should be available');
  assert.exists(this.testContext.action, 'Action should have been performed');
  
  this.testContext.result = expectedResult;
  this.testContext.verified = true;
  
  // Example: Verify results based on expected outcome
  // switch(expectedResult) {
  //   case 'successful_login':
  //     const welcomeMessage = this.page.locator('[data-test-id="welcome-message"]');
  //     await welcomeMessage.waitFor({ state: 'visible' });
  //     assert.isTrue(await welcomeMessage.isVisible(), 'Welcome message should be visible');
  //     break;
  //   case 'error_message':
  //     const errorMessage = this.page.locator('[data-test-id="error-message"]');
  //     await errorMessage.waitFor({ state: 'visible' });
  //     assert.isTrue(await errorMessage.isVisible(), 'Error message should be displayed');
  //     break;
  //   default:
  //     throw new Error(\`Unknown expected result: \${expectedResult}\`);
  // }
});

// ===== ERROR HANDLING TEMPLATE STEPS =====
Given('I have an invalid {word}', async function (inputType) {
  // TODO: Set up invalid input scenarios
  console.log(\`✓ Setting up invalid input: \${inputType}\`);
  
  this.invalidInput = {
    type: inputType,
    timestamp: new Date().toISOString()
  };
  
  // Example: Prepare invalid inputs
  // const invalidInputs = {
  //   email: 'invalid-email-format',
  //   password: '123', // Too short
  //   phone: 'not-a-phone-number',
  //   date: '2023-13-45' // Invalid date
  // };
  // 
  // this.invalidInput.value = invalidInputs[inputType] || 'invalid-value';
});

When('I attempt to {word}', async function (operation) {
  // TODO: Implement operation with invalid input
  console.log(\`✓ Attempting operation: \${operation}\`);
  
  this.operationResult = {
    operation: operation,
    inputType: this.invalidInput.type,
    timestamp: new Date().toISOString()
  };
  
  // Example: Perform operation with invalid input
  // try {
  //   switch(operation) {
  //     case 'register':
  //       await this.page.fill(\`[data-test-id="\${this.invalidInput.type}-field"]\`, this.invalidInput.value);
  //       await this.page.click('[data-test-id="register-button"]');
  //       break;
  //     case 'submit':
  //       await this.page.fill(\`[data-test-id="\${this.invalidInput.type}-input"]\`, this.invalidInput.value);
  //       await this.page.click('[data-test-id="submit-button"]');
  //       break;
  //     default:
  //       throw new Error(\`Unknown operation: \${operation}\`);
  //   }
  // } catch (error) {
  //   this.operationResult.error = error.message;
  // }
});

Then('the system should {word}', async function (errorResponse) {
  // TODO: Verify appropriate error response
  console.log(\`✓ Verifying error response: \${errorResponse}\`);
  
  assert.exists(this.operationResult, 'Operation should have been attempted');
  
  // Example: Verify error responses
  // switch(errorResponse) {
  //   case 'show_validation_error':
  //     const validationError = this.page.locator('[data-test-id="validation-error"]');
  //     await validationError.waitFor({ state: 'visible' });
  //     assert.isTrue(await validationError.isVisible(), 'Validation error should be shown');
  //     break;
  //   case 'reject_input':
  //     const errorIcon = this.page.locator('[data-test-id="error-icon"]');
  //     await errorIcon.waitFor({ state: 'visible' });
  //     assert.isTrue(await errorIcon.isVisible(), 'Error indicator should be present');
  //     break;
  //   default:
  //     console.log(\`Custom error response verification needed for: \${errorResponse}\`);
  // }
});

Then('it should {word}', async function (recoveryAction) {
  // TODO: Verify recovery action
  console.log(\`✓ Verifying recovery action: \${recoveryAction}\`);
  
  // Example: Verify system recovery
  // switch(recoveryAction) {
  //   case 'maintain_form_state':
  //     const formFields = await this.page.locator('input[type="text"]').all();
  //     for (const field of formFields) {
  //       const fieldValue = await field.inputValue();
  //       // Verify field values are preserved (except the invalid one)
  //     }
  //     break;
  //   case 'provide_help_text':
  //     const helpText = this.page.locator('[data-test-id="help-text"]');
  //     await helpText.waitFor({ state: 'visible' });
  //     assert.isTrue(await helpText.isVisible(), 'Help text should be provided');
  //     break;
  //   default:
  //     console.log(\`Custom recovery action verification needed for: \${recoveryAction}\`);
  // }
});

/*
 * IMPLEMENTATION GUIDANCE:
 * 
 * 1. Replace console.log statements with actual implementation
 * 2. Add proper page object interactions
 * 3. Implement real assertions based on your system behavior
 * 4. Add error handling and timeouts as needed
 * 5. Use your project's data management patterns
 * 6. Follow your team's coding standards and conventions
 * 
 * Remember to:
 * - Keep steps focused and reusable
 * - Use meaningful variable names
 * - Add comments for complex logic
 * - Implement proper cleanup in hooks
 */
`;

        const customStepsOutputPath = path.join(this.templatesDir, 'custom-template-steps.js');
        await fs.writeFile(customStepsOutputPath, customStepsContent);
        console.log(`✅ Custom steps template created: ${customStepsOutputPath}`);
        
        // Create a README for the custom template
        const readmeContent = `# Custom Template Framework

This directory contains the custom template framework for creating specialized test scenarios.

## Files Generated:

1. **custom-template-framework.feature** - Base feature file with customization instructions
2. **custom-template-steps.js** - Step definitions template with implementation guidance

## Customization Instructions:

### 1. Feature File Customization
- Update feature name and description to match your domain
- Replace template scenarios with real business scenarios
- Use your project's tagging strategy
- Add appropriate Examples tables for data-driven tests

### 2. Step Definitions Implementation
- Replace placeholder implementations with real logic
- Use your project's page objects and utilities
- Add proper error handling and assertions
- Follow your team's coding standards

### 3. Best Practices
- Keep steps focused and single-purpose
- Use descriptive names that match business language
- Implement proper test data management
- Add meaningful comments for complex logic

## Usage Example:

1. Copy the template files to your project
2. Rename them to match your feature
3. Update the content to match your requirements
4. Implement the step definitions
5. Add to your test suite

## Support:

This template provides a starting point for custom test scenarios. Modify it as needed for your specific requirements.
`;

        const readmeOutputPath = path.join(this.templatesDir, 'custom-template-README.md');
        await fs.writeFile(readmeOutputPath, readmeContent);
        console.log(`✅ Custom template README created: ${readmeOutputPath}`);
    }
}

// CLI handling
const args = process.argv.slice(2);
const command = args[0];

if (command === 'wizard') {
    const manager = new TemplateManager();
    manager.runWizard().catch(console.error);
} else {
    console.log('Usage: node template-manager.js wizard');
}

module.exports = TemplateManager;
