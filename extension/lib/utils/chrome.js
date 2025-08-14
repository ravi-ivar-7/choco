class ChromeUtils {
    static async waitForChromeAPIs() {
        return new Promise((resolve) => {
            const checkAPIs = () => {
                if (chrome?.runtime && chrome?.storage && chrome?.tabs && chrome?.scripting) {
                    resolve()
                } else {
                    setTimeout(checkAPIs, 50)
                }
            }
            checkAPIs()
        })
    }



    static async getAllTabs() {
        try {
            const tabs = await chrome.tabs.query({})
            return {
                success: true,
                error: null,
                message: `Retrieved ${tabs.length} tabs`,
                data: { tabs }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Tab query error',
                message: `Failed to get all tabs: ${error.message}`,
                data: null
            }
        }
    }

    static async openTab(url, active = true) {
        try {
            const tab = await chrome.tabs.create({ url, active })
            return {
                success: true,
                error: null,
                message: 'Tab opened successfully',
                data: { tab }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Tab creation error',
                message: `Failed to open tab: ${error.message}`,
                data: null
            }
        }
    }

    static async closeTab(tabId) {
        try {
            await chrome.tabs.remove(tabId)
            return {
                success: true,
                error: null,
                message: 'Tab closed successfully',
                data: { tabId }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Tab close error',
                message: `Failed to close tab ${tabId}: ${error.message}`,
                data: null
            }
        }
    }

    static async injectContentScript(tabId, files = [
        'lib/config/constants.js',
        'lib/utils/chrome.js',
        'lib/utils/notifications.js',
        'lib/utils/browserData.js',
        'scripts/monitorStorage.js',
        'scripts/notificationHandler.js',
        'content.js'
    ]) {
        try {
            // Check if scripts are already injected
            const checkResult = await chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                    return typeof window.ChromeUtils !== 'undefined' && 
                           typeof window.NotificationHandler !== 'undefined' &&
                           typeof window.Constants !== 'undefined';
                }
            });
            
            // If scripts already loaded, return success without re-injecting
            if (checkResult && checkResult[0] && checkResult[0].result) {
                return {
                    success: true,
                    error: null,
                    message: 'Content scripts already injected',
                    data: { tabId, files, alreadyInjected: true }
                };
            }
            
            // Scripts not loaded, inject them
            await chrome.scripting.executeScript({
                target: { tabId },
                files
            });
            return {
                success: true,
                error: null,
                message: 'Content script injected successfully',
                data: { tabId, files }
            }
        } catch (error) {
            console.error('📜 Content script injection failed for tab:', tabId, error.message);
            return {
                success: false,
                error: 'Script injection error',
                message: `Failed to inject script in tab ${tabId}: ${error.message}`,
                data: null
            }
        }
    }

    static async executeScript(tabId, func, args = []) {
        try {
            const [result] = await chrome.scripting.executeScript({
                target: { tabId },
                func,
                args
            })
            return {
                success: true,
                error: null,
                message: 'Script executed successfully',
                data: { result: result?.result, tabId }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Script execution error',
                message: `Failed to execute script in tab ${tabId}: ${error.message}`,
                data: null
            }
        }
    }

    static async sendMessageToTab(tabId, message, options = {}) {
        try {
            const response = await chrome.tabs.sendMessage(tabId, message, options)
            return {
                success: true,
                error: null,
                message: 'Message sent to tab successfully',
                data: { response, tabId, message }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Message send error',
                message: `Failed to send message to tab ${tabId}: ${error.message}`,
                data: null
            }
        }
    }

    static async sendMessageToBackground(message) {
        return new Promise((resolve) => {
            try {
                chrome.runtime.sendMessage(message, (response) => {
                    if (chrome.runtime.lastError) {
                        resolve({
                            success: false,
                            error: 'Runtime error',
                            message: `Background message error: ${chrome.runtime.lastError.message}`,
                            data: null
                        })
                    } else {
                        resolve({
                            success: true,
                            error: null,
                            message: 'Message sent to background successfully',
                            data: { response, message }
                        })
                    }
                })
            } catch (error) {
                resolve({
                    success: false,
                    error: 'Message send error',
                    message: `Failed to send background message: ${error.message}`,
                    data: null
                })
            }
        })
    }

    static async broadcastMessage(message, tabFilter = {}) {
        try {
            const tabs = await chrome.tabs.query(tabFilter)
            const results = await Promise.allSettled(
                tabs.map(tab => this.sendMessageToTab(tab.id, message))
            )
            
            const broadcastResults = results.map((result, index) => ({
                tabId: tabs[index].id,
                success: result.status === 'fulfilled' && result.value.success,
                response: result.status === 'fulfilled' ? result.value.data?.response : null,
                error: result.status === 'rejected' ? result.reason : (result.value.success ? null : result.value.error)
            }))
            
            const successCount = broadcastResults.filter(r => r.success).length
            
            return {
                success: true,
                error: null,
                message: `Message broadcast to ${tabs.length} tabs (${successCount} successful)`,
                data: { 
                    results: broadcastResults,
                    totalTabs: tabs.length,
                    successfulTabs: successCount,
                    message
                }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Broadcast error',
                message: `Failed to broadcast message: ${error.message}`,
                data: null
            }
        }
    }
    
    static async getCurrentDomain(url = null) {
        try {
            let hostname
            
            if (url) {
                hostname = new URL(url).hostname
            } else {
                // Fallback: get current tab URL if no URL provided
                const activeTabResult = await ChromeUtils.getActiveTab()
                if (!activeTabResult.success) {
                    return null
                }
                hostname = new URL(activeTabResult.data.url).hostname
            }
            
            for (const [key, domain] of Object.entries(Constants.DOMAINS)) {
                if (hostname === domain.PRIMARY || hostname.endsWith(`.${domain.PRIMARY}`)) {
                    return { key, domain }
                }
            }
            
            return null
        } catch (error) {
            return null
        }
    }
    
    static async getActiveTab() {
        try {
            return new Promise(resolve => {
                chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                    const activeTab = tabs[0]
                    if (activeTab) {
                        resolve({
                            success: true,
                            data: activeTab,
                            error: null
                        })
                    } else {
                        resolve({
                            success: false,
                            data: null,
                            error: 'No active tab found'
                        })
                    }
                })
            })
        } catch (error) {
            return {
                success: false,
                data: null,
                error: error.message
            }
        }
    }
}

// Make ChromeUtils available globally for content script context
if (typeof window !== 'undefined') {
    window.ChromeUtils = ChromeUtils;
}
