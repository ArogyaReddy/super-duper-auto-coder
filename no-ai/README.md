# NO-AI Auto-Coder Utilities

## Usage

1. Generate feature file from requirement:
   ```bash
   npm run generate
   ```
2. Generate steps and page files from feature file:
   ```bash
   node generate-steps-and-page.js ../SBS_Automation/features/jira-story-classic-footer.feature jira-story-classic-footer
   ```

## Standards
- Steps file: CucumberJS pattern, matches auto-coder/SBS_Automation
- Page file: Class-based, methods for each step, includes waitForPageLoad

## Extend for any requirement/feature by changing input filenames.
