class PlatformAPI {
    constructor(backendUrl) {
        this.backendUrl = backendUrl
    }

    async storeToken(userToken, platformTokenData) {
        try {
            const response = await fetch(`${this.backendUrl}/api/platform/token/store`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(platformTokenData)
            })

            return await response.json()

        } catch (error) {
            return {
                success: false,
                error: 'Network error',
                message: 'Unable to connect to server',
                data: null
            }
        }
    }

    async getTokens(userToken) {
        try {
            const response = await fetch(`${this.backendUrl}/api/platform/token`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                }
            })

            return await response.json()

        } catch (error) {
            return {
                success: false,
                error: 'Network error',
                message: 'Unable to connect to server',
                data: null
            }
        }
    }

    async cleanupTokens(userToken) {
        try {
            const response = await fetch(`${this.backendUrl}/api/platform/token/cleanup`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                }
            })

            return await response.json()
            
        } catch (error) {
            return {
                success: false,
                error: 'Network error',
                message: 'Unable to connect to server',
                data: null
            }
        }
    }
}
