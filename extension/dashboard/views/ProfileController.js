class ProfileController {
    constructor() {
        this.userAPI = null;
        this.isLoggedIn = false;
        this.userProfile = null;
    }

    async init() {
        try {
            if (typeof UserAPI !== 'undefined' && typeof Constants !== 'undefined') {
                this.userAPI = new UserAPI(Constants.BACKEND_URL);
            } else {
                console.error('UserAPI or Constants not available:', {
                    UserAPI: typeof UserAPI,
                    Constants: typeof Constants
                });
                return;
            }

            await this.checkLoginStatus();
            this.bindEvents();
        } catch (error) {
            console.error('ProfileController initialization failed:', error);
        }
    }

    async checkLoginStatus() {
        try {
            if (!this.userAPI) {
                this.showLoginForm();
                return;
            }

            // Check if user is stored locally only
            const storedUser = await this.userAPI.getLocalStoredUser();
            if (storedUser.success && storedUser.data.user) {
                this.isLoggedIn = true;
                this.userProfile = storedUser.data.user;
                
                if (window.navbarController) {
                    window.navbarController.updateUserProfile(this.userProfile);
                }
                
                this.showProfileView();
                this.loadUserProfileData();
            } else {
                this.isLoggedIn = false;
                this.showLoginForm();
            }
        } catch (error) {
            console.error('Auth status check failed:', error);
            this.showLoginForm();
        }
    }

    bindEvents() {
        // Login form events
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.handleLogin());
        }

        const emailInput = document.getElementById('emailInput');
        const passwordInput = document.getElementById('passwordInput');
        if (emailInput && passwordInput) {
            [emailInput, passwordInput].forEach(input => {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.handleLogin();
                    }
                });
            });
        }

        // Profile action buttons
        const refreshProfileBtn = document.getElementById('refreshProfileBtn');
        if (refreshProfileBtn) {
            refreshProfileBtn.addEventListener('click', () => this.loadUserProfileData());
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    showLoginForm() {
        this.hideAllViews();
        
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.style.display = 'block';
        }
    }

    hideLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.style.display = 'none';
        }
    }

    showProfileView() {
        this.hideAllViews();
        
        const profileSection = document.querySelector('.user-profile-section');
        if (profileSection) {
            profileSection.style.display = 'block';
        }
    }

    hideProfileView() {
        const profileSection = document.querySelector('.user-profile-section');
        if (profileSection) {
            profileSection.style.display = 'none';
        }
    }

    async handleLogin() {
        const emailInput = document.getElementById('emailInput');
        const passwordInput = document.getElementById('passwordInput');
        const loginError = document.getElementById('loginError');
        const loginBtn = document.getElementById('loginBtn');

        if (!emailInput || !passwordInput) {
            this.showError('Login form elements not found');
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            this.showError('Please enter both email and password');
            return;
        }

        try {
            // Show loading state
            if (loginBtn) {
                loginBtn.textContent = 'Logging in...';
                loginBtn.disabled = true;
            }

            // Clear previous errors
            if (loginError) {
                loginError.classList.add('hidden');
            }

            // Check if userAPI is initialized
            if (!this.userAPI) {
                this.showError('API not initialized. Please refresh the page.');
                return;
            }

            const result = await this.userAPI.login(email, password);
            
            if (result.success && result.data && result.data.user && result.data.token) {
                this.isLoggedIn = true;
                this.userProfile = result.data.user;
                
                const storedUserCheck = await this.userAPI.getLocalStoredUser();
                
                if (window.navbarController) {
                    window.navbarController.updateUserProfile(this.userProfile);
                }
                
                if (window.pageLoader && window.pageLoader.currentController && 
                    window.pageLoader.currentController.checkUserStatus) {
                    await window.pageLoader.currentController.checkUserStatus();
                }
                
                this.showProfileView();
                this.loadUserProfileData();
                
                emailInput.value = '';
                passwordInput.value = '';
                
            } else {
                console.error('Login failed - invalid response format:', result);
                this.showError(result.message || 'Login failed - invalid response');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Login failed: ' + error.message);
        } finally {
            // Reset button state
            if (loginBtn) {
                loginBtn.textContent = 'Login';
                loginBtn.disabled = false;
            }
        }
    }

    showError(message) {
        const loginError = document.getElementById('loginError');
        if (loginError) {
            loginError.textContent = message;
            loginError.classList.remove('hidden');
            loginError.style.display = 'block';
        }
    }

    async handleLogout() {
        try {
            if (this.userAPI) {
                await this.userAPI.clearLocalUser();
            }
            
            this.isLoggedIn = false;
            this.userProfile = null;
            
            // Update navbar
            if (window.navbarController) {
                window.navbarController.updateUserProfile(null);
            }
            
            // Show login form
            this.showLoginForm();
            
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    async loadUserProfileData() {
        try {
            if (!this.userAPI || !this.isLoggedIn) {
                return;
            }

            this.showStatusCard('loading', 'Loading Profile Data', 'Please wait while we fetch your profile information...');
            
            const profileData = await this.userAPI.getUserDetails(); 
            if (profileData.success && profileData.data) {
                this.profileData = profileData.data;
                this.userProfile = profileData.data.user;
                this.showProfileView();
                this.updateProfileDisplay();
            } else {
                console.error('Profile data fetch failed:', profileData);
                this.showStatusCard('error', 'Failed to Load Profile', 'Unable to retrieve profile data from server');
            }
        } catch (error) {
            console.error('Failed to load profile data:', error);
            this.showStatusCard('error', 'Error Loading Profile', 'Network error occurred while loading profile');
        }
    }

    showStatusCard(type, message, details = '') {
        this.hideAllViews();
        
        const statusContainer = document.getElementById('statusContainer');
        const statusText = document.getElementById('profileStatusText');
        const statusDetails = document.getElementById('profileStatusDetails');
        
        if (!statusContainer || !statusText) {
            console.error('Profile status card elements not found');
            return;
        }

        statusText.textContent = message;
        statusText.className = `status-text status-${type}`;

        if (details && statusDetails) {
            statusDetails.textContent = details;
            statusDetails.style.display = 'block';
        } else if (statusDetails) {
            statusDetails.style.display = 'none';
        }
        
        statusContainer.style.display = 'block';
    }

    hideStatusCard() {
        const statusContainer = document.getElementById('statusContainer');
        if (statusContainer) {
            statusContainer.style.display = 'none';
        }
    }

    hideAllViews() {
        this.hideLoginForm();
        this.hideProfileView();
        this.hideStatusCard();
    }

    getSelectedTeamFromStorage(teams) {
        try {
            // Check if there's a selected account in local storage
            const selectedTeamId = localStorage.getItem('selectedTeamId');
            if (selectedTeamId) {
                const selectedTeam = teams.find(team => team.id === selectedTeamId);
                if (selectedTeam) {
                    return selectedTeam;
                }
            }
            
            // Fallback: return primary team (owner first, then admin, then first available)
            return teams.find(team => team.isOwner) || 
                   teams.find(team => team.role === 'admin') || 
                   teams[0] || null;
        } catch (error) {
            console.error('Error getting selected team from storage:', error);
            return teams[0] || null;
        }
    }

    updateProfileDisplay() {
        if (!this.userProfile || !this.profileData) {
            return;
        }

        // Update profile header
        const profileUserName = document.getElementById('profileUserName');
        const profileUserEmail = document.getElementById('profileUserEmail');
        
        if (profileUserName) {
            profileUserName.textContent = this.userProfile.name || this.userProfile.email || 'User';
        }
        if (profileUserEmail) {
            profileUserEmail.textContent = this.userProfile.email || '';
        }

        // Update essential account information only
        const profileStatus = document.getElementById('profileStatus');
        const profileMemberSince = document.getElementById('profileMemberSince');

        if (profileStatus) {
            profileStatus.textContent = this.userProfile.isActive ? 'Active' : 'Inactive';
        }
        if (profileMemberSince) {
            profileMemberSince.textContent = this.userProfile.createdAt ? 
                new Date(this.userProfile.createdAt).toLocaleDateString() : '-';
        }

        // Get selected team from local storage or use first available team
        const teams = this.profileData.teams || [];
        const statistics = this.profileData.statistics || {};
        
        // Get selected account from local storage
        const selectedTeam = this.getSelectedTeamFromStorage(teams);
        
        const profileTeamName = document.getElementById('profileTeamName');
        const profileTeamId = document.getElementById('profileTeamId');
        const profilePlatformAccount = document.getElementById('profilePlatformAccount');
        const profileTeamMembers = document.getElementById('profileTeamMembers');
        const profileActiveMembers = document.getElementById('profileActiveMembers');
        const profileTotalTeams = document.getElementById('profileTotalTeams');
        const profileAdminTeams = document.getElementById('profileAdminTeams');

        // Display selected account information
        if (profileTeamName) {
            if (selectedTeam) {
                const roleText = selectedTeam.isOwner ? ' (Owner)' : ` (${selectedTeam.role})`;
                profileTeamName.textContent = selectedTeam.name + roleText;
            } else {
                profileTeamName.textContent = teams.length > 0 ? `${teams.length} accounts available` : 'No accounts';
            }
        }
        if (profileTeamId) {
            profileTeamId.textContent = selectedTeam?.id || '-';
        }
        if (profilePlatformAccount) {
            profilePlatformAccount.textContent = selectedTeam?.platformAccountId || '-';
        }
        if (profileTeamMembers) {
            profileTeamMembers.textContent = statistics.totalTeamMembers || '-';
        }
        if (profileActiveMembers) {
            profileActiveMembers.textContent = statistics.activeTeamMembers || '-';
        }
        if (profileTotalTeams) {
            profileTotalTeams.textContent = statistics.totalTeams || teams.length;
        }
        if (profileAdminTeams) {
            profileAdminTeams.textContent = statistics.adminTeams || '-';
        }

    }

    destroy() {
        
    }
}

// Export for global use
window.ProfileController = ProfileController;
