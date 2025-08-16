class NotificationUtils {
    static NOTIFICATION_TYPES = {
        SUCCESS: 'success',
        ERROR: 'error',
        FAILURE: 'failure',
        WARNING: 'warning',
        INFO: 'info'
    }

    static NOTIFICATION_THEMES = {
        success: {
            background: 'rgba(13, 17, 23, 0.95)',
            border: '#3fb950',
            icon: '✅',
            textColor: '#f0f6fc',
            accentColor: '#3fb950',
            primaryButton: '#3fb950',
            secondaryButton: '#58a6ff'
        },
        error: {
            background: 'rgba(13, 17, 23, 0.95)',
            border: '#f85149',
            icon: '❌',
            textColor: '#f0f6fc',
            accentColor: '#f85149',
            primaryButton: '#f85149',
            secondaryButton: '#6e7681'
        },
        failure: {
            background: 'rgba(13, 17, 23, 0.95)',
            border: '#da3633',
            icon: '⛔',
            textColor: '#f0f6fc',
            accentColor: '#da3633',
            primaryButton: '#da3633',
            secondaryButton: '#6e7681'
        },
        warning: {
            background: 'rgba(13, 17, 23, 0.95)',
            border: '#d29922',
            icon: '⚠️',
            textColor: '#f0f6fc',
            accentColor: '#d29922',
            primaryButton: '#d29922',
            secondaryButton: '#58a6ff'
        },
        info: {
            background: 'rgba(13, 17, 23, 0.95)',
            border: '#58a6ff',
            icon: '🔔',
            textColor: '#f0f6fc',
            accentColor: '#58a6ff',
            primaryButton: '#58a6ff',
            secondaryButton: '#6e7681'
        }
    }

    static DEFAULT_CONTAINER_ID = 'notification-container'
    static DEFAULT_DURATION = 10000

    // In-page notification system
    static createNotificationContainer(containerId = this.DEFAULT_CONTAINER_ID, options = {}) {
        if (typeof document === 'undefined') {
            return {
                success: false,
                error: 'Document unavailable',
                message: 'Document not available - cannot create notification container',
                data: null
            }
        }

        let container = document.getElementById(containerId)
        if (container) {
            return {
                success: true,
                error: null,
                message: 'Notification container already exists',
                data: { container, containerId }
            }
        }

        try {
            container = document.createElement('div')
            container.id = containerId
            
            const defaultStyles = {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: '10000',
                pointerEvents: 'none',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                maxWidth: '400px'
            }

            const styles = { ...defaultStyles, ...options.styles }
            Object.assign(container.style, styles)
            
            document.body.appendChild(container)
            return {
                success: true,
                error: null,
                message: 'Notification container created successfully',
                data: { container, containerId }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Container creation error',
                message: `Failed to create notification container: ${error.message}`,
                data: null
            }
        }
    }

    static showInPageNotification(title, message, options = {}) {
        const {
            type = this.NOTIFICATION_TYPES.INFO,
            duration = this.DEFAULT_DURATION,
            containerId = this.DEFAULT_CONTAINER_ID,
            dismissible = true,
            onClick = null,
            isDialog = false,
            buttons = []
        } = options

        if (typeof document === 'undefined') {
            return {
                success: false,
                error: 'Document unavailable',
                message: 'Document not available - cannot show in-page notification',
                data: null
            }
        }

        const containerResult = this.createNotificationContainer(containerId)
        if (!containerResult.success) {
            return containerResult
        }

        try {
            const container = containerResult.data.container
            const theme = this.NOTIFICATION_THEMES[type] || this.NOTIFICATION_THEMES.info
            const notificationId = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            
            const notification = document.createElement('div')
            notification.id = notificationId
            notification.className = 'notification-item'
            
            if (isDialog) {
                // Create backdrop for dialog
                const backdrop = document.createElement('div')
                backdrop.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 10000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                `
                backdrop.className = 'dialog-backdrop'
                document.body.appendChild(backdrop)
                
                this.applyDialogNotificationStyles(notification, theme)
                notification.innerHTML = this.createDialogNotificationHTML(title, message, theme, buttons)
                notification.setAttribute('data-backdrop-id', backdrop.id = `backdrop-${notificationId}`)
                
                // Show backdrop
                setTimeout(() => backdrop.style.opacity = '1', 10)
            } else {
                this.applyToastNotificationStyles(notification, theme)
                notification.innerHTML = this.createToastNotificationHTML(title, message, theme, dismissible)
            }
            
            if (isDialog) {
                // Dialog notifications go directly on body, not in container
                document.body.appendChild(notification)
                
                // Animate dialog in
                requestAnimationFrame(() => {
                    notification.style.opacity = '1'
                })
            } else {
                // Toast notifications go in container
                container.appendChild(notification)
                
                // Animate toast in
                requestAnimationFrame(() => {
                    notification.style.transform = 'translateX(0)'
                    notification.style.opacity = '1'
                })
            }

            // Add event listeners
            if (isDialog) {
                this.attachDialogNotificationEvents(notification)
            } else {
                this.attachToastNotificationEvents(notification, onClick)
            }
            
            // Auto-dismiss (only for non-dialog notifications)
            if (!isDialog && duration > 0) {
                setTimeout(() => {
                    this.dismissNotification(notification)
                }, duration)
            }

            return {
                success: true,
                error: null,
                message: 'Notification displayed successfully',
                data: { notificationId, type, title, message }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Notification creation error',
                message: `Failed to show notification: ${error.message}`,
                data: null
            }
        }
    }

    static applyToastNotificationStyles(element, theme) {
        Object.assign(element.style, {
            background: theme.background,
            color: theme.textColor,
            padding: '16px 20px',
            marginBottom: '12px',
            borderRadius: '8px',
            borderLeft: `4px solid ${theme.border}`,
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15)',
            minWidth: '300px',
            maxWidth: '450px',
            pointerEvents: 'auto',
            cursor: 'pointer',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
            opacity: '0',
            position: 'relative',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '14px',
            lineHeight: '1.5'
        })
    }

    static applyDialogNotificationStyles(element, theme) {
        Object.assign(element.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: theme.background,
            color: theme.textColor,
            padding: '28px',
            borderRadius: '6px',
            border: `1px solid ${theme.border}`,
            boxShadow: '0 16px 32px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            minWidth: '420px',
            maxWidth: '520px',
            pointerEvents: 'auto',
            zIndex: '10001',
            opacity: '0',
            transition: 'opacity 0.3s ease-in-out',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
            fontSize: '14px',
            lineHeight: '1.5'
        })
    }

    static createToastNotificationHTML(title, message, theme, dismissible) {
        const isWarning = theme.textColor === '#1f2937';
        const closeButtonColor = theme.textColor;
        const closeButtonBg = isWarning ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)';
        const closeButtonHover = isWarning ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)';
        
        const closeButton = dismissible ? `
            <button class="notification-close" style="
                background: ${closeButtonBg};
                border: none;
                color: ${closeButtonColor};
                width: 22px;
                height: 22px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                transition: background-color 0.2s ease;
            " onmouseover="this.style.background='${closeButtonHover}'" onmouseout="this.style.background='${closeButtonBg}'">×</button>
        ` : ''

        return `
            <div style="display: flex; align-items: flex-start; gap: 14px;">
                <span style="font-size: 20px; flex-shrink: 0; margin-top: 1px;">${theme.icon}</span>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; font-size: 15px; margin-bottom: 6px; color: ${theme.textColor};">${this.escapeHTML(title)}</div>
                    <div style="font-size: 14px; opacity: 0.9; line-height: 1.5; color: ${theme.textColor};">${this.escapeHTML(message)}</div>
                </div>
                ${closeButton}
            </div>
        `
    }

    static createDialogNotificationHTML(title, message, theme, buttons = []) {
        const buttonsHTML = buttons.map(button => {
            let buttonStyle, hoverStyle;
            
            if (button.style === 'primary') {
                const primaryColor = theme.primaryButton;
                buttonStyle = `background: linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%); color: #ffffff; font-weight: 600; border: none; box-shadow: 0 2px 4px rgba(0,0,0,0.2);`;
                hoverStyle = `background: ${primaryColor}; transform: translateY(-1px); box-shadow: 0 4px 8px rgba(0,0,0,0.3);`;
            } else {
                const secondaryColor = theme.secondaryButton;
                buttonStyle = `background: rgba(110, 118, 129, 0.1); color: ${secondaryColor}; border: 1px solid ${secondaryColor}40;`;
                hoverStyle = `background: ${secondaryColor}20; border-color: ${secondaryColor}80; color: ${secondaryColor};`;
            }
            
            const href = button.href ? `href="${button.href}"` : ''
            const target = button.target ? `target="${button.target}"` : ''
            const tag = button.href ? 'a' : 'button'
            const closeTag = button.href ? 'a' : 'button'
            
            return `
                <${tag} ${href} ${target} class="dialog-button" style="
                    ${buttonStyle}
                    padding: 10px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    text-align: center;
                    margin: 0 6px;
                    transition: all 0.2s ease;
                    min-width: 80px;
                    gap: 6px;
                " onmouseover="this.style.cssText += '${hoverStyle}'" onmouseout="this.style.cssText = this.style.cssText.replace('${hoverStyle}', '')">${this.escapeHTML(button.text)}</${closeTag}>
            `
        }).join('')

        return `
            <div style="text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 20px;">
                    <span style="font-size: 28px; color: ${theme.accentColor};">${theme.icon}</span>
                    <div>
                        <div style="font-weight: 600; font-size: 18px; margin-bottom: 8px; color: ${theme.textColor};">${this.escapeHTML(title)}</div>
                        <div style="font-size: 14px; opacity: 0.9; line-height: 1.5; color: ${theme.textColor};">${this.escapeHTML(message)}</div>
                    </div>
                </div>
                <div style="display: flex; justify-content: center; gap: 12px; margin-top: 24px;">
                    ${buttonsHTML}
                </div>
            </div>
        `
    }

    static attachToastNotificationEvents(notification, onClick) {
        const closeButton = notification.querySelector('.notification-close')
        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                e.stopPropagation()
                this.dismissNotification(notification)
            })
        }

        if (onClick) {
            notification.addEventListener('click', onClick)
        } else {
            notification.addEventListener('click', () => {
                this.dismissNotification(notification)
            })
        }
    }

    static attachDialogNotificationEvents(notification) {
        // Handle backdrop click to dismiss
        const backdropId = notification.getAttribute('data-backdrop-id')
        if (backdropId) {
            const backdrop = document.getElementById(backdropId)
            if (backdrop) {
                backdrop.addEventListener('click', () => {
                    this.dismissNotification(notification)
                })
            }
        }

        // Handle dialog button clicks
        const dialogButtons = notification.querySelectorAll('.dialog-button')
        dialogButtons.forEach(button => {
            // Only add dismiss behavior to buttons without href
            if (!button.href) {
                button.addEventListener('click', () => {
                    this.dismissNotification(notification)
                })
            }
            // Buttons with href will navigate naturally and don't need dismiss
        })
    }

    static dismissNotification(notification) {
        if (!notification || !notification.parentElement) {
            return
        }

        // Handle dialog backdrop removal
        const backdropId = notification.getAttribute('data-backdrop-id')
        if (backdropId) {
            const backdrop = document.getElementById(backdropId)
            if (backdrop) {
                backdrop.style.opacity = '0'
                setTimeout(() => backdrop.remove(), 300)
            }
            // Dialog notification - just fade out
            notification.style.opacity = '0'
        } else {
            // Toast notification - slide out
            notification.style.transform = 'translateX(100%)'
            notification.style.opacity = '0'
        }
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove()
            }
        }, 300)
    }

    static clearAllNotifications(containerId = this.DEFAULT_CONTAINER_ID) {
        if (typeof document === 'undefined') {
            return
        }

        // Clear toast notifications from container
        const container = document.getElementById(containerId)
        if (container) {
            const toastNotifications = container.querySelectorAll('.notification-item')
            toastNotifications.forEach(notification => {
                this.dismissNotification(notification)
            })
        }

        // Clear dialog notifications from document body
        const dialogNotifications = document.body.querySelectorAll('.notification-item[data-backdrop-id]')
        dialogNotifications.forEach(notification => {
            this.dismissNotification(notification)
        })
    }

    static escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // General notification function for extension-wide use
    static async showExtensionNotification(currentTab, options = {}) {
        console.log('showing notification', currentTab)
        try {
            if (!currentTab || !currentTab.id) {
                console.log('No current tab available for notification');
                return { success: false, error: 'No tab available' };
            }

            let notificationData = {};

            // If setBrowserDataResult is provided, parse it automatically
            if (options.setBrowserDataResult) {
                notificationData = this.parseSetBrowserDataResult(options.setBrowserDataResult);
            } 
            // Otherwise use provided parameters
            else if (options.title && options.message) {
                notificationData = {
                    title: options.title,
                    dialogMessage: options.message,
                    toastMessage: options.toastMessage || options.message,
                    notificationType: options.notificationType || 'info',
                    actionButton: options.actionButton || null,
                    cancelButton: options.cancelButton || null
                };
            }
            // Default fallback
            else {
                notificationData = {
                    title: 'Notification',
                    dialogMessage: 'Operation completed',
                    toastMessage: 'Operation completed',
                    notificationType: 'info',
                    actionButton: { text: 'OK', href: null, target: '_self' },
                    cancelButton: null
                };
            }

            // Determine notification type (dialog vs toast)
            const notificationType = options.type || 'SHOW_DIALOG_NOTIFICATION';

            // Execute notification in content script
            await chrome.scripting.executeScript({
                target: { tabId: currentTab.id },
                func: (title, message, type, actionBtn, cancelBtn, notifType) => {
                    console.log('Script injected - checking NotificationHandler:', typeof window.NotificationHandler);
                    console.log('Notification data:', { title, message, type, actionBtn, cancelBtn, notifType });
                    
                    if (typeof window.NotificationHandler !== 'undefined') {
                        console.log('NotificationHandler found, creating instance...');
                        const handler = new window.NotificationHandler();
                        handler.handleMessage({
                            type: notifType,
                            title, 
                            message, 
                            notificationType: type,
                            actionButton: actionBtn,
                            cancelButton: cancelBtn
                        });
                        console.log('Notification message sent to handler');
                    } else {
                        console.error('NotificationHandler not found in window object');
                        console.log('Available window objects:', Object.keys(window).filter(key => key.includes('Notification')));
                    }
                },
                args: [
                    notificationData.title, 
                    notificationData.dialogMessage, 
                    notificationData.notificationType, 
                    notificationData.actionButton, 
                    notificationData.cancelButton,
                    notificationType
                ]
            });

            return { success: true, data: notificationData };

        } catch (error) {
            console.error('❌ Error showing extension notification:', error);
            return { success: false, error: error.message };
        }
    }

    // Parse setBrowserDataResult to determine notification content
    static parseSetBrowserDataResult(setBrowserDataResult) {
        let failedItems = [];
        let successfulItems = [];
        let totalItems = 0;
        
        if (setBrowserDataResult?.data?.results) {
            setBrowserDataResult.data.results.forEach(result => {
                totalItems++;
                if (result.success) {
                    successfulItems.push(`${result.type}: ${result.name || 'data'}`);
                } else {
                    failedItems.push(`${result.type}: ${result.name || 'data'}`);
                }
            });
        }

        // Determine notification type and messages based on results
        if (setBrowserDataResult.success && failedItems.length === 0) {
            // Complete success
            return {
                title: 'Credentials Applied Successfully',
                toastMessage: `✅ All credentials applied: ${successfulItems.join(', ')}. Refresh to login.`,
                dialogMessage: `All credentials applied: ${successfulItems.join(', ')}. May not work on first try - refresh to test. If it doesn't work, try another credential or login manually.`,
                notificationType: 'success',
                actionButton: { text: 'Refresh Page', href: '/', target: '_self' },
                cancelButton: { text: 'Later', href: null, target: '_self' }
            };
        } else if (successfulItems.length > 0 && failedItems.length > 0) {
            // Partial success
            return {
                title: 'Credentials Partially Applied',
                toastMessage: `⚠️ Failed: ${failedItems.join(', ')}. Success: ${successfulItems.join(', ')}. May or may not work.`,
                dialogMessage: `Mixed results - Failed: ${failedItems.join(', ')}. Applied: ${successfulItems.join(', ')}. May work or may not work - refresh to test, or try another credential.`,
                notificationType: 'warning',
                actionButton: { text: 'Refresh Page', href: '/', target: '_self' },
                cancelButton: { text: 'Try Another', href: null, target: '_self' }
            };
        } else {
            // Complete failure
            return {
                title: 'Credentials Failed',
                toastMessage: `❌ All failed: ${failedItems.join(', ')}. Try another credential.`,
                dialogMessage: `All credential fields failed: ${failedItems.join(', ')}. Please try selecting another credential or login manually.`,
                notificationType: 'failure',
                actionButton: { text: 'Try Another', href: null, target: '_self' },
                cancelButton: { text: 'Login Manually', href: null, target: '_self' }
            };
        }
    }
}

// Make NotificationUtils available globally for content script context
if (typeof window !== 'undefined') {
    window.NotificationUtils = NotificationUtils;
}
