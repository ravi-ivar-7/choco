class CredentialsController {
    constructor() {
        this.credentialsAPI = null;
        this.credentials = [];
        this.selectedCredentials = [];
        this.selectedTeam = null;
        this.teamConfig = null;
        this.targetTab = null;
        this.token = null;
    }

    async init() {
        try {
            // Initialize API first
            if (typeof CredentialsAPI !== 'undefined' && typeof Constants !== 'undefined') {
                this.credentialsAPI = new CredentialsAPI(Constants.BACKEND_URL);
            }

            // Check authentication first
            const isAuthenticated = await this.checkUserAuthentication();
            
            if (isAuthenticated) {
                // Only initialize storage data if user is authenticated
                const storageInitialized = await this.initializeFromStorage();
                if (storageInitialized) {
                    // Load and display credentials only if storage initialization succeeded
                    await this.loadAndDisplayCredentials();
                }
            } else {
                this.updateCredentialsStatusCard('error', 'Please login first from the profile page');
            }
        } catch (error) {
            console.error('CredentialsController initialization failed:', error);
            this.updateCredentialsStatusCard('error', 'Failed to initialize credentials page');
        }
    }

    async initializeFromStorage() {
        try {
            const storageResult = await StorageUtils.get(['choco_selected_team', 'choco_team_config', 'choco_target_tab', 'choco_token']);
            
            if (!storageResult.success) {
                this.updateCredentialsStatusCard('error', 'Storage Access Failed', 'Unable to retrieve configuration data');
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
                this.updateCredentialsStatusCard('info', 'Setup Required', `Missing: ${missingText}. Please visit the Profile page to complete setup.`);
                return false;
            }

            return true;

        } catch (error) {
            console.error('CredentialsController: Error initializing from storage:', error);
            this.updateCredentialsStatusCard('error', 'Storage Error', 'Failed to load configuration data');
            return false;
        }
    }

    async checkUserAuthentication() {
        try {
            const userAPI = new UserAPI(Constants.BACKEND_URL);
            const storedUser = await userAPI.getLocalStoredUser();
            return storedUser.success;
        } catch (error) {
            console.error('Error checking user authentication:', error);
            return false;
        }
    }

    async loadAndDisplayCredentials() {
        try {
            if (!this.credentialsAPI) {
                this.updateCredentialsStatusCard('error', 'Credentials API not available');
                return;
            }

            // Check if we have required data from storage
            if (!this.token) {
                this.updateCredentialsStatusCard('error', 'Please login first');
                return;
            }

            if (!this.selectedTeam) {
                this.updateCredentialsStatusCard('error', 'No account selected');
                return;
            }
            
            this.updateCredentialsStatusCard('loading', 'Loading Credentials', 'Fetching your account credentials...');
            
            const result = await this.credentialsAPI.getCredentials(this.token, this.selectedTeam.id);
            if (result.success) {
                this.credentials = result.data.credentials || [];
                if (this.credentials.length === 0) {
                    this.updateCredentialsStatusCard('info', 'No Credentials Found', 'No credentials available for this team yet.');
                } else {
                    this.hideCredentialsStatusCard();
                    this.displayCredentials(this.credentials);
                }
            } else {
                this.updateCredentialsStatusCard('error', 'Failed to load credentials: ' + result.message);
            }
        } catch (error) {
            console.error('Failed to load credentials:', error);
            this.updateCredentialsStatusCard('error', 'Error loading credentials');
        }
    }

    // Helper function to check if credential is expired based on all available expiry data
    isCredentialExpired(credential) {
        const now = Date.now() / 1000; // Current time in seconds

        // Check cookies for expiry
        if (credential.cookies) {
            for (const [name, cookieData] of Object.entries(credential.cookies)) {
                if (cookieData && typeof cookieData === 'object') {
                    // Check if cookie has expirationDate (Chrome cookie format)
                    if (cookieData.expirationDate && cookieData.expirationDate < now) {
                        return true;
                    }
                    // Check if cookie has expires field (standard cookie format)
                    if (cookieData.expires) {
                        const expiryTime = new Date(cookieData.expires).getTime() / 1000;
                        if (expiryTime < now) {
                            return true;
                        }
                    }
                }
            }
        }

        // Check localStorage for JWT tokens or expiry data
        if (credential.localStorage) {
            for (const [key, value] of Object.entries(credential.localStorage)) {
                if (this.isTokenExpired(value, now)) {
                    return true;
                }
            }
        }

        // Check sessionStorage for JWT tokens or expiry data
        if (credential.sessionStorage) {
            for (const [key, value] of Object.entries(credential.sessionStorage)) {
                if (this.isTokenExpired(value, now)) {
                    return true;
                }
            }
        }

        // If no expiry data found or nothing is expired, consider it active
        return false;
    }

    // Helper function to check if a token (JWT or other) is expired
    isTokenExpired(tokenValue, currentTime) {
        if (!tokenValue || typeof tokenValue !== 'string') {
            return false;
        }

        // Try to parse as JWT token
        try {
            const parts = tokenValue.split('.');
            if (parts.length === 3) {
                // Looks like a JWT token
                const payload = JSON.parse(atob(parts[1]));
                if (payload.exp && payload.exp < currentTime) {
                    return true;
                }
            }
        } catch (e) {
            // Not a valid JWT, ignore
        }

        // Check if the value itself contains expiry information
        try {
            const parsed = JSON.parse(tokenValue);
            if (parsed.exp && parsed.exp < currentTime) {
                return true;
            }
            if (parsed.expires_at && parsed.expires_at < currentTime) {
                return true;
            }
            if (parsed.expiry && new Date(parsed.expiry).getTime() / 1000 < currentTime) {
                return true;
            }
        } catch (e) {
            // Not JSON, ignore
        }

        return false;
    }

    displayCredentials(credentials) {
        const container = document.getElementById('credentialsContainer');
        if (!container) {
            return;
        }

        // Clear existing content
        container.innerHTML = '';

        // Create header with bulk actions
        const header = document.createElement('div');
        header.className = 'credentials-header';
        // Calculate active/expired counts based on actual expiry data
        const activeCount = credentials.filter(c => !this.isCredentialExpired(c) && c.isActive !== false).length;
        const expiredCount = credentials.length - activeCount;
        
        header.innerHTML = `
            <div class="credentials-title-row">
                <div class="credentials-title">
                     🔐 Account Credentials (${credentials.length})
                </div>
                <div class="bulk-actions">
                    <button id="selectAllBtn" class="bulk-btn select-all-btn">Select All</button>
                    <button id="bulkDeleteBtn" class="bulk-btn delete-btn" disabled style="display: none;">Delete Selected (0)</button>
                </div>
            </div>
            <div class="credentials-subtitle">
                ${credentials.length === 0 ? 
                    'No credentials found. No devices have set up credentials yet.' :
                    `Found ${credentials.length} credential${credentials.length > 1 ? 's' : ''} from your all connected devices. ${activeCount} active, ${expiredCount} expired.`
                }
            </div>
        `;
        container.appendChild(header);

        if (credentials.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <div class="empty-icon">🔐</div>
                <div class="empty-title">No Credentials Available</div>
                <div class="empty-description">Your other devices haven't shared any credentials yet. Once they do, you'll be able to view and apply them here.</div>
            `;
            container.appendChild(emptyState);
            return;
        }

        // Create credentials list
        const credentialsList = document.createElement('div');
        credentialsList.className = 'credentials-list';
        
        // Check if there are any active credentials
        const hasActiveCredentials = credentials.some(c => !this.isCredentialExpired(c) && c.isActive !== false);
        
        credentials.forEach((cred, index) => {
            const credentialCard = this.createCredentialCard(cred, hasActiveCredentials, index);
            credentialsList.appendChild(credentialCard);
        });

        container.appendChild(credentialsList);
        
        // Bind events
        this.bindCredentialsEvents(container);
        this.bindBulkActionEvents(container);
    }

    createCredentialCard(cred, hasActiveCredentials = true, index = 0) {
        const card = document.createElement('div');
        card.className = 'credential-item';
        card.dataset.credentialId = cred.id;
        
        // Determine actual status based on expiry data, fallback to database status
        const isExpired = this.isCredentialExpired(cred);
        const isActive = isExpired ? false : (cred.isActive !== false); // Default to active if no clear inactive status
        
        // Show notice only for first 2 expired credentials when no active credentials exist
        const showNotice = !hasActiveCredentials && !isActive && index < 2;
        
        card.innerHTML = `
            ${showNotice ? '<div class="credential-notice" style="background: #fef3c7; border: 1px solid #f59e0b; color: #92400e; padding: 8px 12px; margin-bottom: 8px; border-radius: 6px; font-size: 13px; font-weight: 500;">⚠️ This token may still work even if expired - worth trying!</div>' : ''}
            <div class="credential-header">
                <div class="credential-select">
                    <input type="checkbox" class="credential-checkbox" data-credential-id="${cred.id}">
                </div>
                <div class="credential-platform"> 
                    <div class="credential-name">${cred.id.substring(0, 8)}... (${cred.credentialSource || 'Unknown'})</div>
                </div>
                <div class="credential-status ${isActive ? 'status-active' : 'status-expired'}">
                    ${isActive ? 'Active' : 'Expired'}
                </div>
            </div>
            <div class="credential-details">
                <div class="detail-item">
                    <div class="detail-label">Created</div>
                    <div class="detail-value">${new Date(cred.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Data Count</div>
                    <div class="detail-value">
                        🍪${Object.keys(cred.cookies || {}).length} 💾${Object.keys(cred.localStorage || {}).length} 📱${Object.keys(cred.sessionStorage || {}).length}
                    </div>
                </div>
            </div>
            <div class="credential-actions">
                <button class="action-btn edit-btn" data-credential-id="${cred.id}">
                    View
                </button>
                <button class="action-btn sync-btn" data-credential-id="${cred.id}">
                    Apply
                </button>
                <button class="action-btn delete-btn" data-credential-id="${cred.id}">
                    Delete
                </button>
            </div>
        `;
        
        return card;
    }

    bindCredentialsEvents(container) {
        // View buttons
        const viewBtns = container.querySelectorAll('.edit-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const credentialId = e.target.dataset.credentialId;
                this.handleViewCredential(credentialId);
            });
        });

        // Apply buttons
        const applyBtns = container.querySelectorAll('.sync-btn');
        applyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const credentialId = e.target.dataset.credentialId;
                this.handleApplyCredential(credentialId, btn);
            });
        });

        // Delete buttons
        const deleteBtns = container.querySelectorAll('.credential-actions .delete-btn');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const credentialId = e.target.dataset.credentialId;
                this.handleDeleteCredential(credentialId, btn, container);
            });
        });

        // Checkbox selection
        const checkboxes = container.querySelectorAll('.credential-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleCredentialSelection(e.target.dataset.credentialId, e.target.checked);
            });
        });
    }

    handleViewCredential(credentialId) {
        const credential = this.credentials.find(cred => cred.id === credentialId);
        if (!credential) {
            console.error('Credential not found:', credentialId);
            return;
        }

        this.showCredentialModal(credential);
    }

    showCredentialModal(credential) {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'credential-modal-overlay';
        modal.innerHTML = `
            <div class="credential-modal">
                <div class="credential-modal-header">
                    <h3>🔐 Credential Details</h3>
                    <button class="credential-modal-close">&times;</button>
                </div>
                <div class="credential-modal-body">
                    <div class="credential-info-section">
                        <h4>Basic Information</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">ID:</span>
                                <span class="info-value">${credential.id}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Source:</span>
                                <span class="info-value">${credential.credentialSource || 'Unknown'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Status:</span>
                                <span class="info-value ${!this.isCredentialExpired(credential) && credential.isActive !== false ? 'status-active' : 'status-expired'}">${!this.isCredentialExpired(credential) && credential.isActive !== false ? 'Active' : 'Expired'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Browser:</span>
                                <span class="info-value">${credential.browser || 'Unknown'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Platform:</span>
                                <span class="info-value">${credential.platform || 'Unknown'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">IP Address:</span>
                                <span class="info-value">${credential.ipAddress || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Created:</span>
                                <span class="info-value">${new Date(credential.createdAt).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="credential-data-section">
                        <h4>Data Details</h4>
                        <div class="data-tabs">
                            <button class="data-tab active" data-tab="cookies">Cookies (${Object.keys(credential.cookies || {}).length})</button>
                            <button class="data-tab" data-tab="localStorage">LocalStorage (${Object.keys(credential.localStorage || {}).length})</button>
                            <button class="data-tab" data-tab="sessionStorage">SessionStorage (${Object.keys(credential.sessionStorage || {}).length})</button>
                            <button class="data-tab" data-tab="full">Full Object</button>
                        </div>
                        <div class="data-content">
                            <div id="cookies-content" class="tab-content active">
                                <pre class="json-display">${JSON.stringify(credential.cookies || {}, null, 2)}</pre>
                            </div>
                            <div id="localStorage-content" class="tab-content">
                                <pre class="json-display">${JSON.stringify(credential.localStorage || {}, null, 2)}</pre>
                            </div>
                            <div id="sessionStorage-content" class="tab-content">
                                <pre class="json-display">${JSON.stringify(credential.sessionStorage || {}, null, 2)}</pre>
                            </div>
                            <div id="full-content" class="tab-content">
                                <pre class="json-display">${JSON.stringify(credential, null, 2)}</pre>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="credential-modal-footer">
                    <button class="action-btn sync-btn" data-credential-id="${credential.id}">Apply Credential</button>
                    <button class="action-btn delete-btn" data-credential-id="${credential.id}">Delete Credential</button>
                </div>
            </div>
        `;

        // Add modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        // Bind modal events
        this.bindModalEvents(modal);

        document.body.appendChild(modal);
    }

    bindModalEvents(modal) {
        // Close modal
        const closeBtn = modal.querySelector('.credential-modal-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        // Tab switching
        const tabs = modal.querySelectorAll('.data-tab');
        const contents = modal.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active from all tabs and contents
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                
                // Add active to clicked tab
                tab.classList.add('active');
                
                // Show corresponding content
                const tabName = tab.dataset.tab;
                const content = modal.querySelector(`#${tabName}-content`);
                if (content) {
                    content.classList.add('active');
                }
            });
        });

        // Apply button in modal
        const applyBtn = modal.querySelector('.sync-btn');
        if (applyBtn) {
            applyBtn.addEventListener('click', (e) => {
                const credentialId = e.target.dataset.credentialId;
                this.handleApplyCredential(credentialId, applyBtn);
                document.body.removeChild(modal);
            });
        }

        // Delete button in modal
        const deleteBtn = modal.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                const credentialId = e.target.dataset.credentialId;
                this.handleDeleteCredential(credentialId, deleteBtn, document.getElementById('credentialsContainer'));
                document.body.removeChild(modal);
            });
        }
    }

    async handleApplyCredential(credentialId, button) {
        try {
            button.disabled = true;
            button.innerHTML = '⏳ Applying...';

            // Get stored user token
            const tokenResult = await StorageUtils.get(['choco_token']);
            if (!tokenResult.success || !tokenResult.data.choco_token) {
                alert('Please login first');
                return;
            }

            // Find credential
            const credential = this.credentials.find(cred => cred.id === credentialId);
            if (!credential) {
                throw new Error('Credential not found');
            }

            // Get stored tab from chrome.storage.local like HomeController
            const tabResult = await StorageUtils.get(['choco_target_tab']);
            if (!tabResult.success || !tabResult.data.choco_target_tab) {
                throw new Error('No target tab found. Please select a platform first.');
            }
            
            const storedTab = tabResult.data.choco_target_tab;
            let currentTab = null;
            
            try {
                // Verify stored tab still exists
                const verifiedTab = await chrome.tabs.get(storedTab.id);
                if (verifiedTab && verifiedTab.url === storedTab.url) {
                    currentTab = verifiedTab;
                }
            } catch (tabError) {
                // Tab cleanup is handled centrally by background.js tab lifecycle listeners
            }
            
            // If no valid tab available, require platform selection from parent
            if (!currentTab) {
                throw new Error('Target tab is no longer valid. Please select a platform again.');
            }

            // Validate credential before applying (like HomeController)
            const validation = await CredentialValidator.validateCredentials(credential, 'match_config');
            
            if (!validation.success) {
                throw new Error('Credential validation failed: ' + validation.message);
            }

            // Create a copy to prevent mutation of original credential object
            const credentialCopy = JSON.parse(JSON.stringify(credential));
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
                                        if (currentTab?.id) {
                                            chrome.tabs.reload(currentTab.id);
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
                        <div>Try refreshing to test login.</div>
                    `;
                    
                    NotificationDialog.show(
                        'Credentials Partially Applied',
                        detailedMessage,
                        {
                            type: 'warning',
                            buttons: [
                                {
                                    text: 'Refresh Page',
                                    onClick: () => {
                                        if (currentTab?.id) {
                                            chrome.tabs.reload(currentTab.id);
                                        }
                                    },
                                    primary: true
                                },
                                { text: 'Later', primary: false }
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
                            { text: 'OK', primary: true }
                        ]
                    }
                );
            }

            if (setBrowserDataResult.success) {
                button.innerHTML = '✅ Applied!';
                setTimeout(() => {
                    button.disabled = false;
                    button.innerHTML = 'Apply';
                }, 2000);
            } else {
                throw new Error(setBrowserDataResult.message || 'Failed to apply credentials');
            }

        } catch (error) {
            NotificationDialog.show(
                'Apply Failed',
                error.message || 'Failed to apply credentials',
                {
                    type: 'error',
                    buttons: [{ text: 'OK', primary: true }]
                }
            );

            button.disabled = false;
            button.innerHTML = 'Apply';
        }
    }

    async handleDeleteCredential(credentialId, button, container) {
        try {
            if (!confirm('Are you sure you want to delete this credential?')) {
                return;
            }

            button.disabled = true;
            button.innerHTML = '⏳ Deleting...';

            // Check if we have required data from storage
            if (!this.token) {
                alert('Please login first');
                return;
            }

            if (!this.selectedTeam) {
                alert('No account selected');
                return;
            }

            // Delete credential using new API format
            const response = await fetch(`${Constants.BACKEND_URL}/api/credentials/cleanup?teamId=${this.selectedTeam.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ credentialIds: [credentialId] })
            });

            const result = await response.json();
            if (result.success) {
                // Show success notification
                NotificationToast.show('Credential deleted successfully', {
                    type: 'success',
                    duration: 3000
                });

                // Remove from local array and selected credentials
                this.credentials = this.credentials.filter(cred => cred.id !== credentialId);
                this.selectedCredentials = this.selectedCredentials.filter(id => id !== credentialId);
                
                // Re-display credentials
                this.displayCredentials(this.credentials);

            } else {
                throw new Error(result.message || 'Failed to delete credential');
            }

        } catch (error) {
            NotificationToast.show(error.message || 'Failed to delete credential', {
                type: 'error',
                duration: 5000
            });

            button.disabled = false;
            button.innerHTML = 'Delete';
        }
    }

    updateCredentialsStatusCard(type, message, details = '') {
        const statusText = document.getElementById('credentialsStatusText');
        const statusDetails = document.getElementById('credentialsStatusDetails');
        
        if (!statusText) {
            console.error('Credentials status card elements not found');
            return;
        }

        statusText.textContent = message;
        statusText.className = `status-text status-${type}`;

        if (details && statusDetails) {
            statusDetails.textContent = details;
            statusDetails.style.display = 'block';
        } else if (statusDetails) {
            statusDetails.style.display = 'none';
        }
        
        // Show status card and hide credentials container when showing status
        const statusCard = document.querySelector('.status-card');
        const container = document.getElementById('credentialsContainer');
        
        if (statusCard) {
            statusCard.style.display = 'block';
        }
        
        if (container) {
            container.style.display = 'none';
        }
    }

    hideCredentialsStatusCard() {
        const statusCard = document.querySelector('.status-card');
        const container = document.getElementById('credentialsContainer');
        
        if (statusCard) {
            statusCard.style.display = 'none';
        }
        
        if (container) {
            container.style.display = 'block';
        }
    }


    async showNotification(message, options = {}) {
        if (options.type === 'dialog') {
            return NotificationDialog.show(options.title || 'Notification', message, {
                type: options.notificationType || 'info',
                buttons: options.buttons || [{ text: 'OK', primary: true }]
            });
        } else {
            return NotificationToast.show(message, {
                type: options.notificationType || 'info',
                duration: options.duration || 3000
            });
        }
    }

    bindBulkActionEvents(container) {
        const selectAllBtn = container.querySelector('#selectAllBtn');
        const bulkDeleteBtn = container.querySelector('#bulkDeleteBtn');

        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                this.handleSelectAll();
            });
        }

        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', () => {
                this.handleBulkDelete();
            });
        }
    }

    handleCredentialSelection(credentialId, isSelected) {
        if (isSelected) {
            if (!this.selectedCredentials.includes(credentialId)) {
                this.selectedCredentials.push(credentialId);
            }
        } else {
            this.selectedCredentials = this.selectedCredentials.filter(id => id !== credentialId);
        }
        this.updateBulkActionButtons();
    }

    handleSelectAll() {
        const checkboxes = document.querySelectorAll('.credential-checkbox');
        const selectAllBtn = document.querySelector('#selectAllBtn');
        
        if (this.selectedCredentials.length === this.credentials.length) {
            // Deselect all
            this.selectedCredentials = [];
            checkboxes.forEach(cb => cb.checked = false);
            selectAllBtn.textContent = 'Select All';
        } else {
            // Select all
            this.selectedCredentials = this.credentials.map(c => c.id);
            checkboxes.forEach(cb => cb.checked = true);
            selectAllBtn.textContent = 'Deselect All';
        }
        this.updateBulkActionButtons();
    }

    updateBulkActionButtons() {
        const bulkDeleteBtn = document.querySelector('#bulkDeleteBtn');
        const selectAllBtn = document.querySelector('#selectAllBtn');

        if (bulkDeleteBtn) {
            if (this.selectedCredentials.length > 0) {
                bulkDeleteBtn.style.display = 'inline-block';
                bulkDeleteBtn.disabled = false;
                bulkDeleteBtn.textContent = `Delete Selected (${this.selectedCredentials.length})`;
            } else {
                bulkDeleteBtn.style.display = 'none';
                bulkDeleteBtn.disabled = true;
            }
        }

        if (selectAllBtn) {
            selectAllBtn.textContent = this.selectedCredentials.length === this.credentials.length ? 'Deselect All' : 'Select All';
        }
    }

    async handleBulkDelete() {
        if (this.selectedCredentials.length === 0) return;

        if (!confirm(`Are you sure you want to delete ${this.selectedCredentials.length} credential(s)?`)) {
            return;
        }

        const bulkDeleteBtn = document.querySelector('#bulkDeleteBtn');
        try {
            bulkDeleteBtn.disabled = true;
            bulkDeleteBtn.textContent = '⏳ Deleting...';

            if (!this.token || !this.selectedTeam) {
                throw new Error('Authentication or account selection required');
            }

            // Delete credentials using bulk API
            const response = await fetch(`${Constants.BACKEND_URL}/api/credentials/cleanup?teamId=${this.selectedTeam.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ credentialIds: this.selectedCredentials })
            });

            const result = await response.json();
            if (result.success) {
                // Show success notification
                NotificationToast.show(`Successfully deleted ${this.selectedCredentials.length} credential(s)`, {
                    type: 'success',
                    duration: 3000
                });

                // Remove deleted credentials from local array
                this.credentials = this.credentials.filter(cred => !this.selectedCredentials.includes(cred.id));
                this.selectedCredentials = [];
                
                // Re-display credentials
                this.displayCredentials(this.credentials);

            } else {
                throw new Error(result.message || 'Failed to delete credentials');
            }

        } catch (error) {
            NotificationToast.show(error.message || 'Failed to delete credentials', {
                type: 'error',
                duration: 5000
            });

            bulkDeleteBtn.disabled = false;
            bulkDeleteBtn.textContent = `Delete Selected (${this.selectedCredentials.length})`;
        }
    }

    destroy() {
        this.selectedCredentials = [];
    }
}

// Export for global use
window.CredentialsController = CredentialsController;
