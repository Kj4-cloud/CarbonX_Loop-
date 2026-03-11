import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../Seller/shared/Sidebar";
import { useAuth } from "../context/AuthContext";
import "./SellerLayout.css";

const NAV_ITEMS = [
  {
    path: "/seller/dashboard",
    icon: "dashboard",
    label: "Dashboard",
    filled: true,
  },
  {
    path: "/seller/projects",
    icon: "assignment",
    label: "Projects",
    filled: true,
  },
  {
    path: "/seller/analytics",
    icon: "analytics",
    label: "Analytics",
    filled: true,
  },
  {
    path: "/seller/wallet",
    icon: "account_balance_wallet",
    label: "Wallet",
    filled: true,
  },
  {
    path: "/seller/blockchain",
    icon: "verified",
    label: "Blockchain",
    filled: true,
  },
];

/**
 * SellerLayout — The authenticated farmer/seller dashboard shell.
 * Renders a fixed Sidebar on the left and an <Outlet /> for nested pages.
 */
export default function SellerLayout() {
  const { user, farmerProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const userInfo = {
    name:
      farmerProfile?.full_name || user?.user_metadata?.full_name || "Farmer",
    subtitle: farmerProfile?.farm_id
      ? `ID: #${farmerProfile.farm_id}`
      : "CarbonX Farmer",
    avatar: farmerProfile?.avatar_url || user?.user_metadata?.avatar_url || "",
  };

  return (
    <div className="seller-layout">
      {/* Sidebar */}
      <Sidebar
        appName="carbonX"
        appIcon="eco"
        navItems={NAV_ITEMS}
        userInfo={userInfo}
        onSignOut={handleSignOut}
      />

      {/* Main content area — offset by sidebar width */}
      <div className="seller-layout-content">
        <Outlet />
      </div>
    </div>
  );
}
