class DevsValidation {
    static requiredFields = {
        cookies: ['access_token', 'refresh_token'],
        localStorage: ['user_id'],
        sessionStorage: []
    }
    
    static async validateCredentials(credentials, mode = 'match_browser', targetCredentials = null) {
        try {
            const credentialCookies = credentials.cookies || {}
            const credentialLocalStorage = credentials.localStorage || {}
            
            const hasAccessToken = credentialCookies.access_token && credentialCookies.access_token.value
            const hasRefreshToken = credentialCookies.refresh_token && credentialCookies.refresh_token.value
            const hasUserId = credentialLocalStorage.user_id
            
            const hasAllRequired = !!(hasAccessToken && hasRefreshToken && hasUserId)
            
            if (mode === 'validate_structure') {
                return {
                    success: hasAllRequired,
                    
                    error: hasAllRequired ? null : 'Missing required 100xDevs credentials',
                    message: hasAllRequired ? 'All required 100xDevs credentials present' : 'Missing required 100xDevs credentials',
                    data: {
                        credentials: {
                            cookies: {
                                access_token: hasAccessToken ? credentialCookies.access_token : null,
                                refresh_token: hasRefreshToken ? credentialCookies.refresh_token : null
                            },
                            localStorage: {
                                user_id: hasUserId ? credentialLocalStorage.user_id : null
                            }
                        },
                        validation: {
                            accessToken: hasAccessToken,
                            refreshToken: hasRefreshToken,
                            userId: hasUserId
                        }
                    }
                }
            }
            
            if (mode === 'filter') {
                const filteredCredentials = {
                    cookies: {},
                    localStorage: {},
                    sessionStorage: {}
                }
                
                this.requiredFields.cookies.forEach(cookieName => {
                    if (credentialCookies[cookieName]) {
                        filteredCredentials.cookies[cookieName] = credentialCookies[cookieName]
                    }
                })
                
                this.requiredFields.localStorage.forEach(key => {
                    if (credentialLocalStorage[key]) {
                        filteredCredentials.localStorage[key] = credentialLocalStorage[key]
                    }
                })
                
                const credentialSessionStorage = credentials.sessionStorage || {}
                this.requiredFields.sessionStorage.forEach(key => {
                    if (credentialSessionStorage[key]) {
                        filteredCredentials.sessionStorage[key] = credentialSessionStorage[key]
                    }
                })
                
                return {
                    success: true,
                    error: null,
                    message: 'Credentials filtered to required fields only',
                    data: {
                        credentials: filteredCredentials
                    }
                }
            }
            
            if (!hasAllRequired) {
                return {
                    success: false,
                    error: 'Missing required 100xDevs credentials',
                    message: 'Missing required 100xDevs credentials',
                    data: {
                        credentials: {
                            cookies: {
                                access_token: hasAccessToken ? credentialCookies.access_token : null,
                                refresh_token: hasRefreshToken ? credentialCookies.refresh_token : null
                            },
                            localStorage: {
                                user_id: hasUserId ? credentialLocalStorage.user_id : null
                            }
                        },
                        validation: {
                            accessToken: hasAccessToken,
                            refreshToken: hasRefreshToken,
                            userId: hasUserId
                        }
                    }
                }
            }
            
            const validationResults = {
                accessToken: false,
                refreshToken: false,
                userId: false
            }
            
            let targetCreds = null
            let targetCookies = {}
            let targetLocalStorage = {}
            
            if (mode === 'match_browser') {
                if (!targetCredentials || !targetCredentials.credentials) {
                    return {
                        success: false,
                        error: 'Browser data required for match_browser mode',
                        data: null
                    }
                }
                targetCreds = targetCredentials.credentials
                targetCookies = targetCreds.cookies || {}
                targetLocalStorage = targetCreds.localStorage || {}
            } else if (mode === 'match_provided') {
                if (!targetCredentials) {
                    return {
                        success: false,
                        
                        error: 'Target credentials required for match_provided mode',
                        data: null
                    }
                }
                targetCreds = targetCredentials
                targetCookies = targetCreds.cookies || {}
                targetLocalStorage = targetCreds.localStorage || {}
            } else {
                return {
                    success: false,
                    
                    error: `Unsupported validation mode: ${mode}`,
                    data: null
                }
            }
            
            const targetHasAccessToken = targetCookies.access_token && targetCookies.access_token.value
            const targetHasRefreshToken = targetCookies.refresh_token && targetCookies.refresh_token.value
            const targetHasUserId = targetLocalStorage.user_id
            
            if (targetHasAccessToken && credentialCookies.access_token) {
                validationResults.accessToken = credentialCookies.access_token.value === targetCookies.access_token.value
            }
            
            if (targetHasRefreshToken && credentialCookies.refresh_token) {
                validationResults.refreshToken = credentialCookies.refresh_token.value === targetCookies.refresh_token.value
            }
            
            if (targetHasUserId && credentialLocalStorage.user_id) {
                validationResults.userId = credentialLocalStorage.user_id === targetLocalStorage.user_id
            }
            
            const targetHasAllCredentials = targetHasAccessToken && targetHasRefreshToken && targetHasUserId
            const allValidationsPassed = validationResults.accessToken && validationResults.refreshToken && validationResults.userId
            const success = targetHasAllCredentials && allValidationsPassed
            
            return {
                success,
                
                error: success ? null : 'No matching 100xDevs credentials found',
                message: success ? '100xDevs credentials validated' : 'No matching 100xDevs credentials found',
                data: {
                    credentials: {
                        cookies: {
                            access_token: credentialCookies.access_token,
                            refresh_token: credentialCookies.refresh_token
                        },
                        localStorage: {
                            user_id: credentialLocalStorage.user_id
                        }
                    },
                    validation: validationResults
                }
            }
        } catch (error) {
            return {
                success: false,
                
                error: error.message,
                data: null
            }
        }
    }
}
