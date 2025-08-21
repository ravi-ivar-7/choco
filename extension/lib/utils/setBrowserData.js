class SetBrowserData {
    static async setBrowserData(credentials) {
        try {
            // Get all required data from storage in one call
            const storageResult = await StorageUtils.get(['choco_target_tab', 'choco_token', 'choco_selected_team', 'choco_team_config']);
            if (!storageResult.success) {
                return {
                    success: false,
                    error: 'Storage access failed',
                    message: 'Failed to access Chrome storage'
                }
            }
            
            const { choco_target_tab: tabData, choco_token: token, choco_selected_team: selectedTeam, choco_team_config: config } = storageResult.data;
            
            if (!tabData) {
                return {
                    success: false,
                    error: 'No target tab found',
                    message: 'Please select a tab from the extension popup first'
                }
            }
            
            if (!token) {
                return {
                    success: false,
                    error: 'Not authenticated',
                    message: 'Please log in from the profile page'
                }
            }
            
            if (!selectedTeam) {
                return {
                    success: false,
                    error: 'No team selected',
                    message: 'Please select a team from the dashboard'
                }
            }
            
            const { id: tabId, url } = tabData;
            
            const results = [];
            
            // Set cookies if present in credentials
            if (credentials.cookies && Object.keys(credentials.cookies).length > 0) {
                const cookiesArray = Object.values(credentials.cookies);
 
                for (const cookieData of cookiesArray) {
                    try {
                        // Preserve exact domain format from stored cookie data
                        let domain = cookieData.domain;
                        
                        if (!domain) {
                            // Extract domain from URL if no domain specified
                            try {
                                const urlObj = new URL(cookieData.url || url);
                                domain = urlObj.hostname;
                            } catch (e) {
                                // Fallback to config domain
                                domain = config?.domain || 'localhost';
                            }
                        }

                        if (!cookieData.name || cookieData.value === undefined) {
                            throw new Error('Cookie name and value are required');
                        }
                        
                        const cookieToSet = {
                            url: cookieData.url || `https://${domain.startsWith('.') ? domain.substring(1) : domain}`,
                            name: cookieData.name,
                            value: String(cookieData.value),
                            path: cookieData.path || '/',
                            secure: cookieData.secure !== undefined ? cookieData.secure : true,
                            httpOnly: cookieData.httpOnly !== undefined ? cookieData.httpOnly : false,
                            sameSite: cookieData.sameSite || 'lax'
                        }
                        
                        // Only set domain if it starts with dot (subdomain cookie)
                        // For exact domain matches, omit domain to prevent Chrome from adding dot
                        if (domain.startsWith('.')) {
                            cookieToSet.domain = domain;
                        } 
                        
                        if (cookieData.expirationDate) {
                            cookieToSet.expirationDate = cookieData.expirationDate
                        }
                        
                        const result = await chrome.cookies.set(cookieToSet)
                        if (result) {
                            results.push({
                                type: 'cookie',
                                name: cookieData.name,
                                success: true,
                                data: result
                            })
                        } else {
                            results.push({
                                type: 'cookie',
                                name: cookieData.name,
                                success: false,
                                error: 'Cookie set returned null'
                            })
                        }
                    } catch (error) {
                        results.push({
                            type: 'cookie',
                            name: cookieData.name,
                            success: false,
                            error: error.message
                        })
                    }
                }
            }
            
            // Set localStorage and sessionStorage if present in credentials
            if ((credentials.localStorage && Object.keys(credentials.localStorage).length > 0) || 
                (credentials.sessionStorage && Object.keys(credentials.sessionStorage).length > 0)) {
                
                if (!tabId) {
                    results.push({
                        type: 'storage',
                        name: 'localStorage/sessionStorage',
                        success: false,
                        error: 'No valid tab available for script injection'
                    });
                } else {
                    try {
                        const storageResults = await chrome.scripting.executeScript({
                            target: { tabId },
                            func: (localData, sessionData) => {
                                const results = []
                                
                                // Set localStorage
                                if (localData) {
                                    for (const [key, value] of Object.entries(localData)) {
                                        try {
                                            localStorage.setItem(key, value)
                                            results.push({
                                                type: 'localStorage',
                                                name: key,
                                                success: true
                                            })
                                        } catch (error) {
                                            results.push({
                                                type: 'localStorage',
                                                name: key,
                                                success: false,
                                                error: error.message
                                            })
                                        }
                                    }
                                }
                                
                                // Set sessionStorage
                                if (sessionData) {
                                    for (const [key, value] of Object.entries(sessionData)) {
                                        try {
                                            sessionStorage.setItem(key, value)
                                            results.push({
                                                type: 'sessionStorage',
                                                name: key,
                                                success: true
                                            })
                                        } catch (error) {
                                            results.push({
                                                type: 'sessionStorage',
                                                name: key,
                                                success: false,
                                                error: error.message
                                            })
                                        }
                                    }
                                }
                                
                                return results
                            },
                            args: [credentials.localStorage || {}, credentials.sessionStorage || {}]
                        })
                        
                        if (storageResults && storageResults[0] && storageResults[0].result) {
                            results.push(...storageResults[0].result)
                        }
                    } catch (error) {
                        results.push({
                            type: 'storage',
                            name: 'localStorage/sessionStorage',
                            success: false,
                            error: error.message
                        })
                    }
                }
            }
            
            // Set other browser data types if present in credentials
            await SetBrowserData.setExtendedBrowserData(credentials, tabId, results);
            
            // Check if required fields were set successfully based on config
            if (config) {
                const failedRequiredFields = [];
                
                // Check required cookies (config.cookies is JSON string)
                if (config.cookies && config.cookies !== 'none') {
                    try {
                        const requiredCookies = config.cookies === 'full' ? 
                            Object.keys(credentials.cookies || {}) : 
                            JSON.parse(config.cookies);
                        
                        if (Array.isArray(requiredCookies)) {
                            for (const requiredCookie of requiredCookies) {
                                const cookieResult = results.find(r => r.type === 'cookie' && r.name === requiredCookie);
                                if (!cookieResult || !cookieResult.success) {
                                    failedRequiredFields.push(`cookie:${requiredCookie}`);
                                }
                            }
                        }
                    } catch (error) {
                        // JSON parse failed, skip validation
                    }
                }
                
                // Check required localStorage (config.localStorage is JSON string)
                if (config.localStorage && config.localStorage !== 'none') {
                    try {
                        const requiredKeys = config.localStorage === 'full' ? 
                            Object.keys(credentials.localStorage || {}) : 
                            JSON.parse(config.localStorage);
                        
                        if (Array.isArray(requiredKeys)) {
                            for (const requiredKey of requiredKeys) {
                                const localResult = results.find(r => r.type === 'localStorage' && r.name === requiredKey);
                                if (!localResult || !localResult.success) {
                                    failedRequiredFields.push(`localStorage:${requiredKey}`);
                                }
                            }
                        }
                    } catch (error) {
                        // JSON parse failed, skip validation
                    }
                }
                
                // Check required sessionStorage (config.sessionStorage is JSON string)
                if (config.sessionStorage && config.sessionStorage !== 'none') {
                    try {
                        const requiredKeys = config.sessionStorage === 'full' ? 
                            Object.keys(credentials.sessionStorage || {}) : 
                            JSON.parse(config.sessionStorage);
                        
                        if (Array.isArray(requiredKeys)) {
                            for (const requiredKey of requiredKeys) {
                                const sessionResult = results.find(r => r.type === 'sessionStorage' && r.name === requiredKey);
                                if (!sessionResult || !sessionResult.success) {
                                    failedRequiredFields.push(`sessionStorage:${requiredKey}`);
                                }
                            }
                        }
                    } catch (error) {
                        // JSON parse failed, skip validation
                    }
                }
                
                if (failedRequiredFields.length === 0) {
                    return {
                        success: true,
                        error: null,
                        message: 'All required browser data set successfully',
                        data: { results }
                    };
                } else {
                    // Check if we have any successful operations for partial success
                    const successfulResults = results.filter(r => r.success);
                    if (successfulResults.length > 0) {
                        return {
                            success: true, // Still success for partial application
                            error: 'Some required fields failed to set',
                            message: `Partial success: ${successfulResults.length}/${results.length} operations succeeded. Failed required fields: ${failedRequiredFields.join(', ')}`,
                            data: { results, failedRequiredFields }
                        };
                    } else {
                        return {
                            success: false,
                            error: 'Required fields failed to set',
                            message: `Failed to set required fields: ${failedRequiredFields.join(', ')}`,
                            data: { results, failedRequiredFields }
                        };
                    }
                }
            }
            
            // If no config specified, consider success if any data was set
            const successfulResults = results.filter(r => r.success);
            if (successfulResults.length > 0 || results.length === 0) {
                return {
                    success: true,
                    error: null,
                    message: 'Browser data set successfully',
                    data: { results }
                };
            } else {
                return {
                    success: false,
                    error: 'Failed to set browser data',
                    message: 'No data was successfully set',
                    data: { results }
                };
            }
        } catch (error) {
            return {
                success: false,
                error: 'Set data error',
                message: `Failed to set browser data: ${error.message}`,
                data: null
            }
        }
    }

    // Handle setting extended browser data types
    static async setExtendedBrowserData(credentials, tabId, results) {
        try {
            if (credentials.fingerprint && typeof credentials.fingerprint === 'object') {
                if (!tabId) {
                    results.push({
                        type: 'fingerprint',
                        name: 'fingerprint',
                        success: false,
                        error: 'No valid tab available for script injection'
                    });
                } else {
                    try {
                        await chrome.scripting.executeScript({
                            target: { tabId },
                        func: (fingerprintData) => {
                            try {
                                // Override fingerprint properties where possible
                                if (fingerprintData.userAgent) {
                                    Object.defineProperty(navigator, 'userAgent', {
                                        get: () => fingerprintData.userAgent,
                                        configurable: true
                                    });
                                }
                                if (fingerprintData.language) {
                                    Object.defineProperty(navigator, 'language', {
                                        get: () => fingerprintData.language,
                                        configurable: true
                                    });
                                }
                                if (fingerprintData.platform) {
                                    Object.defineProperty(navigator, 'platform', {
                                        get: () => fingerprintData.platform,
                                        configurable: true
                                    });
                                }
                                if (fingerprintData.timezoneOffset !== undefined) {
                                    // Override timezone
                                    const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
                                    Date.prototype.getTimezoneOffset = function() {
                                        return fingerprintData.timezoneOffset;
                                    };
                                }
                            } catch (error) {
                                console.warn('Fingerprint override failed:', error);
                            }
                        },
                        args: [credentials.fingerprint]
                    });
                        results.push({
                            type: 'fingerprint',
                            name: 'fingerprint',
                            success: true,
                            data: credentials.fingerprint
                        });
                    } catch (error) {
                        results.push({
                            type: 'fingerprint',
                            name: 'fingerprint',
                            success: false,
                            error: error.message
                        });
                    }
                }
            }

            // Set geolocation if present - use Chrome geolocation API
            if (credentials.geoLocation && typeof credentials.geoLocation === 'object') {
                if (!tabId) {
                    results.push({
                        type: 'geoLocation',
                        name: 'geoLocation',
                        success: false,
                        error: 'No valid tab available for script injection'
                    });
                } else {
                    try {
                        // First, request geolocation permission if needed
                        const hasPermission = await new Promise((resolve) => {
                            chrome.permissions.contains({
                                permissions: ['geolocation']
                            }, resolve);
                        });
                        
                        if (!hasPermission) {
                            const granted = await new Promise((resolve) => {
                                chrome.permissions.request({
                                    permissions: ['geolocation']
                                }, resolve);
                            });
                            
                            if (!granted) {
                                throw new Error('Geolocation permission denied');
                            }
                        }
                        
                        // Inject script to set geolocation data with proper error handling
                        await chrome.scripting.executeScript({
                            target: { tabId },
                        func: (geoData) => {
                            try {
                                if (!navigator.geolocation) {
                                    throw new Error('Geolocation API not available');
                                }
                                
                                if (typeof geoData.latitude !== 'number' || typeof geoData.longitude !== 'number') {
                                    throw new Error('Invalid latitude/longitude values');
                                }
                                
                                // Validate coordinate ranges
                                if (geoData.latitude < -90 || geoData.latitude > 90) {
                                    throw new Error('Latitude must be between -90 and 90');
                                }
                                if (geoData.longitude < -180 || geoData.longitude > 180) {
                                    throw new Error('Longitude must be between -180 and 180');
                                }
                                
                                const position = {
                                    coords: {
                                        latitude: geoData.latitude,
                                        longitude: geoData.longitude,
                                        accuracy: Math.max(1, geoData.accuracy || 10),
                                        altitude: geoData.altitude || null,
                                        altitudeAccuracy: geoData.altitudeAccuracy || null,
                                        heading: geoData.heading || null,
                                        speed: geoData.speed || null
                                    },
                                    timestamp: Date.now()
                                };
                                
                                // Store original methods
                                const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
                                const originalWatchPosition = navigator.geolocation.watchPosition.bind(navigator.geolocation);
                                const originalClearWatch = navigator.geolocation.clearWatch.bind(navigator.geolocation);
                                
                                // Track active watch IDs
                                const activeWatches = new Map();
                                let nextWatchId = 1;
                                
                                // Override getCurrentPosition
                                navigator.geolocation.getCurrentPosition = function(successCallback, errorCallback, options) {
                                    if (typeof successCallback !== 'function') {
                                        throw new TypeError('Success callback must be a function');
                                    }
                                    
                                    try {
                                        // Simulate realistic delay
                                        setTimeout(() => {
                                            successCallback(position);
                                        }, Math.random() * 100 + 50);
                                    } catch (error) {
                                        if (typeof errorCallback === 'function') {
                                            errorCallback({
                                                code: 2, // POSITION_UNAVAILABLE
                                                message: error.message
                                            });
                                        }
                                    }
                                };
                                
                                // Override watchPosition
                                navigator.geolocation.watchPosition = function(successCallback, errorCallback, options) {
                                    if (typeof successCallback !== 'function') {
                                        throw new TypeError('Success callback must be a function');
                                    }
                                    
                                    const watchId = nextWatchId++;
                                    
                                    try {
                                        // Initial position callback
                                        setTimeout(() => {
                                            successCallback(position);
                                        }, Math.random() * 100 + 50);
                                        
                                        // Set up periodic updates if requested
                                        const interval = setInterval(() => {
                                            if (activeWatches.has(watchId)) {
                                                successCallback(position);
                                            } else {
                                                clearInterval(interval);
                                            }
                                        }, (options && options.maximumAge) || 60000);
                                        
                                        activeWatches.set(watchId, interval);
                                        
                                    } catch (error) {
                                        if (typeof errorCallback === 'function') {
                                            errorCallback({
                                                code: 2, // POSITION_UNAVAILABLE
                                                message: error.message
                                            });
                                        }
                                    }
                                    
                                    return watchId;
                                };
                                
                                // Override clearWatch
                                navigator.geolocation.clearWatch = function(watchId) {
                                    if (activeWatches.has(watchId)) {
                                        clearInterval(activeWatches.get(watchId));
                                        activeWatches.delete(watchId);
                                    }
                                };
                                
                                // Store cleanup function for potential restoration
                                window.chocoGeolocationCleanup = function() {
                                    activeWatches.forEach(interval => clearInterval(interval));
                                    activeWatches.clear();
                                    navigator.geolocation.getCurrentPosition = originalGetCurrentPosition;
                                    navigator.geolocation.watchPosition = originalWatchPosition;
                                    navigator.geolocation.clearWatch = originalClearWatch;
                                };
                                
                            } catch (error) {
                                console.error('Geolocation setup failed:', error);
                                throw error;
                            }
                        },
                        args: [credentials.geoLocation]
                        });
                        results.push({
                            type: 'geoLocation',
                            name: 'geolocation',
                            success: true,
                            data: credentials.geoLocation
                        });
                    } catch (error) {
                        results.push({
                            type: 'geoLocation',
                            name: 'geolocation',
                            success: false,
                            error: error.message
                        });
                    }
                }
            }


        } catch (error) {
            results.push({
                type: 'extended',
                name: 'extended_data',
                success: false,
                error: `Extended data setting failed: ${error.message}`
            });
        }
    }
}

// Make available for both Node.js and browser contexts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SetBrowserData;
}

// Make available globally for browser/content script context
if (typeof window !== 'undefined') {
    window.SetBrowserData = SetBrowserData;
}
