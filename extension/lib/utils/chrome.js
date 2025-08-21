class ChromeUtils {
    static async waitForChromeAPIs() {
        return new Promise((resolve) => {
            const checkAPIs = () => {
                if (chrome?.runtime && chrome?.storage && chrome?.tabs && chrome?.scripting) {
                    resolve()
                } else {
                    setTimeout(checkAPIs, 50)
                }
            }
            checkAPIs()
        })
    }

    static async injectContentScript(tabId, files = [
        'lib/config/constants.js',
        'lib/utils/chrome.js',
        'lib/utils/getBrowserData.js',
        'lib/utils/setBrowserData.js',
        'lib/validation/baseValidation.js',
        'lib/validation/validator.js',
        'scripts/monitorStorage.js',
        'scripts/notificationQueue.js',
        'scripts/notificationDialog.js',
        'scripts/notificationToast.js',
        'content.js'
    ]) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId },
                files
            });
            return {
                success: true,
                message: 'Content script injected successfully',
                data: { tabId, files }
            }
        } catch (error) {
            return {
                success: false,
                error: `Failed to inject script in tab ${tabId}: ${error.message}`,
                data: null
            }
        }
    }

}

if (typeof window !== 'undefined') {
    window.ChromeUtils = ChromeUtils;
}
