import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import { loadHeaderFooter, updateCartCount, getParam, qs } from "./utils.mjs";

async function init() {
  await loadHeaderFooter();
  updateCartCount();

  const searchQuery = getParam("search");
  const category = getParam("category") || "tents";

  const headerEl = qs(".products h2");

  let mode;
  if (searchQuery) {
    mode = `search:${searchQuery}`;
    headerEl.textContent = `Search results for "${searchQuery}"`;
  } else {
    headerEl.textContent =
      "Top Products: " + category.charAt(0).toUpperCase() + category.slice(1);
    mode = category;
  }

  const dataSource = new ProductData();
  const listEl = qs(".product-list");
  const myList = new ProductList(mode, dataSource, listEl);
  await myList.init();
}

document.addEventListener("DOMContentLoaded", init);
