class CredentialsController {
    constructor() {
        this.credentialsAPI = null;
        this.credentials = [];
    }

    async init() {
        try {
            
            // Initialize API
            if (typeof CredentialsAPI !== 'undefined' && typeof Constants !== 'undefined') {
                this.credentialsAPI = new CredentialsAPI(Constants.BACKEND_URL);
            }
            
            // Load and display credentials directly
            await this.loadAndDisplayCredentials();
            
        } catch (error) {
            console.error('CredentialsController initialization failed:', error);
        }
    }

    async loadAndDisplayCredentials() {
        try {
            if (!this.credentialsAPI) {
                this.showError('Credentials API not available');
                return;
            }

            // Get stored user token
            const userResult = await StorageUtils.get(['chocoUser']);
            if (!userResult.success || !userResult.data.chocoUser?.token) {
                this.showError('Please login first');
                return;
            }

            // Get credentials
            const result = await this.credentialsAPI.getCredentials(userResult.data.chocoUser.token);
            if (result.success) {
                this.credentials = result.data.credentials || [];
                this.displayCredentials(this.credentials);
            } else {
                this.showError('Failed to load credentials: ' + result.message);
            }
        } catch (error) {
            console.error('Failed to load credentials:', error);
            this.showError('Error loading credentials');
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
            console.error('Credentials container not found');
            return;
        }

        // Clear existing content
        container.innerHTML = '';

        // Create header
        const header = document.createElement('div');
        header.className = 'credentials-header';
        // Calculate active/expired counts based on actual expiry data
        const activeCount = credentials.filter(c => !this.isCredentialExpired(c) && c.isActive !== false).length;
        const expiredCount = credentials.length - activeCount;
        
        header.innerHTML = `
            <div class="credentials-title">
                🔐 Team Credentials (${credentials.length})
            </div>
            <div class="credentials-subtitle">
                ${credentials.length === 0 ? 
                    'No credentials found. Team members haven\'t set up any credentials yet.' :
                    `Found ${credentials.length} credential${credentials.length > 1 ? 's' : ''} from your team members. ${activeCount} active, ${expiredCount} expired.`
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
                <div class="empty-description">Your team members haven't shared any credentials yet. Once they do, you'll be able to view and apply them here.</div>
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
                <div class="credential-platform">
                    <div class="credential-icon">🔐</div>
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
        const deleteBtns = container.querySelectorAll('.delete-btn');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const credentialId = e.target.dataset.credentialId;
                this.handleDeleteCredential(credentialId, btn, container);
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
            const userResult = await StorageUtils.get(['chocoUser']);
            if (!userResult.success || !userResult.data.chocoUser?.token) {
                alert('Please login first');
                return;
            }

            // Find credential
            const credential = this.credentials.find(cred => cred.id === credentialId);
            if (!credential) {
                throw new Error('Credential not found');
            }

            // Get stored tab from selectedPlatform (like HomeController does)
            let currentTab = null;
            let tabId = null;
            
            const storedResult = await StorageUtils.get(['selectedPlatform']);
            if (storedResult.success && storedResult.data.selectedPlatform && storedResult.data.selectedPlatform.tab) {
                const storedTab = storedResult.data.selectedPlatform.tab;
                try {
                    // Verify stored tab still exists
                    const verifiedTab = await chrome.tabs.get(storedTab.id);
                    if (verifiedTab && verifiedTab.url === storedTab.url) {
                        currentTab = verifiedTab;
                        tabId = verifiedTab.id;
                    }
                } catch (tabError) {
                    console.warn('Stored tab no longer valid:', tabError.message);
                    // Tab cleanup is handled centrally by background.js tab lifecycle listeners
                }
            }
            
            // If no valid tab available, require platform selection from parent
            if (!currentTab) {
                throw new Error('No valid tab available. Please select a platform first.');
            }

            const credentialCopy = JSON.parse(JSON.stringify(credential));
            const setBrowserDataResult = await BrowserDataCollector.setBrowserData(
                currentTab.id,
                credentialCopy,
                currentTab.url
            );

            // Show notification based on the actual result
            await this.showNotification(currentTab, { setBrowserDataResult });

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
            console.error('Failed to apply credential:', error);
            
            if (typeof addToNotificationQueue === 'function') {
                addToNotificationQueue({
                    title: 'Apply Failed',
                    message: error.message || 'Failed to apply credentials',
                    type: 'error'
                });
            } else {
                alert('Failed to apply credentials: ' + error.message);
            }

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

            // Get stored user token
            const userResult = await StorageUtils.get(['chocoUser']);
            if (!userResult.success || !userResult.data.chocoUser?.token) {
                alert('Please login first');
                return;
            }

            // Delete credential
            const response = await fetch(`${Constants.BACKEND_URL}/api/credentials/cleanup?credentialId=${credentialId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${userResult.data.chocoUser.token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            if (result.success) {
                // Show success notification
                if (typeof addToNotificationQueue === 'function') {
                    addToNotificationQueue({
                        title: 'Credential Deleted',
                        message: 'Credential deleted successfully',
                        type: 'success'
                    });
                }

                // Remove from local array
                this.credentials = this.credentials.filter(cred => cred.id !== credentialId);
                
                // Re-display credentials
                this.displayCredentials(this.credentials);

            } else {
                throw new Error(result.message || 'Failed to delete credential');
            }

        } catch (error) {
            console.error('Failed to delete credential:', error);
            
            if (typeof addToNotificationQueue === 'function') {
                addToNotificationQueue({
                    title: 'Delete Failed',
                    message: error.message || 'Failed to delete credential',
                    type: 'error'
                });
            } else {
                alert('Failed to delete credential: ' + error.message);
            }

            button.disabled = false;
            button.innerHTML = 'Delete';
        }
    }

    showError(message) {
        const container = document.getElementById('credentialsContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="credentials-header">
                <div class="credentials-title">🔐 Team Credentials</div>
                <div class="credentials-subtitle">${message}</div>
            </div>
        `;
    }

    async showNotification(currentTab, options = {}) {
        // Use the general notification utility
        return await NotificationUtils.showExtensionNotification(currentTab, options);
    }

    destroy() {
    }
}

// Export for global use
window.CredentialsController = CredentialsController;
