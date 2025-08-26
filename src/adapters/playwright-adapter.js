/**
 * Playwright Adapter - Generates Playwright-specific test artifacts
 * Extends FrameworkAdapter with Playwright-specific features
 */

const FrameworkAdapter = require('./framework-adapter');
const Handlebars = require('handlebars');

class PlaywrightAdapter extends FrameworkAdapter {
    constructor(options = {}) {
        super(options);
        this.frameworkVersion = options.version || 'latest';
        this.browserOptions = options.browsers || ['chromium', 'firefox', 'webkit'];
        this.headlessMode = options.headless !== false;
    }

    /**
     * Setup Playwright-specific configuration
     */
    setupFrameworkConfig() {
        this.config = {
            testDir: './tests',
            timeout: 30000,
            retries: 2,
            use: {
                headless: this.headlessMode,
                screenshot: 'only-on-failure',
                video: 'retain-on-failure'
            },
            projects: this.browserOptions.map(browser => ({
                name: browser,
                use: { ...require(`@playwright/test`).devices[this.getDeviceForBrowser(browser)] }
            }))
        };
    }

    /**
     * Get Playwright import statement
     */
    getFrameworkImport() {
        return `const { test, expect, Page, Browser } = require('@playwright/test');`;
    }

    /**
     * Get Playwright test declaration
     */
    getTestDeclaration() {
        return 'test';
    }

    /**
     * Get Playwright assertion syntax
     */
    getAssertionSyntax(actual, expected, type) {
        const assertionMap = {
            'toBe': `expect(${actual}).toBe(${expected})`,
            'toBeVisible': `expect(${actual}).toBeVisible()`,
            'toContain': `expect(${actual}).toContain(${expected})`,
            'toBeDefined': `expect(${actual}).toBeDefined()`,
            'toHaveText': `expect(${actual}).toHaveText(${expected})`,
            'toHaveValue': `expect(${actual}).toHaveValue(${expected})`,
            'toBeEnabled': `expect(${actual}).toBeEnabled()`,
            'toBeDisabled': `expect(${actual}).toBeDisabled()`
        };
        
        return assertionMap[type] || `expect(${actual}).${type}(${expected})`;
    }

    /**
     * Get Playwright setup code
     */
    getSetupCode() {
        return `// Setup browser context and page
let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await test.browser().newBrowser();
});

beforeEach(async () => {
  const context = await browser.newContext();
  page = await context.newPage();
});`;
    }

    /**
     * Get Playwright teardown code
     */
    getTeardownCode() {
        return `// Cleanup
afterEach(async () => {
  await page.close();
});

afterAll(async () => {
  await browser.close();
});`;
    }

    /**
     * Get file extension (TypeScript for Playwright)
     */
    getFileExtension() {
        return '.spec.ts';
    }

    /**
     * Check if Playwright supports page objects
     */
    supportsPageObjects() {
        return true;
    }

    /**
     * Get Playwright action method
     */
    getActionMethod(actionName) {
        const actionMap = {
            'click': 'click',
            'type': 'fill',
            'select': 'selectOption',
            'verify': 'expect',
            'navigate': 'goto',
            'wait': 'waitFor',
            'hover': 'hover',
            'drag': 'dragTo',
            'upload': 'setInputFiles',
            'download': 'waitForDownload',
            'screenshot': 'screenshot'
        };
        return actionMap[actionName] || actionName;
    }

    /**
     * Get device configuration for browser
     */
    getDeviceForBrowser(browser) {
        const deviceMap = {
            'chromium': 'Desktop Chrome',
            'firefox': 'Desktop Firefox',
            'webkit': 'Desktop Safari'
        };
        return deviceMap[browser] || 'Desktop Chrome';
    }

    /**
     * Generate Playwright-specific selectors
     */
    generateSelectors(analysis) {
        return analysis.entities.map(entity => {
            const name = entity.entity;
            return {
                name: name,
                selector: this.getPlaywrightSelector(name),
                type: this.inferElementType(name),
                description: `${name} element`
            };
        });
    }

    /**
     * Get Playwright-optimized selector
     */
    getPlaywrightSelector(entityName) {
        const name = entityName.toLowerCase();
        
        // Playwright-specific selector strategies
        if (name.includes('button')) {
            return `role=button[name="${entityName}"]`;
        } else if (name.includes('input') || name.includes('field')) {
            return `input[name="${name}"]`;
        } else if (name.includes('link')) {
            return `role=link[name="${entityName}"]`;
        } else if (name.includes('text')) {
            return `text="${entityName}"`;
        } else {
            return `[data-cy="${name}"]`;
        }
    }

    /**
     * Infer element type from entity name
     */
    inferElementType(entityName) {
        const name = entityName.toLowerCase();
        
        if (name.includes('button')) return 'button';
        if (name.includes('input') || name.includes('field')) return 'input';
        if (name.includes('select') || name.includes('dropdown')) return 'select';
        if (name.includes('checkbox')) return 'checkbox';
        if (name.includes('radio')) return 'radio';
        if (name.includes('link')) return 'link';
        if (name.includes('text') || name.includes('label')) return 'text';
        
        return 'element';
    }

    /**
     * Generate Playwright actions
     */
    generateActions(analysis) {
        return analysis.actions.map(action => {
            const actionName = action.action;
            return {
                name: actionName,
                method: this.getActionMethod(actionName),
                description: `${actionName} action using Playwright`,
                code: this.generateActionCode(actionName, analysis.entities[0]?.entity || 'element')
            };
        });
    }

    /**
     * Generate Playwright action code
     */
    generateActionCode(actionName, entityName) {
        const selector = this.getPlaywrightSelector(entityName);
        
        switch (actionName) {
            case 'click':
                return `await page.locator('${selector}').click();`;
            case 'type':
                return `await page.locator('${selector}').fill(data.${entityName});`;
            case 'select':
                return `await page.locator('${selector}').selectOption(data.${entityName});`;
            case 'verify':
                return `await expect(page.locator('${selector}')).toBeVisible();`;
            case 'navigate':
                return `await page.goto(data.url);`;
            default:
                return `await page.locator('${selector}').${actionName}();`;
        }
    }

    /**
     * Generate Playwright test file
     */
    async generateTestFile(context) {
        const template = this.templates.test || this.createPlaywrightTestTemplate();
        return template(context);
    }

    /**
     * Generate Playwright page object
     */
    async generatePageObject(context) {
        const template = this.templates.page || this.createPlaywrightPageTemplate();
        return template(context);
    }

    /**
     * Generate Playwright configuration
     */
    async generateConfigFile(context) {
        const template = this.templates.config || this.createPlaywrightConfigTemplate();
        return template(context);
    }

    /**
     * Create Playwright test template
     */
    createPlaywrightTestTemplate() {
        return Handlebars.compile(`import { test, expect, Page, Browser } from '@playwright/test';
import { {{titleCase className}} } from '../pages/{{kebabCase className}}';

test.describe('{{titleCase featureName}}', () => {
  let page: Page;
  let {{camelCase className}}: {{titleCase className}};

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    {{camelCase className}} = new {{titleCase className}}(page);
  });

  test('should {{primaryAction}} {{primaryEntity}}', async () => {
    // Navigate to the page
    await page.goto('/{{kebabCase primaryEntity}}');

    {{#each actions}}
    // {{description}}
    {{code}}
    {{/each}}

    // Assertions
    {{#each assertions}}
    {{this}};
    {{/each}}
  });

  test.afterEach(async () => {
    await page.close();
  });
});`);
    }

    /**
     * Create Playwright page object template
     */
    createPlaywrightPageTemplate() {
        return Handlebars.compile(`import { Page, Locator } from '@playwright/test';

export class {{titleCase className}} {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  {{#each selectors}}
  get {{camelCase name}}(): Locator {
    return this.page.locator('{{selector}}');
  }
  {{/each}}

  async {{camelCase primaryAction}}{{titleCase primaryEntity}}(data: any): Promise<void> {
    {{#each actions}}
    {{code}}
    {{/each}}
  }

  async verify{{titleCase primaryEntity}}{{titleCase primaryAction}}(): Promise<void> {
    // Verification logic
    {{#each selectors}}
    await expect(this.{{camelCase name}}).toBeVisible();
    {{/each}}
  }

  async navigate(): Promise<void> {
    await this.page.goto('/{{kebabCase primaryEntity}}');
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}`);
    }

    /**
     * Create Playwright configuration template
     */
    createPlaywrightConfigTemplate() {
        return Handlebars.compile(`import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {{#each browserOptions}}
    {
      name: '{{this}}',
      use: { ...devices['Desktop {{titleCase this}}'] },
    },
    {{/each}}
  ],

  webServer: {
    command: 'npm run start',
    port: 3000,
  },
});`);
    }

    /**
     * Get Playwright framework features
     */
    getFrameworkFeatures() {
        return [
            'Multi-browser testing',
            'Auto-waiting',
            'Network interception',
            'Screenshot comparison',
            'Video recording',
            'Tracing',
            'Mobile device emulation',
            'API testing',
            'Visual regression testing'
        ];
    }

    /**
     * Get supported file types
     */
    getSupportedFileTypes() {
        return ['test', 'page', 'config', 'helpers', 'fixtures'];
    }

    /**
     * Generate Playwright fixtures
     */
    async generateFixtures(context) {
        const template = this.createPlaywrightFixturesTemplate();
        return template(context);
    }

    /**
     * Create Playwright fixtures template
     */
    createPlaywrightFixturesTemplate() {
        return Handlebars.compile(`import { test as base } from '@playwright/test';
import { {{titleCase className}} } from '../pages/{{kebabCase className}}';

type TestFixtures = {
  {{camelCase className}}: {{titleCase className}};
};

export const test = base.extend<TestFixtures>({
  {{camelCase className}}: async ({ page }, use) => {
    const {{camelCase className}} = new {{titleCase className}}(page);
    await use({{camelCase className}});
  },
});

export { expect } from '@playwright/test';`);
    }

    /**
     * Enhanced artifact generation
     */
    async generateArtifacts(analysis, matches, templateContext) {
        const artifacts = await super.generateArtifacts(analysis, matches, templateContext);
        
        // Add Playwright-specific files
        const context = this.enhanceContext(templateContext, analysis, matches);
        artifacts.files.fixtures = await this.generateFixtures(context);
        
        return artifacts;
    }
}

module.exports = PlaywrightAdapter;
