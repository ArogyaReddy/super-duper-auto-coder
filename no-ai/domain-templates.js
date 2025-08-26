// Domain-Specific Template Library for Enhanced UNIVERSAL MASTER STEPS
// Templates for different requirement types to improve quality

const DOMAIN_TEMPLATES = {
  
  // Employee/Contractor Management Templates
  EMPLOYEE_CONTRACTOR: {
    scenarios: [
      {
        title: 'Convert W2 employee to contractor',
        steps: [
          'Given I have a W2 employee created from extraction',
          'When I access them in the Employee app',
          'Then I should be able to switch them to contractor status',
          'And the employee type should be updated correctly'
        ]
      },
      {
        title: 'Convert contractor to W2 employee', 
        steps: [
          'Given I have a contractor created from extraction',
          'When I access them in the Employee app', 
          'Then I should be able to switch them to W2 employee status',
          'And the contractor status should be converted properly'
        ]
      },
      {
        title: 'Validate employee type conversion restrictions',
        steps: [
          'Given an employee has pending payroll transactions',
          'When I attempt to change their employment type',
          'Then the system should validate the conversion is allowed',
          'And display appropriate warnings if restrictions exist'
        ]
      }
    ]
  },

  // Payroll System Templates
  PAYROLL_SYSTEM: {
    scenarios: [
      {
        title: 'Validate priorPayrollProvider field handling',
        steps: [
          'Given a user has no existing payroll vendor',
          'When the system processes their onboarding data',
          'Then priorPayrollProvider should not be set to "Other"',
          'And the field should remain unset for new companies'
        ]
      },
      {
        title: 'Environment-specific vendor ID validation',
        steps: [
          'Given the user selects "New Company - No Existing Vendor" option',
          'When the system processes the selection in <environment>',
          'Then the system should use vendor ID <vendorId>',
          'And priorPayrollProvider should be set to <expectedValue>'
        ],
        isOutline: true,
        examples: [
          { environment: 'FIT', vendorId: '35', expectedValue: 'null' },
          { environment: 'IAT', vendorId: '39', expectedValue: 'null' },
          { environment: 'Prod', vendorId: '48', expectedValue: 'null' }
        ]
      }
    ]
  },

  // UI/Frontend Templates
  UI_INTERACTION: {
    scenarios: [
      {
        title: 'User navigation and interaction',
        steps: [
          'Given the user is on the application page',
          'When the user clicks the primary action button',
          'Then the expected page should load',
          'And the user should see confirmation of the action'
        ]
      },
      {
        title: 'Form validation and submission',
        steps: [
          'Given the user is on a form page',
          'When the user enters valid data and submits',
          'Then the form should be processed successfully',
          'And the user should see a success message'
        ]
      },
      {
        title: 'Error handling for invalid input',
        steps: [
          'Given the user is on a form page',
          'When the user enters invalid data',
          'Then appropriate validation errors should be displayed',
          'And the user should be guided to correct the input'
        ]
      }
    ]
  },

  // API and Backend Templates
  API_BACKEND: {
    scenarios: [
      {
        title: 'API endpoint validation',
        steps: [
          'Given the API endpoint is available',
          'When a valid request is sent with required parameters',
          'Then the API should return a successful response',
          'And the response data should match the expected schema'
        ]
      },
      {
        title: 'API error handling',
        steps: [
          'Given the API endpoint is available',
          'When an invalid request is sent',
          'Then the API should return an appropriate error code',
          'And the error message should be descriptive'
        ]
      },
      {
        title: 'API authentication validation',
        steps: [
          'Given the user has valid authentication credentials',
          'When they access a protected API endpoint',
          'Then the request should be processed successfully',
          'And the appropriate data should be returned'
        ]
      }
    ]
  },

  // Data Processing and Migration Templates
  DATA_MIGRATION: {
    scenarios: [
      {
        title: 'Data extraction and validation',
        steps: [
          'Given source data exists in the legacy system',
          'When the extraction process is initiated',
          'Then all relevant data should be extracted accurately',
          'And data integrity should be maintained'
        ]
      },
      {
        title: 'Data transformation validation',
        steps: [
          'Given extracted data needs processing',
          'When the transformation rules are applied',
          'Then the data should be converted to the target format',
          'And all business rules should be enforced'
        ]
      },
      {
        title: 'Data migration rollback',
        steps: [
          'Given a data migration has been performed',
          'When an error is detected in the migrated data',
          'Then the system should support rollback to the previous state',
          'And data consistency should be maintained'
        ]
      }
    ]
  },

  // Security and Access Control Templates
  SECURITY_ACCESS: {
    scenarios: [
      {
        title: 'User authentication validation',
        steps: [
          'Given a user has valid credentials',
          'When they attempt to log in',
          'Then authentication should succeed',
          'And they should have access to authorized features'
        ]
      },
      {
        title: 'Role-based access control',
        steps: [
          'Given a user has specific role permissions',
          'When they attempt to access a restricted feature',
          'Then access should be granted or denied based on their role',
          'And appropriate feedback should be provided'
        ]
      },
      {
        title: 'Session management',
        steps: [
          'Given a user is logged into the system',
          'When their session expires or they log out',
          'Then they should be securely logged out',
          'And sensitive data should not be accessible'
        ]
      }
    ]
  },

  // Reporting and Analytics Templates
  REPORTING_ANALYTICS: {
    scenarios: [
      {
        title: 'Report generation validation',
        steps: [
          'Given the user has access to reporting features',
          'When they request a specific report',
          'Then the report should be generated with accurate data',
          'And the report should be available in the requested format'
        ]
      },
      {
        title: 'Data filtering and sorting',
        steps: [
          'Given a report contains multiple data entries',
          'When the user applies filters or sorting',
          'Then the data should be displayed according to the criteria',
          'And the results should be accurate and complete'
        ]
      },
      {
        title: 'Export functionality validation',
        steps: [
          'Given a report is displayed',
          'When the user chooses to export the data',
          'Then the export should complete successfully',
          'And the exported file should contain all visible data'
        ]
      }
    ]
  },

  // Integration and System Communication Templates
  INTEGRATION_SYSTEMS: {
    scenarios: [
      {
        title: 'Third-party system integration',
        steps: [
          'Given the system needs to communicate with external services',
          'When data synchronization is triggered',
          'Then the integration should complete successfully',
          'And data consistency should be maintained across systems'
        ]
      },
      {
        title: 'Webhook validation',
        steps: [
          'Given webhooks are configured for event notifications',
          'When a triggering event occurs',
          'Then the webhook should be called with correct data',
          'And the external system should receive the notification'
        ]
      },
      {
        title: 'System health monitoring',
        steps: [
          'Given monitoring is enabled for system components',
          'When a component experiences issues',
          'Then alerts should be generated appropriately',
          'And system administrators should be notified'
        ]
      }
    ]
  },

  // Configuration and Settings Templates
  CONFIGURATION_SETTINGS: {
    scenarios: [
      {
        title: 'Configuration parameter validation',
        steps: [
          'Given system configuration parameters exist',
          'When an administrator updates a setting',
          'Then the change should be applied correctly',
          'And the system should behave according to the new configuration'
        ]
      },
      {
        title: 'Environment-specific configuration',
        steps: [
          'Given different environments have specific configurations',
          'When the system is deployed to an environment',
          'Then the correct configuration should be applied',
          'And environment-specific features should work as expected'
        ]
      },
      {
        title: 'Configuration backup and restore',
        steps: [
          'Given system configurations can be backed up',
          'When a configuration restore is needed',
          'Then the previous configuration should be restored accurately',
          'And system functionality should return to the previous state'
        ]
      }
    ]
  },

  // Business Logic Templates
  BUSINESS_LOGIC: {
    scenarios: [
      {
        title: 'Business rule validation',
        steps: [
          'Given the business rule is defined',
          'When the rule conditions are met',
          'Then the expected business outcome should occur',
          'And the system should enforce the rule consistently'
        ]
      },
      {
        title: 'Edge case handling',
        steps: [
          'Given edge case conditions exist',
          'When the system processes the edge case',
          'Then appropriate handling should occur',
          'And system should remain stable'
        ]
      },
      {
        title: 'Data validation and integrity',
        steps: [
          'Given business data is being processed',
          'When validation rules are applied',
          'Then data integrity should be maintained',
          'And invalid data should be rejected appropriately'
        ]
      }
    ]
  },

  // Technical/Integration Templates (fallback for unclassified technical content)
  TECHNICAL_INTEGRATION: {
    scenarios: [
      {
        title: 'System integration functionality',
        steps: [
          'Given the system components are integrated',
          'When data flows between components',
          'Then integration should work seamlessly',
          'And data should be transferred correctly'
        ]
      },
      {
        title: 'Error handling and recovery',
        steps: [
          'Given a system component fails',
          'When the failure is detected',
          'Then appropriate error handling should occur',
          'And the system should recover gracefully'
        ]
      },
      {
        title: 'Performance and reliability',
        steps: [
          'Given the system is under normal load',
          'When operations are performed',
          'Then performance should meet requirements',
          'And the system should remain reliable'
        ]
      }
    ]
  }
};

// Enhanced content detection for specific domains
function detectSpecificDomain(content) {
  const contentLower = content.toLowerCase();
  
  // Employee/Contractor Management
  if (/employee.*contractor|contractor.*employee|w2.*contractor|employment.*type/i.test(content)) {
    return 'EMPLOYEE_CONTRACTOR';
  }
  
  // Payroll System
  if (/payroll|vendor.*id|priorpayrollprovider|onboarding/i.test(content)) {
    return 'PAYROLL_SYSTEM';
  }
  
  // UI Interaction
  if (/button|click|display|page|form|user.*interface/i.test(content)) {
    return 'UI_INTERACTION';
  }
  
  // API/Backend
  if (/api|endpoint|service|request|response/i.test(content)) {
    return 'API_BACKEND';
  }
  
  // Data Migration/Processing
  if (/migration|extract|transform|etl|data.*processing/i.test(content)) {
    return 'DATA_MIGRATION';
  }
  
  // Security/Access
  if (/security|authentication|authorization|access.*control|login|credentials/i.test(content)) {
    return 'SECURITY_ACCESS';
  }
  
  // Reporting/Analytics
  if (/report|analytics|dashboard|chart|graph|export/i.test(content)) {
    return 'REPORTING_ANALYTICS';
  }
  
  // Integration/Systems
  if (/integration|webhook|third.*party|external.*system/i.test(content)) {
    return 'INTEGRATION_SYSTEMS';
  }
  
  // Configuration/Settings
  if (/configuration|config|settings|environment|parameter/i.test(content)) {
    return 'CONFIGURATION_SETTINGS';
  }
  
  // Business Logic
  if (/business.*rule|validation|logic|rule.*engine/i.test(content)) {
    return 'BUSINESS_LOGIC';
  }
  
  // Technical/Integration (default for technical content)
  return 'TECHNICAL_INTEGRATION';
}

// Get scenarios from template library
function getScenariosFromTemplate(domain, content) {
  if (DOMAIN_TEMPLATES[domain]) {
    return DOMAIN_TEMPLATES[domain].scenarios;
  }
  
  // Fallback to generic but contextual scenarios
  return DOMAIN_TEMPLATES.TECHNICAL_INTEGRATION.scenarios;
}

// Main function to get domain templates
function getDomainTemplates(content) {
  const domain = detectSpecificDomain(content);
  return getScenariosFromTemplate(domain, content);
}

// Main domain identification function
function identifyDomain(content) {
  return detectSpecificDomain(content);
}

module.exports = {
  DOMAIN_TEMPLATES,
  detectSpecificDomain,
  getScenariosFromTemplate,
  getDomainTemplates,
  identifyDomain
};
