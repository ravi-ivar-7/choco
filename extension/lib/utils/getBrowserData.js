class GetBrowserData {

    static isContentScriptContext() {
        return typeof window !== 'undefined' && typeof navigator !== 'undefined';
    }

    // Safe navigator access with fallbacks


    static async getBrowserData() {
        try {
            // Get all required data from storage in one call
            const storageResult = await StorageUtils.get(['choco_target_tab', 'choco_token', 'choco_selected_team', 'choco_team_config']);
            
            if (!storageResult.success) {
                return {
                    success: false,
                    error: 'Storage access failed',
                    message: 'Failed to access Chrome storage',
                    data: null
                }
            }
            
            const { choco_target_tab: tabData, choco_token: token, choco_selected_team: selectedTeam, choco_team_config: config } = storageResult.data;
            
            if (!tabData) {
                return {
                    success: false,
                    error: 'No target tab found',
                    message: 'Please select a tab from the extension popup first',
                    data: null
                }
            }
            
            if (!token) {
                return {
                    success: false,
                    error: 'Not authenticated',
                    message: 'Please log in from the profile page',
                    data: null
                }
            }
            
            if (!selectedTeam) {
                return {
                    success: false,
                    error: 'No account selected',
                    message: 'Please select a account from the extnesion navbar dropdown',
                    data: null
                }
            }
            
            const tabId = tabData.id;
            const url = config?.domain ? `https://${config.domain}` : tabData.url;
            
            const isContentScript = GetBrowserData.isContentScriptContext();
            
            const browserData = {};
            
            // Collect cookies
            if (config?.cookies === 'full') {
                browserData.cookies = await GetBrowserData.collectCookies(url);
            } else if (config?.cookies === 'none' || !config?.cookies) {
                browserData.cookies = {};
            } else {
                const allCookies = await GetBrowserData.collectCookies(url);
                browserData.cookies = {};
                try {
                    const requiredCookies = JSON.parse(config.cookies);
                    if (Array.isArray(requiredCookies)) {
                        requiredCookies.forEach(cookieName => {
                            if (allCookies[cookieName]) {
                                browserData.cookies[cookieName] = allCookies[cookieName];
                            }
                        });
                    }
                } catch (error) {
                    browserData.cookies = {};
                }
            }
            
            // Collect localStorage
            if (config?.localStorage === 'full') {
                const storageData = await GetBrowserData.collectStorageData(tabId);
                browserData.localStorage = storageData.localStorage || {};
            } else if (config?.localStorage === 'none' || !config?.localStorage) {
                browserData.localStorage = {};
            } else {
                try {
                    const requiredKeys = JSON.parse(config.localStorage);
                    if (Array.isArray(requiredKeys)) {
                        const storageData = await GetBrowserData.collectStorageData(tabId);
                        const filteredLocalStorage = {};
                        requiredKeys.forEach(key => {
                            if (storageData.localStorage && storageData.localStorage[key] !== undefined) {
                                filteredLocalStorage[key] = storageData.localStorage[key];
                            }
                        });
                        browserData.localStorage = filteredLocalStorage;
                    } else {
                        browserData.localStorage = {};
                    }
                } catch (error) {
                    browserData.localStorage = {};
                }
            }
            
            // Collect sessionStorage
            if (config?.sessionStorage === 'full') {
                const storageData = await GetBrowserData.collectStorageData(tabId);
                browserData.sessionStorage = storageData.sessionStorage || {};
            } else if (config?.sessionStorage === 'none' || !config?.sessionStorage) {
                browserData.sessionStorage = {};
            } else {
                try {
                    const requiredKeys = JSON.parse(config.sessionStorage);
                    if (Array.isArray(requiredKeys)) {
                        const storageData = await GetBrowserData.collectStorageData(tabId);
                        const filteredSessionStorage = {};
                        requiredKeys.forEach(key => {
                            if (storageData.sessionStorage && storageData.sessionStorage[key] !== undefined) {
                                filteredSessionStorage[key] = storageData.sessionStorage[key];
                            }
                        });
                        browserData.sessionStorage = filteredSessionStorage;
                    } else {
                        browserData.sessionStorage = {};
                    }
                } catch (error) {
                    browserData.sessionStorage = {};
                }
            }
            
            
            // Collect fingerprint
            if (config?.fingerprint === 'full') {
                browserData.fingerprint = isContentScript ? await GetBrowserData.collectFingerprint() : null;
            } else if (config?.fingerprint === 'none' || !config?.fingerprint) {
                browserData.fingerprint = null;
            } else {
                try {
                    const requiredFields = JSON.parse(config.fingerprint);
                    if (Array.isArray(requiredFields)) {
                        const allFingerprint = isContentScript ? await GetBrowserData.collectFingerprint() : null;
                        if (allFingerprint) {
                            const filteredFingerprint = {};
                            requiredFields.forEach(field => {
                                if (allFingerprint[field] !== undefined) {
                                    filteredFingerprint[field] = allFingerprint[field];
                                }
                            });
                            browserData.fingerprint = filteredFingerprint;
                        } else {
                            browserData.fingerprint = null;
                        }
                    } else {
                        browserData.fingerprint = null;
                    }
                } catch (error) {
                    browserData.fingerprint = null;
                }
            }
            
            // Collect geoLocation
            if (config?.geoLocation === 'full') {
                browserData.geoLocation = isContentScript ? await GetBrowserData.collectGeoLocation() : null;
            } else if (config?.geoLocation === 'none' || !config?.geoLocation) {
                browserData.geoLocation = null;
            } else {
                try {
                    const requiredFields = JSON.parse(config.geoLocation);
                    if (Array.isArray(requiredFields)) {
                        const allGeoLocation = isContentScript ? await GetBrowserData.collectGeoLocation() : null;
                        if (allGeoLocation) {
                            const filteredGeoLocation = {};
                            requiredFields.forEach(field => {
                                if (allGeoLocation[field] !== undefined) {
                                    filteredGeoLocation[field] = allGeoLocation[field];
                                }
                            });
                            browserData.geoLocation = filteredGeoLocation;
                        } else {
                            browserData.geoLocation = null;
                        }
                    } else {
                        browserData.geoLocation = null;
                    }
                } catch (error) {
                    browserData.geoLocation = null;
                }
            }
            
            // Collect simple fields  
            if (config?.ipAddress === 'full') {
                const collectedIP = await GetBrowserData.collectIPAddress();
                browserData.ipAddress = collectedIP || 'unavailable_fallback_backend';
            } else {
                browserData.ipAddress = null;
            }
            browserData.userAgent = config?.userAgent === 'full' ? navigator?.userAgent || 'Unknown' : null;
            browserData.platform = config?.platform === 'full' ? navigator?.platform || 'Unknown' : null;
            browserData.browser = config?.browser === 'full' ? GetBrowserData.collectBrowserInfo() : null;

            return {
                success: true,
                error: null,
                message: 'Browser data collected successfully',
                data: browserData
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: `Failed to collect browser data: ${error.message}`,
                data: null
            }
        }
    }

    // All the existing collection methods from BrowserDataCollector
    static async collectCookies(url) {
        try {
            if (!chrome?.cookies) {
                return {};
            }
            
            const cookies = await chrome.cookies.getAll({ url });
            const cookieData = {};
            
            cookies.forEach(cookie => {
                cookieData[cookie.name] = {
                    name: cookie.name,
                    value: cookie.value,
                    domain: cookie.domain,
                    path: cookie.path,
                    secure: cookie.secure,
                    httpOnly: cookie.httpOnly,
                    sameSite: cookie.sameSite,
                    expirationDate: cookie.expirationDate
                };
            });
            
            return cookieData;
        } catch (error) {
            console.warn('Failed to collect cookies:', error);
            return {};
        }
    }

    static async collectStorageData(tabId) {
        try {
            if (!chrome?.scripting) {
                return { localStorage: {}, sessionStorage: {} };
            }
            
            const results = await chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                    try {
                        const localData = {};
                        const sessionData = {};
                        
                        // Collect localStorage
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            if (key) {
                                localData[key] = localStorage.getItem(key);
                            }
                        }
                        
                        // Collect sessionStorage
                        for (let i = 0; i < sessionStorage.length; i++) {
                            const key = sessionStorage.key(i);
                            if (key) {
                                sessionData[key] = sessionStorage.getItem(key);
                            }
                        }
                        
                        return { localStorage: localData, sessionStorage: sessionData };
                    } catch (error) {
                        return { localStorage: {}, sessionStorage: {}, error: error.message };
                    }
                }
            });
            
            return results[0]?.result || { localStorage: {}, sessionStorage: {} };
        } catch (error) {
            console.warn('Failed to collect storage data:', error);
            return { localStorage: {}, sessionStorage: {} };
        }
    }


    static collectBrowserInfo() {
        try {
            const userAgent = navigator?.userAgent || 'Unknown';
            let browserName = 'Unknown';
            let browserVersion = 'Unknown';
            
            if (userAgent.includes('Chrome')) {
                browserName = 'Chrome';
                const match = userAgent.match(/Chrome\/([0-9.]+)/);
                browserVersion = match ? match[1] : 'Unknown';
            } else if (userAgent.includes('Firefox')) {
                browserName = 'Firefox';
                const match = userAgent.match(/Firefox\/([0-9.]+)/);
                browserVersion = match ? match[1] : 'Unknown';
            } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
                browserName = 'Safari';
                const match = userAgent.match(/Version\/([0-9.]+)/);
                browserVersion = match ? match[1] : 'Unknown';
            } else if (userAgent.includes('Edge')) {
                browserName = 'Edge';
                const match = userAgent.match(/Edge\/([0-9.]+)/);
                browserVersion = match ? match[1] : 'Unknown';
            }
            
            return { name: browserName, version: browserVersion };
        } catch (error) {
            return { name: 'Unknown', version: 'Unknown' };
        }
    }



    static async collectFingerprint() {
        try {
            if (!this.isContentScriptContext()) {
                return null;
            }
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('Browser fingerprint test', 2, 2);
            
            return {
                canvas: canvas.toDataURL(),
                screen: {
                    width: screen.width,
                    height: screen.height,
                    colorDepth: screen.colorDepth,
                    pixelDepth: screen.pixelDepth
                },
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                language: navigator.language,
                languages: navigator.languages,
                cookieEnabled: navigator.cookieEnabled,
                doNotTrack: navigator.doNotTrack,
                hardwareConcurrency: navigator.hardwareConcurrency,
                maxTouchPoints: navigator.maxTouchPoints
            };
        } catch (error) {
            console.warn('Failed to collect fingerprint:', error);
            return null;
        }
    }

    static async collectGeoLocation() {
        try {
            if (!this.isContentScriptContext() || !navigator.geolocation) {
                return null;
            }
            
            return new Promise((resolve) => {
                const timeout = setTimeout(() => resolve(null), 5000);
                
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        clearTimeout(timeout);
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            accuracy: position.coords.accuracy,
                            timestamp: position.timestamp
                        });
                    },
                    () => {
                        clearTimeout(timeout);
                        resolve(null);
                    },
                    { timeout: 5000, enableHighAccuracy: false }
                );
            });
        } catch (error) {
            console.warn('Failed to collect geolocation:', error);
            return null;
        }
    }

    static async collectIPAddress() {
        try {
            // Try to get IP from WebRTC (local network IP)
            const rtcConnection = new RTCPeerConnection({ iceServers: [] });
            
            return new Promise((resolve) => {
                const timeout = setTimeout(() => resolve(null), 3000);
                
                rtcConnection.createDataChannel('');
                rtcConnection.createOffer().then(offer => rtcConnection.setLocalDescription(offer));
                
                rtcConnection.onicecandidate = (event) => {
                    if (event.candidate) {
                        const candidate = event.candidate.candidate;
                        const ipMatch = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/);
                        if (ipMatch) {
                            clearTimeout(timeout);
                            rtcConnection.close();
                            resolve(ipMatch[1]);
                        }
                    }
                };
            });
        } catch (error) {
            console.warn('Failed to collect IP address:', error);
            return null;
        }
    }

}

// Make available for both Node.js and browser contexts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GetBrowserData;
}

// Make available globally for browser/content script context
if (typeof window !== 'undefined') {
    window.GetBrowserData = GetBrowserData;
}
