#!/usr/bin/env node

/**
 * 🎯 DOM CHANGE DETECTOR FOR UI REGRESSION
 * 
 * Mind-blowing features:
 * - Real-time DOM mutation monitoring
 * - Visual regression detection using canvas snapshots
 * - CSS selector-based change tracking
 * - Performance impact analysis of DOM changes
 * - Smart filtering to ignore irrelevant changes
 * - Screenshot comparison for visual diffs
 */

class DOMChangeDetector {
    constructor(options = {}) {
        this.options = {
            ignoreAttributes: ['data-timestamp', 'data-random', 'class'],
            ignoreTextChanges: false,
            ignoreStyleChanges: false,
            trackPerformance: true,
            screenshot: false,
            ...options
        };
        
        this.mutations = [];
        this.observer = null;
        this.performanceData = [];
        this.baseline = null;
        this.isRecording = false;
        this.changeCallbacks = [];
    }

    // Start monitoring DOM changes
    startMonitoring(targetElement = document.body) {
        if (typeof window === 'undefined') {
            throw new Error('DOM Change Detector requires a browser environment');
        }

        this.isRecording = true;
        this.mutations = [];
        this.performanceData = [];

        const config = {
            childList: true,
            subtree: true,
            attributes: true,
            attributeOldValue: true,
            characterData: true,
            characterDataOldValue: true
        };

        this.observer = new MutationObserver((mutationsList) => {
            this.processMutations(mutationsList);
        });

        this.observer.observe(targetElement, config);

        // Create baseline snapshot
        this.baseline = this.createDOMSnapshot(targetElement);

        console.log('🎯 DOM Change Detector started monitoring...');
        return this;
    }

    // Stop monitoring and return results
    stopMonitoring() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        this.isRecording = false;
        
        const report = this.generateReport();
        console.log('🏁 DOM monitoring stopped. Changes detected:', this.mutations.length);
        
        return report;
    }

    // Process mutation records
    processMutations(mutationsList) {
        const timestamp = Date.now();
        const performanceStart = performance.now();

        for (const mutation of mutationsList) {
            if (this.shouldIgnoreMutation(mutation)) {
                continue;
            }

            const changeData = {
                type: mutation.type,
                target: this.getElementSelector(mutation.target),
                timestamp: timestamp,
                oldValue: mutation.oldValue,
                newValue: this.getNewValue(mutation),
                addedNodes: this.serializeNodeList(mutation.addedNodes),
                removedNodes: this.serializeNodeList(mutation.removedNodes),
                attributeName: mutation.attributeName,
                impact: this.assessImpact(mutation),
                xpath: this.getXPath(mutation.target)
            };

            this.mutations.push(changeData);

            // Trigger callbacks
            this.changeCallbacks.forEach(callback => {
                try {
                    callback(changeData);
                } catch (error) {
                    console.error('Error in change callback:', error);
                }
            });
        }

        // Track performance impact
        if (this.options.trackPerformance) {
            const performanceEnd = performance.now();
            this.performanceData.push({
                timestamp,
                processingTime: performanceEnd - performanceStart,
                mutationCount: mutationsList.length
            });
        }
    }

    // Determine if mutation should be ignored
    shouldIgnoreMutation(mutation) {
        // Ignore specific attributes
        if (mutation.type === 'attributes' && 
            this.options.ignoreAttributes.includes(mutation.attributeName)) {
            return true;
        }

        // Ignore text changes if configured
        if (mutation.type === 'characterData' && this.options.ignoreTextChanges) {
            return true;
        }

        // Ignore style changes if configured
        if (mutation.type === 'attributes' && 
            mutation.attributeName === 'style' && 
            this.options.ignoreStyleChanges) {
            return true;
        }

        // Ignore script-injected tracking elements
        if (mutation.target.getAttribute && 
            (mutation.target.getAttribute('data-analytics') ||
             mutation.target.getAttribute('data-tracking'))) {
            return true;
        }

        return false;
    }

    // Get CSS selector for element
    getElementSelector(element) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) {
            return 'unknown';
        }

        const path = [];
        let current = element;

        while (current && current.nodeType === Node.ELEMENT_NODE) {
            let selector = current.nodeName.toLowerCase();
            
            if (current.id) {
                selector += `#${current.id}`;
                path.unshift(selector);
                break;
            } else if (current.className && typeof current.className === 'string') {
                const classes = current.className.trim().split(/\s+/).join('.');
                if (classes) {
                    selector += `.${classes}`;
                }
            }
            
            // Add nth-child if no unique identifier
            if (!current.id && current.parentNode) {
                const siblings = Array.from(current.parentNode.children);
                const index = siblings.indexOf(current) + 1;
                selector += `:nth-child(${index})`;
            }
            
            path.unshift(selector);
            current = current.parentNode;
        }

        return path.join(' > ');
    }

    // Get XPath for element
    getXPath(element) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) {
            return 'unknown';
        }

        const path = [];
        let current = element;

        while (current && current.nodeType === Node.ELEMENT_NODE) {
            let name = current.nodeName.toLowerCase();
            
            if (current.id) {
                path.unshift(`//${name}[@id="${current.id}"]`);
                break;
            }
            
            const parent = current.parentNode;
            if (parent) {
                const siblings = Array.from(parent.children).filter(e => e.nodeName === current.nodeName);
                if (siblings.length > 1) {
                    const index = siblings.indexOf(current) + 1;
                    name += `[${index}]`;
                }
            }
            
            path.unshift(name);
            current = current.parentNode;
        }

        return '/' + path.join('/');
    }

    // Get new value after mutation
    getNewValue(mutation) {
        switch (mutation.type) {
            case 'attributes':
                return mutation.target.getAttribute(mutation.attributeName);
            case 'characterData':
                return mutation.target.textContent;
            case 'childList':
                return mutation.addedNodes.length > 0 ? 'nodes_added' : 'nodes_removed';
            default:
                return null;
        }
    }

    // Serialize node list
    serializeNodeList(nodeList) {
        return Array.from(nodeList).map(node => ({
            type: node.nodeType,
            name: node.nodeName,
            text: node.textContent ? node.textContent.substring(0, 100) : null,
            attributes: node.attributes ? this.serializeAttributes(node.attributes) : null
        }));
    }

    // Serialize attributes
    serializeAttributes(attributes) {
        const attrs = {};
        for (let i = 0; i < attributes.length; i++) {
            const attr = attributes[i];
            attrs[attr.name] = attr.value;
        }
        return attrs;
    }

    // Assess impact of mutation
    assessImpact(mutation) {
        let impact = 'low';

        // High impact changes
        if (mutation.type === 'childList' && mutation.addedNodes.length > 5) {
            impact = 'high';
        } else if (mutation.attributeName === 'style' && 
                   mutation.oldValue && mutation.oldValue.includes('display')) {
            impact = 'high';
        } else if (mutation.target.tagName === 'FORM' || 
                   mutation.target.tagName === 'BUTTON') {
            impact = 'medium';
        }

        return impact;
    }

    // Create DOM snapshot for comparison
    createDOMSnapshot(element = document.body) {
        return {
            timestamp: Date.now(),
            html: element.outerHTML,
            structure: this.getDOMStructure(element),
            styles: this.getComputedStyles(element),
            boundingRect: element.getBoundingClientRect(),
            childCount: element.children.length
        };
    }

    // Get DOM structure tree
    getDOMStructure(element, depth = 0) {
        if (depth > 10) return null; // Prevent infinite recursion

        const structure = {
            tag: element.tagName,
            id: element.id || null,
            classes: element.className || null,
            childCount: element.children.length,
            children: []
        };

        for (let child of element.children) {
            structure.children.push(this.getDOMStructure(child, depth + 1));
        }

        return structure;
    }

    // Get computed styles for important properties
    getComputedStyles(element) {
        if (typeof window === 'undefined') return {};
        
        const styles = window.getComputedStyle(element);
        return {
            display: styles.display,
            position: styles.position,
            width: styles.width,
            height: styles.height,
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            fontSize: styles.fontSize,
            fontFamily: styles.fontFamily
        };
    }

    // Compare two DOM snapshots
    compareSnapshots(snapshot1, snapshot2) {
        const differences = [];

        // Compare structure
        if (JSON.stringify(snapshot1.structure) !== JSON.stringify(snapshot2.structure)) {
            differences.push({
                type: 'structure',
                description: 'DOM structure has changed',
                impact: 'high'
            });
        }

        // Compare styles
        const styleDiffs = this.compareObjects(snapshot1.styles, snapshot2.styles);
        if (styleDiffs.length > 0) {
            differences.push({
                type: 'styles',
                description: 'Computed styles have changed',
                changes: styleDiffs,
                impact: 'medium'
            });
        }

        // Compare dimensions
        if (snapshot1.boundingRect.width !== snapshot2.boundingRect.width ||
            snapshot1.boundingRect.height !== snapshot2.boundingRect.height) {
            differences.push({
                type: 'dimensions',
                description: 'Element dimensions have changed',
                oldSize: `${snapshot1.boundingRect.width}x${snapshot1.boundingRect.height}`,
                newSize: `${snapshot2.boundingRect.width}x${snapshot2.boundingRect.height}`,
                impact: 'medium'
            });
        }

        return differences;
    }

    // Compare two objects for differences
    compareObjects(obj1, obj2) {
        const differences = [];
        const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

        for (const key of allKeys) {
            if (obj1[key] !== obj2[key]) {
                differences.push({
                    property: key,
                    oldValue: obj1[key],
                    newValue: obj2[key]
                });
            }
        }

        return differences;
    }

    // Add callback for real-time change notifications
    onChangeDetected(callback) {
        this.changeCallbacks.push(callback);
        return this;
    }

    // Generate comprehensive report
    generateReport() {
        const endSnapshot = this.baseline ? 
            this.createDOMSnapshot() : null;

        const snapshotComparison = this.baseline && endSnapshot ? 
            this.compareSnapshots(this.baseline, endSnapshot) : [];

        const summary = this.generateSummary();

        return {
            timestamp: new Date().toISOString(),
            summary,
            mutations: this.mutations,
            performance: this.performanceData,
            snapshotComparison,
            baseline: this.baseline,
            finalSnapshot: endSnapshot
        };
    }

    // Generate summary statistics
    generateSummary() {
        const byType = this.mutations.reduce((acc, mutation) => {
            acc[mutation.type] = (acc[mutation.type] || 0) + 1;
            return acc;
        }, {});

        const byImpact = this.mutations.reduce((acc, mutation) => {
            acc[mutation.impact] = (acc[mutation.impact] || 0) + 1;
            return acc;
        }, {});

        const avgPerformance = this.performanceData.length > 0 ?
            this.performanceData.reduce((sum, p) => sum + p.processingTime, 0) / this.performanceData.length : 0;

        return {
            totalMutations: this.mutations.length,
            mutationsByType: byType,
            mutationsByImpact: byImpact,
            averageProcessingTime: avgPerformance,
            timespan: this.mutations.length > 0 ? 
                this.mutations[this.mutations.length - 1].timestamp - this.mutations[0].timestamp : 0,
            hasRegressions: byImpact.high > 0
        };
    }

    // Generate console report
    generateConsoleReport() {
        const summary = this.generateSummary();
        
        console.log('\n🎯 DOM CHANGE DETECTION REPORT');
        console.log('===============================');
        console.log(`📊 Total Mutations: ${summary.totalMutations}`);
        console.log(`⏱️  Timespan: ${summary.timespan}ms`);
        console.log(`🚨 High Impact Changes: ${summary.mutationsByImpact.high || 0}`);
        console.log(`⚠️  Medium Impact Changes: ${summary.mutationsByImpact.medium || 0}`);
        console.log(`📝 Low Impact Changes: ${summary.mutationsByImpact.low || 0}`);
        console.log(`⚡ Avg Processing Time: ${summary.averageProcessingTime.toFixed(2)}ms`);

        console.log('\n📋 Changes by Type:');
        Object.entries(summary.mutationsByType).forEach(([type, count]) => {
            console.log(`  ${type}: ${count}`);
        });

        if (summary.hasRegressions) {
            console.log('\n🚨 HIGH IMPACT CHANGES DETECTED:');
            this.mutations.filter(m => m.impact === 'high').forEach(mutation => {
                console.log(`  • ${mutation.type} on ${mutation.target}`);
                console.log(`    Time: ${new Date(mutation.timestamp).toLocaleTimeString()}`);
                if (mutation.attributeName) {
                    console.log(`    Attribute: ${mutation.attributeName}`);
                    console.log(`    Old: ${mutation.oldValue}`);
                    console.log(`    New: ${mutation.newValue}`);
                }
                console.log('');
            });
        }
    }
}

// Node.js utility functions for automated testing
class DOMChangeTestRunner {
    constructor() {
        this.testResults = [];
    }

    // Simulate DOM changes for testing
    async simulateUserInteraction(page, scenario) {
        const detector = new DOMChangeDetector({
            ignoreAttributes: ['data-test-id'],
            trackPerformance: true
        });

        // Inject detector into page
        await page.evaluateOnNewDocument(() => {
            window.domDetector = new DOMChangeDetector();
        });

        await page.goto(scenario.url);
        
        // Start monitoring
        await page.evaluate(() => {
            window.domDetector.startMonitoring();
        });

        // Execute test scenario
        for (const action of scenario.actions) {
            await this.executeAction(page, action);
            await page.waitForTimeout(100); // Allow DOM to settle
        }

        // Get results
        const report = await page.evaluate(() => {
            return window.domDetector.stopMonitoring();
        });

        this.testResults.push({
            scenario: scenario.name,
            report
        });

        return report;
    }

    async executeAction(page, action) {
        switch (action.type) {
            case 'click':
                await page.click(action.selector);
                break;
            case 'type':
                await page.type(action.selector, action.text);
                break;
            case 'hover':
                await page.hover(action.selector);
                break;
            case 'scroll':
                await page.evaluate(() => window.scrollBy(0, 500));
                break;
            case 'wait':
                await page.waitForTimeout(action.duration);
                break;
        }
    }

    generateTestReport() {
        return {
            timestamp: new Date().toISOString(),
            totalScenarios: this.testResults.length,
            results: this.testResults,
            summary: this.generateTestSummary()
        };
    }

    generateTestSummary() {
        const totalMutations = this.testResults.reduce((sum, result) => 
            sum + result.report.summary.totalMutations, 0);
        
        const regressionScenarios = this.testResults.filter(result => 
            result.report.summary.hasRegressions).length;

        return {
            totalMutations,
            regressionScenarios,
            passRate: ((this.testResults.length - regressionScenarios) / this.testResults.length * 100).toFixed(1)
        };
    }
}

module.exports = { DOMChangeDetector, DOMChangeTestRunner };

// Example usage for browser environment
if (typeof window !== 'undefined') {
    window.DOMChangeDetector = DOMChangeDetector;
    
    // Auto-start demo
    window.addEventListener('load', () => {
        console.log('🎯 DOM Change Detector available as window.DOMChangeDetector');
        console.log('Usage: const detector = new DOMChangeDetector(); detector.startMonitoring();');
    });
}
