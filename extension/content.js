
// All communication is direct - no message routing through content.js

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