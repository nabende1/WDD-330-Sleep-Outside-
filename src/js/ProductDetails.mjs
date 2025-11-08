import { getLocalStorage, setLocalStorage } from "./utils.mjs"; // for cart
import ProductData from "./ProductData.mjs";

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.dataSource = dataSource;
    this.product = null;
  }

  async init() {
    // fetch product data
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

    // attach Add to Cart handler (bind to keep this)
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

    // Use fields from your JSON (note: DescriptionHtmlSimple contains HTML)
    container.innerHTML = `
      <h3 class="card__brand">${this.product.Brand?.Name || ""}</h3>
      <h2 class="card__name">${this.product.Name}</h2>
      <img id="productImage" src="${this.product.Image}" alt="${this.product.Name}" class="divider" />
      <p id="productPrice" class="product-card__price">$${this.product.FinalPrice}</p>
      <p id="productColor" class="product__color">${this.product.Colors?.[0]?.ColorName || ""}</p>
      <p id="productDesc" class="product__description">${this.product.DescriptionHtmlSimple}</p>
      <div class="product-detail__add">
        <button id="addToCart" data-id="${this.product.Id}">Add to Cart</button>
      </div>
    `;
  }

  addProductToCart() {
    if (!this.product) return;
    let cartItems = getLocalStorage("so-cart");
    if (!Array.isArray(cartItems)) cartItems = [];

    // Optionally store a lightweight cart item (selected properties)
    const cartItem = {
      Id: this.product.Id,
      Name: this.product.Name,
      Image: this.product.Image,
      Price: this.product.FinalPrice,
      Qty: 1
    };

    cartItems.push(cartItem);
    setLocalStorage("so-cart", cartItems);

    // give user feedback
    alert(`${this.product.Name} added to cart`);
    console.log("Cart now:", cartItems);
  }
}
