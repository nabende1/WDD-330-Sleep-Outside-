// src/js/cart.js

import {
  getLocalStorage,
  setLocalStorage,
  loadHeaderFooter,
  updateCartCount,
} from "./utils.mjs";

// ---------------------------------------------------------
// Initialize Page
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  await loadHeaderFooter();
  renderCart();
});

// ---------------------------------------------------------
// Core Rendering
// ---------------------------------------------------------
function renderCart() {
  let cartItems = mergeDuplicates(getLocalStorage("so-cart", []));
  setLocalStorage("so-cart", cartItems);

  const container = document.querySelector("#cart-main .cart-items");
  const totalEl = document.querySelector("#cart-main .cart-total");

  if (!cartItems.length) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    totalEl.textContent = "Total: $0.00";
    updateCartCount();
    return;
  }

  container.innerHTML = cartItems.map(cartItemTemplate).join("");

  updateCartTotal(cartItems);
  updateCartCount();

  attachCartEvents(cartItems);
}

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------
const mergeDuplicates = (items) => {
  const map = new Map();
  items.forEach((it) => {
    const qty = it.Qty || 1;
    if (!map.has(it.Id)) map.set(it.Id, { ...it, Qty: qty });
    else map.get(it.Id).Qty += qty;
  });
  return [...map.values()];
};

// ---------------------------------------------------------
// Template
// ---------------------------------------------------------
function cartItemTemplate(item) {
  const price = Number(item.FinalPrice || item.Price || 0);
  const total = (price * item.Qty).toFixed(2);

  return `
    <li class="cart-card divider" data-id="${item.Id}">
      <a href="/product_pages/index.html?product=${item.Id}" class="cart-card__image">
        <img src="${item.Image}" alt="${item.Name}" />
      </a>

      <a href="/product_pages/index.html?product=${item.Id}">
        <h2 class="card__name">${item.Name}</h2>
      </a>

      <p class="cart-card__color">${item.Color || "N/A"}</p>

      <div class="cart-card__quantity-wrapper">
        <button class="qty-btn minus">-</button>

        <input 
          type="number"
          class="cart-qty-input"
          value="${item.Qty}"
          min="1"
        />

        <button class="qty-btn plus">+</button>
      </div>

      <p class="cart-card__price">Price: $${price.toFixed(2)}</p>
      <p class="cart-card__total">Total: $${total}</p>

      <button class="cart-card__remove">Remove</button>
    </li>
  `;
}

// ---------------------------------------------------------
// Event Bindings
// ---------------------------------------------------------
function attachCartEvents(cartItems) {
  cartItems.forEach((item) => {
    const row = document.querySelector(`li[data-id="${item.Id}"]`);
    if (!row) return;

    const minusBtn = row.querySelector(".minus");
    const plusBtn = row.querySelector(".plus");
    const qtyInput = row.querySelector(".cart-qty-input");

    minusBtn?.addEventListener("click", () => changeQty(item.Id, -1));
    plusBtn?.addEventListener("click", () => changeQty(item.Id, 1));

    // Manual input
    qtyInput?.addEventListener("change", (e) => {
      let value = parseInt(e.target.value);
      if (isNaN(value)) value = 1;

      updateQtyManual(item.Id, value);
    });

    row
      .querySelector(".cart-card__remove")
      ?.addEventListener("click", () => removeItem(item.Id));
  });
}

// ---------------------------------------------------------
// Quantity Logic
// ---------------------------------------------------------
function changeQty(id, delta) {
  let items = getLocalStorage("so-cart", []);
  let item = items.find((it) => it.Id === id);

  // If decreasing from qty 1 → ask to remove
  if (item && item.Qty === 1 && delta === -1) {
    return removeItem(id);
  }

  // Normal update
  items = items.map((it) =>
    it.Id === id ? { ...it, Qty: Math.max(1, (it.Qty || 1) + delta) } : it,
  );

  setLocalStorage("so-cart", items);
  renderCart();
}

function updateQtyManual(id, newQty) {
  let items = getLocalStorage("so-cart", []);
  //let item = items.find((it) => it.Id === id);

  // If user types 0 or less → confirm removal
  if (newQty < 1) {
    return removeItem(id);
  }

  // Normal update
  items = items.map((it) => (it.Id === id ? { ...it, Qty: newQty } : it));

  setLocalStorage("so-cart", items);
  renderCart();
}

// ---------------------------------------------------------
// Remove Logic
// ---------------------------------------------------------
function removeItem(id) {
  confirmModal("Remove item from cart?", () => {
    const items = getLocalStorage("so-cart", []).filter((it) => it.Id !== id);
    setLocalStorage("so-cart", items);
    renderCart();
    showToast("Item removed from cart.");
  });
}

// ---------------------------------------------------------
// Totals
// ---------------------------------------------------------
function updateCartTotal(items) {
  const totalEl = document.querySelector("#cart-main .cart-total");
  const total = items.reduce(
    (sum, it) => sum + Number(it.FinalPrice || it.Price || 0) * it.Qty,
    0,
  );
  totalEl.textContent = `Total: $${total.toFixed(2)}`;
}

// ---------------------------------------------------------
// Confirmation Modal
// ---------------------------------------------------------
function confirmModal(message, onConfirm) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  overlay.innerHTML = `
    <div class="modal">
      <h3>Confirm</h3>
      <p>${message}</p>
      <div class="modal-actions">
        <button class="modal-cancel">Cancel</button>
        <button class="modal-confirm">OK</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector(".modal-cancel").onclick = () => overlay.remove();
  overlay.querySelector(".modal-confirm").onclick = () => {
    overlay.remove();
    onConfirm();
  };
}

// ---------------------------------------------------------
// Toast Notification
// ---------------------------------------------------------
function showToast(message) {
  const old = document.querySelector(".toast-notification");
  if (old) old.remove();

  const toast = document.createElement("div");
  toast.className = "toast-notification";

  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #bb4230;
    color: white;
    padding: 12px 18px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    font-size: 14px;
    z-index: 999999;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity .3s ease, transform .3s ease;
  `;

  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
    setTimeout(() => toast.remove(), 300);
  }, 1800);
}
