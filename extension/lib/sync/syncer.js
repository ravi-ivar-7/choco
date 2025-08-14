class CredentialSyncer {
    static async syncCredentialsToDatabase(domainConfig, userAPI, credentialsAPI) {
        try {
            if (!domainConfig || !domainConfig.key) {
                return {
                    success: false,
                    error: 'Invalid domain configuration',
                    message: 'Domain configuration is required for database sync',
                    data: null
                };
            }

            if (domainConfig.key === 'MAANG') {
                return await MaangDBSync.syncCredentials(domainConfig, userAPI, credentialsAPI);
            } else if (domainConfig.key === 'DEVS') {
                return await DevsDBSync.syncCredentials(domainConfig, userAPI, credentialsAPI);
            } else {
                return {
                    success: false,
                    error: 'Unsupported domain',
                    message: `Database sync not supported for domain: ${domainConfig.key}`,
                    data: null
                };
            }

        } catch (error) {
            return {
                success: false,
                error: 'Database sync error',
                message: `Error during credential database sync: ${error.message}`,
                data: null
            };
        }
    }

    static async syncCredentialsToLocal(domainConfig, userAPI, credentialsAPI, tabId = null) {
        try {

            if (!domainConfig || !domainConfig.key) {
                return {
                    success: false,
                    error: 'Invalid domain configuration',
                    message: 'Domain configuration is required for local sync',
                    data: null
                };
            }

            if (domainConfig.key === 'MAANG') {
                return await MaangLocalSync.syncCredentialsToLocal(domainConfig, userAPI, credentialsAPI, tabId);
            } else if (domainConfig.key === 'DEVS') {
                return await DevsLocalSync.syncCredentialsToLocal(domainConfig, userAPI, credentialsAPI, tabId);
            } else {
                return {
                    success: false,
                    error: 'Unsupported domain',
                    message: `Local sync not supported for domain: ${domainConfig.domain.PRIMARY}`,
                    data: null
                };
            }
        } catch (error) {
            console.error('Error in CredentialSyncer.syncCredentialsToLocal:', error);
            return {
                success: false,
                error: 'Sync error',
                message: 'Failed to sync credentials to local storage',
                data: null
            };
        }
    }
}
