import { getParam } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductDetails from "./ProductDetails.mjs";

document.addEventListener("DOMContentLoaded", () => {
  const productId = getParam("product");
  if (!productId) {
    // eslint-disable-next-line no-console
    console.error("No product id in query string.");
    return;
  }

  const dataSource = new ProductData("tents");
  const productPage = new ProductDetails(productId, dataSource);
  productPage.init();
});
