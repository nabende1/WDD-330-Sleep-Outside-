// src/js/ProductList.mjs
import { renderListWithTemplate } from "./utils.mjs";
import { getDiscountInfo } from "./discountUtils.mjs";
import { renderBreadcrumb } from "./breadcrumbs.mjs";


export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.products = [];
  }

  async init() {
    // Load products: category or search
    if (this.category.startsWith("search:")) {
      const query = this.category.replace("search:", "");
      this.products = await this.dataSource.searchProducts(query);
    } else {
      this.products = await this.dataSource.getData(this.category);
    }
    // Show breadcrumb for product list
renderBreadcrumb("category", {
  categoryName: this.category,
  count: this.products.length
});


    // Render initial list
    this.renderList(this.products);

    // Enable sorting
    this.initSortControl();
  }

  // ----------------------------------------------------
  // Sorting Controls
  // ----------------------------------------------------
  initSortControl() {
    const sortSelect = document.getElementById("sortSelect");
    if (!sortSelect) return;

    sortSelect.addEventListener("change", () => {
      const value = sortSelect.value;
      let sorted = [...this.products];

      switch (value) {
        case "name-asc":
          sorted.sort((a, b) => a.Name.localeCompare(b.Name));
          break;

        case "name-desc":
          sorted.sort((a, b) => b.Name.localeCompare(a.Name));
          break;

        case "price-asc":
          sorted.sort(
            (a, b) =>
              Number(a.FinalPrice || a.Price || 0) -
              Number(b.FinalPrice || b.Price || 0)
          );
          break;

        case "price-desc":
          sorted.sort(
            (a, b) =>
              Number(b.FinalPrice || b.Price || 0) -
              Number(a.FinalPrice || a.Price || 0)
          );
          break;

        default:
          sorted = [...this.products];
      }

      this.renderList(sorted);
    });
  }

  // ----------------------------------------------------
  // Product Card Template
  // ----------------------------------------------------
  productTemplate(product) {
    const {
      isDiscounted,
      finalPrice,
      suggested,
      discountPercent
    } = getDiscountInfo(product);

    const img = product.Images?.PrimaryMedium || "../images/camping-products.jpg";

    return `
      <li class="product-card">
        <a href="/product_pages/index.html?product=${product.Id}">
          <div class="product-image-wrapper">
            <img 
              src="${img}" 
              alt="${product.Name}" 
              class="product-image"
              loading="lazy"
            />

            ${isDiscounted ? `<span class="discount-badge">-${discountPercent}%</span>` : ""}
          </div>

          <h3 class="card__name">${product.Name}</h3>

          <div class="product-card__price-wrapper">
            <p class="product-card__price">$${finalPrice.toFixed(2)}</p>

            ${
              isDiscounted
                ? `<p class="product-card__oldprice">$${suggested.toFixed(2)}</p>`
                : ""
            }
          </div>
        </a>
      </li>
    `;
  }

  // ----------------------------------------------------
  // Render List
  // ----------------------------------------------------
  renderList(list) {
    if (!list || list.length === 0) {
      this.listElement.innerHTML = "<p>No products found.</p>";
      return;
    }

    renderListWithTemplate(
      item => this.productTemplate(item),
      this.listElement,
      list,
      "afterbegin",
      true
    );
  }
}
