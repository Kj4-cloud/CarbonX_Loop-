import { createContext, useContext, useState, useMemo } from "react";

// ── Simulated carbon credit market data ──
// Generates realistic price history with smooth curves

function generatePriceHistory(days, basePrice, volatility) {
  const data = [];
  let price = basePrice * (0.85 + Math.random() * 0.1); // start lower
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Gradual upward trend + random noise
    const trend = (days - i) * (volatility * 0.3) / days;
    const noise = (Math.random() - 0.45) * volatility;
    price = Math.max(price + trend + noise, basePrice * 0.7);

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fullDate: date,
      price: Math.round(price * 100) / 100,
    });
  }
  return data;
}

// Pre-generate stable data per range (seeded by range key)
const RANGE_CONFIG = {
  "1W": { days: 7, basePrice: 1350, volatility: 40 },
  "1M": { days: 30, basePrice: 1200, volatility: 80 },
  "3M": { days: 90, basePrice: 1100, volatility: 120 },
  "1Y": { days: 365, basePrice: 900, volatility: 200 },
};

const CarbonPriceContext = createContext(null);

export function CarbonPriceProvider({ children }) {
  const [selectedRange, setSelectedRange] = useState("1M");

  // Memoize so data doesn't regenerate on every render
  const allData = useMemo(() => {
    const result = {};
    for (const [key, config] of Object.entries(RANGE_CONFIG)) {
      result[key] = generatePriceHistory(config.days, config.basePrice, config.volatility);
    }
    return result;
  }, []);

  const priceHistory = allData[selectedRange];
  const currentPrice = priceHistory[priceHistory.length - 1].price;

  const prices = priceHistory.map((d) => d.price);
  const high24h = Math.max(...prices.slice(-7));
  const low24h = Math.min(...prices.slice(-7));

  const volume = Math.round(3000 + Math.random() * 3000);

  const value = {
    selectedRange,
    setSelectedRange,
    priceHistory,
    currentPrice,
    high24h,
    low24h,
    volume,
    ranges: Object.keys(RANGE_CONFIG),
  };

  return (
    <CarbonPriceContext.Provider value={value}>
      {children}
    </CarbonPriceContext.Provider>
  );
}

export function useCarbonPrice() {
  const ctx = useContext(CarbonPriceContext);
  if (!ctx) {
    throw new Error("useCarbonPrice must be used within a CarbonPriceProvider");
  }
  return ctx;
}
