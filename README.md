# 🍫 Choco — Team Access Manager for Web Platforms

**Choco** is a secure browser extension + backend service that helps a small, approved team manage and sync official authentication tokens for web accounts.

## 📋 Quick Navigation

| Section | Description |
|---------|-------------|
| [📦 Extension Setup](#📦-1-extension-setup) | Install and configure Chrome extension |
| [🗄️ Database Setup](#🗄️-2-database-setup) | Create Supabase database |
| [⚙️ Backend Setup](#⚙️-3-backend-setup) | Configure and run backend server |
| [🌐 Deployment](#🌐-4-deployment) | Deploy to Vercel |
| [🎯 How to Use](#🎯-5-how-to-use) | Usage guide for team members and admins |

## ⚠️ Disclaimer

This extension is intended solely for educational and personal use.
It should only be used to manage cookies for websites you own or have explicit permission to access.
Any use of this extension to obtain or use cookies without authorization is strictly prohibited and may violate applicable laws, terms of service, or privacy rights.
The creator of this extension assumes no liability for any misuse, including but not limited to account bans, data loss, unauthorized access, or related consequences.

---

## 🚀 Quick Setup Guide

### Prerequisites
- Node.js 18+ installed
- Chrome browser
- Git
- Supabase account (for database)
- Vercel account (for deployment)

---

## 📦 1. Extension Setup

### Step 1: Get the Repository

**Option 1 – Clone using Git**
```bash
git clone https://github.com/ravi-ivar-7/choco.git
cd choco
```

**Option 2 – Download as ZIP from**  
`https://github.com/ravi-ivar-7/choco`

### Step 2: Configure Backend URL
Update the backend URL in extension files:
- `extension/popup.js` - Update `this.backendUrl`
- `extension/background.js` - Update `this.backendUrl`

```javascript
// For production
this.backendUrl = 'https://your-app.vercel.app';

// For local development
this.backendUrl = 'http://localhost:3000';
```

### Step 3: Load Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `extension/` folder from the cloned repository
5. Pin the extension to your toolbar

![Chrome Extension Setup](/assets/images/chrome-extension-setup.png)

### Step 4: Test Extension
1. Visit target website
2. You should see a "👋 Welcome to Choco" notification
3. Click the Choco extension icon in your toolbar
4. Click **Check Token Status** to verify setup

---

## 🗄️ 2. Database Setup

### Step 1: Create Supabase Project
1. Go to [Supabase](https://supabase.com/)
2. Click **New Project**
3. Choose your organization and create project
4. Wait for project initialization

### Step 2: Get Database URL
1. Go to **Settings** → **Database**
2. Copy the **Connection string** under **Connection pooling**
3. Replace `[YOUR-PASSWORD]` with your actual database password

```bash
# Example database URL format:
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"
```

---

## ⚙️ 3. Backend Setup

### Step 1: Install Dependencies
```bash
cd backend
npm install
# or
yarn install
```

### Step 2: Configure Environment
```bash
# Copy from .env.example and update the values
cp .env.example .env
```

Edit `.env` file with your configuration:
```bash
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DATABASE_URL="your-supabase-database-url"
ENCRYPTION_KEY="your-secure-32-character-encryption-key"
JWT_SECRET="your-jwt-secret-key"
```

### Step 3: Initialize Database
```bash
# Generate database schema
npm run db:generate

# Run migrations
npm run db:migrate

# Initialize admin user and demo data
npx run db:init
```

### Step 4: Start Development Server
```bash
npm run dev
```

Backend will be available at: `http://localhost:3000`

### Step 5: Access Admin Dashboard
1. Navigate to `http://localhost:3000/admin`
2. Use admin credentials displayed in terminal after running `npm run db:init`

---

## 🌐 4. Deployment

### Step 1: Prepare for Deployment
```bash
# Push your code to GitHub
git add .
git commit -m "Initial setup"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to [Vercel](https://vercel.com/)
2. Click **New Project**
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `/`

### Step 3: Configure Environment Variables
In Vercel project settings, add environment variables:
```bash
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
DATABASE_URL="your-supabase-database-url"
ENCRYPTION_KEY="your-secure-32-character-encryption-key"
JWT_SECRET="your-jwt-secret-key"
```

### Step 4: Update Extension Configuration
After deployment, update extension files with your Vercel URL:
- `extension/popup.js`
- `extension/background.js`

```javascript
this.backendUrl = 'https://your-app.vercel.app';
```

### Step 5: Reload Extension
1. Go to `chrome://extensions/`
2. Click refresh icon on Choco extension
3. Test the connection

---

## 🎯 5. How to Use

### For Team Members
1. **Install the extension** following the setup guide above
2. **Get login credentials** from your team admin
3. **Visit maang.in** - you'll see welcome notifications
4. **Click extension icon** → **Check Token Status**
5. **Login when prompted** with your team credentials
6. **Extension automatically syncs** tokens with your team database

### For Administrators
1. **Access admin dashboard** at your deployed URL + `/admin`
2. **Login with admin credentials**
3. **Manage team members, accounts, etc** 
4. **Monitor token status** in the Overview tab

---

## 📁 Project Structure
Detailed project structure is available in: `/assets/docs/structure.md`

## 🔒 Security Features
- **AES-256 Encryption** for token storage
- **JWT Authentication** for admin access
- **HTTPS-only** communication
- **Team-based access control**
- **Real-time token synchronization**

## 🆘 Troubleshooting

### Extension Issues
- Check browser console for errors
- Verify backend URL is correct
- Ensure extension has proper permissions

### Backend Issues
- Check environment variables
- Verify database connection
- Review server logs in Vercel dashboard

### Database Issues
- Confirm Supabase project is active
- Verify database URL format
- Check migration status

---

**⚠️ Important**: Always update the backend URL in extension files when deploying to production!
