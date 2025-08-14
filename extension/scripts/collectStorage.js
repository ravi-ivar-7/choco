(() => {
    const storageData = {
        localStorage: {},
        sessionStorage: {},
        timestamp: Date.now(),
        url: window.location.href,
        localStorageError: null,
        sessionStorageError: null
    };

    try {
        if (typeof localStorage !== 'undefined' && localStorage && localStorage.length > 0) {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    storageData.localStorage[key] = localStorage.getItem(key);
                }
            }
        }
    } catch (error) {
        storageData.localStorageError = error.message;
    }

    try {
        if (typeof sessionStorage !== 'undefined' && sessionStorage && sessionStorage.length > 0) {
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key) {
                    storageData.sessionStorage[key] = sessionStorage.getItem(key);
                }
            }
        }
    } catch (error) {
        storageData.sessionStorageError = error.message;
    }

    return storageData;
})()
