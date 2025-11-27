import { loadHeaderFooter } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

loadHeaderFooter();

const checkout = new CheckoutProcess("so-cart", "#order-summary");
checkout.init();

// recalc totals when ZIP changes
document.querySelector("#zip").addEventListener("blur", () => {
  checkout.calculateOrderTotal();
});

// ------------------------------
// Custom Stylish Alert
// ------------------------------
function showPopup(message, isError = false) {
  const existing = document.querySelector(".popup-alert");
  if (existing) existing.remove();

  const div = document.createElement("div");
  div.className = "popup-alert";

  div.innerHTML = `
    <div class="popup-content ${isError ? "error" : ""}">
      <span class="popup-close">&times;</span>
      <p>${message}</p>
    </div>
  `;

  document.body.appendChild(div);

  // Close button
  div.querySelector(".popup-close").addEventListener("click", () => {
    div.classList.add("fade-out");
    setTimeout(() => div.remove(), 400);
  });

  // Auto fade
  setTimeout(() => {
    if (document.body.contains(div)) {
      div.classList.add("fade-out");
      setTimeout(() => div.remove(), 400);
    }
  }, 4000);
}

// ------------------------------
// Handle Submit
// ------------------------------
document
  .querySelector("#checkout-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const result = await checkout.checkout(e.target);
    console.log("Checkout response:", result);

    if (result.success) {
      window.location.href = "/checkout/success.html";
    } else {
      let message = "";

      if (typeof result.message === "string") {
        message = result.message;
      } else {
        message = Object.entries(result.message)
          .map(([k, v]) => `${k}: ${v}`)
          .join("<br>");
      }

      showPopup(message, true);
    }
  });
