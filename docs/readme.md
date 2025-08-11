# 🍫 Choco — Team Access Manager for Web Platforms

**Short description:**  
Choco is a browser extension + backend service that helps a small, approved team securely manage and sync official authentication tokens for web platform (**maang.in**) team accounts.  

Choco does **not** steal or inject cookies without consent — it uses only approved APIs or flows, and encrypts tokens in a secure backend so authorized members can refresh their access when needed.  

---

## 📌 Overview

Choco makes it easy for your group to stay logged in to a shared web platform account with permission, without everyone having to log in manually all the time.

**It:**
1. Checks if your current token is still valid.  
2. If not, fetches the latest approved token from the Choco backend.  
3. If no valid token exists, lets you log in directly to the web platform.  
4. Stores the updated token in the backend (encrypted) for teammates to use.  

---

## 🎯 Goals
- Smooth, secure multi-user access for a shared web platform account.  
- No raw cookies stored in browsers — tokens handled server-side.  
- Only members explicitly added to the Choco team can access the shared token.  
- Audit logs for all token updates.  

---

## 🛠 Architecture

### **Browser Extension (Choco Client)**
- UI for checking login state and initiating token refresh/login.  
- Talks securely to Choco backend.  
- Injects approved tokens into maang.in session when needed.  

### **Backend (Choco Server)**
- Holds the encrypted refresh token.  
- Syncs token updates between members.  
- Handles permission checks and audit logs.  

### **Database**
- Stores team info, user profiles, encrypted token data, and audit history.  

---

## 🔄 How It Works

1. **User opens maang.in**  
   - Extension checks if your local refresh token is valid.  
   - **Message:**  
     ```
     🔍 Checking local token...
     ✅ Local token valid — you're logged in.
     ```  
     or  
     ```
     🔍 Checking local token...
     ❌ Local token missing or invalid.
     ```

2. **If valid** → Continue browsing normally.  

3. **If invalid**:  
   - Extension requests the latest token from the Choco backend.  
   - **Message:**  
     ```
     📡 Fetching latest team token from Choco...
     ✅ Team token found and applied — you're logged in.
     ```  
     or  
     ```
     📡 Fetching latest team token from Choco...
     ❌ No valid team token found.
     ```

4. **If no valid token exists**:  
   - Extension prompts user to log in manually to the web platform (Google login supported).  
   - After login, extension securely sends the new token to backend.  
   - Backend updates the shared token for the whole team.  
   - **Message:**  
     ```
     ⚠️ No valid token found.
     👉 Please log in to maang.in now.
     ```  
     After successful login:  
     ```
     🔐 Login detected — saving token for team...
     ✅ Token saved and synced for your team.
     ```
---

## 🛡 Security Practices

- Tokens stored **encrypted** in backend (e.g., AES-256).  
- HTTPS-only communication.  
- Backend verifies that each request comes from an **authenticated, authorized** team member.  
- Audit logs store:
  - Who updated the token  
  - When it was updated  
  - Source IP + device fingerprint  

---

## For style, UI, design inspiration:
- Take reference from `/docs/style-reference.jsx` file for all pages, components, extensions, etc.

## For database integration, take reference from:
- `/backed/reference `