class CredentialValidator {
    static async validateCredentials(credentials, mode, targetCredentials = null) {
        try {
            // Get team config from storage instead of window object
            let config = null;
            try {
                const storageResult = await chrome.storage.local.get(['choco_team_config']);
                if (storageResult.choco_team_config) {
                    config = storageResult.choco_team_config;
                }
            } catch (error) {
                console.warn('Could not load team config from storage:', error);
            }

            const validatorName = config?.validator || 'base';
            
            let validationResult;
            if (validatorName === 'base' || !config) {
                validationResult = await BaseValidation.validateCredentials(credentials, mode, targetCredentials, config);

            // define custom validator here if requried
            
            } else {
                // Fallback to base validator for unknown types
                validationResult = await BaseValidation.validateCredentials(credentials, mode, targetCredentials, config);
            }

            return validationResult;
        } catch (error) {
            return {
                success: false,
                error: 'Validation error',
                message: error.message,
                data: null
            }
        }
    }

}
