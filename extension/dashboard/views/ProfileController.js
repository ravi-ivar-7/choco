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

            // Check if user is already stored locally first
            const storedUser = await this.userAPI.getLocalStoredUser();
            if (storedUser.success && storedUser.data.user) {
                this.isLoggedIn = true;
                this.userProfile = storedUser.data.user;
                
                if (window.navbarController) {
                    window.navbarController.updateUserProfile(this.userProfile);
                }
                
                this.showProfileView();
                this.loadUserProfileData();
                return;
            }
            
            // If no stored user, validate with server
            const authStatus = await this.userAPI.validateUser();
            if (authStatus.success && authStatus.data.user) {
                this.isLoggedIn = true;
                this.userProfile = authStatus.data.user;
                
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
        const loginForm = document.getElementById('loginForm');
        const profileSection = document.querySelector('.user-profile-section');
        
        if (loginForm) {
            loginForm.style.display = 'block';
            loginForm.classList.remove('hidden');
        }
        if (profileSection) {
            profileSection.style.display = 'none';
        }
    }

    showProfileView() {
        const loginForm = document.getElementById('loginForm');
        const profileSection = document.querySelector('.user-profile-section');
        
        if (loginForm) {
            loginForm.style.display = 'none';
            loginForm.classList.add('hidden');
        }
        if (profileSection) {
            profileSection.style.display = 'block';
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

            const profileData = await this.userAPI.getUserDetails();
            console.log('Profile data received in controller:', profileData);
            if (profileData.success && profileData.data) {
                this.profileData = profileData.data;
                this.userProfile = profileData.data.user;
                console.log('Setting profileData:', this.profileData);
                console.log('Setting userProfile:', this.userProfile);
                this.updateProfileDisplay();
            } else {
                console.error('Profile data fetch failed:', profileData);
            }
        } catch (error) {
            console.error('Failed to load profile data:', error);
        }
    }

    updateProfileDisplay() {
        if (!this.userProfile || !this.profileData) {
            console.log('Missing profile data:', { userProfile: this.userProfile, profileData: this.profileData });
            return;
        }
        
        console.log('Updating profile display with:', this.profileData);

        // Update profile header
        const profileUserName = document.getElementById('profileUserName');
        const profileUserEmail = document.getElementById('profileUserEmail');
        
        if (profileUserName) {
            profileUserName.textContent = this.userProfile.name || this.userProfile.email || 'User';
        }
        if (profileUserEmail) {
            profileUserEmail.textContent = this.userProfile.email || '';
        }

        // Update account information
        const profileUserId = document.getElementById('profileUserId');
        const profileEmailDetail = document.getElementById('profileEmailDetail');
        const profileRole = document.getElementById('profileRole');
        const profileStatus = document.getElementById('profileStatus');
        const profileMemberSince = document.getElementById('profileMemberSince');
        const profileLastLogin = document.getElementById('profileLastLogin');

        if (profileUserId) {
            profileUserId.textContent = this.userProfile.id || '-';
        }
        if (profileEmailDetail) {
            profileEmailDetail.textContent = this.userProfile.email || '-';
        }
        if (profileRole) {
            profileRole.textContent = this.userProfile.role ? 
                this.userProfile.role.charAt(0).toUpperCase() + this.userProfile.role.slice(1) : '-';
        }
        if (profileStatus) {
            profileStatus.textContent = this.userProfile.isActive ? 'Active' : 'Inactive';
        }
        if (profileMemberSince) {
            profileMemberSince.textContent = this.userProfile.createdAt ? 
                new Date(this.userProfile.createdAt).toLocaleDateString() : '-';
        }
        if (profileLastLogin) {
            profileLastLogin.textContent = this.userProfile.lastLoginAt ? 
                new Date(this.userProfile.lastLoginAt).toLocaleString() : '-';
        }

        // Update team information
        const team = this.profileData.team;
        const profileTeamName = document.getElementById('profileTeamName');
        const profileTeamId = document.getElementById('profileTeamId');
        const profilePlatformAccount = document.getElementById('profilePlatformAccount');
        const profileTeamMembers = document.getElementById('profileTeamMembers');
        const profileActiveMembers = document.getElementById('profileActiveMembers');

        if (profileTeamName) {
            profileTeamName.textContent = team?.name || '-';
        }
        if (profileTeamId) {
            profileTeamId.textContent = team?.id || '-';
        }
        if (profilePlatformAccount) {
            profilePlatformAccount.textContent = team?.platformAccountId || '-';
        }
        if (profileTeamMembers) {
            profileTeamMembers.textContent = this.profileData.statistics?.totalTeamMembers || '-';
        }
        if (profileActiveMembers) {
            profileActiveMembers.textContent = this.profileData.statistics?.activeTeamMembers || '-';
        }

    }

    destroy() {
        
    }
}

// Export for global use
window.ProfileController = ProfileController;
