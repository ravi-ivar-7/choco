```bash
choco/
├─ extension/
│  ├─ manifest.json        # Chrome extension config
│  ├─ popup.html           # UI for quick actions/status
│  ├─ popup.js             # Handles popup UI logic
│  ├─ background.js        # Service worker; no secrets
│  ├─ content.js           # Injected script for maang.in token handling
│  └─ assets/              # Icons, logos, styles
│
├─ backend/                # Next.js backend + admin UI
│  ├─ app/
│  │  ├─ layout.tsx        # Global layout with navbar/sidebar
│  │  ├─ page.tsx          # Landing / info page for project
│  │  ├─ admin/
│  │  │  ├─ page.tsx       # Admin dashboard (token status, last update, timer)
│  │  │  ├─ tokens/page.tsx    # Manage tokens
│  │  │  ├─ history/page.tsx   # Token change logs
│  │  │  ├─ users/page.tsx     # Manage authorized friends
│  │  │  ├─ settings/page.tsx  # Security rules & alerts
│  │  │  └─ logs/page.tsx      # API access logs
│  │  ├─ login/page.tsx    # Admin login
│  │  └─ logout/page.tsx   # Admin logout
│  │
│  ├─ app/api/
│  │  ├─ token/
│  │  │  ├─ route.ts       # GET latest refresh_token / POST new token
│  │  │  └─ validate/route.ts # Validate token
│  │  └─ auth/
│  │     ├─ login/route.ts # Login endpoint
│  │     └─ logout/route.ts# Logout endpoint
│  │
│  ├─ lib/                 # Shared utilities
│  │  ├─ db.ts             # Database connection
│  │  ├─ auth.ts           # Admin auth middleware
│  │  └─ crypto.ts         # Encryption/decryption for tokens
│  ├─ styles/              # Tailwind config & custom CSS
│  └─ package.json
│
├─ docs/
│  └─ README.md            # Setup & usage documentation
│
└─ tests/
   ├─ extension.test.js     # Unit tests for extension logic
   ├─ backend.test.ts       # Unit tests for backend API
   └─ e2e.test.js           # End-to-end flow tests
```