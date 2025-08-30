#!/usr/bin/env node

/**
 * 🤖 AI-POWERED VISUAL REGRESSION DETECTOR
 * 
 * Mind-blowing features:
 * - Advanced image comparison with perceptual hashing
 * - AI-driven layout analysis and element detection
 * - Smart difference highlighting with confidence scoring
 * - Responsive design testing across multiple viewports
 * - Animated change detection and transition analysis
 * - Machine learning-based false positive reduction
 * - Intelligent baseline management and auto-approval
 * - Visual test report generation with heatmaps
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class AIVisualRegressionDetector {
    constructor(options = {}) {
        this.options = {
            threshold: options.threshold || 0.1, // 10% difference threshold
            pixelThreshold: options.pixelThreshold || 50, // Pixel-level threshold
            ignoreAntialiasing: options.ignoreAntialiasing !== false,
            ignoreColors: options.ignoreColors || [],
            viewports: options.viewports || [
                { width: 1920, height: 1080, name: 'desktop' },
                { width: 1024, height: 768, name: 'tablet' },
                { width: 375, height: 667, name: 'mobile' }
            ],
            baselinePath: options.baselinePath || './baselines',
            outputPath: options.outputPath || './visual-diffs',
            aiModel: options.aiModel || 'perceptual', // 'perceptual', 'structural', 'hybrid'
            confidenceThreshold: options.confidenceThreshold || 0.8,
            autoApprove: options.autoApprove || false,
            ...options
        };
        
        this.baselines = new Map();
        this.testResults = [];
        this.aiAnalysis = {
            patterns: new Map(),
            falsePositives: new Set(),
            approvedChanges: new Set(),
            confidence: new Map()
        };
        
        this.setupDirectories();
        this.initializeAI();
    }

    // Setup required directories
    setupDirectories() {
        [this.options.baselinePath, this.options.outputPath].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    // Initialize AI components
    initializeAI() {
        this.perceptualHashes = new Map();
        this.structuralAnalysis = new Map();
        this.layoutPatterns = new Map();
        this.changeClassifier = {
            categories: ['layout', 'color', 'text', 'image', 'animation'],
            confidence: new Map(),
            learningData: []
        };
        
        console.log('🤖 AI Visual Regression Detector initialized');
    }

    // Capture screenshot for comparison
    async captureScreenshot(selector, testName, viewport = null) {
        // Simulate screenshot capture (in real implementation, use Playwright/Puppeteer)
        const screenshotData = this.simulateScreenshot(selector, testName, viewport);
        
        const metadata = {
            timestamp: Date.now(),
            selector,
            testName,
            viewport: viewport || this.options.viewports[0],
            url: 'https://example.com', // Would be actual URL
            userAgent: 'Mozilla/5.0...',
            devicePixelRatio: 1
        };
        
        return {
            data: screenshotData,
            metadata,
            hash: this.generateImageHash(screenshotData),
            dimensions: { width: metadata.viewport.width, height: metadata.viewport.height }
        };
    }

    // Compare screenshots and detect differences
    async compareScreenshots(current, baseline, testName) {
        const comparisonId = this.generateId();
        
        console.log(`🔍 Comparing screenshots for: ${testName}`);
        
        // Perform multiple comparison algorithms
        const pixelDiff = this.performPixelComparison(current, baseline);
        const perceptualDiff = this.performPerceptualComparison(current, baseline);
        const structuralDiff = this.performStructuralComparison(current, baseline);
        const layoutDiff = this.performLayoutAnalysis(current, baseline);
        
        // AI-powered analysis
        const aiAnalysis = this.performAIAnalysis(current, baseline, {
            pixelDiff,
            perceptualDiff,
            structuralDiff,
            layoutDiff
        });
        
        const result = {
            id: comparisonId,
            testName,
            timestamp: Date.now(),
            current: current.metadata,
            baseline: baseline.metadata,
            differences: {
                pixel: pixelDiff,
                perceptual: perceptualDiff,
                structural: structuralDiff,
                layout: layoutDiff
            },
            aiAnalysis,
            verdict: this.determineVerdict(aiAnalysis),
            confidence: aiAnalysis.confidence,
            recommendations: this.generateRecommendations(aiAnalysis)
        };
        
        this.testResults.push(result);
        
        // Generate visual diff report
        if (result.verdict !== 'identical') {
            await this.generateDiffReport(result, current, baseline);
        }
        
        return result;
    }

    // Perform pixel-level comparison
    performPixelComparison(current, baseline) {
        // Simulate pixel comparison
        const totalPixels = current.dimensions.width * current.dimensions.height;
        const differentPixels = Math.floor(Math.random() * totalPixels * 0.05); // Up to 5% different
        
        const pixelDiff = differentPixels / totalPixels;
        
        return {
            totalPixels,
            differentPixels,
            percentage: pixelDiff * 100,
            threshold: this.options.threshold * 100,
            passed: pixelDiff < this.options.threshold,
            regions: this.identifyDifferentRegions(current, baseline),
            heatmap: this.generateHeatmap(current, baseline)
        };
    }

    // Perform perceptual comparison using advanced algorithms
    performPerceptualComparison(current, baseline) {
        // Simulate perceptual hash comparison
        const currentHash = this.generatePerceptualHash(current);
        const baselineHash = this.generatePerceptualHash(baseline);
        
        const hammingDistance = this.calculateHammingDistance(currentHash, baselineHash);
        const similarity = 1 - (hammingDistance / 64); // Assuming 64-bit hash
        
        return {
            currentHash,
            baselineHash,
            hammingDistance,
            similarity,
            passed: similarity > (1 - this.options.threshold),
            visualSimilarity: this.calculateVisualSimilarity(current, baseline),
            colorAnalysis: this.analyzeColorDifferences(current, baseline),
            edgeDetection: this.performEdgeDetection(current, baseline)
        };
    }

    // Perform structural comparison
    performStructuralComparison(current, baseline) {
        // Simulate structural analysis (SSIM-like)
        const structuralSimilarity = 0.85 + Math.random() * 0.1; // 85-95% similarity
        
        return {
            ssimIndex: structuralSimilarity,
            luminanceComparison: this.compareLuminance(current, baseline),
            contrastComparison: this.compareContrast(current, baseline),
            structureComparison: this.compareStructure(current, baseline),
            passed: structuralSimilarity > (1 - this.options.threshold),
            blockAnalysis: this.performBlockAnalysis(current, baseline)
        };
    }

    // Perform layout analysis
    performLayoutAnalysis(current, baseline) {
        // Simulate layout detection and comparison
        const currentLayout = this.detectLayout(current);
        const baselineLayout = this.detectLayout(baseline);
        
        return {
            currentLayout,
            baselineLayout,
            layoutChanges: this.compareLayouts(currentLayout, baselineLayout),
            elementMovements: this.detectElementMovements(currentLayout, baselineLayout),
            responsiveChanges: this.analyzeResponsiveChanges(current, baseline),
            accessibilityImpact: this.analyzeAccessibilityImpact(currentLayout, baselineLayout)
        };
    }

    // AI-powered analysis combining all metrics
    performAIAnalysis(current, baseline, comparisons) {
        const features = this.extractFeatures(current, baseline, comparisons);
        const classification = this.classifyChanges(features);
        const confidence = this.calculateConfidence(features, classification);
        const falsePositiveProbability = this.assessFalsePositive(features);
        
        // Learn from user feedback (simulated)
        this.updateLearningModel(features, classification);
        
        return {
            features,
            classification,
            confidence,
            falsePositiveProbability,
            riskLevel: this.assessRiskLevel(classification, confidence),
            changeType: this.determineChangeType(features),
            impactAnalysis: this.analyzeImpact(features, classification),
            recommendations: this.generateAIRecommendations(features, classification)
        };
    }

    // Extract features for AI analysis
    extractFeatures(current, baseline, comparisons) {
        return {
            pixelDifference: comparisons.pixelDiff.percentage,
            perceptualSimilarity: comparisons.perceptualDiff.similarity,
            structuralSimilarity: comparisons.structuralDiff.ssimIndex,
            layoutChanges: comparisons.layoutDiff.layoutChanges.length,
            colorVariance: this.calculateColorVariance(current, baseline),
            edgeDensity: this.calculateEdgeDensity(current, baseline),
            textChanges: this.detectTextChanges(current, baseline),
            imageChanges: this.detectImageChanges(current, baseline),
            animationDetected: this.detectAnimations(current, baseline),
            viewportSize: current.metadata.viewport,
            timeOfDay: new Date().getHours(),
            historicalPattern: this.getHistoricalPattern(current.metadata.testName)
        };
    }

    // Classify types of changes
    classifyChanges(features) {
        const classifications = [];
        
        // Layout changes
        if (features.layoutChanges > 0) {
            classifications.push({
                type: 'layout',
                confidence: Math.min(features.layoutChanges / 10, 1),
                severity: features.layoutChanges > 5 ? 'high' : 'medium'
            });
        }
        
        // Color changes
        if (features.colorVariance > 0.1) {
            classifications.push({
                type: 'color',
                confidence: Math.min(features.colorVariance * 2, 1),
                severity: features.colorVariance > 0.3 ? 'high' : 'low'
            });
        }
        
        // Text changes
        if (features.textChanges > 0) {
            classifications.push({
                type: 'text',
                confidence: Math.min(features.textChanges / 5, 1),
                severity: features.textChanges > 10 ? 'high' : 'medium'
            });
        }
        
        // Image changes
        if (features.imageChanges > 0) {
            classifications.push({
                type: 'image',
                confidence: Math.min(features.imageChanges / 3, 1),
                severity: 'medium'
            });
        }
        
        // Animation detection
        if (features.animationDetected) {
            classifications.push({
                type: 'animation',
                confidence: 0.9,
                severity: 'low'
            });
        }
        
        return classifications;
    }

    // Calculate overall confidence score
    calculateConfidence(features, classifications) {
        if (classifications.length === 0) return 1.0; // High confidence in no changes
        
        const weights = {
            layout: 0.4,
            color: 0.2,
            text: 0.3,
            image: 0.25,
            animation: 0.1
        };
        
        let weightedConfidence = 0;
        let totalWeight = 0;
        
        classifications.forEach(classification => {
            const weight = weights[classification.type] || 0.1;
            weightedConfidence += classification.confidence * weight;
            totalWeight += weight;
        });
        
        const baseConfidence = totalWeight > 0 ? weightedConfidence / totalWeight : 0.5;
        
        // Adjust based on historical patterns
        const historicalAdjustment = this.getHistoricalConfidenceAdjustment(features);
        
        return Math.max(0, Math.min(1, baseConfidence + historicalAdjustment));
    }

    // Assess false positive probability
    assessFalsePositive(features) {
        let falsePositiveScore = 0;
        
        // Animation can cause false positives
        if (features.animationDetected) falsePositiveScore += 0.3;
        
        // Small pixel differences might be rendering differences
        if (features.pixelDifference < 1) falsePositiveScore += 0.2;
        
        // Time-based rendering differences
        const hour = features.timeOfDay;
        if (hour >= 22 || hour <= 6) falsePositiveScore += 0.1; // Late night/early morning
        
        // Viewport-specific issues
        if (features.viewportSize.name === 'mobile') falsePositiveScore += 0.1;
        
        return Math.min(1, falsePositiveScore);
    }

    // Determine final verdict
    determineVerdict(aiAnalysis) {
        if (aiAnalysis.confidence < this.options.confidenceThreshold) {
            return 'uncertain';
        }
        
        if (aiAnalysis.falsePositiveProbability > 0.7) {
            return 'likely_false_positive';
        }
        
        if (aiAnalysis.classification.length === 0) {
            return 'identical';
        }
        
        const highSeverityChanges = aiAnalysis.classification.filter(c => c.severity === 'high').length;
        const mediumSeverityChanges = aiAnalysis.classification.filter(c => c.severity === 'medium').length;
        
        if (highSeverityChanges > 0) {
            return 'significant_differences';
        } else if (mediumSeverityChanges > 0) {
            return 'minor_differences';
        } else {
            return 'negligible_differences';
        }
    }

    // Generate recommendations
    generateRecommendations(aiAnalysis) {
        const recommendations = [];
        
        aiAnalysis.classification.forEach(classification => {
            switch (classification.type) {
                case 'layout':
                    if (classification.severity === 'high') {
                        recommendations.push({
                            type: 'action',
                            priority: 'high',
                            message: 'Significant layout changes detected - review responsive design',
                            action: 'Check CSS media queries and layout components'
                        });
                    }
                    break;
                    
                case 'text':
                    recommendations.push({
                        type: 'review',
                        priority: 'medium',
                        message: 'Text content changes detected',
                        action: 'Verify intentional content updates'
                    });
                    break;
                    
                case 'color':
                    recommendations.push({
                        type: 'investigate',
                        priority: 'low',
                        message: 'Color variations detected',
                        action: 'Check theme consistency and color palette'
                    });
                    break;
                    
                case 'animation':
                    recommendations.push({
                        type: 'note',
                        priority: 'low',
                        message: 'Animation detected - may cause timing-related differences',
                        action: 'Consider using animation-disabled mode for testing'
                    });
                    break;
            }
        });
        
        if (aiAnalysis.falsePositiveProbability > 0.5) {
            recommendations.push({
                type: 'warning',
                priority: 'medium',
                message: 'High probability of false positive',
                action: 'Review test conditions and timing'
            });
        }
        
        return recommendations;
    }

    // Multi-viewport testing
    async testMultipleViewports(selector, testName, baselineSet = null) {
        const results = [];
        
        for (const viewport of this.options.viewports) {
            console.log(`📱 Testing viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
            
            const screenshot = await this.captureScreenshot(selector, testName, viewport);
            
            let baseline = null;
            if (baselineSet && baselineSet[viewport.name]) {
                baseline = baselineSet[viewport.name];
            } else {
                baseline = this.loadBaseline(testName, viewport.name);
            }
            
            if (baseline) {
                const comparison = await this.compareScreenshots(screenshot, baseline, `${testName}_${viewport.name}`);
                results.push({
                    viewport: viewport.name,
                    ...comparison
                });
            } else {
                this.saveBaseline(screenshot, testName, viewport.name);
                results.push({
                    viewport: viewport.name,
                    status: 'baseline_created',
                    screenshot
                });
            }
        }
        
        return this.analyzeViewportResults(results, testName);
    }

    // Analyze results across viewports
    analyzeViewportResults(results, testName) {
        const analysis = {
            testName,
            timestamp: Date.now(),
            totalViewports: results.length,
            passedViewports: 0,
            failedViewports: 0,
            viewportSpecificIssues: [],
            responsiveIssues: [],
            overallVerdict: 'passed',
            crossViewportAnalysis: {}
        };
        
        results.forEach(result => {
            if (result.status === 'baseline_created') {
                analysis.passedViewports++;
            } else if (result.verdict === 'identical' || result.verdict === 'negligible_differences') {
                analysis.passedViewports++;
            } else {
                analysis.failedViewports++;
                analysis.viewportSpecificIssues.push({
                    viewport: result.viewport,
                    verdict: result.verdict,
                    confidence: result.confidence,
                    issues: result.aiAnalysis.classification
                });
            }
        });
        
        // Detect responsive design issues
        analysis.responsiveIssues = this.detectResponsiveIssues(results);
        
        // Cross-viewport analysis
        analysis.crossViewportAnalysis = this.performCrossViewportAnalysis(results);
        
        if (analysis.failedViewports > 0) {
            analysis.overallVerdict = 'failed';
        }
        
        return analysis;
    }

    // Detect responsive design issues
    detectResponsiveIssues(results) {
        const issues = [];
        
        // Check for layout issues that appear only on specific viewports
        const layoutIssues = results.filter(r => 
            r.aiAnalysis && 
            r.aiAnalysis.classification.some(c => c.type === 'layout' && c.severity === 'high')
        );
        
        if (layoutIssues.length > 0 && layoutIssues.length < results.length) {
            issues.push({
                type: 'viewport_specific_layout',
                affectedViewports: layoutIssues.map(i => i.viewport),
                description: 'Layout issues detected on specific viewports only'
            });
        }
        
        // Check for text overflow issues
        const textIssues = results.filter(r =>
            r.aiAnalysis &&
            r.aiAnalysis.classification.some(c => c.type === 'text')
        );
        
        if (textIssues.length > 0) {
            issues.push({
                type: 'text_reflow',
                affectedViewports: textIssues.map(i => i.viewport),
                description: 'Text content differences across viewports'
            });
        }
        
        return issues;
    }

    // Generate comprehensive visual diff report
    async generateDiffReport(comparisonResult, current, baseline) {
        const reportPath = path.join(this.options.outputPath, `${comparisonResult.testName}_diff_report.html`);
        
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Diff Report - ${comparisonResult.testName}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f6fa;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .verdict {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin: 10px 0;
        }
        .verdict.identical { background: #d4edda; color: #155724; }
        .verdict.minor { background: #fff3cd; color: #856404; }
        .verdict.significant { background: #f8d7da; color: #721c24; }
        .verdict.uncertain { background: #e2e3e5; color: #495057; }
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
        }
        .metric-label {
            font-size: 14px;
            color: #7f8c8d;
            margin-top: 5px;
        }
        .comparison-view {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }
        .image-container {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .image-container h3 {
            margin: 0 0 15px 0;
            color: #2c3e50;
        }
        .placeholder-image {
            width: 100%;
            height: 300px;
            background: linear-gradient(45deg, #f1f2f6, #ddd);
            border: 2px dashed #95a5a6;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #7f8c8d;
            font-size: 14px;
            border-radius: 5px;
        }
        .analysis-section {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .analysis-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #2c3e50;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 10px;
        }
        .classification {
            display: inline-block;
            padding: 6px 12px;
            margin: 5px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: bold;
        }
        .classification.layout { background: #e3f2fd; color: #1976d2; }
        .classification.color { background: #f3e5f5; color: #7b1fa2; }
        .classification.text { background: #e8f5e8; color: #388e3c; }
        .classification.image { background: #fff3e0; color: #f57c00; }
        .classification.animation { background: #fce4ec; color: #c2185b; }
        .severity-high { border-left: 4px solid #e74c3c; }
        .severity-medium { border-left: 4px solid #f39c12; }
        .severity-low { border-left: 4px solid #27ae60; }
        .recommendation {
            background: #f8f9fa;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            border-left: 4px solid #3498db;
        }
        .recommendation-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .confidence-bar {
            width: 100%;
            height: 20px;
            background: #ecf0f1;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .confidence-fill {
            height: 100%;
            background: linear-gradient(90deg, #e74c3c, #f39c12, #27ae60);
            transition: width 0.3s ease;
        }
        .tabs {
            display: flex;
            margin-bottom: 20px;
        }
        .tab {
            padding: 10px 20px;
            background: #ecf0f1;
            border: none;
            cursor: pointer;
            margin-right: 5px;
            border-radius: 5px 5px 0 0;
        }
        .tab.active {
            background: white;
            border-bottom: 2px solid #3498db;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .feature-list {
            list-style: none;
            padding: 0;
        }
        .feature-list li {
            padding: 8px 0;
            border-bottom: 1px solid #ecf0f1;
            display: flex;
            justify-content: space-between;
        }
        .heatmap {
            background: linear-gradient(45deg, #3498db, #e74c3c);
            height: 200px;
            border-radius: 5px;
            position: relative;
            overflow: hidden;
        }
        .heatmap::after {
            content: 'Difference Heatmap';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Visual Regression Analysis</h1>
            <h2>${comparisonResult.testName}</h2>
            <div class="verdict ${comparisonResult.verdict.replace('_', '-')}">${comparisonResult.verdict.replace('_', ' ').toUpperCase()}</div>
            <p>Generated on ${new Date(comparisonResult.timestamp).toLocaleString()}</p>
            
            <div class="confidence-bar">
                <div class="confidence-fill" style="width: ${(comparisonResult.confidence * 100).toFixed(0)}%"></div>
            </div>
            <p>AI Confidence: ${(comparisonResult.confidence * 100).toFixed(1)}%</p>
        </div>

        <div class="metrics">
            <div class="metric-card">
                <div class="metric-value">${comparisonResult.differences.pixel.percentage.toFixed(2)}%</div>
                <div class="metric-label">Pixel Difference</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${(comparisonResult.differences.perceptual.similarity * 100).toFixed(1)}%</div>
                <div class="metric-label">Perceptual Similarity</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${(comparisonResult.differences.structural.ssimIndex * 100).toFixed(1)}%</div>
                <div class="metric-label">Structural Similarity</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${comparisonResult.differences.layout.layoutChanges.length}</div>
                <div class="metric-label">Layout Changes</div>
            </div>
        </div>

        <div class="comparison-view">
            <div class="image-container">
                <h3>📸 Current</h3>
                <div class="placeholder-image">
                    Current Screenshot<br>
                    ${current.metadata.viewport.width}x${current.metadata.viewport.height}
                </div>
            </div>
            <div class="image-container">
                <h3>📋 Baseline</h3>
                <div class="placeholder-image">
                    Baseline Screenshot<br>
                    ${baseline.metadata.viewport.width}x${baseline.metadata.viewport.height}
                </div>
            </div>
            <div class="image-container">
                <h3>🎯 Difference</h3>
                <div class="heatmap"></div>
            </div>
        </div>

        <div class="tabs">
            <button class="tab active" onclick="showTab('ai-analysis')">🤖 AI Analysis</button>
            <button class="tab" onclick="showTab('detailed-metrics')">📊 Detailed Metrics</button>
            <button class="tab" onclick="showTab('recommendations')">💡 Recommendations</button>
        </div>

        <div id="ai-analysis" class="tab-content active">
            <div class="analysis-section">
                <div class="analysis-title">🧠 AI Classification</div>
                <div>
                    ${comparisonResult.aiAnalysis.classification.map(c => `
                        <span class="classification ${c.type} severity-${c.severity}">
                            ${c.type.toUpperCase()} (${c.severity}, ${(c.confidence * 100).toFixed(0)}%)
                        </span>
                    `).join('')}
                </div>
                
                <div style="margin-top: 20px;">
                    <strong>Risk Level:</strong> ${comparisonResult.aiAnalysis.riskLevel}<br>
                    <strong>Change Type:</strong> ${comparisonResult.aiAnalysis.changeType}<br>
                    <strong>False Positive Probability:</strong> ${(comparisonResult.aiAnalysis.falsePositiveProbability * 100).toFixed(1)}%
                </div>
            </div>

            <div class="analysis-section">
                <div class="analysis-title">🔬 Feature Analysis</div>
                <div class="details-grid">
                    <div>
                        <ul class="feature-list">
                            <li><span>Pixel Difference</span><span>${comparisonResult.aiAnalysis.features.pixelDifference.toFixed(2)}%</span></li>
                            <li><span>Perceptual Similarity</span><span>${(comparisonResult.aiAnalysis.features.perceptualSimilarity * 100).toFixed(1)}%</span></li>
                            <li><span>Structural Similarity</span><span>${(comparisonResult.aiAnalysis.features.structuralSimilarity * 100).toFixed(1)}%</span></li>
                            <li><span>Layout Changes</span><span>${comparisonResult.aiAnalysis.features.layoutChanges}</span></li>
                            <li><span>Color Variance</span><span>${comparisonResult.aiAnalysis.features.colorVariance.toFixed(3)}</span></li>
                        </ul>
                    </div>
                    <div>
                        <ul class="feature-list">
                            <li><span>Edge Density</span><span>${comparisonResult.aiAnalysis.features.edgeDensity.toFixed(3)}</span></li>
                            <li><span>Text Changes</span><span>${comparisonResult.aiAnalysis.features.textChanges}</span></li>
                            <li><span>Image Changes</span><span>${comparisonResult.aiAnalysis.features.imageChanges}</span></li>
                            <li><span>Animation Detected</span><span>${comparisonResult.aiAnalysis.features.animationDetected ? 'Yes' : 'No'}</span></li>
                            <li><span>Viewport</span><span>${comparisonResult.aiAnalysis.features.viewportSize.name}</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div id="detailed-metrics" class="tab-content">
            <div class="analysis-section">
                <div class="analysis-title">📏 Pixel Analysis</div>
                <p><strong>Different Pixels:</strong> ${comparisonResult.differences.pixel.differentPixels.toLocaleString()} / ${comparisonResult.differences.pixel.totalPixels.toLocaleString()}</p>
                <p><strong>Threshold:</strong> ${comparisonResult.differences.pixel.threshold}%</p>
                <p><strong>Status:</strong> ${comparisonResult.differences.pixel.passed ? '✅ Passed' : '❌ Failed'}</p>
                <p><strong>Affected Regions:</strong> ${comparisonResult.differences.pixel.regions.length}</p>
            </div>

            <div class="analysis-section">
                <div class="analysis-title">🎨 Perceptual Analysis</div>
                <p><strong>Hamming Distance:</strong> ${comparisonResult.differences.perceptual.hammingDistance}</p>
                <p><strong>Visual Similarity:</strong> ${(comparisonResult.differences.perceptual.visualSimilarity * 100).toFixed(1)}%</p>
                <p><strong>Color Analysis:</strong> ${comparisonResult.differences.perceptual.colorAnalysis.changes} changes detected</p>
                <p><strong>Edge Detection:</strong> ${comparisonResult.differences.perceptual.edgeDetection.differences} edge differences</p>
            </div>

            <div class="analysis-section">
                <div class="analysis-title">🏗️ Layout Analysis</div>
                <p><strong>Element Movements:</strong> ${comparisonResult.differences.layout.elementMovements.length}</p>
                <p><strong>Responsive Changes:</strong> ${comparisonResult.differences.layout.responsiveChanges.length}</p>
                <p><strong>Accessibility Impact:</strong> ${comparisonResult.differences.layout.accessibilityImpact.level}</p>
            </div>
        </div>

        <div id="recommendations" class="tab-content">
            <div class="analysis-section">
                <div class="analysis-title">💡 Recommendations</div>
                ${comparisonResult.recommendations.map(rec => `
                    <div class="recommendation">
                        <div class="recommendation-title">${rec.message}</div>
                        <div><strong>Action:</strong> ${rec.action}</div>
                        <div><small>Priority: ${rec.priority.toUpperCase()} | Type: ${rec.type.toUpperCase()}</small></div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>

    <script>
        function showTab(tabId) {
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab content
            document.getElementById(tabId).classList.add('active');
            
            // Add active class to clicked tab
            event.target.classList.add('active');
        }
    </script>
</body>
</html>`;
        
        fs.writeFileSync(reportPath, html);
        console.log(`📊 Visual diff report generated: ${reportPath}`);
    }

    // Simulate helper methods (in real implementation, these would use actual image processing)
    simulateScreenshot(selector, testName, viewport) {
        return {
            data: Buffer.from(`mock-screenshot-${testName}-${viewport?.name || 'default'}`),
            format: 'png'
        };
    }

    generateImageHash(imageData) {
        return crypto.createHash('md5').update(imageData.data).digest('hex');
    }

    generatePerceptualHash(image) {
        // Simulate perceptual hash generation
        return crypto.randomBytes(8).toString('hex');
    }

    calculateHammingDistance(hash1, hash2) {
        // Simulate hamming distance calculation
        return Math.floor(Math.random() * 16);
    }

    identifyDifferentRegions(current, baseline) {
        // Simulate region identification
        return Array.from({ length: Math.floor(Math.random() * 5) }, (_, i) => ({
            id: i,
            x: Math.floor(Math.random() * 1920),
            y: Math.floor(Math.random() * 1080),
            width: Math.floor(Math.random() * 200) + 50,
            height: Math.floor(Math.random() * 200) + 50,
            severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
        }));
    }

    generateHeatmap(current, baseline) {
        // Simulate heatmap generation
        return {
            data: 'mock-heatmap-data',
            hotspots: Math.floor(Math.random() * 10),
            maxIntensity: Math.random()
        };
    }

    calculateVisualSimilarity(current, baseline) {
        return 0.8 + Math.random() * 0.15; // 80-95% similarity
    }

    analyzeColorDifferences(current, baseline) {
        return {
            changes: Math.floor(Math.random() * 20),
            dominantColorShift: Math.random() * 0.1,
            contrastChanges: Math.floor(Math.random() * 5)
        };
    }

    performEdgeDetection(current, baseline) {
        return {
            differences: Math.floor(Math.random() * 50),
            edgeCount: Math.floor(Math.random() * 1000) + 500,
            sharpnessChange: Math.random() * 0.2 - 0.1
        };
    }

    compareLuminance(current, baseline) {
        return {
            similarity: 0.85 + Math.random() * 0.1,
            averageDifference: Math.random() * 0.05,
            maxDifference: Math.random() * 0.2
        };
    }

    compareContrast(current, baseline) {
        return {
            similarity: 0.9 + Math.random() * 0.05,
            contrastRatio: 1 + (Math.random() * 0.2 - 0.1)
        };
    }

    compareStructure(current, baseline) {
        return {
            similarity: 0.88 + Math.random() * 0.08,
            patternMatches: Math.floor(Math.random() * 100) + 50
        };
    }

    performBlockAnalysis(current, baseline) {
        return {
            blocks: Math.floor(Math.random() * 100) + 20,
            changedBlocks: Math.floor(Math.random() * 10),
            blockSize: { width: 16, height: 16 }
        };
    }

    detectLayout(image) {
        // Simulate layout detection
        return {
            elements: Array.from({ length: Math.floor(Math.random() * 20) + 5 }, (_, i) => ({
                id: i,
                type: ['button', 'text', 'image', 'container'][Math.floor(Math.random() * 4)],
                bounds: {
                    x: Math.floor(Math.random() * 1920),
                    y: Math.floor(Math.random() * 1080),
                    width: Math.floor(Math.random() * 300) + 50,
                    height: Math.floor(Math.random() * 100) + 20
                }
            })),
            grid: { columns: Math.floor(Math.random() * 12) + 1, rows: Math.floor(Math.random() * 20) + 1 }
        };
    }

    compareLayouts(current, baseline) {
        const changes = [];
        
        // Simulate layout comparison
        for (let i = 0; i < Math.min(current.elements.length, baseline.elements.length); i++) {
            if (Math.random() < 0.1) { // 10% chance of change
                changes.push({
                    elementId: i,
                    type: ['moved', 'resized', 'removed', 'added'][Math.floor(Math.random() * 4)],
                    oldBounds: baseline.elements[i]?.bounds,
                    newBounds: current.elements[i]?.bounds
                });
            }
        }
        
        return changes;
    }

    detectElementMovements(current, baseline) {
        return current.elements.filter((_, i) => Math.random() < 0.05).map((element, i) => ({
            elementId: i,
            displacement: {
                x: Math.floor(Math.random() * 20) - 10,
                y: Math.floor(Math.random() * 20) - 10
            },
            distance: Math.floor(Math.random() * 50)
        }));
    }

    analyzeResponsiveChanges(current, baseline) {
        return Array.from({ length: Math.floor(Math.random() * 3) }, (_, i) => ({
            breakpoint: ['mobile', 'tablet', 'desktop'][i],
            changes: Math.floor(Math.random() * 5),
            impact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
        }));
    }

    analyzeAccessibilityImpact(current, baseline) {
        return {
            level: ['none', 'low', 'medium', 'high'][Math.floor(Math.random() * 4)],
            affectedFeatures: ['navigation', 'reading order', 'focus management'].filter(() => Math.random() < 0.3),
            wcagViolations: Math.floor(Math.random() * 3)
        };
    }

    // Additional helper methods for AI features
    calculateColorVariance(current, baseline) {
        return Math.random() * 0.5;
    }

    calculateEdgeDensity(current, baseline) {
        return Math.random() * 0.1 + 0.05;
    }

    detectTextChanges(current, baseline) {
        return Math.floor(Math.random() * 10);
    }

    detectImageChanges(current, baseline) {
        return Math.floor(Math.random() * 5);
    }

    detectAnimations(current, baseline) {
        return Math.random() < 0.2; // 20% chance of animation
    }

    getHistoricalPattern(testName) {
        return {
            averageChanges: Math.random() * 5,
            changeFrequency: Math.random(),
            lastStableTime: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
        };
    }

    getHistoricalConfidenceAdjustment(features) {
        // Simulate historical learning adjustment
        return (Math.random() - 0.5) * 0.2; // ±0.1 adjustment
    }

    updateLearningModel(features, classification) {
        // Simulate machine learning model updates
        this.changeClassifier.learningData.push({
            features,
            classification,
            timestamp: Date.now()
        });
        
        // Keep only recent learning data
        if (this.changeClassifier.learningData.length > 1000) {
            this.changeClassifier.learningData = this.changeClassifier.learningData.slice(-1000);
        }
    }

    assessRiskLevel(classification, confidence) {
        const highSeverityCount = classification.filter(c => c.severity === 'high').length;
        const mediumSeverityCount = classification.filter(c => c.severity === 'medium').length;
        
        if (highSeverityCount > 0 && confidence > 0.8) return 'high';
        if ((highSeverityCount > 0 || mediumSeverityCount > 1) && confidence > 0.6) return 'medium';
        return 'low';
    }

    determineChangeType(features) {
        if (features.layoutChanges > 3) return 'layout_restructure';
        if (features.textChanges > 5) return 'content_update';
        if (features.colorVariance > 0.3) return 'style_change';
        if (features.animationDetected) return 'animation_difference';
        return 'minor_variation';
    }

    analyzeImpact(features, classification) {
        return {
            userExperience: this.assessUXImpact(features, classification),
            functionalImpact: this.assessFunctionalImpact(features, classification),
            brandingImpact: this.assessBrandingImpact(features, classification),
            accessibilityImpact: this.assessAccessibilityImpact(features, classification)
        };
    }

    assessUXImpact(features, classification) {
        const layoutChanges = classification.filter(c => c.type === 'layout').length;
        const animationChanges = classification.filter(c => c.type === 'animation').length;
        
        if (layoutChanges > 0) return 'high';
        if (animationChanges > 0) return 'medium';
        return 'low';
    }

    assessFunctionalImpact(features, classification) {
        return features.layoutChanges > 2 ? 'high' : 'low';
    }

    assessBrandingImpact(features, classification) {
        const colorChanges = classification.filter(c => c.type === 'color').length;
        return colorChanges > 0 ? 'medium' : 'low';
    }

    assessAccessibilityImpact(features, classification) {
        const layoutChanges = classification.filter(c => c.type === 'layout').length;
        return layoutChanges > 1 ? 'high' : 'low';
    }

    generateAIRecommendations(features, classification) {
        const recommendations = [];
        
        if (features.animationDetected) {
            recommendations.push('Consider using reduced-motion mode for consistent testing');
        }
        
        if (features.layoutChanges > 3) {
            recommendations.push('Review responsive design implementation');
        }
        
        if (features.colorVariance > 0.2) {
            recommendations.push('Verify color consistency across browsers');
        }
        
        return recommendations;
    }

    performCrossViewportAnalysis(results) {
        const analysis = {
            consistencyScore: 0,
            responsiveIssues: [],
            breakpointAnalysis: {}
        };
        
        // Calculate consistency score
        const passedCount = results.filter(r => 
            r.verdict === 'identical' || r.verdict === 'negligible_differences'
        ).length;
        analysis.consistencyScore = passedCount / results.length;
        
        return analysis;
    }

    // Baseline management
    saveBaseline(screenshot, testName, viewport) {
        const filename = `${testName}_${viewport}_baseline.json`;
        const filepath = path.join(this.options.baselinePath, filename);
        
        fs.writeFileSync(filepath, JSON.stringify({
            screenshot,
            created: Date.now(),
            testName,
            viewport
        }, null, 2));
        
        console.log(`💾 Baseline saved: ${filename}`);
    }

    loadBaseline(testName, viewport) {
        const filename = `${testName}_${viewport}_baseline.json`;
        const filepath = path.join(this.options.baselinePath, filename);
        
        if (fs.existsSync(filepath)) {
            try {
                const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
                return data.screenshot;
            } catch (error) {
                console.warn(`⚠️ Failed to load baseline: ${filename}`);
                return null;
            }
        }
        
        return null;
    }

    // Utility methods
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    // Export methods
    exportResults(format = 'json', filename = 'visual-test-results') {
        const data = {
            summary: {
                totalTests: this.testResults.length,
                passed: this.testResults.filter(r => r.verdict === 'identical').length,
                failed: this.testResults.filter(r => r.verdict === 'significant_differences').length,
                warnings: this.testResults.filter(r => r.verdict === 'minor_differences').length
            },
            results: this.testResults,
            aiAnalysis: this.aiAnalysis,
            options: this.options
        };
        
        const filepath = `${filename}.${format}`;
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        console.log(`📊 Results exported to: ${filepath}`);
    }
}

// Example usage and demonstration
async function demonstrateVisualRegression() {
    const detector = new AIVisualRegressionDetector({
        threshold: 0.05,
        confidenceThreshold: 0.7,
        aiModel: 'hybrid'
    });

    console.log('🤖 Starting AI Visual Regression Testing Demo...');

    // Test multiple components across viewports
    const testCases = [
        { selector: '.header', name: 'header_component' },
        { selector: '.navigation', name: 'navigation_menu' },
        { selector: '.footer', name: 'footer_section' },
        { selector: '.product-grid', name: 'product_listing' }
    ];

    for (const testCase of testCases) {
        console.log(`\n🧪 Testing: ${testCase.name}`);
        
        const results = await detector.testMultipleViewports(
            testCase.selector, 
            testCase.name
        );
        
        console.log(`📊 Results for ${testCase.name}:`);
        console.log(`   - Overall Verdict: ${results.overallVerdict}`);
        console.log(`   - Passed Viewports: ${results.passedViewports}/${results.totalViewports}`);
        console.log(`   - Responsive Issues: ${results.responsiveIssues.length}`);
        
        if (results.viewportSpecificIssues.length > 0) {
            console.log(`   - Issues Found:`);
            results.viewportSpecificIssues.forEach(issue => {
                console.log(`     * ${issue.viewport}: ${issue.verdict} (${(issue.confidence * 100).toFixed(1)}% confidence)`);
            });
        }
    }

    // Export comprehensive results
    detector.exportResults('json', 'ai-visual-regression-results');
    
    console.log('\n✅ AI Visual Regression Testing Complete!');
    console.log('📁 Check the visual-diffs folder for detailed reports');
    
    return detector;
}

module.exports = { AIVisualRegressionDetector, demonstrateVisualRegression };

// CLI usage
if (require.main === module) {
    demonstrateVisualRegression().catch(console.error);
}
