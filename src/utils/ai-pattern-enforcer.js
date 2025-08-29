/**
 * AI PATTERN ENFORCER
 * 
 * This module enforces real SBS patterns on AI-generated artifacts
 */

class AIPatternEnforcer {
    constructor() {
        this.realSBSPatterns = {
    "imports": {
        "bySupport": "const By = require('../../support/By.js');",
        "basePage": "const BasePage = require('./base-page');",
        "cucumberImports": "const { Given, When, Then } = require('@cucumber/cucumber');",
        "chaiImports": "const { assert, expect } = require('chai');",
        "pageReference": "let HomePage = require('../../pages/common/home-page');"
    },
    "locators": {
        "xpathPattern": "By.xpath(\"//div[@data-test-id='locator-name']\")",
        "cssPattern": "By.css(\"[data-test-id='locator-name']\")",
        "dynamicPattern": "const DYNAMIC_LOCATOR = (param) => By.xpath(`//div[text()=\"${param}\"]`);",
        "examples": [
            "const payrollCarousel = By.xpath(\"//div[@data-test-id='payroll-tile-wrapper']\");",
            "const RUN_PAYROLL_BUTTON = By.css(\"[data-test-id='run-payroll-btn']\");",
            "const GLOBAL_SEARCH_BAR = By.xpath('//input[@data-test-id=\"omnisearch-input\"]');"
        ]
    },
    "methods": {
        "waitPattern": "await this.waitForSelector(locator, timeout);",
        "clickPattern": "await this.clickElement(locator);",
        "visibilityPattern": "return await this.isVisible(locator, timeout);",
        "fillPattern": "await this.fill(locator, value);",
        "assertPattern": "assert.isTrue(condition, \"Error message\");",
        "instancePattern": "homePage = homePage || new HomePage(this.page);"
    },
    "structure": {
        "featureTags": "@Team:Agnostics\n@parentSuite:Home\n@regression @Home-SmokeTests",
        "stepDefinition": "Given('Alex is logged into RunMod with a homepage test client', { timeout: 420 * 1000 }, async function () {",
        "pageClass": "class RunModHomePage extends BasePage {",
        "constructor": "constructor(page) {\n    super(page);\n    this.page = page;\n  }"
    }
};
    }

    enforceFeaturePatterns(featureContent) {
        // Ensure proper tags
        if (!featureContent.includes('@Team:Agnostics')) {
            featureContent = '@Team:Agnostics
@parentSuite:Home
@regression @Home-SmokeTests\n' + featureContent;
        }
        
        // Ensure proper step formats
        featureContent = featureContent.replace(
            /Given I am/g, 
            'Given Alex is'
        );
        
        return featureContent;
    }

    enforceStepsPatterns(stepsContent) {
        // Ensure proper imports
        const requiredImports = [
            "const { assert, expect } = require('chai');",
            "const { Given, When, Then } = require('@cucumber/cucumber');",
            "let HomePage = require('../../pages/common/home-page');"
        ];
        
        for (const importStatement of requiredImports) {
            if (!stepsContent.includes(importStatement.split(' = ')[0])) {
                stepsContent = importStatement + '\n' + stepsContent;
            }
        }
        
        // Ensure proper instance pattern
        if (!stepsContent.includes('homePage = homePage ||')) {
            stepsContent = stepsContent.replace(
                /new HomePage\(this\.page\)/g,
                'homePage = homePage || new HomePage(this.page)'
            );
        }
        
        return stepsContent;
    }

    enforcePagePatterns(pageContent) {
        // Ensure proper imports
        if (!pageContent.includes("const By = require('../../support/By.js');")) {
            pageContent = 'const By = require('../../support/By.js');\n' + pageContent;
        }
        
        if (!pageContent.includes("const BasePage = require('./base-page');")) {
            pageContent = 'const BasePage = require('./base-page');\n' + pageContent;
        }
        
        // Convert simple CSS selectors to By patterns
        pageContent = pageContent.replace(
            /this\.(\w+)\s*=\s*'\[data-testid="([^"]+)"\]'/g,
            'this.$1 = By.css("[data-test-id=\'$2\']")'
        );
        
        // Ensure proper method patterns
        pageContent = pageContent.replace(
            /await this\.page\.click\(/g,
            'await this.clickElement('
        );
        
        pageContent = pageContent.replace(
            /await this\.page\.fill\(/g,
            'await this.fill('
        );
        
        return pageContent;
    }
}

module.exports = { AIPatternEnforcer };
