#!/usr/bin/env node

/**
 * 🧹 AUTO-CODER CLEANUP CLI
 * Command-line interface for cleaning generated test artifacts
 */

const ArtifactCleaner = require('../src/utils/artifact-cleaner');

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const target = args[1];
    
    const cleaner = new ArtifactCleaner('./SBS_Automation');
    
    try {
        switch (command) {
            case 'all':
            case 'clean':
                console.log('🧹 AUTO-CODER CLEANUP');
                console.log('=====================');
                await cleaner.cleanAll();
                break;
                
            case 'specific':
                if (!target) {
                    console.error('❌ Usage: npm run cleanup specific <artifact-name>');
                    process.exit(1);
                }
                console.log('🎯 AUTO-CODER SPECIFIC CLEANUP');
                console.log('===============================');
                await cleaner.cleanSpecific(target);
                break;
                
            case 'list':
                console.log('📋 AUTO-CODER ARTIFACTS LIST');
                console.log('=============================');
                await cleaner.listArtifacts();
                break;
                
            case 'backup':
                console.log('💾 AUTO-CODER BACKUP');
                console.log('====================');
                const backupPath = await cleaner.backupArtifacts();
                console.log(`✅ Artifacts backed up to: ${backupPath}`);
                break;
                
            case 'backup-clean':
                console.log('💾🧹 AUTO-CODER BACKUP & CLEAN');
                console.log('===============================');
                await cleaner.backupArtifacts();
                await cleaner.cleanAll();
                break;
                
            default:
                console.log('🧹 AUTO-CODER CLEANUP UTILITY');
                console.log('==============================');
                console.log('');
                console.log('📋 Available Commands:');
                console.log('  npm run cleanup all          - Clean all generated artifacts');
                console.log('  npm run cleanup specific <name> - Clean specific artifact');
                console.log('  npm run cleanup list         - List all generated artifacts');
                console.log('  npm run cleanup backup       - Backup artifacts');
                console.log('  npm run cleanup backup-clean - Backup then clean all');
                console.log('');
                console.log('🛡️ Protected Files (Never Deleted):');
                console.log('  - support/base-page.js');
                console.log('  - support/hooks.js');
                console.log('  - support/world.js');
                console.log('  - steps/common-steps.js');
                console.log('');
                console.log('🗑️ Cleaned Files:');
                console.log('  - All .feature files');
                console.log('  - Generated *-steps.js files');
                console.log('  - Generated *-page.js files');
                break;
        }
    } catch (error) {
        console.error('❌ Cleanup failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
