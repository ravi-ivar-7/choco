class NavbarController {
    constructor() {
        this.platformDropdownBtn = null;
        this.platformDropdownMenu = null;
        this.selectedPlatformIcon = null;
        this.selectedPlatformName = null;
        this.userName = null;
        this.navTabs = null;
        this.currentTab = 'home';
        this.isDropdownOpen = false;
        this.availablePlatforms = [];
    }

    async init() {
        console.log('NavbarController: Initializing...');
        
        // Initialize DOM elements
        this.platformDropdownBtn = document.getElementById('platformDropdownBtn');
        this.platformDropdownMenu = document.getElementById('platformDropdownMenu');
        this.selectedPlatformIcon = document.getElementById('selectedPlatformIcon');
        this.selectedPlatformName = document.getElementById('selectedPlatformName');
        this.userName = document.getElementById('userName');
        this.navTabs = document.querySelectorAll('.nav-tab');

        if (!this.platformDropdownBtn || !this.platformDropdownMenu) {
            console.error('Platform dropdown elements not found!');
            return;
        }

        // Bind events
        this.bindEvents();
        this.bindUserProfileEvents();

        // Load stored user
        await this.loadStoredUser();
        
        // Initialize platform detection (this will auto-select platforms)
        await this.initializePlatformDetection();
        
        console.log('NavbarController: Initialized');
    }

    bindEvents() {
        // Platform dropdown events
        this.platformDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            if (this.isDropdownOpen) {
                this.closeDropdown();
            }
        });

        // Navigation tab events
        this.navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.stopPropagation();
                this.switchTab(tab.id.replace('Tab', ''));
            });
        });
    }

    // Platform dropdown methods
    populatePlatformDropdown(platforms) {
        console.log('Populating dropdown with platforms:', platforms);
        this.availablePlatforms = platforms;
        
        if (!this.platformDropdownMenu) {
            console.error('Platform dropdown menu element not found!');
            return;
        }
        
        this.platformDropdownMenu.innerHTML = '';

        if (platforms.length === 0) {
            console.log('No platforms to populate');
            this.platformDropdownBtn.disabled = true;
            return;
        }

        // Add instruction message first
        const instructionDiv = document.createElement('div');
        instructionDiv.className = 'platform-instruction';
        instructionDiv.innerHTML = `
            <div class="instruction-text">
                <strong>To change platform:</strong> Close this extension window and open from your desired platform tab
            </div>
        `;
        this.platformDropdownMenu.appendChild(instructionDiv);
        
        platforms.forEach((platform, index) => {
            console.log(`Adding platform ${index + 1}:`, platform.platformName);
            const option = document.createElement('div');
            option.className = 'dropdown-item disabled';
            option.innerHTML = `
                <span class="platform-icon">${platform.platformIcon}</span>
                <span>${platform.platformName}</span>
                <span class="platform-status">Available</span>
            `;
            // platforms are display-only
            this.platformDropdownMenu.appendChild(option);
        });

        // Enable dropdown if platforms available
        this.platformDropdownBtn.disabled = false;
        console.log(`Dropdown populated with ${platforms.length} platforms`);
    } 

    updateSelectedPlatform(platform) {
        if (platform) {
            this.selectedPlatformIcon.textContent = platform.platformIcon;
            this.selectedPlatformName.textContent = platform.platformName;
            this.platformDropdownBtn.disabled = false;
        } else {
            this.selectedPlatformIcon.textContent = '🖥️';
            this.selectedPlatformName.textContent = 'Select Platform';
            this.platformDropdownBtn.disabled = true;
        }
    }

    toggleDropdown() {
        if (this.isDropdownOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        this.platformDropdownMenu.classList.remove('hidden');
        this.platformDropdownBtn.classList.add('open');
        this.isDropdownOpen = true;
    }

    closeDropdown() {
        this.platformDropdownMenu.classList.add('hidden');
        this.platformDropdownBtn.classList.remove('open');
        this.isDropdownOpen = false;
    }

    // User profile methods
    updateUserProfile(user) {
        if (user && user.name) {
            this.userName.textContent = user.name;
            this.userName.classList.remove('not-logged-in');
            this.userName.classList.add('logged-in');
        } else {
            this.userName.textContent = 'Login';
            this.userName.classList.remove('logged-in');
            this.userName.classList.add('not-logged-in');
        }
    }

    bindUserProfileEvents() {
        console.log('Binding user profile events...');
        
        const userProfile = document.querySelector('.user-profile');
        console.log('User profile element:', userProfile);
        
        if (userProfile) {
            // Remove any existing listeners by cloning the element
            const newUserProfile = userProfile.cloneNode(true);
            userProfile.parentNode.replaceChild(newUserProfile, userProfile);
            
            // Add new event listener
            newUserProfile.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Click event triggered on user profile');
                this.handleUserProfileClick();
            });
            console.log('Fresh event listener added to user profile section');
            
            // Update references after DOM replacement
            this.userName = document.getElementById('userName');
        } else {
            console.error('User profile element not found for event binding!');
        }
    }

    handleUserProfileClick() {
        console.log('User profile clicked');
        console.log('User name classes:', this.userName.classList);
        console.log('PageLoader available:', !!window.pageLoader);
        
        if (this.userName.classList.contains('not-logged-in')) {
            console.log('User not logged in, switching to profile page for login');
            // Switch to profile page which will show login
            if (window.pageLoader) {
                window.pageLoader.switchToPage('profile');
            }
        } else {
            console.log('User logged in, switching to profile page');
            // Switch to profile page
            if (window.pageLoader) {
                window.pageLoader.switchToPage('profile');
            }
        }
    }

    showUserMenu() {
        // Create or show user dropdown menu
        let userMenu = document.getElementById('userDropdownMenu');
        if (!userMenu) {
            userMenu = document.createElement('div');
            userMenu.id = 'userDropdownMenu';
            userMenu.className = 'user-dropdown-menu hidden';
            userMenu.innerHTML = `
                <div class="user-menu-option" id="logoutOption">
                    <span>🚪</span>
                    <span>Logout</span>
                </div>
            `;
            
            // Add to user profile container
            const userProfile = document.querySelector('.user-profile');
            userProfile.appendChild(userMenu);
            
            // Bind logout event
            document.getElementById('logoutOption').addEventListener('click', () => {
                this.handleLogout();
            });
        }
        
        userMenu.classList.toggle('hidden');
    }

    async handleLogout() {
        // Logout is now handled by ProfileController
        this.updateUserProfile(null);
        
        // Hide user menu
        const userMenu = document.getElementById('userDropdownMenu');
        if (userMenu) {
            userMenu.classList.add('hidden');
        }
        
        console.log('User logged out from navbar');
    }

    // Navigation tab methods
    switchTab(tabName) {
        // Remove active class from all tabs
        this.navTabs.forEach(tab => {
            tab.classList.remove('active');
        });

        // Add active class to selected tab
        const selectedTab = document.getElementById(`${tabName}Tab`);
        if (selectedTab) {
            selectedTab.classList.add('active');
            this.currentTab = tabName;
        }

        // Tab changes are now handled by PageLoader
        console.log('Tab switched to:', tabName);
    }

    getCurrentTab() {
        return this.currentTab;
    }

    // Handle all platform detection and management
    async initializePlatformDetection() {
        try {
            console.log('NavbarController: Initializing platform detection...');
            
            // Step 1: ALWAYS populate dropdown with ALL platforms from Constants
            const allPlatforms = [];
            if (typeof Constants !== 'undefined' && Constants.DOMAINS) {
                Object.entries(Constants.DOMAINS).forEach(([key, domain]) => {
                    allPlatforms.push({
                        tab: { id: Math.random(), url: domain.URL, title: domain.DISPLAY_NAME },
                        domainConfig: { key, domain },
                        platformName: domain.DISPLAY_NAME,
                        platformIcon: domain.ICON
                    });
                });
                console.log('Created all platforms:', allPlatforms.map(p => p.platformName));
            }
            
            this.populatePlatformDropdown(allPlatforms);
            
            // Step 2: Check current browser tab and auto-select if it matches
            try {
                const allTabs = await chrome.tabs.query({});
                console.log('All tabs:', allTabs.map(t => ({ id: t.id, url: t.url, active: t.active })));
                
                // Find active browser tab (not extension tab)
                const browserTabs = allTabs.filter(tab => 
                    !tab.url.startsWith('chrome-extension://') && 
                    !tab.url.startsWith('chrome://') &&
                    !tab.url.startsWith('moz-extension://')
                );
                
                const activeBrowserTab = browserTabs.find(tab => tab.active) || 
                                       browserTabs.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0))[0];
                
                // Auto-detect platform based on current tab and update stored tab
                await this.detectCurrentPlatform();
                
            } catch (error) {
                console.error('Failed to check current tab:', error);
            }
            
            // Step 3: No matching tab found, load from storage
            await this.loadStoredPlatform();
            
        } catch (error) {
            console.error('Platform detection failed:', error);
            await this.loadStoredPlatform();
        }
    }

    async detectCurrentPlatform() {
        try {
            // Step 1: Get most recent non-extension tab
            let activeBrowserTab = null;
            try {
                const allTabs = await chrome.tabs.query({});
                // Filter out extension tabs and find most recently accessed website tab
                const browserTabs = allTabs.filter(tab => 
                    tab.url && 
                    !tab.url.startsWith('chrome-extension://') && 
                    !tab.url.startsWith('moz-extension://') &&
                    !tab.url.startsWith('chrome://') &&
                    !tab.url.startsWith('about:')
                );
                
                // Sort by lastAccessed to get most recent
                browserTabs.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
                
                if (browserTabs.length > 0) {
                    activeBrowserTab = browserTabs[0];
                    console.log('Most recent website tab:', activeBrowserTab.url);
                }
            } catch (error) {
                console.warn('Could not get browser tabs:', error);
            }
            
            // Step 2: Load stored platform and update its tab to current tab
            const result = await StorageUtils.get(['selectedPlatform']);
            if (result.success && result.data.selectedPlatform) {
                const storedPlatform = result.data.selectedPlatform;
                
                // Update stored platform with current active tab
                if (activeBrowserTab) {
                    storedPlatform.tab = activeBrowserTab;
                    await StorageUtils.set({ selectedPlatform: storedPlatform });
                    console.log('Updated stored platform with current tab:', activeBrowserTab.url);
                }
                
                this.updateSelectedPlatform(storedPlatform);
                return;
            }
            
            // Step 3: No stored platform, try to auto-detect from current tab
            if (activeBrowserTab && this.availablePlatforms) {
                for (const platform of this.availablePlatforms) {
                    // Extract domain from platform's domainConfig
                    const platformUrl = platform.domainConfig?.domain?.URL;
                    if (platformUrl) {
                        try {
                            const platformDomain = new URL(platformUrl).hostname;
                            const currentDomain = new URL(activeBrowserTab.url).hostname;
                            
                            console.log(`Checking platform ${platform.platformName}: ${platformDomain} vs current: ${currentDomain}`);
                            
                            if (currentDomain.includes(platformDomain) || platformDomain.includes(currentDomain)) {
                                console.log('Auto-selecting platform:', platform.platformName);
                                // Update the platform with actual browser tab info
                                platform.tab = activeBrowserTab;
                                this.updateSelectedPlatform(platform);
                                
                                // Save to storage
                                await StorageUtils.set({ selectedPlatform: platform });
                                console.log('Platform auto-selected and saved:', platform.platformName);
                                return;
                            }
                        } catch (error) {
                            console.warn('Error parsing URLs for platform detection:', error);
                        }
                    }
                }
            }
            
        } catch (error) {
            console.error('Platform detection failed:', error);
        }
    }

    // Load stored platform on init
    async loadStoredPlatform() {
        try {
            const result = await StorageUtils.get(['selectedPlatform']);
            if (result.success && result.data.selectedPlatform) {
                this.updateSelectedPlatform(result.data.selectedPlatform);
                console.log('Loaded stored platform:', result.data.selectedPlatform);
            }
        } catch (error) {
            console.error('Failed to load stored platform:', error);
        }
    }

    // Load stored user on init
    async loadStoredUser() {
        try {
            const result = await StorageUtils.get(['chocoUser']);
            if (result.success && result.data.chocoUser && result.data.chocoUser.user) {
                this.updateUserProfile(result.data.chocoUser.user);
                console.log('Loaded stored user:', result.data.chocoUser.user);
            } else {
                this.updateUserProfile(null);
            }
        } catch (error) {
            console.error('Failed to load stored user:', error);
            this.updateUserProfile(null);
        }
    }

    // Reset methods
    async reset() {
        this.updateSelectedPlatform(null);
        this.updateUserProfile(null);
        this.switchTab('home');
        this.availablePlatforms = [];
        this.platformDropdownMenu.innerHTML = '';
        
        // Clear stored platform
        await StorageUtils.remove(['selectedPlatform']);
    }
}
