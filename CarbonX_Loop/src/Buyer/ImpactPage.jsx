import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function ImpactPage() {
  const { user } = useAuth();
  const [totalCredits, setTotalCredits] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // A helper to re-calculate everything when orders change
  const processOrders = (orders) => {
    // 1. Total credits
    const total = orders.reduce(
      (sum, order) => sum + (Number(order.total_credits) || 0),
      0,
    );
    setTotalCredits(total);

    // 2. Monthly progress
    const monthMap = {};
    orders.forEach((order) => {
      const date = new Date(order.created_at);
      const monthYear = date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      if (!monthMap[monthYear]) {
        monthMap[monthYear] = 0;
      }
      monthMap[monthYear] += Number(order.total_credits) || 0;
    });

    const months = Object.keys(monthMap)
      .map((key) => ({
        month: key,
        amount: monthMap[key],
      }))
      .sort((a, b) => {
        // Sort newest first
        return new Date("1 " + b.month) - new Date("1 " + a.month);
      });

    // Calculate width percentages relative to the highest month
    const maxAmount = Math.max(...months.map((m) => m.amount), 1); // fallback to 1 to avoid div by 0

    setMonthlyData(
      months.map((m) => ({
        ...m,
        width: Math.round((m.amount / maxAmount) * 100),
      })),
    );
  };

  const fetchOrders = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("total_credits, created_at")
        .eq("buyer_id", user.id)
        .eq("status", "completed");

      if (error) throw error;
      processOrders(data || []);
    } catch (err) {
      console.error("Error fetching impact data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Set up Realtime Subscription
    if (!user) return;

    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to INSERT, UPDATE, DELETE
          schema: "public",
          table: "orders",
          filter: `buyer_id=eq.${user.id}`,
        },    
 
 

        (payload) => {
          console.log("Realtime order update received:", payload);
          // On any change to this user's orders, refetch to keep math simple and accurate
          fetchOrders();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Dynamic Impact Calculations
  const impactItems = [
    {
      icon: "park",
      title: "Trees Equivalent",
      desc: "Carbon absorbed",
      value: Math.round(totalCredits * 2.2).toLocaleString("en-US"),
    },
    {
      icon: "directions_car",
      title: "Car Miles Offset",
      desc: "Driving equivalent",
      value: Math.round(totalCredits * 4.34).toLocaleString("en-US"),
    },
    {
      icon: "home",
      title: "Home Energy",
      desc: "Months of electricity",
      value: Math.round(totalCredits * 0.014).toLocaleString("en-US"),
    },
  ];

  return (
    <div className="px-5 flex flex-col gap-6 animate-slide-up">
      {/* Environmental Impact */}
      <div className="bg-white dark:bg-[#1a2b21] rounded-2xl p-6 border border-[#e3e8e5] dark:border-[#2d4235]">
        <h3 className="text-lg font-bold text-[#0c1510] dark:text-[#f0f4f2] mb-4">
          Your Environmental Impact
        </h3>
        <div className="flex flex-col gap-5">
          {impactItems.map((item) => (
            <div key={item.icon} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[rgba(19,236,109,0.1)] flex items-center justify-center flex-shrink-0">
                  <span className="material-icons-round text-[#13ec6d]">
                    {item.icon}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-[#0c1510] dark:text-[#f0f4f2] text-sm">
                    {item.title}
                  </p>
                  <p className="text-sm text-[#718b7c]">{item.desc}</p>
                </div>
              </div>
              <p className="text-xl font-black text-[#13ec6d]">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Progress */}
      <div className="bg-white dark:bg-[#1a2b21] rounded-2xl p-6 border border-[#e3e8e5] dark:border-[#2d4235]">
        <h3 className="text-lg font-bold text-[#0c1510] dark:text-[#f0f4f2] mb-4">
          Monthly Progress
        </h3>

        {isLoading ? (
          <p className="text-[#718b7c] text-sm text-center py-4">
            Loading data...
          </p>
        ) : monthlyData.length === 0 ? (
          <div className="text-center py-6">
            <span className="material-icons-round text-4xl text-[#c7d1cc] dark:text-[#4a6354] mb-2">
              monitoring
            </span>
            <p className="text-[#718b7c] text-sm">
              No impact data available yet. Offset carbon to see your progress!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-2">
            {monthlyData.map((row) => (
              <div key={row.month}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#718b7c]">{row.month}</span>
                  <span className="font-bold text-[#0c1510] dark:text-[#f0f4f2]">
                    {row.amount} tCO₂e
                  </span>
                </div>
                <div className="w-full bg-[#e3e8e5] dark:bg-[#2d4235] rounded-full h-2">
                  <div
                    className="bg-[#13ec6d] h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${row.width}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
