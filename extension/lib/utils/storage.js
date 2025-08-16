class StorageUtils {
    static async getSettings(backendUrl) {
        try {
            const result = await chrome.storage.local.get(['chocoSettings'])
            const settings = result.chocoSettings || {
                autoTokenRefresh: true,
                notificationsEnabled: true,
                backendUrl: backendUrl
            }
            return {
                success: true,
                error: null,
                message: result.chocoSettings ? 'Settings retrieved successfully' : 'Default settings applied',
                data: { settings }
            }
        } catch (error) {
            const defaultSettings = {
                autoTokenRefresh: true,
                notificationsEnabled: true,
                backendUrl: backendUrl
            }
            return {
                success: false,
                error: 'Storage error',
                message: `Failed to get settings: ${error.message}`,
                data: { settings: defaultSettings }
            }
        }
    }

    static async setSettings(settings) {
        try {
            await chrome.storage.local.set({ chocoSettings: settings })
            return {
                success: true,
                error: null,
                message: 'Settings saved successfully',
                data: { settings }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Storage error',
                message: `Failed to set settings: ${error.message}`,
                data: null
            }
        }
    }

    static async get(keys) {
        try {
            // Try Chrome storage first (extension environment)
            if (typeof chrome !== 'undefined' && chrome.storage) {
                const result = await chrome.storage.local.get(keys)
                return {
                    success: true,
                    error: null,
                    message: 'Data retrieved successfully',
                    data: result
                }
            } else {
                // Fallback to localStorage (dashboard environment)
                const result = {}
                const keyArray = Array.isArray(keys) ? keys : [keys]
                keyArray.forEach(key => {
                    const value = localStorage.getItem(key)
                    result[key] = value ? JSON.parse(value) : null
                })
                return {
                    success: true,
                    error: null,
                    message: 'Data retrieved successfully',
                    data: result
                }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Storage error',
                message: `Failed to get data: ${error.message}`,
                data: null
            }
        }
    }

    static async set(items) {
        try {
            // Try Chrome storage first (extension environment)
            if (typeof chrome !== 'undefined' && chrome.storage) {
                await chrome.storage.local.set(items)
            } else {
                // Fallback to localStorage (dashboard environment)
                Object.keys(items).forEach(key => {
                    localStorage.setItem(key, JSON.stringify(items[key]))
                })
            }
            return {
                success: true,
                error: null,
                message: 'Data stored successfully',
                data: { stored: items }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Storage error',
                message: `Failed to set data: ${error.message}`,
                data: null
            }
        }
    }

    static async remove(keys) {
        try {
            await chrome.storage.local.remove(keys)
            return {
                success: true,
                error: null,
                message: 'Data removed successfully',
                data: { removed: keys }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Storage error',
                message: `Failed to remove data: ${error.message}`,
                data: null
            }
        }
    }

    static async clear() {
        try {
            await chrome.storage.local.clear()
            return {
                success: true,
                error: null,
                message: 'Storage cleared successfully',
                data: { cleared: true }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Storage error',
                message: `Failed to clear storage: ${error.message}`,
                data: null
            }
        }
    }
}
