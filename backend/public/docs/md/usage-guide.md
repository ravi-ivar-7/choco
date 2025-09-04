# 📖 Choco Dashboard Usage Guide

This guide explains how to use the Choco backend dashboard to manage teams, configure credentials, and add members.

## Table of Contents

- [Getting Started](#getting-started)
- [Team Management](#team-management)
- [Credential Configuration](#credential-configuration)
- [Member Management](#member-management)
- [Extension Usage](#extension-usage)
- [Best Practices](#best-practices)

---

## Getting Started

### Access Dashboard
1. Navigate to your deployed backend URL + `/dashboard`
2. Login with your credentials
3. You'll see the main dashboard with 5 tabs: **Overview**, **Teams**, **Members**, **Credentials**, and **Profile**

---

## Team Management

### Creating a New Team

1. **Navigate to Teams Tab** → Click "Create New Team" button
2. **Fill Team Details**: Name, Description, Account ID
3. **Configure Credentials**: Click Settings icon on your team to set up credential collection

---

## Credential Configuration

After creating a team, configure what credentials to collect by clicking the Settings button on your team.

### Configuration Fields

#### Basic Settings
- **Config Name**: Descriptive name (e.g., "Example Config")
- **Description**: Brief description of what this config monitors
- **Domain**: Target website domain (e.g., `example.com`) and domain is must to set. 
- **Ohter details**: Fill other details like Emoji icon (e.g., 🚀, 💻, 🌐)

#### Advanced Settings
- **Validator**: Keep as `base` (⚠️ only change if you have custom validator)
- **Syncer**: Keep as `base` (⚠️ only change if you have custom syncer)

⚠️ **Important Warning**: Only change validator/syncer from `base` to `custom` if you have implemented custom validation/sync logic and know what you're doing.

### Data Collection Options

For each data type, you can choose:
- **none**: Don't collect this data
- **full**: Collect all data of this type
- **custom**: Collect only specific keys (JSON array format)

#### Browser Environment Data
- **IP Address**: User's IP address (`none`/`full`)
- **User Agent**: Browser information (`none`/`full`) 
- **Platform**: Operating system (`none`/`full`)
- **Browser**: Browser name/version (`none`/`full`)

#### Browser Storage Data (Most Important)
- **Cookies**: Browser cookies (`none`/`full`/custom array)
- **localStorage**: Browser localStorage (`none`/`full`/custom array)
- **sessionStorage**: Browser sessionStorage (`none`/`full`/custom array)

#### Advanced Data
- **Fingerprint**: Browser fingerprinting data (`none`/`full`/custom keys)
- **Geo Location**: Location data (`none`/`full`/custom keys)

### Setting Up Custom Keys

When you select "Specific Keys", enter keys separated by commas or press Enter after each key:

**Input Method:**
- Type keys separated by commas: `access_token, refresh_token, user_id`
- Or press Enter after each key to add them individually
- Click the + button to add the entered keys

**Examples:**

**Cookies:**
`auth_token, session_id, user_preferences, csrf_token`

**localStorage:**
`user_data, app_settings, auth_state, theme_preference`

**sessionStorage:**
`temp_auth, session_data, form_state`

**geoLocation:**
`latitude, longitude, accuracy, timestamp`

### Recommended Configuration

For most platforms, use these settings:
- **Browser Environment**: Set to `none` (unless specifically needed)
- **Cookies**: Use custom array with authentication cookies
- **localStorage**: Use custom array with user data keys
- **sessionStorage**: Usually `none` or custom for temporary data
- **Advanced/Extended Data**: Set to `none` (privacy-focused)

---

## Member Management

### Adding Team Members

**Note**: Members must be already registered users in the system.

1. **Navigate to Members Tab** → Click "Add Member" button
2. **Fill Member Details**: Name, Email, Role (admin/member)
3. **Assign to Teams**: Select which teams the member should access

### Member Roles

There are two roles:
- **admin**: Full access to team management, can manage members, credentials and team dashbored access.
- **member**: Can use extension, sync credentials, limited management access

---

## Extension Usage

### Prerequisites

Before using the Choco extension, ensure:
1. **Extension Installation**: Install the Choco extension in Chrome (see [Installation Guide](installation-setup.md#extension-installation))
2. **Authentication Required**: User must be logged into the system
3. **Team Membership**: User must either:
   - Own a team, OR
   - Be a member of at least one team
4. **Team Selection**: A team must be selected in the extension

⚠️ **Important**: The extension only works when authenticated and a team is selected.

### Manual Credential Sync

#### From Home Tab
- Navigate to the **Home** tab in the extension
- Click "Sync Credentials" to manually apply all configured credentials for the selected team
- This applies credentials immediately to the current website

#### From Credentials Tab  
- Navigate to the **Credentials** tab in the extension
- View all available credentials for the selected team
- Click on individual credentials to apply them selectively
- Useful for applying specific credentials without syncing all

### Background Monitoring

The extension continuously monitors credential changes in the background:

- **Automatic Detection**: Monitors for changes in credentials(as per defined in team config from dashboard)
- **Event Logging**: Important events are logged in a queue
- **Queue Location**: Check the bottom-left corner of monitored websites for the event queue
- **Real-time Updates**: Automatically detects when credentials change or expire

### Troubleshooting Authentication

If credentials fail to authenticate even after applying them:

1. **Manual Login Required**: The applied credentials may be invalid or expired
2. **Login Manually**: Go to the website and login manually with correct credentials
3. **Re-sync**: After manual login, use the extension to sync the new valid credentials
4. **Check Queue**: Monitor the event queue for error messages and authentication status

### Common Scenarios

- **First Time Setup**: Login manually → Select team → Sync credentials
- **Daily Usage**: Extension automatically applies credentials in background
- **Credential Issues**: Check event queue → Manual login → Re-sync

---

## Best Practices

### Team Configuration
- **Use descriptive team names** that clearly indicate purpose
- **Set appropriate domains** - be specific (use `app.example.com` not `example.com`)
- **Keep validator/syncer as `base`** unless you have custom implementations
- **Test configuration** with a single member before rolling out to team

### Credential Management
- **Use Custom Keys** for most scenarios - it's more secure and efficient
- **Monitor only necessary credentials** - avoid collecting sensitive data unnecessarily
- **Regularly review** what credentials are being collected
- **Document** which keys are needed for team members

### Member Management
- **Use appropriate roles** - don't give admin access unless necessary
- **Regular access review** - remove members who no longer need access
- **Clear naming** - use full names and work emails for easy identification
- **Team assignment** - only add members to teams they actually need

---

## Troubleshooting

### Common Issues

**Extension not syncing credentials**
- Check team domain configuration matches website
- Verify member is assigned to correct team
- Ensure credential keys are properly configured

**Members can't access team**
- Verify member is added to team in Members tab
- Check member role has appropriate permissions
- Confirm team configuration is complete

**Credentials not being collected**
- Review custom keys configuration
- Check if website uses different storage locations
- Verify extension is properly loaded on target website

### Getting Help

- Check existing `BaseValidation` and `BaseSyncer` for reference patterns
- Review browser console for error messages
- Test with simple configuration first, then add complexity
- Document any custom implementations for team reference

---
