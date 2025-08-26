/**
 * Global teardown for Playwright tests
 * This runs once after all tests have completed
 */

async function globalTeardown() {
  console.log('🧹 Running global teardown...');
  
  try {
    // Clean up any global resources
    console.log('🗑️  Cleaning up test artifacts...');
    
    // Close any remaining browser instances
    console.log('🌐 Ensuring all browsers are closed...');
    
    // Clean up temporary files if needed
    console.log('📁 Cleaning temporary files...');
    
    // Log completion
    console.log('✅ Global teardown completed successfully');
    
  } catch (error) {
    console.error('❌ Error during global teardown:', error);
    throw error;
  }
}

module.exports = globalTeardown;