/**
 * Simple Toast Notifications
 * Independent toast popup system with auto-dismiss
 */
class NotificationToast {
    static show(message, options = {}) {
        const toast = new NotificationToast();
        return toast.create(message, options);
    }

    create(message, options = {}) {
        const type = options.type || 'info';
        const duration = options.duration || 5000;
        const position = options.position || 'top-right';

        // Create toast container if it doesn't exist
        this.ensureContainer(position);

        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'choco-toast';
        toast.style.cssText = `
            background: #1c2128;
            border: 1px solid ${this.getColor(type)};
            border-left: 4px solid ${this.getColor(type)};
            border-radius: 6px;
            padding: 12px 16px;
            margin-bottom: 8px;
            color: #f0f6fc;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transform: translateX(100%);
            transition: all 0.3s ease;
            cursor: pointer;
            max-width: 350px;
            word-wrap: break-word;
            position: relative;
        `;

        // Add icon and message
        const content = document.createElement('div');
        content.style.cssText = `
            display: flex;
            align-items: flex-start;
            gap: 8px;
        `;

        const icon = document.createElement('span');
        icon.textContent = this.getIcon(type);
        icon.style.cssText = `
            font-size: 16px;
            flex-shrink: 0;
            margin-top: 1px;
        `;

        const messageEl = document.createElement('div');
        messageEl.innerHTML = message;
        messageEl.style.cssText = `
            flex: 1;
            color: #f0f6fc;
        `;

        // Close button
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 8px;
            right: 12px;
            font-size: 18px;
            color: #6e7681;
            cursor: pointer;
            line-height: 1;
        `;

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.remove(toast);
        });

        // Assemble toast
        content.appendChild(icon);
        content.appendChild(messageEl);
        toast.appendChild(content);
        toast.appendChild(closeBtn);

        // Add to container
        const container = document.getElementById('choco-toast-container');
        container.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 10);

        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => {
                this.remove(toast);
            }, duration);
        }

        // Click to dismiss
        toast.addEventListener('click', () => {
            this.remove(toast);
        });

        return { success: true };
    }

    ensureContainer(position) {
        let container = document.getElementById('choco-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'choco-toast-container';
            container.style.cssText = `
                position: fixed;
                ${this.getPositionStyles(position)}
                z-index: 999998;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
        // Enable pointer events for toasts
        container.style.pointerEvents = 'auto';
    }

    getPositionStyles(position) {
        const positions = {
            'top-right': 'top: 20px; right: 20px;',
            'top-left': 'top: 20px; left: 20px;',
            'bottom-right': 'bottom: 20px; right: 20px;',
            'bottom-left': 'bottom: 20px; left: 20px;',
            'top-center': 'top: 20px; left: 50%; transform: translateX(-50%);',
            'bottom-center': 'bottom: 20px; left: 50%; transform: translateX(-50%);'
        };
        return positions[position] || positions['top-right'];
    }

    remove(toast) {
        if (!toast || !toast.parentNode) return;
        
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    getColor(type) {
        const colors = {
            success: '#3fb950',
            error: '#f85149',
            failure: '#da3633',
            warning: '#d29922',
            info: '#58a6ff'
        };
        return colors[type] || colors.info;
    }

    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            failure: '⛔',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    // Clear all toasts
    static clearAll() {
        const container = document.getElementById('choco-toast-container');
        if (container) {
            container.innerHTML = '';
        }
    }
}

// Global access
if (typeof window !== 'undefined') {
    window.NotificationToast = NotificationToast;
}
