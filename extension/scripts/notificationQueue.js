/**
 * Notification Queue Manager
 * Manages a queue of notifications with UI display in bottom-left corner
 */
class NotificationQueue {
    constructor() {
        this.queue = [];
        this.maxSize = 15;
        this.isMinimized = true;
        this.container = null;
        this.init();
    }

    init() {
        this.createContainer();
        this.loadStoredQueue();
        this.bindEvents();
    }

    createContainer() {
        // Remove existing container if any
        const existing = document.getElementById('choco-notification-queue');
        if (existing) existing.remove();

        // Create main container
        this.container = document.createElement('div');
        this.container.id = 'choco-notification-queue';
        this.container.innerHTML = `
            <div class="queue-toggle" id="queue-toggle">
                <div class="queue-icon">🔔</div>
                <div class="queue-count" id="queue-count">0</div>
            </div>
            <div class="queue-panel" id="queue-panel" style="display: none;">
                <div class="queue-header">
                    <span>Notifications</span>
                    <div class="queue-actions">
                        <button class="queue-clear" id="queue-clear">Clear All</button>
                        <button class="queue-close" id="queue-close">×</button>
                    </div>
                </div>
                <div class="queue-list" id="queue-list"></div>
            </div>
        `;

        // Add styles
        this.addStyles();
        
        // Append to body
        document.body.appendChild(this.container);
    }

    addStyles() {
        const styleId = 'choco-notification-queue-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            #choco-notification-queue {
                position: fixed;
                bottom: 20px;
                left: 20px;
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .queue-toggle {
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 25px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transition: all 0.3s ease;
                position: relative;
            }

            .queue-toggle:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
            }

            .queue-icon {
                font-size: 16px;
                color: white;
            }

            .queue-count {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ff4757;
                color: white;
                border-radius: 10px;
                min-width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
            }

            .queue-panel {
                position: absolute;
                bottom: 60px;
                left: 0;
                width: 350px;
                max-height: 400px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                border: 1px solid rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }

            .queue-header {
                padding: 16px 20px;
                background: #f8f9fa;
                border-bottom: 1px solid #e9ecef;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: 600;
                color: #495057;
            }

            .queue-actions {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .queue-clear {
                background: #dc3545;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                transition: background 0.2s;
            }

            .queue-clear:hover {
                background: #c82333;
            }

            .queue-close {
                background: #58a6ff;
                color: white;
                border: none;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .queue-close:hover {
                background: #4493e6;
                transform: scale(1.05);
                box-shadow: 0 2px 8px rgba(88, 166, 255, 0.3);
            }

            .queue-list {
                max-height: 320px;
                overflow-y: auto;
            }

            .queue-item {
                padding: 12px 20px;
                border-bottom: 1px solid #f1f3f4;
                display: flex;
                align-items: flex-start;
                gap: 12px;
                transition: background 0.2s;
            }

            .queue-item:hover {
                background: #f8f9fa;
            }

            .queue-item:last-child {
                border-bottom: none;
            }

            .queue-item-icon {
                font-size: 16px;
                margin-top: 2px;
                flex-shrink: 0;
            }

            .queue-item-content {
                flex: 1;
                min-width: 0;
            }

            .queue-item-title {
                font-weight: 500;
                color: #212529;
                margin-bottom: 4px;
                font-size: 14px;
            }

            .queue-item-message {
                color: #6c757d;
                font-size: 13px;
                line-height: 1.4;
                word-wrap: break-word;
            }

            .queue-item-time {
                font-size: 11px;
                color: #adb5bd;
                margin-top: 4px;
            }

            .queue-item-status {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                margin-top: 6px;
                flex-shrink: 0;
            }

            .queue-item-status.success { background: #28a745; }
            .queue-item-status.error { background: #dc3545; }
            .queue-item-status.warning { background: #ffc107; }
            .queue-item-status.info { background: #17a2b8; }

            .queue-empty {
                padding: 40px 20px;
                text-align: center;
                color: #6c757d;
                font-size: 14px;
            }
        `;
        document.head.appendChild(style);
    }

    bindEvents() {
        const toggle = document.getElementById('queue-toggle');
        const panel = document.getElementById('queue-panel');
        const clearBtn = document.getElementById('queue-clear');
        const closeBtn = document.getElementById('queue-close');

        toggle?.addEventListener('click', () => {
            this.isMinimized = !this.isMinimized;
            panel.style.display = this.isMinimized ? 'none' : 'block';
        });

        clearBtn?.addEventListener('click', () => {
            this.clearQueue();
        });

        closeBtn?.addEventListener('click', () => {
            this.isMinimized = true;
            panel.style.display = 'none';
        });

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.container?.contains(e.target)) {
                this.isMinimized = true;
                panel.style.display = 'none';
            }
        });
    }

    addNotification(notification) {
        const queueItem = {
            id: Date.now() + Math.random(),
            title: notification.title || 'Notification',
            message: notification.message || notification.body || '',
            type: notification.type || 'info',
            icon: this.getIcon(notification.type),
            timestamp: new Date(),
            ...notification
        };

        // Add to beginning of queue
        this.queue.unshift(queueItem);

        // Limit queue size
        if (this.queue.length > this.maxSize) {
            this.queue = this.queue.slice(0, this.maxSize);
        }

        this.updateUI();
        this.saveQueue();
    }

    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            default: '🔔'
        };
        return icons[type] || icons.default;
    }

    updateUI() {
        const countEl = document.getElementById('queue-count');
        const listEl = document.getElementById('queue-list');

        if (countEl) {
            countEl.textContent = this.queue.length;
            countEl.style.display = this.queue.length > 0 ? 'flex' : 'none';
        }

        if (listEl) {
            if (this.queue.length === 0) {
                listEl.innerHTML = '<div class="queue-empty">No notifications</div>';
            } else {
                listEl.innerHTML = this.queue.map(item => `
                    <div class="queue-item">
                        <div class="queue-item-icon">${item.icon}</div>
                        <div class="queue-item-content">
                            <div class="queue-item-title">${this.escapeHtml(item.title)}</div>
                            <div class="queue-item-message">${this.escapeHtml(item.message)}</div>
                            <div class="queue-item-time">${this.formatTime(item.timestamp)}</div>
                        </div>
                        <div class="queue-item-status ${item.type}"></div>
                    </div>
                `).join('');
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatTime(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        
        return timestamp.toLocaleDateString();
    }

    clearQueue() {
        this.queue = [];
        this.updateUI();
        this.saveQueue();
    }

    saveQueue() {
        try {
            localStorage.setItem('choco-notification-queue', JSON.stringify(this.queue));
        } catch (e) {
            console.warn('Failed to save notification queue:', e);
        }
    }

    loadStoredQueue() {
        try {
            const stored = localStorage.getItem('choco-notification-queue');
            if (stored) {
                this.queue = JSON.parse(stored).map(item => ({
                    ...item,
                    timestamp: new Date(item.timestamp)
                }));
                this.updateUI();
            }
        } catch (e) {
            console.warn('Failed to load notification queue:', e);
            this.queue = [];
        }
    }
}

// Initialize notification queue
let notificationQueueInstance = null;

function initNotificationQueue() {
    if (!notificationQueueInstance) {
        notificationQueueInstance = new NotificationQueue();
    }
    return notificationQueueInstance;
}

// Add notification to queue
function addToNotificationQueue(notification) {
    const queue = initNotificationQueue();
    queue.addNotification(notification);
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.ChocoNotificationQueue = {
        init: initNotificationQueue,
        add: addToNotificationQueue,
        getInstance: () => notificationQueueInstance
    };
}
