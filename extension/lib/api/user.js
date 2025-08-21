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
                await this.storeLocalUser(result.data.user, result.data.token)
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

    async verifyUser(userToken) {
        try {
            const response = await fetch(`${this.backendUrl}/api/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
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


    async getLocalStoredUser() {
        try {
            const userResult = await StorageUtils.get(['choco_user'])
            const tokenResult = await StorageUtils.get(['choco_token'])
            
            if (userResult.success && tokenResult.success && userResult.data?.choco_user && tokenResult.data?.choco_token) {
                return {
                    success: true,
                    error: null,
                    message: 'User data retrieved',
                    data: {
                        user: userResult.data.choco_user,
                        token: tokenResult.data.choco_token
                    }
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

    async storeLocalUser(user, token) {
        try {
            if (!user || !token) {
                return {
                    success: false,
                    error: 'Invalid data',
                    message: 'User and token are required',
                    data: null
                }
            }
            
            const userResult = await StorageUtils.set({ choco_user: user })
            const tokenResult = await StorageUtils.set({ choco_token: token })
            
            if (userResult.success && tokenResult.success) {
                return {
                    success: true,
                    error: null,
                    message: 'User data stored successfully',
                    data: null
                }
            } else {
                return {
                    success: false,
                    error: 'Storage failed',
                    message: 'Failed to store user data',
                    data: null
                }
            }
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
            const userResult = await StorageUtils.remove(['choco_user'])
            const tokenResult = await StorageUtils.remove(['choco_token'])
            
            if (userResult.success && tokenResult.success) {
                return {
                    success: true,
                    error: null,
                    message: 'User data cleared successfully',
                    data: null
                }
            } else {
                return {
                    success: false,
                    error: 'Clear failed',
                    message: 'Failed to clear user data',
                    data: null
                }
            }
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

            // Call profile API to get comprehensive user information
            try {
                const response = await fetch(`${Constants.BACKEND_URL}api/auth/profile`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${storedData.token}`
                    }
                });

                const profileData = await response.json();
                if (profileData.success) {
                    return {
                        success: true,
                        error: null,
                        message: 'User details retrieved successfully',
                        data: {
                            ...profileData.data,
                            token: storedData.token,
                            isLoggedIn: true
                        }
                    }
                } else {
                    // Fallback to stored data if API fails
                    console.warn('Profile API failed, using stored data:', profileData.message);
                    return {
                        success: true,
                        error: null,
                        message: 'User details retrieved from local storage',
                        data: {
                            user: storedData.user,
                            token: storedData.token,
                            isLoggedIn: true
                        }
                    }
                }
            } catch (apiError) {
                console.warn('Profile API request failed, using stored data:', apiError.message);
                // Fallback to stored data if API request fails
                return {
                    success: true,
                    error: null,
                    message: 'User details retrieved from local storage',
                    data: {
                        user: storedData.user,
                        token: storedData.token,
                        isLoggedIn: true
                    }
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
