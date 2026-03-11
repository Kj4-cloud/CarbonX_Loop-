import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import WelcomeLoginSelection from "./auth/WelcomeLoginSelection";
import SelectAccountType from "./auth/SelectAccountType";
import StandardUserRegistration from "./auth/StandardUserRegistration";
import FarmerRegistration from "./auth/FarmerRegistration";
import UnifiedLoginScreen from "./auth/UnifiedLoginScreen";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";
import AuthCallback from "./auth/AuthCallback";

// Layouts
import BuyerLayout from "./layouts/BuyerLayout";
import SellerLayout from "./layouts/SellerLayout";

// Seller Pages
import FarmerProfileDashboard from "./Seller/FarmerProfileDashboard/FarmerProfileDashboard";
import ProjectSubmission from "./Seller/ProjectSubmission/ProjectSubmission";
import SalesAnalytics from "./Seller/SalesAnalytics/SalesAnalytics";
import BlockchainExplorer from "./Seller/BlockchainExplorer/BlockchainExplorer";
import SellerWalletPage from "./Seller/WalletPage/WalletPage";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* ─── Public Auth Routes ──────────────────────────────────────── */}
      <Route path="/" element={<WelcomeLoginSelection />} />
      <Route path="/login" element={<UnifiedLoginScreen />} />
      <Route path="/select-account" element={<SelectAccountType />} />
      <Route path="/register/standard" element={<StandardUserRegistration />} />
      <Route path="/register/farmer" element={<FarmerRegistration />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* ─── Protected Buyer Routes ──────────────────────────────────── */}
      <Route
        path="/marketplace"
        element={
          <ProtectedRoute requiredType="buyer">
            <BuyerLayout />
          </ProtectedRoute>
        }
      />

      {/* ─── Protected Seller Routes ─────────────────────────────────── */}
      <Route
        path="/seller"
        element={
          <ProtectedRoute requiredType="farmer">
            <SellerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<FarmerProfileDashboard />} />
        <Route path="projects" element={<ProjectSubmission />} />
        <Route path="analytics" element={<SalesAnalytics />} />
        <Route path="wallet" element={<SellerWalletPage />} />
        <Route path="blockchain" element={<BlockchainExplorer />} />
      </Route>

      {/* Redirect any unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
