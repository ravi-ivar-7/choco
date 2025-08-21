class CredentialsAPI {
    constructor(backendUrl) {
        this.backendUrl = backendUrl
    }

    async setCredentials(userToken, credentialData, teamId) {
        try {
            // Validate inputs
            if (!userToken || typeof userToken !== 'string') {
                return {
                    success: false,
                    error: 'Invalid token',
                    message: 'User token is required and must be a string',
                    data: null
                }
            }

            if (!teamId) {
                return {
                    success: false,
                    error: 'Invalid team ID',
                    message: 'Team ID is required',
                    data: null
                }
            }

            if (!credentialData || typeof credentialData !== 'object') {
                return {
                    success: false,
                    error: 'Invalid credential data',
                    message: 'Credential data is required and must be an object',
                    data: null
                }
            }

            // Use existing validation system
            const validationResult = await CredentialValidator.validateCredentials(credentialData, 'match_config');
            if (!validationResult.success) {
                return {
                    success: false,
                    error: 'Invalid credential data',
                    message: validationResult.message,
                    data: null
                }
            }

            const payload = {
                ...credentialData,
                teamId: teamId
            };

            const response = await fetch(`${this.backendUrl}/api/credentials/set`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(payload)
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

    async getCredentials(userToken, teamId) {
        try {
            const response = await fetch(`${this.backendUrl}/api/credentials/get?teamId=${teamId}`, {
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

    async cleanupCredentials(userToken, teamId, credentialIds = null) {
        try {
            const url = `${this.backendUrl}/api/credentials/cleanup?teamId=${teamId}`
            let body = null
            
            if (credentialIds) {
                // Always send as array in body for consistency
                const idsArray = Array.isArray(credentialIds) ? credentialIds : [credentialIds]
                body = JSON.stringify({ credentialIds: idsArray })
            }

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                ...(body && { body })
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
