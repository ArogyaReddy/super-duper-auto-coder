/**
 * Jest Adapter - Generates Jest-specific test artifacts
 * Specializes in unit and integration testing
 */

const FrameworkAdapter = require('./framework-adapter');
const Handlebars = require('handlebars');

class JestAdapter extends FrameworkAdapter {
    constructor(options = {}) {
        super(options);
        this.testType = options.testType || 'unit'; // unit, integration, component
        this.setupFiles = options.setupFiles || [];
        this.moduleMapper = options.moduleMapper || {};
    }

    /**
     * Setup Jest-specific configuration
     */
    setupFrameworkConfig() {
        this.config = {
            testEnvironment: this.testType === 'component' ? 'jsdom' : 'node',
            setupFilesAfterEnv: this.setupFiles,
            moduleNameMapping: this.moduleMapper,
            collectCoverageFrom: [
                'src/**/*.{js,ts}',
                '!src/**/*.d.ts'
            ],
            testMatch: [
                '**/__tests__/**/*.(js|ts)',
                '**/*.(test|spec).(js|ts)'
            ],
            transform: {
                '^.+\\.(js|ts)$': 'babel-jest'
            }
        };
    }

    /**
     * Get Jest import statement
     */
    getFrameworkImport() {
        const imports = ['describe', 'it', 'expect', 'beforeEach', 'afterEach'];
        
        if (this.testType === 'component') {
            imports.push('render', 'screen', 'fireEvent');
            return `import { ${imports.slice(0, 5).join(', ')} } from '@jest/globals';
import { ${imports.slice(5).join(', ')} } from '@testing-library/react';`;
        }
        
        return `const { ${imports.join(', ')} } = require('@jest/globals');`;
    }

    /**
     * Get Jest test declaration
     */
    getTestDeclaration() {
        return 'it';
    }

    /**
     * Get Jest assertion syntax
     */
    getAssertionSyntax(actual, expected, type) {
        const assertionMap = {
            'toBe': `expect(${actual}).toBe(${expected})`,
            'toEqual': `expect(${actual}).toEqual(${expected})`,
            'toBeDefined': `expect(${actual}).toBeDefined()`,
            'toBeNull': `expect(${actual}).toBeNull()`,
            'toBeTruthy': `expect(${actual}).toBeTruthy()`,
            'toBeFalsy': `expect(${actual}).toBeFalsy()`,
            'toContain': `expect(${actual}).toContain(${expected})`,
            'toHaveLength': `expect(${actual}).toHaveLength(${expected})`,
            'toHaveBeenCalled': `expect(${actual}).toHaveBeenCalled()`,
            'toHaveBeenCalledWith': `expect(${actual}).toHaveBeenCalledWith(${expected})`,
            'toThrow': `expect(${actual}).toThrow(${expected})`,
            'toMatchSnapshot': `expect(${actual}).toMatchSnapshot()`
        };
        
        return assertionMap[type] || `expect(${actual}).${type}(${expected})`;
    }

    /**
     * Get Jest setup code
     */
    getSetupCode() {
        if (this.testType === 'component') {
            return `// Setup for component testing
let component;
let mockProps;

beforeEach(() => {
  mockProps = {
    // Mock props
  };
});`;
        }
        
        return `// Setup for ${this.testType} testing
let mockData;
let instance;

beforeEach(() => {
  mockData = {
    // Mock data
  };
});`;
    }

    /**
     * Get Jest teardown code
     */
    getTeardownCode() {
        if (this.testType === 'component') {
            return `afterEach(() => {
  // Cleanup DOM
  document.body.innerHTML = '';
});`;
        }
        
        return `afterEach(() => {
  // Reset mocks
  jest.resetAllMocks();
});`;
    }

    /**
     * Check if Jest supports page objects (only for integration tests)
     */
    supportsPageObjects() {
        return this.testType === 'integration';
    }

    /**
     * Get Jest action method
     */
    getActionMethod(actionName) {
        if (this.testType === 'component') {
            const actionMap = {
                'click': 'fireEvent.click',
                'type': 'fireEvent.change',
                'submit': 'fireEvent.submit',
                'focus': 'fireEvent.focus',
                'blur': 'fireEvent.blur'
            };
            return actionMap[actionName] || actionName;
        }
        
        // For unit tests
        const actionMap = {
            'call': 'jest.fn()',
            'mock': 'jest.mock',
            'spy': 'jest.spyOn'
        };
        return actionMap[actionName] || actionName;
    }

    /**
     * Generate Jest-specific selectors
     */
    generateSelectors(analysis) {
        if (this.testType === 'component') {
            return analysis.entities.map(entity => {
                const name = entity.entity;
                return {
                    name: name,
                    selector: this.getComponentSelector(name),
                    type: this.inferComponentType(name),
                    description: `${name} component element`
                };
            });
        }
        
        // For unit tests, generate method/property selectors
        return analysis.entities.map(entity => ({
            name: entity.entity,
            selector: `instance.${entity.entity}`,
            type: 'property',
            description: `${entity.entity} property/method`
        }));
    }

    /**
     * Get component selector for testing library
     */
    getComponentSelector(entityName) {
        const name = entityName.toLowerCase();
        
        if (name.includes('button')) {
            return `screen.getByRole('button', { name: '${entityName}' })`;
        } else if (name.includes('input')) {
            return `screen.getByLabelText('${entityName}')`;
        } else if (name.includes('text')) {
            return `screen.getByText('${entityName}')`;
        } else {
            return `screen.getByTestId('${name}')`;
        }
    }

    /**
     * Infer component type
     */
    inferComponentType(entityName) {
        const name = entityName.toLowerCase();
        
        if (name.includes('button')) return 'button';
        if (name.includes('input')) return 'input';
        if (name.includes('form')) return 'form';
        if (name.includes('text')) return 'text';
        if (name.includes('list')) return 'list';
        
        return 'element';
    }

    /**
     * Generate Jest test file
     */
    async generateTestFile(context) {
        const template = this.templates.test || this.createJestTestTemplate();
        return template(context);
    }

    /**
     * Create Jest test template based on test type
     */
    createJestTestTemplate() {
        if (this.testType === 'component') {
            return this.createComponentTestTemplate();
        } else if (this.testType === 'integration') {
            return this.createIntegrationTestTemplate();
        } else {
            return this.createUnitTestTemplate();
        }
    }

    /**
     * Create unit test template
     */
    createUnitTestTemplate() {
        return Handlebars.compile(`// Generated Jest unit test
const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const { {{titleCase className}} } = require('../src/{{kebabCase className}}');

describe('{{titleCase className}}', () => {
  let {{camelCase className}};
  let mockData;

  beforeEach(() => {
    mockData = {
      {{#each entities}}
      {{camelCase entity}}: 'test {{entity}}',
      {{/each}}
    };
    {{camelCase className}} = new {{titleCase className}}(mockData);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should {{primaryAction}} {{primaryEntity}}', () => {
    // Arrange
    const expected = 'expected result';

    // Act
    const result = {{camelCase className}}.{{camelCase primaryAction}}(mockData.{{camelCase primaryEntity}});

    // Assert
    expect(result).toBeDefined();
    expect(result).toBe(expected);
  });

  {{#each actions}}
  it('should handle {{name}} action', () => {
    // Test {{description}}
    const spy = jest.spyOn({{../camelCase ../className}}, '{{name}}');
    
    {{../camelCase ../className}}.{{name}}();
    
    expect(spy).toHaveBeenCalled();
  });
  {{/each}}
});`);
    }

    /**
     * Create component test template
     */
    createComponentTestTemplate() {
        return Handlebars.compile(`// Generated Jest component test
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { {{titleCase className}} } from '../src/components/{{kebabCase className}}';

describe('{{titleCase className}} Component', () => {
  let mockProps;

  beforeEach(() => {
    mockProps = {
      {{#each entities}}
      {{camelCase entity}}: 'test {{entity}}',
      {{/each}}
      on{{titleCase primaryAction}}: jest.fn()
    };
  });

  it('should render {{primaryEntity}} component', () => {
    render(<{{titleCase className}} {...mockProps} />);
    
    {{#each selectors}}
    const {{camelCase name}}Element = {{selector}};
    expect({{camelCase name}}Element).toBeInTheDocument();
    {{/each}}
  });

  it('should handle {{primaryAction}} action', () => {
    render(<{{titleCase className}} {...mockProps} />);
    
    const {{camelCase primaryEntity}}Element = screen.getByTestId('{{kebabCase primaryEntity}}');
    
    fireEvent.click({{camelCase primaryEntity}}Element);
    
    expect(mockProps.on{{titleCase primaryAction}}).toHaveBeenCalled();
  });

  it('should match snapshot', () => {
    const { container } = render(<{{titleCase className}} {...mockProps} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});`);
    }

    /**
     * Create integration test template
     */
    createIntegrationTestTemplate() {
        return Handlebars.compile(`// Generated Jest integration test
const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const request = require('supertest');
const app = require('../src/app');

describe('{{titleCase featureName}} Integration', () => {
  let server;

  beforeEach(async () => {
    server = app.listen(0);
  });

  afterEach(async () => {
    await server.close();
  });

  it('should {{primaryAction}} {{primaryEntity}} via API', async () => {
    const testData = {
      {{#each entities}}
      {{camelCase entity}}: 'test {{entity}}',
      {{/each}}
    };

    const response = await request(server)
      .post('/api/{{kebabCase primaryEntity}}')
      .send(testData)
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.{{camelCase primaryEntity}}).toBe(testData.{{camelCase primaryEntity}});
  });

  it('should validate {{primaryEntity}} data', async () => {
    const invalidData = {};

    const response = await request(server)
      .post('/api/{{kebabCase primaryEntity}}')
      .send(invalidData)
      .expect(400);

    expect(response.body.error).toBeDefined();
  });
});`);
    }

    /**
     * Create Jest configuration template
     */
    createJestConfigTemplate() {
        return Handlebars.compile(`// Generated Jest configuration
module.exports = {
  testEnvironment: '{{testEnvironment}}',
  setupFilesAfterEnv: [
    {{#each setupFiles}}
    '{{this}}',
    {{/each}}
  ],
  moduleNameMapping: {
    {{#each moduleMapper}}
    '{{@key}}': '{{this}}',
    {{/each}}
  },
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/**/index.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '**/__tests__/**/*.(js|ts)',
    '**/*.(test|spec).(js|ts)'
  ],
  transform: {
    '^.+\\\\.(js|ts)$': 'babel-jest'
  },
  {{#if_eq testType 'component'}}
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  {{/if_eq}}
};`);
    }

    /**
     * Generate Jest configuration
     */
    async generateConfigFile(context) {
        const template = this.templates.config || this.createJestConfigTemplate();
        return template({
            ...context,
            testEnvironment: this.config.testEnvironment,
            setupFiles: this.setupFiles,
            moduleMapper: this.moduleMapper,
            testType: this.testType
        });
    }

    /**
     * Generate Jest helper/utility file
     */
    async generateHelperFiles(context) {
        const template = this.createJestHelpersTemplate();
        return template(context);
    }

    /**
     * Create Jest helpers template
     */
    createJestHelpersTemplate() {
        return Handlebars.compile(`// Generated Jest test helpers
{{#if_eq testType 'component'}}
import '@testing-library/jest-dom';

// Custom render function with providers
export function renderWithProviders(ui, options = {}) {
  const AllTheProviders = ({ children }) => {
    return (
      <Provider store={store}>
        {children}
      </Provider>
    );
  };
  
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Mock data factories
{{#each entities}}
export function create{{titleCase entity}}Mock(overrides = {}) {
  return {
    id: '1',
    {{camelCase entity}}: 'test {{entity}}',
    ...overrides
  };
}
{{/each}}

{{else}}
// Mock factories for unit tests
{{#each entities}}
function create{{titleCase entity}}Mock(overrides = {}) {
  return {
    {{camelCase entity}}: 'test {{entity}}',
    ...overrides
  };
}
{{/each}}

// Utility functions
function mockAsync(returnValue) {
  return jest.fn().mockResolvedValue(returnValue);
}

function mockAsyncError(error) {
  return jest.fn().mockRejectedValue(error);
}

module.exports = {
  {{#each entities}}
  create{{titleCase entity}}Mock,
  {{/each}}
  mockAsync,
  mockAsyncError
};
{{/if_eq}}`);
    }

    /**
     * Get Jest framework features
     */
    getFrameworkFeatures() {
        return [
            'Unit testing',
            'Integration testing',
            'Component testing',
            'Snapshot testing',
            'Mock functions',
            'Code coverage',
            'Parallel test execution',
            'Watch mode',
            'Custom matchers'
        ];
    }

    /**
     * Get supported file types
     */
    getSupportedFileTypes() {
        return ['test', 'config', 'helpers', 'mocks', 'setup'];
    }

    /**
     * Enhanced context for Jest
     */
    enhanceContext(baseContext, analysis, matches) {
        const context = super.enhanceContext(baseContext, analysis, matches);
        
        return {
            ...context,
            testType: this.testType,
            jest: {
                testType: this.testType,
                supportsComponents: this.testType === 'component',
                supportsAPI: this.testType === 'integration',
                mockStrategy: this.getMockStrategy(analysis)
            }
        };
    }

    /**
     * Get mocking strategy based on analysis
     */
    getMockStrategy(analysis) {
        if (analysis.intent === 'creation') {
            return 'factory';
        } else if (analysis.intent === 'testing') {
            return 'spy';
        } else {
            return 'stub';
        }
    }
}

module.exports = JestAdapter;
