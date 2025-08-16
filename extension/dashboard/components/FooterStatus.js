class FooterStatus {
    constructor() {
        this.footerElement = null;
        this.statusIcon = null;
        this.statusMessage = null;
        this.statusDetails = null;
        this.isVisible = false;
    }

    init() {
        this.footerElement = document.getElementById('footerStatus');
        this.statusIcon = document.getElementById('footerStatusIcon');
        this.statusMessage = document.getElementById('footerStatusMessage');
        this.statusDetails = document.getElementById('footerStatusDetails');
        this.closeButton = document.getElementById('footerStatusClose');
        
        if (!this.footerElement) {
            console.error('FooterStatus: footer element not found');
            return false;
        }
        
        // Add close button event listener
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.hide());
        }
        
        return true;
    }

    show(type, message, details = '') {
        if (!this.init()) return;
        
        // Update icon based on type
        const icons = {
            'success': '✅',
            'active': '🟢',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️',
            'loading': '⏳'
        };
        
        // Update content
        if (this.statusIcon) {
            this.statusIcon.textContent = icons[type] || 'ℹ️';
        }
        
        if (this.statusMessage) {
            this.statusMessage.textContent = message;
        }
        
        if (this.statusDetails && details) {
            this.statusDetails.textContent = details;
            this.statusDetails.style.display = 'inline';
        } else if (this.statusDetails) {
            this.statusDetails.style.display = 'none';
        }
        
        // Keep consistent styling, only show footer
        this.footerElement.className = 'footer-status';
        this.footerElement.style.display = 'flex';
        this.isVisible = true;
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => this.hide(), 3000);
        }
    }

    hide() {
        if (this.footerElement) {
            this.footerElement.style.display = 'none';
            this.isVisible = false;
        }
    }

    update(type, message, details = '') {
        this.show(type, message, details);
    }

    // Convenience methods
    showSuccess(message, details = '') {
        this.show('success', message, details);
    }

    showError(message, details = '') {
        this.show('error', message, details);
    }

    showWarning(message, details = '') {
        this.show('warning', message, details);
    }

    showInfo(message, details = '') {
        this.show('info', message, details);
    }

    showLoading(message, details = '') {
        this.show('loading', message, details);
    }

    showActive(message, details = '') {
        this.show('active', message, details);
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.FooterStatus = FooterStatus;
}
