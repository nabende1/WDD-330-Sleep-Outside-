// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

// retrieve data from localstorage
export function getLocalStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {
    return null;
  }
}

// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}


// set a listener for both touchend and click
export function setClick(selector, callback) {
  const el = qs(selector);
  if (!el) return;
  el.addEventListener("touchend", (event) => {
    event.preventDefault();
    callback(event);
  });
  el.addEventListener("click", callback);
}

// get a query parameter value by name, e.g. getParam('product')
export function getParam(name) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(name);
}

/**
 * Render a list using a template function.
 * templateFn: (item) => htmlString
 * parentElement: DOM node where to insert
 * list: array of items
 * position: 'afterbegin'|'beforeend' etc (default: afterbegin)
 * clear: boolean whether to clear the element first (default: false)
 */

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

  const htmlStrings = list.map(templateFn);
  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}

// utils.mjs
export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template; // insert the template
  if (callback) {
    callback(data); // run extra logic if provided
  }
}
export async function loadTemplate(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load template: ${path}`);
  const template = await res.text();
  return template;
}
export async function loadHeaderFooter() {
  try {
    // ALWAYS use root-based absolute paths
    const headerTemplate = await loadTemplate("/public/partials/header.html");
    const footerTemplate = await loadTemplate("/public/partials/footer.html");

    const headerElement = document.querySelector("#main-header");
    const footerElement = document.querySelector("#main-footer");

    renderWithTemplate(headerTemplate, headerElement, null, () => {
      if (window.updateCartCount) window.updateCartCount();
    });

    renderWithTemplate(footerTemplate, footerElement);
  } catch (err) {
    console.error("Error loading header/footer:", err);
  }
}



/**
 * Update the cart count badge (any document that has a .cart-count element will be updated).
 * Sets textContent to total quantity (sum of item.quantity) if present, otherwise number of items.
 */
export function updateCartCount() {
  const raw = getLocalStorage("so-cart") || [];
  const cartItems = Array.isArray(raw) ? raw : [];

  // Use total quantity if quantity fields exist, else number of items
  const totalQty = cartItems.reduce((sum, it) => sum + (it.quantity || 1), 0);

  // update every .cart-count found on the page (header on all pages)
  const elements = document.querySelectorAll(".cart-count");
  elements.forEach((el) => {
    el.textContent = totalQty;
  });
}

