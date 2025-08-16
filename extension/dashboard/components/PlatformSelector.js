class PlatformSelector {
    constructor() {
        this.selector = null;
        this.options = null;
    }

    init() {
        this.selector = document.getElementById('platformSelector');
        this.options = document.getElementById('platformOptions');
    }

    show(supportedTabs) {
        if (!this.selector || !this.options) {
            console.error('PlatformSelector not initialized');
            return;
        }

        this.options.innerHTML = '';
        
        const instructionDiv = document.createElement('div');
        instructionDiv.className = 'platform-instruction';
        instructionDiv.innerHTML = `
            <div class="instruction-text">
                <strong>To change platform:</strong> Close this extension window and open from your desired platform tab
            </div>
        `;
        this.options.appendChild(instructionDiv);
        
        // Add platform options
        supportedTabs.forEach((platform, index) => {
            const option = this.createPlatformOption(platform, index);
            this.options.appendChild(option);
        });
        
        // Show the selector
        this.selector.classList.remove('hidden');
        
        // Hide status card until platform is selected
        document.querySelector('.status-card').classList.add('hidden');
    }

    showPlatformSelector(supportedTabs) {
        return this.show(supportedTabs);
    }

    createPlatformOption(platform, index) {
        const option = document.createElement('div');
        option.className = 'platform-option';
        option.dataset.index = index;
        
        option.innerHTML = `
            <div class="platform-info">
                <div class="platform-icon">${platform.platformIcon}</div>
                <div class="platform-details">
                    <div class="platform-name">${platform.platformName}</div>
                    <div class="platform-url">${platform.tab.url}</div>
                </div>
            </div>
            <div class="platform-status">Available</div>
        `;
        
        // Make option non-clickable by adding disabled class
        option.classList.add('disabled');
        
        return option;
    }

    selectOption(option, platform) { 
        this.options.querySelectorAll('.platform-option').forEach(opt => 
            opt.classList.remove('selected'));
        
        option.classList.add('selected'); 
        setTimeout(() => { 
            this.hide();
        }, 300);
    }

    hide() {
        if (this.selector) {
            this.selector.classList.add('hidden');
        }
    }

    hidePlatformSelector() {
        return this.hide();
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.PlatformSelector = PlatformSelector;
}
