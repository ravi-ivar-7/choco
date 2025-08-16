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
            if (result.success && result.data && result.data.user && result.data.token) {
                await this.storeLocalUser({
                    user: result.data.user,
                    token: result.data.token
                })
            }

            return result;

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

            return result;
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

            const storedData = storedUserResult.data
            const token = storedData.token
            const user = storedData.user

            if (!token) {
                return {
                    success: false,
                    error: 'No token',
                    message: 'User token not found',
                    data: null
                }
            }

            if (!user) {
                return {
                    success: false,
                    error: 'No user',
                    message: 'User data not found',
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
                    user: verifyResult.data?.user || user,
                    token: token
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
            const result = await StorageUtils.get(['chocoUser'])
            if (result.success && result.data && result.data.chocoUser) {
                return {
                    success: true,
                    error: null,
                    message: 'User data retrieved',
                    data: result.data.chocoUser
                }
            }
            return {
                success: false,
                error: 'No stored user',
                message: 'No stored user data',
                data: null
            }
        } catch (error) {
            return {
                success: false,
                error: 'Storage error',
                message: `Failed to retrieve user data: ${error.message}`,
                data: null
            }
        }
    }

    async storeLocalUser(userDetails) {
        try {
            if (!userDetails || !userDetails.user || !userDetails.token) {
                return {
                    success: false,
                    error: 'Invalid data',
                    message: 'User and token are required',
                    data: null
                }
            }
            return await StorageUtils.set({ chocoUser: userDetails })
        } catch (error) {
            return {
                success: false,
                error: 'Storage error',
                message: `Failed to store user data: ${error.message}`,
                data: null
            }
        }
    }

    async clearLocalUser() {
        try {
            return await StorageUtils.remove(['chocoUser'])
        } catch (error) {
            return {
                success: false,
                error: 'Storage error',
                message: `Failed to clear user data: ${error.message}`,
                data: null
            }
        }
    }

    async getUserDetails() {
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

            const storedData = storedUserResult.data

            if (!storedData.user || !storedData.token) {
                return {
                    success: false,
                    error: 'Invalid stored data',
                    message: 'Stored user data is incomplete',
                    data: null
                }
            }

            return {
                success: true,
                error: null,
                message: 'User details retrieved successfully',
                data: {
                    user: storedData.user,
                    token: storedData.token,
                    isLoggedIn: true
                }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Retrieval error',
                message: `Get user details failed: ${error.message}`,
                data: null
            }
        }
    }
}
