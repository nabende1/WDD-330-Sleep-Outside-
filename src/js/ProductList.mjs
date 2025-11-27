// src/js/ProductList.mjs
import { renderListWithTemplate } from "./utils.mjs";
import { getDiscountInfo } from "./discountUtils.mjs";
import { renderBreadcrumb } from "./breadcrumbs.mjs";

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category =
      typeof category === "string" ? category.toLowerCase().trim() : category;
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.products = [];
  }

  async init() {
    try {
      // ---------------------------------------
      // Category vs Search
      // ---------------------------------------
      if (this.category.startsWith("search:")) {
        const query = this.category.replace("search:", "").trim();
        this.products = await this.dataSource.searchProducts(query);
      } else {
        this.products = await this.dataSource.getData(this.category);
      }

      if (!Array.isArray(this.products)) this.products = [];

      // If not a search, filter by category (fallback safety)
      if (!this.category.startsWith("search:")) {
        this.products = this.products.filter(
          p => (p.Category || "").toLowerCase() === this.category
        );
      }

      // Breadcrumb
      renderBreadcrumb("category", {
        categoryName: this.category,
        count: this.products.length
      });

      // Render list
      this.renderList(this.products);

      // Sorting
      this.initSortControl();
    } catch (err) {
      console.error("Error loading product list:", err);
      this.listElement.innerHTML = "<p>No products found.</p>";
    }
  }

  // ----------------------------------------------------
  // Sorting
  // ----------------------------------------------------
  initSortControl() {
    const sortSelect = document.getElementById("sortSelect");
    if (!sortSelect) return;

    sortSelect.addEventListener("change", () => {
      const value = sortSelect.value;
      let sorted = [...this.products];

      switch (value) {
        case "name-asc":
          sorted.sort((a, b) => (a.Name || "").localeCompare(b.Name || ""));
          break;

        case "name-desc":
          sorted.sort((a, b) => (b.Name || "").localeCompare(a.Name || ""));
          break;

        case "price-asc":
          sorted.sort(
            (a, b) =>
              Number(a.FinalPrice ?? a.ListPrice ?? 0) -
              Number(b.FinalPrice ?? b.ListPrice ?? 0)
          );
          break;

        case "price-desc":
          sorted.sort(
            (a, b) =>
              Number(b.FinalPrice ?? b.ListPrice ?? 0) -
              Number(a.FinalPrice ?? a.ListPrice ?? 0)
          );
          break;

        default:
          sorted = [...this.products];
      }

      this.renderList(sorted);
    });
  }

  // ----------------------------------------------------
  // Product Card Template (with Quick View)
  // ----------------------------------------------------
  productTemplate(product) {
    const { isDiscounted, finalPrice, suggested, discountPercent } =
      getDiscountInfo(product);

    const img =
      product.Images?.PrimaryMedium || "../images/camping-products.jpg";
    const name = product.Name || "Unnamed product";
    const id = product.Id || "";

    const fp = Number(
      finalPrice ?? product.FinalPrice ?? product.ListPrice ?? 0
    );

    const suggestedPrice = Number(
      suggested ?? product.SuggestedRetailPrice ?? product.ListPrice ?? 0
    );

    return `
      <li class="product-card">
        <a href="/product_pages/index.html?product=${encodeURIComponent(id)}">
          <div class="product-image-wrapper">
            <img 
              src="${img}" 
              alt="${name.replace(/"/g, '\\"')}" 
              class="product-image"
              loading="lazy"
            />

            ${
              isDiscounted
                ? `<span class="discount-badge">-${discountPercent}%</span>`
                : ""
            }
          </div>

          <h3 class="card__name">${name}</h3>

          <div class="product-card__price-wrapper">
            <p class="product-card__price">$${fp.toFixed(2)}</p>

            ${
              isDiscounted
                ? `<p class="product-card__oldprice">$${suggestedPrice.toFixed(
                    2
                  )}</p>`
                : ""
            }
          </div>
        </a>

        <button class="quick-view-btn" data-id="${id}">
          Quick View
        </button>
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
