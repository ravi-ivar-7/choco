# 🍫 Choco — Personal Browser Session Sync

**Description:**  
Choco is a browser extension + backend service that helps individuals securely sync their browser sessions across their personal devices with end-to-end encryption.

Choco collects only the data you explicitly configure — it respects user-defined boundaries and encrypts all data in your chosen storage location.

## ⚠️ Important Disclaimer

This extension is intended solely for **personal use** to sync your own browser sessions across your personal devices. It should only be used on devices you own and control. Any use of this extension to access accounts or data without authorization is strictly prohibited and may violate applicable laws, terms of service, or privacy rights. The creator assumes no liability for any misuse, including but not limited to account bans, data loss, unauthorized access, or related consequences.

---

## 📌 Overview

Choco helps individuals maintain consistent browser sessions across their personal devices by automating session data synchronization based on your personal configuration.

**How it works:**
1. Monitors session data as defined in your personal configuration (cookies, localStorage, sessionStorage, etc)
2. Automatically syncs valid session data across your devices through encrypted storage
3. Applies stored session data when you visit configured domains on different devices
4. Falls back to manual login when session data is invalid or expired
5. Updates your personal session store when new valid session data is detected  

---