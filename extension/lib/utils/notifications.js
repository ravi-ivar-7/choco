class NotificationUtils {
    static NOTIFICATION_TYPES = {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    }

    static NOTIFICATION_THEMES = {
        success: {
            background: '#10b981',
            border: '#059669',
            icon: '✅'
        },
        error: {
            background: '#ef4444',
            border: '#dc2626',
            icon: '❌'
        },
        warning: {
            background: '#f59e0b',
            border: '#d97706',
            icon: '⚠️'
        },
        info: {
            background: '#3b82f6',
            border: '#2563eb',
            icon: '🔔'
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
            color: 'white',
            padding: '16px 20px',
            marginBottom: '12px',
            borderRadius: '8px',
            borderLeft: `4px solid ${theme.border}`,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            minWidth: '300px',
            pointerEvents: 'auto',
            cursor: 'pointer',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
            opacity: '0',
            position: 'relative'
        })
    }

    static applyDialogNotificationStyles(element, theme) {
        Object.assign(element.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: theme.background,
            color: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: `2px solid ${theme.border}`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            minWidth: '400px',
            maxWidth: '500px',
            pointerEvents: 'auto',
            zIndex: '10001',
            opacity: '0',
            transition: 'opacity 0.3s ease-in-out'
        })
    }

    static createToastNotificationHTML(title, message, theme, dismissible) {
        const closeButton = dismissible ? `
            <button class="notification-close" style="
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            ">×</button>
        ` : ''

        return `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="font-size: 18px; flex-shrink: 0;">${theme.icon}</span>
                <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${this.escapeHTML(title)}</div>
                    <div style="font-size: 13px; opacity: 0.95; line-height: 1.4;">${this.escapeHTML(message)}</div>
                </div>
                ${closeButton}
            </div>
        `
    }

    static createDialogNotificationHTML(title, message, theme, buttons = []) {
        const buttonsHTML = buttons.map(button => {
            const buttonStyle = button.style === 'primary' ? 
                'background: rgba(255, 255, 255, 0.9); color: #333; font-weight: 600;' :
                'background: rgba(255, 255, 255, 0.2); color: white; border: 1px solid rgba(255, 255, 255, 0.3);'
            
            const href = button.href ? `href="${button.href}"` : ''
            const target = button.target ? `target="${button.target}"` : ''
            const tag = button.href ? 'a' : 'button'
            const closeTag = button.href ? 'a' : 'button'
            
            return `
                <${tag} ${href} ${target} class="dialog-button" style="
                    ${buttonStyle}
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    text-decoration: none;
                    display: inline-block;
                    text-align: center;
                    margin: 0 8px;
                    transition: all 0.2s ease;
                ">${this.escapeHTML(button.text)}</${closeTag}>
            `
        }).join('')

        return `
            <div style="text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 20px;">
                    <span style="font-size: 24px;">${theme.icon}</span>
                    <div>
                        <div style="font-weight: 600; font-size: 18px; margin-bottom: 8px;">${this.escapeHTML(title)}</div>
                        <div style="font-size: 14px; opacity: 0.9; line-height: 1.5;">${this.escapeHTML(message)}</div>
                    </div>
                </div>
                <div style="display: flex; justify-content: center; gap: 8px;">
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
        const div = document.createElement('div')
        div.textContent = text
        return div.innerHTML
    }
}

// Make NotificationUtils available globally for content script context
if (typeof window !== 'undefined') {
    window.NotificationUtils = NotificationUtils;
}
