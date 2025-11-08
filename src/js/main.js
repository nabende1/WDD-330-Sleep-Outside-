// src/js/main.js
import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import { getLocalStorage } from "./utils.mjs";

document.addEventListener("DOMContentLoaded", async () => {
  const dataSource = new ProductData("tents");
  const listElement = document.querySelector(".product-list");

  if (!listElement) {
    console.error("product-list element not found.");
    return;
  }

  const productList = new ProductList("tents", dataSource, listElement);
  await productList.init();
});



function updateCartCount() {
  const cartItems = getLocalStorage("so-cart") || [];
  const cartCount = document.querySelector(".cart-count");
  if (cartCount) {
    cartCount.textContent = cartItems.length;
  }
}

// Run immediately on page load
updateCartCount();

// Optional: update in real-time if you add to cart
window.addEventListener("storage", updateCartCount);

