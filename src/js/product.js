// src/js/product.js
import ProductData from "./ProductData.mjs";
import ProductDetails from "./ProductDetails.mjs";
import { getParam, loadHeaderFooter } from "./utils.mjs";
import { updateCartCount } from "./cartUtils.mjs";
import Alert from "./Alert.js";

document.addEventListener("DOMContentLoaded", async () => {
  await loadHeaderFooter();
  updateCartCount();

  const alertModule = new Alert("../json/alerts.json");
  await alertModule.init();

  const productId = getParam("product");
  if (!productId) {
    // eslint-disable-next-line
    console.error("❌ No product ID in URL");
    return;
  }

  const dataSource = new ProductData();
  const productDetails = new ProductDetails(productId, dataSource);
  await productDetails.init();

  window.addEventListener("storage", updateCartCount);
});
