/**
 * ADP Login Page Inspector
 * Diagnoses the actual structure of ADP login pages to understand form fields
 */

const { chromium } = require('playwright');

class ADPPageInspector {
  constructor() {
    this.environments = {
      iat: 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c',
      prod: 'https://online.adp.com/signin/v1/?APPID=RUN'
    };
  }

  async inspectPage(environment = 'iat') {
    console.log(`🔍 Inspecting ADP ${environment.toUpperCase()} login page structure...\n`);
    
    const browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-web-security']
    });
    
    const page = await browser.newPage();
    
    try {
      const url = this.environments[environment];
      console.log(`🔗 Loading: ${url}`);
      
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(5000);
      
      console.log(`✅ Page loaded: ${page.url()}\n`);
      
      // Inspect page title and basic info
      const title = await page.title();
      console.log(`📄 Page Title: ${title}`);
      
      // Find all input fields
      console.log('\n🎯 ALL INPUT FIELDS:');
      console.log('=' .repeat(50));
      
      const inputs = await page.locator('input').all();
      for (let i = 0; i < inputs.length; i++) {
        try {
          const input = inputs[i];
          const type = await input.getAttribute('type') || 'text';
          const name = await input.getAttribute('name') || 'no-name';
          const id = await input.getAttribute('id') || 'no-id';
          const placeholder = await input.getAttribute('placeholder') || 'no-placeholder';
          const className = await input.getAttribute('class') || 'no-class';
          const value = await input.getAttribute('value') || 'no-value';
          const isVisible = await input.isVisible();
          
          console.log(`Input ${i + 1}:`);
          console.log(`  Type: ${type}`);
          console.log(`  Name: ${name}`);
          console.log(`  ID: ${id}`);
          console.log(`  Placeholder: ${placeholder}`);
          console.log(`  Class: ${className}`);
          console.log(`  Value: ${value}`);
          console.log(`  Visible: ${isVisible}`);
          console.log('');
          
        } catch (e) {
          console.log(`Input ${i + 1}: Error reading attributes - ${e.message}`);
        }
      }
      
      // Find all buttons
      console.log('\n🎯 ALL BUTTONS:');
      console.log('=' .repeat(50));
      
      const buttons = await page.locator('button').all();
      for (let i = 0; i < buttons.length; i++) {
        try {
          const button = buttons[i];
          const type = await button.getAttribute('type') || 'button';
          const text = await button.textContent() || 'no-text';
          const className = await button.getAttribute('class') || 'no-class';
          const id = await button.getAttribute('id') || 'no-id';
          const isVisible = await button.isVisible();
          
          console.log(`Button ${i + 1}:`);
          console.log(`  Type: ${type}`);
          console.log(`  Text: ${text.trim()}`);
          console.log(`  Class: ${className}`);
          console.log(`  ID: ${id}`);
          console.log(`  Visible: ${isVisible}`);
          console.log('');
          
        } catch (e) {
          console.log(`Button ${i + 1}: Error reading attributes - ${e.message}`);
        }
      }
      
      // Find all forms
      console.log('\n🎯 ALL FORMS:');
      console.log('=' .repeat(50));
      
      const forms = await page.locator('form').all();
      for (let i = 0; i < forms.length; i++) {
        try {
          const form = forms[i];
          const action = await form.getAttribute('action') || 'no-action';
          const method = await form.getAttribute('method') || 'no-method';
          const className = await form.getAttribute('class') || 'no-class';
          const id = await form.getAttribute('id') || 'no-id';
          
          console.log(`Form ${i + 1}:`);
          console.log(`  Action: ${action}`);
          console.log(`  Method: ${method}`);
          console.log(`  Class: ${className}`);
          console.log(`  ID: ${id}`);
          console.log('');
          
        } catch (e) {
          console.log(`Form ${i + 1}: Error reading attributes - ${e.message}`);
        }
      }
      
      // Get page HTML structure for key areas
      console.log('\n🎯 PAGE STRUCTURE:');
      console.log('=' .repeat(50));
      
      try {
        const bodyHTML = await page.locator('body').innerHTML();
        
        // Look for specific patterns
        const patterns = [
          'input[type="email"]',
          'input[type="text"]',
          'input[type="password"]',
          'input[name*="user"]',
          'input[name*="email"]',
          'input[name*="login"]',
          'input[placeholder*="user"]',
          'input[placeholder*="email"]',
          'input[placeholder*="company"]'
        ];
        
        console.log('Key selectors found:');
        for (const pattern of patterns) {
          try {
            const elements = await page.locator(pattern).all();
            if (elements.length > 0) {
              console.log(`✅ ${pattern}: ${elements.length} element(s) found`);
            }
          } catch (e) {
            // Pattern not found
          }
        }
        
      } catch (e) {
        console.log(`Error analyzing page structure: ${e.message}`);
      }
      
      // Take a screenshot for visual inspection
      try {
        const screenshotPath = `/Users/arog/auto/auto/qa_automation/auto-coder/temp/adp-${environment}-login-page.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`\n📸 Screenshot saved: ${screenshotPath}`);
      } catch (e) {
        console.log(`Screenshot failed: ${e.message}`);
      }
      
      // Wait for manual inspection
      console.log('\n⏳ Waiting 15 seconds for manual inspection...');
      await page.waitForTimeout(15000);
      
      return {
        success: true,
        url: page.url(),
        title: title,
        inputCount: inputs.length,
        buttonCount: buttons.length,
        formCount: forms.length
      };
      
    } catch (error) {
      console.error(`❌ Inspection failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
      
    } finally {
      await browser.close();
    }
  }
}

// Run inspection
async function runInspection() {
  const inspector = new ADPPageInspector();
  
  console.log('🔬 ADP Login Page Structure Inspector\n');
  
  try {
    const result = await inspector.inspectPage('iat');
    
    console.log('\n📊 INSPECTION SUMMARY:');
    console.log('=' .repeat(50));
    
    if (result.success) {
      console.log(`✅ Page loaded successfully`);
      console.log(`📄 Title: ${result.title}`);
      console.log(`🔗 URL: ${result.url}`);
      console.log(`📝 Input fields: ${result.inputCount}`);
      console.log(`🔘 Buttons: ${result.buttonCount}`);
      console.log(`📋 Forms: ${result.formCount}`);
      
      console.log('\n💡 NEXT STEPS:');
      console.log('1. Check the screenshot for visual layout');
      console.log('2. Use the field information above to update login selectors');
      console.log('3. Test with the discovered selectors');
      
    } else {
      console.log(`❌ Inspection failed: ${result.error}`);
    }
    
  } catch (error) {
    console.error(`💥 Inspector error: ${error.message}`);
  }
}

// Export for use in other modules
module.exports = { ADPPageInspector, runInspection };

// Run if executed directly
if (require.main === module) {
  runInspection()
    .then(() => {
      console.log('\n🏁 Inspection completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error(`💥 Inspection failed: ${error.message}`);
      process.exit(1);
    });
}
