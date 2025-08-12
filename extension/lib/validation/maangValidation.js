class MaangValidation {
    static requiredFields = {
        cookies: ['access_token', 'refresh_token'],
        localStorage: ['az_user_tracking_id'],
        sessionStorage: []
    }
    
    static async validateCredentials(credentials, mode = 'match_browser', targetCredentials = null) {
        try {
            const credentialCookies = credentials.cookies || {}
            const credentialLocalStorage = credentials.localStorage || {}
            
            const hasAccessToken = credentialCookies.access_token && credentialCookies.access_token.value
            const hasRefreshToken = credentialCookies.refresh_token && credentialCookies.refresh_token.value
            const hasAzTracking = credentialLocalStorage.az_user_tracking_id
            
            const hasAllRequired = !!(hasAccessToken && hasRefreshToken && hasAzTracking)
            
            if (mode === 'validate_structure') {
                return {
                    success: hasAllRequired,
                    platform: 'maang',
                    message: hasAllRequired ? 'All required Maang credentials present' : 'Missing required Maang credentials',
                    data: {
                        credentials: {
                            cookies: {
                                access_token: hasAccessToken ? credentialCookies.access_token : null,
                                refresh_token: hasRefreshToken ? credentialCookies.refresh_token : null
                            },
                            localStorage: {
                                az_user_tracking_id: hasAzTracking ? credentialLocalStorage.az_user_tracking_id : null
                            }
                        },
                        validation: {
                            accessToken: hasAccessToken,
                            refreshToken: hasRefreshToken,
                            azUserTrackingId: hasAzTracking
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
                    platform: 'maang',
                    message: 'Credentials filtered to required fields only',
                    data: {
                        credentials: filteredCredentials
                    }
                }
            }
            
            if (!hasAllRequired) {
                return {
                    success: false,
                    platform: 'maang',
                    message: 'Missing required Maang credentials',
                    data: {
                        credentials: {
                            cookies: {
                                access_token: hasAccessToken ? credentialCookies.access_token : null,
                                refresh_token: hasRefreshToken ? credentialCookies.refresh_token : null
                            },
                            localStorage: {
                                az_user_tracking_id: hasAzTracking ? credentialLocalStorage.az_user_tracking_id : null
                            }
                        },
                        validation: {
                            accessToken: hasAccessToken,
                            refreshToken: hasRefreshToken,
                            azUserTrackingId: hasAzTracking
                        }
                    }
                }
            }
            
            const validationResults = {
                accessToken: false,
                refreshToken: false,
                azUserTrackingId: false
            }
            
            let targetCreds = null
            let targetCookies = {}
            let targetLocalStorage = {}
            
            if (mode === 'match_browser') {
                const currentBrowserData = await BrowserDataCollector.getBrowserData()
                if (!currentBrowserData.success) {
                    return {
                        success: false,
                        platform: 'maang',
                        error: 'Could not fetch current browser data',
                        data: null
                    }
                }
                targetCreds = currentBrowserData.data.credentials
                targetCookies = targetCreds.cookies || {}
                targetLocalStorage = targetCreds.localStorage || {}
            } else if (mode === 'match_provided') {
                if (!targetCredentials) {
                    return {
                        success: false,
                        platform: 'maang',
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
                    platform: 'maang',
                    error: `Unsupported validation mode: ${mode}`,
                    data: null
                }
            }
            
            const targetHasAccessToken = targetCookies.access_token && targetCookies.access_token.value
            const targetHasRefreshToken = targetCookies.refresh_token && targetCookies.refresh_token.value
            const targetHasAzTracking = targetLocalStorage.az_user_tracking_id
            
            if (targetHasAccessToken && credentialCookies.access_token) {
                validationResults.accessToken = credentialCookies.access_token.value === targetCookies.access_token.value
            }
            
            if (targetHasRefreshToken && credentialCookies.refresh_token) {
                validationResults.refreshToken = credentialCookies.refresh_token.value === targetCookies.refresh_token.value
            }
            
            if (targetHasAzTracking && credentialLocalStorage.az_user_tracking_id) {
                validationResults.azUserTrackingId = credentialLocalStorage.az_user_tracking_id === targetLocalStorage.az_user_tracking_id
            }
            
            const targetHasAllCredentials = targetHasAccessToken && targetHasRefreshToken && targetHasAzTracking
            const allValidationsPassed = validationResults.accessToken && validationResults.refreshToken && validationResults.azUserTrackingId
            const success = targetHasAllCredentials && allValidationsPassed
            
            return {
                success,
                platform: 'maang',
                message: success ? 'Maang credentials validated' : 'No matching Maang credentials found',
                data: {
                    credentials: {
                        cookies: {
                            access_token: credentialCookies.access_token,
                            refresh_token: credentialCookies.refresh_token
                        },
                        localStorage: {
                            az_user_tracking_id: credentialLocalStorage.az_user_tracking_id
                        }
                    },
                    validation: validationResults
                }
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
}
