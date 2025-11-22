// src/js/CheckoutProcess.mjs
import { getLocalStorage } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs"; 

export default class CheckoutProcess {
  constructor(key = "so-cart", outputSelector = "#order-summary") {
    this.key = key;
    this.outputSelector = outputSelector;
    this.list = [];
    this.itemTotal = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
    this.external = new ExternalServices();
  }

  init() {
    this.list = getLocalStorage(this.key) || [];
    this.calculateItemSubTotal();
  }

  calculateItemSubTotal() {
    this.itemTotal = (this.list || []).reduce(
      (sum, item) => sum + Number(item.FinalPrice || item.Price || 0) * (item.Qty || 1),
      0
    );
    const itemCount = (this.list || []).reduce((s, i) => s + (i.Qty || 1), 0);

    const subtotalEl = document.querySelector(`${this.outputSelector} #subtotal`);
    const itemsEl = document.querySelector(`${this.outputSelector} #items`);
    if (subtotalEl) subtotalEl.innerText = `$${this.itemTotal.toFixed(2)}`;
    if (itemsEl) itemsEl.innerText = `${itemCount} items`;
  }

  calculateOrderTotal() {
    // tax 6%
    this.tax = this.itemTotal * 0.06;

    // shipping $10 first item + $2 additional
    const itemCount = (this.list || []).reduce((s, i) => s + (i.Qty || 1), 0);
    this.shipping = itemCount > 0 ? 10 + Math.max(0, itemCount - 1) * 2 : 0;

    this.orderTotal = this.itemTotal + this.tax + this.shipping;
    this.displayOrderTotals();
  }

  displayOrderTotals() {
    const container = document.querySelector(this.outputSelector);
    if (!container) return;
    const taxEl = container.querySelector("#tax");
    const shippingEl = container.querySelector("#shipping");
    const totalEl = container.querySelector("#order-total");
    if (taxEl) taxEl.innerText = `$${this.tax.toFixed(2)}`;
    if (shippingEl) shippingEl.innerText = `$${this.shipping.toFixed(2)}`;
    if (totalEl) totalEl.innerText = `$${this.orderTotal.toFixed(2)}`;
  }

  packageItems(items) {
    return (items || []).map(it => ({
      id: it.Id,
      name: it.Name,
      price: Number(it.FinalPrice || it.Price || 0),
      quantity: it.Qty || 1
    }));
  }

  // formElement is the <form> DOM element
  async checkout(formElement) {
    // convert form to object
    const formData = new FormData(formElement);
    const orderObj = {};
    formData.forEach((value, key) => orderObj[key] = value);

    // add required server keys
    orderObj.orderDate = new Date().toISOString();
    orderObj.items = this.packageItems(this.list);
    orderObj.orderTotal = this.orderTotal.toFixed(2);
    orderObj.shipping = this.shipping;
    orderObj.tax = this.tax.toFixed(2);

    // send to server via ExternalServices
    return this.external.checkout(orderObj);
  }
}
