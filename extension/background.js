
importScripts(
    'lib/api/user.js',
    'lib/api/platform.js',
    'lib/platforms/maang/index.js',
    'lib/utils/chrome.js',
    'lib/utils/storage.js',
    'lib/utils/notifications.js'
);

class ChocoBackground {
    constructor() {
        this.backendUrl = 'https://algochoco.vercel.app';
        this.userAPI = new UserAPI(this.backendUrl);
        this.platformAPI = new PlatformAPI(this.backendUrl);
        this.existingRefreshTokens = new Set();
        this.pendingRemovals = new Map();
        
        this.init();
        
        setTimeout(() => {
            this.checkUserStatusOnLoad();
        }, 2000);
    }
    
    async init() {
        console.log('Choco background service initialized');
        await this.loadExistingTokens();
        this.setupCookieListener();
        this.setupTabListener();
        await this.injectContentScriptsIntoExistingTabs();
    }
    
    async loadExistingTokens() {
        chrome.cookies.getAll({ domain: '.maang.in' }, (cookies) => {
            cookies.forEach(cookie => {
                if (this.isRefreshTokenCookie(cookie)) {
                    this.existingRefreshTokens.add(`${cookie.name}@${cookie.domain}`);
                }
            });
        });
    }
    
    setupCookieListener() {
        chrome.cookies.onChanged.addListener((changeInfo) => {
            this.handleCookieChange(changeInfo);
        });
    }
    
    setupTabListener() {
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url) {
                const url = new URL(tab.url);
                if (this.isMaangDomain(url.hostname)) {
                    this.checkUserStatusForPage(tabId);
                }
            }
        });
    }
    
    handleCookieChange(changeInfo) {
        const cookie = changeInfo.cookie;
        
        if (!this.isRefreshTokenCookie(cookie) || !this.isMaangDomain(cookie.domain)) {
            return;
        }
        
        const cookieKey = `${cookie.name}@${cookie.domain}`;
        
        if (changeInfo.removed) {
            this.pendingRemovals.set(cookieKey, {
                cookie: cookie,
                timestamp: Date.now()
            });
            
            setTimeout(() => {
                if (this.pendingRemovals.has(cookieKey)) {
                    this.existingRefreshTokens.delete(cookieKey);
                    this.pendingRemovals.delete(cookieKey);
                    this.onRefreshTokenRemove(cookie);
                }
            }, 100);
            
        } else {
            if (this.pendingRemovals.has(cookieKey)) {
                this.pendingRemovals.delete(cookieKey);
                this.onRefreshTokenUpdate(cookie, changeInfo.cause);
            } else if (this.existingRefreshTokens.has(cookieKey)) {
                this.onRefreshTokenUpdate(cookie, changeInfo.cause);
            } else {
                this.existingRefreshTokens.add(cookieKey);
                this.onRefreshTokenAdd(cookie);
            }
        }
    }
    
    isRefreshTokenCookie(cookie) {
        const cookieName = cookie.name.toLowerCase().trim();
        return cookieName.includes('refresh_token');
    }
    
    isMaangDomain(domain) {
        return domain === 'maang.in' || domain.endsWith('.maang.in');
    }
    
    async storeTokenInDatabase(cookie, action) {
        try {
            const userResult = await this.userAPI.getLocalStoredUser();
            if (!userResult.success || !userResult.data?.token) {
                this.showToastNotification('Login Required', 'Login to Choco extension to sync your account', 'warning', 'maang.in');
                return { success: false, error: 'No user token' };
            }
            
            const tokenData = {
                refreshToken: cookie.value,
                domain: cookie.domain,
                name: cookie.name,
                action: action,
                timestamp: Date.now()
            };
            
            this.showToastNotification(
                'Choco Storing Token', 
                'Choco is securely storing your refresh token in database for team members', 
                'info',
                'maang.in'
            );

            const storeResult = await this.platformAPI.storeToken(userResult.data.token, tokenData);
            
            
            if (storeResult.success) {
                this.showToastNotification(
                    'Token Saved', 
                    `Refresh token ${action === 'add' ? 'added' : action === 'update' ? 'updated' : 'processed'} and saved to database`, 
                    'success',
                    'maang.in'
                );
            } else {
                this.showToastNotification(
                    'Storage Failed', 
                    `Failed to save token to database: ${storeResult.error}`, 
                    'error',
                    'maang.in'
                );
            }
            
            return storeResult;
            
        } catch (error) {
            console.error('Error storing token in database:', error);
            return { success: false, error: error.message };
        }
    }
    
    async onRefreshTokenAdd(cookie) {
        await this.storeTokenInDatabase(cookie, 'added');
    }
    
    async onRefreshTokenUpdate(cookie, cause) {
        await this.storeTokenInDatabase(cookie, 'updated');
    }
    
    onRefreshTokenRemove(cookie) {
        this.showToastNotification(
            'Token Removed', 
            `Refresh token removed from ${cookie.domain}`, 
            'warning',
            'maang.in'
        );
    }
    
    showCookieDialogNotification(cookieType, action, cookie, type) {
        const cookieDisplayName = cookieType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        const messages = {
            added: `${cookieDisplayName} "${cookie.name}" was added on ${cookie.domain}`,
            updated: `${cookieDisplayName} "${cookie.name}" was updated on ${cookie.domain}`,
            removed: `${cookieDisplayName} "${cookie.name}" was removed from ${cookie.domain}`
        };
        
        const emojis = {
            added: '🟢',
            updated: '🔄',
            removed: '🔴'
        };
        
        const titles = {
            added: `${emojis.added} ${cookieDisplayName} Added`,
            updated: `${emojis.updated} ${cookieDisplayName} Updated`,
            removed: `${emojis.removed} ${cookieDisplayName} Removed`
        };
        
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                if (tab.url && (tab.url.startsWith('http') || tab.url.startsWith('https'))) {
                    chrome.tabs.sendMessage(tab.id, {
                        type: 'SHOW_DIALOG_NOTIFICATION',
                        title: titles[action],
                        message: messages[action],
                        notificationType: type,
                        duration: 8000,
                        actions: [
                            {
                                text: 'OK',
                                action: 'dismiss'
                            },
                            {
                                text: 'View Details',
                                action: 'details'
                            }
                        ]
                    }).catch(() => {
                        // Ignore errors for tabs that don't have content scripts
                    });
                }
            });
        });
    }
    
    showToastNotification(title, message, type, targetDomain = null) {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                if (tab.url && (tab.url.startsWith('http') || tab.url.startsWith('https'))) {
                    if (targetDomain) {
                        const url = new URL(tab.url);
                        if (!this.isMaangDomain(url.hostname)) {
                            return;
                        }
                    }
                    
                    chrome.tabs.sendMessage(tab.id, {
                        type: 'SHOW_TOAST_NOTIFICATION',
                        title: title,
                        message: message,
                        notificationType: type,
                        duration: 5000
                    }).catch(() => {
                        this.injectAndRetryNotification(tab.id, title, message, type);
                    });
                }
            });
        });
    }
    
    async checkTokenSyncStatus(tabId = null) {
        try {
            const userResult = await this.userAPI.getLocalStoredUser();
            if (!userResult.success || !userResult.data || !userResult.data.token) {
                return;
            }
            
            const localTokens = await this.getLocalRefreshTokens();
            if (!localTokens) {
                return;
            }
            
            const dbTokensResult = await this.platformAPI.getTokens(userResult.data.token);
            if (!dbTokensResult.success) {
                return;
            }
            
            const dbTokens = dbTokensResult.data?.tokens || [];
            const syncStatus = this.compareTokens(localTokens, dbTokens);
            
            if (!syncStatus.inSync) {
                const message = syncStatus.localCount > 0 
                    ? `Your browser has ${syncStatus.localCount} refresh token(s) but they don't match your team account tokens. Click to sync from extension.`
                    : 'Your browser and team account tokens are out of sync. Click to sync from extension.';
                
                if (tabId) {
                    // Send to specific tab
                    chrome.tabs.sendMessage(tabId, {
                        type: 'SHOW_TOAST_NOTIFICATION',
                        title: '⚠️ Tokens Out of Sync',
                        message: message,
                        notificationType: 'warning',
                        duration: 5000
                    }).catch(() => {
                        this.injectAndRetryNotification(tabId, '⚠️ Tokens Out of Sync', message, 'warning');
                    });
                } else {
                    // Send to all tabs
                    this.showToastNotification(
                        '⚠️ Tokens Out of Sync',
                        message,
                        'warning'
                    );
                }
                
                console.log('🔄 Token sync mismatch detected:', {
                    localTokens: syncStatus.localCount,
                    dbTokens: syncStatus.dbCount,
                    inSync: syncStatus.inSync
                });
            }
            
        } catch (error) {
            console.error('Error checking token sync status:', error);
        }
    }
    
    async getLocalRefreshTokens() {
        const browserTokensResult = await MaangPlatform.getCookiesFromUrl('https://maang.in');
        
        if (!browserTokensResult.success) {
            console.error('Failed to get local cookies:', browserTokensResult.error);
            return [];
        }
        
        const browserTokens = browserTokensResult.data.cookies;
        
        if (browserTokens && browserTokens.refreshToken) {
            return browserTokens;
        }
        
        return null;
    }
    
    compareTokens(localTokens, dbTokens) {
        if (!localTokens || !localTokens.refreshToken) {
            return {
                inSync: false,
                localCount: 0,
                dbCount: dbTokens.length,
                localTokens: localTokens,
                dbTokens: dbTokens
            };
        }
        
        const localRefreshToken = localTokens.refreshToken;
        const hasMatchingToken = dbTokens.some(token => 
            token.refreshToken === localRefreshToken || token.token === localRefreshToken
        );
        
        return {
            inSync: hasMatchingToken,
            localCount: 1,
            dbCount: dbTokens.length,
            localTokens: localTokens,
            dbTokens: dbTokens
        };
    }
    

    
    async checkUserStatusOnLoad() {
        try {
            const userResult = await this.userAPI.getLocalStoredUser();
            
            if (!userResult.success || !userResult.data || !userResult.data.token) {
                this.showToastNotification(
                    '👋 Welcome to Choco',
                    'Login to Choco extension to sync tokens with your team',
                    'info'
                );
                return;
            }
            
            this.checkTokenSyncStatus();
            
        } catch (error) {
            console.error('Error checking user status on load:', error);
        }
    }
    
    async injectContentScriptsIntoExistingTabs() {
        try {
            const tabs = await chrome.tabs.query({});
            
            for (const tab of tabs) {
                if (tab.url && (tab.url.startsWith('http') || tab.url.startsWith('https'))) {
                    try {
                        await chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            files: [
                                'lib/utils/notifications.js',
                                'lib/platforms/maang/index.js',
                                'content.js'
                            ]
                        });
                    } catch (error) {
                        // Ignore injection errors for tabs that don't support it
                    }
                }
            }
        } catch (error) {
            console.error('Error injecting content scripts:', error);
        }
    }
    
    async injectAndRetryNotification(tabId, title, message, type) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: [
                    'lib/utils/notifications.js',
                    'lib/platforms/maang/index.js',
                    'content.js'
                ]
            });
            
            setTimeout(() => {
                chrome.tabs.sendMessage(tabId, {
                    type: 'SHOW_TOAST_NOTIFICATION',
                    title: title,
                    message: message,
                    notificationType: type,
                    duration: 5000
                }).catch(() => {
                    // Ignore retry failures
                });
            }, 500);
            
        } catch (error) {
            // Ignore injection failures
        }
    }
    
    async checkUserStatusForPage(tabId) {
        try {
            const userResult = await this.userAPI.getLocalStoredUser();
            
            if (!userResult.success || !userResult.data || !userResult.data.token) {
                chrome.tabs.sendMessage(tabId, {
                    type: 'SHOW_TOAST_NOTIFICATION',
                    title: '👋 Welcome to Choco',
                    message: 'Login to Choco extension to sync tokens with your team',
                    notificationType: 'info',
                    duration: 5000
                }).catch(() => {
                    this.injectAndRetryNotification(tabId, '👋 Welcome to Choco', 'Login to Choco extension to sync tokens with your team', 'info');
                });
            } else {
                // User is logged in, check token sync status for this page
                this.checkTokenSyncStatus(tabId);
            }
            
        } catch (error) {
            console.error(`Error checking user status for tab ${tabId}:`, error);
        }
    }
    

}

const chocoBackground = new ChocoBackground();