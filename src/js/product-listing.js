// src/js/product-listing.js
import ExternalServices from "./ExternalServices.mjs";
import ProductList from "./ProductList.mjs";
import { loadHeaderFooter, updateCartCount, getParam, qs } from "./utils.mjs";
import { showQuickView } from "./quickView.js";

async function init() {
  await loadHeaderFooter();
  updateCartCount();

  const searchQuery = getParam("search");

  // Normalize category to match API's "tents" (lowercase)
  const category = (getParam("category") || "tents").toLowerCase();

  // Try to find a sensible header element fallback
  const headerEl = qs(".products h2") || document.querySelector("h2");

  let mode;
  if (searchQuery) {
    mode = `search:${searchQuery}`;
    if (headerEl) headerEl.textContent = `Search results for "${searchQuery}"`;
  } else {
    if (headerEl)
      headerEl.textContent =
        "Top Products: " + category.charAt(0).toUpperCase() + category.slice(1);
    mode = category; // must remain lowercase
  }

  const dataSource = new ExternalServices();
  const listEl = qs(".product-list") || document.querySelector(".product-list");
  if (!listEl) {
    console.error("No .product-list element found in DOM");
    return;
  }

  const myList = new ProductList(mode, dataSource, listEl);
  await myList.init();
}
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("quick-view-btn")) {
    const id = event.target.dataset.id;
    showQuickView(id);
  }
});

document.addEventListener("DOMContentLoaded", init);
