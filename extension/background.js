// Choco Extension Background Service Worker
class ChocoBackground {
    constructor() {
        this.backendUrl = 'http://localhost:3000'
        this.init()
    }

    init() {
        // Wait for Chrome APIs to be available
        this.waitForChromeAPIs().then(() => {
            this.setupEventListeners()
            this.setupPeriodicTasks()
        }).catch(error => {
            console.error('Failed to initialize Chrome APIs:', error)
        })
    }

    async waitForChromeAPIs() {
        return new Promise((resolve) => {
            if (chrome && chrome.runtime && chrome.storage) {
                resolve()
            } else {
                // Wait a bit for APIs to become available
                setTimeout(() => resolve(), 100)
            }
        })
    }

    setupEventListeners() {
        // Listen for extension installation
        chrome.runtime.onInstalled.addListener(() => {
            console.log('Choco extension installed')
            this.initializeExtension()
        })

        // Listen for tab updates to check if user is on maang.in
        if (chrome.tabs) {
            chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
                if (changeInfo.status === 'complete' && this.isMaangDomain(tab.url)) {
                    this.handleMaangPageLoad(tabId, tab.url)
                }
            })
        }

        // Listen for messages from content script
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse)
            return true // Keep message channel open for async response
        })
    }

    setupPeriodicTasks() {
        // Periodic token validation (every 30 minutes using setTimeout)
        console.log('Setting up periodic token check with setTimeout')
        this.scheduleTokenCheck()
    }

    scheduleTokenCheck() {
        // Check tokens every 30 minutes (1800000 ms)
        setTimeout(() => {
            this.performPeriodicTokenCheck()
            this.scheduleTokenCheck() // Reschedule for next check
        }, 30 * 60 * 1000)
    }

    async initializeExtension() {
        // Set default settings
        await chrome.storage.local.set({
            chocoSettings: {
                autoTokenRefresh: true,
                notificationsEnabled: true,
                backendUrl: this.backendUrl
            }
        })
    }

    isMaangDomain(url) {
        if (!url) return false
        return url.includes('maang.in')
    }

    async handleMaangPageLoad(tabId, url) {
        console.log('Maang.in page loaded:', url)
        
        // Inject content script if not already present
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            })
        } catch (error) {
            // Content script might already be injected
            console.log('Content script injection skipped:', error.message)
        }

        // Don't automatically check tokens on page load
        // Only check when user explicitly interacts with extension
        console.log('Content script injected, waiting for user interaction')
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.type) {
                case 'GET_TOKEN_STATUS':
                    const status = await this.checkTokenStatus()
                    sendResponse({ success: true, status })
                    break

                case 'SAVE_NEW_TOKEN':
                    const saved = await this.saveNewToken(request.token)
                    sendResponse({ success: saved })
                    break

                case 'TOKEN_DETECTED':
                    console.log('🔍 Token detected from content script:', request.token?.source)
                    await this.handleTokenDetection(request.token, sender.tab)
                    sendResponse({ success: true })
                    break

                case 'GET_COOKIES':
                    const cookies = await this.getCookiesForUrl(request.url)
                    sendResponse({ success: true, cookies })
                    break

                case 'GET_SETTINGS':
                    const settings = await this.getSettings()
                    sendResponse({ success: true, settings })
                    break

                default:
                    sendResponse({ success: false, error: 'Unknown message type' })
            }
        } catch (error) {
            console.error('Message handling error:', error)
            sendResponse({ success: false, error: error.message })
        }
    }

    async checkTokenStatus() {
        try {
            // Validate user authentication first
            const userValidation = await this.validateUser()
            if (!userValidation.valid) {
                return { valid: false, reason: 'user_not_authenticated' }
            }

            // Get team tokens from backend (same as popup.js)
            const response = await fetch(`${this.backendUrl}/api/maang/team`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userValidation.token}`
                }
            })

            if (!response.ok) {
                return { valid: false, reason: 'server_error' }
            }

            const data = await response.json()
            return {
                valid: data.success && data.tokens && data.tokens.length > 0,
                tokenCount: data.count || 0,
                reason: data.success ? 'valid' : 'no_tokens_available'
            }
        } catch (error) {
            console.error('Token status check failed:', error)
            return { valid: false, reason: 'network_error' }
        }
    }

    async saveNewToken(tokens) {
        try {
            // Validate user authentication first
            const userValidation = await this.validateUser()
            if (!userValidation.valid) {
                console.error('User not authenticated:', userValidation.reason)
                return false
            }

            const user = userValidation.user
            const authToken = userValidation.token

            // Send to backend using correct API endpoint (same as popup.js)
            const response = await fetch(`${this.backendUrl}/api/maang/store`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    refreshToken: tokens.refreshToken || (typeof tokens === 'string' ? tokens : null), // Primary token
                    accessToken: (!tokens.refreshToken && typeof tokens !== 'string') ? tokens.accessToken : null, // Fallback
                    generalToken: (!tokens.refreshToken && !tokens.accessToken && typeof tokens !== 'string') ? (tokens.generalToken || tokens.jwt) : null, // Last fallback
                    userEmail: user.email,
                    tokenSource: 'auto_detected' // Mark as automatically detected
                })
            })

            if (!response.ok) {
                console.error('Failed to save token to backend')
                return false
            }

            const data = await response.json()
            return data.success
        } catch (error) {
            console.error('Token save failed:', error)
            return false
        }
    }

    async handleTokenDetection(token, tab) {
        console.log('🎆 New token detected on maang.in from:', token?.source || 'unknown')
        
        // Validate token before saving
        if (!token?.refreshToken) {
            console.log('⚠️ No refresh token found, skipping save')
            return
        }
        
        console.log('💾 Attempting to save new token to database...')
        const saved = await this.saveNewToken(token)
        
        if (saved) {
            // Show success notification
            console.log('✅ Token successfully saved and synced!')
            await this.showNotification(
                'AlgoZenith Access Updated',
                '🎉 New login detected and shared with your team automatically!',
                'success'
            )
        } else {
            // Show error notification
            console.log('❌ Failed to save token to database')
            await this.showNotification(
                'Auto-Sync Failed',
                '😔 Couldn\'t automatically save your login. Please open the extension to sync manually.',
                'error'
            )
        }
    }

    // Get cookies for a specific URL
    async getCookiesForUrl(url) {
        try {
            const cookies = {}
            
            // Get refresh token cookie
            const refreshTokenCookie = await new Promise(resolve => {
                chrome.cookies.get({ url: url, name: 'refresh_token' }, resolve)
            })
            
            // Get access token cookie
            const accessTokenCookie = await new Promise(resolve => {
                chrome.cookies.get({ url: url, name: 'access_token' }, resolve)
            })
            
            if (refreshTokenCookie) {
                cookies.refreshToken = refreshTokenCookie.value
            }
            
            if (accessTokenCookie) {
                cookies.accessToken = accessTokenCookie.value
            }
            
            return cookies
        } catch (error) {
            console.error('Error getting cookies:', error)
            return {}
        }
    }

    async performPeriodicTokenCheck() {
        console.log('Performing periodic token check')
        
        const status = await this.checkTokenStatus()
        
        if (!status.valid) {
            // Show notification about expired token
            await this.showNotification(
                'Token Expired',
                '⚠️ Your AlgoZenith token has expired. Please log in again.',
                'warning'
            )
        }
    }

    // Get stored user and JWT token (same pattern as popup.js)
    async getStoredUser() {
        const result = await chrome.storage.local.get(['chocoUser'])
        return result.chocoUser || null
    }

    // Validate user authentication (simplified version of popup.js validateUser)
    async validateUser() {
        const user = await this.getStoredUser()
        if (!user || !user.token) {
            return { valid: false, reason: 'No user or token stored' }
        }
        return { 
            valid: true, 
            user: user,
            token: user.token
        }
    }

    async getSettings() {
        const result = await chrome.storage.local.get(['chocoSettings'])
        return result.chocoSettings || {
            autoTokenRefresh: true,
            notificationsEnabled: true,
            backendUrl: this.backendUrl
        }
    }

    async showNotification(title, message, type = 'info') {
        const settings = await this.getSettings()
        
        if (!settings.notificationsEnabled) {
            return
        }

        const iconUrl = type === 'success' ? 'assets/icon-success.png' :
                       type === 'error' ? 'assets/icon-error.png' :
                       type === 'warning' ? 'assets/icon-warning.png' :
                       'assets/icon-48.png'

        if (chrome.notifications) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: iconUrl,
                title: title,
                message: message
            })
        } else {
            console.warn('Chrome notifications API not available')
        }
    }
}

// Initialize background service
new ChocoBackground()
