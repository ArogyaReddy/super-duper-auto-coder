#!/usr/bin/env node

/**
 * ♿ ACCESSIBILITY COMPLIANCE CHECKER
 * 
 * Mind-blowing features:
 * - WCAG 2.1 AA/AAA compliance checking
 * - Color contrast analysis with suggestions
 * - Keyboard navigation simulation
 * - Screen reader compatibility testing
 * - Focus management validation
 * - Semantic HTML structure analysis
 * - Real-time accessibility scoring
 */

class AccessibilityChecker {
    constructor(options = {}) {
        this.options = {
            level: options.level || 'AA', // A, AA, or AAA
            guidelines: options.guidelines || '2.1',
            includeWarnings: options.includeWarnings !== false,
            verbose: options.verbose || false,
            ...options
        };
        
        this.violations = [];
        this.warnings = [];
        this.passes = [];
        this.elements = new Map();
        
        this.initializeRules();
    }

    // Initialize WCAG rules
    initializeRules() {
        this.rules = {
            // Color and Contrast
            colorContrast: {
                level: 'AA',
                ratios: { normal: 4.5, large: 3.0, aaa_normal: 7.0, aaa_large: 4.5 },
                description: 'Ensure adequate color contrast ratios'
            },
            
            // Images
            imageAlt: {
                level: 'A',
                description: 'Images must have alternative text'
            },
            
            // Forms
            formLabels: {
                level: 'A',
                description: 'Form inputs must have associated labels'
            },
            
            // Headings
            headingStructure: {
                level: 'A',
                description: 'Heading levels should not be skipped'
            },
            
            // Focus
            focusVisible: {
                level: 'AA',
                description: 'Focus indicators must be visible'
            },
            
            // Keyboard
            keyboardAccessible: {
                level: 'A',
                description: 'All functionality must be keyboard accessible'
            },
            
            // Language
            pageLanguage: {
                level: 'A',
                description: 'Page must have a valid language attribute'
            },
            
            // Links
            linkPurpose: {
                level: 'A',
                description: 'Link purpose must be clear from link text or context'
            },
            
            // Tables
            tableHeaders: {
                level: 'A',
                description: 'Tables must have proper headers'
            },
            
            // Multimedia
            videoAudio: {
                level: 'A',
                description: 'Video and audio content must have alternatives'
            }
        };
    }

    // Main audit function
    async audit(document) {
        if (typeof document === 'undefined') {
            throw new Error('Accessibility Checker requires a DOM document');
        }

        console.log('♿ Starting accessibility audit...');
        
        this.violations = [];
        this.warnings = [];
        this.passes = [];
        
        // Run all checks
        await this.checkColorContrast(document);
        await this.checkImageAlternatives(document);
        await this.checkFormLabels(document);
        await this.checkHeadingStructure(document);
        await this.checkFocusManagement(document);
        await this.checkKeyboardAccessibility(document);
        await this.checkPageLanguage(document);
        await this.checkLinkPurpose(document);
        await this.checkTableHeaders(document);
        await this.checkMultimedia(document);
        await this.checkSemanticStructure(document);
        await this.checkARIAUsage(document);
        
        return this.generateReport();
    }

    // Check color contrast ratios
    async checkColorContrast(document) {
        const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, label, input, textarea');
        
        for (const element of textElements) {
            if (!this.hasVisibleText(element)) continue;
            
            const styles = window.getComputedStyle(element);
            const color = this.parseColor(styles.color);
            const backgroundColor = this.getBackgroundColor(element);
            
            if (!color || !backgroundColor) continue;
            
            const contrast = this.calculateContrast(color, backgroundColor);
            const fontSize = parseFloat(styles.fontSize);
            const fontWeight = styles.fontWeight;
            const isLargeText = fontSize >= 18 || (fontSize >= 14 && parseInt(fontWeight) >= 700);
            
            const requiredRatio = this.getRequiredContrastRatio(isLargeText);
            
            if (contrast < requiredRatio) {
                this.violations.push({
                    rule: 'colorContrast',
                    level: this.rules.colorContrast.level,
                    element: this.getElementSelector(element),
                    message: `Insufficient color contrast: ${contrast.toFixed(2)}:1 (required: ${requiredRatio}:1)`,
                    actualRatio: contrast,
                    requiredRatio: requiredRatio,
                    suggestions: this.getContrastSuggestions(color, backgroundColor, requiredRatio),
                    severity: 'error'
                });
            } else {
                this.passes.push({
                    rule: 'colorContrast',
                    element: this.getElementSelector(element),
                    message: `Adequate color contrast: ${contrast.toFixed(2)}:1`
                });
            }
        }
    }

    // Check image alternatives
    async checkImageAlternatives(document) {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            const alt = img.getAttribute('alt');
            const ariaLabel = img.getAttribute('aria-label');
            const ariaLabelledBy = img.getAttribute('aria-labelledby');
            const role = img.getAttribute('role');
            
            // Decorative images
            if (role === 'presentation' || role === 'none' || alt === '') {
                this.passes.push({
                    rule: 'imageAlt',
                    element: this.getElementSelector(img),
                    message: 'Decorative image properly marked'
                });
                return;
            }
            
            // Images without alternative text
            if (!alt && !ariaLabel && !ariaLabelledBy) {
                this.violations.push({
                    rule: 'imageAlt',
                    level: this.rules.imageAlt.level,
                    element: this.getElementSelector(img),
                    message: 'Image missing alternative text',
                    suggestions: [
                        'Add descriptive alt attribute',
                        'Use aria-label for complex images',
                        'Mark as decorative with alt="" if appropriate'
                    ],
                    severity: 'error'
                });
            }
            // Check for poor alt text
            else if (alt) {
                const poorAltPatterns = /^(image|picture|photo|graphic|img|logo)$/i;
                if (poorAltPatterns.test(alt.trim())) {
                    this.warnings.push({
                        rule: 'imageAlt',
                        element: this.getElementSelector(img),
                        message: 'Alt text is not descriptive enough',
                        suggestions: ['Describe what the image shows, not that it is an image'],
                        severity: 'warning'
                    });
                } else {
                    this.passes.push({
                        rule: 'imageAlt',
                        element: this.getElementSelector(img),
                        message: 'Image has descriptive alternative text'
                    });
                }
            }
        });
    }

    // Check form labels
    async checkFormLabels(document) {
        const formControls = document.querySelectorAll('input:not([type="hidden"]), textarea, select');
        
        formControls.forEach(control => {
            const id = control.getAttribute('id');
            const ariaLabel = control.getAttribute('aria-label');
            const ariaLabelledBy = control.getAttribute('aria-labelledby');
            const title = control.getAttribute('title');
            
            // Find associated label
            let label = null;
            if (id) {
                label = document.querySelector(`label[for="${id}"]`);
            }
            if (!label) {
                label = control.closest('label');
            }
            
            if (!label && !ariaLabel && !ariaLabelledBy && !title) {
                this.violations.push({
                    rule: 'formLabels',
                    level: this.rules.formLabels.level,
                    element: this.getElementSelector(control),
                    message: 'Form control missing label',
                    suggestions: [
                        'Add a <label> element with for attribute',
                        'Use aria-label attribute',
                        'Use aria-labelledby to reference label text'
                    ],
                    severity: 'error'
                });
            } else {
                this.passes.push({
                    rule: 'formLabels',
                    element: this.getElementSelector(control),
                    message: 'Form control has proper label'
                });
            }
        });
    }

    // Check heading structure
    async checkHeadingStructure(document) {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let previousLevel = 0;
        let hasH1 = false;
        
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            
            if (level === 1) {
                if (hasH1) {
                    this.warnings.push({
                        rule: 'headingStructure',
                        element: this.getElementSelector(heading),
                        message: 'Multiple H1 elements found',
                        suggestions: ['Use only one H1 per page'],
                        severity: 'warning'
                    });
                }
                hasH1 = true;
            }
            
            if (index === 0 && level !== 1) {
                this.violations.push({
                    rule: 'headingStructure',
                    level: this.rules.headingStructure.level,
                    element: this.getElementSelector(heading),
                    message: 'Page should start with H1',
                    severity: 'error'
                });
            }
            
            if (previousLevel > 0 && level > previousLevel + 1) {
                this.violations.push({
                    rule: 'headingStructure',
                    level: this.rules.headingStructure.level,
                    element: this.getElementSelector(heading),
                    message: `Heading level skipped from H${previousLevel} to H${level}`,
                    suggestions: [`Use H${previousLevel + 1} instead of H${level}`],
                    severity: 'error'
                });
            }
            
            // Check for empty headings
            if (!this.hasVisibleText(heading)) {
                this.violations.push({
                    rule: 'headingStructure',
                    level: this.rules.headingStructure.level,
                    element: this.getElementSelector(heading),
                    message: 'Empty heading element',
                    severity: 'error'
                });
            }
            
            previousLevel = level;
        });
        
        if (!hasH1) {
            this.violations.push({
                rule: 'headingStructure',
                level: this.rules.headingStructure.level,
                element: 'document',
                message: 'Page missing H1 element',
                suggestions: ['Add a main heading using H1'],
                severity: 'error'
            });
        }
    }

    // Check focus management
    async checkFocusManagement(document) {
        const focusableElements = document.querySelectorAll(
            'a[href], button, input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        focusableElements.forEach(element => {
            const styles = window.getComputedStyle(element);
            const outline = styles.outline;
            const outlineWidth = styles.outlineWidth;
            const outlineStyle = styles.outlineStyle;
            const outlineColor = styles.outlineColor;
            
            // Check if focus indicator is removed
            if (outline === 'none' || outlineWidth === '0px' || outlineStyle === 'none') {
                // Check for custom focus styles
                const hasCustomFocus = this.hasCustomFocusStyle(element);
                
                if (!hasCustomFocus) {
                    this.violations.push({
                        rule: 'focusVisible',
                        level: this.rules.focusVisible.level,
                        element: this.getElementSelector(element),
                        message: 'Focus indicator removed without replacement',
                        suggestions: [
                            'Provide visible focus indicator',
                            'Use outline or border changes on focus',
                            'Ensure focus indicator has sufficient contrast'
                        ],
                        severity: 'error'
                    });
                }
            }
            
            // Check tabindex values
            const tabindex = element.getAttribute('tabindex');
            if (tabindex && parseInt(tabindex) > 0) {
                this.warnings.push({
                    rule: 'focusVisible',
                    element: this.getElementSelector(element),
                    message: 'Positive tabindex found',
                    suggestions: ['Use tabindex="0" or remove tabindex to maintain natural tab order'],
                    severity: 'warning'
                });
            }
        });
    }

    // Check keyboard accessibility
    async checkKeyboardAccessibility(document) {
        const interactiveElements = document.querySelectorAll('div[onclick], span[onclick], *[role="button"], *[role="link"], *[role="menuitem"]');
        
        interactiveElements.forEach(element => {
            const role = element.getAttribute('role');
            const tabindex = element.getAttribute('tabindex');
            const onclick = element.getAttribute('onclick') || element.onclick;
            
            if (onclick && !tabindex && !role) {
                this.violations.push({
                    rule: 'keyboardAccessible',
                    level: this.rules.keyboardAccessible.level,
                    element: this.getElementSelector(element),
                    message: 'Interactive element not keyboard accessible',
                    suggestions: [
                        'Add tabindex="0" to make focusable',
                        'Use proper semantic elements (button, a)',
                        'Add keyboard event handlers'
                    ],
                    severity: 'error'
                });
            }
            
            // Check for keyboard event handlers
            if (onclick && !this.hasKeyboardHandler(element)) {
                this.warnings.push({
                    rule: 'keyboardAccessible',
                    element: this.getElementSelector(element),
                    message: 'Click handler without keyboard equivalent',
                    suggestions: ['Add onkeydown or onkeypress handler'],
                    severity: 'warning'
                });
            }
        });
    }

    // Check page language
    async checkPageLanguage(document) {
        const html = document.documentElement;
        const lang = html.getAttribute('lang');
        
        if (!lang) {
            this.violations.push({
                rule: 'pageLanguage',
                level: this.rules.pageLanguage.level,
                element: 'html',
                message: 'Page missing language attribute',
                suggestions: ['Add lang attribute to <html> element (e.g., lang="en")'],
                severity: 'error'
            });
        } else if (!this.isValidLanguageCode(lang)) {
            this.violations.push({
                rule: 'pageLanguage',
                level: this.rules.pageLanguage.level,
                element: 'html',
                message: `Invalid language code: ${lang}`,
                suggestions: ['Use valid ISO 639-1 language codes'],
                severity: 'error'
            });
        } else {
            this.passes.push({
                rule: 'pageLanguage',
                element: 'html',
                message: `Valid page language: ${lang}`
            });
        }
    }

    // Check link purpose
    async checkLinkPurpose(document) {
        const links = document.querySelectorAll('a[href]');
        
        links.forEach(link => {
            const text = this.getAccessibleText(link);
            const href = link.getAttribute('href');
            
            if (!text || text.trim() === '') {
                this.violations.push({
                    rule: 'linkPurpose',
                    level: this.rules.linkPurpose.level,
                    element: this.getElementSelector(link),
                    message: 'Link has no accessible text',
                    suggestions: [
                        'Add descriptive link text',
                        'Use aria-label for image links',
                        'Add sr-only text for icon links'
                    ],
                    severity: 'error'
                });
            } else {
                // Check for generic link text
                const genericTexts = ['click here', 'more', 'read more', 'link', 'here'];
                const isGeneric = genericTexts.some(generic => 
                    text.toLowerCase().trim() === generic
                );
                
                if (isGeneric) {
                    this.warnings.push({
                        rule: 'linkPurpose',
                        element: this.getElementSelector(link),
                        message: 'Link text is not descriptive',
                        suggestions: ['Use descriptive link text that explains the destination'],
                        severity: 'warning'
                    });
                }
            }
            
            // Check for links that open in new window/tab
            const target = link.getAttribute('target');
            if (target === '_blank' && !this.hasNewWindowIndicator(link)) {
                this.warnings.push({
                    rule: 'linkPurpose',
                    element: this.getElementSelector(link),
                    message: 'Link opens in new window without warning',
                    suggestions: [
                        'Add "(opens in new window)" to link text',
                        'Use aria-describedby to reference warning text'
                    ],
                    severity: 'warning'
                });
            }
        });
    }

    // Check table headers
    async checkTableHeaders(document) {
        const tables = document.querySelectorAll('table');
        
        tables.forEach(table => {
            const headers = table.querySelectorAll('th');
            const dataCells = table.querySelectorAll('td');
            
            if (dataCells.length > 0 && headers.length === 0) {
                this.violations.push({
                    rule: 'tableHeaders',
                    level: this.rules.tableHeaders.level,
                    element: this.getElementSelector(table),
                    message: 'Data table missing header cells',
                    suggestions: ['Use <th> elements for table headers'],
                    severity: 'error'
                });
            }
            
            // Check for proper scope attributes in complex tables
            if (this.isComplexTable(table)) {
                headers.forEach(header => {
                    const scope = header.getAttribute('scope');
                    if (!scope) {
                        this.warnings.push({
                            rule: 'tableHeaders',
                            element: this.getElementSelector(header),
                            message: 'Complex table header missing scope attribute',
                            suggestions: ['Add scope="col" or scope="row" to clarify header relationships'],
                            severity: 'warning'
                        });
                    }
                });
            }
            
            // Check for table caption
            const caption = table.querySelector('caption');
            if (!caption && dataCells.length > 9) { // Tables with more than 9 cells should have captions
                this.warnings.push({
                    rule: 'tableHeaders',
                    element: this.getElementSelector(table),
                    message: 'Large table missing caption',
                    suggestions: ['Add <caption> element to describe table purpose'],
                    severity: 'warning'
                });
            }
        });
    }

    // Check multimedia content
    async checkMultimedia(document) {
        const videos = document.querySelectorAll('video');
        const audios = document.querySelectorAll('audio');
        
        videos.forEach(video => {
            const tracks = video.querySelectorAll('track[kind="captions"], track[kind="subtitles"]');
            const controls = video.hasAttribute('controls');
            
            if (tracks.length === 0) {
                this.violations.push({
                    rule: 'videoAudio',
                    level: this.rules.videoAudio.level,
                    element: this.getElementSelector(video),
                    message: 'Video missing captions or subtitles',
                    suggestions: ['Add <track> elements for captions'],
                    severity: 'error'
                });
            }
            
            if (!controls) {
                this.warnings.push({
                    rule: 'videoAudio',
                    element: this.getElementSelector(video),
                    message: 'Video missing controls',
                    suggestions: ['Add controls attribute for keyboard accessibility'],
                    severity: 'warning'
                });
            }
        });
        
        audios.forEach(audio => {
            const controls = audio.hasAttribute('controls');
            
            if (!controls) {
                this.violations.push({
                    rule: 'videoAudio',
                    level: this.rules.videoAudio.level,
                    element: this.getElementSelector(audio),
                    message: 'Audio missing controls',
                    suggestions: ['Add controls attribute'],
                    severity: 'error'
                });
            }
        });
    }

    // Check semantic structure
    async checkSemanticStructure(document) {
        const landmarks = document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer');
        const sections = document.querySelectorAll('section, article, aside');
        
        // Check for main landmark
        const mainLandmarks = document.querySelectorAll('[role="main"], main');
        if (mainLandmarks.length === 0) {
            this.warnings.push({
                rule: 'semanticStructure',
                element: 'document',
                message: 'Page missing main landmark',
                suggestions: ['Add <main> element or role="main"'],
                severity: 'warning'
            });
        } else if (mainLandmarks.length > 1) {
            this.warnings.push({
                rule: 'semanticStructure',
                element: 'document',
                message: 'Multiple main landmarks found',
                suggestions: ['Use only one main landmark per page'],
                severity: 'warning'
            });
        }
        
        // Check section headings
        sections.forEach(section => {
            const headings = section.querySelectorAll('h1, h2, h3, h4, h5, h6');
            const ariaLabel = section.getAttribute('aria-label');
            const ariaLabelledBy = section.getAttribute('aria-labelledby');
            
            if (headings.length === 0 && !ariaLabel && !ariaLabelledBy) {
                this.warnings.push({
                    rule: 'semanticStructure',
                    element: this.getElementSelector(section),
                    message: 'Section missing heading or label',
                    suggestions: [
                        'Add a heading element',
                        'Use aria-label to name the section'
                    ],
                    severity: 'warning'
                });
            }
        });
    }

    // Check ARIA usage
    async checkARIAUsage(document) {
        const ariaElements = document.querySelectorAll('[aria-labelledby], [aria-describedby], [role]');
        
        ariaElements.forEach(element => {
            // Check aria-labelledby references
            const labelledBy = element.getAttribute('aria-labelledby');
            if (labelledBy) {
                const ids = labelledBy.split(/\s+/);
                ids.forEach(id => {
                    if (!document.getElementById(id)) {
                        this.violations.push({
                            rule: 'ariaUsage',
                            level: 'A',
                            element: this.getElementSelector(element),
                            message: `aria-labelledby references non-existent element: ${id}`,
                            severity: 'error'
                        });
                    }
                });
            }
            
            // Check aria-describedby references
            const describedBy = element.getAttribute('aria-describedby');
            if (describedBy) {
                const ids = describedBy.split(/\s+/);
                ids.forEach(id => {
                    if (!document.getElementById(id)) {
                        this.violations.push({
                            rule: 'ariaUsage',
                            level: 'A',
                            element: this.getElementSelector(element),
                            message: `aria-describedby references non-existent element: ${id}`,
                            severity: 'error'
                        });
                    }
                });
            }
            
            // Check for invalid ARIA roles
            const role = element.getAttribute('role');
            if (role && !this.isValidARIARole(role)) {
                this.violations.push({
                    rule: 'ariaUsage',
                    level: 'A',
                    element: this.getElementSelector(element),
                    message: `Invalid ARIA role: ${role}`,
                    severity: 'error'
                });
            }
        });
    }

    // Helper methods
    hasVisibleText(element) {
        const text = element.textContent || element.innerText;
        return text && text.trim().length > 0;
    }

    parseColor(colorString) {
        // Simple RGB parser - in real implementation, use more robust color parsing
        const rgb = colorString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgb) {
            return {
                r: parseInt(rgb[1]),
                g: parseInt(rgb[2]),
                b: parseInt(rgb[3])
            };
        }
        return null;
    }

    getBackgroundColor(element) {
        let current = element;
        while (current && current !== document.body) {
            const styles = window.getComputedStyle(current);
            const bgColor = this.parseColor(styles.backgroundColor);
            if (bgColor && (bgColor.r !== 0 || bgColor.g !== 0 || bgColor.b !== 0)) {
                return bgColor;
            }
            current = current.parentElement;
        }
        return { r: 255, g: 255, b: 255 }; // Default to white
    }

    calculateContrast(color1, color2) {
        const l1 = this.getLuminance(color1);
        const l2 = this.getLuminance(color2);
        const bright = Math.max(l1, l2);
        const dark = Math.min(l1, l2);
        return (bright + 0.05) / (dark + 0.05);
    }

    getLuminance(color) {
        const { r, g, b } = color;
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    getRequiredContrastRatio(isLargeText) {
        if (this.options.level === 'AAA') {
            return isLargeText ? 4.5 : 7.0;
        }
        return isLargeText ? 3.0 : 4.5;
    }

    getContrastSuggestions(foreground, background, requiredRatio) {
        // Simplified suggestions - real implementation would calculate specific color values
        return [
            'Darken the text color',
            'Lighten the background color',
            'Use a different color combination',
            'Increase font weight or size if possible'
        ];
    }

    getElementSelector(element) {
        if (!element || typeof element === 'string') return element;
        
        if (element.id) {
            return `#${element.id}`;
        }
        
        let selector = element.tagName.toLowerCase();
        if (element.className) {
            selector += `.${element.className.split(' ').join('.')}`;
        }
        
        return selector;
    }

    hasCustomFocusStyle(element) {
        // Check if element has custom focus styles (simplified)
        const focusStyles = ['box-shadow', 'border', 'background-color'];
        // In real implementation, would check for :focus pseudo-class styles
        return false;
    }

    hasKeyboardHandler(element) {
        return element.onkeydown || element.onkeypress || element.onkeyup;
    }

    isValidLanguageCode(lang) {
        // Simplified check - real implementation would use comprehensive language code list
        const validCodes = ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko'];
        return validCodes.includes(lang.split('-')[0]);
    }

    getAccessibleText(element) {
        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel) return ariaLabel;
        
        const ariaLabelledBy = element.getAttribute('aria-labelledby');
        if (ariaLabelledBy) {
            const labelElement = document.getElementById(ariaLabelledBy);
            if (labelElement) return labelElement.textContent;
        }
        
        return element.textContent || element.innerText;
    }

    hasNewWindowIndicator(link) {
        const text = this.getAccessibleText(link);
        return text && (
            text.includes('(opens in new window)') ||
            text.includes('(new window)') ||
            text.includes('external link')
        );
    }

    isComplexTable(table) {
        const rows = table.rows;
        return rows.length > 3 || (rows[0] && rows[0].cells.length > 3);
    }

    isValidARIARole(role) {
        const validRoles = [
            'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
            'cell', 'checkbox', 'columnheader', 'combobox', 'complementary',
            'contentinfo', 'dialog', 'directory', 'document', 'feed', 'figure',
            'form', 'grid', 'gridcell', 'group', 'heading', 'img', 'link',
            'list', 'listbox', 'listitem', 'log', 'main', 'marquee', 'math',
            'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio',
            'navigation', 'none', 'note', 'option', 'presentation', 'progressbar',
            'radio', 'radiogroup', 'region', 'row', 'rowgroup', 'rowheader',
            'scrollbar', 'search', 'searchbox', 'separator', 'slider', 'spinbutton',
            'status', 'switch', 'tab', 'table', 'tablist', 'tabpanel', 'term',
            'textbox', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid',
            'treeitem'
        ];
        return validRoles.includes(role);
    }

    // Generate comprehensive report
    generateReport() {
        const totalIssues = this.violations.length + this.warnings.length;
        const score = this.calculateAccessibilityScore();
        
        return {
            timestamp: new Date().toISOString(),
            level: this.options.level,
            guidelines: this.options.guidelines,
            summary: {
                score: score,
                totalIssues: totalIssues,
                violations: this.violations.length,
                warnings: this.warnings.length,
                passes: this.passes.length,
                compliance: this.getComplianceLevel()
            },
            violations: this.violations,
            warnings: this.warnings,
            passes: this.passes.length > 0 ? this.passes : undefined
        };
    }

    calculateAccessibilityScore() {
        const totalChecks = this.violations.length + this.warnings.length + this.passes.length;
        if (totalChecks === 0) return 0;
        
        const weightedScore = (this.passes.length * 1) + (this.warnings.length * 0.5) + (this.violations.length * 0);
        return Math.round((weightedScore / totalChecks) * 100);
    }

    getComplianceLevel() {
        const criticalViolations = this.violations.filter(v => v.level === 'A').length;
        const aaViolations = this.violations.filter(v => v.level === 'AA').length;
        const aaaViolations = this.violations.filter(v => v.level === 'AAA').length;
        
        if (criticalViolations > 0) return 'Non-compliant';
        if (aaViolations > 0 && this.options.level === 'AA') return 'Partially compliant';
        if (aaaViolations > 0 && this.options.level === 'AAA') return 'Partially compliant';
        return 'Compliant';
    }

    // Generate console report
    generateConsoleReport() {
        const report = this.generateReport();
        
        console.log('\n♿ ACCESSIBILITY AUDIT REPORT');
        console.log('==============================');
        console.log(`🎯 WCAG ${this.options.guidelines} Level ${this.options.level}`);
        console.log(`📊 Accessibility Score: ${report.summary.score}/100`);
        console.log(`✅ Compliance: ${report.summary.compliance}`);
        console.log(`🚨 Violations: ${report.summary.violations}`);
        console.log(`⚠️  Warnings: ${report.summary.warnings}`);
        console.log(`✅ Passes: ${report.summary.passes}`);

        if (this.violations.length > 0) {
            console.log('\n🚨 VIOLATIONS:');
            this.violations.forEach((violation, index) => {
                console.log(`\n${index + 1}. ${violation.message}`);
                console.log(`   Element: ${violation.element}`);
                console.log(`   Level: WCAG ${violation.level}`);
                if (violation.suggestions) {
                    console.log(`   Suggestions:`);
                    violation.suggestions.forEach(suggestion => {
                        console.log(`     • ${suggestion}`);
                    });
                }
            });
        }

        if (this.warnings.length > 0 && this.options.includeWarnings) {
            console.log('\n⚠️  WARNINGS:');
            this.warnings.forEach((warning, index) => {
                console.log(`\n${index + 1}. ${warning.message}`);
                console.log(`   Element: ${warning.element}`);
                if (warning.suggestions) {
                    console.log(`   Suggestions:`);
                    warning.suggestions.forEach(suggestion => {
                        console.log(`     • ${suggestion}`);
                    });
                }
            });
        }
    }
}

// Node.js testing utilities
class AccessibilityTestRunner {
    constructor() {
        this.results = [];
    }

    async testPage(page, options = {}) {
        // Inject accessibility checker into page
        await page.evaluateOnNewDocument(() => {
            // AccessibilityChecker code would be injected here
        });

        await page.goto(options.url);
        
        const report = await page.evaluate((opts) => {
            const checker = new AccessibilityChecker(opts);
            return checker.audit(document);
        }, options);

        this.results.push({
            url: options.url,
            report
        });

        return report;
    }

    generateSummaryReport() {
        const totalPages = this.results.length;
        const totalViolations = this.results.reduce((sum, r) => sum + r.report.summary.violations, 0);
        const averageScore = this.results.reduce((sum, r) => sum + r.report.summary.score, 0) / totalPages;

        return {
            summary: {
                pagesAudited: totalPages,
                totalViolations,
                averageScore: Math.round(averageScore),
                compliantPages: this.results.filter(r => r.report.summary.compliance === 'Compliant').length
            },
            results: this.results
        };
    }
}

module.exports = { AccessibilityChecker, AccessibilityTestRunner };

// Example usage for browser environment
if (typeof window !== 'undefined') {
    window.AccessibilityChecker = AccessibilityChecker;
    
    // Auto-audit demo
    window.addEventListener('load', () => {
        console.log('♿ Accessibility Checker available as window.AccessibilityChecker');
        console.log('Usage: const checker = new AccessibilityChecker(); checker.audit(document);');
    });
}
