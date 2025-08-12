class UserAPI {
    constructor(backendUrl) {
        this.backendUrl = backendUrl
    }

    async login(email, password) {
        try {
            const response = await fetch(`${this.backendUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })

            const result = await response.json()
            
            if (!response.ok || !result.success) {
                return {
                    success: false,
                    error: result.error || `Login failed: ${response.status}`,
                    message: result.message || 'Login failed',
                    data: null
                }
            }

            // Store user data locally after successful login
            if (result.success && result.data) {
                await this.storeLocalUser({
                    token: result.data.token,
                    user: result.data.user
                })
            }

            return {
                success: result.success,
                error: result.error,
                message: result.message,
                data: result.data
            }
        } catch (error) {
            return {
                success: false,
                error: 'Network error',
                message: 'Unable to connect to server',
                data: null
            }
        }
    }

    async verifyUser(userToken, requiredRole = null) {
        try {
            const response = await fetch(`${this.backendUrl}/api/auth/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({ requiredRole })
            })

            const result = await response.json()
            
            if (!response.ok || !result.success) {
                return {
                    success: false,
                    error: result.error || `Verify failed: ${response.status}`,
                    message: result.message || 'Token verification failed',
                    data: null
                }
            }

            return {
                success: result.success,
                error: result.error,
                message: result.message,
                data: result.data
            }
        } catch (error) {
            return {
                success: false,
                error: 'Network error',
                message: 'Unable to verify token',
                data: null
            }
        }
    }

    async validateUser() {
        try {
            const storedUserResult = await this.getLocalStoredUser()
            
            if (!storedUserResult.success || !storedUserResult.data) {
                return {
                    success: false,
                    error: 'No stored user',
                    message: 'User not logged in',
                    data: null
                }
            }

            const user = storedUserResult.data
            const token = user.token
            const userInfo = user.user
            
            if (!token) {
                return {
                    success: false,
                    error: 'No token',
                    message: 'User token not found',
                    data: null
                }
            }

            // Verify token with backend
            const verifyResult = await this.verifyUser(token)
            
            if (!verifyResult.success) {
                // Clear invalid user data
                await this.clearLocalUser()
                return {
                    success: false,
                    error: 'Invalid token',
                    message: 'User session expired',
                    data: null
                }
            }

            return {
                success: true,
                error: null,
                message: 'User validated successfully',
                data: {
                    token,
                    user: verifyResult.data?.user || userInfo
                }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Validation error',
                message: `User validation failed: ${error.message}`,
                data: null
            }
        }
    }

    async getLocalStoredUser() {
        try {
            const result = await chrome.storage.local.get(['chocoUser'])
            const user = result.chocoUser || null
            return {
                success: true,
                error: null,
                message: user ? 'User data retrieved' : 'No stored user data',
                data: user
            }
        } catch (error) {
            return {
                success: false,
                error: 'Storage error',
                message: `Get stored user failed: ${error.message}`,
                data: null
            }
        }
    }

    async storeLocalUser(userDetails) {
        try {
            await chrome.storage.local.set({ chocoUser: userDetails })
            return {
                success: true,
                error: null,
                message: 'User data stored successfully',
                data: { stored: userDetails }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Storage error',
                message: `Store user failed: ${error.message}`,
                data: null
            }
        }
    }

    async clearLocalUser() {
        try {
            await chrome.storage.local.remove(['chocoUser'])
            return {
                success: true,
                error: null,
                message: 'User data cleared successfully',
                data: { cleared: true }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Storage error',
                message: `Clear stored user failed: ${error.message}`,
                data: null
            }
        }
    }
}
