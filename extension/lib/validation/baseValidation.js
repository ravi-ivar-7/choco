class BaseValidation {

    static async validateCredentials(credentials, mode, targetCredentials = null, config = null) {
        try {
            if (!mode || !credentials) {
                return {
                    success: false,
                    error: 'Missing parameters',
                    message: 'Mode and credentials are required',
                    data: null
                }
            }

            if (mode === 'match_config') {
                return this.matchConfig(credentials, config)
            } else if (mode === 'match_provided') {
                return this.matchProvided(credentials, targetCredentials, config)
            } else {
                return {
                    success: false,
                    error: 'Invalid mode',
                    message: 'Validation mode not supported',
                    data: null
                }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Validation error',
                message: error.message,
                data: null
            }
        }
    }

    static matchConfig(credentials, config) {
        try {

            if (!config) {
                return {
                    success: false,
                    error: 'No config provided',
                    message: 'Configuration is required for validation',
                    data: null
                }
            }

            const filtered = {
                cookies: {},
                localStorage: {},
                sessionStorage: {},
                fingerprint: null,
                geoLocation: null,
                ipAddress: null,
                userAgent: null,
                platform: null,
                browser: null
            }

            // Helper function to parse config values
            const parseConfigValue = (configValue) => {
                if (!configValue || configValue === 'none') return null;
                if (configValue === 'full') return 'full';

                try {
                    const parsed = JSON.parse(configValue);
                    return Array.isArray(parsed) ? parsed : null;
                } catch (e) {
                    return null;
                }
            }

            // Filter cookies based on config
            const cookieConfig = parseConfigValue(config.cookies);
            if (cookieConfig === 'full') {
                filtered.cookies = credentials.cookies || {};
            } else if (Array.isArray(cookieConfig)) {
                const cookieData = credentials.cookies || {};
                cookieConfig.forEach(key => {
                    if (cookieData[key] !== undefined) {
                        filtered.cookies[key] = cookieData[key];
                    }
                });
            }

            // Filter localStorage based on config
            const localStorageConfig = parseConfigValue(config.localStorage);
            if (localStorageConfig === 'full') {
                filtered.localStorage = credentials.localStorage || {};
            } else if (Array.isArray(localStorageConfig)) {
                const localData = credentials.localStorage || {};
                localStorageConfig.forEach(key => {
                    if (localData[key] !== undefined) {
                        filtered.localStorage[key] = localData[key];
                    }
                });
            }

            // Filter sessionStorage based on config
            const sessionStorageConfig = parseConfigValue(config.sessionStorage);
            if (sessionStorageConfig === 'full') {
                filtered.sessionStorage = credentials.sessionStorage || {};
            } else if (Array.isArray(sessionStorageConfig)) {
                const sessionData = credentials.sessionStorage || {};
                sessionStorageConfig.forEach(key => {
                    if (sessionData[key] !== undefined) {
                        filtered.sessionStorage[key] = sessionData[key];
                    }
                });
            }

            // Validate that ALL configured fields are present and have valid data
            const missingFields = [];
            const configuredFields = [];

            // Track detailed field validation results
            const fieldValidationDetails = {};

            // Check complex fields (full/none/keyvalues)
            if (config.cookies && config.cookies !== 'none') {
                configuredFields.push('cookies');
                const cookieConfig = parseConfigValue(config.cookies);
                if (cookieConfig === 'full') {
                    if (!credentials.cookies) {
                        missingFields.push('cookies');
                        fieldValidationDetails.cookies = { status: 'missing', reason: 'cookies field is null/undefined', expected: 'full' };
                    } else {
                        fieldValidationDetails.cookies = { status: 'present', keys: Object.keys(credentials.cookies), expected: 'full' };
                    }
                } else if (Array.isArray(cookieConfig)) {
                    const missingKeys = [];
                    const presentKeys = [];
                    cookieConfig.forEach(key => {
                        if (credentials.cookies && credentials.cookies[key] !== undefined) {
                            presentKeys.push(key);
                        } else {
                            missingKeys.push(key);
                        }
                    });
                    if (missingKeys.length > 0) {
                        missingFields.push('cookies');
                        fieldValidationDetails.cookies = {
                            status: 'partial',
                            expected: cookieConfig,
                            missing: missingKeys,
                            present: presentKeys,
                            reason: `Missing cookie keys: ${missingKeys.join(', ')}`
                        };
                    } else {
                        fieldValidationDetails.cookies = {
                            status: 'present',
                            expected: cookieConfig,
                            present: presentKeys
                        };
                    }
                }
            }
            if (config.localStorage && config.localStorage !== 'none') {
                configuredFields.push('localStorage');
                const localStorageConfig = parseConfigValue(config.localStorage);
                if (localStorageConfig === 'full') {
                    if (!credentials.localStorage) {
                        missingFields.push('localStorage');
                        fieldValidationDetails.localStorage = { status: 'missing', reason: 'localStorage field is null/undefined', expected: 'full' };
                    } else {
                        fieldValidationDetails.localStorage = { status: 'present', keys: Object.keys(credentials.localStorage), expected: 'full' };
                    }
                } else if (Array.isArray(localStorageConfig)) {
                    const missingKeys = [];
                    const presentKeys = [];
                    localStorageConfig.forEach(key => {
                        if (credentials.localStorage && credentials.localStorage[key] !== undefined) {
                            presentKeys.push(key);
                        } else {
                            missingKeys.push(key);
                        }
                    });
                    if (missingKeys.length > 0) {
                        missingFields.push('localStorage');
                        fieldValidationDetails.localStorage = {
                            status: 'partial',
                            expected: localStorageConfig,
                            missing: missingKeys,
                            present: presentKeys,
                            reason: `Missing localStorage keys: ${missingKeys.join(', ')}`
                        };
                    } else {
                        fieldValidationDetails.localStorage = {
                            status: 'present',
                            expected: localStorageConfig,
                            present: presentKeys
                        };
                    }
                }
            }
            if (config.sessionStorage && config.sessionStorage !== 'none') {
                configuredFields.push('sessionStorage');
                const sessionStorageConfig = parseConfigValue(config.sessionStorage);
                if (sessionStorageConfig === 'full') {
                    if (!credentials.sessionStorage) {
                        missingFields.push('sessionStorage');
                        fieldValidationDetails.sessionStorage = { status: 'missing', reason: 'sessionStorage field is null/undefined', expected: 'full' };
                    } else {
                        fieldValidationDetails.sessionStorage = { status: 'present', keys: Object.keys(credentials.sessionStorage), expected: 'full' };
                    }
                } else if (Array.isArray(sessionStorageConfig)) {
                    const missingKeys = [];
                    const presentKeys = [];
                    sessionStorageConfig.forEach(key => {
                        if (credentials.sessionStorage && credentials.sessionStorage[key] !== undefined) {
                            presentKeys.push(key);
                        } else {
                            missingKeys.push(key);
                        }
                    });
                    if (missingKeys.length > 0) {
                        missingFields.push('sessionStorage');
                        fieldValidationDetails.sessionStorage = {
                            status: 'partial',
                            expected: sessionStorageConfig,
                            missing: missingKeys,
                            present: presentKeys,
                            reason: `Missing sessionStorage keys: ${missingKeys.join(', ')}`
                        };
                    } else {
                        fieldValidationDetails.sessionStorage = {
                            status: 'present',
                            expected: sessionStorageConfig,
                            present: presentKeys
                        };
                    }
                }
            }

            // Extended field validation - disabled, will work only in home controller not in background

            // const extendedValidationResult = ExtendedValidation.validateExtendedFields(
            //     credentials, config, filtered, [], [], {}
            // );

            // if (extendedValidationResult.success) {
            //     // Update filtered data with extended fields
            //     Object.assign(filtered, extendedValidationResult.filtered);
            //     // Merge validation results
            //     extendedValidationResult.missingFields.forEach(field => {
            //         if (!missingFields.includes(field)) {
            //             missingFields.push(field);
            //         }
            //     });
            //     extendedValidationResult.configuredFields.forEach(field => {
            //         if (!configuredFields.includes(field)) {
            //             configuredFields.push(field);
            //         }
            //     });
            //     Object.assign(fieldValidationDetails, extendedValidationResult.fieldValidationDetails);
            // }

            const hasAllRequiredFields = missingFields.length === 0;
            const presentFields = configuredFields.filter(field => !missingFields.includes(field));

            // Determine validation status
            let validationStatus;
            if (configuredFields.length === 0) {
                validationStatus = 'none';
            } else if (hasAllRequiredFields) {
                validationStatus = 'full';
            } else if (presentFields.length > 0) {
                validationStatus = 'partial';
            } else {
                validationStatus = 'none';
            }


            console.log('final validate detials', fieldValidationDetails)
            return {
                success: hasAllRequiredFields,
                error: hasAllRequiredFields ? null : 'Missing required fields',
                message: hasAllRequiredFields
                    ? `All configured fields present: ${configuredFields.join(', ')}`
                    : `Missing required fields: ${missingFields.join(', ')}. Present fields: ${presentFields.join(', ')}`,
                data: {
                    credentials: filtered,
                    config: config,
                    validation: {
                        status: validationStatus,
                        missing: missingFields,
                        present: presentFields,
                        detailedResults: fieldValidationDetails
                    }
                }
            }
        } catch (error) {

            return {
                success: false,
                error: 'Config validation error',
                message: error.message,
                data: {
                    credentials: null,
                    config: config,
                    validation: {
                        status: 'error',
                        missing: [],
                        present: [],
                        detailedResults: {}
                    }
                }
            }
        }
    }

    static matchProvided(credentials, targetCredentials, config) {
        try {
            if (!targetCredentials) {
                return {
                    success: false,
                    error: 'Target credentials required for match_provided mode',
                    data: null
                }
            }

            // For match_provided mode, do EXACT matching without config filtering
            const results = this.compareCredentialsExact(credentials, targetCredentials)

            return {
                success: results.isMatch,
                error: results.isMatch ? null : 'Credentials do not match provided data exactly',
                message: results.isMatch ? 'Credentials match provided data exactly' : 'Credentials validation failed - exact match required',
                data: {
                    validationResults: results,
                    config: config
                }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Provided match error',
                message: error.message,
                data: null
            }
        }
    }

    static compareCredentialsExact(credentials, targetCredentials) {
        const results = {
            cookies: { match: false, details: {} },
            localStorage: { match: false, details: {} },
            sessionStorage: { match: false, details: {} },
            fingerprint: { match: false, details: {} },
            geoLocation: { match: false, details: {} },
            ipAddress: { match: false, details: {} },
            userAgent: { match: false, details: {} },
            platform: { match: false, details: {} },
            browser: { match: false, details: {} },
            isMatch: false
        }

        try {
            // Exact comparison for all fields
            results.cookies.match = JSON.stringify(credentials.cookies || {}) === JSON.stringify(targetCredentials.cookies || {});
            results.localStorage.match = JSON.stringify(credentials.localStorage || {}) === JSON.stringify(targetCredentials.localStorage || {});
            results.sessionStorage.match = JSON.stringify(credentials.sessionStorage || {}) === JSON.stringify(targetCredentials.sessionStorage || {});
            results.fingerprint.match = JSON.stringify(credentials.fingerprint || null) === JSON.stringify(targetCredentials.fingerprint || null);
            results.geoLocation.match = JSON.stringify(credentials.geoLocation || null) === JSON.stringify(targetCredentials.geoLocation || null);
            results.ipAddress.match = (credentials.ipAddress || null) === (targetCredentials.ipAddress || null);
            results.userAgent.match = (credentials.userAgent || null) === (targetCredentials.userAgent || null);
            results.platform.match = (credentials.platform || null) === (targetCredentials.platform || null);
            results.browser.match = (credentials.browser || null) === (targetCredentials.browser || null);

            // Overall match if ALL fields match exactly
            results.isMatch = results.cookies.match &&
                results.localStorage.match &&
                results.sessionStorage.match &&
                results.fingerprint.match &&
                results.geoLocation.match &&
                results.ipAddress.match &&
                results.userAgent.match &&
                results.platform.match &&
                results.browser.match;

            return results
        } catch (error) {
            console.error('Error comparing credentials exactly:', error)
            return results
        }
    }

    static compareStorageData(sourceData, targetData, keys) {
        const result = {
            match: false,
            details: {}
        }

        try {
            let matchCount = 0
            const totalKeys = keys.length

            keys.forEach(key => {
                const sourceValue = sourceData[key]
                const targetValue = targetData[key]

                if (sourceValue !== undefined && targetValue !== undefined) {
                    const matches = this.compareValues(sourceValue, targetValue)
                    result.details[key] = {
                        match: matches,
                        source: sourceValue,
                        target: targetValue
                    }
                    if (matches) matchCount++
                } else {
                    result.details[key] = {
                        match: false,
                        source: sourceValue,
                        target: targetValue,
                        reason: 'Missing in source or target'
                    }
                }
            })

            // Match if at least 70% of keys match
            result.match = totalKeys > 0 && (matchCount / totalKeys) >= 0.7

            return result
        } catch (error) {
            console.error('Error comparing storage data:', error)
            return result
        }
    }

    static compareValues(value1, value2) {
        try {
            // Direct equality check
            if (value1 === value2) return true

            // String comparison (case-insensitive for some cases)
            if (typeof value1 === 'string' && typeof value2 === 'string') {
                return value1.toLowerCase() === value2.toLowerCase()
            }

            // Object comparison
            if (typeof value1 === 'object' && typeof value2 === 'object') {
                return JSON.stringify(value1) === JSON.stringify(value2)
            }

            return false
        } catch (error) {
            return false
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseValidation
}

// Make available globally for browser extension
if (typeof window !== 'undefined') {
    window.BaseValidation = BaseValidation
}
