class CredentialSyncer {
    static async syncCredentialsToDatabase() {
        try {
            // Get team config from Chrome storage directly
            const storageResult = await StorageUtils.get(['choco_team_config']);
            let config = null;
            if (storageResult.success && storageResult.data.choco_team_config) {
                // Config is already an object, no need to parse
                config = storageResult.data.choco_team_config;
            }

            const syncerName = config?.syncer || 'base';
            
            let syncResult;
            if (syncerName === 'base' || !config) {
                syncResult = await BaseSyncer.syncCredentialsToDatabase(config);
            
            // define custom syncer here if required
            
            } else {
                // Fallback to base syncer for unknown types
                syncResult = await BaseSyncer.syncCredentialsToDatabase(config);
            }

            return syncResult;

        } catch (error) {
            return {
                success: false,
                error: 'Database sync error',
                message: `Error during credential database sync: ${error.message}`,
                data: null
            };
        }
    }

    static async syncCredentialsToLocal() {
        try {
            // Get team config from Chrome storage directly
            const storageResult = await StorageUtils.get(['choco_team_config']);
            let config = null;
            if (storageResult.success && storageResult.data.choco_team_config) {
                // Config is already an object, no need to parse
                config = storageResult.data.choco_team_config;
            }

            const syncerName = config?.syncer || 'base';
            
            let syncResult;
            if (syncerName === 'base' || !config) {
                syncResult = await BaseSyncer.syncCredentialsToLocal();
            
            // define custom syncer here if required
            
            } else {
                // Fallback to base syncer for unknown types
                syncResult = await BaseSyncer.syncCredentialsToLocal();
            }

            return syncResult;

        } catch (error) {
            return {
                success: false,
                error: 'Sync error',
                message: 'Failed to sync credentials to local storage',
                data: null
            };
        }
    }
}

