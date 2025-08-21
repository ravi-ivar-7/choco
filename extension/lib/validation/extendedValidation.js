class ExtendedValidation {

    static validateExtendedFields(credentials, config, filtered, missingFields, configuredFields, fieldValidationDetails) {
        try {
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

            // Handle fingerprint - COMPLEX FIELD (full/none/keyvalues)
            if (config.fingerprint && config.fingerprint !== 'none') {
                configuredFields.push('fingerprint');
                const fingerprintConfig = parseConfigValue(config.fingerprint);
                if (fingerprintConfig === 'full') {
                    filtered.fingerprint = credentials.fingerprint || null;
                    if (!credentials.fingerprint) {
                        missingFields.push('fingerprint');
                        fieldValidationDetails.fingerprint = { status: 'missing', reason: 'No fingerprint data found', expected: 'full' };
                    } else {
                        fieldValidationDetails.fingerprint = { status: 'present', keys: Object.keys(credentials.fingerprint), expected: 'full' };
                    }
                } else if (Array.isArray(fingerprintConfig)) {
                    const fingerprintData = credentials.fingerprint || {};
                    const filteredFingerprint = {};
                    const missingKeys = [];
                    const presentKeys = [];
                    
                    fingerprintConfig.forEach(key => {
                        if (fingerprintData[key] !== undefined) {
                            filteredFingerprint[key] = fingerprintData[key];
                            presentKeys.push(key);
                        } else {
                            missingKeys.push(key);
                        }
                    });
                    
                    filtered.fingerprint = Object.keys(filteredFingerprint).length > 0 ? filteredFingerprint : null;
                    
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

            // Handle geoLocation - COMPLEX FIELD (full/none/keyvalues)
            if (config.geoLocation && config.geoLocation !== 'none') {
                configuredFields.push('geoLocation');
                const geoLocationConfig = parseConfigValue(config.geoLocation);
                if (geoLocationConfig === 'full') {
                    filtered.geoLocation = credentials.geoLocation || null;
                    if (!credentials.geoLocation) {
                        missingFields.push('geoLocation');
                        fieldValidationDetails.geoLocation = { status: 'missing', reason: 'No geoLocation data found', expected: 'full' };
                    } else {
                        fieldValidationDetails.geoLocation = { status: 'present', keys: Object.keys(credentials.geoLocation), expected: 'full' };
                    }
                } else if (Array.isArray(geoLocationConfig)) {
                    const geoLocationData = credentials.geoLocation || {};
                    const filteredGeoLocation = {};
                    const missingKeys = [];
                    const presentKeys = [];
                    
                    geoLocationConfig.forEach(key => {
                        if (geoLocationData[key] !== undefined) {
                            filteredGeoLocation[key] = geoLocationData[key];
                            presentKeys.push(key);
                        } else {
                            missingKeys.push(key);
                        }
                    });
                    
                    filtered.geoLocation = Object.keys(filteredGeoLocation).length > 0 ? filteredGeoLocation : null;
                    
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

            // Handle simple fields - SIMPLE FIELDS (full/none only)
            if (config.ipAddress === 'full') {
                configuredFields.push('ipAddress');
                filtered.ipAddress = credentials.ipAddress || null;
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
                filtered.userAgent = credentials.userAgent || null;
                if (!filtered.userAgent) {
                    missingFields.push('userAgent');
                    fieldValidationDetails.userAgent = { status: 'missing', reason: 'No user agent found', expected: 'full' };
                } else {
                    fieldValidationDetails.userAgent = { status: 'present', value: filtered.userAgent, expected: 'full' };
                }
            }

            if (config.platform === 'full') {
                configuredFields.push('platform');
                filtered.platform = credentials.platform || null;
                if (!filtered.platform) {
                    missingFields.push('platform');
                    fieldValidationDetails.platform = { status: 'missing', reason: 'No platform found', expected: 'full' };
                } else {
                    fieldValidationDetails.platform = { status: 'present', value: filtered.platform, expected: 'full' };
                }
            }

            if (config.browser === 'full') {
                configuredFields.push('browser');
                filtered.browser = credentials.browser || null;
                if (!filtered.browser) {
                    missingFields.push('browser');
                    fieldValidationDetails.browser = { status: 'missing', reason: 'No browser found', expected: 'full' };
                } else {
                    fieldValidationDetails.browser = { status: 'present', value: filtered.browser, expected: 'full' };
                }
            }

            return {
                success: true,
                filtered,
                missingFields,
                configuredFields,
                fieldValidationDetails
            };

        } catch (error) {
            console.error('[ExtendedValidation] Error in validateExtendedFields:', error);
            console.error('[ExtendedValidation] Error stack:', error.stack);
            return {
                success: false,
                error: error.message,
                filtered: filtered || {},
                missingFields: missingFields || [],
                configuredFields: configuredFields || [],
                fieldValidationDetails: fieldValidationDetails || {}
            };
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExtendedValidation
}

// Make available globally for browser extension
if (typeof window !== 'undefined') {
    window.ExtendedValidation = ExtendedValidation
}
