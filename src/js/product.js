// src/js/product.js
import ExternalServices from "./ExternalServices.mjs";
import ProductDetails from "./ProductDetails.mjs";
import { getParam, loadHeaderFooter } from "./utils.mjs";
import { updateCartCount } from "./cartUtils.mjs";
import Alert from "./Alert.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadHeaderFooter();
    updateCartCount();

    const alertModule = new Alert("../json/alerts.json");
    await alertModule.init();

    const productId = getParam("product");
    if (!productId) {
      console.error("❌ No product ID in URL");
      return;
    }

    const dataSource = new ExternalServices();
    const productDetails = new ProductDetails(productId, dataSource);
    await productDetails.init();

    window.addEventListener("storage", updateCartCount);
  } catch (err) {
    console.error("Error initializing product page:", err);
  }
});
