# 🚀 Installation & Setup Guide

This guide walks you through setting up the Choco extension and backend from scratch.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Extension Installation](#extension-installation)
- [Database Setup](#database-setup)
- [Backend Deployment](#backend-deployment)
- [Environment Configuration](#environment-configuration)
- [Initial Admin Account](#initial-admin-account)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- **Node.js 18+** installed
- **Chrome browser**
- **Git** for version control
- **Supabase account**  
- **Vercel account** (for production deployment)

---

## Extension Installation

### Step 1: Get the Source Code

**Download Latest Release from GitHub:**
```bash
# Clone the repository
git clone https://github.com/ravi-ivar-7/choco.git
cd choco

# Or download the latest release ZIP from:
https://github.com/ravi-ivar-7/choco/releases/latest
```

### Step 2: Configure Backend URL

Update the backend URL in extension files for your environment:

**File to update:**
- `extension/lib/config/constants.js`

```javascript
class Constants {
// For local development
    static BACKEND_URL = 'http://localhost:3000/';

// For production (update after deployment)
    // static BACKEND_URL = 'https://usechoco.vercel.app/';
}
```
### Step 3: Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `extension/` folder from the cloned repository
5. Pin the extension to your toolbar for easy access

![Chrome Extension Setup](/assets/images/chrome-extension-setup.png)

### Step 4: Verify Extension Installation

1. Visit any website
2. You should see a "👋 Welcome to Choco" notification
3. Click the Choco extension icon in your toolbar
4. The popup should open (may show connection errors until backend is set up)

---

## Database Setup

### Step 1: Create Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up/login
2. Click **New Project**
3. Choose your organization
4. Fill in project details:
   - **Name**: `choco-database` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click **Create new project** and wait for initialization

### Step 2: Get Database Connection URL

1. In your Supabase project, get your database URL:
   - Go to **Settings** → **Database**
   - Copy the **Connection string** (use the one for Drizzle ORM for production)
   - Replace `[YOUR-PASSWORD]` with your actual database password

```bash
# Example format:
DATABASE_URL="postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres"
```
---

## Backend Deployment

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Environment Configuration

Create environment file:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```bash
# Application URL (update for production)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Database connection from Supabase
DATABASE_URL="postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres"

# Generate a secure 32-character key for encryption
ENCRYPTION_KEY="your-secure-32-character-encryption-key"

# Generate a secure JWT secret
JWT_SECRET="your-jwt-secret-key-here"
```

### Step 3: Initialize Database

Run database setup commands:
```bash
# Generate database schema
npm run db:generate

# Run migrations to create tables
npm run db:migrate

```
### Step 4: Start Development Server

```bash
npm run dev
```

Backend will be available at: `http://localhost:3000`

---

## Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Your app's public URL | `http://localhost:3000` |
| `DATABASE_URL` | Supabase database connection | `postgresql://postgres:...` |
| `ENCRYPTION_KEY` | 32-char key for token encryption | `a1b2c3d4e5f6...` |
| `JWT_SECRET` | Secret for JWT token signing | `your-secret-key` |

---

## Troubleshooting

### Extension Issues

**Extension not loading:**
- Check if Developer mode is enabled
- Verify you selected the correct `extension/` folder
- Check browser console for errors

**Connection errors:**
- Verify backend URL is correct in extension files
- Ensure backend server is running
- Check network connectivity

### Backend Issues

**Database connection failed:**
- Verify DATABASE_URL format is correct
- Check Supabase project is active
- Ensure password is correct in connection string

**Migration errors:**
- Delete `backend/drizzle` folder and run `npm run db:generate` again
- Check database permissions
- Verify Supabase project is properly initialized

**Environment variable errors:**
- Ensure all required variables are set in `.env`
- Check for typos in variable names
- Verify encryption keys are exactly 32 characters

### Deployment Issues

**Vercel build fails:**
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure `backend` is set as root directory

**Extension can't connect to production:**
- Verify Vercel deployment is successful
- Check CORS settings if needed
- Ensure HTTPS is working properly

---

## Next Steps

After successful installation:

1. **Read the [Usage Guide](usage-guide.md)** for detailed usage instructions
2. **Check [Extensibility Guide](extensibility.md)** to add support for new websites
3. **Check [Project ](project.md)** to know about project

---