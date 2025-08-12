importScripts(
    'lib/api/user.js',
    'lib/api/platform.js',
    'lib/platforms/maang/index.js',
    'lib/utils/chrome.js',
    'lib/utils/storage.js',
    'lib/utils/notifications.js'
)

class ChocoBackground {
    constructor() {
        this.backendUrl ='https://algochoco.vercel.app'
        this.userAPI = new UserAPI(this.backendUrl)
        this.platformAPI = new PlatformAPI(this.backendUrl)
        this.init()
    }

    async init() {
        this.setupEventListeners()
        this.setupPeriodicTasks()
    }

    setupEventListeners() {
        chrome.runtime.onInstalled.addListener(() => {
            this.initializeExtension()
        })

        if (chrome.tabs) {
            chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
                if (changeInfo.status === 'complete') {
                    const domainCheck = MaangPlatform.isMaangDomain(tab.url)
                    if (domainCheck.success && domainCheck.data.isMaang) {
                        this.handleMaangPageLoad(tabId, tab.url)
                    }
                }
            })
        }

        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse)
            return true
        })
    }

    setupPeriodicTasks() {
        this.scheduleTokenCheck()
    }

    scheduleTokenCheck() {
        setTimeout(() => {
            this.performPeriodicTokenCheck()
            this.scheduleTokenCheck()
        }, 30 * 60 * 1000)
    }

    async initializeExtension() {
        const settingsResult = await StorageUtils.setSettings({
            autoTokenRefresh: true,
            notificationsEnabled: true,
            backendUrl: this.backendUrl
        })
        if (!settingsResult.success) {
            console.warn('Failed to initialize extension settings:', settingsResult.message)
        }
    }

    async handleMaangPageLoad(tabId, url) {
        const injectionResult = await ChromeUtils.injectContentScript(tabId, ['content.js'])
        if (!injectionResult.success) {
            console.warn('Failed to inject content script:', injectionResult.message)
        }
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.type) {
                case 'GET_TOKEN_STATUS':
                    const status = await this.checkTokenStatus()
                    sendResponse(status)
                    break

                case 'STORE_TOKEN':
                    const result = await this.saveNewToken(request.token, sender.tab)
                    sendResponse(result)
                    break

                case 'GET_COOKIES':
                    const cookiesResult = await MaangPlatform.getCookiesFromUrl(request.url)
                    sendResponse(cookiesResult)
                    break

                case 'VALIDATE_PLATFORM_TOKEN':
                    const validation = await MaangPlatform.validateRefreshToken(request.token)
                    sendResponse(validation)
                    break

                case 'GET_TEAM_TOKENS':
                    try {
                        const userValidation = await this.userAPI.validateUser()
                        if (!userValidation.success) {
                            sendResponse({ success: false, error: 'Authentication required', message: 'User not authenticated', data: null })
                        } else {
                            const teamTokensResult = await this.platformAPI.getTokens(userValidation.data.token)
                            sendResponse(teamTokensResult)
                        }
                    } catch (error) {
                        sendResponse({ success: false, error: 'Request error', message: `Failed to get team tokens: ${error.message}`, data: null })
                    }
                    break

                default:
                    sendResponse({ success: false, error: 'Unknown message type' })
            }
        } catch (error) {
            sendResponse({ success: false, error: error.message })
        }
    }

    async checkTokenStatus() {
        try {
            const userValidation = await this.userAPI.validateUser()
            if (!userValidation.success) {
                return {
                    success: false,
                    error: 'Authentication required',
                    message: 'User not authenticated',
                    data: { needsLogin: true }
                }
            }

            const browserTokensResult = await MaangPlatform.getCookiesFromUrl('https://maang.in')
            if (browserTokensResult.success && browserTokensResult.data.cookies.refreshToken) {
                const tokenValidation = await MaangPlatform.validateRefreshToken(browserTokensResult.data.cookies.refreshToken)
                if (tokenValidation.success) {
                    return {
                        success: true,
                        error: null,
                        message: 'Valid browser tokens found',
                        data: {
                            user: userValidation.data.user,
                            tokens: browserTokensResult.data.cookies,
                            source: 'browser'
                        }
                    }
                }
            }

            const teamTokensResult = await this.platformAPI.getTokens(userValidation.data.token)
            if (teamTokensResult.success && teamTokensResult.data.tokens && teamTokensResult.data.tokens.length > 0) {
                return {
                    success: true,
                    error: null,
                    message: 'Valid team tokens found',
                    data: {
                        user: userValidation.data.user,
                        tokens: teamTokensResult.data.tokens[0],
                        source: 'team'
                    }
                }
            }

            return {
                success: false,
                error: 'No tokens available',
                message: 'No valid tokens available',
                data: { needsTokenRefresh: true }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Token check error',
                message: `Token status check failed: ${error.message}`,
                data: null
            }
        }
    }

    async saveNewToken(token, tab) {
        try {
            const userValidation = await this.userAPI.validateUser()
            if (!userValidation.success) {
                return { success: false, error: 'User not authenticated' }
            }

            const platformTokenData = {
                refreshToken: token.refreshToken,
                accessToken: token.accessToken,
                source: token.source || 'extension',
                metadata: {
                    detectedAt: token.detectedAt || Date.now(),
                    tabUrl: tab?.url
                }
            }

            const result = await this.platformAPI.storeToken(userValidation.data.token, platformTokenData)
            
            if (result.success) {
                const storageResult = await StorageUtils.set({
                    lastTokenUpdate: {
                        ...token,
                        detectedAt: Date.now(),
                        tabUrl: tab?.url
                    }
                })
                if (!storageResult.success) {
                    console.warn('Failed to store token update locally:', storageResult.message)
                }
            }

            return result
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async performPeriodicTokenCheck() {
        const statusResult = await this.checkTokenStatus()
        
        if (!statusResult.success) {
            const tabsResult = await MaangPlatform.getMaangTabs()
            
            if (tabsResult.success && tabsResult.data.tabs.length > 0) {
                for (const tab of tabsResult.data.tabs) {
                    try {
                        const messageResult = await ChromeUtils.sendMessageToTab(tab.id, {
                            type: 'SHOW_NOTIFICATION',
                            title: 'Token Expired',
                            message: '⚠️ Your web platform token has expired. Please log in again.',
                            notificationType: 'warning'
                        })
                        if (!messageResult.success) {
                            console.warn('Failed to send notification to tab:', messageResult.message)
                        }
                    } catch (error) {
                        console.warn('Error during periodic token check notification:', error)
                    }
                }
            }
        }
    }
}

new ChocoBackground()