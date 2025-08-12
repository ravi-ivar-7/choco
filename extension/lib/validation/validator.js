class CredentialValidator {
    static async validateCredentials(credentials, mode = 'match_browser', targetCredentials = null) {
        try {
            const activeTabResult = await BrowserDataCollector.getActiveTab()
            const currentTab = activeTabResult.success ? activeTabResult.data : null
            const url = currentTab?.url || Constants.DOMAINS.MAIN.URL
            const domain = new URL(url).hostname
            
            if (domain.includes(Constants.DOMAINS.MAIN.PRIMARY)) {
                return await MaangValidation.validateCredentials(credentials, mode, targetCredentials)
            }
            
            return {
                success: false,
                platform: 'unknown',
                error: `No validator available for domain: ${domain}`,
                data: null
            }
        } catch (error) {
            return {
                success: false,
                platform: 'unknown',
                error: error.message,
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
 * - Maintain consistent return structure: { success, platform, message, data }
 * - Use requiredFields constant for field definitions in new platforms
 */
