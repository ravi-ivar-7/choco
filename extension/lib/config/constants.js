class Constants {
    static BACKEND_URL = 'http://localhost:3000/' // 'https://algochoco.vercel.app'
    
    static DOMAINS = {
        MAANG: {
            PRIMARY: 'maang.in',
            PATTERNS: ['*://maang.in/*', '*://*.maang.in/*'],
            URL: 'https://maang.in'
        },
        DEVS: {
            PRIMARY: '100xdevs.com',
            PATTERNS: ['*://100xdevs.com/*', '*://*.100xdevs.com/*'],
            URL: 'https://100xdevs.com'
        }
    }
    
    static async getCurrentDomain(url = null) {
        try {
            let hostname
            
            if (url) {
                hostname = new URL(url).hostname
            } else {
                // Fallback: get current tab URL if no URL provided
                const activeTabResult = await BrowserDataCollector.getActiveTab()
                if (!activeTabResult.success) {
                    return null
                }
                hostname = new URL(activeTabResult.data.url).hostname
            }
            
            for (const [key, domain] of Object.entries(this.DOMAINS)) {
                if (hostname.includes(domain.PRIMARY)) {
                    return { key, domain }
                }
            }
            
            return null
        } catch (error) {
            return null
        }
    }
}
