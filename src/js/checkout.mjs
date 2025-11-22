import { loadHeaderFooter, getLocalStorage } from "./utils.mjs";

document.addEventListener("DOMContentLoaded", initCheckout);

async function initCheckout() {
  await loadHeaderFooter();

  // Load cart
  const cart = getLocalStorage("so-cart") || [];

  calculateSummary(cart);

  const form = document.getElementById("checkoutForm");
  form.addEventListener("submit", validateForm);
}

// ----------------------------------------------
// PRICE CALCULATIONS
// ----------------------------------------------
function calculateSummary(cart) {
  const subtotal = cart.reduce((sum, item) => {
    return sum + item.FinalPrice * item.Qty;
  }, 0);

  const tax = subtotal * 0.1;
  const shipping = cart.length > 0 ? 10 : 0;
  const total = subtotal + tax + shipping;

  document.getElementById("summarySubtotal").textContent =
    `$${subtotal.toFixed(2)}`;
  document.getElementById("summaryTax").textContent =
    `$${tax.toFixed(2)}`;
  document.getElementById("summaryShipping").textContent =
    `$${shipping.toFixed(2)}`;
  document.getElementById("summaryTotal").textContent =
    `$${total.toFixed(2)}`;
}

// ----------------------------------------------
// FORM VALIDATION
// ----------------------------------------------
function validateForm(e) {
  const form = e.target;

  if (!form.checkValidity()) {
    e.preventDefault();
    alert("Please fill out all required fields.");
    return false;
  }

  alert("Order placed successfully!");
}
