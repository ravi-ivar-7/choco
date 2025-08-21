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

            // Handle fingerprint - COMPLEX FIELD (full/none/keyvalues)
            const fingerprintConfig = parseConfigValue(config.fingerprint);
            if (fingerprintConfig === 'full') {
                filtered.fingerprint = credentials.fingerprint || null;
            } else if (Array.isArray(fingerprintConfig)) {
                const fingerprintData = credentials.fingerprint || {};
                const filteredFingerprint = {};
                fingerprintConfig.forEach(key => {
                    if (fingerprintData[key] !== undefined) {
                        filteredFingerprint[key] = fingerprintData[key];
                    }
                });
                filtered.fingerprint = Object.keys(filteredFingerprint).length > 0 ? filteredFingerprint : null;
            }


            // Handle geoLocation - COMPLEX FIELD (full/none/keyvalues)
            const geoLocationConfig = parseConfigValue(config.geoLocation);
            if (geoLocationConfig === 'full') {
                filtered.geoLocation = credentials.geoLocation || null;
            } else if (Array.isArray(geoLocationConfig)) {
                const geoLocationData = credentials.geoLocation || {};
                const filteredGeoLocation = {};
                geoLocationConfig.forEach(key => {
                    if (geoLocationData[key] !== undefined) {
                        filteredGeoLocation[key] = geoLocationData[key];
                    }
                });
                filtered.geoLocation = Object.keys(filteredGeoLocation).length > 0 ? filteredGeoLocation : null;
            }

            // Handle simple fields - SIMPLE FIELDS (full/none only)
            if (config.ipAddress === 'full') {
                filtered.ipAddress = credentials.ipAddress || null;
            }
            if (config.userAgent === 'full') {
                filtered.userAgent = credentials.userAgent || null;
            }
            if (config.platform === 'full') {
                filtered.platform = credentials.platform || null;
            }
            if (config.browser === 'full') {
                filtered.browser = credentials.browser || null;
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
            if (config.fingerprint && config.fingerprint !== 'none') {
                configuredFields.push('fingerprint');
                const fingerprintConfig = parseConfigValue(config.fingerprint);
                if (fingerprintConfig === 'full') {
                    if (!credentials.fingerprint) {
                        missingFields.push('fingerprint');
                        fieldValidationDetails.fingerprint = { status: 'missing', reason: 'No fingerprint data found', expected: 'full' };
                    } else {
                        fieldValidationDetails.fingerprint = { status: 'present', keys: Object.keys(credentials.fingerprint), expected: 'full' };
                    }
                } else if (Array.isArray(fingerprintConfig)) {
                    const missingKeys = [];
                    const presentKeys = [];
                    fingerprintConfig.forEach(key => {
                        if (credentials.fingerprint && credentials.fingerprint[key] !== undefined) {
                            presentKeys.push(key);
                        } else {
                            missingKeys.push(key);
                        }
                    });
                    if (missingKeys.length > 0) {
                        missingFields.push('fingerprint');
                        fieldValidationDetails.fingerprint = {
                            status: 'partial',
                            expected: fingerprintConfig,
                            missing: missingKeys,
                            present: presentKeys,
                            reason: `Missing fingerprint keys: ${missingKeys.join(', ')}`
                        };
                    } else {
                        fieldValidationDetails.fingerprint = {
                            status: 'present',
                            expected: fingerprintConfig,
                            present: presentKeys
                        };
                    }
                }
            }
            if (config.geoLocation && config.geoLocation !== 'none') {
                configuredFields.push('geoLocation');
                const geoLocationConfig = parseConfigValue(config.geoLocation);
                if (geoLocationConfig === 'full') {
                    if (!credentials.geoLocation) {
                        missingFields.push('geoLocation');
                        fieldValidationDetails.geoLocation = { status: 'missing', reason: 'No geoLocation data found', expected: 'full' };
                    } else {
                        fieldValidationDetails.geoLocation = { status: 'present', keys: Object.keys(credentials.geoLocation), expected: 'full' };
                    }
                } else if (Array.isArray(geoLocationConfig)) {
                    const missingKeys = [];
                    const presentKeys = [];
                    geoLocationConfig.forEach(key => {
                        if (credentials.geoLocation && credentials.geoLocation[key] !== undefined) {
                            presentKeys.push(key);
                        } else {
                            missingKeys.push(key);
                        }
                    });
                    if (missingKeys.length > 0) {
                        missingFields.push('geoLocation');
                        fieldValidationDetails.geoLocation = {
                            status: 'partial',
                            expected: geoLocationConfig,
                            missing: missingKeys,
                            present: presentKeys,
                            reason: `Missing geoLocation keys: ${missingKeys.join(', ')}`
                        };
                    } else {
                        fieldValidationDetails.geoLocation = {
                            status: 'present',
                            expected: geoLocationConfig,
                            present: presentKeys
                        };
                    }
                }
            }

            // Check simple fields (full/none only)
            if (config.ipAddress === 'full') {
                configuredFields.push('ipAddress');
                // Always pass validation - backend will handle IP collection if null
                fieldValidationDetails.ipAddress = {
                    status: credentials.ipAddress ? 'present' : 'unavailable_fallback_backend',
                    value: credentials.ipAddress,
                    expected: 'full',
                    reason: credentials.ipAddress ? null : 'Extension IP unavailable - backend will collect from request'
                };

            }
            if (config.userAgent === 'full') {
                configuredFields.push('userAgent');
                if (!filtered.userAgent) {
                    missingFields.push('userAgent');
                    fieldValidationDetails.userAgent = { status: 'missing', reason: 'No user agent found', expected: 'full' };
                } else {
                    fieldValidationDetails.userAgent = { status: 'present', value: filtered.userAgent, expected: 'full' };
                }
            }
            if (config.platform === 'full') {
                configuredFields.push('platform');
                if (!filtered.platform) {
                    missingFields.push('platform');
                    fieldValidationDetails.platform = { status: 'missing', reason: 'No platform found', expected: 'full' };
                } else {
                    fieldValidationDetails.platform = { status: 'present', value: filtered.platform, expected: 'full' };
                }
            }
            if (config.browser === 'full') {
                configuredFields.push('browser');
                if (!filtered.browser) {
                    missingFields.push('browser');
                    fieldValidationDetails.browser = { status: 'missing', reason: 'No browser found', expected: 'full' };
                } else {
                    fieldValidationDetails.browser = { status: 'present', value: filtered.browser, expected: 'full' };
                }
            }

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
                data: null
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
