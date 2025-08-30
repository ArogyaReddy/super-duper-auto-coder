#!/usr/bin/env node

/**
 * 🎯 UNIVERSAL AUTHENTICATION HANDLER - THE BEST
 * 
 * Comprehensive authentication handler that adapts to different login scenarios
 * based on user type, environment, and application.
 * 
 * Supports:
 * - User Types: CLIENT, SERVICE_USER  
 * - Environments: QAFIT, IAT, PROD
 * - Applications: RUN, MAX, WFN, DTO, Classic, etc.
 * - Multiple authentication flows and strategies
 * 
 * Framework-agnostic and works with any web application testing.
 */

const fs = require('fs-extra');
const path = require('path');

class UniversalAuthenticationHandler {
    constructor(options = {}) {
        this.options = {
            timeout: options.timeout || 30000,
            retryAttempts: options.retryAttempts || 3,
            screenshots: options.screenshots !== false,
            screenshotDir: options.screenshotDir || path.join(__dirname, 'screenshots'),
            sessionCache: options.sessionCache !== false,
            ...options
        };
        
        this.timestamp = this.generateTimestamp();
        this.sessionId = `session_${this.timestamp}`;
        this.authHistory = [];
        this.credentialCache = new Map();
        this.sessionCache = new Map();
        
        // Initialize configuration
        this.initializeConfiguration();
        
        console.log('🎯 UNIVERSAL AUTHENTICATION HANDLER INITIALIZED');
        console.log(`🕒 Session: ${this.sessionId}`);
        console.log('🔧 Multi-environment, multi-application support enabled');
    }

    generateTimestamp() {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = String(hours % 12 || 12).padStart(2, '0');
        
        return `${year}${month}${day}${displayHours}${minutes}${seconds}${ampm}`;
    }

    initializeConfiguration() {
        // User Type Classification System
        this.USER_TYPES = {
            CLIENT: {
                roles: ['OWNER', 'PAYROLL_ADMIN', 'HR_ADMIN', 'ACCOUNTANT_CONNECT', 'CLIENT_USER'],
                loginPattern: 'Username@IID',
                authFlow: 'STANDARD_SIGNIN',
                description: 'Business clients using payroll applications'
            },
            SERVICE_USER: {
                roles: ['ASSOCIATE', 'SERVICE_TECH', 'ADMIN', 'AUTOMATION', 'INTERNAL'],
                loginPattern: 'username@adp',
                authFlow: 'INTERNAL_PORTAL',
                description: 'Internal users and service personnel'
            }
        };

        // Environment Configuration Matrix
        this.ENVIRONMENT_CONFIG = {
            QAFIT: {
                name: 'QA Functional Integration Testing',
                CLIENT_BASE_URL: 'https://online-fit.nj.adp.com/signin/v1/',
                SERVICE_BASE_URL: 'https://runpayroll-qafit.es.ad.adp.com/@836D254C-789B-41B8-8052-D48A639E95D8/admin/',
                API_BASE_URL: 'https://apifit.nj.adp.com',
                NGAPPS_URL: 'https://ngapps-fit.nj.adp.com',
                PRODUCT_IDS: {
                    RUN: '7ab877eb-7a34-f136-e053-1a4f10332043',
                    WFN: '7ab877eb-7b24-f136-e053-1a4f10332043',
                    MAX: '7ab877eb-7a34-f136-e053-1a4f10332043'
                },
                aliases: ['fit', 'qa-fit', 'qafit']
            },
            IAT: {
                name: 'Integration Acceptance Testing',
                CLIENT_BASE_URL: 'https://online-iat.adp.com/signin/v1/',
                SERVICE_BASE_URL: 'https://runpayroll-iat.es.ad.adp.com/@836D254C-789B-41B8-8052-D48A639E95D8/admin/',
                API_BASE_URL: 'https://iat-api.adp.com',
                NGAPPS_URL: 'https://ngapps-iat.adp.com',
                PRODUCT_IDS: {
                    RUN: '7bf1242e-2ff0-e324-e053-37004b0bc98c',
                    WFN: '7bf1242e-2ea8-e324-e053-37004b0bc98c',
                    MAX: '7bf1242e-2ff0-e324-e053-37004b0bc98c'
                },
                aliases: ['iat', 'integration']
            },
            PROD: {
                name: 'Production',
                CLIENT_BASE_URL: 'https://online.adp.com/signin/v1/',
                SERVICE_BASE_URL: 'https://runpayroll.adp.com/@836D254C-789B-41B8-8052-D48A639E95D8/admin/',
                API_BASE_URL: 'https://api.adp.com',
                NGAPPS_URL: 'https://ngapps.adp.com',
                PRODUCT_IDS: {
                    RUN: 'prod-run-product-id',
                    WFN: 'prod-wfn-product-id',
                    MAX: 'prod-max-product-id'
                },
                aliases: ['prod', 'production']
            }
        };

        // Application Type Routing - Updated with SBS_Automation selectors
        this.APPLICATION_ROUTING = {
            RUN: {
                name: 'RunMod Payroll',
                CLIENT_URL_TEMPLATE: '{BASE_URL}?APPID=RUN&productId={PRODUCT_ID}',
                SERVICE_URL_TEMPLATE: '{SERVICE_BASE_URL}/login.aspx',
                selectors: {
                    username: '#login-form_username',
                    password: '#login-form_password',
                    verifyButton: '#verifUseridBtn, #btnNext',
                    signInButton: '#signBtn, #btnNext',
                    remindLaterButton: "//*[text() = 'Remind me later']"
                }
            },
            MAX: {
                name: 'MAX Digital Tax Office',
                CLIENT_URL_TEMPLATE: '{BASE_URL}?APPID=MAX&productId={PRODUCT_ID}',
                SERVICE_URL_TEMPLATE: '{SERVICE_BASE_URL}/max/login.aspx',
                selectors: {
                    username: '#login-form_username',
                    password: '#login-form_password',
                    verifyButton: '#verifUseridBtn, #btnNext',
                    signInButton: '#signBtn, #btnNext',
                    remindLaterButton: "//*[text() = 'Remind me later']"
                }
            },
            WFN: {
                name: 'Workforce Now',
                CLIENT_URL_TEMPLATE: '{BASE_URL}?APPID=WFNPortal&productId={PRODUCT_ID}&returnURL=https://wfn-{ENV}.adp.com/',
                SERVICE_URL_TEMPLATE: '{SERVICE_BASE_URL}/wfn/login.aspx',
                selectors: {
                    username: '#login-form_username',
                    password: '#login-form_password',
                    verifyButton: '#verifUseridBtn, #btnNext',
                    signInButton: '#signBtn, #btnNext',
                    remindLaterButton: "//*[text() = 'Remind me later']"
                }
            },
            DTO: {
                name: 'Digital Tax Office',
                CLIENT_URL_TEMPLATE: '{BASE_URL}?APPID=DTO&productId={PRODUCT_ID}',
                SERVICE_URL_TEMPLATE: '{SERVICE_BASE_URL}/dto/login.aspx',
                selectors: {
                    username: '#login-form_username',
                    password: '#login-form_password',
                    verifyButton: '#verifUseridBtn, #btnNext',
                    signInButton: '#signBtn, #btnNext',
                    remindLaterButton: "//*[text() = 'Remind me later']"
                }
            }
        };

        // SBS_Automation Compatible Selectors (from practitioner-login.js)
        this.SBS_SELECTORS = {
            username: '#login-form_username',
            password: '#login-form_password',
            verifyButton: '#verifUseridBtn, #btnNext',
            signInButton: '#signBtn, #btnNext',
            remindLaterButton: "//*[text() = 'Remind me later']",
            continueButton: "//button/div[text() = 'Continue']",
            letGoButton: "//div[@data-cypress-view='desktop']/descendant::button[@data-test-id='button-letsGo-startSetup']",
            welcomeBackButton: "//h2[text() = 'Welcome back!']/ancestor::div[contains(@class, 'stack large' )]/descendant::button[text() = 'Continue']"
        };
    }

    /**
     * Main authentication method - auto-detects user type, environment, and application
     */
    async performUniversalAuthentication(page, targetUrl, credentials, options = {}) {
        console.log('\n🎯 UNIVERSAL AUTHENTICATION HANDLER - MAIN ENTRY POINT');
        console.log('======================================================');
        console.log(`🌐 Target URL: ${targetUrl}`);
        console.log(`🕒 Session: ${this.sessionId}`);
        console.log('🔍 Auto-detecting authentication parameters...');

        try {
            // Step 1: Parse and validate credentials
            const parsedCredentials = this.parseCredentials(credentials);
            console.log(`✅ Credentials parsed: ${parsedCredentials.username}/${parsedCredentials.password.replace(/./g, '*')}`);

            // Step 2: Detect user type from credentials
            const userType = this.detectUserType(parsedCredentials);
            console.log(`🔍 Detected user type: ${userType} (${this.USER_TYPES[userType].description})`);

            // Step 3: Detect environment from URL
            const environment = this.detectEnvironment(targetUrl);
            console.log(`🌍 Detected environment: ${environment} (${this.ENVIRONMENT_CONFIG[environment].name})`);

            // Step 4: Detect application type from URL
            const applicationType = this.detectApplicationType(targetUrl);
            console.log(`📱 Detected application: ${applicationType} (${this.APPLICATION_ROUTING[applicationType].name})`);

            // Step 5: Construct proper login URL
            const loginUrl = this.constructLoginURL(userType, environment, applicationType, parsedCredentials);
            console.log(`🔗 Constructed login URL: ${loginUrl}`);

            // Step 6: Perform authentication
            const authResult = await this.performAuthentication(
                page, 
                loginUrl, 
                parsedCredentials, 
                userType, 
                environment, 
                applicationType, 
                options
            );

            // Step 7: Record authentication attempt
            this.recordAuthHistory({
                userType,
                environment,
                applicationType,
                credentials: {
                    username: parsedCredentials.username,
                    passwordLength: parsedCredentials.password.length
                },
                result: authResult,
                timestamp: new Date().toISOString()
            });

            return authResult;

        } catch (error) {
            console.error('❌ Universal authentication failed:', error.message);
            
            // Take error screenshot
            if (this.options.screenshots) {
                await this.takeScreenshot(page, 'universal-auth-error');
            }
            
            throw error;
        }
    }

    /**
     * Parse credentials from various formats
     */
    parseCredentials(credentials) {
        if (typeof credentials === 'object') {
            return credentials;
        }

        if (typeof credentials !== 'string') {
            throw new Error('Credentials must be string or object format');
        }

        // Support multiple separators
        const separators = ['/', ':', '|', ';'];
        let separator = null;
        
        for (const sep of separators) {
            if (credentials.includes(sep)) {
                separator = sep;
                break;
            }
        }
        
        if (!separator) {
            throw new Error('Invalid credential format. Use username/password, username:password, etc.');
        }
        
        const parts = credentials.split(separator);
        if (parts.length < 2) {
            throw new Error('Credentials must contain username and password');
        }
        
        const result = {
            username: parts[0].trim(),
            password: parts[1].trim(),
            original: credentials
        };

        // Extract IID if present in username (for CLIENT users)
        if (result.username.includes('@')) {
            const usernameParts = result.username.split('@');
            result.baseUsername = usernameParts[0];
            result.iid = usernameParts[1];
        }

        return result;
    }

    /**
     * Detect user type from credential pattern
     */
    detectUserType(credentials) {
        const username = credentials.username.toLowerCase();
        
        // SERVICE_USER patterns
        if (username.includes('@adp') || 
            username.includes('automation') || 
            username.includes('service') ||
            username.includes('associate')) {
            return 'SERVICE_USER';
        }
        
        // CLIENT patterns (username@IID format)
        if (credentials.iid && /^\d+$/.test(credentials.iid)) {
            return 'CLIENT';
        }
        
        // Default to CLIENT if uncertain
        return 'CLIENT';
    }

    /**
     * Detect environment from URL
     */
    detectEnvironment(url) {
        const urlLower = url.toLowerCase();
        
        // Check for environment indicators in URL
        if (urlLower.includes('fit') || urlLower.includes('qafit')) {
            return 'QAFIT';
        }
        if (urlLower.includes('iat') || urlLower.includes('integration')) {
            return 'IAT';
        }
        if (urlLower.includes('prod') || 
            (!urlLower.includes('fit') && !urlLower.includes('iat') && !urlLower.includes('dev'))) {
            return 'PROD';
        }
        
        // Default to IAT for testing
        return 'IAT';
    }

    /**
     * Detect application type from URL
     */
    detectApplicationType(url) {
        const urlLower = url.toLowerCase();
        
        if (urlLower.includes('appid=run') || urlLower.includes('runpayroll')) {
            return 'RUN';
        }
        if (urlLower.includes('appid=max') || urlLower.includes('max') || urlLower.includes('dto')) {
            return 'MAX';
        }
        if (urlLower.includes('appid=wfn') || urlLower.includes('wfn')) {
            return 'WFN';
        }
        
        // Default to RUN
        return 'RUN';
    }

    /**
     * Construct proper login URL based on user type, environment, and application
     */
    constructLoginURL(userType, environment, applicationType, credentials) {
        const envConfig = this.ENVIRONMENT_CONFIG[environment];
        const appConfig = this.APPLICATION_ROUTING[applicationType];
        
        if (userType === 'SERVICE_USER') {
            // Service users use admin/associate portals
            return appConfig.SERVICE_URL_TEMPLATE
                .replace('{SERVICE_BASE_URL}', envConfig.SERVICE_BASE_URL);
        } else {
            // Client users use standard signin flow
            const baseUrl = envConfig.CLIENT_BASE_URL;
            const productId = envConfig.PRODUCT_IDS[applicationType];
            const env = environment.toLowerCase();
            
            return appConfig.CLIENT_URL_TEMPLATE
                .replace('{BASE_URL}', baseUrl)
                .replace('{PRODUCT_ID}', productId)
                .replace('{ENV}', env);
        }
    }

    /**
     * Perform the actual authentication
     */
    async performAuthentication(page, loginUrl, credentials, userType, environment, applicationType, options) {
        console.log(`\n🔐 PERFORMING ${userType} AUTHENTICATION`);
        console.log('=========================================');
        console.log(`� Environment: ${environment}`);
        console.log(`� Application: ${applicationType}`);
        console.log(`� Login URL: ${loginUrl}`);

        const startTime = Date.now();
        let authResult = {
            success: false,
            userType,
            environment,
            applicationType,
            startTime,
            loginUrl,
            error: null,
            screenshots: []
        };

        try {
            // Navigate to login URL
            console.log('🌐 Navigating to login page...');
            await page.goto(loginUrl, { 
                waitUntil: 'networkidle', 
                timeout: this.options.timeout 
            });

            // Take initial screenshot
            if (this.options.screenshots) {
                const screenshot = await this.takeScreenshot(page, `${userType.toLowerCase()}-${environment.toLowerCase()}-${applicationType.toLowerCase()}-initial`);
                authResult.screenshots.push(screenshot);
            }

            // Use SBS_Automation compatible login flow
            console.log('🔐 Using SBS_Automation compatible login flow...');
            const authSuccess = await this.performSBSCompatibleLogin(page, credentials, userType, environment, applicationType);

            authResult.success = authSuccess;
            authResult.finalUrl = page.url();
            authResult.endTime = Date.now();
            authResult.duration = authResult.endTime - startTime;

            if (authSuccess) {
                console.log('✅ Authentication successful!');
                
                // Take success screenshot
                if (this.options.screenshots) {
                    const screenshot = await this.takeScreenshot(page, `${userType.toLowerCase()}-success`);
                    authResult.screenshots.push(screenshot);
                }

                // Cache successful session if enabled
                if (this.options.sessionCache) {
                    const sessionKey = `${userType}-${environment}-${applicationType}`;
                    this.sessionCache.set(sessionKey, {
                        credentials,
                        timestamp: Date.now(),
                        finalUrl: authResult.finalUrl
                    });
                }
            } else {
                console.log('❌ Authentication failed - validation failed');
                authResult.error = 'Authentication validation failed';
                
                // Take failure screenshot
                if (this.options.screenshots) {
                    const screenshot = await this.takeScreenshot(page, `${userType.toLowerCase()}-failure`);
                    authResult.screenshots.push(screenshot);
                }
            }

            return authResult;

        } catch (error) {
            authResult.error = error.message;
            authResult.endTime = Date.now();
            authResult.duration = authResult.endTime - startTime;
            
            console.error(`❌ Authentication error: ${error.message}`);
            
            // Take error screenshot
            if (this.options.screenshots) {
                const screenshot = await this.takeScreenshot(page, `${userType.toLowerCase()}-error`);
                authResult.screenshots.push(screenshot);
            }
            
            return authResult;
        }
    }

    /**
     * SBS_Automation Compatible Login Flow (from practitioner-login.js)
     */
    async performSBSCompatibleLogin(page, credentials, userType, environment, applicationType) {
        try {
            console.log('🎯 Starting SBS_Automation compatible login flow...');
            
            // Step 1: Wait for and fill username (handle shadow DOM)
            console.log('⏳ Waiting for username field...');
            await page.waitForSelector(this.SBS_SELECTORS.username, { timeout: 15000 });
            
            console.log(`👤 Filling username: ${credentials.username}`);
            // Handle shadow DOM input for sdf-input elements
            await this.fillShadowDOMInput(page, this.SBS_SELECTORS.username, credentials.username);
            
            // Step 2: Click verify/next button
            console.log('🔍 Clicking verify user button...');
            await page.click(this.SBS_SELECTORS.verifyButton);
            
            // Step 3: Wait for password field and fill it
            console.log('⏳ Waiting for password field...');
            await page.waitForSelector(this.SBS_SELECTORS.password, { timeout: 15000 });
            
            console.log('🔑 Filling password...');
            // Handle shadow DOM input for sdf-input elements
            await this.fillShadowDOMInput(page, this.SBS_SELECTORS.password, credentials.password);
            
            // Step 4: Click sign in button
            console.log('🚀 Clicking sign in button...');
            await page.click(this.SBS_SELECTORS.signInButton);
            
            // Step 5: Handle post-login flows based on application type
            return await this.handlePostLoginFlow(page, userType, environment, applicationType);
            
        } catch (error) {
            console.error(`❌ SBS Compatible login failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Fill shadow DOM input elements (for sdf-input components)
     */
    async fillShadowDOMInput(page, selector, value) {
        try {
            // First try direct fill (for regular inputs)
            await page.fill(selector, value);
            console.log('✅ Filled using direct method');
        } catch (error) {
            // If direct fill fails, try shadow DOM approach
            console.log('🔍 Direct fill failed, trying shadow DOM approach...');
            try {
                // Method 1: Use evaluateHandle to access shadow DOM
                const shadowInput = await page.evaluateHandle((sel) => {
                    const host = document.querySelector(sel);
                    if (host && host.shadowRoot) {
                        return host.shadowRoot.querySelector('#input') || host.shadowRoot.querySelector('input');
                    }
                    return null;
                }, selector);
                
                if (shadowInput) {
                    await shadowInput.fill(value);
                    console.log('✅ Filled using shadow DOM method 1');
                    return;
                }
            } catch (e) {
                console.log('🔍 Shadow DOM method 1 failed, trying method 2...');
            }
            
            // Method 2: Try using locator with shadow piercing
            try {
                await page.locator(`${selector} >> #input`).fill(value);
                console.log('✅ Filled using shadow DOM method 2');
                return;
            } catch (e) {
                console.log('🔍 Shadow DOM method 2 failed, trying method 3...');
            }
            
            // Method 3: Try direct JavaScript execution
            try {
                await page.evaluate((sel, val) => {
                    const host = document.querySelector(sel);
                    if (host && host.shadowRoot) {
                        const input = host.shadowRoot.querySelector('#input') || host.shadowRoot.querySelector('input');
                        if (input) {
                            input.value = val;
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                            input.dispatchEvent(new Event('change', { bubbles: true }));
                            return true;
                        }
                    }
                    return false;
                }, selector, value);
                console.log('✅ Filled using shadow DOM method 3 (JavaScript)');
                return;
            } catch (e) {
                console.log('🔍 All shadow DOM methods failed, trying final approach...');
            }
            
            // Method 4: Try typing instead of filling
            try {
                await page.focus(selector);
                await page.keyboard.type(value);
                console.log('✅ Filled using keyboard typing method');
                return;
            } catch (e) {
                console.error('❌ All input methods failed');
                throw new Error(`Failed to fill input ${selector}: ${error.message}`);
            }
        }
    }

    /**
     * Handle post-login flows for different applications (based on SBS_Automation)
     */
    async handlePostLoginFlow(page, userType, environment, applicationType) {
        try {
            console.log('🔄 Handling post-login flow...');
            
            // Handle "Remind me later" button if present
            try {
                console.log('🔍 Checking for "Remind me later" button...');
                const remindLaterVisible = await page.isVisible("xpath=//*[text() = 'Remind me later']", { timeout: 5000 });
                if (remindLaterVisible) {
                    console.log('✅ Clicking "Remind me later"...');
                    await page.locator("xpath=//*[text() = 'Remind me later']").click();
                }
            } catch (e) {
                console.log('ℹ️  No "Remind me later" button found (expected)');
            }

            // Application-specific post-login handling
            if (applicationType === 'MAX') {
                return await this.handleMAXPostLogin(page);
            } else if (applicationType === 'RUN') {
                return await this.handleRUNPostLogin(page);
            } else if (applicationType === 'WFN') {
                return await this.handleWFNPostLogin(page);
            }

            // Default validation - check if we're no longer on login page
            console.log('🔍 Performing default authentication validation...');
            await this.waitForLoginRedirect(page);
            
            return true;
            
        } catch (error) {
            console.error(`❌ Post-login flow failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Handle MAX application post-login flow
     */
    async handleMAXPostLogin(page) {
        try {
            console.log('📊 Handling MAX post-login flow...');
            
            // Look for continue button specific to MAX/DTO
            try {
                const continueVisible = await page.isVisible("xpath=//button/div[text() = 'Continue']", { timeout: 10000 });
                if (continueVisible) {
                    console.log('✅ Clicking MAX continue button...');
                    await page.locator("xpath=//button/div[text() = 'Continue']").click();
                }
            } catch (e) {
                console.log('ℹ️  No MAX continue button found');
            }
            
            // Wait for successful landing
            await this.waitForLoginRedirect(page);
            return true;
            
        } catch (error) {
            console.error(`❌ MAX post-login failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Handle RUN application post-login flow
     */
    async handleRUNPostLogin(page) {
        try {
            console.log('💰 Handling RUN post-login flow...');
            
            // Look for RUN-specific elements (payroll carousel, todos tile)
            try {
                // Wait for home page indicators
                const homePageLoaded = await Promise.race([
                    page.waitForSelector('div[data-test-id="payroll-tile-wrapper"]', { timeout: 30000 }).then(() => 'payroll'),
                    page.waitForSelector('div[data-test-id="todos-wrapper"]', { timeout: 30000 }).then(() => 'todos'),
                    page.waitForSelector('[data-test-id="home-search-container"]', { timeout: 30000 }).then(() => 'search')
                ]);
                
                console.log(`✅ RUN home page loaded with: ${homePageLoaded}`);
                return true;
                
            } catch (e) {
                console.log('⚠️  RUN-specific elements not found, using generic validation');
                await this.waitForLoginRedirect(page);
                return true;
            }
            
        } catch (error) {
            console.error(`❌ RUN post-login failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Handle WFN application post-login flow
     */
    async handleWFNPostLogin(page) {
        try {
            console.log('👥 Handling WFN post-login flow...');
            
            // WFN may have specific step-up authentication
            // For now, use generic validation
            await this.waitForLoginRedirect(page);
            return true;
            
        } catch (error) {
            console.error(`❌ WFN post-login failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Wait for login redirect (indicates successful authentication)
     */
    async waitForLoginRedirect(page, timeout = 45000) {
        console.log('⏳ Waiting for login redirect...');
        
        const startUrl = page.url();
        const endTime = Date.now() + timeout;
        
        while (Date.now() < endTime) {
            const currentUrl = page.url();
            console.log(`🔄 Checking current URL: ${currentUrl}`);
            
            // Check if URL changed (successful redirect)
            if (currentUrl !== startUrl && !currentUrl.includes('/signin/') && !currentUrl.includes('/login')) {
                console.log(`✅ Login redirect detected: ${currentUrl}`);
                
                // Additional check for successful login indicators
                const successIndicators = [
                    'runpayrollmain2',
                    'dashboard',
                    'home',
                    'main',
                    'welcome'
                ];
                
                if (successIndicators.some(indicator => currentUrl.includes(indicator))) {
                    console.log(`✅ Success URL pattern confirmed: ${currentUrl}`);
                    return true;
                }
            }
            
            // Check for login success elements on the page
            try {
                const successElements = [
                    'text=Good morning',
                    'text=Welcome',
                    'text=Dashboard',
                    '[data-automation-id="home"]',
                    '.home-page',
                    '.dashboard'
                ];
                
                for (const selector of successElements) {
                    if (await page.locator(selector).isVisible({ timeout: 1000 })) {
                        console.log(`✅ Success element found: ${selector}`);
                        return true;
                    }
                }
            } catch (e) {
                // Continue checking
            }
            
            // Check for error indicators
            const hasError = await page.locator('text=/error|invalid|failed/i').isVisible().catch(() => false);
            if (hasError) {
                throw new Error('Login error detected on page');
            }
            
            await page.waitForTimeout(2000);
        }
        
        // Final check - even if timeout, check if we're on a success page
        const currentUrl = page.url();
        if (currentUrl.includes('runpayrollmain2') || currentUrl.includes('dashboard') || currentUrl.includes('home')) {
            console.log(`✅ Login appears successful despite timeout: ${currentUrl}`);
            return true;
        }
        
        throw new Error(`Login redirect timeout after ${timeout}ms`);
    }

    /**
     * Get selectors for specific application
     */
    getSelectorsForApplication(applicationType) {
        const appConfig = this.APPLICATION_ROUTING[applicationType];
        return appConfig.selectors || this.DEFAULT_SELECTORS;
    }

    /**
     * Validate authentication success
     */
    async validateAuthenticationSuccess(page, userType, environment, applicationType) {
        try {
            // Wait a moment for page to settle
            await page.waitForTimeout(3000);
            
            const currentUrl = page.url();
            
            // Check if still on signin page (failure indicator)
            if (currentUrl.includes('signin') || currentUrl.includes('login')) {
                // Check for error messages
                const errorSelectors = [
                    '.error', '.alert-danger', '[class*="error"]', '[id*="error"]',
                    'text="Invalid"', 'text="Incorrect"', 'text="Failed"'
                ];
                
                for (const selector of errorSelectors) {
                    try {
                        const errorElement = await page.$(selector);
                        if (errorElement) {
                            console.log(`❌ Found error indicator: ${selector}`);
                            return false;
                        }
                    } catch (e) {
                        // Continue checking other selectors
                    }
                }
                
                // Still on signin page without obvious errors - assume failure
                return false;
            }
            
            // Check for success indicators based on user type
            if (userType === 'CLIENT') {
                // Client users should see dashboard, main menu, or application content
                const successSelectors = [
                    '[data-testid*="dashboard"]', '.dashboard', '#dashboard',
                    '[data-testid*="main"]', '.main-content', '#main-content',
                    '.navigation', '.nav-menu', '.header-nav',
                    'text="Welcome"', 'text="Dashboard"', 'text="Home"'
                ];
                
                for (const selector of successSelectors) {
                    try {
                        const successElement = await page.$(selector);
                        if (successElement) {
                            console.log(`✅ Found success indicator: ${selector}`);
                            return true;
                        }
                    } catch (e) {
                        // Continue checking other selectors
                    }
                }
            } else if (userType === 'SERVICE_USER') {
                // Service users should see admin interface
                const adminSelectors = [
                    '.admin', '#admin', '[class*="admin"]',
                    '.service', '#service', '[class*="service"]',
                    'text="Administration"', 'text="Service"', 'text="Associate"'
                ];
                
                for (const selector of adminSelectors) {
                    try {
                        const adminElement = await page.$(selector);
                        if (adminElement) {
                            console.log(`✅ Found admin interface indicator: ${selector}`);
                            return true;
                        }
                    } catch (e) {
                        // Continue checking other selectors
                    }
                }
            }
            
            // If URL changed from signin, assume success
            return !currentUrl.includes('signin') && !currentUrl.includes('login');
            
        } catch (error) {
            console.log(`⚠️  Validation error: ${error.message}`);
            return false;
        }
    }

    /**
     * Take screenshot for debugging
     */
    async takeScreenshot(page, name) {
        if (!this.options.screenshots) return null;
        
        try {
            const fileName = `universal_auth_${name}_${this.timestamp}.png`;
            const screenshotDir = this.options.screenshotDir;
            await fs.ensureDir(screenshotDir);
            
            const filePath = path.join(screenshotDir, fileName);
            await page.screenshot({ path: filePath, fullPage: true });
            
            console.log(`📸 Screenshot saved: ${fileName}`);
            return fileName;
        } catch (error) {
            console.log(`⚠️  Screenshot failed: ${error.message}`);
            return null;
        }
    }

    /**
     * Record authentication attempt in history
     */
    recordAuthHistory(attempt) {
        this.authHistory.push(attempt);
        
        // Limit history size
        if (this.authHistory.length > 100) {
            this.authHistory = this.authHistory.slice(-50);
        }
    }

    /**
     * Load credentials from SBS_Automation data structure
     */
    async loadCredentialsFromSBSAutomation(environment, userType, applicationType) {
        try {
            const sbsDataPath = path.join(__dirname, '..', '..', 'SBS_Automation', 'data', environment.toLowerCase());
            
            if (userType === 'CLIENT') {
                if (applicationType === 'MAX' || applicationType === 'DTO') {
                    // Load MAX/DTO credentials
                    const dtoCredsPath = path.join(sbsDataPath, 'max', 'dtoLoginCreds.json');
                    if (await fs.pathExists(dtoCredsPath)) {
                        const dtoCreds = await fs.readJSON(dtoCredsPath);
                        return {
                            username: dtoCreds.username,
                            password: dtoCreds.password,
                            iid: dtoCreds.iid
                        };
                    }
                } else {
                    // Load RunMod credentials
                    const runmodCredsPath = path.join(sbsDataPath, 'runmod', 'loginCreds.json');
                    if (await fs.pathExists(runmodCredsPath)) {
                        const runmodCreds = await fs.readJSON(runmodCredsPath);
                        return {
                            username: runmodCreds.username,
                            password: runmodCreds.password,
                            iid: runmodCreds.iid,
                            ooid: runmodCreds.ooid,
                            aoid: runmodCreds.aoid
                        };
                    }
                }
            } else if (userType === 'SERVICE_USER') {
                // Load associate/service user credentials from config
                const configPath = path.join(sbsDataPath, 'config.json');
                if (await fs.pathExists(configPath)) {
                    const config = await fs.readJSON(configPath);
                    return {
                        username: config.runmodassociate_id,
                        password: config.runmodassociate_password
                    };
                }
            }
            
            return null;
        } catch (error) {
            console.log(`⚠️  Could not load SBS_Automation credentials: ${error.message}`);
            return null;
        }
    }

    /**
     * Authenticate with automatic credential loading
     */
    async authenticateWithAutoCredentials(page, targetUrl, userType, environment, applicationType) {
        console.log('🔍 Loading credentials automatically from SBS_Automation...');
        
        const credentials = await this.loadCredentialsFromSBSAutomation(environment, userType, applicationType);
        
        if (!credentials) {
            throw new Error(`No credentials found for ${userType} in ${environment} environment`);
        }
        
        console.log(`✅ Loaded credentials for ${userType} from SBS_Automation data`);
        
        return await this.performUniversalAuthentication(page, targetUrl, credentials);
    }

    /**
     * Batch authentication for multiple environments
     */
    async performBatchAuthentication(page, credentials, applications = ['RUN'], environments = ['QAFIT', 'IAT']) {
        console.log('\n🔄 BATCH AUTHENTICATION ACROSS ENVIRONMENTS');
        console.log('============================================');
        
        const results = [];
        
        for (const environment of environments) {
            for (const applicationType of applications) {
                try {
                    console.log(`\n🎯 Testing ${applicationType} in ${environment}...`);
                    
                    const userType = this.detectUserType(this.parseCredentials(credentials));
                    const loginUrl = this.constructLoginURL(userType, environment, applicationType, this.parseCredentials(credentials));
                    
                    const result = await this.performUniversalAuthentication(page, loginUrl, credentials);
                    
                    results.push({
                        environment,
                        applicationType,
                        userType,
                        success: result.success,
                        duration: result.duration,
                        error: result.error
                    });
                    
                    console.log(`${result.success ? '✅' : '❌'} ${applicationType} in ${environment}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
                    
                } catch (error) {
                    console.error(`❌ ${applicationType} in ${environment}: ERROR - ${error.message}`);
                    results.push({
                        environment,
                        applicationType,
                        userType: 'UNKNOWN',
                        success: false,
                        duration: 0,
                        error: error.message
                    });
                }
            }
        }
        
        return results;
    }

    /**
     * Generate authentication report
     */
    generateAuthenticationReport() {
        const report = {
            sessionId: this.sessionId,
            timestamp: this.timestamp,
            totalAttempts: this.authHistory.length,
            successfulAttempts: this.authHistory.filter(h => h.result.success).length,
            failedAttempts: this.authHistory.filter(h => h.result.success === false).length,
            environmentsCovered: [...new Set(this.authHistory.map(h => h.environment))],
            applicationsCovered: [...new Set(this.authHistory.map(h => h.applicationType))],
            userTypesCovered: [...new Set(this.authHistory.map(h => h.userType))],
            averageDuration: this.authHistory.length > 0 ? 
                Math.round(this.authHistory.reduce((sum, h) => sum + (h.result.duration || 0), 0) / this.authHistory.length) : 0,
            history: this.authHistory
        };

        console.log('\n📊 UNIVERSAL AUTHENTICATION REPORT');
        console.log('==================================');
        console.log(`🕒 Session: ${report.sessionId}`);
        console.log(`📈 Success Rate: ${report.totalAttempts > 0 ? ((report.successfulAttempts / report.totalAttempts) * 100).toFixed(1) : 0}%`);
        console.log(`🔄 Total Attempts: ${report.totalAttempts}`);
        console.log(`✅ Successful: ${report.successfulAttempts}`);
        console.log(`❌ Failed: ${report.failedAttempts}`);
        console.log(`🌍 Environments: ${report.environmentsCovered.join(', ')}`);
        console.log(`📱 Applications: ${report.applicationsCovered.join(', ')}`);
        console.log(`👥 User Types: ${report.userTypesCovered.join(', ')}`);
        console.log(`⏱️  Average Duration: ${report.averageDuration}ms`);

        return report;
    }

    /**
     * Save authentication report to file
     */
    async saveAuthenticationReport(outputDir = null) {
        const report = this.generateAuthenticationReport();
        
        const reportsDir = outputDir || path.join(__dirname, '..', 'reports');
        await fs.ensureDir(reportsDir);
        
        const fileName = `Universal_Auth_Report_${this.timestamp}.json`;
        const filePath = path.join(reportsDir, fileName);
        
        await fs.writeJSON(filePath, report, { spaces: 2 });
        
        console.log(`📄 Authentication report saved: ${fileName}`);
        return { report, filePath };
    }

}

module.exports = { UniversalAuthenticationHandler };

// CLI interface for testing
if (require.main === module) {
    console.log('🎯 UNIVERSAL AUTHENTICATION HANDLER - CLI MODE');
    console.log('===============================================');
    console.log('Usage examples:');
    console.log('');
    console.log('```javascript');
    console.log('const { UniversalAuthenticationHandler } = require("./universal-authentication-handler");');
    console.log('const auth = new UniversalAuthenticationHandler();');
    console.log('');
    console.log('// Auto-detect everything');
    console.log('await auth.performUniversalAuthentication(page, targetUrl, "username/password");');
    console.log('');
    console.log('// Batch test multiple environments');
    console.log('await auth.performBatchAuthentication(page, "username/password", ["RUN", "MAX"], ["QAFIT", "IAT"]);');
    console.log('');
    console.log('// Auto-load credentials from SBS_Automation');
    console.log('await auth.authenticateWithAutoCredentials(page, targetUrl, "CLIENT", "QAFIT", "RUN");');
    console.log('```');
    console.log('');
    console.log('🎯 THE BEST Universal Authentication Handler Features:');
    console.log('   ✅ Auto-detects user type, environment, and application');
    console.log('   ✅ Supports CLIENT and SERVICE_USER workflows');
    console.log('   ✅ Works across QAFIT, IAT, and PROD environments');
    console.log('   ✅ Handles RUN, MAX, WFN, DTO applications');
    console.log('   ✅ Comprehensive error handling and reporting');
    console.log('   ✅ Session caching and credential management');
    console.log('   ✅ Detailed screenshots and debugging');
    console.log('   ✅ SBS_Automation integration');
    console.log('   ✅ Batch authentication testing');
    console.log('   ✅ Universal compatibility');
    console.log('');
    console.log('📱 Supported Applications:');
    console.log('   🔹 RUN - RunMod Payroll');
    console.log('   🔹 MAX - Digital Tax Office');
    console.log('   🔹 WFN - Workforce Now');
    console.log('   🔹 DTO - Digital Tax Office');
    console.log('');
    console.log('🌍 Supported Environments:');
    console.log('   🔹 QAFIT - QA Functional Integration Testing');
    console.log('   🔹 IAT - Integration Acceptance Testing');
    console.log('   🔹 PROD - Production');
    console.log('');
    console.log('👥 Supported User Types:');
    console.log('   🔹 CLIENT - Business clients (Username@IID format)');
    console.log('   🔹 SERVICE_USER - Internal users (username@adp format)');
    console.log('');
    console.log('🎯 Authentication Matrix:');
    console.log('   CLIENT URLs: https://online-{env}.adp.com/signin/v1/?APPID={app}&productId={id}');
    console.log('   SERVICE URLs: https://runpayroll-{env}.es.ad.adp.com/admin/{app}/login.aspx');
}
