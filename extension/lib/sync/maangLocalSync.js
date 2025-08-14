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
            const sortedCredentials = credentials.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            let lastError = null;
            let attemptedCredentials = [];
            
            for (let i = 0; i < sortedCredentials.length; i++) {
                const teamCredential = sortedCredentials[i];

                
                const validation = await CredentialValidator.validateCredentials(teamCredential, 'structure_filter', null, domainConfig);

                
                if (validation.success) {
                    // Try to apply this credential

                    
                    // Get target tab
                    let targetTabId = tabId;
                    if (!targetTabId) {
                        const tabResult = await ChromeUtils.getTabForDomain(domainConfig.domain.PRIMARY);
                        if (!tabResult.success) {
                            console.error('Failed to find suitable tab for domain:', tabResult.error);
                            lastError = `Cannot apply credentials without target tab for ${domainConfig.domain.PRIMARY}`;
                            continue; // Try next credential
                        }
                        targetTabId = tabResult.data.id;

                    }
                    
                    // Try to set browser data
                    const setBrowserDataResult = await BrowserDataCollector.setBrowserData(
                        targetTabId,
                        teamCredential,
                        `https://${domainConfig.domain.PRIMARY}`
                    );
                    
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
                        console.error(`Failed to apply credential ${i + 1}:`, setBrowserDataResult.message);
                        lastError = setBrowserDataResult.message;
                        attemptedCredentials.push({
                            id: teamCredential.id,
                            created: teamCredential.createdAt,
                            error: setBrowserDataResult.message
                        });
                        // Continue to next credential
                    }
                } else {

                    attemptedCredentials.push({
                        id: teamCredential.id,
                        created: teamCredential.createdAt,
                        error: validation.message
                    });
                }
            }

            // If we get here, all credentials failed
            console.error('All credentials failed to apply');
            return {
                success: false,
                error: 'All credentials failed',
                message: `Tried ${attemptedCredentials.length} credentials for ${domainConfig.domain.PRIMARY}, all failed. Last error: ${lastError}`,
                data: {
                    attemptedCredentials: attemptedCredentials,
                    lastError: lastError
                }
            };

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
