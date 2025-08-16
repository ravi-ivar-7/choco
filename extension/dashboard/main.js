document.addEventListener('DOMContentLoaded', async function() {
    
    try {
        // Check if required classes are available
        if (typeof PageLoader === 'undefined') {
            console.error('PageLoader class not found');
            document.body.innerHTML = '<div style="color: red; padding: 20px;">Error: PageLoader not loaded</div>';
            return;
        }
        if (typeof NavbarController === 'undefined') {
            console.error('NavbarController class not found');
            document.body.innerHTML = '<div style="color: red; padding: 20px;">Error: NavbarController not loaded</div>';
            return;
        }
        
        // Global variables
        let currentPage = 'home';
        let navbarController = null;
        let pageLoader = null;
        let footerStatus = null;

        // Initialize page loader first
        pageLoader = new PageLoader();
        await pageLoader.init();
        
        // Initialize navbar controller
        navbarController = new NavbarController();
        await navbarController.init();
        
        // Initialize global footer status
        if (typeof FooterStatus !== 'undefined') {
            footerStatus = new FooterStatus();
            footerStatus.init();
            window.footerStatus = footerStatus;
        }
        
        // Platform detection is now handled by NavbarController.init()
        
        // Make controllers globally available
        window.pageLoader = pageLoader;
        window.navbarController = navbarController;
        
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        document.body.innerHTML = '<div style="color: red; padding: 20px;">Critical Error: ' + error.message + '</div>';
    }
});

