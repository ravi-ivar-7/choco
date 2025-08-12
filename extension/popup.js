class ChocoPopup {
    constructor() {
        this.backendUrl = Constants.BACKEND_URL
        this.userAPI = new UserAPI(this.backendUrl)
        this.credentialsAPI = new CredentialsAPI(this.backendUrl)
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
            this.updateStatus('checking', 'Great! Welcome back, ' + user.name + '!')
            await new Promise(resolve => setTimeout(resolve, 500))

            this.updateStatus('checking', '🔍 Looking in your browser...', 'Checking if you\'re already signed into the web platform')
            await new Promise(resolve => setTimeout(resolve, 500))

            const browserDataResult = await BrowserDataCollector.getBrowserData(Constants.DOMAINS.MAIN.URL)

            if (!browserDataResult.success) {
                this.updateStatus('expired', '⚠️ Platform Access Issue', 'Unable to collect browser data')
                this.setLoading(false)
                return
            }

            const filterResult = await CredentialValidator.validateCredentials(browserDataResult.data.credentials, 'filter')
            const credentials = filterResult.success ? filterResult.data.credentials : browserDataResult.data.credentials
            
            const validation = await CredentialValidator.validateCredentials(credentials)

            console.log(validation, 'validtion in popup')

            if (validation.success) {
                this.updateStatus('checking', '✅ Found your web platform login!', 'Great! You\'re already signed in')
                await new Promise(resolve => setTimeout(resolve, 500))

                this.updateStatus('checking', '🎉 Sharing with your team...', 'Setting up access for everyone on your team')
                await new Promise(resolve => setTimeout(resolve, 500))
                
                this.updateStatus('checking', '🎉 Sharing with your team...', 'Setting up access for everyone on your team')
                await new Promise(resolve => setTimeout(resolve, 500))
                
                const existingCredsResult = await this.credentialsAPI.getCredentials(userValidation.data.token)
                
                let shouldStore = true
                const existingCredentials = existingCredsResult.data?.credentials || []
                if (existingCredsResult.success && existingCredentials.length > 0) {
                    for (let i = 0; i < existingCredentials.length; i++) {
                        const storedCred = existingCredentials[i]
                        
                        const comparisonResult = await CredentialValidator.validateCredentials(
                            credentials, 
                            'match_provided', 
                            storedCred
                        )
                        
                        if (comparisonResult.success) {
                            shouldStore = false
                            this.updateStatus('success', '✨ All set! Your team is ready', 'Credentials are already up to date')
                            break
                        }
                    }
                }
                
                let storeResult = { success: true }
                if (shouldStore) {
                    this.updateStatus('checking', '💾 Storing new credentials...', 'Saving updated credentials for your team')
                    storeResult = await this.credentialsAPI.storeCredentials(userValidation.data.token, credentials)
                }

                if (storeResult.success) {
                    this.updateStatus('success', '✨ All set! Your team is ready', 'Everyone can now access the web platform easily')
                } else {
                    this.updateStatus('error', '😔 Oops! Couldn\'t share with team', storeResult.error || 'Something went wrong while setting up team access')
                }

            } else {
                this.updateStatus('checking', '🔍 No web platform login found', 'You\'re not signed into the web platform yet - let me check with your team')
                await new Promise(resolve => setTimeout(resolve, 500))

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

    async handleTokenFromDB() {
        try {
            const userValidation = await this.userAPI.validateUser()
            if (!userValidation.success) {
                return { success: false, error: 'User not authenticated' }
            }

            const teamCredentialsResponse = await this.credentialsAPI.getCredentials(userValidation.data.token)

            const credentials = teamCredentialsResponse.data?.credentials
            if (!teamCredentialsResponse.success || !credentials || credentials.length === 0) {
                return { success: false, error: 'No credentials', message: 'Your teammates haven\'t set up web platform access yet', data: null }
            }

            console.log('Processing', credentials.length, 'team credentials')
            
            for (const teamCredential of credentials) {
                console.log('Checking team credential structure:', {
                    cookies: teamCredential.cookies ? Object.keys(teamCredential.cookies) : [],
                    localStorage: teamCredential.localStorage ? Object.keys(teamCredential.localStorage) : [],
                    sessionStorage: teamCredential.sessionStorage ? Object.keys(teamCredential.sessionStorage) : []
                })
                
                const validation = await CredentialValidator.validateCredentials(teamCredential, 'validate_structure')
                console.log('Structure validation result:', validation)

                if (!validation.success) {
                    console.log('Skipping credential - structure validation failed')
                    continue
                }

                console.log('Attempting to apply team credential to browser')
                
                try {
                    const activeTabResult = await BrowserDataCollector.getActiveTab()
                    console.log('Active tab result:', activeTabResult)
                    
                    if (!activeTabResult.success || !activeTabResult.data) {
                        console.log('Failed to get active tab, skipping credential')
                        continue
                    }

                    console.log('Setting browser data for tab:', activeTabResult.data.id)
                    const setBrowserDataResult = await BrowserDataCollector.setBrowserData(activeTabResult.data.id, teamCredential)
                    console.log('Set browser data result:', setBrowserDataResult)

                    if (setBrowserDataResult.success) {
                        console.log('Browser data set successfully, validating against browser')
                        const validation = await CredentialValidator.validateCredentials(teamCredential)
                        console.log('Final validation result:', validation)

                        if (validation.success) {
                            console.log('✅ Team credential successfully applied and validated!')
                            return {
                                success: true,
                                error: null,
                                message: 'Great! Using access shared by your teammate - verified and ready',
                                data: { credentials: teamCredential, setBrowserDataResult, validated: true, validationResults: validation }
                            }
                        } else {
                            return {
                                success: true,
                                error: null,
                                message: 'Team credentials applied successfully',
                                data: { credentials: teamCredential, setBrowserDataResult, validated: false }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error setting browser data for credential:', error)
                    continue
                }
            }

            // Clean up invalid tokens 
            // const cleanupResult = await this.credentialsAPI.cleanupTokens(userValidation.data.token)

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

    async showRefreshNotification(customMessage = null) {
        try {
            const tabs = await chrome.tabs.query({ url: Constants.DOMAINS.MAIN.PATTERNS })

            if (tabs && tabs.length > 0) {
                for (const tab of tabs) {
                    try {
                        // Show toast notification
                        const toastResult = await ChromeUtils.sendMessageToTab(tab.id, {
                            type: 'SHOW_TOAST_NOTIFICATION',
                            title: 'Team Access Ready',
                            message: customMessage || '🔄 Your team has web platform access ready! Please refresh this page to access the platform with shared credentials.',
                            notificationType: 'success'
                        })

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
                    } catch (error) {
                        console.error('❌ showRefreshNotification: Error sending to tab:', error)
                    }
                }
            } else {
                console.log(`⚠️ showRefreshNotification: No ${Constants.DOMAINS.MAIN.PRIMARY} tabs found or getMaangTabs failed`)
                console.log('⚠️ showRefreshNotification: tabsResult:', tabsResult)
            }
        } catch (error) {
            console.error('❌ showRefreshNotification: Outer error:', error)
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
        const result = await ChromeUtils.openTab(Constants.DOMAINS.MAIN.URL)
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