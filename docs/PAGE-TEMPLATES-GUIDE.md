# 🎯 GLOBAL PAGE TEMPLATES - WORK FOR ANY PAGE AFTER LOGIN

## **THREE WAYS TO CREATE PAGE CONFIGS**

---

## 🚀 **METHOD 1: INTERACTIVE GENERATOR (EASIEST)**

```bash
# Run the generator and answer questions
node scripts/generate-template.js
```

**It will ask you:**
- App URL and credentials
- Page name 
- Menu type (Shadow DOM level 1, 2, direct, iframe)
- Menu selector
- Elements to capture

**Generates complete config automatically!**

---

## 📋 **METHOD 2: COPY SIMPLE TEMPLATE**

```bash
# Copy the simple template
cp scripts/page-template-simple.json scripts/my-page-config.json

# Edit 4 key sections:
vim scripts/my-page-config.json
```

**Edit these sections:**
1. **baseUrl** - Your app URL
2. **credentials** - Username/password  
3. **selector in navigationSteps** - Your menu selector
4. **elementsToCapture** - List of elements you want

---

## 🔧 **METHOD 3: USE DETAILED TEMPLATE**

```bash
# Copy the detailed template with examples
cp scripts/global-page-template.json scripts/my-page-config.json

# It includes examples and tips
vim scripts/my-page-config.json
```

**Has examples for:**
- Billing pages
- User profile pages  
- Admin pages
- All common patterns

---

## 🎯 **COMMON PATTERNS FOR YOUR APP**

### **Shadow DOM Level 1 (Most Common):**
```json
{
  "type": "click",
  "selector": "[data-id='menu-name']",
  "context": {
    "shadow": true,
    "shadowHost": "sfc-shell-left-nav",
    "shadowDepth": 1
  }
}
```

### **Shadow DOM Level 2 (Nested Menus):**
```json
{
  "type": "click", 
  "selector": "[data-id='submenu-name']",
  "context": {
    "shadow": true,
    "shadowHost": "sfc-shell-left-nav",
    "shadowRoot": "li:nth-child(2) > sfc-shell-left-nav-section",
    "shadowDepth": 2
  }
}
```

### **iFrame Elements:**
```json
{
  "type": "click",
  "selector": "[data-test-id='element']", 
  "context": {
    "iframe": "#shell"
  }
}
```

### **User Profile Menu:**
```json
{
  "type": "click",
  "selector": ".logged-in-user",
  "context": {
    "shadow": true,
    "shadowHost": "oneux-header > sfc-shell-app-bar", 
    "shadowDepth": 1
  }
}
```

---

## 📝 **MINIMAL WORKING EXAMPLE**

```json
{
  "baseUrl": "https://your-app.com",
  "credentials": {
    "username": "test@example.com",
    "password": "password123"
  },
  "pageFileName": "my-page.js",
  
  "navigationSteps": [
    {
      "type": "wait",
      "description": "Wait for app to load", 
      "duration": 3000
    },
    {
      "type": "click",
      "description": "Click menu",
      "selector": "[data-id='my-menu']",
      "context": {
        "shadow": true,
        "shadowHost": "sfc-shell-left-nav",
        "shadowDepth": 1
      }
    },
    {
      "type": "wait",
      "description": "Wait for page", 
      "duration": 2000
    }
  ],
  
  "elementsToCapture": [
    { "description": "Page Header" },
    { "description": "Save Button" }
  ]
}
```

---

## 🚀 **WORKFLOW**

### **Option A: Interactive (Recommended)**
```bash
# 1. Generate config interactively
node scripts/generate-template.js

# 2. Run capture with generated config  
node scripts/one-command-advanced.js my-page-config.json
```

### **Option B: Copy & Edit**
```bash
# 1. Copy template
cp scripts/page-template-simple.json scripts/billing-config.json

# 2. Edit the 4 key sections
vim scripts/billing-config.json

# 3. Run capture
node scripts/one-command-advanced.js scripts/billing-config.json
```

---

## 🎯 **TIPS FOR YOUR APP**

### **Finding Menu Selectors:**
1. **Open browser DevTools**
2. **Inspect the menu item** you want to click
3. **Look for:** `data-id`, `data-test-id`, `data-e2e` attributes
4. **Common patterns:** `[data-id="billing"]`, `[data-id="admin"]`

### **Shadow DOM Detection:**
- **Level 1:** Most main menu items  
- **Level 2:** Sub-menu items, nested sections
- **Check:** If element is inside `sfc-shell-left-nav` → probably Shadow DOM

### **Common Shadow Hosts:**
- `sfc-shell-left-nav` - Main navigation
- `sfc-shell-app-bar` - Top bar  
- `oneux-header` - Header section

---

## ✅ **QUICK TEST**

```bash
# 1. Create a simple config for any page
echo '{
  "baseUrl": "https://your-app.com",
  "credentials": { "username": "test@test.com", "password": "pass" },
  "pageFileName": "test-page.js", 
  "navigationSteps": [
    { "type": "wait", "description": "Load", "duration": 3000 }
  ],
  "elementsToCapture": [
    { "description": "Any visible text or button" }
  ]
}' > test-config.json

# 2. Run it
node scripts/one-command-advanced.js test-config.json
```

**This template system works for ANY page in your app after login! 🚀**
