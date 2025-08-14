function setupStorageChangeMonitoring() {
    
    window.addEventListener('storage', (event) => {
        
        // Send storage change message to background script
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({
                type: 'STORAGE_CHANGED',
                key: event.key,
                oldValue: event.oldValue,
                newValue: event.newValue,
                storageType: event.storageArea === localStorage ? 'localStorage' : 'sessionStorage',
                url: window.location.href
            }).catch(error => {
                console.log('Failed to send storage change message:', error);
            });
        }
    });
    
    // Monitor programmatic storage changes by overriding storage methods
    const originalSetItem = Storage.prototype.setItem;
    const originalRemoveItem = Storage.prototype.removeItem;
    const originalClear = Storage.prototype.clear;
    
    Storage.prototype.setItem = function(key, value) {
        const oldValue = this.getItem(key);
        const result = originalSetItem.call(this, key, value);
        
        if (oldValue !== value) {
            
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                chrome.runtime.sendMessage({
                    type: 'STORAGE_CHANGED',
                    key,
                    oldValue,
                    newValue: value,
                    storageType: this === localStorage ? 'localStorage' : 'sessionStorage',
                    url: window.location.href
                }).catch(error => {
                    console.log('Failed to send storage change message:', error);
                });
            }
        }
        
        return result;
    };
    
    Storage.prototype.removeItem = function(key) {
        const oldValue = this.getItem(key);
        const result = originalRemoveItem.call(this, key);
        
        if (oldValue !== null) {
            
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                chrome.runtime.sendMessage({
                    type: 'STORAGE_CHANGED',
                    key,
                    oldValue,
                    newValue: null,
                    storageType: this === localStorage ? 'localStorage' : 'sessionStorage',
                    url: window.location.href
                }).catch(error => {
                    console.log('Failed to send storage change message:', error);
                });
            }
        }
        
        return result;
    };
    
    Storage.prototype.clear = function() {
        
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({
                type: 'STORAGE_CHANGED',
                key: null,
                oldValue: null,
                newValue: null,
                storageType: this === localStorage ? 'localStorage' : 'sessionStorage',
                action: 'clear',
                url: window.location.href
            }).catch(error => {
                console.log('Failed to send storage change message:', error);
            });
        }
        
        return originalClear.call(this);
    };
    
}

setupStorageChangeMonitoring();
