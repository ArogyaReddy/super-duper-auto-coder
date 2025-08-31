const { SmartLoginHandler } = require('./smart-login-handler');

/**
 * DEMO: Smart Login with Fresh Sessions
 * 
 * This demo showcases:
 * 1. Fresh session creation (no cached data)
 * 2. Intelligent security step detection
 * 3. Multiple runs capability (prevents session interference)
 * 4. Automated waiting for manual security completion
 */
async function demoSmartLoginWithFreshSessions() {
    console.log('🚀 DEMO: SMART LOGIN WITH FRESH SESSIONS');
    console.log('=========================================');
    console.log('');
    console.log('🎯 FEATURES DEMONSTRATED:');
    console.log('• Fresh browser session (no cached data from previous runs)');
    console.log('• Intelligent security step detection');
    console.log('• Automatic waiting for manual intervention when needed');
    console.log('• Session isolation for repeated automation runs');
    console.log('');
    console.log('🔄 SCENARIOS HANDLED:');
    console.log('1. No security step → Direct automation');
    console.log('2. Email verification → Wait for manual completion');
    console.log('3. Other security steps → Smart detection and waiting');
    console.log('');
    console.log('⏱️  Starting demo in 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const handler = new SmartLoginHandler();

    try {
        console.log('');
        console.log('🎬 EXECUTING SMART LOGIN DEMO');
        console.log('==============================');
        
        const result = await handler.performSmartLogin();
        
        console.log('');
        console.log('📊 DEMO RESULTS');
        console.log('===============');
        console.log(`✅ Success: ${result.success}`);
        console.log(`🔧 Method: ${result.method || 'N/A'}`);
        console.log(`🛡️  Security Step: ${result.securityStepRequired ? 'Required' : 'Not Required'}`);
        console.log(`🤖 Ready for Automation: ${result.readyForAutomation}`);
        console.log(`🧹 Fresh Session: ${result.sessionFresh}`);
        console.log(`🆔 Session ID: ${result.sessionId || 'N/A'}`);
        
        if (result.success) {
            console.log('');
            console.log('🎉 DEMO COMPLETED SUCCESSFULLY!');
            console.log('================================');
            console.log('✅ Login process handled intelligently');
            console.log('✅ Security steps detected and managed');
            console.log('✅ Fresh session ensured clean state');
            console.log('');
            console.log('💡 NEXT STEPS:');
            console.log('• You can now proceed with your automation');
            console.log('• The browser session is ready for testing');
            console.log('• Each new run will start with a fresh session');
            
            // Optional: Show ready state
            if (result.readyForAutomation) {
                console.log('');
                console.log('🚀 AUTOMATION READY!');
                console.log('====================');
                console.log('The browser is now logged in and ready for automated testing.');
                console.log('You can proceed with your test scripts.');
                
                // Show page status
                if (handler.page) {
                    const currentTitle = await handler.page.title();
                    const currentUrl = handler.page.url();
                    console.log('');
                    console.log('📊 Current Page Status:');
                    console.log(`   📄 Title: ${currentTitle}`);
                    console.log(`   🔗 URL: ${currentUrl}`);
                    console.log(`   🌐 Domain: ${new URL(currentUrl).hostname}`);
                }
            }
        } else {
            console.log('');
            console.log('❌ DEMO ENCOUNTERED ISSUES');
            console.log('===========================');
            console.log(`Error: ${result.error || 'Unknown error'}`);
            console.log('');
            console.log('🔧 TROUBLESHOOTING:');
            console.log('• Check network connectivity');
            console.log('• Verify credentials are correct');
            console.log('• Ensure ADP IAT environment is accessible');
        }

    } catch (error) {
        console.error('');
        console.error('💥 DEMO FAILED');
        console.error('===============');
        console.error(`Error: ${error.message}`);
        console.error('');
        console.error('� RECOVERY STEPS:');
        console.error('• Check system resources');
        console.error('• Verify Playwright installation');
        console.error('• Review browser permissions');
    } finally {
        // Keep browser open for inspection
        if (handler.page) {
            console.log('');
            console.log('🔍 Browser will stay open for inspection...');
            console.log('⏰ You have 30 seconds to examine the current state');
            await handler.page.waitForTimeout(30000);
        }
        
        // Cleanup
        await handler.cleanup();
        console.log('');
        console.log('🧹 CLEANUP COMPLETED');
        console.log('====================');
        console.log('Fresh session resources cleaned up.');
        console.log('System ready for next automation run.');
    }
}

// Additional demo function for multiple runs
async function demoMultipleRuns() {
    console.log('');
    console.log('🔄 DEMO: MULTIPLE FRESH SESSION RUNS');
    console.log('=====================================');
    console.log('This demo shows how fresh sessions prevent interference');
    console.log('between multiple automation runs.');
    console.log('');

    for (let i = 1; i <= 2; i++) {
        console.log(`🎭 RUN ${i}/2`);
        console.log('='.repeat(10));
        
        const handler = new SmartLoginHandler();
        
        try {
            const result = await handler.performSmartLogin();
            console.log(`✅ Run ${i} completed: ${result.success ? 'SUCCESS' : 'FAILED'}`);
            console.log(`🆔 Session ID: ${result.sessionId}`);
            console.log(`🧹 Fresh Session: ${result.sessionFresh}`);
        } catch (error) {
            console.log(`❌ Run ${i} failed: ${error.message}`);
        } finally {
            await handler.cleanup();
            console.log(`🧹 Run ${i} cleaned up`);
        }
        
        if (i < 2) {
            console.log('⏳ Waiting 5 seconds before next run...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            console.log('');
        }
    }
    
    console.log('');
    console.log('� MULTIPLE RUNS DEMO COMPLETED');
    console.log('================================');
    console.log('Each run used completely fresh sessions!');
    console.log('This prevents cached authentication from interfering.');
}

// Run the demo
if (require.main === module) {
    console.log('🎯 SELECT DEMO MODE:');
    console.log('====================');
    console.log('1. Single Smart Login Demo (default)');
    console.log('2. Multiple Runs Demo');
    console.log('');
    
    const runMode = process.argv[2] || '1';
    
    if (runMode === '2') {
        demoMultipleRuns()
            .then(() => {
                console.log('🏁 All demos completed successfully!');
                process.exit(0);
            })
            .catch(error => {
                console.error(`💥 Demo failed: ${error.message}`);
                process.exit(1);
            });
    } else {
        demoSmartLoginWithFreshSessions()
            .then(() => {
                console.log('🏁 Demo completed successfully!');
                process.exit(0);
            })
            .catch(error => {
                console.error(`💥 Demo failed: ${error.message}`);
                process.exit(1);
            });
    }
}

module.exports = { demoSmartLoginWithFreshSessions, demoMultipleRuns };
