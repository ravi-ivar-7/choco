class HomeController {
    constructor() {
        this.footerStatus = null;
        this.userAPI = null;
        this.credentialsAPI = null;
        this.targetTab = null;
        this.selectedTeam = null;
        this.teamConfig = null;
        this.token = null;
    }

    async init() {
        try {
            // Initialize APIs first
            if (typeof FooterStatus !== 'undefined') {
                this.footerStatus = new FooterStatus();
                this.footerStatus.init();
            }

            if (typeof UserAPI !== 'undefined' && typeof Constants !== 'undefined') {
                this.userAPI = new UserAPI(Constants.BACKEND_URL);
            }

            if (typeof CredentialsAPI !== 'undefined' && typeof Constants !== 'undefined') {
                this.credentialsAPI = new CredentialsAPI(Constants.BACKEND_URL);
            }

            this.initializeStatusCard();
            
            // Check authentication first
            const isAuthenticated = await this.checkUserStatus();
            
            if (isAuthenticated) {
                // Only initialize storage data if user is authenticated
                const storageInitialized = await this.initializeFromStorage();
                if (storageInitialized) {
                    await this.initializeTabAndDomainInfo();
                }
            } else {
                this.updateHomeStatusCard('info', 'Authentication Required', 'Please login from the Profile page to access home features.');
            }
            
            this.bindActionButtons();
        } catch (error) {
            console.error('HomeController initialization failed:', error);
        }
    }

    async initializeFromStorage() {
        try {
            const storageResult = await StorageUtils.get(['choco_selected_team', 'choco_team_config', 'choco_target_tab', 'choco_token']);
            
            if (!storageResult.success) {
                this.updateHomeStatusCard('error', 'Storage Access Failed', 'Unable to retrieve configuration data');
                return false;
            }

            const { choco_selected_team, choco_team_config, choco_target_tab, choco_token } = storageResult.data;
            
            // Check for missing required data
            const missingItems = [];
            
            if (!choco_selected_team) {
                missingItems.push('team selection');
            } else {
                this.selectedTeam = choco_selected_team;
            }

            if (!choco_team_config) {
                missingItems.push('team configuration');
            } else {
                this.teamConfig = choco_team_config;
            }

            if (!choco_target_tab) {
                missingItems.push('target tab');
            } else {
                this.targetTab = choco_target_tab;
            }

            if (!choco_token) {
                missingItems.push('authentication token');
            } else {
                this.token = choco_token;
            }

            // Show status card if critical data is missing
            if (missingItems.length > 0) {
                const missingText = missingItems.join(', ');
                this.updateHomeStatusCard('info', 'Setup Required', `Missing: ${missingText}. Please visit the Profile page to complete setup.`);
                return false;
            }

            return true;

        } catch (error) {
            console.error('HomeController: Error initializing from storage:', error);
        }
    }

    initializeStatusCard() {
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');

        if (!this.statusIndicator || !this.statusText) {
            console.error('Status card elements not found');
        }
    }

    updateHomeStatusCard(type, message, details = '') {
        if (!this.statusIndicator || !this.statusText) {
            console.error('Status card not initialized');
            return;
        }

        this.statusIndicator.className = `status-indicator status-${type}`;
        this.statusText.textContent = message;

        if (details) {
            const detailsElement = document.getElementById('statusDetails');
            if (detailsElement) {
                detailsElement.textContent = details;
                detailsElement.style.display = 'block';
            }
        }
    }

    async initializeTabAndDomainInfo() {
        try {
            const result = await StorageUtils.get(['choco_target_tab']);
            if (result.success && result.data.choco_target_tab) {
                this.targetTab = result.data.choco_target_tab;
            } else {
                console.log('No target tab in storage');
            }
        } catch (error) {
            console.error('Error initializing tab and domain info:', error);
        }
    }

    async checkUserStatus() {
        try {
            if (!this.userAPI) {
                this.updateHomeStatusCard('inactive', '🔧 Extension not properly initialized');
                return false;
            }

            const storedUser = await this.userAPI.getLocalStoredUser();
            if (storedUser.success) {
                this.updateHomeStatusCard('active', '🟢 Extension is active and ready');
                return true;
            } else {
                this.updateHomeStatusCard('inactive', '🔑 Please log in from profile page at top-right corner');
                return false;
            }
        } catch (error) {
            console.error('Error checking user status:', error);
            this.updateHomeStatusCard('error', '❌ Unable to check authentication status');
            return false;
        }
    }

    bindActionButtons() {
        const syncButton = document.getElementById('syncBtn');
        if (syncButton) {
            syncButton.addEventListener('click', () => {
                this.handleSync();
            });
        }

        const refreshButton = document.getElementById('refreshBtn');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.handleRefresh();
            });
        }

        const helpLink = document.getElementById('helpLink');
        if (helpLink) {
            helpLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showHelp();
            });
        }
    }

    async handleSync() {
        try {
            if (!this.credentialsAPI) {
                this.updateHomeStatusCard('inactive', '🔧 Extension not properly initialized');
                return;
            }

            this.updateHomeStatusCard('loading', '🔍 Looking in your browser...')

            await new Promise(resolve => setTimeout(resolve, 500))

            const browserDataResult = await GetBrowserData.getBrowserData()

            if (!browserDataResult.success) {
                this.updateHomeStatusCard('inactive', '❌ ' + (browserDataResult.message || 'Failed to collect browser data'))
                return
            }

            const actualBrowserData = browserDataResult.data;

            if (!actualBrowserData || Object.keys(actualBrowserData).length === 0) {
                this.updateHomeStatusCard('inactive', '❌ No browser data found - Please make sure you\'re on the correct website')
                return
            }

            

            await new Promise(resolve => setTimeout(resolve, 500))

            // Get auth data for storing credentials
            const authResult = await StorageUtils.get(['choco_token', 'choco_selected_team']);
            if (!authResult.success || !authResult.data.choco_token || !authResult.data.choco_selected_team) {
                this.updateHomeStatusCard('inactive', '❌ Authentication required - Please log in');
                return;
            }

            // Validate credentials match config before storing
            const validationResult = await CredentialValidator.validateCredentials(
                actualBrowserData,
                'match_config'
            );

            if (validationResult.success) {
                this.updateHomeStatusCard('success', '✅ Found your web platform login! Sharing with your team...')
                const storeResult = await this.credentialsAPI.setCredentials(
                    authResult.data.choco_token,
                    actualBrowserData,
                    authResult.data.choco_selected_team.id
                )
                if (storeResult.success) {
                    this.updateHomeStatusCard('success', '🎉 Great! Your login details have been shared with your team')
                    // Get current tab info for domain
                    const storageResult = await StorageUtils.get(['choco_target_tab']);
                    if (storageResult.success && storageResult.data.choco_target_tab?.url) {
                        const domain = new URL(storageResult.data.choco_target_tab.url).hostname.replace(/\./g, '_');
                        const domainKey = `${domain}_credentials_lastupdate`;
                        await StorageUtils.set({ [domainKey]: new Date().toISOString() });
                    }
                }
                else{
                    this.updateHomeStatusCard('inactive', '❌ Failed to store credentials')
                }
            }
            else {
                this.updateHomeStatusCard('loading', 'Missing some credentials...')

                await new Promise(resolve => setTimeout(resolve, 500))

                this.updateHomeStatusCard('loading', '👥 Asking your teammates for help...')

                await new Promise(resolve => setTimeout(resolve, 500))

                const handleTokenFromDB = await this.handleTokenFromDB()

                if (handleTokenFromDB.success) {
                    const storageResult = await StorageUtils.get(['choco_target_tab']);
                    if (storageResult.success && storageResult.data.choco_target_tab?.url) {
                        const domain = new URL(storageResult.data.choco_target_tab.url).hostname.replace(/\./g, '_');
                        const domainKey = `${domain}_credentials_lastupdate`;

                        await StorageUtils.set({
                            [domainKey]: new Date().toISOString()
                        });
                    }
                    this.updateHomeStatusCard('success', '🎉 Great! Your team has you covered')

                } else {
                    this.updateHomeStatusCard('inactive', '🔑 Web Platform Access Required')
                }
            }
        } catch (error) {
            console.error('Error in handleSync:', error)
            const errorMsg = error.message || 'Something went wrong - Please try again';
            this.updateHomeStatusCard('inactive', '❌ ' + errorMsg)
        }

    }

    async handleTokenFromDB() {
        try {
            const storageResult = await StorageUtils.get(['choco_token', 'choco_selected_team']);
            if (!storageResult.success || !storageResult.data.choco_token || !storageResult.data.choco_selected_team) {
                return {
                    success: false,
                    error: 'Authentication required',
                    message: 'Please log in and select a team'
                };
            }

            const teamCredentialsResponse = await this.credentialsAPI.getCredentials(
                storageResult.data.choco_token,
                storageResult.data.choco_selected_team.id
            )

            const credentials = teamCredentialsResponse.data?.credentials
            if (!teamCredentialsResponse.success || !credentials || credentials.length === 0) {
                return {
                    success: false,
                    error: teamCredentialsResponse.error || 'No credentials',
                    message: teamCredentialsResponse.message || 'Your teammates haven\'t set up web platform access yet',
                    data: null
                }
            }

            // Only try the first valid credential
            for (const teamCredential of credentials) {
                const validation = await CredentialValidator.validateCredentials(teamCredential, 'match_config')

                if (!validation.success) {
                    continue
                }
                try {
                    // Create a copy to prevent mutation of original credential object
                    const credentialCopy = JSON.parse(JSON.stringify(teamCredential));
                    const setBrowserDataResult = await SetBrowserData.setBrowserData(credentialCopy);

                    // Handle partial success scenarios
                    if (setBrowserDataResult.success) {
                        const results = setBrowserDataResult.data?.results || [];
                        const failedResults = results.filter(r => !r.success);
                        const successfulResults = results.filter(r => r.success);
                        
                        if (failedResults.length === 0) {
                            // Full success
                            NotificationDialog.show(
                                'Credentials Applied Successfully',
                                'All credentials applied. Refresh to test login.',
                                {
                                    type: 'success',
                                    buttons: [
                                        {
                                            text: 'Refresh Page',
                                            onClick: () => {
                                                if (this.targetTab?.id) {
                                                    chrome.tabs.reload(this.targetTab.id);
                                                }
                                            },
                                            primary: true
                                        },
                                        { text: 'Later', primary: false }
                                    ]
                                }
                            );
                        } else {
                            // Partial success - show detailed breakdown
                            const successList = successfulResults.map(r => 
                                `<div style="color: #3fb950; margin: 2px 0;">✅ ${r.type}: ${r.name || 'Applied'}</div>`
                            ).join('');
                            
                            const failureList = failedResults.map(r => 
                                `<div style="color: #f85149; margin: 2px 0;">❌ ${r.type}: ${r.name || 'Failed'} ${r.error ? `(${r.error})` : ''}</div>`
                            ).join('');
                            
                            const detailedMessage = `
                                <div style="margin-bottom: 12px;">Some credentials applied successfully (${successfulResults.length}/${results.length}):</div>
                                <div style="font-family: monospace; font-size: 12px; background: #0d1117; padding: 8px; border-radius: 4px; margin: 8px 0;">
                                    ${successList}
                                    ${failureList}
                                </div>
                                <div>Try refreshing to test login or try another credential.</div>
                            `;
                            
                            NotificationDialog.show(
                                'Credentials Partially Applied',
                                detailedMessage,
                                {
                                    type: 'warning',
                                    buttons: [
                                        // {
                                        //     text: 'Refresh Page',
                                        //     onClick: () => {
                                        //         if (this.targetTab?.id) {
                                        //             chrome.tabs.reload(this.targetTab.id);
                                        //         }
                                        //     },
                                        //     primary: true
                                        // },
                                        {
                                            text: 'Got it',
                                            primary: true
                                        }
                                    ]
                                }
                            );
                        }
                    } else {
                        NotificationDialog.show(
                            'Credentials Failed',
                            setBrowserDataResult.message || 'Could not apply credentials to this page',
                            {
                                type: 'error',
                                buttons: [
                                    {
                                        text: 'Try Another',
                                        onClick: () => {
                                            // Trigger another credential attempt
                                            this.handleSync();
                                        },
                                        primary: true
                                    },
                                    {
                                        text: 'Login Manually',
                                        onClick: () => {
                                            if (this.targetTab?.id) {
                                                chrome.tabs.update(this.targetTab.id, { active: true });
                                            }
                                        },
                                        primary: false
                                    }
                                ]
                            }
                        );
                    }

                    if (setBrowserDataResult.success) {
                        // No need for additional validation after successful application
                        return {
                            success: true,
                            error: null,
                            message: 'Team credentials applied successfully',
                            data: { credentials: teamCredential, ...setBrowserDataResult.data, validated: true }
                        }
                    } else {
                        return setBrowserDataResult
                    }
                } catch (error) {
                    console.error('Error setting browser data:', error)
                    continue
                }
            }

            return {
                success: false,
                error: 'No valid credentials found',
                message: 'None of the available credentials could be applied to this page'
            };
        } catch (error) {
            console.error('Error in handleTokenFromDB:', error)
            return {
                success: false,
                error: error.message || 'Unknown error',
                message: 'Failed to retrieve and apply team credentials'
            }
        }
    }

    async handleRefresh() {
        try {
            this.updateHomeStatusCard('loading', 'Checking status...');

            // Re-initialize everything like init() does
            if (!this.userAPI && typeof UserAPI !== 'undefined' && typeof Constants !== 'undefined') {
                this.userAPI = new UserAPI(Constants.BACKEND_URL);
            }

            if (!this.credentialsAPI && typeof CredentialsAPI !== 'undefined' && typeof Constants !== 'undefined') {
                this.credentialsAPI = new CredentialsAPI(Constants.BACKEND_URL);
            }

            await this.initializeTabAndDomainInfo();

            if (this.userAPI) {
                // First check if user exists in local storage
                const storedUser = await this.userAPI.getLocalStoredUser();
                if (storedUser.success && storedUser.data?.token) {
                    // If user exists locally, verify token with server
                    const verifyResult = await this.userAPI.verifyUser(storedUser.data.token);
                    if (verifyResult.success) {
                        this.updateHomeStatusCard('active', 'Extension is active and ready');
                    } else {
                        this.updateHomeStatusCard('inactive', 'Session expired - please login again');
                    }
                } else {
                    this.updateHomeStatusCard('inactive', 'Not authenticated');
                }
            }
        } catch (error) {
            console.error('Refresh failed:', error);
            this.updateHomeStatusCard('error', 'Status check failed');
        }
    }

    destroy() {
    }

    showHelp() {
        console.log('Help requested');
    }
}

window.HomeController = HomeController;
