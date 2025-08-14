class MaangValidation {
    static requiredFields = {
        cookies: ['access_token', 'refresh_token'],
        localStorage: ['az_user_tracking_id'],
        sessionStorage: []
    }

    static extractCredentials(credentials) {
        const credentialCookies = credentials.cookies || {}
        const credentialLocalStorage = credentials.localStorage || {}
        
        const hasAccessToken = credentialCookies.access_token && credentialCookies.access_token.value
        const hasRefreshToken = credentialCookies.refresh_token && credentialCookies.refresh_token.value
        const hasAzTracking = credentialLocalStorage.az_user_tracking_id
        
        const hasAllRequired = !!(hasAccessToken && hasRefreshToken && hasAzTracking)
        
        return {
            credentialCookies,
            credentialLocalStorage,
            hasAccessToken,
            hasRefreshToken,
            hasAzTracking,
            hasAllRequired
        }
    }
    
    static buildCredentialData(extracted) {
        return {
            cookies: {
                access_token: extracted.hasAccessToken ? extracted.credentialCookies.access_token : null,
                refresh_token: extracted.hasRefreshToken ? extracted.credentialCookies.refresh_token : null
            },
            localStorage: {
                az_user_tracking_id: extracted.hasAzTracking ? extracted.credentialLocalStorage.az_user_tracking_id : null
            }
        }
    }
    
    static async validateCredentials(credentials, mode , targetCredentials = null) {
        try {
            if (!mode || !credentials) {
                return {
                    success: false,
                    error: 'Missing validation mode or credentials',
                    message: 'Missing validation mode or credentials',
                    data: null
                }
            }
            const extracted = this.extractCredentials(credentials)
            

            if (mode === 'structure_filter') { // validate and filer
                const filteredCredentials = {
                    cookies: {},
                    localStorage: {},
                    sessionStorage: {}
                }
                
                this.requiredFields.cookies.forEach(cookieName => {
                    if (extracted.credentialCookies[cookieName]) {
                        filteredCredentials.cookies[cookieName] = extracted.credentialCookies[cookieName]
                    }
                })
                
                this.requiredFields.localStorage.forEach(key => {
                    if (extracted.credentialLocalStorage[key]) {
                        filteredCredentials.localStorage[key] = extracted.credentialLocalStorage[key]
                    }
                })
                
                const credentialSessionStorage = credentials.sessionStorage || {}
                this.requiredFields.sessionStorage.forEach(key => {
                    if (credentialSessionStorage[key]) {
                        filteredCredentials.sessionStorage[key] = credentialSessionStorage[key]
                    }
                })
                
                return {
                    success: extracted.hasAllRequired,
                    error: extracted.hasAllRequired ? null : 'Missing required Maang credentials',
                    message: extracted.hasAllRequired ? 'Credentials validated and filtered' : 'Missing required Maang credentials',
                    data: {
                        credentials: filteredCredentials,
                        validation: {
                            accessToken: extracted.hasAccessToken,
                            refreshToken: extracted.hasRefreshToken,
                            azUserTrackingId: extracted.hasAzTracking
                        }
                    }
                }
            }
            
            if (mode === 'match_provided') {
                if (!targetCredentials) {
                    return {
                        success: false,
                        error: 'Target credentials required for match_provided mode',
                        data: null
                    }
                }
                
                const targetExtracted = this.extractCredentials(targetCredentials)
                
                const validationResults = {
                    accessToken: targetExtracted.hasAccessToken && extracted.hasAccessToken && 
                        extracted.credentialCookies.access_token.value === targetExtracted.credentialCookies.access_token.value,
                    refreshToken: targetExtracted.hasRefreshToken && extracted.hasRefreshToken && 
                        extracted.credentialCookies.refresh_token.value === targetExtracted.credentialCookies.refresh_token.value,
                    azUserTrackingId: targetExtracted.hasAzTracking && extracted.hasAzTracking && 
                        extracted.credentialLocalStorage.az_user_tracking_id === targetExtracted.credentialLocalStorage.az_user_tracking_id
                }
                
                const success = validationResults.accessToken && validationResults.refreshToken && validationResults.azUserTrackingId
                
                return {
                    success,
                    error: success ? null : 'No matching Maang credentials found',
                    message: success ? 'Maang credentials validated' : 'No matching Maang credentials found',
                    data: {
                        credentials: this.buildCredentialData(extracted),
                        validation: validationResults
                    }
                }
            }
            
            if (mode === 'test_credentials') {
                return this.test_credentials(credentials)
            }
            
            return {
                success: false,
                error: `Unsupported validation mode: ${mode}`,
                message: `Unsupported validation mode: ${mode}`,
                data: null
            }
        } catch (error) {
            return {
                success: false,
                platform: 'maang',
                error: error.message,
                data: null
            }
        }
    }

    static test_credentials(credentials) {
        const extracted = this.extractCredentials(credentials)
        
        return {
            success: extracted.hasAllRequired,
            error: extracted.hasAllRequired ? null : 'Missing required Maang credentials',
            message: extracted.hasAllRequired ? 'All required credentials present' : 'Missing required Maang credentials',
            data: {
                credentials: this.buildCredentialData(extracted),
                validation: {
                    accessToken: extracted.hasAccessToken,
                    refreshToken: extracted.hasRefreshToken,
                    azUserTrackingId: extracted.hasAzTracking
                }
            }
        }
    }

    static test_credentials(credentials) {
        const extracted = this.extractCredentials(credentials)
        
        return {
            success: extracted.hasAllRequired,
            error: extracted.hasAllRequired ? null : 'Missing required Maang credentials',
            message: extracted.hasAllRequired ? 'All required credentials present' : 'Missing required Maang credentials',
            data: {
                credentials: this.buildCredentialData(extracted),
                validation: {
                    accessToken: extracted.hasAccessToken,
                    refreshToken: extracted.hasRefreshToken,
                    azUserTrackingId: extracted.hasAzTracking
                }
            }
        }
    }

}
