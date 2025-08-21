/**
 * Simple Dialog Notifications
 * Independent modal dialog system with action buttons
 */
class NotificationDialog {
    static show(title, message, options = {}) {
        const dialog = new NotificationDialog();
        return dialog.create(title, message, options);
    }

    create(title, message, options = {}) {
        // Remove existing dialog
        this.remove();

        const type = options.type || 'info';
        const buttons = options.buttons || [{ text: 'OK', primary: true }];

        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.id = 'choco-dialog-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // Create dialog
        const dialog = document.createElement('div');
        dialog.id = 'choco-dialog';
        dialog.style.cssText = `
            background: #1c2128;
            border: 1px solid ${this.getColor(type)};
            border-radius: 8px;
            padding: 24px;
            max-width: 400px;
            width: 90%;
            color: #f0f6fc;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        `;

        // Title
        const titleEl = document.createElement('h3');
        titleEl.textContent = title;
        titleEl.style.cssText = `
            margin: 0 0 12px 0;
            font-size: 16px;
            font-weight: 600;
            color: ${this.getColor(type)};
        `;

        // Message
        const messageEl = document.createElement('div');
        messageEl.innerHTML = message;
        messageEl.style.cssText = `
            margin: 0 0 20px 0;
            font-size: 14px;
            line-height: 1.5;
            color: #f0f6fc;
        `;

        // Buttons container
        const buttonsEl = document.createElement('div');
        buttonsEl.style.cssText = `
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        `;

        // Create buttons
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.text;
            button.style.cssText = `
                padding: 8px 16px;
                border: 1px solid ${btn.primary ? this.getColor(type) : '#6e7681'};
                background: ${btn.primary ? this.getColor(type) : 'transparent'};
                color: ${btn.primary ? '#ffffff' : '#f0f6fc'};
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s ease;
            `;

            // Hover effects
            button.addEventListener('mouseenter', () => {
                button.style.opacity = '0.8';
                button.style.transform = 'translateY(-1px)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.opacity = '1';
                button.style.transform = 'translateY(0)';
            });

            button.addEventListener('click', () => {
                if (btn.href) {
                    if (btn.target === '_self') {
                        window.location.href = btn.href;
                    } else {
                        window.open(btn.href, btn.target);
                    }
                }
                if (btn.onClick && typeof btn.onClick === 'function') {
                    btn.onClick();
                }
                this.remove();
            });

            buttonsEl.appendChild(button);
        });

        // Assemble dialog
        dialog.appendChild(titleEl);
        dialog.appendChild(messageEl);
        dialog.appendChild(buttonsEl);
        backdrop.appendChild(dialog);

        // Add to page
        document.body.appendChild(backdrop);

        // Close on backdrop click
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                this.remove();
            }
        });

        return { success: true };
    }

    remove() {
        const existing = document.getElementById('choco-dialog-backdrop');
        if (existing) {
            existing.remove();
        }
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
}

// Global access
if (typeof window !== 'undefined') {
    window.NotificationDialog = NotificationDialog;
}
