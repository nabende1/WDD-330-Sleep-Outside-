import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
/* eslint-disable no-console */

const dataSource = new ProductData("tents");

function addProductToCart(product) {
  let cartItems = getLocalStorage("so-cart");

  // ✅ Ensure cartItems is always an array
  if (!Array.isArray(cartItems)) {
    console.warn("⚠️ cartItems was not an array. Resetting...");
    cartItems = [];
  }

  cartItems.push(product);
  setLocalStorage("so-cart", cartItems);
  console.log("✅ Cart updated:", cartItems);
}

async function addToCartHandler(e) {
  const id = e.target.dataset.id;
  console.log("🛒 Add to cart clicked. Product ID:", id);

  try {
    const product = await dataSource.findProductById(id);

    if (!product) {
      console.error("❌ Product not found. Check ID or fetch path.");
      alert("Product not found! Check the data-id or JSON path.");
      return;
    }

    console.log("✅ Product found:", product);
    addProductToCart(product);
    alert(`${product.Name} added to your cart!`);
  } catch (error) {
    console.error("🚨 Error fetching product:", error);
  }
}

// Wait until DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const addToCartBtn = document.getElementById("addToCart");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", addToCartHandler);
    console.log("✅ Add to Cart button event listener attached.");
  } else {
    console.error("❌ Add to Cart button not found in DOM.");
  }
});
