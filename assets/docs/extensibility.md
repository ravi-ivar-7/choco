# 🔧 Choco Extension Extensibility Guide

This guide explains how to extend the Choco extension to support new websites that don't work with the base validator and syncer.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [When to Extend](#when-to-extend)
- [Step-by-Step Extension Guide](#step-by-step-extension-guide)
- [Testing Your Extension](#testing-your-extension)
- [Best Practices](#best-practices)

---

## Architecture Overview

The Choco extension uses a **modular dispatcher pattern** that makes it easy to add support for new websites:

### Core Components

1. **Base Components**
   - `BaseValidation` - Handles standard credential validation
   - `BaseSyncer` - Handles standard credential syncing

2. **Dispatchers**
   - `validator.js` - Routes validation requests to appropriate validators
   - `syncer.js` - Routes sync requests to appropriate syncers

3. **Configuration-Driven**
   - Team configs specify which validator/syncer to use
   - Dashboard allows admins to configure credential structures
   - Extension automatically uses the correct handler

### Extension Points

The dispatchers have clear extension points marked with comments:

```javascript
// In lib/validation/validator.js (lines 21-22)
if (validatorName === 'base' || !config) {
    validationResult = await BaseValidation.validateCredentials(credentials, mode, targetCredentials, config);

// define custom validator here if required
} else if (validatorName === 'custom') {
    validationResult = await CustomValidation.validateCredentials(credentials, mode, targetCredentials, config);

} else {
    // Fallback to base validator for unknown types
    validationResult = await BaseValidation.validateCredentials(credentials, mode, targetCredentials, config);
}

// In lib/sync/syncer.js (lines 18-19, 53-54)  
if (syncerName === 'base' || !config) {
    syncResult = await BaseSyncer.syncCredentialsToDatabase(config);

// define custom syncer here if required
} else if (syncerName === 'custom') {
    syncResult = await CustomSyncer.syncCredentialsToDatabase(config);

} else {
    // Fallback to base syncer for unknown types
    syncResult = await BaseSyncer.syncCredentialsToDatabase(config);
}
```

---

## When to Extend

You should create custom validators and syncers when:

- **Complex Authentication**: Website uses non-standard authentication patterns
- **Special Cookie Handling**: Requires custom cookie validation or manipulation
- **API Integration**: Needs specific API calls for token validation
- **Custom Storage**: Uses non-standard localStorage/sessionStorage patterns
- **Multi-Step Auth**: Requires complex multi-step authentication flows

---

## Step-by-Step Extension Guide

### Step 1: Create Custom Validator

Create: `extension/lib/validation/customValidation.js`

```javascript
class CustomValidation {
    static async validateCredentials(credentials, mode, targetCredentials = null, config = null) {
        try {
            // Your custom validation logic here
            if (mode === 'match_config') {
                return this.matchConfig(credentials, config);
            } else if (mode === 'match_provided') {
                return this.matchProvided(credentials, targetCredentials, config);
            }
            // Return standardized response format
        } catch (error) {
            return {
                success: false,
                error: 'Validation error',
                message: error.message,
                data: null
            };
        }
    }

    static matchConfig(credentials, config) {
        // Implement your custom validation logic
        // Check required cookies, localStorage, sessionStorage
        // Return { success, error, message, data }
    }

    static matchProvided(credentials, targetCredentials, config) {
        // Implement credential matching logic
        // Return { success, error, message, data }
    }
}
```

### Step 2: Create Custom Syncer

Create: `extension/lib/sync/customSyncer.js`

```javascript
class CustomSyncer {
    static async syncCredentialsToDatabase(config) {
        try {
            // Get stored authentication data
            const storageResult = await StorageUtils.get(['choco_token', 'choco_selected_team']);
            
            // Get current browser data with custom handling
            const browserDataResult = await GetBrowserData.getBrowserData();
            
            // Validate using your custom validator
            const validation = await CustomValidation.validateCredentials(browserDataResult.data, 'match_config', null, config);
            
            // Save to database via API
            const credentialsAPI = new CredentialsAPI(Constants.BACKEND_URL);
            const saveResult = await credentialsAPI.setCredentials(/* ... */);
            
            return saveResult;
        } catch (error) {
            return { success: false, error: 'Sync error', message: error.message, data: null };
        }
    }

    static async syncCredentialsToLocal() {
        try {
            // Get credentials from database
            // Validate using custom validator
            // Apply to browser using SetBrowserData
            // Return standardized response
        } catch (error) {
            return { success: false, error: 'Local sync error', message: error.message, data: null };
        }
    }
}
```

### Step 3: Update Extension Files

1. **manifest.json** - Add your validator and syncer files to content_scripts
2. **background.js** - Add your files to importScripts section  
3. **lib/utils/chrome.js** - Add your files to injectContentScript default files

### Step 4: Update Dispatchers

1. **lib/validation/validator.js** - Add your custom validator to the dispatcher logic
2. **lib/sync/syncer.js** - Add your custom syncer to both sync methods

### Step 5: Update Configuration

1. **Backend URL**: Update `lib/config/constants.js` with your backend URL
2. **Environment Variables**: Update `.env` files with database URL and other configs
3. **Dashboard Configuration**: 
   - Access Admin Dashboard: Navigate to your deployed URL + `/admin`
   - Create Team Configuration with:
     - `validator: 'custom'`
     - `syncer: 'custom'`
     - Configure required cookies/localStorage/sessionStorage fields

### Step 6: Test Configuration

Extension will automatically use your custom handlers based on team configuration

---

## Testing Your Extension

1. **Load Extension** - Navigate to `chrome://extensions/`, enable Developer mode, click "Load unpacked"
2. **Test Validation** - Use browser console to test `CredentialValidator.validateCredentials()`
3. **Test Syncing** - Test both `syncCredentialsToDatabase()` and `syncCredentialsToLocal()`

---

## Best Practices

- **Error Handling**: Always return standardized `{ success, error, message, data }` format
- **Validation Logic**: Implement both `match_config` and `match_provided` modes
- **Sync Logic**: Always validate credentials before syncing
- **Code Organization**: Follow existing naming conventions, keep platform-specific logic isolated
- **Testing**: Test on actual target websites with various credential configurations

---

## 📚 Common Use Cases

- **Social Media Platforms**: Custom cookie patterns, CSRF tokens
- **Enterprise Tools**: Multi-factor authentication, session management
- **E-commerce Sites**: Cart persistence, user preferences
- **Development Platforms**: API keys, OAuth tokens

## 🔗 File References

- **Base Implementations**: `lib/validation/baseValidation.js`, `lib/sync/baseSyncer.js`
- **Dispatcher Files**: `lib/validation/validator.js`, `lib/sync/syncer.js`
- **Extension Points**: Lines marked with `// define custom validator/syncer here if required`

---

**Need Help?** Check the existing `BaseValidation` and `BaseSyncer` implementations for reference patterns.
