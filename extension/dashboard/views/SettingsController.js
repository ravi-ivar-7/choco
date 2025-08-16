class SettingsController {
    constructor() {
        // No settings needed for coming soon page
    }

    async init() {
        try {
        } catch (error) {
            console.error('SettingsController initialization failed:', error);
        }
    }

    bindEvents() {
        // No events to bind for coming soon page
    }

    destroy() {
    }
}

// Export for global use
window.SettingsController = SettingsController;
