import React from "react";

export default function CartModal({
  cart,
  totalPrice,
  onClose,
  onUpdateQuantity,
  onCheckout,
}) {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      id="cart-modal"
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-content-center p-4 animate-fade-in"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      style={{ justifyContent: "center" }}
    >
      <div className="bg-white dark:bg-[#1a2b21] rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-[#e3e8e5] dark:border-[#2d4235] flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-black text-[#0c1510] dark:text-[#f0f4f2]">
            Shopping Cart
          </h2>
          <button
            id="close-cart"
            onClick={onClose}
            aria-label="Close cart"
            className="w-8 h-8 rounded-full bg-[#f0f4f2] dark:bg-[#2d4235] flex items-center justify-center cursor-pointer border-none text-[#0c1510] dark:text-[#f0f4f2] hover:bg-[#e3e8e5] dark:hover:bg-[#4a6354] transition-colors"
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {/* Items */}
        <div id="cart-items" className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-icons-round block text-6xl text-[#c7d1cc] dark:text-[#4a6354] mb-3">
                shopping_cart
              </span>
              <p className="text-[#718b7c]">Your cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 mb-4 pb-4 border-b border-[#e3e8e5] dark:border-[#2d4235] last:border-0 last:mb-0 last:pb-0"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-[#0c1510] dark:text-[#f0f4f2]">
                    {item.name}
                  </h4>
                  <p className="text-xs text-[#718b7c]">{item.location}</p>
                  <p className="text-[#13ec6d] font-black text-sm mt-1">
                    ₹{item.price.toFixed(0)} × {item.quantity}
                  </p>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    aria-label="Decrease"
                    className="w-8 h-8 rounded-full bg-[#f0f4f2] dark:bg-[#2d4235] flex items-center justify-center cursor-pointer border-none text-[#0c1510] dark:text-[#f0f4f2] hover:bg-[#13ec6d] hover:text-[#0c1510] transition-colors"
                  >
                    <span
                      className="material-icons-round"
                      style={{ fontSize: "0.875rem" }}
                    >
                      remove
                    </span>
                  </button>
                  <span className="font-bold w-8 text-center text-[#0c1510] dark:text-[#f0f4f2]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    aria-label="Increase"
                    className="w-8 h-8 rounded-full bg-[#f0f4f2] dark:bg-[#2d4235] flex items-center justify-center cursor-pointer border-none text-[#0c1510] dark:text-[#f0f4f2] hover:bg-[#13ec6d] hover:text-[#0c1510] transition-colors"
                  >
                    <span
                      className="material-icons-round"
                      style={{ fontSize: "0.875rem" }}
                    >
                      add
                    </span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#e3e8e5] dark:border-[#2d4235] flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[#718b7c] font-semibold">Total</span>
            <span
              id="cart-total"
              className="text-2xl font-black text-[#13ec6d]"
            >
              ₹{totalPrice.toFixed(0)}
            </span>
          </div>
          <button
            id="checkout-btn"
            onClick={onCheckout}
            className="w-full bg-[#13ec6d] hover:bg-[#0fc85d] text-[#0c1510] font-black py-4 rounded-xl transition-colors cursor-pointer border-none font-[Manrope] text-base hover:shadow-lg flex items-center justify-center gap-2"
          >
            <span className="material-icons-round" style={{ fontSize: "1.15rem" }}>
              lock
            </span>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
