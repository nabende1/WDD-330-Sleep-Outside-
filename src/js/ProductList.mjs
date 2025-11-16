// src/js/ProductList.mjs
import { renderListWithTemplate } from "./utils.mjs";

function productCardTemplate(product) {
  const final = Number(product.FinalPrice);
  const retail = Number(product.SuggestedRetailPrice);

  // Check if discounted
  const isDiscounted = retail && final < retail;

  // Calculate % off
  const discountPercent = isDiscounted
    ? Math.round(((retail - final) / retail) * 100)
    : 0;

  return `
    <li class="product-card">
      ${isDiscounted ? `<span class="discount-badge">${discountPercent}% OFF</span>` : ""}

      <a href="/product_pages/index.html?product=${product.Id}">
        <img src="${product.Image}" alt="Image of ${product.NameWithoutBrand}" />
        <h3 class="card__brand">${product.Brand?.Name || ""}</h3>
        <h2 class="card__name">${product.NameWithoutBrand}</h2>

        <p class="product-card__price">
          $${final.toFixed(2)}
          ${isDiscounted ? `<span class="old-price">$${retail.toFixed(2)}</span>` : ""}
        </p>
      </a>
    </li>
  `;
}


export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
  }

  async init() {
    try {
      const list = await this.dataSource.getData();
      this.renderList(list);
    } catch (err) {
      console.error("Error loading product list:", err);
      if (this.listElement) this.listElement.innerHTML = "<li>Error loading products</li>";
    }
  }

  renderList(list) {
    renderListWithTemplate(productCardTemplate, this.listElement, list, "afterbegin", true);
  }
}
