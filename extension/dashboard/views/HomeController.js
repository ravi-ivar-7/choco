class HomeController {
    constructor() {
        this.footerStatus = null;
        this.platformSelector = null;
        this.platformUtils = null;
        this.userAPI = null;
        this.credentialsAPI = null;
        this.currentTab = null;
        this.domainConfig = null;
        this.isValidDomain = false;
        this.selectedPlatform = null;
    }

    async init() {
        try {
            
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
            
            await this.initializeTabAndDomainInfo();
            
            await this.checkUserStatus();
            
            this.bindActionButtons();
            
        } catch (error) {
            console.error('HomeController initialization failed:', error);
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

        this.statusIndicator.className = 'status-indicator';
        
        switch(type) {
            case 'active':
            case 'success':
                this.statusIndicator.classList.add('status-active');
                break;
            case 'inactive':
            case 'warning':
                this.statusIndicator.classList.add('status-inactive');
                break;
            case 'error':
                this.statusIndicator.classList.add('status-error');
                break;
            case 'loading':
                this.statusIndicator.classList.add('status-loading');
                break;
            default:
                this.statusIndicator.classList.add('status-none');
        }
        
        this.statusText.textContent = message;
    }

    async initializeTabAndDomainInfo() {
        try {
            if (typeof StorageUtils !== 'undefined') {
                const result = await StorageUtils.get(['selectedPlatform']);
                if (result.success && result.data.selectedPlatform) {
                    const storedPlatform = result.data.selectedPlatform;
                    
                    this.selectedPlatform = storedPlatform;
                    this.currentTab = storedPlatform.tab;
                    this.tabId = storedPlatform.tab?.id;
                    this.currentUrl = storedPlatform.tab?.url;
                    this.domainConfig = storedPlatform.domainConfig;
                    this.isValidDomain = true;
                    
                    this.updateHomeStatusCard('active', `${storedPlatform.platformName} Ready`);
                    
                    if (this.footerStatus) {
                        this.footerStatus.show('active', `✅ ${storedPlatform.platformName} Ready`);
                    } else if (window.footerStatus) {
                        window.footerStatus.show('active', `✅ ${storedPlatform.platformName} Ready`);
                    }
                } else {
                    this.isValidDomain = false;
                    this.updateHomeStatusCard('inactive', 'No platform selected');
                    
                    if (this.footerStatus) {
                        this.footerStatus.show('inactive', '🖥️ No platform selected');
                    } else if (window.footerStatus) {
                        window.footerStatus.show('inactive', '🖥️ No platform selected');
                    }
                }
            } else {
                this.updateHomeStatusCard('error', 'Storage not available');
                
                if (this.footerStatus) {
                    this.footerStatus.show('error', 'Storage not available');
                } else if (window.footerStatus) {
                    window.footerStatus.show('error', 'Storage not available');
                }
            }
        } catch (error) {
            console.error('Failed to load platform from storage:', error);
            this.updateHomeStatusCard('error', 'Failed to load platform');
            
            if (this.footerStatus) {
                this.footerStatus.show('error', 'Failed to load platform');
            } else if (window.footerStatus) {
                window.footerStatus.show('error', 'Failed to load platform');
            }
        }
    }

    bindActionButtons() {
        const syncBtn = document.getElementById('syncBtn');
        if (syncBtn) {
            syncBtn.addEventListener('click', () => this.handleSync());
        }
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.handleRefresh());
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
            this.updateHomeStatusCard('loading', '👋 Hi there! Let me check your account...')
            
            if (this.footerStatus) {
                this.footerStatus.show('loading', '🔄 Just making sure you\'re logged into Choco');
            } else if (window.footerStatus) {
                window.footerStatus.show('loading', '🔄 Just making sure you\'re logged into Choco');
            }
            
            await new Promise(resolve => setTimeout(resolve, 500))

            const userValidation = await this.userAPI.validateUser()

            if (!userValidation.success) {
                this.updateHomeStatusCard('inactive', '🔑 Please log in first from profile page at top-right corner.')
                return
            }

            const user = userValidation.data.user
            this.updateHomeStatusCard('loading', 'Great! Welcome back, ' + user.name + '!')
            await new Promise(resolve => setTimeout(resolve, 500))

            this.updateHomeStatusCard('loading', '🔍 Looking in your browser...')
            
            await new Promise(resolve => setTimeout(resolve, 500))
            
            console.log('this.currentTab in handle sync ',this.currentTab)
            
            const browserDataResult = await BrowserDataCollector.getBrowserData(
                this.currentTab?.url,
                this.currentTab?.id,
                this.domainConfig,
                this.currentTab
            )

            console.log('browserDataResult in handle sync ',browserDataResult)
            
            if (!browserDataResult.success) {
                this.updateHomeStatusCard('error', '⚠️ Platform Access Issue')
                return
            }

            const filterResult = await CredentialValidator.validateCredentials(browserDataResult.data.credentials, 'structure_filter', null, this.domainConfig)
            const credentials = filterResult.success ? filterResult.data.credentials : browserDataResult.data.credentials

            console.log('filterResult in handle sync ',filterResult)
            
            if (filterResult.success) {
                this.updateHomeStatusCard('success', 'Found your web platform login!')
                
                await new Promise(resolve => setTimeout(resolve, 500))

                this.updateHomeStatusCard('loading', '🎉 Sharing with your team...')

                await new Promise(resolve => setTimeout(resolve, 500))
                
                console.log("user validation",userValidation)
                const existingCredsResult = await this.credentialsAPI.getCredentials(userValidation.data.token)

                console.log('existingCredsResult in handle sync ',existingCredsResult)
                
                let shouldStore = true
                const existingCredentials = existingCredsResult.data?.credentials || []
                if (existingCredsResult.success && existingCredentials.length > 0) {
                    for (let i = 0; i < existingCredentials.length; i++) {
                        const storedCred = existingCredentials[i]
                        
                        const comparisonResult = await CredentialValidator.validateCredentials(
                            credentials, 
                            'match_provided', 
                            storedCred,
                            this.domainConfig
                        )
                        
                        if (comparisonResult.success) {
                            shouldStore = false
                            this.updateHomeStatusCard('success', '✨ All set! Your team is ready')
                            break
                        }
                    }
                }
                
                let storeResult = { success: true }
                console.log('shouldStore in handle sync ',shouldStore)
                if (shouldStore) {
                    this.updateHomeStatusCard('loading', '💾 Storing new credentials...')
                    storeResult = await this.credentialsAPI.storeCredentials(userValidation.data.token, credentials)
                    console.log('storeResult in handle sync ',storeResult)
                }

                
                
                if (storeResult.success) {
                    const domainKey = `${this.domainConfig.key.toLowerCase()}_credentials_lastupdate`
                    await StorageUtils.set({
                        [domainKey]: new Date().toISOString()
                    })
                    this.updateHomeStatusCard('success', '✨ All set! Your team is ready')
                } else {
                    this.updateHomeStatusCard('error', '😔 Oops! Couldn\'t share with team')
                }

            } else {
                this.updateHomeStatusCard('loading', '🔍 No web platform login found')
                
                await new Promise(resolve => setTimeout(resolve, 500))

                this.updateHomeStatusCard('loading', '👥 Asking your teammates for help...')
                
                await new Promise(resolve => setTimeout(resolve, 500))

                const handleTokenFromDB = await this.handleTokenFromDB()
                console.log('handleTokenFromDB in handle sync ',handleTokenFromDB)

                if (handleTokenFromDB.success) {
                    const domainKey = `${this.domainConfig.key.toLowerCase()}_credentials_lastupdate`
                    await StorageUtils.set({
                        [domainKey]: new Date().toISOString()
                    })
                    this.updateHomeStatusCard('success', '🎉 Great! Your team has you covered')

                } else {
                    this.updateHomeStatusCard('inactive', '🔑 Web Platform Access Required')
                }
            }
        } catch (error) {
            this.updateHomeStatusCard('error', '⚠️ Connection Issue')
            
            if (this.footerStatus) {
                this.footerStatus.show('error', '❌ Unable to connect to Choco backend - Please check your internet connection');
            } else if (window.footerStatus) {
                window.footerStatus.show('error', '❌ Unable to connect to Choco backend - Please check your internet connection');
            }
        }
    }

    async handleTokenFromDB() {
        try {

            const userValidation = await this.userAPI.validateUser()
            if (!userValidation.success) {
                return { success: false, error: 'User not authenticated' }
            }

            const teamCredentialsResponse = await this.credentialsAPI.getCredentials(userValidation.data.token)
            console.log('teamCredentialsResponse in handleTokenFromDB ',teamCredentialsResponse)

            const credentials = teamCredentialsResponse.data?.credentials
            if (!teamCredentialsResponse.success || !credentials || credentials.length === 0) {
                return { success: false, error: 'No credentials', message: 'Your teammates haven\'t set up web platform access yet', data: null }
            }

            // Only try the first valid credential
            for (const teamCredential of credentials) {
                const validation = await CredentialValidator.validateCredentials(teamCredential, 'structure_filter', null, this.domainConfig)
                console.log('validation in handleTokenFromDB ',validation)
 
                if (!validation.success) {
                    continue
                }
                try {
                    if (!this.tabId) {
                        continue
                    }
                    // Create a copy to prevent mutation of original credential object
                    const credentialCopy = JSON.parse(JSON.stringify(teamCredential));
                    const setBrowserDataResult = await BrowserDataCollector.setBrowserData(
                        this.tabId,
                        credentialCopy,
                        this.currentUrl
                    )

                    // Show notification based on the actual result
                    const currentTab = { id: this.tabId, url: this.currentUrl };
                    await NotificationUtils.showExtensionNotification(currentTab, { setBrowserDataResult });

                    if (setBrowserDataResult.success) {
                        const validation = await CredentialValidator.validateCredentials(teamCredential, 'test_credentials', null, this.domainConfig)
                        console.log('validation in handleTokenFromDB ',validation)
                        if (validation.success) {
                            return {
                                success: true,
                                error: null,
                                message: 'Great! Using access shared by your teammate - verified and ready',
                                data: { credentials: teamCredential, setBrowserDataResult, validated: true, validationResults: validation }
                            }
                        } else {
                            return {
                                success: true,
                                error: null,
                                message: 'Team credentials applied successfully',
                                data: { credentials: teamCredential, setBrowserDataResult, validated: false }
                            }
                        }
                    } else {
                        // Return after first attempt (success or failure)
                        return {
                            success: false,
                            error: 'Failed to apply team credentials',
                            message: setBrowserDataResult.message || 'Failed to apply credentials',
                            data: { credentials: teamCredential, setBrowserDataResult }
                        }
                    }
                } catch (error) {
                    console.error('Error setting browser data for credential:', error)
                    // Show error notification
                    const currentTab = { id: this.tabId, url: this.currentUrl };
                    await NotificationUtils.showExtensionNotification(currentTab, {
                        title: 'Application Failed',
                        message: error.message || 'Failed to apply team credentials',
                        notificationType: 'failure'
                    });
                    return {
                        success: false,
                        error: error.message,
                        message: 'Error applying team credentials',
                        data: null
                    }
                }
            }

            // Clean up invalid tokens 
            // const cleanupResult = await this.credentialsAPI.cleanupTokens(userValidation.data.token)

            return {
                success: false,
                error: 'Expired tokens',
                message: 'All team access options have expired - someone needs to sign in again',
                data: null
            }

        } catch (error) {
            return {
                success: false,
                error: 'Connection error',
                message: 'Couldn\'t connect to your team - please try again',
                data: null
            }
        }
    }

    async handleRefresh() {
        try {
            this.updateHomeStatusCard('loading', 'Checking status...');
            
            if (this.footerStatus) {
                this.footerStatus.show('loading', 'Checking status...');
            } else if (window.footerStatus) {
                window.footerStatus.show('loading', 'Checking status...');
            }
            
            await this.initializeTabAndDomainInfo();
            
            if (this.userAPI) {
                const authStatus = await this.userAPI.validateUser();
                if (authStatus.success) {
                    this.updateHomeStatusCard('active', 'Extension is active and ready');
                    
                    if (this.footerStatus) {
                        this.footerStatus.show('active', 'Extension is active and ready');
                    } else if (window.footerStatus) {
                        window.footerStatus.show('active', 'Extension is active and ready');
                    }
                } else {
                    this.updateHomeStatusCard('inactive', 'Not authenticated');
                    
                    if (this.footerStatus) {
                        this.footerStatus.show('inactive', 'Not authenticated');
                    } else if (window.footerStatus) {
                        window.footerStatus.show('inactive', 'Not authenticated');
                    }
                }
            }
        } catch (error) {
            console.error('Refresh failed:', error);
            this.updateHomeStatusCard('error', 'Status check failed');
            
            if (this.footerStatus) {
                this.footerStatus.show('error', 'Status check failed');
            } else if (window.footerStatus) {
                window.footerStatus.show('error', 'Status check failed');
            }
        }
    }

    async checkUserStatus() {
        try { 
            
            if (!this.userAPI) {
                this.updateHomeStatusCard('inactive', 'Not authenticated');
                
                if (this.footerStatus) {
                    this.footerStatus.show('inactive', '🔒 Not authenticated');
                } else if (window.footerStatus) {
                    window.footerStatus.show('inactive', '🔒 Not authenticated');
                }
                return;
            }

            const localUserResult = await this.userAPI.getLocalStoredUser(); 
            
            if (!localUserResult.success || !localUserResult.data) {
                this.updateHomeStatusCard('inactive', 'Please login to continue');
                
                if (this.footerStatus) {
                    this.footerStatus.show('inactive', '🔒 Please login to continue');
                } else if (window.footerStatus) {
                    window.footerStatus.show('inactive', '🔒 Please login to continue');
                }
                
                if (window.navbarController) {
                    window.navbarController.updateUserProfile(null);
                }
                return;
            }

            const authStatus = await this.userAPI.validateUser();
            
            if (authStatus.success && authStatus.data && authStatus.data.user) {
                this.updateHomeStatusCard('active', `Welcome ${authStatus.data.user.name}`);
                
                if (this.footerStatus) {
                    this.footerStatus.show('active', '✅ Authenticated and ready');
                } else if (window.footerStatus) {
                    window.footerStatus.show('active', '✅ Authenticated and ready');
                }
                
                if (window.navbarController) {
                    window.navbarController.updateUserProfile(authStatus.data.user);
                }
            } else {
                this.updateHomeStatusCard('inactive', 'Session expired - Please login');
                
                if (this.footerStatus) {
                    this.footerStatus.show('inactive', '🔒 Session expired - Please login');
                } else if (window.footerStatus) {
                    window.footerStatus.show('inactive', '🔒 Session expired - Please login');
                }
                
                if (window.navbarController) {
                    window.navbarController.updateUserProfile(null);
                }
            }
        } catch (error) {
            console.error('User status check failed:', error);
            this.updateHomeStatusCard('error', 'Authentication check failed');
            
            if (this.footerStatus) {
                this.footerStatus.show('error', '❌ Authentication check failed');
            } else if (window.footerStatus) {
                window.footerStatus.show('error', '❌ Authentication check failed');
            }
        }
    }

    destroy() {
        console.log('HomeController destroyed');
    }

    showHelp() {
        console.log('Help requested');
    }
}

window.HomeController = HomeController;
