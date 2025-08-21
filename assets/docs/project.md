# 🍫 Choco — Team Access Manager for Web Platforms

**Description:**  
Choco is a browser extension + backend service that helps teams securely manage and sync authentication credentials for web platforms based on configurable team settings.

Choco collects only the credentials defined in your team configuration — it respects user-defined boundaries and encrypts all data in a secure backend for authorized team members.

## ⚠️ Important Disclaimer

This extension is intended solely for **educational and personal use**. It should only be used to manage credentials for websites you own or have **explicit permission** to access. Any use of this extension to obtain or use credentials without authorization is strictly prohibited and may violate applicable laws, terms of service, or privacy rights. The creator assumes no liability for any misuse, including but not limited to account bans, data loss, unauthorized access, or related consequences.

---

## 📌 Overview

Choco helps teams maintain consistent access to configured web platforms by automating credential management based on your team's specific requirements.

**How it works:**
1. Monitors credentials as defined in your team configuration (cookies, localStorage, sessionStorage)
2. Automatically syncs valid credentials with team members through encrypted backend storage
3. Applies stored credentials when team members visit configured domains
4. Falls back to manual login when credentials are invalid or expired
5. Updates team credential store when new valid credentials are detected  

---