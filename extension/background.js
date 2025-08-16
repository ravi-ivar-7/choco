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
    'lib/sync/maangDBSync.js',
    'lib/sync/devsDBSync.js',
    'lib/sync/maangLocalSync.js',
    'lib/sync/devsLocalSync.js'
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
        await this.validateStoredTabs();
        await this.initializeTabAndDomainInfo();
        this.setupComprehensiveListeners();
        this.setupTabLifecycleListeners();
        
        if (this.isValidDomain && this.domainConfig) {
            try {
                await this.loadCredentialsForDomain(this.domainConfig.domain.PRIMARY);
            } catch (error) {
                console.error('Failed to load credentials for current domain:', error);
            }
        }
    }

    async validateStoredTabs() {
        try {
            const result = await StorageUtils.get(['selectedPlatform']);
            if (result.success && result.data.selectedPlatform?.tab) {
                const storedTab = result.data.selectedPlatform.tab;
                try {
                    await chrome.tabs.get(storedTab.id);
                } catch (tabError) {
                    await StorageUtils.remove(['selectedPlatform']);
                }
            }
        } catch (error) {
            console.warn('Error validating stored tabs:', error.message);
        }
    }

    setupTabLifecycleListeners() {
        // Clean up storage when tabs are closed
        chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
            try {
                const result = await StorageUtils.get(['selectedPlatform']);
                if (result.success && result.data.selectedPlatform?.tab?.id === tabId) {
                    await StorageUtils.remove(['selectedPlatform']);
                }
            } catch (error) {
                console.warn('Error cleaning up closed tab:', error.message);
            }
        });

        // Update stored tab URL when it changes
        chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
            if (changeInfo.url) {
                try {
                    const result = await StorageUtils.get(['selectedPlatform']);
                    if (result.success && result.data.selectedPlatform?.tab?.id === tabId) {
                        const updatedPlatform = { ...result.data.selectedPlatform };
                        updatedPlatform.tab.url = tab.url;
                        await StorageUtils.set({ selectedPlatform: updatedPlatform });
                    }
                } catch (error) {
                    console.warn('Error updating stored tab URL:', error.message);
                }
            }
        });
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
            // Get domainConfig from domainPrimary
            const domainConfig = await ChromeUtils.getCurrentDomain(`https://${domainPrimary}`);
            const requiredFieldsResult = await CredentialValidator.getRequiredFields(domainConfig);
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
        
        // Handle extension icon click to open dashboard popup
        chrome.action.onClicked.addListener(async (tab) => {
            await this.openDashboardWindow();
        });
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
                
                this.showNotification(
                    'Required Cookie Change',
                    `${cookie.name} ${changeType} on ${cookieDomainConfig.domain.PRIMARY}`,
                    'info'
                );
                
                let syncResult;
                if (isRemoved) {
                    // Cookie was removed - fetch fresh credentials from database and restore locally
                    syncResult = await CredentialSyncer.syncCredentialsToLocal(cookieDomainConfig, this.userAPI, this.credentialsAPI);
                    
                    if (syncResult.success) {
                        this.showNotification(
                            'Local Sync Success',
                            `${cookieDomainConfig.domain.PRIMARY} credentials restored from database`,
                            'success',
                            cookieDomainConfig.domain.PRIMARY
                        );
                    } else {
                        this.showNotification(
                            'Local Sync Failed',
                            syncResult.message || 'Failed to restore credentials from database',
                            'error',
                            cookieDomainConfig.domain.PRIMARY
                        );
                    }
                } else {
                    // Cookie was added/updated - save current credentials to database
                    syncResult = await CredentialSyncer.syncCredentialsToDatabase(cookieDomainConfig, this.userAPI, this.credentialsAPI);
                    
                    if (syncResult.success) {
                        this.showNotification(
                            'Database Sync Success',
                            `${cookieDomainConfig.domain.PRIMARY} credentials saved to database`,
                            'success',
                            cookieDomainConfig.domain.PRIMARY
                        );
                    } else {
                        this.showNotification(
                            'Database Sync Failed',
                            syncResult.message || 'Failed to save credentials to database',
                            'error',
                            cookieDomainConfig.domain.PRIMARY
                        );

                    }
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


    async openDashboardWindow() {
        try {
            // Check if dashboard window is already open
            const existingWindows = await chrome.windows.getAll({
                populate: true,
                windowTypes: ['popup']
            });
            
            const existingDashboard = existingWindows.find(window => 
                window.tabs && window.tabs.some(tab => 
                    tab.url && tab.url.includes('dashboard/index.html')
                )
            );

            if (existingDashboard) {
                // Focus existing dashboard window
                await chrome.windows.update(existingDashboard.id, { focused: true });
                return;
            }

            // Create new dashboard window
            const dashboardWindow = await chrome.windows.create({
                url: chrome.runtime.getURL('dashboard/index.html'),
                type: 'popup',
                width: 450,
                height: 600,
                focused: true
            });
        } catch (error) {
            console.error('Failed to open dashboard window:', error);
        }
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
            const newValue = message?.newValue;
            const oldValue = message?.oldValue;
            const requiredKeysForType = requiredFields[storageType] || [];

            if (!changedKey || !requiredKeysForType.includes(changedKey)) {
                return;
            }

            const isRemoved = newValue === null && oldValue !== null;
            const actionType = isRemoved ? 'removed' : 'updated';
            
            this.showNotification(
                'Required Storage Change',
                `${storageType}.${changedKey} ${actionType} on ${tabDomainConfig.domain.PRIMARY}`,
                'info'
            );
            
            let syncResult;
            if (isRemoved) {
                // Storage item was removed - fetch fresh credentials from database and restore locally
                syncResult = await CredentialSyncer.syncCredentialsToLocal(tabDomainConfig, this.userAPI, this.credentialsAPI, tab.id);
                
                if (syncResult.success) {
                    this.showNotification(
                        'Local Sync Success',
                        `${tabDomainConfig.domain.PRIMARY} credentials restored from database`,
                        'success',
                        tabDomainConfig.domain.PRIMARY
                    );
                } else {
                    this.showNotification(
                        'Local Sync Failed',
                        syncResult.message || 'Failed to restore credentials from database',
                        'error',    
                        tabDomainConfig.domain.PRIMARY
                    );


                }
            } else {
                // Storage item was added/updated - save current credentials to database
                syncResult = await CredentialSyncer.syncCredentialsToDatabase(tabDomainConfig, this.userAPI, this.credentialsAPI);

                if (syncResult.success) {
                    this.showNotification(
                        'Database Sync Success',
                        `${tabDomainConfig.domain.PRIMARY} credentials saved to database`,
                        'success',
                        tabDomainConfig.domain.PRIMARY
                    );
                } else {
                    this.showNotification(
                        'Database Sync Failed',
                        syncResult.message || 'Failed to save credentials to database',
                        'error',
                        tabDomainConfig.domain.PRIMARY
                    );
                }
            }
        } catch (error) {
            console.error('Error processing storage change:', error);
        }
    }



    async showNotification(title, message, type, targetDomain = null) {
        try {
            let tabs = [];
            
            // First try to use stored tab from selectedPlatform
            try {
                const result = await chrome.storage.local.get(['selectedPlatform']);
                if (result.selectedPlatform && result.selectedPlatform.tab) {
                    const storedTab = result.selectedPlatform.tab;
                    
                    // Validate stored tab matches target domain or no domain specified
                    if (!targetDomain || storedTab.url.includes(targetDomain)) {
                        // Verify tab still exists and is accessible
                        try {
                            const currentTab = await chrome.tabs.get(storedTab.id);
                            if (currentTab && currentTab.url === storedTab.url) {
                                tabs = [currentTab];
                            }
                        } catch (tabError) {
                            console.warn('Stored tab no longer valid:', tabError.message);
                            // Tab cleanup is handled centrally by tab lifecycle listeners
                        }
                    }
                }
            } catch (storageError) {
                console.warn('Could not access stored tab:', storageError.message);
            }
            
            // Fallback to querying tabs if stored tab not available
            if (tabs.length === 0) {
                tabs = targetDomain ? 
                    await chrome.tabs.query({ url: `*://*.${targetDomain}/*` }) :
                    [await chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => tabs[0])];
            }

            if (!tabs || tabs.length === 0) return;

            // Filter out extension tabs and invalid tabs
            const validTabs = tabs.filter(tab => {
                return tab && tab.id && tab.url && 
                       !tab.url.startsWith('chrome://') && 
                       !tab.url.startsWith('chrome-extension://') && 
                       !tab.url.startsWith('moz-extension://');
            });

            for (const tab of validTabs) {
                await this.executeNotificationQueue(tab.id, title, message, type);
            }
        } catch (error) {
            console.error('Failed to show notification:', error.message);
        }
    }

    async executeNotificationQueue(tabId, title, message, type) {
        try {
            // Get tab info to check if it's accessible
            const tab = await chrome.tabs.get(tabId);
            
            // Skip extension pages and other restricted URLs
            if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://')) {
                console.warn(`Skipping notification for restricted URL: ${tab.url}`);
                return;
            }
            
            await chrome.scripting.executeScript({
                target: { tabId },
                func: (title, message, type) => {
                    // Add to notification queue
                    if (typeof window.ChocoNotificationQueue !== 'undefined') {
                        window.ChocoNotificationQueue.add({
                            title: title,
                            message: message,
                            type: type,
                            timestamp: new Date()
                        });
                    }
                    
                    // Show traditional toast notification
                    // if (typeof window.NotificationHandler !== 'undefined') {
                    //     const handler = new window.NotificationHandler();
                    //     handler.handleMessage({
                    //         type: 'SHOW_TOAST_NOTIFICATION',
                    //         title, message, notificationType: type, duration: 5000
                    //     });
                    // }
                },
                args: [title, message, type]
            });
        } catch (error) {
            console.error(`Notification failed for tab ${tabId}:`, error.message);
        }
    }

}

// Initialize the background script
const chocoBackground = new ChocoBackground();
