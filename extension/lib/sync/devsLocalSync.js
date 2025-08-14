class DevsLocalSync {
    static async syncCredentialsToLocal(domainConfig, userAPI, credentialsAPI, tabId = null) {
        try {
            if (!domainConfig) {
                return {
                    success: false,
                    error: 'Invalid domain configuration',
                    message: 'Domain configuration is required for local sync',
                    data: null
                };
            }



            // Validate user first
            const userValidation = await userAPI.validateUser();
            if (!userValidation.success) {
                return {
                    success: false,
                    error: 'User validation failed',
                    message: userValidation.message || 'User authentication required for local sync',
                    data: null
                };
            }

            // Get credentials from database
            const teamCredentialsResponse = await credentialsAPI.getCredentials(userValidation.data.token);
            if (!teamCredentialsResponse.success || !teamCredentialsResponse.data?.credentials) {
                return {
                    success: false,
                    error: 'No credentials found',
                    message: 'No team credentials found in database to sync locally',
                    data: null
                };
            }

            const credentials = teamCredentialsResponse.data.credentials;


            // Find credentials for this domain
            let domainCredentials = null;
            for (const teamCredential of credentials) {
                const validation = await CredentialValidator.validateCredentials(teamCredential, 'structure_filter', null, domainConfig);
                if (validation.success && validation.data.domain === domainConfig.domain.PRIMARY) {
                    domainCredentials = teamCredential;
                    break;
                }
            }

            if (!domainCredentials) {
                return {
                    success: false,
                    error: 'No domain credentials',
                    message: `No credentials found for ${domainConfig.domain.PRIMARY} in database`,
                    data: null
                };
            }



            // Use provided tabId or find suitable tab for domain as fallback
            let targetTabId = tabId;
            let targetUrl = `https://${domainConfig.domain.PRIMARY}`;
            
            if (!targetTabId) {
                const tabResult = await ChromeUtils.getTabForDomain(domainConfig.domain.PRIMARY);
                if (!tabResult.success) {
                    console.error('Failed to find suitable tab for domain:', tabResult.error);
                    return {
                        success: false,
                        error: 'No target tab',
                        message: `Cannot apply credentials without target tab for ${domainConfig.domain.PRIMARY}`,
                        data: null
                    };
                }
                targetTabId = tabResult.data.id;
                targetUrl = tabResult.data.url;

            }
            
            // Apply credentials to browser (cookies, localStorage, sessionStorage)
            const setBrowserDataResult = await BrowserDataCollector.setBrowserData(
                targetTabId,
                domainCredentials,
                targetUrl
            );

            if (setBrowserDataResult.success) {

                return {
                    success: true,
                    error: null,
                    message: 'DEVS credentials synced from database to local browser',
                    data: { 
                        domain: domainConfig.domain.PRIMARY,
                        appliedCredentials: setBrowserDataResult.data
                    }
                };
            } else {
                return {
                    success: false,
                    error: 'Failed to apply credentials',
                    message: setBrowserDataResult.message || 'Failed to apply credentials to browser',
                    data: setBrowserDataResult.data
                };
            }

        } catch (error) {
            console.error('Error in DEVS local sync:', error);
            return {
                success: false,
                error: 'Local sync error',
                message: `Error during local credential sync: ${error.message}`,
                data: null
            };
        }
    }
}
