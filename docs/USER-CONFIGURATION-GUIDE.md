# 🚀 User Configuration Guide for Role-Based Testing

## 📋 Overview

This guide helps you configure user accounts for role-based testing in the Auto-Coder framework. Before running any role-based utilities (broken link checker, API fuzzer, etc.), you need to set up your test users.

## 📁 Configuration File Location

```
/Users/arog/auto/auto/qa_automation/auto-coder/config/test-users-config.json
```

## 🔧 Step-by-Step Setup

### 1. Edit the Configuration File

Open the configuration file and update the following sections:

#### A. Environment Settings
```json
{
    "testEnvironment": {
        "baseUrl": "https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=YOUR_PRODUCT_ID",
        "environment": "IAT",
        "clientIID": "YOUR_CLIENT_ID"
    }
}
```

**Update:**
- `baseUrl`: Your ADP login URL with correct APPID and productId
- `clientIID`: Your company's client ID (appears in usernames)

#### B. User Roles Configuration
```json
{
    "userRoles": {
        "Owner": {
            "role": "1",
            "username": "YourOwner@YOUR_CLIENT_ID",
            "password": "YourPassword",
            "description": "Company Owner - Full Access",
            "permissions": ["all"],
            "testScenarios": ["broken-links", "smoke-test", "regression"]
        },
        "PayrollAdmin": {
            "role": "25",
            "username": "YourPayrollAdmin@YOUR_CLIENT_ID",
            "password": "YourPassword",
            "description": "Payroll Administrator",
            "permissions": ["payroll", "reports", "employee-management"],
            "testScenarios": ["payroll-tests", "broken-links"]
        }
    }
}
```

**For Each Role, Update:**
- `username`: Your actual test user credentials
- `password`: Your actual test user passwords
- Keep the `role` numbers as they match ADP role IDs
- Customize `description` if needed

### 2. Available Roles

The framework supports these roles out of the box:

| Role Name | Role ID | Description |
|-----------|---------|-------------|
| Owner | 1 | Company Owner - Full Access |
| PayrollAdmin | 25 | Payroll Administrator |
| HRAdmin | 26 | HR Administrator |
| HR411Only | 27 | HR 411 Limited Access |
| PayrollHRAdmin | 28 | Combined Payroll and HR Admin |
| ClientUpdate | 30 | Client Update Access |
| CPAView | 35 | CPA View Only Access |
| ServiceUser | 100 | Service User - System Integration |
| ReadOnlyUser | 67 | Read Only Access |

### 3. Add Custom Roles

To add new roles, follow this pattern:

```json
"YourCustomRole": {
    "role": "ROLE_NUMBER",
    "username": "CustomUser@YOUR_CLIENT_ID",
    "password": "YourPassword",
    "description": "Custom Role Description",
    "permissions": ["permission1", "permission2"],
    "testScenarios": ["applicable-tests"]
}
```

## 🧪 Testing Your Configuration

### 1. Validate Configuration
```bash
cd /Users/arog/auto/auto/qa_automation/auto-coder
node utils/validate-user-config.js
```

### 2. Test Login for Specific Role
```bash
node utils/test-role-login.js --role Owner
```

### 3. Test All Configured Roles
```bash
node utils/test-all-roles.js
```

## 🔐 Security Best Practices

### 1. Use Test Accounts Only
- Never use production user accounts
- Create dedicated test users in your test environment
- Use strong, unique passwords

### 2. Environment Separation
- Keep separate config files for different environments
- Use environment variables for sensitive data (optional)

### 3. Access Control
- Limit access to the config file
- Don't commit passwords to version control
- Rotate test passwords regularly

## 🚀 Using Role-Based Testing

Once configured, you can use role-based testing in the CLI:

### 1. Start the CLI
```bash
cd /Users/arog/auto/auto/qa_automation/auto-coder
node bin/interactive-cli.js
```

### 2. Navigate to Utilities
- Select option 6: "🔧 Utilities & Tools"

### 3. Choose a Utility
- Option 1: Broken Link Checker
- Option 2: API Fuzzer
- Option 3: DOM Change Detector
- Option 4: Performance Benchmark
- Option 5: Accessibility Checker

### 4. Select Testing Mode
For each utility, you'll see these options:
1. **Test with specific role** - Login as one role and test
2. **Test multiple roles comparison** - Compare results across roles
3. **Test all configured roles** - Test with every role in your config
4. **Test public endpoint** - No authentication (legacy mode)

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Role not found" Error
```
Error: Role 'Owner' not found. Available roles: PayrollAdmin, HRAdmin
```
**Solution:** Check role name spelling and ensure it exists in your config

#### 2. "Login failed" Error
**Solution:** Verify username/password are correct and user exists in your environment

#### 3. "Configuration not loaded" Error
**Solution:** Check file path and JSON syntax in config file

#### 4. "https:" appearing as username
**Solution:** This was a bug that's now fixed. Make sure you have the latest version.

### Validation Commands

```bash
# Check if config file exists and is valid JSON
node -e "console.log(JSON.parse(require('fs').readFileSync('./config/test-users-config.json')))"

# List all configured roles
node -e "const cfg=JSON.parse(require('fs').readFileSync('./config/test-users-config.json')); console.log(Object.keys(cfg.userRoles))"

# Check specific role configuration
node -e "const cfg=JSON.parse(require('fs').readFileSync('./config/test-users-config.json')); console.log(cfg.userRoles.Owner)"
```

## 📞 Support

If you encounter issues:

1. Check this guide first
2. Validate your JSON syntax
3. Test individual role logins
4. Check console output for detailed error messages
5. Ensure your test environment is accessible

## 🎯 Quick Start Checklist

- [ ] Update `clientIID` in testEnvironment
- [ ] Update `baseUrl` with correct productId
- [ ] Configure at least one role (Owner recommended)
- [ ] Update usernames with your client ID format
- [ ] Set correct passwords for test users
- [ ] Test configuration with validation command
- [ ] Run CLI and test broken link checker
- [ ] Verify role-based authentication works

---

**Happy Testing! 🚀**
