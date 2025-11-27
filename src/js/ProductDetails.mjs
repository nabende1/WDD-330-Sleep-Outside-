// src/js/ProductDetails.mjs
import { getLocalStorage, setLocalStorage, loadHeaderFooter } from "./utils.mjs";
import { updateCartCount } from "./cartUtils.mjs";
import { getDiscountInfo } from "./discountUtils.mjs";
import { alertMessage } from "./utils.mjs";


export default class ProductDetails {
  constructor(productId, dataSource, category) {
    this.productId = productId;
    this.dataSource = dataSource;
    this.category = category;
    this.product = null;
  }

  async init() {
  await loadHeaderFooter();

  try {
    let data = await this.dataSource.findProductById(
      this.productId,
      this.category
    );

    // unwrap API result
    this.product = data.Result || data.product || data;

  } catch (err) {
    console.error("Error loading product data:", err);
    this.showNotFound();
    return;
  }

  if (!this.product) {
    this.showNotFound();
    return;
  }

  // Render details
  this.renderProductDetails();
  updateCartCount();

  // Attach add-to-cart handler
  const btn = document.getElementById("addToCart");
  if (btn) btn.addEventListener("click", this.addProductToCart.bind(this));
}


  showNotFound() {
    const container = document.getElementById("product-detail");
    if (container) container.innerHTML = "<p>Product not found.</p>";
  }

  renderProductDetails() {
    const container = document.getElementById("product-detail");
    if (!container) return;

    const {
      isDiscounted,
      finalPrice,
      suggested,
      discountAmount,
      discountPercent
    } = getDiscountInfo(this.product);

    // Base fallback image
    const fallback = "../images/camping-products.jpg";

    // Responsive images
    const imgSmall = this.product.Images?.PrimarySmall || fallback;
    const imgMedium = this.product.Images?.PrimaryMedium || imgSmall;
    const imgLarge = this.product.Images?.PrimaryLarge || imgMedium;

    const brandName = this.product.Brand?.Name || "Brand Name";
    const productName =
      this.product.Name ||
      this.product.NameWithoutBrand ||
      "Product";

    const description =
      this.product.DescriptionHtmlSimple || "No description available.";

    const color = this.product.Colors?.[0]?.ColorName || "Color";

    container.innerHTML = `
      <h3 class="card__brand">${brandName}</h3>
      <h2 class="card__name">${productName}</h2>

      <div class="product-image-wrapper">
        <img 
          id="productImage"
          class="divider product-image"
          src="${imgMedium}"
          alt="${productName}"
          loading="lazy"
          srcset="
            ${imgSmall} 400w,
            ${imgMedium} 800w,
            ${imgLarge} 1200w
          "
          sizes="
            (max-width: 600px) 90vw,
            (max-width: 1024px) 60vw,
            500px
          "
        />

        ${
          isDiscounted
            ? `<span class="discount-badge">-${discountPercent}%</span>`
            : ""
        }
      </div>

      <div class="product-card__price-wrapper">
        <p class="product-card__price">
          $${finalPrice.toFixed(2)}
          ${
            isDiscounted
              ? `<span class="save-amount">(Save $${discountAmount})</span>`
              : ""
          }
        </p>
        ${
          isDiscounted
            ? `<p class="product-card__oldprice">$${suggested.toFixed(2)}</p>`
            : ""
        }
      </div>

      <p id="productColor" class="product__color">${color}</p>
      <p id="productDesc" class="product__description">${description}</p>

      <div class="product-detail__add">
        <button id="addToCart" data-id="${this.product.Id}">Add to Cart</button>
      </div>
    `;
  }

  async addProductToCart() {
    if (!this.product) return;

    let cartItems = getLocalStorage("so-cart") || [];
    if (!Array.isArray(cartItems)) cartItems = [];

    const existing = cartItems.find(item => item.Id === this.product.Id);
    let quantityAdded = 1;

    if (existing) {
      const confirmAdd = await this.confirmAddToCart(
        this.product.Name || "this product"
      );
      if (!confirmAdd) return;
      existing.Qty = (existing.Qty || 1) + 1;
      quantityAdded = existing.Qty;
    } else {
      cartItems.push({
        Id: this.product.Id,
        Name: this.product.Name || this.product.NameWithoutBrand,
        Image: this.product.Images?.PrimaryMedium || "",
        FinalPrice: this.product.FinalPrice || 0,
        Qty: 1
      });
    }

    setLocalStorage("so-cart", cartItems);
    updateCartCount();
    const totalItems = cartItems.reduce(
      (sum, item) => sum + (item.Qty || 0),
      0
    );

    this.showAddedToCartNotification(
      `${quantityAdded} x ${this.product.Name} added. Total items in cart: ${totalItems}`
    );
  }

  /* -------------- Confirmation Modal + Notification -------------- */
  confirmAddToCart(productName) {
    return new Promise(resolve => {
      const overlay = document.createElement("div");
      overlay.className = "custom-confirm-overlay";
      Object.assign(overlay.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "10000"
      });

      const modal = document.createElement("div");
      modal.className = "custom-confirm-modal";
      Object.assign(modal.style, {
        background: "#fff",
        borderRadius: "8px",
        padding: "2rem",
        width: "320px",
        maxWidth: "90%",
        textAlign: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
      });

      modal.innerHTML = `
        <h3 style="margin-bottom: 1rem;">Add Another?</h3>
        <p style="margin-bottom: 1.5rem;">
          You already have <strong>${productName}</strong> in your cart.<br>
          Add another?
        </p>
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
      Object.assign(container.style, {
        position: "fixed",
        top: "1rem",
        right: "1rem",
        zIndex: "9999",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem"
      });
      document.body.appendChild(container);
    }

    const notification = document.createElement("div");
    notification.className = "cart-notification";
    Object.assign(notification.style, {
      background: "#131d2e",
      color: "#fff",
      padding: "0.75rem 1rem",
      borderRadius: "0.5rem",
      boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
      opacity: "0",
      transform: "translateX(100%)",
      transition: "transform 0.3s ease, opacity 0.3s ease"
    });
    notification.innerHTML = `<span class="checkmark">&#10003;</span> ${message}`;

    container.appendChild(notification);
    requestAnimationFrame(() => {
      notification.style.transform = "translateX(0)";
      notification.style.opacity = "1";
    });

    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      notification.style.opacity = "0";
      notification.addEventListener("transitionend", () => notification.remove(), {
        once: true
      });
    }, 2500);
  }
}
