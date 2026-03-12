import { useState, useEffect, useCallback, createContext, useContext, createElement } from "react";

const STORAGE_KEYS = {
  theme: "carbonx_theme",
  favorites: "carbonx_favorites",
  cart: "carbonx_cart",
};

function readStorage(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

/* ── Shared Theme Context ── */
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.theme);
    return stored ? stored === "dark" : false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem(STORAGE_KEYS.theme, isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = useCallback(() => setIsDark((d) => !d), []);

  return createElement(ThemeContext.Provider, { value: { isDark, toggleTheme } }, children);
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a <ThemeProvider>");
  }
  return ctx;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(() =>
    readStorage(STORAGE_KEYS.favorites, []),
  );

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
      localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(next));
      return next;
    });
  }, []);

  return { favorites, toggleFavorite };
}

export function useCart() {
  const [cart, setCart] = useState(() => readStorage(STORAGE_KEYS.cart, []));

  const persist = (next) => {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(next));
    return next;
  };

  const addToCart = useCallback((project) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === project.id);
      const next = exists
        ? prev.map((i) =>
            i.id === project.id ? { ...i, quantity: i.quantity + 1 } : i,
          )
        : [...prev, { ...project, quantity: 1 }];
      return persist(next);
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => persist(prev.filter((i) => i.id !== id)));
  }, []);

  const updateQuantity = useCallback((id, delta) => {
    setCart((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item) return prev;
      if (item.quantity + delta <= 0)
        return persist(prev.filter((i) => i.id !== id));
      return persist(
        prev.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity + delta } : i,
        ),
      );
    });
  }, []);

  const clearCart = useCallback(() => setCart(persist([])), []);

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };
}

export function useNotification() {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 2500);
  }, []);

  return { notifications, showNotification };
}
