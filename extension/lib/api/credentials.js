class CredentialsAPI {
    constructor(backendUrl) {
        this.backendUrl = backendUrl
    }

    async storeCredentials(userToken, credentialData) {
        try {
            const response = await fetch(`${this.backendUrl}/api/credentials/store`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(credentialData)
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

    async getCredentials(userToken) {
        try {
            const response = await fetch(`${this.backendUrl}/api/credentials/get`, {
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

    async cleanupCredentials(userToken) {
        try {
            const response = await fetch(`${this.backendUrl}/api/credentials/cleanup`, {
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
