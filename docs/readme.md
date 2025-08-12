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
- Stores team info, user profiles, encrypted token data, etc.  

---

## 🛡 Security Practices

- Tokens stored **encrypted** in backend (e.g., AES-256).  
- HTTPS-only communication.  
- Backend verifies that each request comes from an **authenticated, authorized** team member.  

---