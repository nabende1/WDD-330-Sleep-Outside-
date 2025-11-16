// src/js/breadcrumbs.mjs

export function renderBreadcrumb(type, data = {}) {
  const container = document.getElementById("breadcrumb");
  if (!container) return;

  // Home page → no breadcrumb
  if (type === "home") {
    container.innerHTML = "";
    return;
  }

  // Product list breadcrumb: Category → (# items)
  if (type === "category") {
    const { categoryName, count } = data;

    container.innerHTML = `
      <span class="crumb">${categoryName}</span>
      <span class="crumb-arrow"> → </span>
      <span class="crumb-count">(${count} items)</span>
    `;
    return;
  }

  // Product details breadcrumb: just category name
  if (type === "product") {
    const { categoryName } = data;

    container.innerHTML = `
      <span class="crumb">${categoryName}</span>
    `;
  }
}
