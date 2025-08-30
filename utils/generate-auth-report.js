#!/usr/bin/env node

/**
 * 📊 Universal Authentication Report Generator
 * 
 * Generate comprehensive authentication testing reports
 * Usage: node utils/generate-auth-report.js
 */

const fs = require('fs-extra');
const path = require('path');
const { UniversalAuthenticationHandler } = require('./universal-authentication-handler');

async function generateComprehensiveAuthReport() {
    console.log('📊 UNIVERSAL AUTHENTICATION REPORT GENERATOR');
    console.log('============================================');
    console.log('Generating comprehensive authentication analysis...\n');

    try {
        // Initialize handler to access configuration
        const auth = new UniversalAuthenticationHandler();
        
        const report = {
            generatedAt: new Date().toISOString(),
            timestamp: auth.generateTimestamp(),
            framework: {
                name: 'Universal Authentication Handler',
                version: '1.0.0',
                description: 'THE BEST - Multi-environment, multi-user-type, multi-application authentication'
            },
            configuration: {
                userTypes: auth.USER_TYPES,
                environments: Object.keys(auth.ENVIRONMENT_CONFIG).map(env => ({
                    name: env,
                    description: auth.ENVIRONMENT_CONFIG[env].name,
                    clientBaseUrl: auth.ENVIRONMENT_CONFIG[env].CLIENT_BASE_URL,
                    serviceBaseUrl: auth.ENVIRONMENT_CONFIG[env].SERVICE_BASE_URL,
                    applications: Object.keys(auth.ENVIRONMENT_CONFIG[env].PRODUCT_IDS)
                })),
                applications: Object.keys(auth.APPLICATION_ROUTING).map(app => ({
                    name: app,
                    description: auth.APPLICATION_ROUTING[app].name,
                    clientUrlTemplate: auth.APPLICATION_ROUTING[app].CLIENT_URL_TEMPLATE,
                    serviceUrlTemplate: auth.APPLICATION_ROUTING[app].SERVICE_URL_TEMPLATE
                }))
            },
            supportMatrix: generateSupportMatrix(auth),
            urlExamples: generateUrlExamples(auth),
            credentialExamples: generateCredentialExamples(),
            usageGuide: generateUsageGuide(),
            troubleshooting: generateTroubleshootingGuide()
        };

        // Save report
        const reportsDir = path.join(__dirname, '..', 'reports');
        await fs.ensureDir(reportsDir);
        
        const fileName = `Universal_Auth_Configuration_Report_${auth.timestamp}.json`;
        const filePath = path.join(reportsDir, fileName);
        
        await fs.writeJSON(filePath, report, { spaces: 2 });
        
        // Generate human-readable summary
        const summaryPath = await generateHumanReadableSummary(report, reportsDir, auth.timestamp);
        
        console.log('✅ Comprehensive authentication report generated!');
        console.log(`📄 JSON Report: ${fileName}`);
        console.log(`📋 Summary Report: ${path.basename(summaryPath)}`);
        console.log(`📁 Location: ${reportsDir}`);
        
        // Display key statistics
        displayReportSummary(report);
        
        return { success: true, reportPath: filePath, summaryPath };
        
    } catch (error) {
        console.error('❌ Report generation failed:', error.message);
        return { success: false, error: error.message };
    }
}

function generateSupportMatrix(auth) {
    const matrix = [];
    
    Object.keys(auth.ENVIRONMENT_CONFIG).forEach(env => {
        Object.keys(auth.USER_TYPES).forEach(userType => {
            Object.keys(auth.APPLICATION_ROUTING).forEach(app => {
                matrix.push({
                    environment: env,
                    userType,
                    application: app,
                    supported: true,
                    urlPattern: userType === 'CLIENT' 
                        ? auth.APPLICATION_ROUTING[app].CLIENT_URL_TEMPLATE 
                        : auth.APPLICATION_ROUTING[app].SERVICE_URL_TEMPLATE,
                    baseUrl: userType === 'CLIENT'
                        ? auth.ENVIRONMENT_CONFIG[env].CLIENT_BASE_URL
                        : auth.ENVIRONMENT_CONFIG[env].SERVICE_BASE_URL
                });
            });
        });
    });
    
    return matrix;
}

function generateUrlExamples(auth) {
    const examples = [];
    
    // Generate examples for each combination
    ['QAFIT', 'IAT'].forEach(env => {
        ['CLIENT', 'SERVICE_USER'].forEach(userType => {
            ['RUN', 'MAX'].forEach(app => {
                const envConfig = auth.ENVIRONMENT_CONFIG[env];
                const appConfig = auth.APPLICATION_ROUTING[app];
                
                let url;
                if (userType === 'CLIENT') {
                    url = appConfig.CLIENT_URL_TEMPLATE
                        .replace('{BASE_URL}', envConfig.CLIENT_BASE_URL)
                        .replace('{PRODUCT_ID}', envConfig.PRODUCT_IDS[app])
                        .replace('{ENV}', env.toLowerCase());
                } else {
                    url = appConfig.SERVICE_URL_TEMPLATE
                        .replace('{SERVICE_BASE_URL}', envConfig.SERVICE_BASE_URL);
                }
                
                examples.push({
                    environment: env,
                    userType,
                    application: app,
                    url,
                    description: `${userType} login for ${app} in ${env} environment`
                });
            });
        });
    });
    
    return examples;
}

function generateCredentialExamples() {
    return {
        CLIENT: {
            format: 'Username@IID',
            examples: [
                'owner1@12345',
                'payrolladmin@67890',
                'hradmin@11111'
            ],
            description: 'Business clients with IID-based authentication'
        },
        SERVICE_USER: {
            format: 'username@adp',
            examples: [
                'cautomation3@adp',
                'serviceuser@adp',
                'associate123@adp'
            ],
            description: 'Internal users and service personnel'
        }
    };
}

function generateUsageGuide() {
    return {
        quickStart: [
            'const { UniversalAuthenticationHandler } = require("./utils/universal-authentication-handler");',
            'const auth = new UniversalAuthenticationHandler();',
            'await auth.performUniversalAuthentication(page, targetUrl, "username/password");'
        ],
        batchTesting: [
            'const results = await auth.performBatchAuthentication(',
            '    page,',
            '    "owner1@12345/password",',
            '    ["RUN", "MAX"],      // Applications',
            '    ["QAFIT", "IAT"]     // Environments',
            ');'
        ],
        autoLoad: [
            'const result = await auth.authenticateWithAutoCredentials(',
            '    page,',
            '    targetUrl,',
            '    "CLIENT",    // User type',
            '    "QAFIT",     // Environment',
            '    "RUN"        // Application',
            ');'
        ]
    };
}

function generateTroubleshootingGuide() {
    return {
        commonIssues: [
            {
                issue: 'Authentication fails with valid credentials',
                solutions: [
                    'Check if the target URL is accessible',
                    'Verify credential format (username/password)',
                    'Ensure environment detection is correct',
                    'Check for network connectivity issues'
                ]
            },
            {
                issue: 'Auto-load credentials not found',
                solutions: [
                    'Verify SBS_Automation directory structure',
                    'Check credential files exist in data/[env]/',
                    'Validate JSON file formats',
                    'Ensure environment name matches exactly'
                ]
            },
            {
                issue: 'Batch testing fails partially',
                solutions: [
                    'Review individual failure reasons',
                    'Check environment-specific configurations',
                    'Verify application support for user type',
                    'Increase timeout values if needed'
                ]
            }
        ],
        debuggingTips: [
            'Enable screenshots for visual debugging',
            'Use headless: false to observe browser behavior',
            'Check console output for detailed error messages',
            'Review generated authentication reports',
            'Validate selectors for specific applications'
        ]
    };
}

async function generateHumanReadableSummary(report, reportsDir, timestamp) {
    const summaryContent = `
# Universal Authentication Handler - Configuration Report

**Generated:** ${new Date(report.generatedAt).toLocaleString()}
**Framework:** ${report.framework.name} v${report.framework.version}

## 🌍 Supported Environments

${report.configuration.environments.map(env => `
### ${env.name}
- **Environment Code:** ${env.name}
- **Client Base URL:** ${env.clientBaseUrl}
- **Service Base URL:** ${env.serviceBaseUrl}
- **Applications:** ${env.applications.join(', ')}
`).join('')}

## 👥 User Types

${Object.keys(report.configuration.userTypes).map(userType => `
### ${userType}
- **Login Pattern:** ${report.configuration.userTypes[userType].loginPattern}
- **Auth Flow:** ${report.configuration.userTypes[userType].authFlow}
- **Description:** ${report.configuration.userTypes[userType].description}
- **Roles:** ${report.configuration.userTypes[userType].roles.join(', ')}
`).join('')}

## 📱 Applications

${report.configuration.applications.map(app => `
### ${app.name}
- **Application Code:** ${app.name}
- **Client URL Pattern:** ${app.clientUrlTemplate}
- **Service URL Pattern:** ${app.serviceUrlTemplate}
`).join('')}

## 🔗 URL Examples

${report.urlExamples.slice(0, 8).map(example => `
### ${example.environment} - ${example.userType} - ${example.application}
\`\`\`
${example.url}
\`\`\`
`).join('')}

## 🔑 Credential Examples

### CLIENT Users
- **Format:** ${report.credentialExamples.CLIENT.format}
- **Examples:** ${report.credentialExamples.CLIENT.examples.join(', ')}

### SERVICE_USER
- **Format:** ${report.credentialExamples.SERVICE_USER.format}
- **Examples:** ${report.credentialExamples.SERVICE_USER.examples.join(', ')}

## 🚀 Usage Examples

### Quick Start
\`\`\`javascript
${report.usageGuide.quickStart.join('\n')}
\`\`\`

### Batch Testing
\`\`\`javascript
${report.usageGuide.batchTesting.join('\n')}
\`\`\`

### Auto-Load Credentials
\`\`\`javascript
${report.usageGuide.autoLoad.join('\n')}
\`\`\`

## 🔧 Troubleshooting

${report.troubleshooting.commonIssues.map(issue => `
### ${issue.issue}
${issue.solutions.map(solution => `- ${solution}`).join('\n')}
`).join('')}

### Debugging Tips
${report.troubleshooting.debuggingTips.map(tip => `- ${tip}`).join('\n')}

## 📊 Support Matrix

Total Combinations Supported: **${report.supportMatrix.length}**

- Environments: ${report.configuration.environments.length}
- User Types: ${Object.keys(report.configuration.userTypes).length}
- Applications: ${report.configuration.applications.length}

---
*Report generated by Universal Authentication Handler v${report.framework.version}*
`;

    const summaryFileName = `Universal_Auth_Summary_${timestamp}.md`;
    const summaryPath = path.join(reportsDir, summaryFileName);
    
    await fs.writeFile(summaryPath, summaryContent);
    
    return summaryPath;
}

function displayReportSummary(report) {
    console.log('\n📊 REPORT SUMMARY');
    console.log('================');
    console.log(`🌍 Environments: ${report.configuration.environments.length}`);
    console.log(`👥 User Types: ${Object.keys(report.configuration.userTypes).length}`);
    console.log(`📱 Applications: ${report.configuration.applications.length}`);
    console.log(`🔗 URL Examples: ${report.urlExamples.length}`);
    console.log(`🎯 Support Matrix: ${report.supportMatrix.length} combinations`);
    console.log('');
    console.log('🌍 Supported Environments:');
    report.configuration.environments.forEach(env => {
        console.log(`   • ${env.name} - ${env.description}`);
    });
    console.log('');
    console.log('📱 Supported Applications:');
    report.configuration.applications.forEach(app => {
        console.log(`   • ${app.name} - ${app.description}`);
    });
}

// CLI execution
if (require.main === module) {
    generateComprehensiveAuthReport()
        .then(result => {
            if (result.success) {
                console.log('\n🎉 Authentication report generation COMPLETED');
                process.exit(0);
            } else {
                console.log('\n❌ Authentication report generation FAILED');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { generateComprehensiveAuthReport };
