# Choco Project Structure

## Complete Codebase Architecture

```bash
choco/
├─ extension/                    # Chrome Extension (Manifest V3)
│  ├─ manifest.json              # Extension configuration & permissions
│  ├─ popup.html                 # Extension popup UI
│  ├─ popup.css                  # Popup styling
│  ├─ popup.js                   # Popup logic & user interactions
│  ├─ background.js              # Service worker - token monitoring & sync
│  ├─ content.js                 # Content script - notification handler
│  ├─ assets/                    # Extension icons & resources
│  └─ lib/                       # Modular extension libraries
│     ├─ api/
│     │  ├─ user.js              # User authentication API
│     │  └─ platform.js          # Platform token management API
│     ├─ platforms/
│     │  └─ maang/
│     │     └─ index.js          # Maang.in platform integration
│     └─ utils/
│        ├─ chrome.js            # Chrome API utilities
│        ├─ notifications.js     # Toast & dialog notification system
│        └─ storage.js           # Chrome storage operations
│
├─ backend/                      # Next.js 14 Full-Stack Application
│  ├─ app/                       # App Router (Next.js 14)
│  │  ├─ layout.tsx              # Root layout with global styles
│  │  ├─ page.tsx                # Landing page
│  │  ├─ globals.css             # Global CSS styles
│  │  ├─ login/
│  │  │  └─ page.tsx             # Admin login page
│  │  ├─ admin/
│  │  │  ├─ page.tsx             # Admin dashboard overview
│  │  │  └─ components/          # Admin dashboard components
│  │  │     ├─ DashboardStats.tsx
│  │  │     ├─ OverviewTab.tsx
│  │  │     ├─ MembersTab.tsx
│  │  │     ├─ TeamsTab.tsx
│  │  │     ├─ TokensTab.tsx
│  │  │     ├─ SettingsTab.tsx
│  │  │     ├─ LogsTab.tsx
│  │  │     └─ Sidebar.tsx
│  │  └─ api/                    # API Routes (Next.js API)
│  │     ├─ auth/
│  │     │  ├─ login/route.ts    # POST /api/auth/login
│  │     │  └─ logout/route.ts   # POST /api/auth/logout
│  │     ├─ platform/
│  │     │  ├─ token/route.ts    # GET/POST /api/platform/token
│  │     │  ├─ tokens/route.ts   # GET /api/platform/tokens
│  │     │  └─ validate/route.ts # POST /api/platform/validate
│  │     ├─ teams/
│  │     │  └─ route.ts          # GET /api/teams
│  │     └─ members/
│  │        └─ route.ts          # GET /api/members
│  │
│  ├─ lib/                       # Backend utilities & configuration
│  │  ├─ db.ts                   # Drizzle ORM database connection
│  │  ├─ schema.ts               # Database schema definitions
│  │  ├─ auth.ts                 # JWT authentication middleware
│  │  ├─ crypto.ts               # AES-256 encryption/decryption
│  │  ├─ password-utils.ts       # Password hashing utilities
│  │  └─ utils.ts                # General utility functions
│  │
│  ├─ components/                # Shared React components
│  │  ├─ ui/                     # UI component library
│  │  └─ forms/                  # Form components
│  │
│  ├─ scripts/
│  │  └─ init-db.ts              # Database initialization script
│  │
│  ├─ drizzle.config.ts          # Drizzle ORM configuration
│  ├─ next.config.js             # Next.js configuration
│  ├─ tailwind.config.js         # Tailwind CSS configuration
│  ├─ tsconfig.json              # TypeScript configuration
│  ├─ package.json               # Backend dependencies
│  ├─ .env                       # Environment variables (local)
│  └─ .env.example               # Environment template
│
├─ docs/
│  ├─ readme.md                  # Project documentation
│  └─ structure.md               # This file - codebase structure
│
├─ package.json                  # Root package.json
├─ vercel.json                   # Vercel deployment configuration
├─ README.md                     # Main project README
└─ .gitignore                    # Git ignore rules
```

## Architecture Overview

### **Chrome Extension (Frontend)**
- **Manifest V3** service worker architecture
- **Modular design** with reusable lib components
- **Real-time token monitoring** on maang.in domains
- **Toast notification system** for user feedback
- **Secure API communication** with backend

### **Next.js Backend (Full-Stack)**
- **Next.js 14** with App Router
- **Drizzle ORM** with PostgreSQL database
- **JWT authentication** for admin access
- **AES-256 encryption** for sensitive token storage
- **RESTful API** endpoints for extension communication
- **Responsive admin dashboard** with real-time data

### **Database Schema**
- **teams** - Web platform team accounts
- **users** - Authorized team members
- **tokens** - Encrypted platform tokens with metadata

### **Key Features**
- **Token Synchronization** - Real-time sync between browser and team database
- **Navigation-Based Notifications** - Smart notifications on maang.in page loads
- **Secure Storage** - Encrypted token storage with team sharing
- **Admin Dashboard** - Complete token and user management interface
- **Production Ready** - Clean, maintainable code with proper error handling

### **Technology Stack**
- **Frontend**: Chrome Extension API, Vanilla JavaScript, Next.js 14
- **Backend**: Next.js 14, TypeScript, Drizzle ORM
- **Database**: PostgreSQL (Supabase)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Security**: JWT, AES-256 encryption, HTTPS-only
```