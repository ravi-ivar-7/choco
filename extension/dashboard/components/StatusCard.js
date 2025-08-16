class StatusCard {
    constructor() {
        this.statusTitle = null;
        this.statusBadge = null;
        this.statusMessage = null;
        this.statusDetails = null;
        this.statusCard = null;
    }

    async init() {
        // Try to find StatusCard elements first
        this.statusTitle = document.getElementById('statusTitle');
        this.statusBadge = document.getElementById('statusBadge');
        this.statusMessage = document.getElementById('statusMessage');
        this.statusDetails = document.getElementById('statusDetails');
        this.statusCard = document.querySelector('.status-card');
        
        // If not found, use existing home page elements as fallback
        if (!this.statusBadge) {
            this.statusIndicator = document.getElementById('statusIndicator');
            this.statusText = document.getElementById('statusText');
        }
        
        return this;
    }

    updateStatus(type, message, details) {
        // Use stored fallback elements or find them dynamically
        const statusIndicator = this.statusIndicator || document.getElementById('statusIndicator');
        const statusText = this.statusText || document.getElementById('statusText');
        
        if (statusIndicator && statusText) {
            statusIndicator.className = `status-indicator status-${type}`;
            statusText.textContent = message;
            return;
        }

        // Use StatusCard elements if available
        if (this.statusBadge && this.statusMessage && this.statusDetails) {
            this.statusBadge.className = `status-badge status-${type}`;
            this.statusBadge.textContent = this.getStatusText(type);
            this.statusMessage.textContent = message;
            this.statusDetails.textContent = details;
        }
    }

    updateTitle(title) {
        if (this.statusTitle) {
            this.statusTitle.textContent = title;
        }
    }

    show() {
        if (this.statusCard) {
            this.statusCard.classList.remove('hidden');
        }
    }

    hide() {
        if (this.statusCard) {
            this.statusCard.classList.add('hidden');
        }
    }

    getStatusText(type) {
        const statusTexts = {
            'none': 'Ready',
            'checking': 'Checking',
            'success': 'Connected',
            'active': 'Active',
            'error': 'Error',
            'warning': 'Warning'
        };
        return statusTexts[type] || 'Unknown';
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.StatusCard = StatusCard;
}
