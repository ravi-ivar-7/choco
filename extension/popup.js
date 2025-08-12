class ChocoPopup {
    constructor() {
        this.backendUrl = 'https://algochoco.vercel.app'
        this.userAPI = new UserAPI(this.backendUrl)
        this.platformAPI = new PlatformAPI(this.backendUrl)
        this.init()
    }

    async init() {
        this.bindEvents()
        this.updateStatus('none', '👋 Welcome to Choco Team Access Manager', 'Click "Check Token Status" to get started')
    }

    bindEvents() {
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.checkTokenStatus()
        })

        document.getElementById('loginBtn').addEventListener('click', () => {
            this.openWebPlatform()
        })

        document.getElementById('adminBtn').addEventListener('click', () => {
            this.openAdminDashboard()
        })

        document.getElementById('helpLink').addEventListener('click', (e) => {
            e.preventDefault()
            this.openAdminDashboard()
        })

        document.getElementById('loginSubmitBtn').addEventListener('click', () => {
            this.handleLogin()
        })

        document.getElementById('passwordInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin()
            }
        })
    }

    async checkTokenStatus() {
        this.setLoading(true)

        try {
            this.updateStatus('checking', '👋 Hi there! Let me check your account...', 'Just making sure you\'re logged into Choco')
            await new Promise(resolve => setTimeout(resolve, 500))

            const userValidation = await this.userAPI.validateUser()

            if (!userValidation.success) {
                this.updateStatus('none', '🔑 Please log in first', 'I need to know who you are to help your team')
                this.showLoginForm(true)
                this.setLoading(false)
                return
            }

            const user = userValidation.data.user
            this.updateStatus('checking', '✅ Great! I know who you are', `Welcome back, ${user.name}!`)
            await new Promise(resolve => setTimeout(resolve, 300))

            this.updateStatus('checking', '🔍 Looking in your browser...', 'Checking if you\'re already signed into the web platform')
            await new Promise(resolve => setTimeout(resolve, 500))

            const browserTokensResult = await MaangPlatform.getCookiesFromUrl('https://maang.in')

            if (!browserTokensResult.success) {
                this.updateStatus('expired', '⚠️ Platform Access Issue', 'Unable to check platform cookies')
                this.setLoading(false)
                return
            }

            const browserTokens = browserTokensResult.data.cookies

            if (browserTokens && browserTokens.refreshToken) {
                this.updateStatus('checking', '✅ Found your web platform login!', 'Great! You\'re already signed in')
                await new Promise(resolve => setTimeout(resolve, 300))

                this.updateStatus('checking', '🎉 Sharing with your team...', 'Setting up access for everyone on your team')
                await new Promise(resolve => setTimeout(resolve, 500))

                const storeResult = await this.platformAPI.storeToken(userValidation.data.token, browserTokens)

                if (storeResult.success) {
                    this.updateStatus('success', '✨ All set! Your team is ready', 'Everyone can now access the web platform easily')
                } else {
                    this.updateStatus('error', '😔 Oops! Couldn\'t share with team', storeResult.error || 'Something went wrong while setting up team access')
                }

            } else {
                this.updateStatus('checking', '🔍 No web platform login found', 'You\'re not signed into the web platform yet - let me check with your team')
                await new Promise(resolve => setTimeout(resolve, 300))

                this.updateStatus('checking', '👥 Asking your teammates for help...', 'Maybe someone already set this up?')
                await new Promise(resolve => setTimeout(resolve, 500))

                const handleTokenFromDB = await this.handleTokenFromDB()

                if (handleTokenFromDB.success) {
                    this.updateStatus('success', '🎉 Great! Your team has you covered', handleTokenFromDB.message)
                    this.showRefreshNotification('🎉 Team access ready! Refresh this page to login automatically.')
                } else {
                    this.updateStatus('expired', '🔑 Web Platform Access Required', 'No team access found - Please sign into the web platform to set up access for your team')
                    this.showLoginButton(true)
                }
            }
        } catch (error) {
            this.updateStatus('expired', '⚠️ Connection Issue', 'Unable to connect to Choco backend - Please check your internet connection')
            this.showLoginForm(true)
        }

        this.setLoading(false)
    }

    async showRefreshNotification(customMessage = null) {
        try {
            console.log('🔍 showRefreshNotification: Starting notification flow')
            const tabsResult = await MaangPlatform.getMaangTabs()
            console.log('🔍 showRefreshNotification: getMaangTabs result:', tabsResult)

            if (tabsResult.success && tabsResult.data.tabs.length > 0) {
                console.log(`🔍 showRefreshNotification: Found ${tabsResult.data.tabs.length} maang.in tabs`)
                for (const tab of tabsResult.data.tabs) {
                    console.log(`🔍 showRefreshNotification: Sending notifications to tab ${tab.id} (${tab.url})`)
                    try {
                        // Show toast notification
                        const toastResult = await ChromeUtils.sendMessageToTab(tab.id, {
                            type: 'SHOW_TOAST_NOTIFICATION',
                            title: 'Team Access Ready',
                            message: customMessage || '🔄 Your team has web platform access ready! Please refresh this page to access the platform with shared credentials.',
                            notificationType: 'success'
                        })
                        console.log('🔍 showRefreshNotification: Toast result:', toastResult)

                        // Show dialog notification with refresh link
                        const dialogResult = await ChromeUtils.sendMessageToTab(tab.id, {
                            type: 'SHOW_DIALOG_NOTIFICATION',
                            title: 'Team Access Ready',
                            message: 'Your team credentials are now active. Refresh this page to login automatically.',
                            notificationType: 'success',
                            actionButton: {
                                text: 'Refresh Page',
                                href: '/',
                                target: '_self'
                            },
                            cancelButton: {
                                text: 'Later',
                                href: null,
                                target: '_self'
                            }
                        })
                        console.log('🔍 showRefreshNotification: Dialog result:', dialogResult)
                    } catch (error) {
                        console.error('❌ showRefreshNotification: Error sending to tab:', error)
                    }
                }
            } else {
                console.log('⚠️ showRefreshNotification: No maang.in tabs found or getMaangTabs failed')
                console.log('⚠️ showRefreshNotification: tabsResult:', tabsResult)
            }
        } catch (error) {
            console.error('❌ showRefreshNotification: Outer error:', error)
        }
    }



    async handleTokenFromDB() {
        try {
            const userValidation = await this.userAPI.validateUser()
            if (!userValidation.success) {
                return { success: false, error: 'User not authenticated' }
            }

            const teamTokensResponse = await this.platformAPI.getTokens(userValidation.data.token)

            console.log('team tokien resons in check team toien from db', teamTokensResponse)

            const tokens = teamTokensResponse.data?.tokens
            if (!teamTokensResponse.success || !tokens || tokens.length === 0) {
                return { success: false, error: 'No tokens', message: 'Your teammates haven\'t set up web platform access yet', data: null }
            }

            for (const teamToken of tokens) {

                const now = new Date()
                let hasValidToken = false

                const tokenForValidation = {}

                if (teamToken.refreshToken) {
                    const refreshExpired = teamToken.refreshTokenExpiresAt && new Date(teamToken.refreshTokenExpiresAt) < now
                    if (!refreshExpired) {
                        tokenForValidation.refreshToken = teamToken.refreshToken
                        hasValidToken = true
                    }
                }

                if (teamToken.accessToken) {
                    const accessExpired = teamToken.accessTokenExpiresAt && new Date(teamToken.accessTokenExpiresAt) < now
                    if (!accessExpired) {
                        tokenForValidation.accessToken = teamToken.accessToken
                        hasValidToken = true
                    }
                }

                if (!hasValidToken) {
                    continue
                }

                if (hasValidToken) {
                    // Set the team tokens as browser cookies so user can access the platform
                    const setCookiesResult = await MaangPlatform.setCookiesToUrl('https://maang.in', tokenForValidation)

                    if (setCookiesResult.success) {
                        // Now validate the token we just set in the browser
                        const validation = await MaangPlatform.validateRefreshToken(tokenForValidation.refreshToken)
                        
                        if (validation.success) {
                            return {
                                success: true,
                                error: null,
                                message: 'Great! Using access shared by your teammate - verified and ready',
                                data: { token: tokenForValidation, cookiesSet: setCookiesResult.data, validated: true }
                            }
                        } else {
                            return {
                                success: false,
                                error: 'Token validation failed',
                                message: 'Set cookies but token validation failed - token may be invalid',
                                data: null
                            }
                        }
                    } else {
                        return {
                            success: false,
                            error: 'Cookie setting failed',
                            message: `Found team tokens but failed to set browser cookies: ${setCookiesResult.message}`,
                            data: null
                        }
                    }
                }
            }

            // Clean up invalid tokens 
            // const cleanupResult = await this.platformAPI.cleanupTokens(userValidation.data.token)

            return {
                success: false,
                error: 'Expired tokens',
                message: 'All team access options have expired - someone needs to sign in again',
                data: null
            }

        } catch (error) {
            return {
                success: false,
                error: 'Connection error',
                message: 'Couldn\'t connect to your team - please try again',
                data: null
            }
        }
    }

    updateStatus(type, message, details) {
        const badge = document.getElementById('statusBadge')
        const messageEl = document.getElementById('statusMessage')
        const detailsEl = document.getElementById('statusDetails')

        badge.className = `status-badge status-${type}`
        badge.textContent = type === 'checking' ? 'Checking' :
            type === 'active' ? 'Active' :
                type === 'success' ? 'Active' :
                    type === 'expired' ? 'Expired' : 'None'

        messageEl.textContent = message
        detailsEl.textContent = details
    }

    showLoginButton(show) {
        const loginBtn = document.getElementById('loginBtn')
        if (show) {
            loginBtn.classList.remove('hidden')
        } else {
            loginBtn.classList.add('hidden')
        }
    }

    async handleLogin() {
        const email = document.getElementById('emailInput').value.trim()
        const password = document.getElementById('passwordInput').value
        const errorDiv = document.getElementById('loginError')
        const loginBtn = document.getElementById('loginSubmitBtn')
        const loginIcon = document.getElementById('loginIcon')
        const loginText = document.getElementById('loginText')

        errorDiv.classList.add('hidden')

        if (!email || !password) {
            this.showLoginError('Please enter both email and password')
            return
        }

        loginIcon.innerHTML = '<div class="spinner"></div>'
        loginText.textContent = 'Logging in...'
        loginBtn.disabled = true

        const result = await this.userAPI.login(email, password)

        if (result.success) {
            this.showLoginForm(false)
            await this.checkTokenStatus()
        } else {
            this.showLoginError(result.message || result.error || 'Login failed')
        }

        loginIcon.textContent = '🔐'
        loginText.textContent = 'Login to Choco'
        loginBtn.disabled = false
    }

    showLoginForm(show) {
        const loginForm = document.getElementById('loginForm')

        if (show) {
            loginForm.classList.remove('hidden')
            document.getElementById('loginBtn').classList.add('hidden')
        } else {
            loginForm.classList.add('hidden')
            document.getElementById('emailInput').value = ''
            document.getElementById('passwordInput').value = ''
            document.getElementById('loginError').classList.add('hidden')
        }
    }

    showLoginError(message) {
        const errorDiv = document.getElementById('loginError')
        errorDiv.textContent = message
        errorDiv.classList.remove('hidden')
    }

    setLoading(loading) {
        const refreshBtn = document.getElementById('refreshBtn')
        const refreshIcon = document.getElementById('refreshIcon')
        const refreshText = document.getElementById('refreshText')

        if (loading) {
            refreshIcon.innerHTML = '<div class="spinner"></div>'
            refreshText.textContent = 'Checking...'
            refreshBtn.disabled = true
        } else {
            refreshIcon.textContent = '🔄'
            refreshText.textContent = 'Check Token Status'
            refreshBtn.disabled = false
        }
    }

    async openWebPlatform() {
        const result = await ChromeUtils.openTab('https://maang.in')
        if (result.success) {
            window.close()
        } else {
            console.error('Failed to open web platform:', result.message)
        }
    }

    async openAdminDashboard() {
        const result = await ChromeUtils.openTab(`${this.backendUrl}/admin`)
        if (result.success) {
            window.close()
        } else {
            console.error('Failed to open admin dashboard:', result.message)
        }
    }


}

document.addEventListener('DOMContentLoaded', () => {
    new ChocoPopup()
})