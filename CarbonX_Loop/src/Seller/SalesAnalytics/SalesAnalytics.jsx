import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import "./SalesAnalytics.css";

/**
 * SalesAnalytics - Carbon credit sales & revenue analytics dashboard.
 * Shows KPIs, charts, and revenue breakdowns.
 *
 * @param {Object} [props.data] - Analytics data override
 */
export default function SalesAnalytics({ data: propData }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchSales = async () => {
      setLoading(true);
      const { data: salesData, error } = await supabase
        .from("sales_transactions")
        .select("*")
        .eq("farmer_id", user.id)
        .order("transaction_date", { ascending: false });

      if (error && error.code !== "PGRST116") {
        console.warn("SalesAnalytics: fetch error", error.message);
      }

      if (salesData && salesData.length > 0) {
        setTransactions(salesData);
      }
      setLoading(false);
    };
    fetchSales();
  }, [user]);

  // BUG-06 fix: compute KPIs & transactions from DB data when available
  const hasDbData = transactions.length > 0;

  const computedKpis = hasDbData
    ? [
        {
          label: "Credits Generated",
          value: transactions
            .reduce((sum, t) => sum + (t.credits || 0), 0)
            .toLocaleString(),
          unit: "CRD",
          change: "+—",
          color: "var(--primary)",
        },
        {
          label: "Credits Sold",
          value: transactions
            .filter((t) => t.status === "Completed")
            .reduce((sum, t) => sum + (t.credits || 0), 0)
            .toLocaleString(),
          unit: "CRD",
          change: "+—",
          color: "var(--primary)",
        },
        {
          label: "Total Revenue",
          value:
            "₹" +
            transactions
              .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
              .toLocaleString(),
          unit: "INR",
          change: "+—",
          color: "var(--primary)",
        },
      ]
    : [
        {
          label: "Credits Generated",
          value: "1,250",
          unit: "CRD",
          change: "+15.2%",
          color: "var(--primary)",
        },
        {
          label: "Credits Sold",
          value: "900",
          unit: "CRD",
          change: "+20.8%",
          color: "var(--primary)",
        },
        {
          label: "Total Revenue",
          value: "₹4,800",
          unit: "INR",
          change: "+18.5%",
          color: "var(--primary)",
        },
      ];

  const computedTransactions = hasDbData
    ? transactions.slice(0, 5).map((t) => ({
        buyer: t.buyer_name,
        credits: t.credits,
        amount: "₹" + Number(t.amount).toLocaleString(),
        date: new Date(t.transaction_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status: t.status,
      }))
    : [
        {
          buyer: "GreenTech Corp",
          credits: 120,
          amount: "₹640",
          date: "Mar 1, 2024",
          status: "Completed",
        },
        {
          buyer: "EcoVentures Ltd",
          credits: 80,
          amount: "₹428",
          date: "Feb 28, 2024",
          status: "Completed",
        },
        {
          buyer: "CleanAir Fund",
          credits: 200,
          amount: "₹1,060",
          date: "Feb 25, 2024",
          status: "Pending",
        },
      ];

  const data = {
    kpis: computedKpis,
    revenueBreakdown: [
      { month: "Jan", amount: 320 },
      { month: "Feb", amount: 410 },
      { month: "Mar", amount: 380 },
      { month: "Apr", amount: 520 },
      { month: "May", amount: 470 },
      { month: "Jun", amount: 610 },
      { month: "Jul", amount: 560 },
      { month: "Aug", amount: 680 },
    ],
    recentTransactions: computedTransactions,
    ...propData,
  };

  const maxBar = Math.max(...data.revenueBreakdown.map((d) => d.amount));

  return (
    <main className="sa-main">
      <div className="sa-header">
        <div>
          <h1 className="sa-title">Sales & Revenue Analytics</h1>
          <p className="sa-subtitle">
            Manage your carbon credit sales performance and revenue.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="sa-kpis animate-fade-in">
        {data.kpis.map((kpi, i) => (
          <div
            key={i}
            className="sa-kpi-card"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <span className="sa-kpi-label">{kpi.label}</span>
            <div className="sa-kpi-value-row">
              <span className="sa-kpi-value">{kpi.value}</span>
            </div>
            <span className="sa-kpi-unit">{kpi.unit}</span>
            <span className="sa-kpi-change" style={{ color: kpi.color }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "0.875rem" }}
              >
                trending_up
              </span>
              {kpi.change}
            </span>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <section
        className="sa-chart-card animate-fade-in"
        style={{ animationDelay: "0.2s" }}
      >
        <h3 className="sa-chart-title">Monthly Revenue</h3>
        <div className="sa-chart">
          {data.revenueBreakdown.map((item, i) => (
            <div key={i} className="sa-chart-bar-group">
              <div className="sa-chart-bar-container">
                <div
                  className="sa-chart-bar"
                  style={{
                    height: `${(item.amount / maxBar) * 100}%`,
                    background:
                      i >= data.revenueBreakdown.length - 2
                        ? "var(--primary)"
                        : "var(--slate-200)",
                    animationDelay: `${i * 0.05 + 0.3}s`,
                  }}
                />
              </div>
              <span className="sa-chart-label">{item.month}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Transactions */}
      <section
        className="sa-transactions-card animate-fade-in"
        style={{ animationDelay: "0.3s" }}
      >
        <div className="sa-transactions-header">
          <h3 className="sa-chart-title">Recent Transactions</h3>
          <button className="sa-view-all-btn">View All</button>
        </div>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Credits</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTransactions.map((tx, i) => (
                <tr key={i}>
                  <td className="sa-table-buyer">{tx.buyer}</td>
                  <td>{tx.credits}</td>
                  <td className="sa-table-amount">{tx.amount}</td>
                  <td className="sa-table-date">{tx.date}</td>
                  <td>
                    <span
                      className={`badge ${tx.status === "Completed" ? "badge-green" : "badge-orange"}`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
