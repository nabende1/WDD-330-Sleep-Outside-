// src/js/cartUtils.mjs
import { getLocalStorage } from "./utils.mjs";

/**
 * Update the cart icon count based on total item quantities
 */
export function updateCartCount() {
  const cartItems = getLocalStorage("so-cart") || [];
  const totalQty = cartItems.reduce((sum, item) => sum + (item.Qty || 1), 0);

  const cartCount = document.querySelector(".cart-count");
  if (cartCount) cartCount.textContent = totalQty;
}
