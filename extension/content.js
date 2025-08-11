// Choco Extension Content Script for maang.in
class ChocoContentScript {
    constructor() {
        console.log('🚀 Choco content script starting on:', window.location.href)
        this.isInitialized = false
        
        // Wait for DOM to be ready before setting up notifications
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                console.log('📄 DOM loaded, setting up notifications...')
                this.setupInPageNotifications()
                this.init()
            })
        } else {
            console.log('📄 DOM already ready, setting up notifications...')
            this.setupInPageNotifications()
            this.init()
        }
    }
    
    // Setup in-page notification system
    setupInPageNotifications() {
        console.log('🔧 Setting up in-page notification system...')
        
        // Create notification container if it doesn't exist
        if (!document.getElementById('choco-notifications')) {
            const container = document.createElement('div')
            container.id = 'choco-notifications'
            container.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                z-index: 10000;
                pointer-events: none;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `
            document.body.appendChild(container)
            console.log('✅ In-page notification container created and added to DOM')
        } else {
            console.log('⚠️ Notification container already exists')
        }
    }
    
    // Show in-page toast notification
    showInPageNotification(title, message, type = 'info', duration = 5000) {
        console.log(`🔔 Showing in-page notification: ${title} - ${message}`)
        
        const container = document.getElementById('choco-notifications')
        if (!container) {
            console.error('❌ Notification container not found')
            return
        }
        
        // Create notification element
        const notification = document.createElement('div')
        const notificationId = 'choco-notif-' + Date.now()
        notification.id = notificationId
        
        // Set colors based on type
        let bgColor, borderColor, icon
        switch (type) {
            case 'success':
                bgColor = '#10b981'
                borderColor = '#059669'
                icon = '✅'
                break
            case 'error':
                bgColor = '#ef4444'
                borderColor = '#dc2626'
                icon = '❌'
                break
            case 'warning':
                bgColor = '#f59e0b'
                borderColor = '#d97706'
                icon = '⚠️'
                break
            default:
                bgColor = '#3b82f6'
                borderColor = '#2563eb'
                icon = '🔔'
        }
        
        notification.style.cssText = `
            background: ${bgColor};
            color: white;
            padding: 16px 20px;
            margin-bottom: 12px;
            border-radius: 8px;
            border-left: 4px solid ${borderColor};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            max-width: 400px;
            min-width: 300px;
            pointer-events: auto;
            cursor: pointer;
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
            opacity: 0;
            position: relative;
        `
        
        notification.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="font-size: 18px; flex-shrink: 0;">${icon}</span>
                <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${title}</div>
                    <div style="font-size: 13px; opacity: 0.95; line-height: 1.4;">${message}</div>
                </div>
                <button style="
                    background: none;
                    border: none;
                    color: white;
                    font-size: 16px;
                    cursor: pointer;
                    padding: 0;
                    margin-left: 8px;
                    opacity: 0.7;
                    flex-shrink: 0;
                " onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `
        
        // Add to container
        container.appendChild(notification)
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)'
            notification.style.opacity = '1'
        }, 10)
        
        // Auto-remove after duration
        setTimeout(() => {
            if (document.getElementById(notificationId)) {
                notification.style.transform = 'translateX(100%)'
                notification.style.opacity = '0'
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove()
                    }
                }, 300)
            }
        }, duration)
        
        // Click to dismiss
        notification.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)'
            notification.style.opacity = '0'
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove()
                }
            }, 300)
        })
        
        console.log('✅ In-page notification displayed:', notificationId)
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
            console.log('🔍 Checking for tokens on maang.in...')
            
            // Get current cookies
            const cookies = await this.getCookies()
            console.log('🍪 Current cookies:', {
                hasRefresh: !!cookies.refreshToken,
                hasAccess: !!cookies.accessToken,
                refreshPreview: cookies.refreshToken ? cookies.refreshToken.substring(0, 20) + '...' : null
            })
            
            if (cookies.refreshToken) {
                console.log('🎉 Found refresh token! Notifying background script...')
                
                // Store the last sent token to avoid spam
                const lastToken = localStorage.getItem('choco_last_sent_token')
                if (lastToken === cookies.refreshToken) {
                    console.log('⏭️ Same token already sent, skipping...')
                    return
                }
                
                // Notify background script about new token
                chrome.runtime.sendMessage({
                    type: 'TOKEN_DETECTED',
                    token: {
                        refreshToken: cookies.refreshToken,
                        accessToken: cookies.accessToken,
                        source: 'content_script_detection'
                    }
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('❌ Runtime error:', chrome.runtime.lastError)
                        return
                    }
                    
                    if (response?.success) {
                        console.log('✅ Token detection sent to background script successfully!')
                        // Remember this token to avoid resending
                        localStorage.setItem('choco_last_sent_token', cookies.refreshToken)
                    } else {
                        console.error('❌ Background script failed to process token:', response)
                    }
                })
            } else {
                console.log('⚠️ No refresh token found in cookies')
            }
        } catch (error) {
            console.error('❌ Error checking for tokens:', error)
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
        console.log('Content script received message:', request.type)
        
        switch (request.type) {
            case 'SHOW_TOKEN_REFRESH_MODAL':
                this.showTokenRefreshModal()
                sendResponse({ success: true })
                break
                
            case 'GET_COOKIES':
                const cookies = await this.getCookies()
                sendResponse({ success: true, cookies })
                break
                
            case 'SHOW_NOTIFICATION':
                this.showInPageNotification(
                    request.title,
                    request.message,
                    request.notificationType || 'info'
                )
                sendResponse({ success: true })
                break
                
            case 'TOKEN_REFRESH_NEEDED':
                await this.handleTokenRefresh(request.status)
                sendResponse({ success: true })
                break
                
            default:
                sendResponse({ success: false, error: 'Unknown message type' })
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
                Your team's web platform token needs to be refreshed. Please log in to update it for everyone.
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
if (window.location.href.includes('maang.in')) {
    new ChocoContentScript()
}
