#!/usr/bin/env node

/**
 * 🎯 REFERENCE SYSTEM CLI
 * 
 * Command-line interface for managing reference architecture solutions
 * 
 * Usage:
 *   node scripts/reference-system.js setup
 *   node scripts/reference-system.js test
 *   node scripts/reference-system.js health
 *   node scripts/reference-system.js cleanup
 */

const MasterReferenceManager = require('../src/utils/master-reference-manager');
const fs = require('fs');
const path = require('path');

class ReferenceSystemCLI {
    constructor() {
        this.manager = new MasterReferenceManager();
        this.commands = {
            setup: this.setupCommand.bind(this),
            test: this.testCommand.bind(this),
            health: this.healthCommand.bind(this),
            metrics: this.metricsCommand.bind(this),
            cleanup: this.cleanupCommand.bind(this),
            help: this.helpCommand.bind(this)
        };
    }

    /**
     * MAIN CLI ENTRY POINT
     */
    async run() {
        const args = process.argv.slice(2);
        const command = args[0] || 'help';
        const options = this.parseOptions(args.slice(1));

        console.log(`🎯 Auto-Coder Reference System CLI`);
        console.log(`Command: ${command}\n`);

        try {
            if (this.commands[command]) {
                await this.commands[command](options);
            } else {
                console.log(`❌ Unknown command: ${command}`);
                await this.helpCommand();
                process.exit(1);
            }
        } catch (error) {
            console.error(`❌ Command failed: ${error.message}`);
            process.exit(1);
        }
    }

    /**
     * SETUP COMMAND
     */
    async setupCommand(options) {
        console.log(`🚀 Setting up Reference System...`);

        const context = {
            performanceMode: options.mode || 'balanced',
            environmentId: options.env || 'cli-setup'
        };

        if (options.solution) {
            // Override automatic selection
            this.manager.config.preferredSolution = options.solution;
        }

        const result = await this.manager.setupReferenceSystem(context);

        console.log(`\n✅ Setup Complete!`);
        console.log(`Solution: ${result.solution}`);
        console.log(`Primary: ${result.isPrimary ? 'Yes' : 'No (fallback used)'}`);
        
        if (result.result.details) {
            console.log(`Details:`, JSON.stringify(result.result.details, null, 2));
        }

        // Save setup info for other commands
        this.saveSetupInfo(result);
    }

    /**
     * TEST COMMAND
     */
    async testCommand(options) {
        console.log(`🧪 Testing Reference System...`);

        // Find test artifacts
        const artifacts = this.findTestArtifacts(options.path || 'auto-coder/SBS_Automation');

        if (artifacts.length === 0) {
            console.log(`⚠️ No test artifacts found. Generate some artifacts first.`);
            return;
        }

        console.log(`Found ${artifacts.length} artifacts to test:`);
        artifacts.forEach(a => console.log(`  - ${a.type}: ${a.path}`));

        const testOptions = {
            tags: options.tags,
            environmentId: options.env || 'cli-test'
        };

        const results = await this.manager.executeTests(artifacts, testOptions);

        console.log(`\n🧪 Test Results:`);
        console.log(`Overall: ${results.success ? '✅ PASS' : '❌ FAIL'}`);
        
        results.results.forEach(result => {
            const status = result.success ? '✅' : '❌';
            console.log(`  ${status} ${path.basename(result.artifact)}`);
            if (!result.success) {
                console.log(`     Error: ${result.error}`);
            }
        });
    }

    /**
     * HEALTH COMMAND
     */
    async healthCommand(options) {
        console.log(`🏥 Checking Reference System Health...`);

        const health = await this.manager.healthCheck();

        console.log(`\nHealth Status: ${this.getStatusEmoji(health.status)} ${health.status}`);
        
        if (health.message) {
            console.log(`Message: ${health.message}`);
        }

        if (health.details) {
            console.log(`Details:`);
            if (health.details.checks) {
                health.details.checks.forEach(check => {
                    const status = check.status === 'PASS' ? '✅' : '❌';
                    console.log(`  ${status} ${check.name}`);
                    if (check.details) {
                        console.log(`     ${check.details}`);
                    }
                });
            }
        }

        if (health.issues && health.issues.length > 0) {
            console.log(`\nIssues:`);
            health.issues.forEach(issue => console.log(`  ⚠️ ${issue}`));
        }
    }

    /**
     * METRICS COMMAND
     */
    async metricsCommand(options) {
        console.log(`📊 Reference System Metrics...`);

        const metrics = this.manager.getMetricsReport();

        console.log(`\nCurrent Solution: ${metrics.currentSolution || 'None'}`);

        if (Object.keys(metrics.usage).length > 0) {
            console.log(`\nUsage Statistics:`);
            for (const [solution, count] of Object.entries(metrics.usage)) {
                console.log(`  ${solution}: ${count} uses`);
            }
        }

        if (Object.keys(metrics.successRates).length > 0) {
            console.log(`\nSuccess Rates:`);
            for (const [solution, stats] of Object.entries(metrics.successRates)) {
                console.log(`  ${solution}: ${stats.rate} (${stats.successful}/${stats.total})`);
            }
        }

        if (Object.keys(metrics.performance).length > 0) {
            console.log(`\nPerformance (avg time):`);
            for (const [solution, perf] of Object.entries(metrics.performance)) {
                console.log(`  ${solution}: ${perf.avgTime}ms`);
            }
        }

        if (metrics.recommendations.length > 0) {
            console.log(`\nRecommendations:`);
            metrics.recommendations.forEach(rec => {
                const emoji = rec.severity === 'warning' ? '⚠️' : 'ℹ️';
                console.log(`  ${emoji} ${rec.message}`);
            });
        }
    }

    /**
     * CLEANUP COMMAND
     */
    async cleanupCommand(options) {
        console.log(`🧹 Cleaning up Reference System...`);

        await this.manager.cleanup();

        // Remove setup info file
        const setupInfoPath = 'auto-coder/temp/setup-info.json';
        if (fs.existsSync(setupInfoPath)) {
            fs.unlinkSync(setupInfoPath);
        }

        console.log(`✅ Cleanup complete!`);
    }

    /**
     * HELP COMMAND
     */
    async helpCommand() {
        console.log(`
🎯 Auto-Coder Reference System CLI

COMMANDS:
  setup [options]    Set up the reference system
  test [options]     Test generated artifacts
  health            Check system health
  metrics           Show usage metrics
  cleanup           Clean up all systems
  help              Show this help

SETUP OPTIONS:
  --solution <name>  Force specific solution (path-resolver, auto-deploy, symlink, virtual)
  --mode <mode>      Performance mode (fast, balanced, safe)
  --env <id>         Environment ID

TEST OPTIONS:
  --path <path>      Path to artifacts (default: auto-coder/SBS_Automation)
  --tags <tags>      Cucumber tags to run
  --env <id>         Environment ID

EXAMPLES:
  node scripts/reference-system.js setup --solution symlink --mode fast
  node scripts/reference-system.js test --tags "@Generated"
  node scripts/reference-system.js health
  node scripts/reference-system.js cleanup

SOLUTIONS:
  path-resolver      Smart path resolution (default, most compatible)
  auto-deploy        Automatic deployment-based testing
  symlink           Symbolic link system (fastest, requires admin on Windows)
  virtual           Virtual environment isolation (most flexible)
`);
    }

    /**
     * PARSE OPTIONS
     */
    parseOptions(args) {
        const options = {};
        
        for (let i = 0; i < args.length; i += 2) {
            const key = args[i]?.replace(/^--/, '');
            const value = args[i + 1];
            
            if (key && value) {
                options[key] = value;
            }
        }
        
        return options;
    }

    /**
     * FIND TEST ARTIFACTS
     */
    findTestArtifacts(basePath) {
        const artifacts = [];
        
        // Find feature files
        const featuresPath = path.join(basePath, 'features');
        if (fs.existsSync(featuresPath)) {
            const featureFiles = fs.readdirSync(featuresPath)
                .filter(f => f.endsWith('.feature'))
                .map(f => ({
                    type: 'feature',
                    path: path.join(featuresPath, f),
                    name: f
                }));
            artifacts.push(...featureFiles);
        }
        
        return artifacts;
    }

    /**
     * SAVE SETUP INFO
     */
    saveSetupInfo(result) {
        const setupInfo = {
            solution: result.solution,
            timestamp: new Date().toISOString(),
            isPrimary: result.isPrimary,
            details: result.result
        };
        
        const setupInfoPath = 'auto-coder/temp/setup-info.json';
        fs.mkdirSync(path.dirname(setupInfoPath), { recursive: true });
        fs.writeFileSync(setupInfoPath, JSON.stringify(setupInfo, null, 2));
    }

    /**
     * GET STATUS EMOJI
     */
    getStatusEmoji(status) {
        const emojiMap = {
            'HEALTHY': '✅',
            'UNHEALTHY': '❌',
            'INACTIVE': '⚪',
            'UNKNOWN': '❓'
        };
        
        return emojiMap[status] || '❓';
    }
}

// Run CLI if called directly
if (require.main === module) {
    const cli = new ReferenceSystemCLI();
    cli.run().catch(error => {
        console.error(`Fatal error: ${error.message}`);
        process.exit(1);
    });
}

module.exports = ReferenceSystemCLI;
