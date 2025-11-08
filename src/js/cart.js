import { getLocalStorage, setLocalStorage } from "./utils.mjs";

// ✅ Render cart contents
function renderCartContents() {
  const cartItems = getLocalStorage("so-cart") || [];
  const productList = document.querySelector(".product-list");
  
  if (cartItems.length === 0) {
    productList.innerHTML = "<p>Your cart is empty.</p>";
    updateCartCount(0);
    return;
  }

  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  productList.innerHTML = htmlItems.join("");
  updateCartCount(cartItems.length);
}

// ✅ Template for each product item
function cartItemTemplate(item) {
  return `
  <li class="cart-card divider">
    <a href="#" class="cart-card__image">
      <img src="${item.Image}" alt="${item.Name}" />
    </a>
    <a href="#">
      <h2 class="card__name">${item.Name}</h2>
    </a>
    <p class="cart-card__color">${item.Colors?.[0]?.ColorName || "N/A"}</p>
    <p class="cart-card__quantity">qty: 1</p>
    <p class="cart-card__price">$${item.FinalPrice}</p>
  </li>`;
}

// ✅ Update the counter on the backpack icon
function updateCartCount(count) {
  const cartCountElement = document.querySelector(".cart-count");
  if (cartCountElement) {
    cartCountElement.textContent = count;
  }
}

// ✅ Keep cart count updated on every page load
export function refreshCartCount() {
  const cartItems = getLocalStorage("so-cart") || [];
  updateCartCount(cartItems.length);
}

// Run when the cart page loads
renderCartContents();
refreshCartCount();
