# 🛡️ Context Preservation Strategy for New VS Code Sessions

## Overview
This strategy ensures you can start new chat/agent sessions without losing context, speed, or implementation quality.

## 🚀 Quick Start for New Sessions
1. **Open this folder first**: Always start by opening the `new-session` folder in VS Code
2. **Read the README**: Start with `SESSION-README.md` for immediate context
3. **Use the checklist**: Follow `QUICK-RESTORE-CHECKLIST.md` step by step
4. **Run health check**: Execute `session-health-check.ps1` or `session-health-check.sh`

## 📁 Essential Files Structure
```
new-session/
├── CONTEXT-PRESERVATION-STRATEGY.md (this file)
├── SESSION-README.md (immediate context summary)
├── QUICK-RESTORE-CHECKLIST.md (step-by-step restore guide)
├── SESSION-LAST-CONVERSATION.md (recent conversation summary)
├── FRAMEWORK-STATUS.md (current framework state)
├── PROMPT-FILES-REFERENCE.md (all prompt files location)
├── SBS-AUTOMATION-PATTERNS.md (framework compliance patterns)
├── COMMON-ISSUES-SOLUTIONS.md (troubleshooting guide)
├── AUTOMATION-SCRIPTS/
│   ├── restore-context.ps1
│   ├── restore-context.sh
│   ├── session-health-check.ps1
│   └── session-health-check.sh
└── REFERENCE-FILES/
    ├── key-generator-logic.js
    ├── sample-requirements.txt
    ├── sample-feature.feature
    ├── sample-steps.js
    └── sample-page.js
```

## 🎯 Core Principles
1. **Centralized Context**: All essential information in one place
2. **Self-Contained**: New session folder has everything needed
3. **Quick Validation**: Scripts to verify completeness
4. **Reference Examples**: Sample files for pattern matching
5. **Automation Ready**: Scripts for rapid context restoration

## 🔧 Maintenance
- Update after major framework changes
- Refresh before starting critical work sessions
- Keep conversation summaries current
- Validate all scripts work properly

## 🚨 Emergency Restore
If context is lost or corrupted:
1. Run `restore-context.ps1` or `restore-context.sh`
2. Follow `QUICK-RESTORE-CHECKLIST.md`
3. Verify with `session-health-check.ps1`
4. Start with `SESSION-README.md`

## ⚡ Performance Tips
- Close unnecessary VS Code tabs before starting
- Disable heavy extensions temporarily
- Use only files in `new-session` for context
- Clear VS Code workspace cache if needed

This strategy guarantees you never lose context or speed in new agent sessions.
