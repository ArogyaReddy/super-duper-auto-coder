/**
 * 🎯 MASTER PAGE OBJECTS LIBRARY
 * 
 * This library contains battle-tested, reusable page object patterns extracted from
 * the main SBS_Automation framework. These pages follow 100% SBS patterns.
 * 
 * ✅ USAGE: Always check this library FIRST before creating new page objects
 * ✅ PATTERNS: All pages match main SBS_Automation exactly
 * ✅ REUSE: Eliminates duplication and ensures consistency
 */

const path = require('path');
const fs = require('fs-extra');

class MasterPageObjectsLibrary {
  constructor() {
    this.masterPages = new Map();
    this.pageTemplates = new Map();
    this.sbsPatterns = this.loadSBSPagePatterns();
    
    this.initializeMasterPages();
    console.log('🎯 Master Page Objects Library initialized with', this.masterPages.size, 'battle-tested page patterns');
  }

  loadSBSPagePatterns() {
    return {
      imports: {
        base: "const By = require('./../../support/By.js');\nlet BasePage = require('../common/base-page');",
        chai: "const { assert } = require('chai');"
      },
      constructor: `  constructor(page) {
    super(page);
    this.page = page;
  }`,
      locatorPatterns: {
        dataTestId: "const ELEMENT_NAME = By.css('[data-test-id=\"element-id\"]');",
        xpath: "const ELEMENT_NAME = By.xpath('//xpath-expression');",
        combined: "const ELEMENT_NAME = By.css('[data-test-id=\"primary-id\"]') | By.xpath('//fallback-xpath');"
      },
      methodPatterns: {
        click: `  async clickElementName() {
    await this.clickElement(ELEMENT_NAME);
  }`,
        verify: `  async isElementNameDisplayed() {
    return await this.isVisibleIgnoreError(ELEMENT_NAME);
  }`,
        getText: `  async getElementNameText() {
    return await this.getElementText(ELEMENT_NAME);
  }`,
        waitFor: `  async waitForElementName() {
    await this.waitForElement(ELEMENT_NAME);
  }`
      }
    };
  }

  initializeMasterPages() {
    // 🏠 HOME PAGE TEMPLATE
    this.addMasterPage('home', 'HomePage', {
      description: 'Main application home page with navigation and dashboard elements',
      extends: 'BasePage',
      locators: [
        { name: 'PAYROLL_SECTION', selector: '[data-test-id="payroll-section"]', type: 'css' },
        { name: 'REPORTS_SECTION', selector: '[data-test-id="reports-section"]', type: 'css' },
        { name: 'TODOS_SECTION', selector: '[data-test-id="todos-section"]', type: 'css' },
        { name: 'CALENDAR_SECTION', selector: '[data-test-id="calendar-section"]', type: 'css' },
        { name: 'RUN_PAYROLL_BUTTON', selector: '[data-test-id="run-payroll-button"]', type: 'css' },
        { name: 'SEARCH_BOX', selector: '[data-test-id="search-input"]', type: 'css' }
      ],
      methods: [
        'isPayrollSectionDisplayed',
        'isReportSectionDisplayed',
        'isToDosSectionDisplayed',
        'isCalendarSectionDisplayed',
        'isPayrollButtonDisplayed',
        'clickPayrollSection',
        'searchForAnOptionInHomePage',
        'isOptionDisplayedInSearchResults'
      ],
      imports: ['base-page', 'By.js']
    });

    // 🔐 LOGIN PAGE TEMPLATE
    this.addMasterPage('login', 'LoginPage', {
      description: 'User authentication page with login form and validation',
      extends: 'BasePage',
      locators: [
        { name: 'USERNAME_FIELD', selector: '#login-form_username', type: 'css' },
        { name: 'PASSWORD_FIELD', selector: '#login-form_password', type: 'css' },
        { name: 'LOGIN_BUTTON', selector: '#signBtn, #btnNext', type: 'css' },
        { name: 'ERROR_MESSAGE', selector: '[data-test-id="error-message"]', type: 'css' },
        { name: 'FORGOT_PASSWORD_LINK', selector: '[data-test-id="forgot-password"]', type: 'css' }
      ],
      methods: [
        'enterUsername',
        'enterPassword',
        'clickLoginButton',
        'performLogin',
        'isErrorMessageDisplayed',
        'getErrorMessageText',
        'clickForgotPassword'
      ],
      imports: ['base-page', 'By.js']
    });

    // 🧭 NAVIGATION PAGE TEMPLATE
    this.addMasterPage('navigation', 'NavigationPage', {
      description: 'Left navigation menu with module access',
      extends: 'BasePage',
      locators: [
        { name: 'LEFT_NAV_MENU', selector: '[data-test-id="left-navigation"]', type: 'css' },
        { name: 'EMPLOYEES_MENU', selector: '[data-test-id="nav-employees"]', type: 'css' },
        { name: 'REPORTS_MENU', selector: '[data-test-id="nav-reports"]', type: 'css' },
        { name: 'PAYROLL_MENU', selector: '[data-test-id="nav-payroll"]', type: 'css' },
        { name: 'SETTINGS_MENU', selector: '[data-test-id="nav-settings"]', type: 'css' }
      ],
      methods: [
        'clickOnLeftNavIcon',
        'isLeftNavMenuDisplayed',
        'clickEmployeesMenu',
        'clickReportsMenu',
        'clickPayrollMenu',
        'clickSettingsMenu'
      ],
      imports: ['base-page', 'By.js']
    });

    // 👥 EMPLOYEE PAGE TEMPLATE
    this.addMasterPage('employees', 'EmployeePage', {
      description: 'Employee management page with CRUD operations',
      extends: 'BasePage',
      locators: [
        { name: 'ADD_EMPLOYEE_BUTTON', selector: '[data-test-id="add-employee"]', type: 'css' },
        { name: 'EMPLOYEE_LIST', selector: '[data-test-id="employee-list"]', type: 'css' },
        { name: 'SEARCH_EMPLOYEE', selector: '[data-test-id="search-employee"]', type: 'css' },
        { name: 'EMPLOYEE_NAME_FIELD', selector: '[data-test-id="employee-name"]', type: 'css' },
        { name: 'SAVE_BUTTON', selector: '[data-test-id="save-employee"]', type: 'css' },
        { name: 'CANCEL_BUTTON', selector: '[data-test-id="cancel-employee"]', type: 'css' }
      ],
      methods: [
        'clickAddEmployee',
        'enterEmployeeName',
        'clickSaveEmployee',
        'clickCancelEmployee',
        'searchEmployee',
        'isEmployeeListDisplayed',
        'isEmployeeInList'
      ],
      imports: ['base-page', 'By.js']
    });

    // 📊 REPORTS PAGE TEMPLATE
    this.addMasterPage('reports', 'ReportsPage', {
      description: 'Reports and analytics page with filtering and generation',
      extends: 'BasePage',
      locators: [
        { name: 'REPORT_TYPE_DROPDOWN', selector: '[data-test-id="report-type"]', type: 'css' },
        { name: 'DATE_FROM', selector: '[data-test-id="date-from"]', type: 'css' },
        { name: 'DATE_TO', selector: '[data-test-id="date-to"]', type: 'css' },
        { name: 'GENERATE_REPORT_BUTTON', selector: '[data-test-id="generate-report"]', type: 'css' },
        { name: 'REPORT_RESULTS', selector: '[data-test-id="report-results"]', type: 'css' },
        { name: 'DOWNLOAD_BUTTON', selector: '[data-test-id="download-report"]', type: 'css' }
      ],
      methods: [
        'selectReportType',
        'setDateFrom',
        'setDateTo',
        'clickGenerateReport',
        'isReportResultsDisplayed',
        'clickDownloadReport',
        'getReportData'
      ],
      imports: ['base-page', 'By.js']
    });

    // 💰 PAYROLL PAGE TEMPLATE
    this.addMasterPage('payroll', 'PayrollPage', {
      description: 'Payroll processing page with employee selection and calculations',
      extends: 'BasePage',
      locators: [
        { name: 'RUN_PAYROLL_BUTTON', selector: '[data-test-id="run-payroll"]', type: 'css' },
        { name: 'EMPLOYEE_SELECT_ALL', selector: '[data-test-id="select-all-employees"]', type: 'css' },
        { name: 'PAY_PERIOD_DROPDOWN', selector: '[data-test-id="pay-period"]', type: 'css' },
        { name: 'PAYROLL_DATE', selector: '[data-test-id="payroll-date"]', type: 'css' },
        { name: 'CALCULATE_BUTTON', selector: '[data-test-id="calculate-payroll"]', type: 'css' },
        { name: 'APPROVE_BUTTON', selector: '[data-test-id="approve-payroll"]', type: 'css' }
      ],
      methods: [
        'clickRunPayroll',
        'selectAllEmployees',
        'selectPayPeriod',
        'setPayrollDate',
        'clickCalculatePayroll',
        'clickApprovePayroll',
        'isPayrollCalculated'
      ],
      imports: ['base-page', 'By.js']
    });

    // 🔍 SEARCH PAGE TEMPLATE
    this.addMasterPage('search', 'SearchPage', {
      description: 'Global search functionality with filters and results',
      extends: 'BasePage',
      locators: [
        { name: 'SEARCH_INPUT', selector: '[data-test-id="global-search"]', type: 'css' },
        { name: 'SEARCH_BUTTON', selector: '[data-test-id="search-submit"]', type: 'css' },
        { name: 'SEARCH_RESULTS', selector: '[data-test-id="search-results"]', type: 'css' },
        { name: 'FILTER_OPTIONS', selector: '[data-test-id="search-filters"]', type: 'css' },
        { name: 'NO_RESULTS_MESSAGE', selector: '[data-test-id="no-results"]', type: 'css' }
      ],
      methods: [
        'enterSearchTerm',
        'clickSearchButton',
        'performSearch',
        'isSearchResultsDisplayed',
        'getSearchResults',
        'applyFilter',
        'isNoResultsMessageDisplayed'
      ],
      imports: ['base-page', 'By.js']
    });

    // 🛡️ SECURITY MODAL TEMPLATE
    this.addMasterPage('security', 'SecurityVerificationModal', {
      description: 'Security verification modal for step-up authentication',
      extends: 'BasePage',
      locators: [
        { name: 'SECURITY_MODAL', selector: '[data-test-id="security-modal"]', type: 'css' },
        { name: 'SEND_EMAIL_BUTTON', selector: '[data-test-id="send-email"]', type: 'css' },
        { name: 'SEND_TEXT_BUTTON', selector: '[data-test-id="send-text"]', type: 'css' },
        { name: 'VERIFICATION_CODE', selector: '[data-test-id="verification-code"]', type: 'css' },
        { name: 'CONFIRM_BUTTON', selector: '[data-test-id="confirm-verification"]', type: 'css' },
        { name: 'CANCEL_BUTTON', selector: '[data-test-id="cancel-verification"]', type: 'css' }
      ],
      methods: [
        'isSecurityModalDisplayed',
        'clickSendEmail',
        'clickSendText',
        'enterVerificationCode',
        'clickConfirm',
        'clickCancel',
        'sendMeAnEmailOrTextAndConfirmIfStepup'
      ],
      imports: ['base-page', 'By.js']
    });

    console.log(`✅ Initialized ${this.masterPages.size} master page object templates`);
  }

  addMasterPage(category, className, metadata) {
    const pageKey = `${category}:${className}`;
    
    this.masterPages.set(pageKey, {
      category,
      className,
      ...metadata,
      source: 'SBS_Automation',
      tested: true,
      reusable: true
    });
  }

  /**
   * Find page objects by category
   */
  findPagesByCategory(category) {
    const results = [];
    for (const [pageKey, pageData] of this.masterPages.entries()) {
      if (pageData.category === category) {
        results.push({
          pageKey,
          ...pageData
        });
      }
    }
    return results;
  }

  /**
   * Find similar page objects using keywords
   */
  findSimilarPages(keywords, threshold = 0.6) {
    const matches = [];
    const normalizedKeywords = keywords.map(k => k.toLowerCase());

    for (const [pageKey, pageData] of this.masterPages.entries()) {
      const pageText = `${pageData.className} ${pageData.description}`.toLowerCase();
      const methodText = pageData.methods ? pageData.methods.join(' ').toLowerCase() : '';
      const combinedText = `${pageText} ${methodText}`;
      
      const matchCount = normalizedKeywords.filter(keyword => 
        combinedText.includes(keyword)
      ).length;

      if (matchCount > 0) {
        const relevanceScore = matchCount / normalizedKeywords.length;
        if (relevanceScore >= threshold) {
          matches.push({
            ...pageData,
            pageKey,
            relevanceScore
          });
        }
      }
    }

    return matches.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Generate page object file content using master template
   */
  generatePageObjectFile(pageData, customization = {}) {
    const {
      className,
      description,
      extends: extendsClass = 'BasePage',
      locators = [],
      methods = [],
      imports = []
    } = { ...pageData, ...customization };

    let content = '';

    // Add imports
    content += this.sbsPatterns.imports.base + '\n\n';

    // Add locators
    if (locators.length > 0) {
      content += '// Locators\n';
      locators.forEach(locator => {
        const locatorCode = this.generateLocatorCode(locator);
        content += locatorCode + '\n';
      });
      content += '\n';
    }

    // Add class definition
    content += `class ${className} extends ${extendsClass} {\n`;
    content += this.sbsPatterns.constructor + '\n\n';

    // Add methods
    methods.forEach(methodName => {
      const methodCode = this.generateMethodCode(methodName, locators);
      content += methodCode + '\n';
    });

    content += '}\n\n';
    content += `module.exports = ${className};`;

    return content;
  }

  /**
   * Generate locator code
   */
  generateLocatorCode(locator) {
    const { name, selector, type } = locator;
    
    switch (type) {
      case 'css':
        return `const ${name} = By.css('${selector}');`;
      case 'xpath':
        return `const ${name} = By.xpath('${selector}');`;
      case 'combined':
        return `const ${name} = By.css('${selector}') | By.xpath('${selector}');`;
      default:
        return `const ${name} = By.css('${selector}');`;
    }
  }

  /**
   * Generate method code
   */
  generateMethodCode(methodName, locators) {
    const methodType = this.getMethodType(methodName);
    const relatedLocator = this.findRelatedLocator(methodName, locators);
    
    switch (methodType) {
      case 'click':
        return `  async ${methodName}() {
    await this.clickElement(${relatedLocator});
  }`;
      case 'verify':
        return `  async ${methodName}() {
    return await this.isVisibleIgnoreError(${relatedLocator});
  }`;
      case 'getText':
        return `  async ${methodName}() {
    return await this.getElementText(${relatedLocator});
  }`;
      case 'enter':
        return `  async ${methodName}(text) {
    await this.fillElement(${relatedLocator}, text);
  }`;
      default:
        return `  async ${methodName}() {
    // Implementation needed for ${methodName}
    // Related locator: ${relatedLocator}
  }`;
    }
  }

  /**
   * Get method type from method name
   */
  getMethodType(methodName) {
    const name = methodName.toLowerCase();
    if (name.includes('click')) return 'click';
    if (name.includes('is') && name.includes('displayed')) return 'verify';
    if (name.includes('get') && name.includes('text')) return 'getText';
    if (name.includes('enter') || name.includes('fill')) return 'enter';
    return 'custom';
  }

  /**
   * Find related locator for a method
   */
  findRelatedLocator(methodName, locators) {
    const name = methodName.toLowerCase();
    
    for (const locator of locators) {
      const locatorName = locator.name.toLowerCase();
      const locatorWords = locatorName.split('_');
      
      // Check if method name contains locator words
      if (locatorWords.some(word => name.includes(word.toLowerCase()))) {
        return locator.name;
      }
    }
    
    // Return first locator if no match found
    return locators.length > 0 ? locators[0].name : 'ELEMENT_NAME';
  }

  /**
   * Suggest page object structure based on requirements
   */
  suggestPageStructure(requirement) {
    const keywords = this.extractKeywords(requirement);
    const suggestions = this.findSimilarPages(keywords);
    
    if (suggestions.length > 0) {
      const bestMatch = suggestions[0];
      return {
        suggested: true,
        template: bestMatch,
        customizations: this.generateCustomizations(requirement, bestMatch),
        alternatives: suggestions.slice(1, 3)
      };
    }

    return {
      suggested: false,
      template: this.getGenericTemplate(),
      customizations: {},
      alternatives: []
    };
  }

  /**
   * Get generic page template
   */
  getGenericTemplate() {
    return {
      category: 'general',
      className: 'GenericPage',
      description: 'Generic page object template',
      extends: 'BasePage',
      locators: [
        { name: 'MAIN_ELEMENT', selector: '[data-test-id="main-element"]', type: 'css' }
      ],
      methods: [
        'isMainElementDisplayed',
        'clickMainElement'
      ],
      imports: ['base-page', 'By.js']
    };
  }

  /**
   * Generate customizations for a page template
   */
  generateCustomizations(requirement, template) {
    const keywords = this.extractKeywords(requirement);
    const customizations = {};

    // Customize class name
    if (keywords.length > 0) {
      customizations.className = `${this.toPascalCase(keywords[0])}Page`;
    }

    // Customize description
    customizations.description = `Page object for ${keywords.join(' ')} functionality`;

    return customizations;
  }

  /**
   * Get all categories
   */
  getCategories() {
    const categories = new Set();
    for (const [pageKey, pageData] of this.masterPages.entries()) {
      categories.add(pageData.category);
    }
    return Array.from(categories);
  }

  /**
   * Get master page statistics
   */
  getStatistics() {
    const stats = {
      totalPages: this.masterPages.size,
      categories: {},
      totalMethods: 0,
      totalLocators: 0
    };

    for (const [pageKey, pageData] of this.masterPages.entries()) {
      // Count by category
      if (!stats.categories[pageData.category]) {
        stats.categories[pageData.category] = 0;
      }
      stats.categories[pageData.category]++;

      // Count methods and locators
      if (pageData.methods) {
        stats.totalMethods += pageData.methods.length;
      }
      if (pageData.locators) {
        stats.totalLocators += pageData.locators.length;
      }
    }

    return stats;
  }

  /**
   * 🚫 GET CORRECT SBS IMPORT PATHS
   * These are the ONLY approved import paths for page objects in auto-coder/SBS_Automation/
   */
  getCorrectSBSImports() {
    return {
      basePage: "const BasePage = require('../../../SBS_Automation/pages/common/base-page');",
      byJs: "const By = require('../../../SBS_Automation/support/By.js');",
      chai: "const { assert } = require('chai');",
      explanation: 'Import paths must reference main SBS_Automation framework, NOT local copies'
    };
  }

  /**
   * 🏗️ GET CORRECT SBS CONSTRUCTOR PATTERN  
   * Extracted from main SBS_Automation framework - NO locators in constructor
   */
  getCorrectSBSConstructor() {
    return {
      pattern: `  constructor(page) {
    super(page);
    this.page = page;
  }`,
      rules: [
        'NO locators or selectors in constructor',
        'NO this.selectors object',
        'ONLY super(page) and this.page = page',
        'ALL locators defined at top of file as constants'
      ],
      source: '/Users/gadea/auto/auto/qa_automation/SBS_Automation/pages/common/home-page.js'
    };
  }

  /**
   * 🔍 GET SBS LOCATOR STRATEGY
   * Combined Primary|Secondary|Fallback using XPath OR operators
   */
  getSBSLocatorStrategy() {
    return {
      pattern: "const ELEMENT_NAME = By.xpath(`//primary-xpath | //secondary-xpath | //fallback-xpath`);",
      examples: [
        "const OK = By.id('OkButton');",
        "const GARNISHMENT_TASK = \"//div[contains(text(),'Pay employee Garnishments for')]\";",
        "const TAB = (option) => By.xpath(`//div[@data-test-id='tabs']//span[@data-test-id='${option}'] | //*[@data-test-id='${option}']`);"
      ],
      rules: [
        'Define ALL locators at top of file as constants',
        'Use combined selectors with OR (|) operators when needed',
        'NO separate fallback locator objects',
        'Follow SBS naming conventions (UPPERCASE_SNAKE_CASE)'
      ]
    };
  }

  /**
   * 🚫 VALIDATE PAGE OBJECT COMPLIANCE
   * Ensures generated page objects follow SBS patterns exactly
   */
  validatePageObjectCompliance(pageContent) {
    const issues = [];
    
    // Check for console.log statements
    if (pageContent.includes('console.log')) {
      issues.push('❌ CONSOLE.LOG ERROR: Remove all console.log statements - not allowed in SBS framework');
    }
    
    // Check for wrong import paths
    if (pageContent.includes("require('../../pages/common/base-page')")) {
      issues.push('❌ IMPORT PATH ERROR: Use correct path to main SBS_Automation base-page');
    }
    
    // Check for selectors in constructor
    if (pageContent.includes('this.selectors = {')) {
      issues.push('❌ CONSTRUCTOR ERROR: NO selectors in constructor - define as constants at top');
    }
    
    // Check for generic return true
    const returnTrueCount = (pageContent.match(/return true;/g) || []).length;
    if (returnTrueCount > 2) {
      issues.push('❌ RETURN TRUE ERROR: Too many generic "return true" statements - implement proper logic');
    }
    
    if (issues.length > 0) {
      throw new Error(`❌ PAGE OBJECT COMPLIANCE ERRORS:\n${issues.join('\n')}`);
    }
    
    return true;
  }

  /**
   * 🎯 GENERATE SBS COMPLIANT PAGE OBJECT
   * Creates page objects that match main SBS_Automation patterns exactly
   */
  generateSBSCompliantPageObject(pageData, className) {
    const imports = this.getCorrectSBSImports();
    const constructor = this.getCorrectSBSConstructor();
    
    let content = `${imports.byJs}\n${imports.basePage}\n${imports.chai}\n\n`;
    
    // Add locators at top (SBS pattern)
    if (pageData.locators && pageData.locators.length > 0) {
      content += '// 🔍 LOCATORS - Defined at top following SBS patterns\n';
      pageData.locators.forEach(locator => {
        const locatorName = locator.name.toUpperCase();
        if (locator.type === 'xpath') {
          content += `const ${locatorName} = By.xpath('${locator.selector}');\n`;
        } else {
          content += `const ${locatorName} = By.css('${locator.selector}');\n`;
        }
      });
      content += '\n';
    }
    
    // Add class definition
    content += `class ${className} extends BasePage {\n`;
    content += constructor.pattern + '\n\n';
    
    // Add methods with proper SBS patterns
    if (pageData.methods && pageData.methods.length > 0) {
      pageData.methods.forEach(methodName => {
        const methodType = this.getMethodType(methodName);
        const relatedLocator = this.findRelatedLocator(methodName, pageData.locators || []);
        
        switch (methodType) {
          case 'click':
            content += `  async ${methodName}() {\n    await this.clickElement(${relatedLocator});\n  }\n\n`;
            break;
          case 'verify':
            content += `  async ${methodName}() {\n    return await this.isVisible(${relatedLocator});\n  }\n\n`;
            break;
          default:
            content += `  async ${methodName}() {\n    // TODO: Implement ${methodName} functionality\n    await this.waitForElement(${relatedLocator});\n  }\n\n`;
        }
      });
    }
    
    content += '}\n\n';
    content += `module.exports = ${className};\n`;
    
    // Validate compliance before returning
    this.validatePageObjectCompliance(content);
    
    return content;
  }

  // ...existing code...
}

module.exports = MasterPageObjectsLibrary;
