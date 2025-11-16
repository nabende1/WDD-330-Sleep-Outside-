// src/js/cart.js
import { getLocalStorage, setLocalStorage, loadHeaderFooter } from "./utils.mjs";
import { updateCartCount } from "./cartUtils.mjs";

// ======================================================================
// Load Header & Footer
// ======================================================================
document.addEventListener("DOMContentLoaded", async () => {
  await loadHeaderFooter();
  renderCartContents();
});

// ======================================================================
// Render Cart Contents
// ======================================================================
export function renderCartContents() {
  let cartItems = getLocalStorage("so-cart") || [];

  // Combine duplicate items by Id
  const cartMap = new Map();
  cartItems.forEach((item) => {
    if (cartMap.has(item.Id)) {
      cartMap.get(item.Id).Qty += item.Qty || 1;
    } else {
      cartMap.set(item.Id, { ...item, Qty: item.Qty || 1 });
    }
  });

  cartItems = Array.from(cartMap.values());
  setLocalStorage("so-cart", cartItems);

  const productList = document.querySelector(".product-list");
  const cartTotalElement = document.querySelector(".cart-total");
  if (!productList) return;

  if (cartItems.length === 0) {
    productList.innerHTML = "<p>Your cart is empty.</p>";
    updateCartCount();
    if (cartTotalElement) cartTotalElement.textContent = "$0.00";
    return;
  }

  // Render items
  productList.innerHTML = cartItems.map(cartItemTemplate).join("");
  updateCartCount();
  updateCartTotal(cartItems);

  // Add button listeners
  cartItems.forEach((item) => {
    document.getElementById(`remove-${item.Id}`)?.addEventListener("click", () =>
      removeItem(item.Id)
    );

    document.getElementById(`minus-${item.Id}`)?.addEventListener("click", () =>
      changeQuantity(item.Id, -1)
    );

    document.getElementById(`plus-${item.Id}`)?.addEventListener("click", () =>
      changeQuantity(item.Id, 1)
    );

    const cardLink = document.getElementById(`link-${item.Id}`);
    if (cardLink) {
      cardLink.href = `/product_pages/index.html?product=${item.Id}`;
    }
  });
}

// ======================================================================
// Item Template
// ======================================================================
function cartItemTemplate(item) {
  const price = Number(item.FinalPrice || item.Price || 0).toFixed(2);
  const totalItemPrice = (price * item.Qty).toFixed(2);

  return `
    <li class="cart-card divider">
      <a href="#" id="link-${item.Id}" class="cart-card__image">
        <img src="${item.Image}" alt="${item.Name}" />
      </a>

      <a href="#" id="link-${item.Id}">
        <h2 class="card__name">${item.Name}</h2>
      </a>

      <p class="cart-card__color">${item.Color || "N/A"}</p>

      <div class="cart-card__quantity-wrapper">
        <button id="minus-${item.Id}" class="qty-btn">-</button>
        <span class="cart-card__quantity">Qty: ${item.Qty}</span>
        <button id="plus-${item.Id}" class="qty-btn">+</button>
      </div>

      <p class="cart-card__price">Price: $${price}</p>
      <p class="cart-card__total">Total: $${totalItemPrice}</p>

      <button id="remove-${item.Id}" class="cart-card__remove">Remove</button>
    </li>
  `;
}

// ======================================================================
// Quantity Updates
// ======================================================================
export function changeQuantity(id, delta) {
  let cartItems = getLocalStorage("so-cart") || [];

  cartItems = cartItems.map((item) => {
    if (item.Id === id) {
      item.Qty = Math.max(1, (item.Qty || 1) + delta);
    }
    return item;
  });

  setLocalStorage("so-cart", cartItems);
  renderCartContents();
}

// ======================================================================
// Remove Item (with Professional Modal)
// ======================================================================
export function removeItem(id) {
  showConfirmModal(
    "Are you sure you want to remove this item from your cart?",
    () => {
      let cartItems = getLocalStorage("so-cart") || [];
      cartItems = cartItems.filter((item) => item.Id !== id);
      setLocalStorage("so-cart", cartItems);
      renderCartContents();
    }
  );
}

// ======================================================================
// Cart Total Price
// ======================================================================
function updateCartTotal(cartItems) {
  const cartTotalElement = document.querySelector(".cart-total");
  if (!cartTotalElement) return;

  const totalPrice = cartItems.reduce(
    (sum, item) =>
      sum + Number(item.FinalPrice || item.Price || 0) * item.Qty,
    0
  );

  cartTotalElement.textContent = `$${totalPrice.toFixed(2)}`;
}

// ======================================================================
// Custom Professional Confirm Modal
// ======================================================================
function showConfirmModal(message, onConfirm) {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top:0; left:0;
    width:100vw; height:100vh;
    background: rgba(0,0,0,0.45);
    display:flex;
    justify-content:center;
    align-items:center;
    z-index:99999;
    opacity:0;
    transition:opacity 0.25s ease;
  `;

  const modal = document.createElement("div");
  modal.style.cssText = `
    background:#fff;
    padding:1.5rem;
    border-radius:10px;
    width:320px;
    max-width:90%;
    text-align:center;
    box-shadow:0 4px 20px rgba(0,0,0,0.15);
    transform:scale(0.85);
    transition:transform 0.25s ease;
  `;

  modal.innerHTML = `
    <h3 style="color:#131d2e; margin-bottom:0.75rem;">Confirm Removal</h3>
    <p style="margin-bottom:1.25rem;">${message}</p>

    <div style="display:flex; gap:0.75rem; justify-content:center;">
      <button id="modalCancel" style="
        padding:0.5rem 1rem;
        background:#ccc;
        border:none;
        border-radius:6px;
        cursor:pointer;
      ">Cancel</button>

      <button id="modalConfirm" style="
        padding:0.5rem 1rem;
        background:#bb4230;
        color:#fff;
        border:none;
        border-radius:6px;
        cursor:pointer;
      ">Remove</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
    modal.style.transform = "scale(1)";
  });

  function close() {
    overlay.style.opacity = "0";
    modal.style.transform = "scale(0.85)";
    setTimeout(() => overlay.remove(), 250);
  }

  modal.querySelector("#modalCancel").addEventListener("click", close);
  modal.querySelector("#modalConfirm").addEventListener("click", () => {
    close();
    onConfirm();
  });
}
