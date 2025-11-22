import { loadHeaderFooter } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

loadHeaderFooter();
const checkout = new CheckoutProcess("so-cart", "#order-summary");
checkout.init();

const zipInput = document.querySelector("#zip");
if (zipInput) {
  zipInput.addEventListener("input", (e) => {
    if (e.target.value.length >= 5) checkout.calculateOrderTotal();
  });
}

const form = document.querySelector("#checkout-form");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const result = await checkout.checkout(form);
      console.log("Checkout response:", result);
      if (result && result.success) {
        window.location.href = "/checkout/success.html";
      } else {
        alert("Checkout failed: " + (result && result.message ? result.message : "Unknown"));
      }
    } catch (err) {
      console.error(err);
      alert("Unexpected error during checkout.");
    }
  });
}
