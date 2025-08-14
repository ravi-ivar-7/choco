class NotificationHandler {
    handleMessage(request, sender, sendResponse) {
        try {
            let result;
            
            if (request.type === 'SHOW_TOAST_NOTIFICATION') {
                result = this.showToastNotification(request);
            } else if (request.type === 'SHOW_DIALOG_NOTIFICATION') {
                result = this.showDialogNotification(request);
            } else {
                return null; // Not a notification message
            }
            
            return result;
        } catch (error) {
            return {
                success: false,
                message: 'Error handling notification message',
                data: null,
                error: error.message
            };
        }
    }

    showToastNotification(request) {
        if (typeof NotificationUtils === 'undefined') {
            return {
                success: false,
                message: 'NotificationUtils not available',
                data: null,
                error: 'NotificationUtils not loaded'
            };
        }
        
        const options = {
            type: request.notificationType || 'info',
            duration: request.duration || 5000,
            dismissible: true,
            isDialog: false
        };
        
        return NotificationUtils.showInPageNotification(
            request.title || 'Notification',
            request.message || '',
            options
        );
    }

    showDialogNotification(request) {
        if (typeof NotificationUtils === 'undefined') {
            return {
                success: false,
                message: 'NotificationUtils not available',
                data: null,
                error: 'NotificationUtils not loaded'
            };
        }
        
        const buttons = [];
        if (request.actionButton) {
            buttons.push({
                text: request.actionButton.text || 'OK',
                href: request.actionButton.href || null,
                target: request.actionButton.target || '_self',
                primary: true
            });
        }
        if (request.cancelButton) {
            buttons.push({
                text: request.cancelButton.text || 'Cancel',
                href: request.cancelButton.href || null,
                target: request.cancelButton.target || '_self',
                primary: false
            });
        }
        
        const options = {
            type: request.notificationType || 'info',
            dismissible: true,
            isDialog: true,
            buttons: buttons
        };
        
        return NotificationUtils.showInPageNotification(
            request.title || 'Notification',
            request.message || '',
            options
        );
    }
}

// Make NotificationHandler available globally for content script context
if (typeof window !== 'undefined') {
    window.NotificationHandler = NotificationHandler;
}

// Initialize the notification handler when the script loads (only if not already created)
if (typeof window !== 'undefined' && !window.notificationHandler) {
    window.notificationHandler = new NotificationHandler();
}
