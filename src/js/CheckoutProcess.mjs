// src/js/CheckoutProcess.mjs
import ExternalServices from "./ExternalServices.mjs";
import { getLocalStorage, alertMessage } from "./utils.mjs";

const services = new ExternalServices();

function formDataToJSON(form) {
  const formData = new FormData(form);
  const json = {};
  formData.forEach((value, key) => (json[key] = value));
  return json;
}

function packageItems(items) {
  return items.map((i) => ({
    id: i.Id,
    name: i.Name,
    price: i.FinalPrice,
    quantity: i.Qty || 1
  }));
}

// --- 🔥 Error Normalizer ---
function normalizeError(err) {
  if (!err) return "Unknown error occurred.";

  // String errors
  if (typeof err === "string") return err;

  // Message wrapper
  if (err.message && typeof err.message === "string") return err.message;

  // API validation object
  if (typeof err === "object") {
    return Object.entries(err)
      .map(([field, message]) => `${field}: ${message}`)
      .join("\n");
  }

  // Fallback
  return "Checkout failed. Please try again.";
}

export default class CheckoutProcess {
  constructor(key, outputSelector) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.list = [];
  }

  init() {
    this.list = getLocalStorage(this.key) ?? [];
    this.calculateOrderTotal();
  }

  calculateOrderTotal() {
    const amounts = this.list.map((i) => i.FinalPrice * (i.Qty || 1));
    this.itemTotal = amounts.reduce((s, v) => s + v, 0);
    this.tax = this.itemTotal * 0.06;
    this.shipping = 10 + Math.max(0, this.list.length - 1) * 2;
    this.orderTotal = this.itemTotal + this.tax + this.shipping;

    this.displayTotals();
  }

  displayTotals() {
    const map = {
      "#items": this.list.length,
      "#subtotal": `$${this.itemTotal.toFixed(2)}`,
      "#tax": `$${this.tax.toFixed(2)}`,
      "#shipping": `$${this.shipping.toFixed(2)}`,
      "#order-total": `$${this.orderTotal.toFixed(2)}`
    };

    for (let selector in map) {
      const el = document.querySelector(selector);
      if (el) el.innerText = map[selector];
    }
  }

  async checkout(formElement) {
    // HTML validation
    if (!formElement.checkValidity()) {
      formElement.reportValidity();
      alertMessage("Please correct the highlighted fields.", true);
      return { success: false, message: "Form validation failed." };
    }

    // Build order
    const order = formDataToJSON(formElement);
    order.orderDate = new Date().toISOString();
    order.orderTotal = this.orderTotal;
    order.tax = this.tax;
    order.shipping = this.shipping;
    order.items = packageItems(this.list);

    try {
      const response = await services.checkout(order);

      // Clear cart on success
      localStorage.removeItem(this.key);

      return { success: true, data: response };
    } catch (err) {
      console.error("Checkout error:", err);

      const errMsg = normalizeError(err?.message || err);

      return { success: false, message: errMsg };
    }
  }
}
