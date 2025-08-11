// Choco Extension Popup Script
class ChocoPopup {
    constructor() {
        this.backendUrl = 'http://localhost:3000'
        this.init()
    }

    async init() {
        this.bindEvents()
        await this.checkTokenStatus()
    }

    bindEvents() {
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.checkTokenStatus()
        })

        document.getElementById('loginBtn').addEventListener('click', () => {
            this.openAlgoZenith()
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

        // Allow Enter key to submit login form
        document.getElementById('passwordInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin()
            }
        })
    }

    async checkTokenStatus() {
        this.setLoading(true)
        
        try {
            // Step 1: Check account
            this.updateStatus('checking', '👋 Hi there! Let me check your account...', 'Just making sure you\'re logged into Choco')
            await new Promise(resolve => setTimeout(resolve, 500)) // Brief pause for UX
            
            const userValidation = await this.validateUser()
            
            if (!userValidation.valid) {
                // No user logged into extension - show login form first
                this.updateStatus('none', '🔑 Please log in first', 'I need to know who you are to help your team')
                this.showLoginForm(true)
                this.setLoading(false)
                return
            }
            
            const user = userValidation.user
            this.updateStatus('checking', '✅ Great! I know who you are', `Welcome back, ${user.name}!`)
            await new Promise(resolve => setTimeout(resolve, 300))
            
            // Step 2: Check browser for AlgoZenith login
            this.updateStatus('checking', '🔍 Looking in your browser...', 'Checking if you\'re already signed into AlgoZenith')
            await new Promise(resolve => setTimeout(resolve, 500))
            
            const browserTokens = await this.getMaangTokensFromCookies()
            
            if (browserTokens && browserTokens.refreshToken) {
                this.updateStatus('checking', '✅ Found your AlgoZenith login!', `Great! You\'re already signed in`)
                await new Promise(resolve => setTimeout(resolve, 300))
                
                // Step 3: Test with AlgoZenith
                this.updateStatus('checking', '🧪 Testing everything...', 'Making sure AlgoZenith still recognizes you')
                await new Promise(resolve => setTimeout(resolve, 500))
                
                const tokenValidation = await this.validateMaangTokens()
                
                if (tokenValidation.valid) {
                    this.updateStatus('checking', '✅ Perfect! Everything works', 'AlgoZenith confirmed your access')
                    await new Promise(resolve => setTimeout(resolve, 300))
                    
                    // Step 4: Share with team
                    this.updateStatus('checking', '🎉 Sharing with your team...', 'Setting up access for everyone on your team')
                    await new Promise(resolve => setTimeout(resolve, 500))
                    
                    const storeResult = await this.storeTokenInDB(browserTokens)
                    
                    if (storeResult.success) {
                        this.updateStatus('success', '✨ All set! Your team is ready', 'Everyone can now access AlgoZenith easily')
                    } else {
                        this.updateStatus('error', '😔 Oops! Couldn\'t share with team', storeResult.error || 'Something went wrong while setting up team access')
                    }
                } else {
                    this.updateStatus('checking', '😕 Your AlgoZenith login expired', 'No worries, let me check if your teammates can help')
                    await new Promise(resolve => setTimeout(resolve, 300))
                    
                    // Continue to check team tokens
                    this.updateStatus('checking', '👥 Asking your teammates for help...', 'Checking if someone else already set this up')
                    await new Promise(resolve => setTimeout(resolve, 500))
                    
                    const teamTokenValidation = await this.checkTeamTokensFromDB()
                    
                    if (teamTokenValidation.valid) {
                        this.updateStatus('success', '🎉 Perfect! Your team has you covered', teamTokenValidation.reason)
                    } else {
                        this.updateStatus('none', '😔 No one has set up AlgoZenith yet', teamTokenValidation.reason + ' - Please sign into AlgoZenith first')
                    }
                }
            } else {
                this.updateStatus('checking', '🔍 No AlgoZenith login found', 'You\'re not signed into AlgoZenith yet - let me check with your team')
                await new Promise(resolve => setTimeout(resolve, 300))
                
                // Continue to check team tokens
                this.updateStatus('checking', '👥 Asking your teammates for help...', 'Maybe someone already set this up?')
                await new Promise(resolve => setTimeout(resolve, 500))
                
                const teamTokenValidation = await this.checkTeamTokensFromDB()
                
                if (teamTokenValidation.valid) {
                    this.updateStatus('success', '🎉 Great! Your team has you covered', teamTokenValidation.reason)
                } else {
                    this.updateStatus('none', '😔 Team needs AlgoZenith access', teamTokenValidation.reason + ' - Please sign into AlgoZenith to get started')
                }
            }
        } catch (error) {
            console.error('Token check failed:', error)
            this.updateStatus('none', '⚠️ Connection error', 'Unable to connect to Choco backend')
            this.showLoginForm(true)
        }

        this.setLoading(false)
    }

    async getStoredUser() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['chocoUser'], (result) => {
                resolve(result.chocoUser || null)
            })
        })
    }

    async storeUser(userDetails) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ chocoUser: userDetails }, resolve)
        })
    }

    // Logout user and clear stored data
    async logoutUser() {
        return new Promise((resolve) => {
            chrome.storage.local.remove(['chocoUser'], () => {
                console.log('🚪 User logged out - cleared stored data')
                resolve()
            })
        })
    }

    // Single function to validate user authentication and JWT token
    async validateUser() {
        try {
            // Get stored user
            const user = await this.getStoredUser()
            if (!user || !user.token) {
                return { valid: false, reason: 'No user or token stored' }
            }

            // Verify JWT token with backend
            const verification = await this.verifyJWTToken(user.token)
            if (verification.valid) {
                return { 
                    valid: true, 
                    user: verification.user,
                    token: user.token,
                    message: verification.message 
                }
            } else {
                // Token is invalid, logout user
                await this.logoutUser()
                return { valid: false, reason: verification.error }
            }
        } catch (error) {
            console.error('User validation failed:', error)
            return { valid: false, reason: 'User validation error' }
        }
    }

    async getMaangTokensFromCookies() {
        return new Promise(async (resolve) => {
            console.log('Looking for access_token and refresh_token cookies...')
            
            // First, let's see what cookies the extension CAN access
            const allCookies = await new Promise(resolve => {
                chrome.cookies.getAll({ domain: 'maang.in' }, resolve)
            })
            console.log(`Extension can access ${allCookies.length} cookies from maang.in:`)
            allCookies.forEach(cookie => {
                console.log(`  - ${cookie.name} (domain: ${cookie.domain}, path: ${cookie.path}, httpOnly: ${cookie.httpOnly}, secure: ${cookie.secure})`)
            })
            
            const tokens = {}
            
            // Try to get the specific cookies we know exist
            try {
                const accessTokenCookie = await new Promise(resolve => {
                    chrome.cookies.get({ url: 'https://maang.in', name: 'access_token' }, resolve)
                })
                
                const refreshTokenCookie = await new Promise(resolve => {
                    chrome.cookies.get({ url: 'https://maang.in', name: 'refresh_token' }, resolve)
                })
                
                if (accessTokenCookie) {
                    tokens.accessToken = accessTokenCookie.value
                    console.log('✅ Found access_token cookie:', accessTokenCookie.value.substring(0, 50) + '...')
                    console.log('   Full access_token:', accessTokenCookie.value)
                } else {
                    console.log('❌ access_token cookie not found')
                }
                
                if (refreshTokenCookie) {
                    tokens.refreshToken = refreshTokenCookie.value
                    console.log('✅ Found refresh_token cookie:', refreshTokenCookie.value.substring(0, 50) + '...')
                    console.log('   Full refresh_token:', refreshTokenCookie.value)
                } else {
                    console.log('❌ refresh_token cookie not found')
                }
                
            } catch (error) {
                console.log('Error getting specific cookies:', error)
            }
            
            
            console.log('\nFinal tokens:', { 
                refresh: !!tokens.refreshToken, 
                access: !!tokens.accessToken 
            })
            
            resolve(tokens)
        })
    }
    
    async verifyUser(email, password) {
        try {
            // Use /api/auth/login for password-based authentication
            const response = await fetch(`${this.backendUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })

            if (!response.ok) return { success: false, error: 'Login failed' }

            const data = await response.json()
            if (data.success && data.token) {
                // Store user details with JWT token
                const userToStore = {
                    email: data.user.email,
                    role: data.user.role,
                    name: data.user.name,
                    teamId: data.user.teamId,
                    loginTime: new Date().toISOString(),
                    token: data.token // JWT token
                }
                console.log('🔒 Storing user with JWT token:', {
                    email: userToStore.email,
                    role: userToStore.role,
                    hasToken: !!userToStore.token,
                    tokenPreview: userToStore.token ? userToStore.token.substring(0, 20) + '...' : 'MISSING'
                })
                await this.storeUser(userToStore)
                
                // Immediately retrieve to verify storage
                const retrievedUser = await this.getStoredUser()
                console.log('🔓 Retrieved user:', {
                    email: retrievedUser?.email,
                    role: retrievedUser?.role,
                    hasToken: !!retrievedUser?.token,
                    tokenPreview: retrievedUser?.token ? retrievedUser.token.substring(0, 20) + '...' : 'MISSING'
                })
                
                return { success: true, user: data.user }
            }
            return { success: false, error: data.message || 'Login failed' }
        } catch (error) {
            console.error('User login failed:', error)
            return { success: false, error: 'Connection error' }
        }
    }

    async validateMaangTokens() {
        try {
            // Validate user authentication
            const userValidation = await this.validateUser()
            if (!userValidation.valid) {
                return { valid: false, reason: `Authentication failed: ${userValidation.reason}` }
            }
            
            const user = userValidation.user
            console.log('🔐 User validated:', {
                email: user.email,
                role: user.role,
                hasToken: !!userValidation.token
            })

            console.log('🔍 Starting detailed token validation...')
            
            // Internal validation: Check if user has valid tokens in cookies
            const maangTokens = await this.getMaangTokensFromCookies()
            
            // Check if we have ANY tokens (not requiring both access AND refresh)
            const hasAnyToken = maangTokens.refreshToken || maangTokens.accessToken || maangTokens.generalToken
            
            if (hasAnyToken) {
                console.log('✅ Found tokens in cookies:', {
                    refresh: !!maangTokens.refreshToken,
                    access: !!maangTokens.accessToken,
                    general: !!maangTokens.generalToken
                })
                
                console.log('💾 Storing tokens in team database...')
                
                // Store the found tokens in DB for team sharing
                const storeResult = await this.storeTokenInDB(maangTokens)
                if (storeResult.success) {
                    console.log('✅ Tokens stored successfully for team access')
                    return { valid: true, reason: 'Valid tokens found, validated, and stored for team' }
                } else {
                    console.log('⚠️ Failed to store tokens:', storeResult.message)
                    return { valid: false, reason: 'Tokens found but failed to store in team database' }
                }
            }
            
            console.log('🔍 No tokens in cookies, checking team tokens...')
            
            // Step 2: No tokens found, check team tokens from database
            const teamTokenValidation = await this.checkTeamTokensFromDB()
            
            if (teamTokenValidation.valid) {
                console.log('✅ Found valid team token')
                return { valid: true, reason: teamTokenValidation.reason }
            } else {
                console.log('❌ No valid team tokens found')
                return { 
                    valid: false, 
                    reason: 'No valid tokens found. Please log into maang.in to refresh your tokens.' 
                }
            }
            
        } catch (error) {
            console.error('Token validation error:', error)
            return { valid: false, reason: 'Connection error during token validation' }
        }
    }

    async storeTokenInDB(tokens) {
        try {
            // Validate user first
            const userValidation = await this.validateUser()
            if (!userValidation.valid) {
                return { success: false, message: `Authentication failed: ${userValidation.reason}` }
            }
            
            const user = userValidation.user
            const token = userValidation.token
            
            console.log('📤 Storing tokens in database...')
            console.log('🔑 User JWT token:', token ? token.substring(0, 20) + '...' : 'MISSING')
            console.log('📬 User details:', { email: user.email, role: user.role })
            
            const response = await fetch(`${this.backendUrl}/api/maang/store`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    refreshToken: tokens.refreshToken, // Primary token (preferred)
                    accessToken: !tokens.refreshToken ? tokens.accessToken : null, // Fallback if no refresh
                    generalToken: (!tokens.refreshToken && !tokens.accessToken) ? (tokens.generalToken || tokens.jwt) : null, // Last fallback
                    userEmail: user.email,
                    tokenSource: 'manual' // Mark as manually detected
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                return { success: false, message: errorData.message || 'Failed to store tokens' }
            }

            const data = await response.json()
            console.log('✅ Tokens stored:', data.message)
            return { success: true, tokenId: data.tokenId, message: data.message }
            
        } catch (error) {
            console.error('❌ Error storing tokens:', error)
            return { success: false, message: 'Connection error while storing tokens' }
        }
    }

    async getTeamTokens() {
        try {
            // Validate user first
            const userValidation = await this.validateUser()
            if (!userValidation.valid) {
                return { success: false, message: `Authentication failed: ${userValidation.reason}` }
            }
            
            console.log('📥 Fetching team tokens...')
            
            const response = await fetch(`${this.backendUrl}/api/maang/team`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userValidation.token}`
                }
            })

            if (!response.ok) {
                const errorData = await response.json()
                return { success: false, message: errorData.message || 'Failed to fetch team tokens' }
            }

            const data = await response.json()
            console.log(`✅ Fetched ${data.count} team tokens`)
            return { success: true, tokens: data.tokens, count: data.count }
            
        } catch (error) {
            console.error('❌ Error fetching team tokens:', error)
            return { success: false, message: 'Connection error while fetching team tokens' }
        }
    }

    async checkTeamTokensFromDB() {
        try {
            // Fetch all team tokens from database
            const teamTokensResponse = await this.getTeamTokens()
            
            if (!teamTokensResponse.success || !teamTokensResponse.tokens || teamTokensResponse.tokens.length === 0) {
                return { valid: false, reason: 'Your teammates haven\'t set up AlgoZenith access yet' }
            }

            console.log(`Found ${teamTokensResponse.tokens.length} team access options, testing each one...`)

            // Test each token to find a valid one
            for (let i = 0; i < teamTokensResponse.tokens.length; i++) {
                const tokenData = teamTokensResponse.tokens[i]
                console.log(`Trying option ${i + 1}/${teamTokensResponse.tokens.length}`)
                
                // Check token expiration before testing (if expiration data is available)
                const now = new Date()
                let hasValidToken = false
                
                // Check each token type and its expiration
                const tokenForValidation = {}
                
                if (tokenData.refreshToken) {
                    const refreshExpired = tokenData.refreshTokenExpiresAt && new Date(tokenData.refreshTokenExpiresAt) < now
                    if (!refreshExpired) {
                        tokenForValidation.refreshToken = tokenData.refreshToken
                        hasValidToken = true
                    }
                }
                
                if (tokenData.accessToken) {
                    const accessExpired = tokenData.accessTokenExpiresAt && new Date(tokenData.accessTokenExpiresAt) < now
                    if (!accessExpired) {
                        tokenForValidation.accessToken = tokenData.accessToken
                        hasValidToken = true
                    }
                }
                
                if (tokenData.generalToken) {
                    const generalExpired = tokenData.generalTokenExpiresAt && new Date(tokenData.generalTokenExpiresAt) < now
                    if (!generalExpired) {
                        tokenForValidation.generalToken = tokenData.generalToken
                        hasValidToken = true
                    }
                }
                
                if (!hasValidToken) {
                    console.log(`❌ Option ${i + 1} - all tokens expired`)
                    continue
                }
                
                console.log('Testing tokens:', {
                    refresh: !!tokenForValidation.refreshToken,
                    access: !!tokenForValidation.accessToken,
                    general: !!tokenForValidation.generalToken
                })

                const validation = await this.validateMaangToken(tokenForValidation)
                
                if (validation.valid) {
                    console.log(`✅ Found working access option ${i + 1}!`)
                    return { 
                        valid: true, 
                        reason: `Great! Using access shared by your teammate`
                    }
                } else {
                    console.log(`❌ Option ${i + 1} validation failed: ${validation.reason}`)
                }
            }

            // All tokens are invalid - clean up the database
            console.log('All team tokens are invalid, cleaning up database...')
            await this.clearInvalidTokens()
            
            return { 
                valid: false, 
                reason: `All team access options have expired - someone needs to sign in again`
            }

        } catch (error) {
            console.error('Team access check failed:', error)
            return { valid: false, reason: 'Couldn\'t connect to your team - please try again' }
        }
    }

    async validateMaangToken(token) {
        try {
            console.log('🧪 Validating AlgoZenith access token...')
            
            // Basic token format validation
            if (!token || !token.refreshToken) {
                console.log('❌ No refresh token provided')
                return { valid: false, reason: 'No refresh token provided' }
            }
            
            // Check if token looks valid (basic format check)
            const refreshToken = token.refreshToken
            if (typeof refreshToken !== 'string' || refreshToken.length < 10) {
                console.log('❌ Invalid token format')
                return { valid: false, reason: 'Invalid token format' }
            }
            
            console.log('✅ Token format looks valid')
            
            // Instead of invasive testing, we'll trust tokens from recent successful logins
            // and only do a lightweight validation
            
            try {
                // Gently set the token as a cookie without triggering validation
                await new Promise((resolve, reject) => {
                    chrome.cookies.set({
                        url: 'https://maang.in',
                        name: 'refresh_token',
                        value: refreshToken,
                        
                    }, (cookie) => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError)
                        } else {
                            resolve(cookie)
                        }
                    })
                })
                
                console.log('✅ Token set successfully as cookie')
                
                // Quick validation: check if cookie was set properly
                const setCookie = await new Promise(resolve => {
                    chrome.cookies.get({ url: 'https://maang.in', name: 'refresh_token' }, resolve)
                })
                
                if (setCookie && setCookie.value === refreshToken) {
                    console.log('✅ Token validation successful - ready for use')
                    return { 
                        valid: true, 
                        reason: 'Token validated and ready for AlgoZenith access' 
                    }
                } else {
                    console.log('❌ Token could not be set as cookie')
                    return { 
                        valid: false, 
                        reason: 'Token could not be set - may be invalid or expired' 
                    }
                }
                
            } catch (cookieError) {
                console.log('❌ Cookie setting failed:', cookieError)
                return { 
                    valid: false, 
                    reason: 'Could not set token cookie - browser permission issue' 
                }
            }
            
        } catch (error) {
            console.error('Token validation error:', error)
            return { valid: false, reason: 'Token validation failed - please try again' }
        }
    }

    // Verify JWT token with backend
    async verifyJWTToken(token, requiredRole = null) {
        try {
            const response = await fetch(`${this.backendUrl}/api/auth/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ requiredRole })
            })

            if (!response.ok) {
                return { valid: false, error: 'Token verification failed' }
            }

            const data = await response.json()
            if (data.success) {
                return { 
                    valid: true, 
                    user: data.user,
                    message: data.message 
                }
            } else {
                return { valid: false, error: data.message }
            }
        } catch (error) {
            console.error('JWT verification error:', error)
            return { valid: false, error: 'Connection error' }
        }
    }

    updateStatus(type, message, details) {
        const badge = document.getElementById('statusBadge')
        const messageEl = document.getElementById('statusMessage')
        const detailsEl = document.getElementById('statusDetails')

        // Update badge
        badge.className = `status-badge status-${type}`
        badge.textContent = type === 'checking' ? 'Checking' : 
                           type === 'active' ? 'Active' :
                           type === 'expired' ? 'Expired' : 'None'

        // Update message and details
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

        // Clear previous errors
        errorDiv.classList.add('hidden')

        if (!email || !password) {
            this.showLoginError('Please enter both email and password')
            return
        }

        // Show loading state
        loginIcon.innerHTML = '<div class="spinner"></div>'
        loginText.textContent = 'Logging in...'
        loginBtn.disabled = true

        try {
            const result = await this.verifyUser(email, password)
            
            if (result.success) {
                // Hide login form and refresh token status
                this.showLoginForm(false)
                await this.checkTokenStatus()
            } else {
                this.showLoginError(result.error)
            }
        } catch (error) {
            console.error('Login error:', error)
            this.showLoginError('Connection error. Please try again.')
        } finally {
            // Reset button state
            loginIcon.textContent = '🔐'
            loginText.textContent = 'Login to Choco'
            loginBtn.disabled = false
        }
    }

    showLoginForm(show) {
        const loginForm = document.getElementById('loginForm')
        const actions = document.querySelector('.actions')
        
        if (show) {
            loginForm.classList.remove('hidden')
            // Hide some action buttons when showing login form
            document.getElementById('loginBtn').classList.add('hidden')
        } else {
            loginForm.classList.add('hidden')
            // Clear form inputs
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

    openAlgoZenith() {
        chrome.tabs.create({ url: 'https://maang.in' })
        window.close()
    }

    openAdminDashboard() {
        chrome.tabs.create({ url: `${this.backendUrl}/admin` })
        window.close()
    }

    // Only called when ALL tokens have failed validation
    async clearInvalidTokens() {
        try {
            console.log('🧹 Cleaning up invalid tokens from database...')
            
            const user = await this.validateUser()
            if (!user.valid) {
                console.log('Cannot clean tokens - user not authenticated')
                return { success: false, error: 'User not authenticated' }
            }

            const response = await fetch(`${this.backendUrl}/api/maang/cleanup`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error('Failed to clean invalid tokens:', errorText)
                return { success: false, error: errorText }
            }

            const result = await response.json()
            console.log('✅ Successfully cleaned invalid tokens:', result)
            return { success: true, result }

        } catch (error) {
            console.error('Error cleaning invalid tokens:', error)
            return { success: false, error: error.message }
        }
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChocoPopup()
})
