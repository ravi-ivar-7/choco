class MaangLocalSync {
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
            const userValidation = await userAPI.validateUser();
            if (!userValidation.success) {
                return {
                    success: false,
                    error: 'User validation failed',
                    message: userValidation.message || 'User authentication required for local sync',
                    data: null
                };
            }
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
            const teamCredential = credentials[0];
            
            const validation = await CredentialValidator.validateCredentials(teamCredential, 'structure_filter', null, domainConfig);

            if (!validation.success) {
                return {
                    success: false,
                    error: 'Credential validation failed',
                    message: validation.message || 'First credential failed validation',
                    data: { credentialId: teamCredential.id }
                };
            }

            // Get target tab
            let targetTabId = tabId;
            let currentTab = null;
            
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
                currentTab = tabResult.data;
            } else {
                // Try to get stored tab from selectedPlatform
                try {
                    const result = await chrome.storage.local.get(['selectedPlatform']);
                    if (result.selectedPlatform && result.selectedPlatform.tab && result.selectedPlatform.tab.id === targetTabId) {
                        currentTab = result.selectedPlatform.tab;
                    } else {
                        // Fallback to getting tab info
                        currentTab = await chrome.tabs.get(targetTabId);
                    }
                } catch (error) {
                    console.warn('Could not get stored tab, using fallback:', error.message);
                    currentTab = await chrome.tabs.get(targetTabId);
                }
            }
            
            // Try to set browser data
            const setBrowserDataResult = await BrowserDataCollector.setBrowserData(
                targetTabId,
                teamCredential,
                currentTab.url || `https://${domainConfig.domain.PRIMARY}`
            );

            // Show notification based on the result

            console.log('showing nofition', setBrowserDataResult)
            await NotificationUtils.showExtensionNotification(currentTab, { setBrowserDataResult });
            
            if (setBrowserDataResult.success) {
                return {
                    success: true,
                    error: null,
                    message: 'MAANG credentials synced from database to local browser',
                    data: {
                        domain: domainConfig.domain.PRIMARY,
                        appliedCredentials: setBrowserDataResult.data,
                        credentialUsed: teamCredential.id
                    }
                };
            } else {
                return {
                    success: false,
                    error: 'Failed to apply credential',
                    message: setBrowserDataResult.message || 'Failed to apply team credential',
                    data: {
                        credentialId: teamCredential.id,
                        setBrowserDataResult: setBrowserDataResult
                    }
                };
            }

        } catch (error) {
            console.error('Error in MAANG local sync:', error);
            return {
                success: false,
                error: 'Local sync error',
                message: `Error during local credential sync: ${error.message}`,
                data: null
            };
        }
    }
}
