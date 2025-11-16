import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import { updateCartCount } from "./cartUtils.mjs";
import { loadHeaderFooter } from "./utils.mjs";

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.dataSource = dataSource;
    this.product = null;
  }

  async init() {
    // Load header/footer FIRST (this fixes 0-count badge)
    await loadHeaderFooter();

    try {
      this.product = await this.dataSource.findProductById(this.productId);
    } catch (err) {
      console.error("Error loading product data:", err);
      this.showNotFound();
      return;
    }

    if (!this.product) {
      this.showNotFound();
      return;
    }

    this.renderProductDetails();

    // Update cart icon after header loaded
    updateCartCount();

    const btn = document.getElementById("addToCart");
    if (btn) {
      btn.addEventListener("click", this.addProductToCart.bind(this));
    }
  }

  showNotFound() {
    const container = document.getElementById("product-detail");
    if (container) container.innerHTML = "<p>Product not found.</p>";
  }

  renderProductDetails() {
    const container = document.getElementById("product-detail");
    if (!container) return;

    const isDiscounted =
      this.product.FinalPrice < this.product.SuggestedRetailPrice;

    const discountAmount = (
      this.product.SuggestedRetailPrice - this.product.FinalPrice
    ).toFixed(2);

    const discountPercent = Math.round(
      ((this.product.SuggestedRetailPrice - this.product.FinalPrice) /
        this.product.SuggestedRetailPrice) *
        100
    );

    container.innerHTML = `
      <h3 class="card__brand">${this.product.Brand?.Name || ""}</h3>
      <h2 class="card__name">${this.product.Name}</h2>

      <div class="product-image-wrapper">
        <img id="productImage" src="${this.product.Image}" alt="${this.product.Name}" class="divider" />
        ${isDiscounted ? `<span class="discount-badge">-${discountPercent}%</span>` : ""}
      </div>

      <div class="product-card__price-wrapper">
        <p id="productPrice" class="product-card__price">
          $${this.product.FinalPrice.toFixed(2)}
          ${isDiscounted ? `<span class="save-amount">(Save $${discountAmount})</span>` : ""}
        </p>

        ${isDiscounted ? `<p class="product-card__oldprice">$${this.product.SuggestedRetailPrice.toFixed(2)}</p>` : ""}
      </div>

      <p id="productColor" class="product__color">
        ${this.product.Colors?.[0]?.ColorName || ""}
      </p>

      <p id="productDesc" class="product__description">
        ${this.product.DescriptionHtmlSimple}
      </p>

      <div class="product-detail__add">
        <button id="addToCart" data-id="${this.product.Id}">Add to Cart</button>
      </div>
    `;
  }

  async addProductToCart() {
    if (!this.product) return;

    let cartItems = getLocalStorage("so-cart");
    if (!Array.isArray(cartItems)) cartItems = [];

    const existing = cartItems.find((item) => item.Id === this.product.Id);
    let quantityAdded = 1;

    if (existing) {
      const confirmAdd = await this.confirmAddToCart(this.product.Name);
      if (!confirmAdd) return; // user canceled
      existing.Qty = (existing.Qty || 1) + 1;
      quantityAdded = existing.Qty;
    } else {
      cartItems.push({
        Id: this.product.Id,
        Name: this.product.Name,
        Image: this.product.Image,
        FinalPrice: this.product.FinalPrice,
        Qty: 1, // matches cart.js
      });
    }

    setLocalStorage("so-cart", cartItems);
    updateCartCount();

    const totalItems = cartItems.reduce((sum, item) => sum + (item.Qty || 0), 0);
    this.showAddedToCartNotification(
      `${quantityAdded} x ${this.product.Name} added. Total items in cart: ${totalItems}`
    );
  }

  // ✅ Custom confirm modal for adding another product
  confirmAddToCart(productName) {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "custom-confirm-overlay";
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.background = "rgba(0,0,0,0.5)";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.zIndex = "10000";

      const modal = document.createElement("div");
      modal.className = "custom-confirm-modal";
      modal.style.background = "#fff";
      modal.style.borderRadius = "8px";
      modal.style.padding = "2rem";
      modal.style.width = "320px";
      modal.style.maxWidth = "90%";
      modal.style.textAlign = "center";
      modal.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";

      modal.innerHTML = `
        <h3 style="margin-bottom: 1rem;">Add Another?</h3>
        <p style="margin-bottom: 1.5rem;">You already have <strong>${productName}</strong> in your cart.<br>Do you want to add another one?</p>
        <div style="display:flex; justify-content:space-around;">
          <button id="confirm-yes" style="padding:0.5rem 1rem; background:#131d2e; color:#fff; border:none; border-radius:4px; cursor:pointer;">Yes</button>
          <button id="confirm-no" style="padding:0.5rem 1rem; background:#ddd; color:#333; border:none; border-radius:4px; cursor:pointer;">Cancel</button>
        </div>
      `;

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      document.getElementById("confirm-yes").addEventListener("click", () => {
        overlay.remove();
        resolve(true);
      });

      document.getElementById("confirm-no").addEventListener("click", () => {
        overlay.remove();
        resolve(false);
      });
    });
  }

  showAddedToCartNotification(message) {
    let container = document.querySelector(".cart-notification-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "cart-notification-container";
      container.style.position = "fixed";
      container.style.top = "1rem";
      container.style.right = "1rem";
      container.style.zIndex = "9999";
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.gap = "0.5rem";
      document.body.appendChild(container);
    }

    const notification = document.createElement("div");
    notification.className = "cart-notification";
    notification.style.background = "#131d2e";
    notification.style.color = "#fff";
    notification.style.padding = "0.75rem 1rem";
    notification.style.borderRadius = "0.5rem";
    notification.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    notification.style.opacity = "0";
    notification.style.transform = "translateX(100%)";
    notification.style.transition = "transform 0.3s ease, opacity 0.3s ease";
    notification.innerHTML = `<span class="checkmark">&#10003;</span> ${message}`;

    container.appendChild(notification);

    requestAnimationFrame(() => {
      notification.style.transform = "translateX(0)";
      notification.style.opacity = "1";
    });

    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      notification.style.opacity = "0";
      notification.addEventListener("transitionend", () => notification.remove(), { once: true });
    }, 2500);
  }
}
