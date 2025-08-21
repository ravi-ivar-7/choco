class BaseSyncer {

    static async showLocalSyncDialog(setBrowserDataResult) {
        try {
            // Get stored target tab for dialog injection
            const result = await chrome.storage.local.get(['choco_target_tab']);
            if (!result.choco_target_tab?.id) {
                return;
            }

            const tabId = result.choco_target_tab.id;
            
            // Verify tab still exists
            const tab = await chrome.tabs.get(tabId);
            if (!tab || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                return;
            }

            // Prepare dialog data - use same logic as HomeController
            const { success, data } = setBrowserDataResult;
            let title, message, type, actions;

            if (success) {
                const results = data?.results || [];
                const failedResults = results.filter(r => !r.success);
                const successfulResults = results.filter(r => r.success);
                
                if (failedResults.length === 0) {
                    // Full success
                    title = 'Credentials Updated';
                    message = 'Your credentials have been successfully synced from the database';
                    type = 'success';
                    actions = [
                        { text: 'Got it', action: 'dismiss' }
                    ];
                } else {
                    // Partial success - show detailed breakdown like HomeController
                    const successList = successfulResults.map(r => 
                        `<div style="color: #3fb950; margin: 2px 0;">✅ ${r.type}: ${r.name || 'Applied'}</div>`
                    ).join('');
                    
                    const failureList = failedResults.map(r => 
                        `<div style="color: #f85149; margin: 2px 0;">❌ ${r.type}: ${r.name || 'Failed'} ${r.error ? `(${r.error})` : ''}</div>`
                    ).join('');
                    
                    title = 'Credentials Partially Updated';
                    message = `
                        <div style="margin-bottom: 12px;">Some credentials synced successfully (${successfulResults.length}/${results.length}):</div>
                        <div style="font-family: monospace; font-size: 12px; background: #0d1117; padding: 8px; border-radius: 4px; margin: 8px 0;">
                            ${successList}
                            ${failureList}
                        </div>
                        <div>Refresh to test login with updated credentials.</div>
                    `;
                    type = 'warning';
                    actions = [
                        { text: 'Got it', action: 'dismiss' }
                    ];
                }
            } else {
                return; // Don't show dialog for failures
            }

            // Inject dialog notification
            await chrome.scripting.executeScript({
                target: { tabId },
                func: (title, message, type, actions) => {
                    if (typeof NotificationDialog !== 'undefined') {
                        NotificationDialog.show(title, message, {
                            type: type,
                            buttons: actions.map(action => ({
                                text: action.text,
                                primary: action.action === 'refresh_page',
                                action: action.action   
                            }))
                        });
                    }
                },
                args: [title, message, type, actions]
            });
        } catch (error) {
            console.error('Failed to show local sync dialog:', error.message);
        }
    }

    static async syncCredentialsToDatabase() {
        try {
            // Get stored data from chrome storage
            const storageResult = await StorageUtils.get(['choco_token', 'choco_selected_team']);
            if (!storageResult.success || !storageResult.data.choco_token || !storageResult.data.choco_selected_team) {
                return {
                    success: false,
                    error: 'Authentication required',
                    message: 'Please log in and select a team',
                    data: null
                };
            }

            // Get current browser data
            const browserDataResult = await GetBrowserData.getBrowserData();
            if (!browserDataResult.success) {
                return {
                    success: false,
                    error: 'Failed to collect browser data',
                    message: browserDataResult.message || 'Could not collect current browser data',
                    data: null
                };
            }

            // Validate credentials before saving to database
            const validation = await CredentialValidator.validateCredentials(browserDataResult.data, 'match_config');
            if (!validation.success) {
                return {
                    success: false,
                    error: 'Invalid credentials',
                    message: validation.message || 'Credentials failed validation before database sync',
                    data: null
                };
            }
            
            // Save to database via API
            const credentialsAPI = new CredentialsAPI(Constants.BACKEND_URL);
            const saveResult = await credentialsAPI.setCredentials(
                storageResult.data.choco_token,
                browserDataResult.data,
                storageResult.data.choco_selected_team.id
            );

            return {
                success: saveResult.success,
                error: saveResult.error,
                message: saveResult.message || 'Credentials synced to database successfully',
                data: saveResult.data
            };

        } catch (error) {
            return {
                success: false,
                error: 'Database sync error',
                message: `Error syncing credentials to database: ${error.message}`,
                data: null
            };
        }
    }

    static async syncCredentialsToLocal() {
        try {
            // Get stored data from chrome storage
            const storageResult = await StorageUtils.get(['choco_token', 'choco_selected_team']);
            if (!storageResult.success || !storageResult.data.choco_token || !storageResult.data.choco_selected_team) {
                return {
                    success: false,
                    error: 'Authentication required',
                    message: 'Please log in and select a team',
                    data: null
                };
            }

            // Get credentials from database
            const credentialsAPI = new CredentialsAPI(Constants.BACKEND_URL);
            const credentialsResult = await credentialsAPI.getCredentials(
                storageResult.data.choco_token,
                storageResult.data.choco_selected_team.id
            );

            if (!credentialsResult.success || !credentialsResult.data.credentials || credentialsResult.data.credentials.length === 0) {
                return {
                    success: false,
                    error: 'No credentials found',
                    message: 'No team credentials available to sync locally',
                    data: null
                };
            }

            // Apply first valid credential
            const credentials = credentialsResult.data.credentials;
            for (const credential of credentials) {

                // Validate credentials before applying
                const validation = await CredentialValidator.validateCredentials(credential, 'match_config');
                if (!validation.success) {
                    continue;
                }

                const credentialCopy = JSON.parse(JSON.stringify(credential));
                const setBrowserDataResult = await SetBrowserData.setBrowserData(credentialCopy);

                if (setBrowserDataResult.success) {
                    // Show dialog notification for successful local sync
                    this.showLocalSyncDialog(setBrowserDataResult);
                    
                    return {
                        success: true,
                        error: null,
                        message: 'Credentials synced from database to local browser successfully',
                        data: setBrowserDataResult.data
                    };
                }
            }

            return {
                success: false,
                error: 'No valid credentials',
                message: 'No valid credentials could be applied locally',
                data: null
            };

        } catch (error) {
            return {
                success: false,
                error: 'Local sync error',
                message: `Error syncing credentials to local storage: ${error.message}`,
                data: null
            };
        }
    }
}
