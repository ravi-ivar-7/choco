/**
 * Choco Extension - Content Script
 * 
 * ARCHITECTURE OVERVIEW:
 * This content script runs in webpage context and handles:
 * - DOM-based notifications (toast/dialog)
 * - Storage monitoring (via monitorStorage.js)
 * - Direct communication with background.js
 * 
 * MESSAGE FLOW:
 * - Storage changes: monitorStorage.js → chrome.runtime.sendMessage() → background.js
 * - Notifications: background.js → chrome.scripting.executeScript() → notificationHandler.js (DIRECT)
 * - Browser data: background.js → BrowserDataCollector (direct, no content script needed)
 * 
 * INJECTED SCRIPTS:
 * - lib/config/constants.js - Extension constants
 * - lib/utils/chrome.js - Chrome API utilities  
 * - lib/utils/notifications.js - Notification utilities
 * - scripts/monitorStorage.js - Storage change monitoring
 * - scripts/notificationHandler.js - Notification display
 * - content.js - This main coordinator
 * 
 * IMPORTANT NOTES:
 * - Content scripts have limited Chrome API access vs background scripts
 * - DOM APIs (window, document, localStorage) only available in content context
 * - Background scripts have full Chrome API access but no DOM access
 * - All browser data collection now handled directly by background.js
 */

// Content script now serves as coordinator for injected scripts
// All communication is direct - no message routing through content.js

// Handle connection tests from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'TEST_CONNECTION') {
        sendResponse({ success: true, message: 'Content script responding' });
        return true;
    }
    
    // No other message handling - all communication is direct
    sendResponse({
        success: false,
        error: 'Direct communication only',
        message: 'This content script no longer routes messages - use direct communication',
        data: null
    });
    return true;
});