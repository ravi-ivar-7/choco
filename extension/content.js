// Choco Content Script - Notification Handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        let result
        
        if (request.type === 'SHOW_TOAST_NOTIFICATION') {
            result = showToastNotification(request)
        } else if (request.type === 'SHOW_DIALOG_NOTIFICATION') {
            result = showDialogNotification(request)
        } else {
            result = {
                success: false,
                message: 'Unknown message type',
                data: null,
                error: 'Unknown message type: ' + request.type
            }
        }
        
        sendResponse(result)
    } catch (error) {
        sendResponse({
            success: false,
            message: 'Error handling message',
            data: null,
            error: error.message
        })
    }
    
    return true
})

function showToastNotification(request) {
    if (typeof NotificationUtils === 'undefined') {
        return {
            success: false,
            message: 'NotificationUtils not available',
            data: null,
            error: 'NotificationUtils not loaded'
        }
    }
    
    const options = {
        type: request.notificationType || 'info',
        duration: request.duration || 5000,
        dismissible: true,
        isDialog: false
    }
    
    return NotificationUtils.showInPageNotification(
        request.title || 'Notification',
        request.message || '',
        options
    )
}

function showDialogNotification(request) {
    if (typeof NotificationUtils === 'undefined') {
        return {
            success: false,
            message: 'NotificationUtils not available',
            data: null,
            error: 'NotificationUtils not loaded'
        }
    }
    
    const buttons = []
    if (request.actionButton) {
        buttons.push({
            text: request.actionButton.text || 'OK',
            href: request.actionButton.href || null,
            target: request.actionButton.target || '_self',
            primary: true
        })
    }
    if (request.cancelButton) {
        buttons.push({
            text: request.cancelButton.text || 'Cancel',
            href: request.cancelButton.href || null,
            target: request.cancelButton.target || '_self',
            primary: false
        })
    }
    
    const options = {
        type: request.notificationType || 'info',
        dismissible: true,
        isDialog: true,
        buttons: buttons
    }
    
    return NotificationUtils.showInPageNotification(
        request.title || 'Notification',
        request.message || '',
        options
    )
}