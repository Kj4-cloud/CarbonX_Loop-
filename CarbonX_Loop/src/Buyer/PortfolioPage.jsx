import React, { useState, useEffect } from "react";
import { TransactionHistory } from "./Transaction-History";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import TransferCredits from "../components/TransferCredits";
import RetireCredits from "../components/RetireCredits";

export default function PortfolioPage({ onNavigate }) {
  const { user } = useAuth();
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPortfolio() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const { data: orders, error } = await supabase
          .from("orders")
          .select(
            `
            id,
            status,
            order_items (
              id,
              quantity,
              price_per_credit,
              project_id,
              farmer_projects (
                project_name,
                location,
                image_url
              )
            )
          `,
          )
          .eq("buyer_id", user.id)
          .eq("status", "completed")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Flatten the order items
        const allItems = [];
        orders.forEach((order) => {
          if (order.order_items) {
            order.order_items.forEach((item) => {
              // Group details similar to how they appeared in the cart
              allItems.push({
                id: item.id,
                name: item.farmer_projects?.project_name || "Unknown Project",
                location: item.farmer_projects?.location || "Unknown Location",
                image: item.farmer_projects?.image_url || "",
                quantity: item.quantity,
                price: item.price_per_credit,
              });
            });
          }
        });

        setPurchasedItems(allItems);
      } catch (err) {
        console.error("Error fetching portfolio:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPortfolio();
  }, [user]);

  const totalInvestment = purchasedItems.reduce(
    (s, i) => s + i.price * i.quantity,
    0,
  );
  // Calculate unique projects
  const activeProjectsCount = new Set(purchasedItems.map((i) => i.name)).size;
  // Calculate total credits
  const totalOffsetTCO2e = purchasedItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="px-5 flex flex-col gap-6 animate-slide-up">
      {/* Hero stats */}
      <div className="bg-gradient-to-br from-[rgba(19,236,109,0.2)] to-[rgba(19,236,109,0.05)] rounded-2xl p-6 border border-[rgba(19,236,109,0.2)]">
        <p className="text-[#718b7c] text-xs font-bold uppercase tracking-wider mb-2">
          Total Carbon Offset
        </p>
        <h2 className="text-4xl font-black text-[#13ec6d] mb-1">
          {totalOffsetTCO2e.toLocaleString("en-US")} tCO₂e
        </h2>
        <p className="text-[#718b7c] text-sm">
          Equivalent to {(totalOffsetTCO2e * 2.2).toFixed(0)} trees planted
        </p>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#1a2b21] rounded-xl p-4 border border-[#e3e8e5] dark:border-[#2d4235]">
          <p className="text-[#9db0a5] text-xs font-bold uppercase mb-2">
            Active Projects
          </p>
          <p className="text-2xl font-black text-[#0c1510] dark:text-[#f0f4f2]">
            {activeProjectsCount}
          </p>
        </div>
        <div className="bg-white dark:bg-[#1a2b21] rounded-xl p-4 border border-[#e3e8e5] dark:border-[#2d4235]">
          <p className="text-[#9db0a5] text-xs font-bold uppercase mb-2">
            Total Investment
          </p>
          <p className="text-2xl font-black text-[#0c1510] dark:text-[#f0f4f2]">
            ₹{totalInvestment.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Your credits */}
      <div>
        <h3 className="text-lg font-bold text-[#0c1510] dark:text-[#f0f4f2] mb-4">
          Your Credits
        </h3>
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="text-center py-8 bg-white dark:bg-[#1a2b21] rounded-xl border border-[#e3e8e5] dark:border-[#2d4235]">
              <p className="text-[#718b7c]">Loading portfolio...</p>
            </div>
          ) : purchasedItems.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-[#1a2b21] rounded-xl border border-[#e3e8e5] dark:border-[#2d4235]">
              <span className="material-icons-round block text-6xl text-[#c7d1cc] dark:text-[#4a6354] mb-3">
                eco
              </span>
              <p className="text-[#718b7c]">No credits purchased yet</p>
              <button
                onClick={() => onNavigate("marketplace")}
                className="mt-4 px-6 py-2 bg-[#13ec6d] text-[#0c1510] rounded-full font-bold text-sm hover:bg-[#0fc85d] transition-colors cursor-pointer border-none font-[Manrope]"
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            purchasedItems.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="bg-white dark:bg-[#1a2b21] rounded-xl p-4 border border-[#e3e8e5] dark:border-[#2d4235] flex items-center gap-3"
              >
                <img
                  src={
                    item.image ||
                    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop"
                  }
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="font-bold text-[#0c1510] dark:text-[#f0f4f2]">
                    {item.name}
                  </p>
                  <p className="text-xs text-[#718b7c]">{item.location}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[#13ec6d] font-black text-sm">
                      {item.quantity} Credits
                    </span>
                    <span className="text-[#718b7c] text-xs">
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Transfer & Retire Credits */}
      <div style={{ display: "flex", gap: "24px", marginTop: "32px", flexWrap: "wrap" }}>
        <TransferCredits />
        <RetireCredits />
      </div>
    </div>
  );
}
