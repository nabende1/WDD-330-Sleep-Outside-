// src/js/ProductList.mjs
import { renderListWithTemplate } from "./utils.mjs";

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
  }

  async init() {
    const list = await this.dataSource.getData();
    this.renderList(list);
  }

  renderList(list) {
    this.listElement.innerHTML = "";

    list.forEach(product => {
      const isDiscounted = Number(product.FinalPrice) < Number(product.SuggestedRetailPrice);
      const discountPercent = isDiscounted
        ? Math.round(((product.SuggestedRetailPrice - product.FinalPrice) / product.SuggestedRetailPrice) * 100)
        : 0;

      const template = `
        <li class="product-card">
          <a href="product_pages/index.html?product=${product.Id}">
            <img src="${product.Image}" alt="${product.NameWithoutBrand}" />

            ${isDiscounted 
              ? `<span class="discount-badge">-${discountPercent}%</span>`
              : ""}

            <h3 class="card__brand">${product.Brand?.Name || ""}</h3>
            <h2 class="card__name">${product.NameWithoutBrand}</h2>

            <p class="product-card__price">
              $${Number(product.FinalPrice).toFixed(2)}
            </p>

            ${isDiscounted 
              ? `<p class="product-card__oldprice">$${product.SuggestedRetailPrice}</p>` 
              : ""}
          </a>
        </li>
      `;

      this.listElement.insertAdjacentHTML("beforeend", template);
    });
  }
}
