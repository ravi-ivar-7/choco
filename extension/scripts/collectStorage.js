// Storage Collection Script - Injected into webpage context
// This script runs in the webpage's context to access localStorage and sessionStorage

function collectStorageData() {
    console.log('🔍 Storage collection script started')
    console.log('🌐 Current URL:', window.location.href)
    console.log('📦 localStorage available:', typeof localStorage !== 'undefined')
    console.log('📦 localStorage length:', localStorage ? localStorage.length : 'N/A')
    
    const storageData = {
        localStorage: {},
        sessionStorage: {},
        timestamp: Date.now(),
        url: window.location.href,
        debug: {
            localStorageAvailable: typeof localStorage !== 'undefined',
            sessionStorageAvailable: typeof sessionStorage !== 'undefined',
            localStorageLength: localStorage ? localStorage.length : 0,
            sessionStorageLength: sessionStorage ? sessionStorage.length : 0
        }
    }

    // Collect localStorage
    try {
        console.log('📂 Attempting to collect localStorage...')
        if (localStorage && localStorage.length > 0) {
            console.log('📂 localStorage has', localStorage.length, 'items')
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key) {
                    const value = localStorage.getItem(key)
                    storageData.localStorage[key] = value
                    console.log('📂 Found localStorage item:', key, '=', value?.substring(0, 50) + '...')
                }
            }
        } else {
            console.log('📂 localStorage is empty or unavailable')
        }
    } catch (error) {
        console.warn('❌ localStorage access failed:', error.message)
        storageData.localStorageError = error.message
    }

    // Collect sessionStorage
    try {
        console.log('🗂️ Attempting to collect sessionStorage...')
        if (sessionStorage && sessionStorage.length > 0) {
            console.log('🗂️ sessionStorage has', sessionStorage.length, 'items')
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i)
                if (key) {
                    const value = sessionStorage.getItem(key)
                    storageData.sessionStorage[key] = value
                    console.log('🗂️ Found sessionStorage item:', key, '=', value?.substring(0, 50) + '...')
                }
            }
        } else {
            console.log('🗂️ sessionStorage is empty or unavailable')
        }
    } catch (error) {
        console.warn('❌ sessionStorage access failed:', error.message)
        storageData.sessionStorageError = error.message
    }

    console.log('✅ Storage collection completed:', storageData)
    return storageData
}

// Execute and return the result
collectStorageData()
