# 🍫 Choco — Team Access Manager for Web Platforms

**Choco** is a secure browser extension + backend service that helps a small, approved team manage and sync official authentication tokens for web platform (**maang.in**) team accounts.

## 🎯 Features

- **Secure Token Management**: AES-256 encrypted tokens stored server-side
- **Team Access Control**: Only authorized team members can access shared tokens
- **Auto Token Refresh**: Seamless token validation and refresh for web platforms
- **Real-time Sync**: Token updates sync instantly across all team members
- **Audit Logs**: Complete audit trail of all token operations
- **Admin Dashboard**: Web-based admin interface for team management

## 🏗 Architecture

```
choco/
├── extension/          # Chrome browser extension
│   ├── manifest.json   # Extension configuration
│   ├── popup.html      # Extension popup UI
│   ├── popup.js        # Popup logic
│   ├── background.js   # Service worker
│   └── content.js      # Content script for maang.in
│
├── backend/            # Next.js backend + admin UI
│   ├── app/            # Next.js app directory
│   │   ├── api/        # API routes
│   │   ├── admin/      # Admin dashboard pages
│   │   └── login/      # Authentication pages
│   ├── lib/            # Shared utilities
│   │   ├── db.ts       # Database connection
│   │   ├── schema.ts   # Database schema
│   │   ├── crypto.ts   # Encryption utilities
│   │   └── auth.ts     # Authentication middleware
│   └── components/     # React components
│
└── docs/               # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Chrome browser
- Git

### Backend Setup

1. **Clone and navigate to backend**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize database**:
   ```bash
   npm run db:generate
   npm run db:migrate
   npx tsx scripts/init-db.ts
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

   The backend will be available at `http://localhost:3000`

### Extension Setup

1. **Open Chrome Extensions**:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"

2. **Load extension**:
   - Click "Load unpacked"
   - Select the `extension/` folder

3. **Pin the extension**:
   - Click the puzzle piece icon in Chrome toolbar
   - Pin the Choco extension

## 🔧 Usage

### For Team Members

1. **Install the extension** and visit `maang.in`
2. **Click the Choco extension icon** to check token status
3. **If no token exists**, log in to the web platform normally
4. **The extension will automatically detect and save** your login token
5. **Token is encrypted and synced** to the team backend

### For Administrators

1. **Visit the admin dashboard** at `http://localhost:3000/admin`
2. **Login with demo credentials**:
   - Email: `admin@choco.dev`
   - Password: `admin123`
3. **Monitor token status**, view audit logs, and manage team members

## 🔐 Security Features

- **AES-256 Encryption**: All tokens encrypted before storage
- **HTTPS Only**: All communication over secure channels
- **Authentication Required**: Backend verifies authorized team members
- **Audit Logging**: Complete trail of all operations
- **Device Fingerprinting**: Track access by device and IP
- **Session Management**: Secure admin session handling

## 📊 Admin Dashboard

The admin dashboard provides:

- **Token Status**: Current token validity and expiration
- **Team Management**: Add/remove authorized members
- **Audit Logs**: Complete history of token operations
- **Security Settings**: Configure access rules and alerts
- **Activity Monitoring**: Real-time team access activity

## 🔄 How It Works

1. **User opens maang.in** → Extension checks local token validity
2. **If valid** → Continue browsing normally
3. **If invalid** → Extension requests latest token from backend
4. **If no valid token** → Prompt user to log in manually
5. **After login** → Extension detects new token and syncs to backend
6. **Team access** → All authorized members get updated token

## 🛠 Development

### Backend Development

```bash
# Start development server
npm run dev

# Run database migrations
npm run db:migrate

# View database
npm run db:studio

# Build for production
npm run build
```

### Extension Development

1. Make changes to extension files
2. Go to `chrome://extensions/`
3. Click refresh icon on Choco extension
4. Test changes

### Database Schema

- **teams**: Web platform team accounts
- **users**: Authorized team members
- **tokens**: Encrypted authentication tokens
- **audit_logs**: Complete operation history
- **sessions**: Admin session management

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run extension tests
cd extension
npm test

# Run end-to-end tests
npm run test:e2e
```

## 📦 Production Deployment

### Backend Deployment

1. **Set production environment variables**
2. **Use a production database** (PostgreSQL recommended)
3. **Configure HTTPS** with proper SSL certificates
4. **Set strong encryption keys**
5. **Enable security headers**

### Extension Distribution

1. **Build extension for production**
2. **Submit to Chrome Web Store** (optional)
3. **Or distribute as enterprise package**

## 🔧 Configuration

### Environment Variables

```bash
# Database
DATABASE_URL="./choco.db"

# Encryption (CHANGE IN PRODUCTION!)
ENCRYPTION_KEY="your-super-secure-encryption-key"

# Server
PORT=3000
NODE_ENV=development

# Admin Credentials
ADMIN_EMAIL="admin@choco.dev"
ADMIN_PASSWORD="admin123"
```

### Extension Configuration

Edit `extension/manifest.json` to:
- Add additional host permissions
- Configure content security policy
- Set extension metadata

## 🚨 Security Considerations

- **Change default encryption key** in production
- **Use HTTPS** for all communications
- **Regularly rotate tokens** and encryption keys
- **Monitor audit logs** for suspicious activity
- **Limit team member access** to authorized personnel only
- **Use strong admin passwords**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is for educational and team use. Ensure compliance with the web platform's terms of service.

## ⚠️ Disclaimer

This tool is designed for legitimate team access management. Users are responsible for:
- Complying with the web platform's terms of service
- Ensuring proper authorization for team access
- Maintaining security of shared credentials
- Regular security audits and updates

## 🆘 Support

For issues and questions:
1. Check the admin dashboard logs
2. Review browser console for extension errors
3. Verify backend API connectivity
4. Check database connectivity and permissions

## 🎉 Demo Credentials

**Admin Dashboard:**
- Email: `admin@choco.dev`
- Password: `admin123`

**Team Member:**
- Email: `member@choco.dev`
- Password: `admin123`

---

Built with ❤️ for secure team collaboration
