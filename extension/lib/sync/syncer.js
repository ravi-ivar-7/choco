class CredentialSyncer {
    static async syncCredentials(domainConfig, userAPI, credentialsAPI) {
        try {
            if (!domainConfig || !domainConfig.key) {
                return {
                    success: false,
                    error: 'Invalid domain configuration',
                    message: 'Domain configuration is required for sync',
                    data: null
                };
            }

            if (domainConfig.key === 'MAANG') {
                return await MaangSync.syncCredentials(domainConfig, userAPI, credentialsAPI);
            } else if (domainConfig.key === 'DEVS') {
                return await DevsSync.syncCredentials(domainConfig, userAPI, credentialsAPI);
            } else {
                return {
                    success: false,
                    error: 'Unsupported domain',
                    message: `Sync not supported for domain: ${domainConfig.key}`,
                    data: null
                };
            }

        } catch (error) {
            return {
                success: false,
                error: 'Sync error',
                message: `Error during credential sync: ${error.message}`,
                data: null
            };
        }
    }
}
