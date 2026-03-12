import React, { useState, useCallback } from "react";
import Header from "../Buyer/Header";
import BottomNav from "../Buyer/BottomNav";
import MarketplacePage from "../Buyer/MarketplacePage";
import PortfolioPage from "../Buyer/PortfolioPage";
import ImpactPage from "../Buyer/ImpactPage";
import AccountPage from "../Buyer/AccountPage";
import WalletPage from "../Buyer/WalletPage";
import BlockchainProofPage from "../Buyer/BlockchainProofPage";
import CheckoutPage from "../Buyer/CheckoutPage";
import InvoicePage from "../Buyer/InvoicePage";
import AuditReport from "../Buyer/AuditReport";
import CartModal from "../Buyer/CartModal";
import {
  useTheme,
  useFavorites,
  useCart,
  useNotification,
} from "../hooks/useStore";
import { useAuth } from "../context/AuthContext";

/**
 * BuyerLayout — The authenticated buyer dashboard.
 * Contains the header, bottom nav, and all buyer pages
 * (marketplace, portfolio, wallet, checkout, invoice, impact, account).
 */
export default function BuyerLayout() {
  const { isDark, toggleTheme } = useTheme();
  const { favorites, toggleFavorite } = useFavorites();
  const { cart, addToCart, updateQuantity, totalItems, totalPrice, clearCart } =
    useCart();
  const { notifications, showNotification } = useNotification();
  const { user } = useAuth();

  const [currentPage, setCurrentPage] = useState("marketplace");
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceData, setInvoiceData] = useState(null);

  const navigateTo = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleAddToCart = useCallback(
    (project) => {
      addToCart(project);
      showNotification(`Added ${project.name} to cart`);
    },
    [addToCart, showNotification],
  );

  const handleInfo = useCallback(
    (project) => {
      showNotification(`${project.name} — ${project.detail2Value}`);
    },
    [showNotification],
  );

  // Navigate to checkout page from cart
  const handleCheckout = useCallback(() => {
    if (cart.length === 0) {
      showNotification("Your cart is empty");
      return;
    }
    if (!user) {
      showNotification("You must be logged in to checkout.");
      return;
    }
    setCartOpen(false);
    navigateTo("checkout");
  }, [cart, user, showNotification, navigateTo]);

  // Called by CheckoutPage on successful payment
  const handleCheckoutComplete = useCallback(
    (data) => {
      setInvoiceData(data);
      navigateTo("invoice");
      showNotification("Payment successful! 🎉");
    },
    [navigateTo, showNotification],
  );

  // Hide header + bottom nav on checkout and invoice pages
  const showChrome = !["checkout", "invoice", "audit_report"].includes(currentPage);

  return (
    <div className={isDark ? "dark" : ""} style={{ minHeight: "100dvh" }}>
      <div className="min-h-dvh bg-[#f6f8f7] dark:bg-[#102218] text-[#0c1510] dark:text-[#f0f4f2] font-[Manrope] pb-24 transition-colors duration-300">
        {showChrome && (
          <Header
            isDark={isDark}
            toggleTheme={toggleTheme}
            currentPage={currentPage}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onNavigate={navigateTo}
          />
        )}

        <div id="main-content">
          {currentPage === "marketplace" && (
            <MarketplacePage
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onAddToCart={handleAddToCart}
              onInfo={handleInfo}
              searchTerm={searchTerm}
            />
          )}
          {currentPage === "portfolio" && (
            <PortfolioPage cart={cart} onNavigate={navigateTo} />
          )}
          {currentPage === "blockchain_proof" && <BlockchainProofPage />}
          {currentPage === "wallet" && <WalletPage />}
          {currentPage === "impact" && <ImpactPage />}
          {currentPage === "account" && <AccountPage />}
          {currentPage === "audit_report" && <AuditReport />}
          {currentPage === "checkout" && (
            <CheckoutPage
              cart={cart}
              totalPrice={totalPrice}
              totalItems={totalItems}
              onComplete={handleCheckoutComplete}
              onBack={() => {
                setCartOpen(true);
                navigateTo("marketplace");
              }}
              clearCart={clearCart}
            />
          )}
          {currentPage === "invoice" && (
            <InvoicePage
              invoiceData={invoiceData}
              onBackToMarket={() => navigateTo("marketplace")}
              onViewHistory={() => navigateTo("account")}
            />
          )}
        </div>

        {showChrome && (
          <BottomNav
            currentPage={currentPage}
            onNavigate={navigateTo}
            onCartOpen={() => setCartOpen(true)}
            totalItems={totalItems}
          />
        )}

        {cartOpen && (
          <CartModal
            cart={cart}
            totalPrice={totalPrice}
            onClose={() => setCartOpen(false)}
            onUpdateQuantity={updateQuantity}
            onCheckout={handleCheckout}
          />
        )}

        {/* Toast notifications */}
        {notifications.map((n) => (
          <div
            key={n.id}
            className="fixed top-20 right-5 bg-[#13ec6d] text-[#0c1510] px-6 py-3 rounded-xl shadow-lg font-bold text-sm z-[200] animate-notif max-w-[280px]"
          >
            {n.message}
          </div>
        ))}
      </div>
    </div>
  );
}
