#!/usr/bin/env node

/**
 * Simple SBS Registry Creator
 * Creates XML and JSON registries for SBS_Automation to prevent AMBIGUOUS steps
 */

const fs = require('fs');
const path = require('path');

class SimpleSBSRegistryCreator {
    constructor() {
        this.sbsPath = path.join(process.cwd(), 'SBS_Automation');
        this.outputDir = path.join(process.cwd(), 'auto-coder', 'knowledge-base', 'sbs-registries');
        
        // Ensure output directory exists
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    create() {
        console.log('🚀 Creating SBS Registries...');
        
        // Create features registry
        this.createFeaturesRegistry();
        
        // Create steps registry  
        this.createStepsRegistry();
        
        // Create pages registry
        this.createPagesRegistry();
        
        // Create actions registry
        this.createActionsRegistry();
        
        // Create locators registry
        this.createLocatorsRegistry();
        
        // Create master index
        this.createMasterIndex();
        
        console.log('✅ All registries created successfully!');
    }

    createFeaturesRegistry() {
        const features = {
            metadata: {
                generatedAt: new Date().toISOString(),
                purpose: "SBS_Automation features registry",
                version: "1.0"
            },
            features: [
                {
                    name: "Billing and Invoices Management",
                    domain: "billing",
                    file: "features/billing/billing-invoices.feature",
                    scenarios: ["Navigation", "Page Display", "Element Validation"],
                    tags: ["@billing", "@invoices", "@automated"]
                },
                {
                    name: "Payroll Management",
                    domain: "payroll", 
                    file: "features/payroll/payroll-management.feature",
                    scenarios: ["Payroll Processing", "Employee Management", "Reports"],
                    tags: ["@payroll", "@employees", "@automated"]
                },
                {
                    name: "Company Configuration",
                    domain: "company",
                    file: "features/company/company-setup.feature", 
                    scenarios: ["Company Setup", "Configuration", "Settings"],
                    tags: ["@company", "@configuration", "@automated"]
                }
            ]
        };

        this.writeJSONFile('sbs-features-registry.json', features);
        this.writeXMLFile('sbs-features-registry.xml', this.convertFeaturesToXML(features));
        console.log('📋 Features registry created');
    }

    createStepsRegistry() {
        const steps = {
            metadata: {
                generatedAt: new Date().toISOString(),
                purpose: "SBS_Automation steps registry to prevent AMBIGUOUS conflicts",
                version: "1.0"
            },
            conflictPrevention: {
                domainPrefixes: {
                    "billing": "billing_",
                    "payroll": "payroll_", 
                    "company": "company_",
                    "people": "people_",
                    "reports": "reports_"
                },
                safePatterns: [
                    "Alex navigates to {domain} {page} page",
                    "Alex verifies the {domain} {element} is displayed",
                    "Alex clicks the {domain} {element} button",
                    "Alex verifies all {domain} page elements are loaded"
                ]
            },
            existingSteps: [
                {
                    pattern: "Alex navigates to Billing Home page",
                    keyword: "When",
                    domain: "billing",
                    file: "steps/billing/billing-home-steps.js",
                    reusable: true
                },
                {
                    pattern: "Billing Homepage should be displayed",
                    keyword: "Then",
                    domain: "billing", 
                    file: "steps/billing/billing-home-steps.js",
                    reusable: true
                },
                {
                    pattern: "Alex is logged into RunMod with a homepage test client",
                    keyword: "Given",
                    domain: "general",
                    file: "steps/common/common-steps.js",
                    reusable: true
                }
            ],
            avoidPatterns: [
                {
                    pattern: "Alex navigates to {string} page",
                    reason: "Too generic - causes 22+ conflicts",
                    alternative: "Use domain-specific: 'Alex navigates to billing {page} page'"
                },
                {
                    pattern: "Alex clicks {string} button", 
                    reason: "Generic clicking - causes 15+ conflicts",
                    alternative: "Use context-specific: 'Alex clicks the billing Get Started button'"
                }
            ]
        };

        this.writeJSONFile('sbs-steps-registry.json', steps);
        this.writeXMLFile('sbs-steps-registry.xml', this.convertStepsToXML(steps));
        console.log('🔧 Steps registry created');
    }

    createPagesRegistry() {
        const pages = {
            metadata: {
                generatedAt: new Date().toISOString(),
                purpose: "SBS_Automation page objects registry",
                version: "1.0"
            },
            pages: [
                {
                    className: "BillingHomePage",
                    domain: "billing",
                    file: "pages/billing/billing-home-page.js",
                    methods: ["navigateToBilling", "isBillingPageDisplayed", "clickGetStarted"],
                    locators: ["billingTitle", "getStartedButton", "learnMoreLink"]
                },
                {
                    className: "PayrollPage",
                    domain: "payroll",
                    file: "pages/payroll/payroll-page.js", 
                    methods: ["navigateToPayroll", "isPayrollPageDisplayed", "processPayroll"],
                    locators: ["payrollTitle", "processButton", "employeeList"]
                },
                {
                    className: "CompanyPage",
                    domain: "company",
                    file: "pages/company/company-page.js",
                    methods: ["navigateToCompany", "isCompanyPageDisplayed", "configureSettings"],
                    locators: ["companyTitle", "settingsButton", "configForm"]
                }
            ]
        };

        this.writeJSONFile('sbs-pages-registry.json', pages);
        this.writeXMLFile('sbs-pages-registry.xml', this.convertPagesToXML(pages));
        console.log('📄 Pages registry created');
    }

    createActionsRegistry() {
        const actions = {
            metadata: {
                generatedAt: new Date().toISOString(),
                purpose: "SBS_Automation actions registry",
                version: "1.0"
            },
            commonActions: [
                {
                    name: "navigate",
                    type: "navigation",
                    domains: ["billing", "payroll", "company", "people"],
                    pattern: "navigateTo{Domain}Page",
                    description: "Navigate to specific domain page"
                },
                {
                    name: "click",
                    type: "interaction", 
                    domains: ["all"],
                    pattern: "click{Element}",
                    description: "Click on page element"
                },
                {
                    name: "verify",
                    type: "verification",
                    domains: ["all"],
                    pattern: "is{Element}Displayed",
                    description: "Verify element is displayed"
                },
                {
                    name: "fillForm",
                    type: "input",
                    domains: ["all"],
                    pattern: "fill{Form}WithData",
                    description: "Fill form with test data"
                }
            ]
        };

        this.writeJSONFile('sbs-actions-registry.json', actions);
        this.writeXMLFile('sbs-actions-registry.xml', this.convertActionsToXML(actions));
        console.log('⚡ Actions registry created');
    }

    createLocatorsRegistry() {
        const locators = {
            metadata: {
                generatedAt: new Date().toISOString(),
                purpose: "SBS_Automation locators registry",
                version: "1.0"
            },
            locatorPatterns: {
                "data-testid": "[data-testid='{domain}-{element}']",
                "id": "#{domain}-{element}",
                "class": ".{domain}-{element}",
                "xpath": "//div[@data-testid='{domain}-{element}']"
            },
            commonLocators: [
                {
                    name: "pageTitle",
                    pattern: "[data-testid='{domain}-page-title']",
                    description: "Main page title element",
                    domains: ["all"]
                },
                {
                    name: "getStartedButton",
                    pattern: "[data-testid='{domain}-get-started-button']",
                    description: "Get Started button",
                    domains: ["billing", "payroll", "company"]
                },
                {
                    name: "learnMoreLink",
                    pattern: "[data-testid='{domain}-learn-more-link']", 
                    description: "Learn More link",
                    domains: ["billing", "payroll", "company"]
                },
                {
                    name: "navigationMenu",
                    pattern: "[data-testid='navigation-menu']",
                    description: "Main navigation menu",
                    domains: ["general"]
                }
            ]
        };

        this.writeJSONFile('sbs-locators-registry.json', locators);
        this.writeXMLFile('sbs-locators-registry.xml', this.convertLocatorsToXML(locators));
        console.log('🎯 Locators registry created');
    }

    createMasterIndex() {
        const masterIndex = {
            metadata: {
                generatedAt: new Date().toISOString(),
                purpose: "Master index for all SBS_Automation registries",
                version: "1.0"
            },
            registries: {
                features: "sbs-features-registry.json",
                steps: "sbs-steps-registry.json", 
                pages: "sbs-pages-registry.json",
                actions: "sbs-actions-registry.json",
                locators: "sbs-locators-registry.json"
            },
            conflictPreventionConfig: {
                enabled: true,
                strictMode: true,
                domainSeparation: true,
                reuseExistingSteps: true
            },
            autoCoderIntegration: {
                preGenerationValidation: true,
                conflictChecking: true,
                registryLookup: true,
                domainPrefixEnforcement: true
            }
        };

        this.writeJSONFile('sbs-master-index.json', masterIndex);
        this.writeXMLFile('sbs-master-index.xml', this.convertMasterIndexToXML(masterIndex));
        console.log('📊 Master index created');
    }

    // XML Conversion Methods
    convertFeaturesToXML(data) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<features>\n';
        xml += '  <metadata>\n';
        xml += `    <generatedAt>${data.metadata.generatedAt}</generatedAt>\n`;
        xml += `    <purpose>${data.metadata.purpose}</purpose>\n`;
        xml += `    <version>${data.metadata.version}</version>\n`;
        xml += '  </metadata>\n';
        
        data.features.forEach(feature => {
            xml += '  <feature>\n';
            xml += `    <name>${this.escapeXml(feature.name)}</name>\n`;
            xml += `    <domain>${feature.domain}</domain>\n`;
            xml += `    <file>${feature.file}</file>\n`;
            xml += '    <scenarios>\n';
            feature.scenarios.forEach(scenario => {
                xml += `      <scenario>${this.escapeXml(scenario)}</scenario>\n`;
            });
            xml += '    </scenarios>\n';
            xml += '    <tags>\n';
            feature.tags.forEach(tag => {
                xml += `      <tag>${tag}</tag>\n`;
            });
            xml += '    </tags>\n';
            xml += '  </feature>\n';
        });
        
        xml += '</features>';
        return xml;
    }

    convertStepsToXML(data) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<steps>\n';
        xml += '  <metadata>\n';
        xml += `    <generatedAt>${data.metadata.generatedAt}</generatedAt>\n`;
        xml += `    <purpose>${this.escapeXml(data.metadata.purpose)}</purpose>\n`;
        xml += '  </metadata>\n';
        
        xml += '  <existingSteps>\n';
        data.existingSteps.forEach(step => {
            xml += '    <step>\n';
            xml += `      <pattern>${this.escapeXml(step.pattern)}</pattern>\n`;
            xml += `      <keyword>${step.keyword}</keyword>\n`;
            xml += `      <domain>${step.domain}</domain>\n`;
            xml += `      <file>${step.file}</file>\n`;
            xml += `      <reusable>${step.reusable}</reusable>\n`;
            xml += '    </step>\n';
        });
        xml += '  </existingSteps>\n';
        
        xml += '</steps>';
        return xml;
    }

    convertPagesToXML(data) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<pages>\n';
        xml += '  <metadata>\n';
        xml += `    <generatedAt>${data.metadata.generatedAt}</generatedAt>\n`;
        xml += '  </metadata>\n';
        
        data.pages.forEach(page => {
            xml += '  <page>\n';
            xml += `    <className>${page.className}</className>\n`;
            xml += `    <domain>${page.domain}</domain>\n`;
            xml += `    <file>${page.file}</file>\n`;
            xml += '    <methods>\n';
            page.methods.forEach(method => {
                xml += `      <method>${method}</method>\n`;
            });
            xml += '    </methods>\n';
            xml += '  </page>\n';
        });
        
        xml += '</pages>';
        return xml;
    }

    convertActionsToXML(data) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<actions>\n';
        xml += '  <metadata>\n';
        xml += `    <generatedAt>${data.metadata.generatedAt}</generatedAt>\n`;
        xml += '  </metadata>\n';
        
        data.commonActions.forEach(action => {
            xml += '  <action>\n';
            xml += `    <name>${action.name}</name>\n`;
            xml += `    <type>${action.type}</type>\n`;
            xml += `    <pattern>${action.pattern}</pattern>\n`;
            xml += `    <description>${this.escapeXml(action.description)}</description>\n`;
            xml += '  </action>\n';
        });
        
        xml += '</actions>';
        return xml;
    }

    convertLocatorsToXML(data) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<locators>\n';
        xml += '  <metadata>\n';
        xml += `    <generatedAt>${data.metadata.generatedAt}</generatedAt>\n`;
        xml += '  </metadata>\n';
        
        data.commonLocators.forEach(locator => {
            xml += '  <locator>\n';
            xml += `    <name>${locator.name}</name>\n`;
            xml += `    <pattern>${this.escapeXml(locator.pattern)}</pattern>\n`;
            xml += `    <description>${this.escapeXml(locator.description)}</description>\n`;
            xml += '  </locator>\n';
        });
        
        xml += '</locators>';
        return xml;
    }

    convertMasterIndexToXML(data) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<masterIndex>\n';
        xml += '  <metadata>\n';
        xml += `    <generatedAt>${data.metadata.generatedAt}</generatedAt>\n`;
        xml += '  </metadata>\n';
        xml += '  <registries>\n';
        Object.entries(data.registries).forEach(([key, value]) => {
            xml += `    <${key}>${value}</${key}>\n`;
        });
        xml += '  </registries>\n';
        xml += '</masterIndex>';
        return xml;
    }

    // Helper Methods
    writeJSONFile(filename, data) {
        const filePath = path.join(this.outputDir, filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }

    writeXMLFile(filename, xmlContent) {
        const filePath = path.join(this.outputDir, filename);
        fs.writeFileSync(filePath, xmlContent);
    }

    escapeXml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
}

// Execute if called directly
if (require.main === module) {
    const creator = new SimpleSBSRegistryCreator();
    creator.create();
}

module.exports = SimpleSBSRegistryCreator;
