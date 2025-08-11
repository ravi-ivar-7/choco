// Choco Extension Content Script for maang.in
class ChocoContentScript {
    constructor() {
        this.isInitialized = false
        this.init()
    }

    async init() {
        if (this.isInitialized) return
        
        console.log('Choco content script initialized on', window.location.href)
        this.isInitialized = true

        // Wait for page to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start())
        } else {
            this.start()
        }
    }

    async start() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse)
            return true
        })
        
        // Start monitoring for login events
        this.startLoginMonitoring()
        console.log('Choco content script ready, monitoring for login events')
    }

    // Monitor for login events on maang.in
    async startLoginMonitoring() {
        console.log('🔍 Starting login monitoring on maang.in')
        
        // Check for tokens immediately
        this.checkForNewTokens()
        
        // Monitor for URL changes (SPA navigation)
        let currentUrl = window.location.href
        setInterval(() => {
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href
                console.log('URL changed to:', currentUrl)
                // Check for tokens after navigation
                setTimeout(() => this.checkForNewTokens(), 2000)
            }
        }, 1000)
        
        // Monitor for DOM changes that might indicate login
        this.observeLoginChanges()
        
        // Periodic token check (every 30 seconds)
        setInterval(() => {
            this.checkForNewTokens()
        }, 30000)
    }

    // Observe DOM changes that might indicate login/logout
    observeLoginChanges() {
        const observer = new MutationObserver((mutations) => {
            let shouldCheck = false
            
            mutations.forEach((mutation) => {
                // Check if any added nodes contain login/logout indicators
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const text = node.textContent?.toLowerCase() || ''
                            // Look for login/logout related text changes
                            if (text.includes('login') || text.includes('logout') || 
                                text.includes('dashboard') || text.includes('profile') ||
                                text.includes('welcome') || text.includes('sign')) {
                                shouldCheck = true
                            }
                        }
                    })
                }
            })
            
            if (shouldCheck) {
                console.log('DOM changes detected, checking for tokens...')
                setTimeout(() => this.checkForNewTokens(), 1000)
            }
        })
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        })
    }

    // Check for new tokens and notify background script
    async checkForNewTokens() {
        try {
            // Get current cookies
            const cookies = await this.getCookies()
            
            if (cookies.refreshToken) {
                console.log('🍪 Found refresh token in cookies!')
                
                // Notify background script about new token
                chrome.runtime.sendMessage({
                    type: 'TOKEN_DETECTED',
                    token: {
                        refreshToken: cookies.refreshToken,
                        accessToken: cookies.accessToken,
                        source: 'content_script_detection'
                    }
                }, (response) => {
                    if (response?.success) {
                        console.log('✅ Token detection sent to background script')
                    } else {
                        console.log('❌ Failed to send token to background script')
                    }
                })
            }
        } catch (error) {
            console.error('Error checking for tokens:', error)
        }
    }

    // Get cookies from current page
    async getCookies() {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({
                type: 'GET_COOKIES',
                url: window.location.href
            }, (response) => {
                resolve(response?.cookies || {})
            })
        })
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.type) {
                case 'TOKEN_REFRESH_NEEDED':
                    await this.handleTokenRefresh(request.status)
                    sendResponse({ success: true })
                    break

                default:
                    sendResponse({ success: false, error: 'Unknown message type' })
            }
        } catch (error) {
            console.error('Content script message handling error:', error)
            sendResponse({ success: false, error: error.message })
        }
    }



    async handleTokenRefresh(status) {
        if (!status.valid) {
            this.showLoginPrompt()
        }
    }

    showLoginPrompt() {
        // Only show login prompt if token is actually invalid
        const prompt = document.createElement('div')
        prompt.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            z-index: 10001;
            text-align: center;
            max-width: 400px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `

        prompt.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 16px;">🍫</div>
            <h3 style="margin: 0 0 12px 0; color: #333;">Choco Token Refresh</h3>
            <p style="margin: 0 0 20px 0; color: #666; font-size: 14px;">
                Your team's AlgoZenith token needs to be refreshed. Please log in to update it for everyone.
            </p>
            <button id="choco-login-btn" style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                font-size: 14px;
                cursor: pointer;
                margin-right: 8px;
            ">Log In Now</button>
            <button id="choco-dismiss-btn" style="
                background: #f3f4f6;
                color: #374151;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                font-size: 14px;
                cursor: pointer;
            ">Dismiss</button>
        `

        document.body.appendChild(prompt)

        // Add event listeners
        prompt.querySelector('#choco-login-btn').addEventListener('click', () => {
            window.location.href = '/login'
            prompt.remove()
        })

        prompt.querySelector('#choco-dismiss-btn').addEventListener('click', () => {
            prompt.remove()
        })
    }
}

// Initialize content script
if (typeof window !== 'undefined' && window.location.href.includes('maang.in')) {
    new ChocoContentScript()
}
