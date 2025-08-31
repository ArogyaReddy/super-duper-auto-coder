
## Integration with Interactive CLI

Your role-based testing framework can integrate seamlessly with your existing Interactive CLI in two ways:

### Option 1: Add to Existing "Execute Features & Tests" Menu (Recommended)

Your current Execute menu has 8 options. We can add role-based testing as option 9:

```
🚀 EXECUTE FEATURES & TESTS

1. 🎯 Run All Generated Features
2. 📄 Run Single Feature File
3. 🏷️ Run by Tags (@smoke, @critical, etc.)
4. 👥 Run by Team (@Team:AutoCoder)
5. 🔄 Run in Parallel (4 threads)
6. 🎭 Run with Custom Parameters
7. 🔁 Re-run Failed Tests
8. 👤 Run Role-Based Tests (NEW)
9. 🔙 Back to Main Menu
```

### Option 2: Add as Main Menu Item

Alternatively, add it as the 9th option in your main menu:

```
🎯 AUTO-CODER INTERACTIVE CLI

1. 🎨 Generate Features & Tests
2. 🚀 Execute Features & Tests
3. 📊 View Reports & Results
4. 🏗️ Framework Management
5. 🎭 Demo Mode
6. 📚 Help & Documentation
7. 👤 Role-Based Testing (NEW)
8. ❌ Exit
```

## Navigation Flow

Here's how users would navigate to use role-based testing:

### Flow 1: Via Execute Menu (Recommended)
```
Start → Main Menu → "Execute Features & Tests" → "Run Role-Based Tests" → Role Selection → Test Execution
```

### Flow 2: Via Main Menu
```
Start → Main Menu → "Role-Based Testing" → Role Selection → Test Execution
```

## Usage Examples

### Standalone CLI Usage (Current)
```bash
# Direct command line usage
node utils/test-framework.js --role PayrollAdmin --scenario broken-links
node utils/test-framework.js --multi-role Owner,PayrollAdmin,HRAdmin
node utils/test-framework.js --list-roles
```

### Interactive CLI Integration Usage
```
1. Start Interactive CLI: node bin/interactive-cli.js
2. Navigate to Execute menu (option 2)
3. Select "Run Role-Based Tests" (option 8)
4. Choose from role-based testing submenu:
   - Single Role Testing
   - Multi-Role Testing
   - List Available Roles
   - View Test Scenarios
   - Configure Users
```

## Implementation Integration

To integrate this with your existing Interactive CLI, you would add a method like:

```javascript
async showRoleBasedTestingMenu() {
    console.log(chalk.blue.bold('\n👤 ROLE-BASED TESTING'));
    console.log(chalk.gray('Execute tests using configured user roles\n'));

    const choices = [
        '👤 Single Role Test',
        '👥 Multi-Role Test', 
        '📋 List Available Roles',
        '🎯 View Test Scenarios',
        '⚙️ Configure Users',
        '🔙 Back to Execute Menu'
    ];

    // ... menu handling logic
}
```

## Key Benefits of This Integration

1. **Seamless Workflow**: Role-based testing fits naturally into your existing test execution workflow
2. **Environment Compatibility**: Uses the same environment selection (FIT/IAT/PROD/LOCAL) as your other tests
3. **Consistent UI**: Maintains the same chalk styling and menu structure
4. **Flexible Access**: Available both as standalone CLI and integrated menu option

## Current File Structure Support
Your role-based testing utilities are already properly organized:
- test-users-config.json - User configurations
- `utils/user-config-manager.js` - Configuration management
- `utils/role-based-broken-links-test.js` - Testing engine
- `utils/test-framework.js` - Standalone CLI interface

Would you like me to show you the specific code modifications needed to integrate this into your Interactive CLI, or would you prefer to see how to extend the role-based testing framework with additional features?