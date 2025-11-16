import { updateCartCount } from "./cartUtils.mjs";
import Alert from "./Alert.js";
import { loadHeaderFooter } from "./utils.mjs";

document.addEventListener("DOMContentLoaded", async () => {
  // Load header/footer first
  await loadHeaderFooter();

  // Update cart badge after header/footer are injected
  updateCartCount();

  // Initialize alerts
  const alertModule = new Alert("./json/alerts.json");
  await alertModule.init();

  // Load product list on home page if element exists
});

// Live update when localStorage changes (from other tabs/pages)
window.addEventListener("storage", updateCartCount);
