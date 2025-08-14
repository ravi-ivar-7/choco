importScripts(
    'lib/config/constants.js',
    'lib/api/user.js',
    'lib/api/credentials.js',
    'lib/utils/chrome.js',
    'lib/utils/storage.js',
    'lib/utils/notifications.js',
    'lib/utils/browserData.js',
    'lib/validation/validator.js',
    'lib/validation/maangValidation.js',
    'lib/validation/devsValidation.js',
    'lib/sync/syncer.js',
    'lib/sync/maangSync.js',
    'lib/sync/devsSync.js'
);

class ChocoBackground {
    constructor() {
        this.backendUrl = Constants.BACKEND_URL;
        this.userAPI = new UserAPI(this.backendUrl);
        this.credentialsAPI = new CredentialsAPI(this.backendUrl);

        this.currentTab = null;
        this.tabId = null;
        this.currentUrl = null;
        this.domainConfig = null;
        this.isValidDomain = false;

        this.existingCredentials = new Map();
        this.requiredFieldsByDomain = new Map();
        this.cookieUpdateDebounce = new Map(); // Debounce cookie updates

        this.init();
    }

    async init() {
        await this.initializeTabAndDomainInfo();
        this.setupComprehensiveListeners();
        
        if (this.isValidDomain && this.domainConfig) {
            try {
                await this.loadCredentialsForDomain(this.domainConfig.domain.PRIMARY);
            } catch (error) {
                console.error('Failed to load credentials for current domain:', error);
            }
        }
    }

    async initializeTabAndDomainInfo() {
        try {
            const activeTabResult = await ChromeUtils.getActiveTab();
            if (activeTabResult.success && activeTabResult.data) {
                this.currentTab = activeTabResult.data;
                this.tabId = activeTabResult.data.id;
                this.currentUrl = activeTabResult.data.url;
            }
            this.domainConfig = await ChromeUtils.getCurrentDomain(this.currentUrl);
            if (this.domainConfig) {
                this.isValidDomain = true;
            } else {
                this.isValidDomain = false;
            }
        } catch (error) {
            console.error('Failed to initialize tab and domain info:', error);
            this.isValidDomain = false;
        }
    }

    async loadCredentialsForDomain(domainPrimary) {
        try {
            const requiredFieldsResult = await CredentialValidator.getRequiredFields();
            if (!requiredFieldsResult.success || !requiredFieldsResult.data) {
                return;
            }
            this.requiredFieldsByDomain.set(domainPrimary, requiredFieldsResult.data.requiredFields);
        } catch (error) {
            console.error(`Error loading credentials for domain ${domainPrimary}:`, error);
        }
    }

    setupComprehensiveListeners() {
        this.setupCookieListeners();
        this.setupStorageListeners();
    }

    setupCookieListeners() {
        if (chrome.cookies && chrome.cookies.onChanged) {
            chrome.cookies.onChanged.addListener(async (changeInfo) => {
                await this.handleCookieChange(changeInfo);
            });
        }
    }

    async handleCookieChange(changeInfo) {
        try {
            const cookie = changeInfo.cookie;
            const isRemoved = changeInfo.removed;
            const cookieDomain = cookie.domain;

            const cookieUrl = `https://${cookieDomain.startsWith('.') ? cookieDomain.substring(1) : cookieDomain}`;
            const cookieDomainConfig = await ChromeUtils.getCurrentDomain(cookieUrl);

            if (!cookieDomainConfig) {
                return;
            }

            const requiredFieldsResult = await CredentialValidator.getRequiredFields(cookieDomainConfig);
            if (!requiredFieldsResult.success || !requiredFieldsResult.data?.requiredFields?.cookies) {
                return;
            }

            const requiredCookies = requiredFieldsResult.data.requiredFields.cookies;

            if (!requiredCookies.includes(cookie.name)) {
                return;
            }
            const debounceKey = `${cookieDomainConfig.domain.PRIMARY}-${cookie.name}`;
            
            if (this.cookieUpdateDebounce.has(debounceKey)) {
                clearTimeout(this.cookieUpdateDebounce.get(debounceKey));
            }
            
            const timeoutId = setTimeout(async () => {
                this.cookieUpdateDebounce.delete(debounceKey);
                const changeType = isRemoved ? 'removed' : 'updated';
                
                this.showToastNotification(
                    'Required Cookie Change',
                    `${cookie.name} ${changeType} on ${cookieDomainConfig.domain.PRIMARY}`,
                    'info'
                );

                console.log('Required cookie change detected:', cookie.name, cookieDomainConfig.domain.PRIMARY)
                
                const syncResult = await CredentialSyncer.syncCredentialsToDatabase(cookieDomainConfig, this.userAPI, this.credentialsAPI);
                
                if (syncResult.success) {
                    this.showToastNotification(
                        'Database Sync Success',
                        `${cookieDomainConfig.domain.PRIMARY} credentials saved to database`,
                        'success',
                        cookieDomainConfig.domain.PRIMARY
                    );
                } else {
                    this.showToastNotification(
                        'Database Sync Failed',
                        syncResult.message || 'Failed to save credentials to database',
                        'error',
                        cookieDomainConfig.domain.PRIMARY
                    );
                }
            }, 500);
            
            this.cookieUpdateDebounce.set(debounceKey, timeoutId);
        } catch (error) {
            console.error('Error handling cookie change:', error);
        }
    }



    setupStorageListeners() {
        chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
            if (message.type === 'STORAGE_CHANGED') {
                await this.handleStorageChange(sender.tab, message);
            }
        });
    }

    async handleStorageChange(tab, message) {
        try {
            if (!tab || !tab.url) {
                return;
            }
            const tabDomainConfig = await ChromeUtils.getCurrentDomain(tab.url);
            if (!tabDomainConfig) {
                return;
            }

            const requiredFieldsResult = await CredentialValidator.getRequiredFields(tabDomainConfig);
            if (!requiredFieldsResult.success || !requiredFieldsResult.data?.requiredFields) {
                return;
            }

            const requiredFields = requiredFieldsResult.data.requiredFields;
            const storageType = message?.storageType; // 'localStorage' or 'sessionStorage'
            const changedKey = message?.key;
            const requiredKeysForType = requiredFields[storageType] || [];

            if (!changedKey || !requiredKeysForType.includes(changedKey)) {
                return;
            }
            this.showToastNotification(
                'Required Storage Change',
                `${storageType}.${changedKey} updated on ${tabDomainConfig.domain.PRIMARY}`,
                'info'
            );

            console.log('Required storage change detected:', storageType, changedKey, tabDomainConfig.domain.PRIMARY)
            
            const syncResult = await CredentialSyncer.syncCredentialsToDatabase(tabDomainConfig, this.userAPI, this.credentialsAPI);

            if (syncResult.success) {
                this.showToastNotification(
                    'Database Sync Success',
                    `${tabDomainConfig.domain.PRIMARY} credentials saved to database`,
                    'success',
                    tabDomainConfig.domain.PRIMARY
                );
            } else {
                this.showToastNotification(
                    'Database Sync Failed',
                    syncResult.message || 'Failed to save credentials to database',
                    'error',
                    tabDomainConfig.domain.PRIMARY
                );
            }
        } catch (error) {
            console.error('Error processing storage change:', error);
        }
    }



    async showToastNotification(title, message, type, targetDomain = null) {
        try {
            const tabs = targetDomain ? 
                await chrome.tabs.query({ url: `*://*.${targetDomain}/*` }) :
                [await chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => tabs[0])];

            if (!tabs || tabs.length === 0) return;

            for (const tab of tabs.filter(tab => tab && tab.id)) {
                await this.executeNotification(tab.id, title, message, type);
            }
        } catch (error) {
            console.error('Failed to show notification:', error.message);
        }
    }

    async executeNotification(tabId, title, message, type) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId },
                func: (title, message, type) => {
                    if (typeof window.NotificationHandler !== 'undefined') {
                        const handler = new window.NotificationHandler();
                        handler.handleMessage({
                            type: 'SHOW_TOAST_NOTIFICATION',
                            title, message, notificationType: type, duration: 5000
                        });
                    }
                },
                args: [title, message, type]
            });
        } catch (error) {
            console.error(`Notification failed for tab ${tabId}:`, error.message);
        }
    }
}

const chocoBackground = new ChocoBackground();
