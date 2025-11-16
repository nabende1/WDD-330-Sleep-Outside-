// ---------------------------------------------
// Query Selectors
// ---------------------------------------------
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

// ---------------------------------------------
// Local Storage
// ---------------------------------------------
export function getLocalStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ---------------------------------------------
// Click Helper (mobile safe)
// ---------------------------------------------
export function setClick(selector, callback) {
  const el = qs(selector);
  if (!el) return;

  el.addEventListener("touchend", (e) => {
    e.preventDefault();
    callback(e);
  });

  el.addEventListener("click", callback);
}

// ---------------------------------------------
// URL Params
// ---------------------------------------------
export function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// ---------------------------------------------
// Templating Helpers
// ---------------------------------------------
export function renderListWithTemplate(
  templateFn,
  parentElement,
  list,
  position = "afterbegin",
  clear = false
) {
  if (!parentElement) return;
  if (!Array.isArray(list)) list = [];

  if (clear) parentElement.innerHTML = "";

  const html = list.map(templateFn).join("");
  parentElement.insertAdjacentHTML(position, html);
}

export function renderWithTemplate(template, parentElement, data, callback) {
  if (!parentElement) return;

  parentElement.innerHTML = template;

  if (callback) callback(data);
}

// ---------------------------------------------
// Template Loader
// ---------------------------------------------
export async function loadTemplate(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load template: ${path}`);
  return await res.text();
}

// ---------------------------------------------
// HEADER + FOOTER LOADER
// Works in:
//   ✓ Vite Dev Server
//   ✓ GitHub Pages
//   ✓ Corrects asset paths
// ---------------------------------------------
export async function loadHeaderFooter() {
  try {
    const headerEl = qs("#main-header");
    const footerEl = qs("#main-footer");

    if (!headerEl || !footerEl) return;

    // Vite auto-resolves public folder as root
    const base = import.meta.env.BASE_URL;

    const headerHTML = await loadTemplate(`${base}partials/header.html`);
    const footerHTML = await loadTemplate(`${base}partials/footer.html`);

    // Render header
    renderWithTemplate(headerHTML, headerEl);

    // Ensure cart count updates AFTER header injection
    setTimeout(() => {
      if (typeof updateCartCount === "function") updateCartCount();
    }, 50);

    // Render footer
    renderWithTemplate(footerHTML, footerEl);

    //---------------------------------------------
    // Attach Search Form Listener
    //---------------------------------------------
    const searchForm = document.querySelector("#product-search-form");

    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = qs("#search-input")?.value.trim();

        if (!query) return;

        // Navigate to product listing page with search
        window.location.href = `${base}product_listing/index.html?search=${encodeURIComponent(query)}`;
      });
    }

  } catch (error) {
    console.error("Error loading header/footer:", error);
  }
}

// ---------------------------------------------
// CART COUNT
// ---------------------------------------------
export function updateCartCount() {
  const cart = Array.isArray(getLocalStorage("so-cart"))
    ? getLocalStorage("so-cart")
    : [];

  const totalQty = cart.reduce((sum, item) => {
    return sum + (item.Qty || 1);
  }, 0);

  document.querySelectorAll(".cart-count").forEach((el) => {
    el.textContent = totalQty;
  });
}
