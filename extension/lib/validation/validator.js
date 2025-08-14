class CredentialValidator {
    static async getRequiredFields(domainConfig = null) {
        try {
            // If domainConfig is not provided, get it from current browser context
            if (!domainConfig) {
                domainConfig = await ChromeUtils.getCurrentDomain();
            }
            
            if (!domainConfig) {
                return {
                    success: false,
                    error: 'No supported domain detected',
                    message: 'No supported domain detected',
                    data: null
                }
            }
            
            let requiredFields
            let platform
            if (domainConfig.key === 'MAANG') {
                requiredFields = MaangValidation.requiredFields
                platform = 'maang'
            }
            else if (domainConfig.key === 'DEVS') {
                requiredFields = DevsValidation.requiredFields
                platform = '100xdevs'
            }
            else {
                return {
                    success: false,
                    error: `No validator available for domain: ${domainConfig.key}`,
                    message: `No validator available for domain: ${domainConfig.key}`,
                    data: null
                }
            }
            
            return {
                success: true,
                error: null,
                message: `Required fields for ${platform} platform`,
                data: {
                    requiredFields: requiredFields,
                }
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: error.message,
                data: null
            }
        }
    }
    
    static async validateCredentials(credentials, mode, targetCredentials = null, domainConfig = null) {
        try {
            // If domainConfig is not provided, get it from current browser context
            if (!domainConfig) {
                domainConfig = await ChromeUtils.getCurrentDomain();
            }
            
            if (!domainConfig) {
                return {
                    success: false,
                    error: 'No supported domain detected',
                    message: 'No supported domain detected',
                    data: null
                }
            }
            
            if (domainConfig.key === 'MAANG') {
                const result = await MaangValidation.validateCredentials(credentials, mode, targetCredentials);
                // Add domain info to result for structure_filter mode
                if (mode === 'structure_filter' && result.success) {
                    result.data.domain = domainConfig.domain.PRIMARY;
                }
                return result;
            }
            else if (domainConfig.key === 'DEVS') {
                const result = await DevsValidation.validateCredentials(credentials, mode, targetCredentials);
                // Add domain info to result for structure_filter mode
                if (mode === 'structure_filter' && result.success) {
                    result.data.domain = domainConfig.domain.PRIMARY;
                }
                return result;
            }
            
            return {
                success: false,
                error: `No validator available for domain: ${domainConfig.key}`,
                message: `No validator available for domain: ${domainConfig.key}`,
                data: null
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: error.message,
                data: null
            }
        }
    }
}

/**
 * VALIDATION MODES REFERENCE:
 * 
 * 'validate_structure' - Checks if credentials have required structure/fields
 *   - Works with incomplete credentials (returns validation status)
 *   - Returns: credentials object + validation flags
 *   - Use: Structure validation, field presence checking
 * 
 * 'filter' - Filters credentials to only include required fields
 *   - Works with incomplete credentials (filters available fields)
 *   - Returns: filtered credentials object only
 *   - Use: Database storage, API payload preparation
 * 
 * 'match_browser' - Matches provided credentials against current browser data
 *   - Requires complete credentials (early return if missing)
 *   - Returns: credentials object + validation flags
 *   - Use: Login validation, session verification
 * 
 * 'match_provided' - Matches provided credentials against target credentials
 *   - Requires complete credentials (early return if missing)
 *   - Returns: credentials object + validation flags
 *   - Use: Duplicate detection, credential comparison
 * 
 * EXTENSIBILITY:
 * - Add new platform validators by extending domain detection logic
 * - Add new modes by implementing them in platform-specific validators
 * - Maintain consistent return structure: { success, error, message, data }
 * - Use requiredFields constant for field definitions in new platforms
 */
