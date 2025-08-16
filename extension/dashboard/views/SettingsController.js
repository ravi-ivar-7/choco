class SettingsController {
    constructor() {
        this.settings = {
            theme: 'dark',
            notifications: true,
            autoLogin: false,
            sessionTimeout: 30,
            twoFactor: false
        };
    }

    async init() {
        try {
            console.log('SettingsController initializing...');
            
            // Load saved settings
            await this.loadSettings();
            
            // Update UI with current settings
            this.updateSettingsDisplay();
            
            // Bind events
            this.bindEvents();
            
            console.log('SettingsController initialized successfully');
        } catch (error) {
            console.error('SettingsController initialization failed:', error);
        }
    }

    bindEvents() {
        // Save settings button
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        }

        // Reset settings button
        const resetSettingsBtn = document.getElementById('resetSettingsBtn');
        if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener('click', () => this.resetSettings());
        }

        // Theme selector
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.settings.theme = e.target.value;
                this.applyTheme(e.target.value);
            });
        }

        // Notifications toggle
        const notificationsToggle = document.getElementById('notificationsToggle');
        if (notificationsToggle) {
            notificationsToggle.addEventListener('change', (e) => {
                this.settings.notifications = e.target.checked;
            });
        }

        // Auto login toggle
        const autoLoginToggle = document.getElementById('autoLoginToggle');
        if (autoLoginToggle) {
            autoLoginToggle.addEventListener('change', (e) => {
                this.settings.autoLogin = e.target.checked;
            });
        }

        // Session timeout
        const sessionTimeout = document.getElementById('sessionTimeout');
        if (sessionTimeout) {
            sessionTimeout.addEventListener('change', (e) => {
                this.settings.sessionTimeout = parseInt(e.target.value);
            });
        }

        // Two-factor auth toggle
        const twoFactorToggle = document.getElementById('twoFactorToggle');
        if (twoFactorToggle) {
            twoFactorToggle.addEventListener('change', (e) => {
                this.settings.twoFactor = e.target.checked;
            });
        }
    }

    async loadSettings() {
        try {
            // Load settings from chrome storage
            if (typeof chrome !== 'undefined' && chrome.storage) {
                const result = await chrome.storage.local.get(['dashboardSettings']);
                if (result.dashboardSettings) {
                    this.settings = { ...this.settings, ...result.dashboardSettings };
                }
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    updateSettingsDisplay() {
        // Update theme selector
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = this.settings.theme;
        }

        // Update notifications toggle
        const notificationsToggle = document.getElementById('notificationsToggle');
        if (notificationsToggle) {
            notificationsToggle.checked = this.settings.notifications;
        }

        // Update auto login toggle
        const autoLoginToggle = document.getElementById('autoLoginToggle');
        if (autoLoginToggle) {
            autoLoginToggle.checked = this.settings.autoLogin;
        }

        // Update session timeout
        const sessionTimeout = document.getElementById('sessionTimeout');
        if (sessionTimeout) {
            sessionTimeout.value = this.settings.sessionTimeout.toString();
        }

        // Update two-factor toggle
        const twoFactorToggle = document.getElementById('twoFactorToggle');
        if (twoFactorToggle) {
            twoFactorToggle.checked = this.settings.twoFactor;
        }

        // Apply current theme
        this.applyTheme(this.settings.theme);
    }

    async saveSettings() {
        try {
            // Get current values from form
            this.getSettingsFromForm();
            
            // Save to chrome storage
            if (typeof chrome !== 'undefined' && chrome.storage) {
                await chrome.storage.local.set({ dashboardSettings: this.settings });
            }
            
            // Apply settings
            this.applySettings();
            
            // Show success message
            this.showMessage('Settings saved successfully!', 'success');
            
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showMessage('Failed to save settings', 'error');
        }
    }

    getSettingsFromForm() {
        const themeSelect = document.getElementById('themeSelect');
        const notificationsToggle = document.getElementById('notificationsToggle');
        const autoLoginToggle = document.getElementById('autoLoginToggle');
        const sessionTimeout = document.getElementById('sessionTimeout');
        const twoFactorToggle = document.getElementById('twoFactorToggle');

        if (themeSelect) this.settings.theme = themeSelect.value;
        if (notificationsToggle) this.settings.notifications = notificationsToggle.checked;
        if (autoLoginToggle) this.settings.autoLogin = autoLoginToggle.checked;
        if (sessionTimeout) this.settings.sessionTimeout = parseInt(sessionTimeout.value);
        if (twoFactorToggle) this.settings.twoFactor = twoFactorToggle.checked;
    }

    applySettings() {
        // Apply theme
        this.applyTheme(this.settings.theme);
        
        // Apply other settings as needed
        console.log('Settings applied:', this.settings);
    }

    applyTheme(theme) {
        const body = document.body;
        
        // Remove existing theme classes
        body.classList.remove('theme-dark', 'theme-light', 'theme-auto');
        
        // Add new theme class
        if (theme === 'light') {
            body.classList.add('theme-light');
        } else if (theme === 'auto') {
            body.classList.add('theme-auto');
            // Auto theme logic could be implemented here
        } else {
            body.classList.add('theme-dark'); // Default to dark
        }
    }

    async resetSettings() {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            // Reset to default values
            this.settings = {
                theme: 'dark',
                notifications: true,
                autoLogin: false,
                sessionTimeout: 30,
                twoFactor: false
            };
            
            // Update display
            this.updateSettingsDisplay();
            
            // Save reset settings
            await this.saveSettings();
            
            this.showMessage('Settings reset to default', 'success');
        }
    }

    showMessage(message, type = 'info') {
        // Create temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = `settings-message settings-message-${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        `;

        document.body.appendChild(messageEl);

        // Remove after 3 seconds
        setTimeout(() => {
            if (document.body.contains(messageEl)) {
                document.body.removeChild(messageEl);
            }
        }, 3000);
    }

    destroy() {
        console.log('SettingsController destroyed');
    }
}

// Export for global use
window.SettingsController = SettingsController;
