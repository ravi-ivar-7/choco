class CredentialsController {
    constructor() {
        this.credentialsAPI = null;
        this.credentials = [];
        this.lastSyncTime = null;
        this.autoSyncEnabled = true;
    }

    async init() {
        try {
            console.log('CredentialsController initializing...');
            
            // Initialize API
            if (typeof CredentialsAPI !== 'undefined' && typeof Constants !== 'undefined') {
                this.credentialsAPI = new CredentialsAPI(Constants.BACKEND_URL);
            }
            
            // Load credentials data
            await this.loadCredentialsData();
            
            // Bind events
            this.bindEvents();
            
            console.log('CredentialsController initialized successfully');
        } catch (error) {
            console.error('CredentialsController initialization failed:', error);
        }
    }

    bindEvents() {
        // View credentials button
        const viewCredentialsBtn = document.getElementById('viewCredentialsBtn');
        if (viewCredentialsBtn) {
            viewCredentialsBtn.addEventListener('click', () => this.showCredentialsList());
        }

        // Export credentials button
        const exportCredentialsBtn = document.getElementById('exportCredentialsBtn');
        if (exportCredentialsBtn) {
            exportCredentialsBtn.addEventListener('click', () => this.exportCredentials());
        }
    }

    async loadCredentialsData() {
        try {
            if (!this.credentialsAPI) {
                this.updateCredentialsDisplay(0, 'Never', 'Disabled');
                return;
            }

            // Get stored user token first
            const userResult = await StorageUtils.get(['chocoUser']);
            if (!userResult.success || !userResult.data.chocoUser?.token) {
                this.updateCredentialsDisplay(0, 'Not logged in', 'Disabled');
                return;
            }

            // Get credentials using existing API method
            const result = await this.credentialsAPI.getCredentials(userResult.data.chocoUser.token);
            if (result.success) {
                this.credentials = result.data.credentials || [];
                this.lastSyncTime = new Date().toISOString(); // Current time as sync time
                this.autoSyncEnabled = true;
                
                this.updateCredentialsDisplay(
                    this.credentials.length,
                    this.formatSyncTime(this.lastSyncTime),
                    this.autoSyncEnabled ? 'Enabled' : 'Disabled'
                );
            } else {
                this.updateCredentialsDisplay(0, 'Error loading', 'Unknown');
            }
        } catch (error) {
            console.error('Failed to load credentials data:', error);
            this.updateCredentialsDisplay(0, 'Error', 'Unknown');
        }
    }

    updateCredentialsDisplay(count, lastSync, autoSync) {
        const totalCredentials = document.getElementById('totalCredentials');
        const lastSyncElement = document.getElementById('lastSync');
        const autoSyncElement = document.getElementById('autoSync');

        if (totalCredentials) {
            totalCredentials.textContent = count.toString();
        }
        if (lastSyncElement) {
            lastSyncElement.textContent = lastSync;
        }
        if (autoSyncElement) {
            autoSyncElement.textContent = autoSync;
        }
    }

    formatSyncTime(timestamp) {
        if (!timestamp) return 'Never';
        
        try {
            const date = new Date(timestamp);
            return date.toLocaleString();
        } catch (error) {
            return 'Invalid date';
        }
    }

    async showCredentialsList() {
        try {
            console.log('Showing credentials list...');
            
            if (!this.credentialsAPI) {
                alert('Credentials API not available');
                return;
            }

            // Get stored user token first
            const userResult = await StorageUtils.get(['chocoUser']);
            if (!userResult.success || !userResult.data.chocoUser?.token) {
                alert('Please login first');
                return;
            }

            // Get detailed credentials
            const result = await this.credentialsAPI.getCredentials(userResult.data.chocoUser.token);
            if (result.success) {
                this.displayCredentialsModal(result.data.credentials);
            } else {
                alert('Failed to load credentials: ' + result.message);
            }
        } catch (error) {
            console.error('Failed to show credentials:', error);
            alert('Error loading credentials');
        }
    }

    displayCredentialsModal(credentials) {
        // Create modal to display credentials
        const modal = document.createElement('div');
        modal.className = 'credentials-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Stored Credentials</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${credentials.length === 0 ? 
                        '<p>No credentials found</p>' :
                        credentials.map(cred => `
                            <div class="credential-item">
                                <div class="credential-site">${cred.site || 'Unknown Site'}</div>
                                <div class="credential-username">${cred.username || 'No username'}</div>
                                <div class="credential-date">Added: ${new Date(cred.createdAt).toLocaleDateString()}</div>
                            </div>
                        `).join('')
                    }
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

        // Add close functionality
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        document.body.appendChild(modal);
    }

    async exportCredentials() {
        try {
            console.log('Exporting credentials...');
            
            if (!this.credentialsAPI) {
                alert('Credentials API not available');
                return;
            }

            // Get stored user token first
            const userResult = await StorageUtils.get(['chocoUser']);
            if (!userResult.success || !userResult.data.chocoUser?.token) {
                alert('Please login first');
                return;
            }

            // Use existing getCredentials method for export
            const result = await this.credentialsAPI.getCredentials(userResult.data.chocoUser.token);
            if (result.success) {
                // Create download link
                const blob = new Blob([JSON.stringify(result.data, null, 2)], {
                    type: 'application/json'
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `credentials-export-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                alert('Export failed: ' + result.message);
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export error: ' + error.message);
        }
    }

    destroy() {
        console.log('CredentialsController destroyed');
    }
}

// Export for global use
window.CredentialsController = CredentialsController;
