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


            const syncResult = await credentialsAPI.storeCredentials(userValidation.data.token, credentials);
            
            if (syncResult.success) {
                try {
                    const tabs = await chrome.tabs.query({ url: `*://*.${domainConfig.domain.PRIMARY}/*` });
                    if (tabs && tabs.length > 0) {
                        for (const tab of tabs.filter(tab => tab && tab.id)) {
                            await chrome.scripting.executeScript({
                                target: { tabId: tab.id },
                                func: (title, message, type) => {
                                    if (typeof window.NotificationHandler !== 'undefined') {
                                        const handler = new window.NotificationHandler();
                                        handler.handleMessage({
                                            type: 'SHOW_TOAST_NOTIFICATION',
                                            title, message, notificationType: type, duration: 5000
                                        });
                                    }
                                },
                                args: ['Sync Success', 'MAANG credentials synced successfully', 'success']
                            });
                        }
                    }
                } catch (notificationError) {
                    console.log('Could not show notification:', notificationError.message);
                }
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
