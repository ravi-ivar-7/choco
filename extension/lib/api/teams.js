/**
 * Team Manager
 * Handles team selection, configuration loading, and caching
 */
class TeamManager {
    constructor() {
        this.cache = {
            teams: null,
            selectedTeam: null,
            teamConfig: null,
            lastUpdated: null
        };
        this.initFromStorage();
    }

    /**
     * Initialize and load all team data
     */
    async init() {
        try {
            const token = await this.getAuthToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Fetch user teams
            const teams = await this.fetchTeams(token);
            this.cache.teams = teams;
            this.cache.lastUpdated = new Date();

            // If we have a selected team in storage, fetch its config
            if (this.cache.selectedTeam) {
                await this.fetchConfig(this.cache.selectedTeam.id, token);
            }
            // Don't auto-select teams - only fetch config for existing selected team

            return {
                success: true,
                error: null,
                message: 'Team data loaded successfully',
                data: {
                    teams: this.cache.teams,
                    selectedTeam: this.cache.selectedTeam,
                    teamConfig: this.cache.teamConfig
                }
            };
        } catch (error) {
            console.error('Failed to load team data:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to load team data',
                data: null
            };
        }
    }

    /**
     * Fetch user teams from backend
     */
    async fetchTeams(token) {
        const response = await fetch(`${Constants.BACKEND_URL}/api/teams`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch teams: ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch teams');
        }

        return result.data.teams || [];
    }

    /**
     * Fetch team configuration
     */
    async fetchConfig(teamId, token = null) {
        try {
            // Check if we already have config for this team
            if (this.cache.teamConfig && this.cache.selectedTeam?.id === teamId) {
                return {
                    success: true,
                    error: null,
                    message: 'Team config retrieved from cache',
                    data: {
                        config: this.cache.teamConfig,
                        hasConfig: !!this.cache.teamConfig
                    }
                };
            }

            if (!token) {
                token = await this.getAuthToken();
            }

            const response = await fetch(`${Constants.BACKEND_URL}/api/credentials/config?teamId=${teamId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch team config: ${response.status}`);
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch team config');
            }

            this.cache.teamConfig = result.data.config;
            await StorageUtils.set({ choco_team_config: this.cache.teamConfig });

            return {
                success: true,
                error: null,
                message: 'Team config fetched successfully',
                data: {
                    config: this.cache.teamConfig,
                    hasConfig: !!this.cache.teamConfig
                }
            };
        } catch (error) {
            console.error('Failed to load team config:', error);
            this.cache.teamConfig = null;
            return {
                success: false,
                error: error.message,
                message: 'Failed to fetch team config',
                data: {
                    config: null,
                    hasConfig: false
                }
            };
        }
    }

    /**
     * Select a team and load its configuration
     */
    async selectTeam(team) {
        // Store the matching tab with the team if available
        if (team.matchingTab) {
            team.tab = team.matchingTab;
        }
        
        this.cache.selectedTeam = team;
        await StorageUtils.set({ choco_selected_team: team });

        // Load team config
        const configResult = await this.fetchConfig(team.id);
        
        return {
            success: true,
            error: null,
            message: 'Team selected successfully',
            data: {
                team: team,
                config: configResult
            }
        };
    }

    /**
     * Get currently selected team
     */
    getSelectedTeam() {
        return this.cache.selectedTeam;
    }

    /**
     * Get team configuration
     */
    getTeamConfig() {
        return this.cache.teamConfig;
    }

    /**
     * Get all teams
     */
    getTeams() {
        return this.cache.teams || [];
    }

    /**
     * Check if team has configuration
     */
    hasTeamConfig() {
        return !!this.cache.teamConfig;
    }

    /**
     * Get domain info from team config
     */
    getDomainInfo() {
        if (!this.cache.teamConfig) return null;
        
        return {
            domain: this.cache.teamConfig.domain,
            displayName: this.cache.teamConfig.domainDisplayName || 'Platform',
            icon: this.cache.teamConfig.domainIcon || '🌐',
            validator: this.cache.teamConfig.validator || 'base'
        };
    }

    /**
     * Initialize from storage and refresh config from database
     */
    async initFromStorage() {
        try {
            const result = await StorageUtils.get(['choco_selected_team', 'choco_team_config']);
            if (result.success) {
                if (result.data.choco_selected_team) {
                    this.cache.selectedTeam = result.data.choco_selected_team;
                    
                    // Fetch latest config from database for selected team
                    const configResult = await this.fetchConfig(result.data.choco_selected_team.id);
                    if (configResult.success && configResult.data.config) {
                        this.cache.teamConfig = configResult.data.config;
                        // Update storage with fresh config
                        await StorageUtils.set({ choco_team_config: configResult.data.config });
                    }
                }
                if (result.data.choco_team_config && !this.cache.teamConfig) {
                    // Fallback to stored config if DB fetch failed
                    this.cache.teamConfig = result.data.choco_team_config;
                }
            }
        } catch (error) {
            console.warn('Failed to load from storage:', error);
        }
    }

    /**
     * Clear cache and storage
     */
    async clearCache() {
        this.cache = {
            teams: null,
            selectedTeam: null,
            teamConfig: null,
            lastUpdated: null
        };
        
        await StorageUtils.remove(['choco_selected_team', 'choco_team_config']);
    }

    /**
     * Get authentication token from stored user data
     */
    async getAuthToken() {
        try {
            const result = await StorageUtils.get(['choco_token']);
            if (result.success && result.data?.choco_token) {
                return result.data.choco_token;
            }
            return null;
        } catch (error) {
            console.warn('Failed to get auth token:', error);
            return null;
        }
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.TeamManager = TeamManager;
    window.teamManager = new TeamManager();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeamManager;
}
