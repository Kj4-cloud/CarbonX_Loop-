# Frontend Setup Guide

> **CarbonX** — Carbon Credit Marketplace Frontend

---

## Prerequisites

| Tool      | Version  | Install                                      |
|-----------|----------|----------------------------------------------|
| Node.js   | ≥ 18 LTS | [nodejs.org](https://nodejs.org/)             |
| npm       | ≥ 9      | Bundled with Node.js                         |
| Git       | Latest   | [git-scm.com](https://git-scm.com/)          |

Verify your setup:

```bash
node -v   # should print v18.x or higher
npm -v    # should print 9.x or higher
```

---

## Tech Stack

| Layer          | Technology                        | Version |
|----------------|-----------------------------------|---------|
| UI Framework   | React                             | 19      |
| Build Tool     | Vite                              | 7       |
| CSS Framework  | Tailwind CSS (Vite plugin)        | 4       |
| Routing        | react-router-dom                  | 7       |
| Backend (BaaS) | Supabase (Auth, DB, Storage)      | 2.x     |
| Blockchain     | ethers.js (Polygon Amoy Testnet)  | 6       |
| Maps           | Leaflet + react-leaflet           | 1.9 / 5 |
| Satellite      | Sentinel Hub API                  | —       |
| Icons          | Google Material Icons             | —       |
| Font           | Manrope (Google Fonts)            | —       |

---

## 1. Clone the Repository

```bash
git clone <repository-url>
cd CarbonX_Loop
```

---

## 2. Install Dependencies

```bash
npm install
```

This installs all production and dev dependencies listed in `package.json`.

---

## 3. Environment Configuration

Copy the example environment file and fill in the values:

```bash
cp .env.example .env
```

Edit `.env` and provide the following keys:

```env
# Supabase — get from https://supabase.com/dashboard → Settings → API
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Sentinel Hub — get from https://apps.sentinel-hub.com/dashboard/
VITE_SH_CLIENT_ID=your-client-id
VITE_SH_CLIENT_SECRET=your-client-secret
```

> **Important:** Never commit your `.env` file. It is already listed in `.gitignore`.

---

## 4. Run the Development Server

```bash
npm run dev
```

- Opens at **http://localhost:5173** by default.
- Supports **Hot Module Replacement (HMR)** — changes appear instantly without full page reload.

---

## 5. Build for Production

```bash
npm run build
```

- Output goes to `dist/` directory.
- Preview the production build locally:

```bash
npm run preview
```

---

## 6. Linting

```bash
npm run lint
```

Uses ESLint with React Hooks and React Refresh plugins.

---

## 7. Project Structure (Frontend)

```
CarbonX_Loop/
├── index.html              # Entry HTML
├── vite.config.js          # Vite + Tailwind config
├── package.json            # Dependencies & scripts
├── .env.example            # Env var template
├── public/                 # Static assets (logo, images)
└── src/
    ├── main.jsx            # App entry point (providers)
    ├── App.jsx             # Route definitions
    ├── index.css           # Global styles
    ├── auth/               # Login, Register, Forgot Password
    ├── Buyer/              # Marketplace, Wallet, Portfolio, Cart
    ├── Seller/             # Dashboard, Projects, Analytics, Blockchain
    ├── components/         # Shared components (Charts, ProtectedRoute)
    ├── context/            # AuthContext, WalletContext, CarbonPriceContext
    ├── blockchain/         # ethers.js config, contract utils, hooks
    ├── hooks/              # Custom hooks (useStore, theme)
    ├── layouts/            # BuyerLayout, SellerLayout
    ├── lib/                # Supabase client
    ├── pages/              # Misc pages
    ├── styles/             # Additional CSS
    └── utils/              # Utility functions
```

---

## 8. Available Routes

### Public Routes

| Route                | Component                  |
|----------------------|----------------------------|
| `/`                  | WelcomeLoginSelection      |
| `/login`             | UnifiedLoginScreen         |
| `/select-account`    | SelectAccountType          |
| `/register/standard` | StandardUserRegistration   |
| `/register/farmer`   | FarmerRegistration         |
| `/forgot-password`   | ForgotPassword             |
| `/reset-password`    | ResetPassword              |
| `/auth/callback`     | AuthCallback               |

### Protected Buyer Routes

| Route          | Component    |
|----------------|--------------|
| `/marketplace` | BuyerLayout  |

### Protected Seller Routes

| Route                | Component              |
|----------------------|------------------------|
| `/seller/dashboard`  | FarmerProfileDashboard |
| `/seller/projects`   | ProjectSubmission      |
| `/seller/analytics`  | SalesAnalytics         |
| `/seller/wallet`     | SellerWalletPage       |
| `/seller/blockchain` | BlockchainExplorer     |

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| `VITE_SUPABASE_URL` error on start | Ensure `.env` file exists in project root with valid Supabase credentials |
| Port 5173 already in use | Kill the existing process or set `--port` flag: `npm run dev -- --port 3000` |
| Node version too old | Upgrade Node.js to v18 LTS or later |
| `npm install` fails | Delete `node_modules` and `package-lock.json`, then run `npm install` again |
