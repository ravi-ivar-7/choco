class PageLoader {
    constructor() {
        this.currentPage = 'home';
        this.pageContainer = null;
        this.navTabs = null;
    }

    async init() {
        this.pageContainer = document.getElementById('pageContainer');
        this.navTabs = document.querySelectorAll('.nav-tab');
        
        // Bind navigation events
        this.bindNavigationEvents();
        
        // Load initial page (home)
        await this.loadPage('home');
    }

    bindNavigationEvents() {
        this.navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = tab.id;
                const pageName = tabId.replace('Tab', ''); // homeTab -> home
                this.switchToPage(pageName);
            });
        });
    }

    async switchToPage(pageName) {
        if (this.currentPage === pageName) return;

        // Update active tab
        this.updateActiveTab(pageName);
        
        // Load page content
        await this.loadPage(pageName);
        
        this.currentPage = pageName;
    }

    updateActiveTab(pageName) {
        // Remove active class from all tabs
        this.navTabs.forEach(tab => tab.classList.remove('active'));
        
        // Add active class to selected tab
        const activeTab = document.getElementById(`${pageName}Tab`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }

    async loadPage(pageName) {
        try {
            const response = await fetch(`pages/${pageName}.html`);
            if (!response.ok) {
                throw new Error(`Failed to load ${pageName} page`);
            }
            
            const html = await response.text();
            this.pageContainer.innerHTML = html;
            
            // Initialize page-specific functionality
            await this.initializePage(pageName);
            
        } catch (error) {
            console.error(`Error loading page ${pageName}:`, error);
            this.pageContainer.innerHTML = `
                <div class="error-message">
                    <h3>Error Loading Page</h3>
                    <p>Failed to load ${pageName} page. Please try again.</p>
                </div>
            `;
        }
    }

    async initializePage(pageName) {
        // Destroy previous page controller if exists
        if (this.currentPageController && this.currentPageController.destroy) {
            this.currentPageController.destroy();
        }

        switch (pageName) {
            case 'home':
                await this.initializeHomePage();
                break;
            case 'profile':
                await this.initializeProfilePage();
                break;
            case 'credentials':
                await this.initializeCredentialsPage();
                break;
            case 'settings':
                await this.initializeSettingsPage();
                break;
        }
        
        // Store current controller reference for navbar communication
        this.currentController = this.currentPageController;
    }

    async initializeHomePage() {
        if (typeof HomeController !== 'undefined') {
            this.currentPageController = new HomeController();
            await this.currentPageController.init();
        }
    }

    async initializeProfilePage() {
        if (typeof ProfileController !== 'undefined') {
            this.currentPageController = new ProfileController();
            await this.currentPageController.init();
        }
    }

    async initializeCredentialsPage() {
        if (typeof CredentialsController !== 'undefined') {
            this.currentPageController = new CredentialsController();
            await this.currentPageController.init();
        }
    }

    async initializeSettingsPage() {
        if (typeof SettingsController !== 'undefined') {
            this.currentPageController = new SettingsController();
            await this.currentPageController.init();
        }
    }
}

// Export for use in main.js
window.PageLoader = PageLoader;
