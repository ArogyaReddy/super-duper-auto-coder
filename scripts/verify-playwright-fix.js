#!/usr/bin/env node

/**
 * Playwright Recording - Quick Verification Test
 * Tests if the recording functionality is working
 */

const PlaywrightCodeGenAdapter = require('../src/adapters/playwright-codegen-adapter');

async function verifyPlaywrightRecording() {
    console.log('🧪 Verifying Playwright Recording Fix');
    console.log('=====================================\n');

    try {
        const adapter = new PlaywrightCodeGenAdapter();
        
        console.log('1. Initializing Playwright adapter...');
        await adapter.initialize();
        console.log('   ✅ Adapter initialized successfully');
        
        console.log('\n2. Testing recording functionality...');
        const result = await adapter.startRecording({
            url: 'https://example.com',
            browser: 'chromium'
        });
        
        if (result.success) {
            console.log('   ✅ Recording session started successfully');
            console.log(`   📄 Output file: ${result.outputFile}`);
            
            // Wait a moment then stop
            setTimeout(async () => {
                const stopResult = await adapter.stopRecording();
                if (stopResult.success) {
                    console.log('   ✅ Recording stopped successfully');
                } else {
                    console.log(`   ⚠️  Stop recording issue: ${stopResult.error}`);
                }
            }, 3000);
            
        } else {
            console.log(`   ❌ Recording failed: ${result.error}`);
            console.log('\n💡 Troubleshooting:');
            console.log('   1. Install Playwright: npm install @playwright/test playwright');
            console.log('   2. Install browsers: npx playwright install');
        }
        
    } catch (error) {
        console.log(`❌ Verification failed: ${error.message}`);
        console.log('\n💡 Run this to fix:');
        console.log('   npm install @playwright/test playwright');
        console.log('   npx playwright install');
    }
}

verifyPlaywrightRecording().catch(console.error);
