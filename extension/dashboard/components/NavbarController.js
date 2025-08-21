class NavbarController {
    constructor() {
        this.teamDropdownBtn = null;
        this.teamDropdownMenu = null;
        this.selectedTeamIcon = null;
        this.selectedTeamName = null;
        this.userName = null;
        this.navTabs = null;
        this.currentTab = 'home';
        this.isDropdownOpen = false;
        this.availableTeams = [];
        this.selectedTeam = null;
        this.helpDropdownBtn = null;
        this.helpDropdownMenu = null;
        this.isHelpDropdownOpen = false;
    }

    async init() {
        this.showLoading('Initializing...');
        
        // Initialize DOM elements
        this.teamDropdownBtn = document.getElementById('teamDropdownBtn');
        this.teamDropdownMenu = document.getElementById('teamDropdownMenu');
        this.selectedTeamIcon = document.getElementById('selectedTeamIcon');
        this.selectedTeamName = document.getElementById('selectedTeamName');
        this.userName = document.getElementById('userName');
        this.navTabs = document.querySelectorAll('.nav-tab');
        this.helpDropdownBtn = document.getElementById('helpDropdownBtn');
        this.helpDropdownMenu = document.getElementById('helpDropdownMenu');

        if (!this.teamDropdownBtn || !this.teamDropdownMenu) {
            console.error('Team dropdown elements not found!');
            this.hideLoading();
            return;
        }

        // Initialize team manager
        if (!window.teamManager) {
            const { TeamManager } = await import('../lib/api/teams.js');
            window.teamManager = new TeamManager();
        }

        // Initialize team manager from storage to get latest config
        await window.teamManager.initFromStorage();

        await this.loadStoredUser();
        if (this.isUserLoggedIn()) {
            await this.loadUserData();
            await this.handleStoredTeamSelection();
        }
        
        this.bindUserProfileEvents();
        this.bindDropdownEvents();
        this.bindHelpDropdownEvents();
        
        this.hideLoading();
    }


    async populateTeamDropdown(teams) {
        this.availableTeams = teams;
        if (!this.teamDropdownMenu) return;
        
        this.teamDropdownMenu.innerHTML = '';

        if (teams.length === 0) {
            const noTeamsDiv = document.createElement('div');
            noTeamsDiv.className = 'no-teams-message';
            noTeamsDiv.innerHTML = `<div class="instruction-text"><strong>No teams found.</strong> Please create a team in the dashboard first.</div>`;
            this.teamDropdownMenu.appendChild(noTeamsDiv);
            this.teamDropdownBtn.disabled = true;
            return;
        }
        
        const teamsWithTabStatus = teams.map(team => ({
            ...team,
            hasOpenTab: true,
            isSelectable: true
        }));
        
        teamsWithTabStatus.forEach(team => {
            const option = document.createElement('div');
            const isSelected = this.selectedTeam?.id === team.id;
            const isDisabled = !team.isSelectable;
            
            option.className = `dropdown-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`;
            option.innerHTML = `
                <span class="team-icon">👥</span>
                <span class="team-name">${team.name}</span>
                <span class="team-status">${this.getTeamStatus(team, isSelected)}</span>
            `;
            
            if (!isDisabled) {
                option.addEventListener('click', () => this.selectTeam(team));
            }
            
            this.teamDropdownMenu.appendChild(option);
        });

        this.teamDropdownBtn.disabled = false;
    } 

    updateSelectedTeam(team) {
        if (team) {
            const domainInfo = window.teamManager?.getDomainInfo();
            this.selectedTeamIcon.textContent = domainInfo?.icon || '👥';
            this.selectedTeamName.textContent = team.name;
            this.teamDropdownBtn.disabled = false;
        } else {
            this.selectedTeamIcon.textContent = '👥';
            this.selectedTeamName.textContent = 'Select Team';
            this.teamDropdownBtn.disabled = true;
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
        this.teamDropdownMenu.classList.remove('hidden');
        this.teamDropdownBtn.classList.add('open');
        this.isDropdownOpen = true;
    }

    closeDropdown() {
        this.teamDropdownMenu.classList.add('hidden');
        this.teamDropdownBtn.classList.remove('open');
        this.isDropdownOpen = false;
    }


    async checkSelectedTeamStatus(team, configResult) {
        const hasConfig = configResult?.success && configResult?.data?.hasConfig && configResult?.data?.config?.domain;
        const domain = configResult?.data?.config?.domain;
        const hasMatchingTab = hasConfig ? await this.checkTeamHasOpenTab(team, configResult) : false;
        
        if (!hasConfig || !hasMatchingTab) {
            this.showWarning(hasConfig, hasMatchingTab, team.name, domain);
        } else {
            this.hideWarning();
        }
    }

    showWarning(hasConfig, hasMatchingTab, teamName, domain = null) {
        this.hideWarning();
        
        const warningDiv = document.createElement('div');
        warningDiv.id = 'team-warning';
        warningDiv.className = 'team-warning';
        
        let icon, title, message, actions;
        
        if (!hasConfig && !hasMatchingTab) {
            icon = '⚠️';
            title = 'Configuration & Tab Missing';
            message = `Team "${teamName}" needs configuration and a matching tab to collect credentials.`;
            actions = `
                <a href="#" class="warning-btn primary" data-action="create-config">Create Configuration</a>
                <button class="warning-btn secondary" data-action="dismiss">Dismiss</button>
            `;
        } else if (!hasConfig) {
            icon = '⚠️';
            title = 'No Configuration Found';
            message = `Team "${teamName}" doesn't have credential collection configuration.`;
            actions = `
                <a href="#" class="warning-btn primary" data-action="create-config">Create Configuration</a>
                <button class="warning-btn secondary" data-action="dismiss">Dismiss</button>
            `;
        } else if (!hasMatchingTab) {
            icon = '💭';
            title = 'No Matching Tab Open';
            message = `Please open a tab for <strong>${domain}</strong> to collect credentials for "${teamName}".`;
            actions = `
                <a href="#" class="warning-btn primary" data-action="open-tab" data-domain="${domain}">Open ${domain}</a>
                <button class="warning-btn secondary" data-action="dismiss">Dismiss</button>
            `;
        }
        
        warningDiv.innerHTML = `
            <div class="warning-icon">${icon}</div>
            <div class="warning-text">
                <div class="warning-title">${title}</div>
                <div class="warning-message">${message}</div>
            </div>
            <div class="warning-actions">${actions}</div>
        `;
        
        // Add event listeners for buttons
        warningDiv.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action === 'create-config') {
                e.preventDefault();
                window.open(`${Constants.BACKEND_URL}/dashboard`, '_blank');
            } else if (action === 'open-tab') {
                e.preventDefault();
                const targetDomain = e.target.dataset.domain;
                const url = targetDomain.startsWith('http') ? targetDomain : `https://${targetDomain}`;
                window.open(url, '_blank');
            } else if (action === 'dismiss') {
                this.hideWarning();
            }
        });
        
        // Add above nav tabs (below navbar)
        const navTabs = document.querySelector('.nav-tabs');
        if (navTabs) {
            navTabs.parentNode.insertBefore(warningDiv, navTabs);
        }
    }

    hideWarning() {
        const warning = document.getElementById('team-warning');
        if (warning) warning.remove();
    }

    showLoading(message = 'Loading...') {
        // Remove existing loading
        this.hideLoading();
        
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'navbar-loading';
        loadingDiv.className = 'navbar-loading';
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <span class="loading-text">${message}</span>
        `;
        
        // Add to navbar
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.appendChild(loadingDiv);
        }
    }

    hideLoading() {
        const loading = document.getElementById('navbar-loading');
        if (loading) loading.remove();
    }



    // User profile methods
    updateUserProfile(user) {
        if (user && user.name) {
            this.userName.textContent = user.name;
            this.userName.classList.remove('not-logged-in');
            this.userName.classList.add('logged-in');
            
            setTimeout(async () => {
                await this.loadUserData();
                await this.handleStoredTeamSelection();
            }, 100);
        } else {
            this.userName.textContent = 'Login';
            this.userName.classList.remove('logged-in');
            this.userName.classList.add('not-logged-in');
            
            // Hide warnings when user is not logged in
            this.hideWarning();
        }
    }


    bindDropdownEvents() {
        this.teamDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        document.addEventListener('click', () => {
            if (this.isDropdownOpen) {
                this.closeDropdown();
            }
            if (this.isHelpDropdownOpen) {
                this.closeHelpDropdown();
            }
        });
    }

    bindHelpDropdownEvents() {
        if (!this.helpDropdownBtn || !this.helpDropdownMenu) return;

        this.helpDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleHelpDropdown();
        });

        // Handle help menu item clicks
        this.helpDropdownMenu.addEventListener('click', (e) => {
            const item = e.target.closest('.help-dropdown-item');
            if (!item) return;

            const action = item.dataset.action;
            this.handleHelpAction(action);
            this.closeHelpDropdown();
        });
    }

    toggleHelpDropdown() {
        if (this.isHelpDropdownOpen) {
            this.closeHelpDropdown();
        } else {
            this.openHelpDropdown();
        }
    }

    openHelpDropdown() {
        this.helpDropdownMenu.classList.remove('hidden');
        this.isHelpDropdownOpen = true;
    }

    closeHelpDropdown() {
        this.helpDropdownMenu.classList.add('hidden');
        this.isHelpDropdownOpen = false;
    }

    handleHelpAction(action) {
        switch (action) {
            case 'dashboard':
                window.open(`${Constants.BACKEND_URL}/dashboard`, '_blank');
                break;
            case 'docs':
                window.open('https://github.com/ravi-ivar-7/choco/blob/master/README.md', '_blank');
                break;
            case 'issues':
                window.open('https://github.com/ravi-ivar-7/choco/issues', '_blank');
                break;
            case 'github':
                window.open('https://github.com/ravi-ivar-7/choco/', '_blank');
                break;
            default:
                console.warn('Unknown help action:', action);
        }
    }


    bindUserProfileEvents() {
        const userProfile = document.querySelector('.user-profile');
        if (userProfile) {
            userProfile.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.pageLoader) {
                    window.pageLoader.switchToPage('profile');
                }
            });
        }
    }

    async selectTeam(team) {
        this.showLoading('Selecting team...');
        
        this.selectedTeam = team;
        this.updateSelectedTeam(team);
        this.closeDropdown();
        
        // Store selected team in local storage
        StorageUtils.set({ choco_selected_team: team });
        
        // Fetch and verify team configuration
        this.showLoading('Loading team configuration...');
        const configResult = await window.teamManager.fetchConfig(team.id);
        
        if (!configResult.success) {
            console.warn('Failed to fetch team config:', configResult.error);
        }
        
        // Check team configuration and tab status
        await this.checkSelectedTeamStatus(team, configResult);
        
        // Store the target tab for the selected team
        await this.storeTargetTabForTeam(team, configResult);
        
        // Notify other components about team change
        if (window.homeController?.onTeamChange) {
            window.dispatchEvent(new CustomEvent('teamChanged', { detail: team }));
        }
        
        this.hideLoading();
    }


    async loadUserData() {
        if (!window.teamManager) return;
        
        const result = await window.teamManager.init();
        if (result.success) {
            const { teams } = result.data;
            await this.populateTeamDropdown(teams);
        }
    }

    async loadStoredUser() {
        this.showLoading('Verifying user...');
        const result = await StorageUtils.get(['choco_user']);
        this.updateUserProfile(result.success && result.data.choco_user ? result.data.choco_user : null);
    }

    isUserLoggedIn() {
        return this.userName && this.userName.textContent && this.userName.textContent !== 'Login';
    }


    async handleStoredTeamSelection() {
        const result = await StorageUtils.get(['choco_selected_team']);
        
        if (!result.success || !result.data.choco_selected_team) {
            if (this.isUserLoggedIn() && this.availableTeams.length > 0) {
                this.showNoTeamWarning();
            }
            return;
        }
        
        const savedTeam = this.availableTeams.find(team => team.id === result.data.choco_selected_team.id);
        if (!savedTeam) {
            if (this.isUserLoggedIn() && this.availableTeams.length > 0) {
                this.showNoTeamWarning();
            }
            return;
        }
        
        this.selectedTeam = savedTeam;
        this.updateSelectedTeam(savedTeam);
        
        const configResult = await window.teamManager.fetchConfig(savedTeam.id);
        const hasMatchingTab = await this.checkTeamHasOpenTab(savedTeam, configResult);
        
        if (hasMatchingTab) {
            await this.storeTargetTabForTeam(savedTeam, configResult);
        }
        
        await this.checkSelectedTeamStatus(savedTeam, configResult);
    }



    showNoTeamWarning() {
        this.hideWarning();
        
        const warningDiv = document.createElement('div');
        warningDiv.id = 'team-warning';
        warningDiv.className = 'team-warning';
        
        warningDiv.innerHTML = `
            <div class="warning-content">
                <div class="warning-icon">⚠️</div>
                <div class="warning-text">
                    <strong>No Team Selected</strong>
                    <p>Please select a team from the dropdown to continue.</p>
                </div>
            </div>
        `;
        
        const navbar = document.querySelector('.navbar');
        if (navbar && navbar.parentNode) {
            navbar.parentNode.insertBefore(warningDiv, navbar.nextSibling);
        }
    }

    getTeamStatus(team, isSelected) {
        return isSelected ? 'Selected' : 'Available';
    }

    async getBrowserTabs() {
        const allTabs = await chrome.tabs.query({});
        return allTabs.filter(tab => 
            tab.url && 
            !tab.url.startsWith('chrome-extension://') && 
            !tab.url.startsWith('chrome://') &&
            !tab.url.startsWith('moz-extension://') &&
            !tab.url.startsWith('about:')
        );
    }

    getDomainFromConfig(teamDomain) {
        return teamDomain.startsWith('http') ? new URL(teamDomain).hostname : teamDomain;
    }

    async checkTeamHasOpenTab(team, configResult) {
        try {
            const browserTabs = await this.getBrowserTabs();

            if (configResult.success && configResult.data?.config?.domain) {
                const configDomain = this.getDomainFromConfig(configResult.data.config.domain);
                
                for (const tab of browserTabs) {
                    try {
                        const tabDomain = new URL(tab.url).hostname;
                        if (tabDomain.includes(configDomain) || configDomain.includes(tabDomain)) {
                            return true;
                        }
                    } catch (error) {
                        console.warn('Error parsing tab URL:', error);
                    }
                }
                return false;
            } else {
                return browserTabs.length > 0;
            }
        } catch (error) {
            console.warn('Error checking team tab:', error);
            return false;
        }
    }

    async storeTargetTabForTeam(team, configResult) {
        try {
            const browserTabs = await this.getBrowserTabs();
            let targetTab = null;

            if (configResult.success && configResult.data?.config?.domain) {
                const configDomain = this.getDomainFromConfig(configResult.data.config.domain);
                
                for (const tab of browserTabs) {
                    try {
                        const tabDomain = new URL(tab.url).hostname;
                        if (tabDomain.includes(configDomain) || configDomain.includes(tabDomain)) {
                            targetTab = tab;
                            break;
                        }
                    } catch (error) {
                        console.warn('Error parsing tab URL:', error);
                    }
                }
            } else {
                targetTab = browserTabs[0] || null;
            }

            if (targetTab) {
                StorageUtils.set({ 
                    choco_target_tab: {
                        ...targetTab,
                        teamId: team.id,
                        timestamp: Date.now()
                    }
                });
            }
        } catch (error) {
            console.warn('Error storing target tab:', error);
        }
    }

}
