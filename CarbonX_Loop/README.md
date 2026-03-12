# CarbonX Loop 🌍

CarbonX Loop is a decentralized, transparent, and user-friendly marketplace for Carbon Credits, connecting local farmers (Sellers) with environmentally conscious individuals and organizations (Buyers). Built with modern web technologies and blockchain integration, the platform ensures the authenticity and traceability of every carbon credit minted.

---

## 🚀 Features

### For Sellers (Farmers)
- **Farmer Dashboard**: Track carbon offset projects, monitor total revenue, and manage farm parcels.
- **Project Submission**: Register new carbon projects by providing GPS locations and photos. Integrates with **Sentinel Hub** to fetch satellite NDVI data for accurate vegetation analysis and carbon credit estimation.
- **Wallet & Minting**: Connect with MetaMask to mint verified carbon credits directly onto the blockchain.
- **Analytics & Reporting**: View detailed sales analytics, transaction history, and generate premium PDF Audit Reports for transparency.

### For Buyers
- **Marketplace**: Browse listed carbon projects and purchase carbon credits to offset your carbon footprint.
- **Integrated Wallet**: Deposit and withdraw funds seamlessly (with UPI simulation) to purchase credits.
- **Certificates**: Generate and download beautifully designed, tamper-proof Carbon Offset Certificates upon purchase.
- **Blockchain Verification**: View true on-chain data for all purchased credits, ensuring transparency and preventing double-counting.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) for lightning-fast development and optimized production builds.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) for a utility-first, fully responsive, and premium UI design (including custom dark/light modes).
- **Authentication & Database**: [Supabase](https://supabase.com/) for secure, role-based user authentication (Farmers vs. Standard Users) and real-time database management.
- **Blockchain Integration**: [Ethers.js](https://docs.ethers.org/v6/) for connecting to MetaMask and interacting with the Web3 smart contracts.
- **Mapping & Satellite Data**: [React Leaflet](https://react-leaflet.js.org/) & [Geoman](https://geoman.io/) for farm parcel drawing, integrated with **Sentinel Hub** for NDVI satellite imagery.
- **PDF Generation**: [jsPDF](https://parall.ax/products/jspdf) and [jsPDF AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) for rendering luxury transaction certificates and audit reports.

---

## 📁 Project Structure

```
CarbonX_Loop/
├── src/
│   ├── auth/          # Authentication flows (Login, Register, Password Reset)
│   ├── components/    # Reusable UI components (Modals, Buttons, Inputs)
│   ├── context/       # React Context providers (Auth, Theme, Wallet)
│   ├── hooks/         # Custom React hooks (useStore, etc.)
│   ├── layouts/       # Structural layouts (BuyerLayout, SellerLayout)
│   ├── Seller/        # Farmer/Seller specific pages & features
│   │   ├── FarmerProfileDashboard/
│   │   ├── ProjectSubmission/
│   │   ├── WalletPage/
│   │   ├── BlockchainExplorer/
│   │   └── shared/    # Seller sidebar and top navigation
│   ├── Buyer/         # Buyer/Standard user specific pages
│   │   └── ...        # Marketplace, Wallet, History
│   ├── App.jsx        # Main application router
│   └── main.jsx       # React entry point
├── public/            # Static assets (Logos, Icons)
├── index.html         # HTML entry point
├── package.json       # Project dependencies and scripts
└── README.md          # You are here!
```

---

## 🏃‍♂️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A [Supabase](https://supabase.com/) account and project
- [MetaMask](https://metamask.io/) browser extension installed

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd CarbonX_Loop
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The app will typically be available at `http://localhost:5173`.

---

## 🎨 Design Philosophy

CarbonX aims for a **premium, professional, and eco-friendly** aesthetic. 
- The color palette heavily relies on rich emerald greens (`#13ec6d`), dark forest themes, and crisp white/slate tones.
- Typography is driven by `Manrope` for clean, modern readability.
- The UI incorporates subtle glassmorphism, smooth animations (`animate-slide-up`, `animate-fade-in`), and interactive hover states to ensure a dynamic user experience.

---

## 📜 License
This project is proprietary and confidential. All rights reserved.
